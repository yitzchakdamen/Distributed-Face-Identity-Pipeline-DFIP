import os

# logger name for the application
LOGGER_NAME : str = os.getenv("LOGGER_NAME","logger")
# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI","mongodb+srv://arieltanami122_db_user:OHod6QgGER7wp09F@facedb.k2ycus.mongodb.net/?retryWrites=true&w=majority&appName=facedb")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME","face_identity")
COLLECTION_NAME = os.getenv("COLLECTION_NAME","Photo_storage")
# Kafka connection details
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP","localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC","image_uploaded")

# elastic configuration variables
ES_HOST = os.getenv("ES_HOST", "localhost")
ES_PORT = os.getenv("ES_PORT", 9200)
ES_LOG_INDEX = os.getenv("ES_LOG_INDEX", "logger")
ES_URI = f"http://{ES_HOST}:{ES_PORT}"
