
"""
Configuration module for the face_embedding service.

This module loads environment variables and defines constants for Kafka, MongoDB, and Elasticsearch integration.
All configuration values can be overridden by environment variables.
"""

import os

# Kafka configuration
BOOTSTRAP_SERVER = os.getenv("BOOTSTRAP_SERVER", "localhost:9092")
KAFKA_CONSUME_TOPIC = os.getenv("KAFKA_CONSUME_TOPIC", "image_uploaded")
KAFKA_PRODUCE_TOPIC = os.getenv("KAFKA_PRODUCE_TOPIC", "new_vector")
KAFKA_KEY = os.getenv("KAFKA_KEY", "image_uploaded")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "face_embedding")

# Elasticsearch configuration
ES_HOST = os.getenv("ES_HOST", "localhost")
ES_PORT = os.getenv("ES_PORT", 9200)
ES_INDEX = os.getenv("ES_INDEX", "logger")
ES_URI = f"http://{ES_HOST}:{ES_PORT}"

# MongoDB configuration
MONGO_PROTOCOL = os.getenv("MONGO_PROTOCOL", "mongodb")
MONGO_USER = os.getenv("MONGO_USER", "localhost")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", 27017)
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "face_identity")
MONGO_CLUSTER_ADDRESS = os.getenv("MONGO_CLUSTER_ADDRESS", "localhost:27017")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "Photo_storage")
MONGO_URI = f"{MONGO_PROTOCOL}://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_CLUSTER_ADDRESS}"
MONGO_URI = "mongodb+srv://arieltanami122_db_user:OHod6QgGER7wp09F@facedb.k2ycus.mongodb.net/?retryWrites=true&w=majority&appName=facedb"

# Kafka producer and consumer configs
KAFKA_PRODUCER_CONFIG = {
    'bootstrap.servers': BOOTSTRAP_SERVER
}

KAFKA_CONSUMER_CONFIG = {
    'bootstrap.servers': BOOTSTRAP_SERVER,
    'group.id': KAFKA_GROUP_ID,
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': True
}



