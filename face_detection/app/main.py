from face_detection.utils import config
from face_detection.utils.factory import create_mongo_payload, create_kafka_payload
from face_detection.src.face_detection import FaceExtractor
from face_detection.utils.logger import Logger
from face_detection.src.kafka_publisher import KafkaPublisher
from face_detection.src.mongo_dal import MongoImageStorage
from typing import Union

logger = Logger.get_logger(__name__)


class FaceDetectionApp:
    def __init__(self):
        self.extractor = FaceExtractor()
        self.mongo_writer = MongoImageStorage(
            uri=config.MONGO_URI,
            db_name=config.MONGODB_DB_NAME,
            bucket_name=config.COLLECTION_NAME
        )
        self.kafka_publisher = KafkaPublisher(
            bootstrap=config.KAFKA_BOOTSTRAP,
            topic=config.KAFKA_TOPIC
        )

    def process_image(self, image: Union[str, bytes, bytearray]) -> None:
        """Process image and extract faces with clean factory-based payloads"""
        try:
            faces = self.extractor.extract_faces(image)
            logger.info(f"Extracted {len(faces)} face(s) from the image")

            for face in faces:
                mongo_payload = create_mongo_payload(face)
                file_id = self.mongo_writer.insert_image(mongo_payload)
                logger.info(f"Stored face {face.face_id} in MongoDB with ObjectId {file_id}")

                kafka_payload = create_kafka_payload(face, file_id)
                self.kafka_publisher.publish(kafka_payload)
                logger.info(f"Published metadata for face {face.face_id} to Kafka")

        except Exception as e:
            logger.error(f"Error processing image: {e}")



if __name__ == "__main__":
    app = FaceDetectionApp()
    test_image_path = r"C:\Users\isaac\source\repos\Distributed-Face-Identity-Pipeline-DFIP\data\download.jpg"
    app.process_image(test_image_path)