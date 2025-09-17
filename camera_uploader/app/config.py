import os

# Elasticsearch configuration
ES_HOST = os.getenv("ES_HOST", "localhost")
ES_PORT = os.getenv("ES_PORT", 9200)
ES_INDEX = os.getenv("ES_INDEX", "logger")
ES_URI = f"http://{ES_HOST}:{ES_PORT}"

# FastAPI server configuration
SERVER_URL = os.getenv("SERVER_URL", "ws://localhost:8000/camera/upload-image") 


# Camera configuration
CAMERA_URL = os.getenv("CAMERA_URL", "rtsp://192.168.16.2:8554/all.stream") 
