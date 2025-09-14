import logging
from pymongo import MongoClient
import gridfs
from bson import ObjectId


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBHandler:
    def __init__(self, mongo_uri: str, db_name: str):
        def __init__(self, mongo_uri: str, db_name: str):
            self._client = MongoClient(mongo_uri)
            self._db = self._client[db_name]
            self._fs = gridfs.GridFS(self._db)
            logger.info(f"Connected to MongoDB: {mongo_uri}, DB: {db_name}")

    def download_file(self, file_id: str) -> bytes:
        """Download a file from GridFS by its ID."""
        try:
            file_obj = self._fs.get(ObjectId(file_id))
            logger.info(f"File downloaded: {file_id}")
            return file_obj.read()
        except gridfs.errors.NoFile:
            logger.error(f"No file found with ID: {file_id}")
            raise
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            raise
            