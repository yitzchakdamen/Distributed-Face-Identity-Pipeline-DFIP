import logging
from face_embedding.embedding import FaceEmbedding
from face_embedding.mongo import MongoDBHandler
from face_embedding.kafka.consumer import KafkaConsumer
from face_embedding.kafka.producer import KafkaProducer



logger = logging.getLogger(__name__)

class FaceEmbeddingManager:
    def __init__(self, mongo_uri: str, db_name: str, consumer_config: dict, consumer_topic: str, producer_config: dict, producer_topic: str):
        """Initialize MongoDB handler, Face Embedding model, and Kafka consumer."""
        self.mongo_handler = MongoDBHandler(mongo_uri, db_name)
        self.face_embedding = FaceEmbedding()
        topics = [consumer_topic]
        self.consumer = KafkaConsumer(consumer_config, topics)
        self.producer = KafkaProducer(producer_config)
        self.producer_topic = producer_topic
        logger.info("FaceEmbeddingManager initialized.")


    def build_new_vector(self, image_id: str, camera_id: str, time: str) -> dict:
        """"Build a new vector from the image stored in MongoDB."""
        image_bytes = self.mongo_handler.download_file(image_id)
        embedding = self.face_embedding.extract_embedding(image_bytes)
        return {
                "message": "New vector",
                "image_id": image_id,
                "vector": embedding.tolist(),
                "camera_id": camera_id,
                "time" : time
                }

    def process_messages(self, data: dict):
        """Process messages from Kafka to extract face embeddings."""
        try:
            file_id = data.get('mongo_id')
            camera_id = data.get('camera_id', 'unknown')
            time = data.get('time', 'unknown')
            if not file_id:
                logger.warning("No file_id found in message.")
                return
            
            new_vector = self.build_new_vector(file_id, camera_id, time)
            self.producer.produce(topic=self.producer_topic, message=new_vector)
            self.producer.flush()

            logger.info(f"Processed embedding for file_id {file_id}")

        except Exception as e:
            logger.error(f"Error processing message: {e}")

    def run(self):
        """Run the manager to continuously process incoming Kafka messages."""
        logger.info("Starting FaceEmbeddingManager...")
        try:
            self.consumer.consume(self.process_messages)
        except Exception as e:
            logger.error(f"Error in consumer loop: {e}")
            