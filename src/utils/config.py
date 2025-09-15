import os
from dotenv import load_dotenv

load_dotenv()

class ElasticSearchConfig:
    ELASTIC_PORT = os.getenv("ELASTIC_PORT" ,"9200")
    ELASTIC_HOST = os.getenv("ELASTIC_HOST", "http://localhost:")
    ELASTIC_URL = ELASTIC_HOST + ELASTIC_PORT
    REGULAR_INDEX_NAME = os.getenv("REGULAR_INDEX_NAME" ,"regular_vector_identification")
    OPTIMIZE_INDEX_NAME = os.getenv("OPTIMIZE_INDEX_NAME" ,"optimize_vector_identification")
    REGULAR_MAPPING = {
        "mappings": {
            "properties": {
                "embedding": {
                    "type": "dense_vector",
                    "dims": 512
                },
                "person_id": {
                    "type": "keyword"
                }
            }
        }
    }
    OPTIMIZE_MAPPING = {
  "mappings": {
    "properties": {
      "person_id": {
        "type": "keyword"
      },
      "embedding": {
        "type": "dense_vector",
        "dims": 512,
        "index": True,
        "similarity": "cosine"
      }
    }
  }
}

class KafkaConfig:
    KAFKA_HOST = os.getenv("KAFKA_HOST", "localhost")
    KAFKA_PORT = os.getenv("KAFKA_PORT" ,"9092")

    NEW_VECTOR_TOPIC = os.getenv("NEW_VECTOR_TOPIC" ,"new_vector_topic")
    NEW_VECTOR_PERSON_TOPIC = os.getenv("NEW_VECTOR_PERSON_TOPIC" ,"new_vector_person")

class Errors:
    NO_BROKER_CONNECTION = "No broker connection."
    NO_SEARCH_RESULT = "Not get a result at all."
    NO_IDENTIFIED_PERSON = "No such person was identified in the system."
    NO_ELASTIC_CONNECTION = "The connection with elastic was failed."
    SEARCH_GOT_WRONG = "The search query is wrong. Maybe the vector is not match."
    @staticmethod
    def NO_ADDED_VECTOR(_vector):
        return f"The vector \n{_vector} \ndid not added."
class LoggingConfig:
    LOGGER_NAME = "Podcast_logger"
    INDEX_LOGS_NAME = "index_logs_name"
