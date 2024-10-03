# Use an official Python runtime as the base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files into the container
COPY . .

# Expose the port that FastAPI will run on
EXPOSE 8000

# Use environment variables for API key and model name, default values can be overwritten at runtime
ENV OPENAI_API_KEY=""
ENV MODEL_NAME="gpt-4o-mini"

# Command to run the FastAPI application with the OpenAI API key passed as an argument
ENTRYPOINT ["python", "main.py"]

# Default CMD will run without args but can be overwritten by passing args during runtime
CMD ["--api_key", "$OPENAI_API_KEY"]
