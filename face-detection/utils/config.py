import os

# logger name for the application
LOGGER_NAME : str = os.getenv("LOGGER_NAME","logger")
# MongoDB connection details
MONGO_URI = os.getenv("MONGO_URI","mongodb+srv://arieltanami122_db_user:OHod6QgGER7wp09F@facedb.k2ycus.mongodb.net/?retryWrites=true&w=majority&appName=facedb")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME","face-identity")
BUCKET_NAME = os.getenv("BUCKET_NAME","images")
# Kafka connection details
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP","localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC","detected-faces")
