from face_embedding.manager import FaceEmbeddingManager
from face_embedding import config


def main():
    """
    Entry point for the face embedding pipeline service.
    Initializes the FaceEmbeddingManager with configuration and starts the processing loop.
    """
    manager = FaceEmbeddingManager(
        mongo_uri=config.MONGO_URI,
        db_name=config.MONGO_DATABASE,
        consumer_config=config.KAFKA_CONSUMER_CONFIG,
        consumer_topic=config.KAFKA_CONSUME_TOPIC,
        producer_config=config.KAFKA_PRODUCER_CONFIG,
        producer_topic=config.KAFKA_PRODUCE_TOPIC
    )
    manager.run()


if __name__ == "__main__":
    main()

