# import os
#

# זה מכיל סיסמה רגישה, כדאי לשים ב-env
#
# KAFKA_BOOTSTRAP = os.getenv('KAFKA_BROKER', 'localhost:9092')
# KAFKA_TOPIC = os.getenv('KAFKA_TOPIC',"event")
# KAFKA_CONSUMER_GROUP = os.getenv('KAFKA_CONSUMER_GROUP',"event_consumer_group")
#
# MONGO_URI = os.getenv('MONGO_URI',"mongodb://localhost:27017/")
# MONGO_DB = os.getenv('MONGO_DB',"face_identity")
# MONGO_COLLECTION = os.getenv('MONGO_COLLECTION',"Event")
#
# MONGO_URI = os.getenv("MONGO_URI","localhost:27017")
# MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME","face_identity")
# COLLECTION_NAME = os.getenv("COLLECTION_NAME","photo_storage")
# Kafka connection details
# KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP","localhost:9092")
# KAFKA_TOPIC = os.getenv("KAFKA_TOPIC","detected-faces")
#
#
#
# """
# Configuration module for the face_embedding service.
#
# This module loads environment variables and defines constants for Kafka, MongoDB, and Elasticsearch integration.
# All configuration values can be overridden by environment variables.
# """
#
# import os
#
# # Kafka configuration
# BOOTSTRAP_SERVER = os.getenv("BOOTSTRAP_SERVER", "localhost:9092")
# KAFKA_CONSUME_TOPIC = os.getenv("KAFKA_CONSUME_TOPIC", "image_uploaded")
# KAFKA_PRODUCE_TOPIC = os.getenv("KAFKA_PRODUCE_TOPIC", "new_vector")
# KAFKA_KEY = os.getenv("KAFKA_KEY", "image_uploaded")
# KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "face_embedding")
#
# # Elasticsearch configuration
# ES_HOST = os.getenv("ES_HOST", "localhost")
# ES_PORT = os.getenv("ES_PORT", 9200)
# ES_INDEX = os.getenv("ES_INDEX", "logger")
# ES_URI = f"http://{ES_HOST}:{ES_PORT}"
#
# # MongoDB configuration
# MONGO_PROTOCOL = os.getenv("MONGO_PROTOCOL", "mongodb")
# MONGO_USER = os.getenv("MONGO_USER", "localhost")
# MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", 27017)
# MONGO_DATABASE = os.getenv("MONGO_DATABASE", "face_identity")
# MONGO_CLUSTER_ADDRESS = os.getenv("MONGO_CLUSTER_ADDRESS", "localhost:27017")
# MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "Photo_storage")
# MONGO_URI = f"{MONGO_PROTOCOL}://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_CLUSTER_ADDRESS}"
#
# # Kafka producer and consumer configs
# KAFKA_PRODUCER_CONFIG = {
#     'bootstrap.servers': BOOTSTRAP_SERVER
# }
#
# KAFKA_CONSUMER_CONFIG = {
#     'bootstrap.servers': BOOTSTRAP_SERVER,
#     'group.id': KAFKA_GROUP_ID,
#     'auto.offset.reset': 'earliest',
#     'enable.auto.commit': True
# }
#
# import os
# import logging
# import json
#
#
# logger = logging.getLogger(__name__)
#
# # ___ General Configuration ___
# LOGGER_NAME = os.getenv("LOGGER_NAME", "podcast_content_monitoring_system")
#
# # ___KAFKA Configuration ___
# BOOTSTRAP_SERVERS = os.getenv("BOOTSTRAP_SERVERS", "localhost:9092")
# KAFKA_TOPIC_FILE_METADATA = os.getenv("KAFKA_TOPIC_FILE_METADATA", "file-metadata")
# KAFKA_TOPIC_INCOME_PROCESSING = os.getenv("KAFKA_TOPIC_INCOME_PROCESSING", "icome-processing")
# KAFKA_TOPIC_TRANSCRIPTTION = os.getenv("KAFKA_TOPIC_TRANSCRIPTTION", "file-transcribe")
# KAFKA_GROUP_ID_FILE_METADATA = os.getenv("KAFKA_GROUP_ID_FILE_METADATA", "information_consumption_processing")
# KAFKA_GROUP_ID_INCOME_PROCESSING = os.getenv("KAFKA_GROUP_ID_INCOME_PROCESSING", "icome-processing")
# KAFKA_GROUP_ID_TRANSCRIPTTION = os.getenv("KAFKA_GROUP_ID_TRANSCRIPTTION", "file-transcribe")
#
# # ___ ELASTICSEARCH Configuration ___
# ELASTICSEARCH_HOST = os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
# ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS = os.getenv("ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS", "image_embeddings")
# ELASTICSEARCH_INDEX_PERSONS = os.getenv("ELASTICSEARCH_INDEX_PERSONS", "persons")
# ELASTICSEARCH_INDEX_LOG = os.getenv("ELASTICSEARCH_INDEX_LOG", "logging")
#
# ELASTICSEARCH_MAPPING_PATH = os.getenv("ELASTICSEARCH_MAPPING_IMAGE_EMBEDDINGS", r"config\elasticsearch_mapping.json")
# with open(ELASTICSEARCH_MAPPING_PATH) as f: ELASTICSEARCH_MAPPING_IMAGE_EMBEDDINGS = json.load(f)
#
#
# logger.info(f"""
#             Configuration Loaded ___ :
#             LOGGER_NAME: {LOGGER_NAME}
#             BOOTSTRAP_SERVERS: {BOOTSTRAP_SERVERS}
#             KAFKA_TOPIC_FILE_METADATA: {KAFKA_TOPIC_FILE_METADATA}
#             KAFKA_GROUP_ID_FILE_METADATA: {KAFKA_GROUP_ID_FILE_METADATA}
#             KAFKA_TOPIC_INCOME_PROCESSING: {KAFKA_TOPIC_INCOME_PROCESSING}
#             KAFKA_GROUP_ID_INCOME_PROCESSING: {KAFKA_GROUP_ID_INCOME_PROCESSING}
#             KAFKA_TOPIC_TRANSCRIPTTION: {KAFKA_TOPIC_TRANSCRIPTTION}
#             KAFKA_GROUP_ID_TRANSCRIPTTION: {KAFKA_GROUP_ID_TRANSCRIPTTION}
#             ELASTICSEARCH_HOST: {ELASTICSEARCH_HOST}
#             ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS: {ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS}
#             ELASTICSEARCH_INDEX_PERSONS: {ELASTICSEARCH_INDEX_PERSONS}
#             ELASTICSEARCH_INDEX_LOG: {ELASTICSEARCH_INDEX_LOG}
#             ELASTICSEARCH_MAPPING_PATH: {ELASTICSEARCH_MAPPING_PATH}
#             """)
