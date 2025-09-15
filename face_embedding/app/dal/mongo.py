from pymongo import MongoClient
import gridfs
from bson import ObjectId
from face_embedding.app.logger import Logger



class MongoDBHandler:
    """
    Handler for MongoDB operations, including file storage and retrieval using GridFS.

    Attributes:
        __client (MongoClient): The MongoDB client instance.
        __db (Database): The MongoDB database instance.
        __fs (GridFS): The GridFS instance for file operations.
    """

    def __init__(self, mongo_uri: str, db_name: str, collection_name: str):
        """
        Initialize MongoDB connection and GridFS.

        Args:
            mongo_uri (str): MongoDB connection URI.
            db_name (str): Name of the database to use.
        """
        self.logger = Logger.get_logger(__name__)
        self.__client = MongoClient(mongo_uri)
        self.__db = self.__client[db_name]
        self.__fs = gridfs.GridFS(self.__db, collection=collection_name)
        self.logger.info(f"Connected to MongoDB: {mongo_uri}, DB: {db_name}")

    def download_file(self, file_id: str) -> bytes:
        """
        Download a file from GridFS by its ID.

        Args:
            file_id (str): The ObjectId of the file as a string.

        Returns:
            bytes: The file content as bytes.

        Raises:
            Exception: For any other error during download.
        """
        try:
            file_obj = self.__fs.get(ObjectId(file_id))
            self.logger.info(f"File downloaded: {file_id}")
            return file_obj.read()

        except Exception as e:
            self.logger.error(f"Failed to download file: {e}")
            raise
