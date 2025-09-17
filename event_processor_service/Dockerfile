FROM python:3.11-slim

WORKDIR /app

COPY event_processor_service/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt


COPY event_processor_service ./event_processor_service

CMD ["python", "-m", "event_processor_service.app.manager"]
