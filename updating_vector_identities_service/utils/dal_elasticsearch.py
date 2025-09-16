from elasticsearch import Elasticsearch
import logging
from updating_vector_identities_service.utils.decorators import safe_execute, log_func
from updating_vector_identities_service.config.config import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)

class ElasticSearchDal:
    """
    Singleton class To verify a single connection with ElasticSearch
    data access layer for Elastic
    """
    
    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("DataLoader object created.")
        return cls._instance
    

    def __init__(self, elasticsearch_host: str):
        if ElasticSearchDal._initialized: return
        self.es:Elasticsearch = Elasticsearch(elasticsearch_host)
        self.check_connection()
        ElasticSearchDal._initialized = True
    
    @log_func
    def check_connection(self):
        logger.info("Elasticsearch cluster is up!" if self.es.ping() else "Elasticsearch cluster is down!")
        logger.info(f"Elasticsearch version: {self.es.info()}")
        return self.es.ping()

    @log_func
    def create_index(self, index_name: str, mappings: dict|None):
        if self.es.indices.exists(index=index_name):
            logger.warning(f"Index '{index_name}' already exists.")
            return False
        
        response = self.es.indices.create(index=index_name, body=mappings)
        logger.info(f"Index '{index_name}' created with mappings: {mappings}")
        return response

    @log_func
    def index_document(self, index_name: str, document: dict, id=None):
        check = self.es.index(index=index_name, document=document, id=id, refresh=True)
        logger.info(f"Document indexed in '{check.body['_index']}'  id: {check.body['_id']}, -> {check.body['result']}")
        return check

    @log_func
    def get_document(self, index_name:str, doc_id:str):
        return self.es.get(index=index_name, id=doc_id)

    @log_func
    def search_document(self, index_name:str, query:dict):
        return self.es.search(index=index_name, query=query)

    @log_func
    def update_document(self, index_name:str, document:dict, id, query=None):
        return self.es.update(index=index_name,id=id,doc=document)

