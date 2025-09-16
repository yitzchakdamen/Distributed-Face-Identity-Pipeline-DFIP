import os

KAFKA_BOOTSTRAP = os.getenv('KAFKA_BROKER', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC',"event")
KAFKA_CONSUMER_GROUP = os.getenv('KAFKA_CONSUMER_GROUP',"event_consumer_group")

MONGO_URI = os.getenv('MONGO_URI',"mongodb://localhost:27017/")
MONGO_DB = os.getenv('MONGO_DB',"face_identity")
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION',"Event")

LOGGER_NAME = os.getenv('LOGGER_NAME',"event_processor_service_logger")