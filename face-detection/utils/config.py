import os

# logger name for the application
LOGGER_NAME : str = os.getenv("LOGGER_NAME","logger")
# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI","localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME","test-db")
# Kafka connection details
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP","localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC","detected-faces")