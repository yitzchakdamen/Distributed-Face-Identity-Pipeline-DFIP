# Event Processor Service

This system is responsible for processing face recognition events from cameras, analyzing risk level based on appearance counts, and sending alerts accordingly.

## Project Structure

```
event_processor_service/
├── Dockerfile
├── requirements.txt
└── app/
    ├── config.py
    ├── event_processor.py
    ├── kafka_consumer.py
    ├── manager.py
    └── mongo_client.py
```

## Main Files
- **event_processor.py**: Processes messages and evaluates risk level.
- **kafka_consumer.py**: Consumes messages from Kafka.
- **manager.py**: Manages the processing workflow.
- **mongo_client.py**: Handles MongoDB database operations.
- **config.py**: System configuration.

## Local Usage
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the service:
   ```bash
   python app/manager.py
   ```

## Docker Usage
1. Build the image:
   ```bash
   docker build -t event-processor-service .
   ```
2. Run the container:
   ```bash
   docker run -d event-processor-service
   ```

## Processing Logic
- The system detects appearances of people in cameras.
- Risk level is determined based on recent and historical appearances.
- First appearance triggers an alert for review.
- Multiple appearances indicate approval.


