import pandas as pd
from pyprojroot import here
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
from langchain.memory import ConversationBufferMemory
import os
import json
from langchain.prompts import ChatPromptTemplate
import shutil


def analyze_text_for_visualization(llm, input_text: str):
    prompt = ChatPromptTemplate.from_template(
        """Analyze the following text and determine if it contains data suitable for visualization. 
        If suitable, extract the data and suggest an appropriate chart type from: 
        "Bar Chart", "Line Chart", "Pie Chart", "Scatter Plot", "Histogram". 
        Generate only the JSON object in this structure, do not return any other text explaining what was done and how it was done:
        {{
          "chartType": "suggested chart type",
          "labels": ["label1", "label2", ...],
          "data": [value1, value2, ...],
          "title": "suggested title for the chart"
        }}

        If the text is not suitable for visualization, return null.

        Text to analyze: {input_text}

        JSON Output:"""
    )

    response = llm(prompt.format_messages(input_text=input_text))
    
    try:
        return eval(response.content.strip('```json').strip('```').replace('\n', ''))
    except:
        return None


def clear_data_folder():
    data_dir = './data'
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    
    os.makedirs(data_dir)

def save_memory(session_id, human_input, ai_output):
    memory_path = f"./data/{session_id}_memory.json"
    if os.path.exists(memory_path):
        with open(memory_path, "r") as f:
            messages = json.load(f)
    else:
        messages = []
    
    messages.append({"type": "human", "data": {"content": human_input}})
    messages.append({"type": "ai", "data": {"content": ai_output}})
    
    with open(memory_path, "w") as f:
        json.dump(messages, f)


def load_memory(session_id):
    memory_path = f"./data/{session_id}_memory.json"
    if os.path.exists(memory_path):
        with open(memory_path, "r") as f:
            messages = json.load(f)
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        for message in messages:
            if message["type"] == "human":
                memory.chat_memory.add_user_message(message["data"]["content"])
            else:
                memory.chat_memory.add_ai_message(message["data"]["content"])
        return memory
    else:
        # Create an empty memory file
        empty_memory = []
        os.makedirs(os.path.dirname(memory_path), exist_ok=True)
        with open(memory_path, "w") as f:
            json.dump(empty_memory, f)
        return ConversationBufferMemory(memory_key="chat_history", return_messages=True)


def load_existing_db(db_path):
    return SQLDatabase.from_uri(f"sqlite:///{db_path}")

def load_data_to_sqlite(file_path, db_path):
    _, file_extension = os.path.splitext(file_path)
    
    # Create the SQLite database path
    db_uri = f"sqlite:///{db_path}"
    engine = create_engine(db_uri)
    
    if file_extension == '.db':
        # If it's already a SQLite database, just return the SQLDatabase instance
        print(f"Using existing SQLite database: {file_path}")
        return SQLDatabase.from_uri(db_uri)
    
    elif file_extension in ['.csv', '.xlsx', '.xls']:
        # Load data from CSV or Excel
        if file_extension == '.csv':
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        
        # Get the table name from the file name
        table_name = os.path.basename(file_path).split('.')[0]
        
        # Write the dataframe to SQLite
        df.to_sql(table_name, engine, index=False, if_exists='replace')
        
        print(f"Created new table '{table_name}' in SQLite database at {db_path}")
        
        # Return the SQLDatabase instance
        return SQLDatabase.from_uri(db_uri)
    
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")
    

    