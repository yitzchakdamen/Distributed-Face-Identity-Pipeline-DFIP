"""
Factory functions for creating data structures used in face detection pipeline.

This module provides clean, reusable functions for building payloads and messages
that are sent to different services (MongoDB, Kafka) in the face detection system.
"""

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
        "face_id": face.face_id,
        "bbox": face.bbox,
        "width": face.width,
        "height": face.height,
        "mongo_file_id": str(mongo_file_id),
        "event_ts": face.timestamp_utc
    }


def create_face_metadata(face: "FaceObject") -> Dict[str, Any]:
    """
    Create a comprehensive metadata dictionary for a face.
    
    Args:
        face: FaceObject containing face data
        
    Returns:
        Dictionary with all face metadata
    """
    return {
        "face_id": face.face_id,
        "bbox": face.bbox,
        "dimensions": {
            "width": face.width,
            "height": face.height
        },
        "content_type": face.content_type,
        "timestamp_utc": face.timestamp_utc,
        "source_hint": face.source_hint
    }


def create_processing_summary(faces: list, processing_time_ms: float = None) -> Dict[str, Any]:
    """
    Create a summary of face processing results.
    
    Args:
        faces: List of FaceObject instances
        processing_time_ms: Optional processing time in milliseconds
        
    Returns:
        Dictionary with processing summary
    """
    summary = {
        "total_faces": len(faces),
        "face_ids": [face.face_id for face in faces],
        "timestamp_utc": faces[0].timestamp_utc if faces else None
    }
    
    if processing_time_ms is not None:
        summary["processing_time_ms"] = processing_time_ms
        
    return summary
