import os


LOGGER_NAME : str = os.getenv("LOGGER_NAME","logger")

MONGO_URI = os.getenv("MONGO_URI","localhost:27017")

MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME","test-db")