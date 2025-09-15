import logging
from typing import Any, Dict, Union
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import gridfs
from bson import ObjectId
from utils.config import LOGGER_NAME
import logging

logger = logging.getLogger(LOGGER_NAME)
ImageInput = Union[bytes, bytearray, memoryview, str]


class MongoImageStorage:
    """Minimal GridFS writer with logging and robust error handling.

    Expects payloads shaped as:
        {
            "image": bytes|bytearray|memoryview or file path (str),
            "id": str,
            "event_ts": str  # ISO-8601 timestamp
        }
    """

    def __init__(self, uri: str, db_name: str, bucket_name: str = "images") -> None:
        """Connect to MongoDB and prepare a GridFS bucket.

        Args:
            uri: MongoDB connection string.
            db_name: Target database name.
            bucket_name: GridFS bucket (collection) name.
            logger: Optional logger instance; if None, a module logger is used.
        """
        self._logger = logger 
        self._client = MongoClient(uri)
        self._db = self._client[db_name]
        self._fs = gridfs.GridFS(self._db, collection=bucket_name)

    def insert_image(self, payload: Dict[str, Any]) -> ObjectId:
        """Store the image in GridFS with basic metadata and return the file ObjectId.

        Required payload keys:
            - 'image': bytes|bytearray|memoryview or file path (str)
            - 'id': str (external identifier)
            - 'event_ts': str (ISO-8601 timestamp string)

        Returns:
            The GridFS file ObjectId.

        Raises:
            ValueError: If payload is missing required keys or image cannot be read.
            RuntimeError: On database or GridFS errors.
        """
        required = {"image", "image_id", "event_ts"}
        if not required.issubset(payload):
            missing = required - set(payload.keys())
            msg = f"Payload missing required keys: {', '.join(sorted(missing))}"
            self._logger.error(msg)
            raise ValueError(msg)

        try:
            image_bytes = self._read_image_bytes(payload["image"])
        except Exception as ex:
            msg = f"Image normalization failed for id={payload.get('image_id')}: {ex}"
            self._logger.error(msg)
            raise ValueError(msg) from ex

        metadata = {
            "image_id": str(payload["image_id"]),
            "event_ts": str(payload["event_ts"]),
        }
        filename = str(payload["image_id"])

        try:
            file_id = self._fs.put(image_bytes,metadata=metadata)
            self._logger.info("GridFS store succeeded: file_id=%s filename=%s size=%dB", file_id, filename, len(image_bytes))
            return file_id
        except (PyMongoError, OSError) as ex:
            msg = f"GridFS store failed for filename={filename}: {ex}"
            self._logger.error(msg)
            raise RuntimeError(msg) from ex
        except Exception as ex:
            msg = f"Unexpected error during GridFS store for filename={filename}: {ex}"
            self._logger.error(msg)
            raise RuntimeError(msg) from ex

    def _read_image_bytes(self, image: ImageInput) -> bytes:
        """Normalize supported image inputs to raw bytes.

        Args:
            image: bytes-like object or file path string.

        Returns:
            Image bytes.

        Raises:
            ValueError: If the input type is unsupported or reading fails.
        """
        if isinstance(image, (bytes, bytearray, memoryview)):
            return bytes(image)
        if isinstance(image, str):
            try:
                with open(image, "rb") as f:
                    return f.read()
            except Exception as ex:
                raise ValueError(f"Failed to read file at path '{image}': {ex}") from ex
        raise ValueError("image must be bytes-like or a file path string.")


# if __name__ == "__main__":
#     # Example usage
#     from utils.config import MONGO_URI, MONGODB_DB_NAME

#     writer = SimpleGridFSWriter(uri=MONGO_URI, db_name=MONGODB_DB_NAME)

#     sample_payload = {
#         "image": "C:/Users/brdwn/Pictures/Screenshots/Screenshot 2025-07-31 145934.png",  # Path to an example image file
#         "image_id": "example123",
#         "event_ts": "2024-01-01T12:00:00Z",
#     }

#     try:
#         file_id = writer.insert_image(sample_payload)
#         print(f"Image stored with GridFS file_id: {file_id}")
#     except Exception as e:
#         print(f"Failed to store image: {e}")