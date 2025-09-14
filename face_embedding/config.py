import os


BOOTSTRAP_SERVER = os.getenv("BOOTSTRAP_SERVER", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "image_uploaded")
KAFKA_KEY = os.getenv("KAFKA_KEY", "image_uploaded")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "face_embedding")

ES_HOST = os.getenv("ES_HOST", "localhost")
ES_PORT = os.getenv("ES_PORT", 9200)
ES_INDEX = os.getenv("ES_INDEX", "logger")
ES_URI = f"http://{ES_HOST}:{ES_PORT}"


MONGO_PROTOCOL = os.getenv("MONGO_PROTOCOL", "mongodb")
MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_PORT = os.getenv("MONGO_PORT", 27017)
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "FaceDB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "Photo_storage")
MONGO_URI = f"{MONGO_PROTOCOL}://{MONGO_HOST}:{MONGO_PORT}/"

KAFKA_PRODUCER_CONFIG = {
    'bootstrap.servers': BOOTSTRAP_SERVER
}

KAFKA_CONSUMER_CONFIG = {
    'bootstrap.servers': BOOTSTRAP_SERVER,
    'group.id': KAFKA_GROUP_ID,
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': True
}



