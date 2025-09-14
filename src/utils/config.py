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

    FILE_DATA_TOPIC = os.getenv("FILE_DATA_TOPIC" ,"file_path_and_metadata")

