from utils import config
from src.face_detection import FaceExtractor
import logging
from src.kafka_publisher import KafkaPublisher
from src.mongo_dal import MongoImageStorage
from typing import Union

logger = logging.getLogger(config.LOGGER_NAME) #remember to change this to es logger and set up every logger to his class
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S") 


class FaceDetectionApp:
    def __init__(self):
        self.extractor = FaceExtractor()
        self.mongo_writer = MongoImageStorage(
            uri=config.MONGO_URI,
            db_name=config.MONGODB_DB_NAME,
            bucket_name="faces"
        )
        self.kafka_publisher = KafkaPublisher(
            bootstrap=config.KAFKA_BOOTSTRAP,
            topic=config.KAFKA_TOPIC
        )

    def process_image(self, image: Union[str, bytes, bytearray]) -> None: # for short it build util that build the dict messege
        try:
            faces = self.extractor.extract_faces(image)
            logger.info(f"Extracted {len(faces)} face(s) from the image")

            for face in faces:
                payload = {
                    "image": face.image_bytes,
                    "image_id": face.face_id,
                    "event_ts": face.timestamp_utc
                }
                file_id = self.mongo_writer.insert_image(payload)
                logger.info(f"Stored face {face.face_id} in MongoDB with ObjectId {file_id}")

                kafka_payload = {
                    "face_id": face.face_id,
                    "mongo_id": str(file_id),
                    "event_ts": face.timestamp_utc
                }
                self.kafka_publisher.publish(kafka_payload)
                logger.info(f"Published metadata for face {face.face_id} to Kafka")

        except Exception as e:
            logger.error(f"Error processing image: {e}")



if __name__ == "__main__":
    app = FaceDetectionApp()
    test_image_path = "C:/Users/brdwn/Downloads/images.jpeg"  # Update with your test image path
    app.process_image(test_image_path)