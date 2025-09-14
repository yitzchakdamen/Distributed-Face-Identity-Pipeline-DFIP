from elasticsearch import Elasticsearch 
import logging

logger = logging.getLogger(__name__)

class Elastic:
    def __init__(self, uri):
        self.__uri = uri
        self.__connection = Elasticsearch(self.__uri)
        


    def create_index(self, index: str, mappings: dict):
        """
        Creates a new index in elasticsearch if it doesn't exist.
        """
        try:
            if not self.__connection.indices.exists(index=index):
                self.__connection.indices.create(index=index,  body={"mappings": mappings})
                logger.info(f"Successfully create index {index}")
            else:
                self.__logger.warning(f"Index {index} already exists")
        except Exception as e:
            logger.error(f"Failed to create index {index}: {e}")
            raise
            
        
    def index(self, index: str, id: str, data: dict):
        """
        Indexing documents into elasticsearch.
        """
        try:
            self.__connection.index(index=index, id=id, document=data,  refresh=True)
            logger.info(f"Successfully indexed document in {index} with id: {id}")
        except Exception as e:
            logger.error(f"Failed to index data in {index}: {e}")
            raise 
        
        
    