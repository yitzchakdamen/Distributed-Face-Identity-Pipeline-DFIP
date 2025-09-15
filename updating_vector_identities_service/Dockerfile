FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY storage_service /app/storage_service

COPY config /app/config
COPY utils /app/utils
COPY data /app/data

CMD ["python", "-m", "storage_service.main"]
