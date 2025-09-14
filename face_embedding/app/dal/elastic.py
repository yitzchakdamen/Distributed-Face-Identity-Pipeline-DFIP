from elasticsearch import Elasticsearch 
import logging

logger = logging.getLogger(__name__)


class Elastic:
    """
    Wrapper for Elasticsearch operations such as index creation and document indexing.

    Attributes:
        __uri (str): Elasticsearch URI.
        __connection (Elasticsearch): Elasticsearch client instance.
    """

    def __init__(self, uri):
        """
        Initialize the Elastic client.

        Args:
            uri (str): Elasticsearch URI.
        """
        self.__uri = uri
        self.__connection = Elasticsearch(self.__uri)

    def create_index(self, index: str, mappings: dict):
        """
        Create a new index in Elasticsearch if it doesn't exist.

        Args:
            index (str): Name of the index to create.
            mappings (dict): Mappings for the index.

        Raises:
            Exception: If index creation fails.
        """
        try:
            if not self.__connection.indices.exists(index=index):
                self.__connection.indices.create(index=index,  body={"mappings": mappings})
                logger.info(f"Successfully create index {index}")
            else:
                logger.warning(f"Index {index} already exists")
        except Exception as e:
            logger.error(f"Failed to create index {index}: {e}")
            raise

    def index(self, index: str, id: str, data: dict):
        """
        Index a document into Elasticsearch.

        Args:
            index (str): Name of the index.
            id (str): Document ID.
            data (dict): Document data to index.

        Raises:
            Exception: If indexing fails.
        """
        try:
            self.__connection.index(index=index, id=id, document=data,  refresh=True)
            logger.info(f"Successfully indexed document in {index} with id: {id}")
        except Exception as e:
            logger.error(f"Failed to index data in {index}: {e}")
            raise
        
        
    