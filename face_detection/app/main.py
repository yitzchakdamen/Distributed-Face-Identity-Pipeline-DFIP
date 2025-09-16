import cv2
# from Vector_Search.src.training import r
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


import os
import time

def main():
    # יצירת תיקייה לשמירת התמונות אם היא לא קיימת
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "extracted_faces")
    os.makedirs(output_dir, exist_ok=True)
    
    # יצירת FaceExtractor ישירות (לא דרך האפליקציה) כדי לעקוף את הכתיבה ל-MongoDB ו-Kafka
    extractor = FaceExtractor()
    
    # פתיחת המצלמה
    cap = cv2.VideoCapture(0)
    if not cap.isOpened(): 
        raise RuntimeError("Could not open video device.")

    total_faces = 0
    image_count = 0

    try:
        logger.info(f"התחלת הניסוי: צילום 20 תמונות וחילוץ פנים")
        
        while image_count < 30:
            # קריאת פריים מהמצלמה
            ret, frame = cap.read()
            if not ret:
                logger.error("Error: Could not read frame.")
                break
                
            # הצגת התמונה למשתמש
            cv2.imshow("Camera Feed", frame)
            
            # המתנה לחצי שנייה בין תמונות
            if cv2.waitKey(500) & 0xFF == ord('q'):
                break
                
            # חילוץ פנים מהתמונה
            faces = extractor.extract_faces(frame)
            
            # אם זוהו פנים, שמירתן לתיקייה
            if faces:
                image_count += 1
                logger.info(f"תמונה {image_count}/20: זוהו {len(faces)} פנים")
                
                # שמירת כל אחת מהפנים שזוהו
                for i, face in enumerate(faces):
                    total_faces += 1
                    # שמירת התמונה המקורית
                    timestamp = time.strftime("%Y%m%d_%H%M%S")
                    original_path = os.path.join(output_dir, f"original_{image_count}_{timestamp}.jpg")
                    cv2.imwrite(original_path, frame)
                    
                    # שמירת הפנים החתוכות
                    face_path = os.path.join(output_dir, f"face_{image_count}_{i+1}_{face.face_id}.png")
                    with open(face_path, "wb") as f:
                        f.write(face.image_bytes)
                    
                    # הצגת מידע נוסף
                    logger.info(f"  פנים {i+1}: {face.face_id}, גודל: {face.width}x{face.height}")
                    logger.info(f"  נשמר ב: {face_path}")
                    
                    # שרטוט מסגרת על הפנים שזוהו בתמונה המקורית
                    x, y, w, h = face.bbox
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                
                # הצגת התמונה עם המסגרות
                cv2.imshow("Detected Faces", frame)
                cv2.waitKey(1000)  # המתנה של שנייה להצגת התוצאה
            
            else:
                logger.info(f"לא זוהו פנים בתמונה הנוכחית, מנסה שוב...")
                
    except KeyboardInterrupt: 
        logger.info("הניסוי הופסק על ידי המשתמש")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        
    logger.info(f"סיכום: זוהו {total_faces} פנים ב-{image_count} תמונות")
    logger.info(f"התמונות נשמרו בתיקייה: {output_dir}")


if __name__ == "__main__":
    main()
