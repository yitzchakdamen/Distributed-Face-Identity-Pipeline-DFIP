from face_embedding.app.embedding import FaceEmbedding
from face_embedding.app.dal.mongo import MongoDBHandler
from face_embedding.kafka.consumer import KafkaConsumer
from face_embedding.kafka.producer import KafkaProducer
from face_embedding.app.logger import Logger





class FaceEmbeddingManager:
    """
    Orchestrates the face embedding pipeline: consumes messages, extracts embeddings, and produces results.

    Attributes:
        mongo_handler (MongoDBHandler): Handler for MongoDB operations.
        face_embedding (FaceEmbedding): Face embedding extractor.
        consumer (KafkaConsumer): Kafka consumer for input messages.
        producer (KafkaProducer): Kafka producer for output messages.
        producer_topic (str): Kafka topic for output.
    """

    def __init__(self, mongo_uri: str, db_name: str, consumer_config: dict, consumer_topic: str, producer_config: dict, producer_topic: str):
        """
        Initialize MongoDB handler, Face Embedding model, and Kafka consumer/producer.

        Args:
            mongo_uri (str): MongoDB connection URI.
            db_name (str): Name of the MongoDB database.
            consumer_config (dict): Kafka consumer configuration.
            consumer_topic (str): Kafka topic to consume from.
            producer_config (dict): Kafka producer configuration.
            producer_topic (str): Kafka topic to produce to.
        """
        self.logger = Logger.get_logger(__name__)
        self.mongo_handler = MongoDBHandler(mongo_uri, db_name)
        self.face_embedding = FaceEmbedding()
        topics = [consumer_topic]
        self.consumer = KafkaConsumer(consumer_config, topics)
        self.producer = KafkaProducer(producer_config)
        self.producer_topic = producer_topic
        self.logger.info("FaceEmbeddingManager initialized.")

    def build_new_vector(self, image_id: str, camera_id: str, time: str) -> dict:
        """
        Build a new vector from the image stored in MongoDB.

        Args:
            image_id (str): The MongoDB file ID.
            camera_id (str): The camera identifier.
            time (str): The timestamp of the image.

        Returns:
            dict: A dictionary containing the new vector and metadata.
        """
        image_bytes = self.mongo_handler.download_file(image_id)
        embedding = self.face_embedding.extract_embedding(image_bytes)
        return {
            "message": "New vector",
            "image_id": image_id,
            "vector": embedding.tolist(),
            "camera_id": camera_id,
            "time": time
        }

    def process_messages(self, data: dict):
        """
        Process messages from Kafka to extract face embeddings and produce results.

        Args:
            data (dict): The message data from Kafka, expected to contain 'mongo_id', 'camera_id', and 'time'.
        """
        try:
            file_id = data.get('mongo_id')
            camera_id = data.get('camera_id', 'unknown')
            time = data.get('time', 'unknown')
            if not file_id:
                self.logger.warning("No file_id found in message.")
                return

            new_vector = self.build_new_vector(file_id, camera_id, time)
            self.producer.produce(topic=self.producer_topic, message=new_vector)
            self.producer.flush()

            self.logger.info(f"Processed embedding for file_id {file_id}")

        except Exception as e:
            self.logger.error(f"Error processing message: {e}")

    def run(self):
        """
        Run the manager to continuously process incoming Kafka messages.
        """
        self.logger.info("Starting FaceEmbeddingManager...")
        try:
            self.consumer.consume(self.process_messages)
        except Exception as e:
            self.logger.error(f"Error in consumer loop: {e}")
            