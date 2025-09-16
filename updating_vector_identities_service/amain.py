from updating_vector_identities_service.config import config
from updating_vector_identities_service.config.logger_config import LoggerConfig
import logging
from updating_vector_identities_service.src.management import Management
from updating_vector_identities_service.utils.kafka_tools import KafkaTools
from updating_vector_identities_service.utils.dal_elasticsearch import ElasticSearchDal
from config.config import LOGGER_NAME

logging.getLogger('kafka').setLevel(logging.WARNING)
logging.getLogger('elastic_transport.transport').setLevel(logging.WARNING)
logger = logging.getLogger(LOGGER_NAME)

BOOTSTRAP_SERVERS = config.BOOTSTRAP_SERVERS
KAFKA_TOPIC_FILE_METADATA = config.KAFKA_TOPIC_FILE_METADATA
KAFKA_GROUP_ID_FILE_METADATA = config.KAFKA_GROUP_ID_FILE_METADATA

KAFKA_TOPIC_INCOME_PROCESSING = config.KAFKA_TOPIC_INCOME_PROCESSING

ELASTICSEARCH_HOST = config.ELASTICSEARCH_HOST
ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS = config.ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS
ELASTICSEARCH_INDEX_PERSONS = config.ELASTICSEARCH_INDEX_PERSONS
ELASTICSEARCH_MAPPING = config.ELASTICSEARCH_MAPPING_IMAGE_EMBEDDINGS
ELASTICSEARCH_INDEX_LOG = config.ELASTICSEARCH_INDEX_LOG


def main():
    """
    Initializes the objects required for management and speeds up management 
    consumer: 
        Getting file metadata information
    producer: 
        Posting a message about storing a file in Mongo
    dal_elasticsearch:
        for connecting to Elasticsearch
    """
    logging.basicConfig(level=logging.INFO ) #, handlers=LoggerConfig.config_ESHandler(es_host=ELASTICSEARCH_HOST, index=ELASTICSEARCH_INDEX_LOG))
    
    logger.info(" ____ Starting the application ____ ")
    
    consumer = KafkaTools.Consumer.get_consumer(
        KAFKA_TOPIC_FILE_METADATA, 
        bootstrap_servers=BOOTSTRAP_SERVERS, 
        group_id=KAFKA_GROUP_ID_FILE_METADATA)
    
    producer = KafkaTools.Producer(bootstrap_servers=BOOTSTRAP_SERVERS)

    dal_elasticsearch = ElasticSearchDal(elasticsearch_host=ELASTICSEARCH_HOST)
    
    management = Management(
        dal_elasticsearch=dal_elasticsearch,
        consumer=consumer ,
        producer= producer,
        index_image_embeddings=ELASTICSEARCH_INDEX_IMAGE_EMBEDDINGS,
        index_persons=ELASTICSEARCH_INDEX_PERSONS,
        elasticsearch_mapping=ELASTICSEARCH_MAPPING
        )
    management.consumer_loop(topic=KAFKA_TOPIC_INCOME_PROCESSING)

if __name__ == "__main__":
    # python -m main
    main()