import os
import shutil
import warnings
import requests
from langchain.chat_models import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI  # Add this import
from langchain_community.agent_toolkits import create_sql_agent
from functs import load_data_to_sqlite, load_existing_db, save_memory, load_memory, clear_data_folder, analyze_text_for_visualization, fetch_gemini_api_key
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain.memory import ConversationBufferMemory
from uuid import uuid4
import argparse  # Add this import

warnings.filterwarnings("ignore")

# Remove this line as we're not using .env file for API key anymore
# print("Environment variables are loaded:", load_dotenv())

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_api_key = fetch_gemini_api_key()

# Update the function to include model_name and handle both ChatGPT and Gemini Pro
def create_llm_instances(api_key, model_name):
    if model_name.startswith("gpt-"):
        return ChatOpenAI(
            model=model_name,
            temperature=0,
            openai_api_key=api_key,
        ), ChatOpenAI(
            model=model_name,
            temperature=0.7,
            openai_api_key=api_key,
        )
    elif model_name == "gemini-pro":
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0,
            google_api_key=gemini_api_key,
        ), ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.7,
            google_api_key=gemini_api_key,
        )
    else:
        raise ValueError(f"Unsupported model: {model_name}")

@app.post("/upload_and_query")
async def upload_and_query(
    file: UploadFile = File(...),
    query: str = Form(...),
    session_id: str = Form(None)
):
    if not session_id:
        session_id = str(uuid4())
    
    print("file:", file.filename)
    print("query:", query)
    print("session_id:", session_id)
    
    file_path = f"./data/{file.filename}"
    db_path = "./data/test_sqldb.db"
    
    try:
        if os.path.exists(file_path):
            print(f"File {file.filename} already exists. Using existing database.")
            db = load_existing_db(db_path)
        else:
            print(f"New file {file.filename} received. Clearing data folder and processing new file.")
            clear_data_folder()
            
            with open(file_path, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
            
            db = load_data_to_sqlite(file_path, db_path)
        
        # Load memory for this session
        memory = load_memory(session_id)

        # Create the SQL agent with loaded memory
        agent_executor = create_sql_agent(
            llm,
            db=db,
            agent_type="openai-tools",
            memory=memory,
            verbose=False
        )
        # Run the agent with the provided query
        response = agent_executor.invoke({"input": query})
        
        # Extract the output as a string
        output = response['output']

        print("Starting visualization analysis for output")
        
        visualize_data = analyze_text_for_visualization(llm_visualize, output)
        
        # Save updated memory
        save_memory(session_id, query, output)
        
        return JSONResponse(content={"response": output, "session_id": session_id, "visualize_data": visualize_data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Run the FastAPI server with API key and model name")
    parser.add_argument("--api_key", help="API key (required for OpenAI models)")
    parser.add_argument("--model_name", default="gpt-4-mini", help="Model name (e.g., gpt-4-mini, gemini-pro)")
    args = parser.parse_args()
    
    # Create LLM instances with the provided API key and model name
    llm, llm_visualize = create_llm_instances(args.api_key, args.model_name)
    
    uvicorn.run(app, host="127.0.0.1", port=8000)