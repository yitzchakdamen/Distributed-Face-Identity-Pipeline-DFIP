FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY event_processor_service/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
# Copy entire package to ensure module imports work
COPY event_processor_service ./event_processor_service

# Run the service
CMD ["python", "-m", "event_processor_service.app.manager"]
