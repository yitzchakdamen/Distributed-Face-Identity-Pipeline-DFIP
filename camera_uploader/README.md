# Camera Uploader Service

This service is part of a distributed data pipeline. It captures images from a webcam and streams them in real-time to a FastAPI WebSocket server as binary data. The service logs events and errors to both console and Elasticsearch.

## Features
- Captures frames from the system webcam using OpenCV
- Sends frames as binary over a WebSocket connection
- Logs all activity to Elasticsearch and console
- Configurable WebSocket URL and log settings

## Folder Structure
camera_uploader/
├── app/
│ ├── config.py # Configuration variables (WebSocket, Elasticsearch)
│ ├── logger.py # Logging utility (console + Elasticsearch)
│ ├── photo_uploader.py # Webcam capture and WebSocket sender logic
│ └── main.py # Service entry point
├── requirements.txt # Python dependencies
└── README.md # This file



## Configuration
All configuration is handled in `app/config.py`. Main configuration variables:

| Variable       | Default                       | Description                                  |
|----------------|-------------------------------|----------------------------------------------|
| ES_HOST        | localhost                     | Elasticsearch host                           |
| ES_PORT        | 9200                          | Elasticsearch port                           |
| ES_INDEX       | logger                        | Elasticsearch index for logs                 |
| ES_URI         | "http://localhost:9200"       | Elasticsearch URI                            |
| SERVER_URL     |"ws://localhost:8000/camera/upload-image"| WebSocket endpoint (FastAPI server)|

To change the target server or logging backend, update `config.py` accordingly.

## Main Dependencies
- opencv-python
- websocket-client
- elasticsearch

