from face_embedding.manager import FaceEmbeddingManager
from face_embedding import config

def main():
    manager = FaceEmbeddingManager(
        mongo_uri=config.MONGO_URI,
        db_name=config.DB_NAME,
        consumer_config=config.CONSUMER_CONFIG,
        consumer_topic=config.CONSUMER_TOPIC,
        producer_config=config.PRODUCER_CONFIG,
        producer_topic=config.PRODUCER_TOPIC
    )
    manager.run()


if __name__ == "__main__":
    main()
    
