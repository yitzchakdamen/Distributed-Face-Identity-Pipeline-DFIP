
# Face Embedding Service

This service is part of a distributed data pipeline for face recognition and vector extraction. It consumes image events from Kafka, downloads images from MongoDB, extracts face embeddings using InsightFace, and publishes the resulting vectors back to Kafka.

## Features
- Consumes image events from Kafka
- Downloads images from MongoDB GridFS
- Extracts face embeddings with InsightFace
- Publishes vectors to Kafka
- Logs to Elasticsearch and console

## Folder Structure
```
face_embedding/
├── app/
│   ├── config.py         # Configuration and environment variables
│   ├── logger.py         # Logging utility (console + Elasticsearch)
│   └── dal/
│       └── elastic.py    # Elasticsearch data access layer
├── kafka/
│   ├── consumer.py       # Kafka consumer wrapper
│   └── producer.py       # Kafka producer wrapper
├── embedding.py          # Face embedding extraction logic
├── manager.py            # Pipeline orchestration
├── mongo.py              # MongoDB handler
├── main.py               # Service entry point
├── requirements.txt      # Python dependencies
├── Dockerfile            # Docker build file
└── README.md             # This file
```


## Configuration
All configuration is via environment variables (see `app/config.py`). Main variables:

| Variable              | Default              | Description                       |
|-----------------------|----------------------|-----------------------------------|
| BOOTSTRAP_SERVER      | localhost:9092       | Kafka bootstrap server            |
| KAFKA_TOPIC           | image_uploaded       | Kafka topic to consume            |
| KAFKA_PRODUCE_TOPIC   | new_vector           | Kafka topic to produce            |
| KAFKA_GROUP_ID        | face_embedding       | Kafka consumer group              |
| MONGO_URI             | mongodb://localhost:27017/ | MongoDB URI                 |
| MONGO_DATABASE        | FaceDB               | MongoDB database name             |
| MONGO_COLLECTION      | Photo_storage        | MongoDB collection name           |
| ES_HOST               | localhost            | Elasticsearch host                |
| ES_PORT               | 9200                 | Elasticsearch port                |
| ES_INDEX              | logger               | Elasticsearch index for logs      |


## Main Dependencies
- insightface
- opencv-python-headless
- pymongo
- gridfs
- confluent-kafka
- elasticsearch
- numpy
- pytest

