from pymongo import MongoClient


logger = Logger.get_logger()

class MongoHandler:
    def __init__(self, uri: str, db_name: str, collection_name: str):
        self.uri = uri
        self.db_name = db_name
        self.collection_name = collection_name
        self.client = None
        self.collection = None
        self.db = None
        self.connect()

    def connect(self):
        """
        Connect to the MongoDB database.
        """
        try:
            self.client = MongoClient(self.uri)
            self.client.admin.command("ping")
            self.db = self.client[self.db_name]
            self.collection = self.db[self.collection_name]
            logger.info(f"Connected to MongoDB: {self.db_name}/{self.collection_name}")
        except Exception as e:
            logger.error(f"MongoDB connection error: {e}")
            self.client = None
            self.collection = None

    def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")


    def insert_document(self, doc):
        if self.collection is None:
            logger.error("Not connected to MongoDB. Call connect() first.")
            raise Exception("Not connected to MongoDB. Call connect() first.")
        return self.collection.insert_one(doc)






