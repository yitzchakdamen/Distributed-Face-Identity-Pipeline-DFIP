import logging
from pymongo import MongoClient
import gridfs
from bson import ObjectId


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBHandler:
    def __init__(self, mongo_uri: str, db_name: str):
        """Initialize MongoDB connection and GridFS."""
        self.__client = MongoClient(mongo_uri)
        self.__db = self.__client[db_name]
        self.__fs = gridfs.GridFS(self.__db)
        logger.info(f"Connected to MongoDB: {mongo_uri}, DB: {db_name}")

    def download_file(self, file_id: str) -> bytes:
        """Download a file from GridFS by its ID."""
        try:
            file_obj = self.__fs.get(ObjectId(file_id))
            logger.info(f"File downloaded: {file_id}")
            return file_obj.read()
        except gridfs.errors.NoFile:
            logger.error(f"No file found with ID: {file_id}")
            raise
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            raise

        
            