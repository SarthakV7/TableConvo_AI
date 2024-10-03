import os
import shutil
from dotenv import load_dotenv
import warnings
from langchain.chat_models import ChatOpenAI
from langchain_community.agent_toolkits import create_sql_agent
from functs import load_data_to_sqlite, load_existing_db, save_memory, load_memory, clear_data_folder, analyze_text_for_visualization
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uuid import uuid4
import argparse  # Add this import
from langchain_core.callbacks.base import BaseCallbackHandler
from typing import Dict, List, Any

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

# Move the ChatOpenAI instances creation inside a function
def create_llm_instances(api_key):
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        openai_api_key=api_key,
    ), ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
        openai_api_key=api_key,
    )

class SQLCallbackHandler(BaseCallbackHandler):
    def __init__(self):
        self.sql_queries = []

    def on_agent_action(self, action, **kwargs):
        if action.tool in ["sql_db_query_checker","sql_db_query"]:
            self.sql_queries.append(action.tool_input)

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

        sql_callback = SQLCallbackHandler()

        # Create the SQL agent with loaded memory
        agent_executor = create_sql_agent(
            llm,
            db=db,
            agent_type="openai-tools",
            memory=memory,
            verbose=False,  # Set to True to see detailed output
        )
        # Run the agent with the provided query
        response = agent_executor.invoke({"input": query}, {"callbacks": [sql_callback]})
        
        if sql_callback.sql_queries:
            sql_query = sql_callback.sql_queries[-1]['query']
        else:
            sql_query = None

        # Extract the output as a string
        output = response['output']

        print("Starting visualization analysis for output")
        
        visualize_data = analyze_text_for_visualization(llm_visualize, output)
        
        # Save updated memory
        save_memory(session_id, query, output)
        
        return JSONResponse(content={"response": output, "session_id": session_id, "visualize_data": visualize_data, "sql_query": sql_query})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Run the FastAPI server with OpenAI API key")
    parser.add_argument("--api_key", required=True, help="OpenAI API key")
    args = parser.parse_args()
    # Create LLM instances with the provided API key
    llm, llm_visualize = create_llm_instances(args.api_key)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)