# TableTalk: AI-Powered Data Visualization and Database Chatbot

## Overview

TableTalk is a comprehensive AI-powered chatbot interface that combines natural language processing with powerful data visualization capabilities and database integration. The frontend is built using React and Next.js, offering users an intuitive platform for interacting with AI, analyzing data, and generating insightful visualizations. The backend is built with Python, leveraging state-of-the-art language models and database technologies to create a versatile and intelligent conversational interface.

## Features

- **AI-Driven Conversations**: Utilizes advanced language models for natural and context-aware interactions.
- **Dynamic Data Visualization**: Generates and displays various chart types based on conversation context and data analysis.
- **File Upload Integration**: Allows users to upload and analyze data files directly within the chat interface.
- **Conversation Memory**: Maintains context across user interactions for more coherent and relevant responses.
- **Responsive Design**: Adapts to various screen sizes with a collapsible sidebar for enhanced user experience.
- **Dark Mode UI**: Offers a toggleable dark theme for improved readability and aesthetics.
- **Markdown and Code Support**: Renders rich text responses with Markdown formatting and syntax-highlighted code snippets.
- **SQL Database Integration**: Directly queries and analyzes SQL databases to provide data-driven responses.
- **Data Visualization Suggestions**: Offers appropriate chart type recommendations based on conversation context.
- **Dynamic Database Loading**: Flexibly works with various data sources and adapts to changing data structures.
- **SQL Query Transparency**: Provides users with the exact SQL queries used to extract data for the chatbot's responses, promoting transparency and trust.

## Tech Stack

### Frontend
React, Next.js, Tailwind CSS, Chart.js, react-chartjs-2, Framer Motion, React Markdown, React Syntax Highlighter, React Dropzone, UUID

### Backend
Python, FastAPI, SQLite, SQLAlchemy, LangChain, OpenAI GPT models

## Setup and Installation

### Frontend

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tabletalk
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add necessary variables (e.g., API keys).

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-database-chatbot.git
   cd ai-database-chatbot
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows, use venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   python main.py --api_key YOUR_OPENAI_API_KEY --model_name MODEL_NAME
   ```
   Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key and `MODEL_NAME` with the desired model (default is "gpt-4o-mini").

## Usage

- Interact with the chatbot through the web interface:
  - Engage in AI-powered conversations via the chat input
  - Upload data files using the drag-and-drop functionality
  - View and interact with AI-generated data visualizations
  - Toggle between light and dark themes
  - Access additional information and settings through the collapsible sidebar
  - Click on the SQL query button to view the exact SQL queries used to extract data for the chatbot's responses
- Interact with the chatbot through the provided API endpoints:
  - Upload and query databases
  - Engage in AI-powered conversations
  - Request data visualization suggestions

## Project Structure

- `components/modern-chatbot-ui.tsx`: Main component orchestrating the chat interface and visualizations
- `components/message-content.tsx`: Handles rendering of individual chat messages
- `components/visualization-popup.tsx`: Manages the creation and display of data visualizations
- `main.py`: FastAPI application and main entry point
- `functs.py`: Core functionality including memory management and database operations

## Docker Support

Both the frontend and backend projects include Docker support for easy deployment.

### Frontend

```bash
# Build the Docker image
docker build -t tabletalk .

# Run the Docker container
docker run -p 3000:3000 tabletalk
```

### Backend

```bash
# Build the Docker image
docker build -t ai-database-chatbot .

# Run the Docker container
docker run -e OPENAI_API_KEY=your_api_key -e MODEL_NAME=gpt-4o-mini -p 8000:8000 ai-database-chatbot
```

Make sure to replace `your_api_key` with your actual OpenAI API key. You can also change the `MODEL_NAME` environment variable to use a desired model.

## Contributing

Contributions to improve TableTalk or extend its capabilities are welcome. Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

[MIT License](LICENSE)

## Developer Information

Developed by Sarthak Vajpayee, AI Engineer
- Email: sarthak.vajpayee05@gmail.com
- LinkedIn: [Sarthak Vajpayee](https://www.linkedin.com/in/sarthak-vajpayee)
- GitHub: [sarthakv7](https://github.com/sarthakv7)
- Portfolio: [Sarthak's Portfolio](https://sarthakv7.github.io/my-portfilio/)

## Acknowledgments

- OpenAI for providing advanced language models
- The creators and maintainers of the open-source libraries and frameworks used in this project.