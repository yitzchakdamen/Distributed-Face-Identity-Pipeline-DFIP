from typing import Dict, Any, Union, TYPE_CHECKING
from bson import ObjectId

if TYPE_CHECKING:
    from src.face_detection import FaceObject


def create_mongo_payload(face: "FaceObject") -> Dict[str, Any]:
    """
    Create a MongoDB payload from a FaceObject.
    
    Args:
        face: FaceObject containing face data
        
    Returns:
        Dictionary formatted for MongoDB GridFS storage
    """
    return {
        "image": face.image_bytes,
        "image_id": face.face_id,
        "event_ts": face.timestamp_utc
    }


def create_kafka_payload(face: "FaceObject", mongo_file_id: Union[str, ObjectId]) -> Dict[str, Any]:
    """
    Create a Kafka message payload from a FaceObject and MongoDB file ID.
    
    Args:
        face: FaceObject containing face data
        mongo_file_id: MongoDB ObjectId where the image is stored
        
    Returns:
        Dictionary formatted for Kafka message
    """
    return {
        "image_id": face.face_id,
        "mongo_id": str(mongo_file_id),
        "event_ts": face.timestamp_utc
    }
