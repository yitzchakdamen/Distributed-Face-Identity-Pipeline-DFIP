from kafka import KafkaConsumer, KafkaProducer
import json
import logging
from typing import Any
from updating_vector_identities_service.utils.decorators import safe_execute, log_func
from updating_vector_identities_service.config.config import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)

class KafkaTools:
    """
    Tools for connecting to Kafka
    Contains a Producer class with a publish function
    and a Consumer class
    """
    
    class Producer:
        """
        Singleton class
        To verify a single connection with Kafka
        """
        
        _instance = None
        _initialized = False

        def __new__(cls, *args, **kwargs):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance
        
        @safe_execute()
        def __init__(self, bootstrap_servers: str):
            if KafkaTools.Producer._initialized: return
            self.producer = KafkaProducer(
                bootstrap_servers=[bootstrap_servers],
                value_serializer=lambda x: json.dumps(x, default=lambda x: str(x)).encode('utf-8')
                )
            logger.info("Producer object initialized.")
            KafkaTools.Producer._initialized = True
            
        @safe_execute(return_strategy="error")
        def publish_message(self, topic:str, message:Any, key=None):
            """Publish a message to a Kafka topic."""
            self.producer.send(topic, key=key, value=message)
            self.producer.flush()
    
    class Consumer:
        
        @staticmethod
        @safe_execute(return_strategy="error")
        def get_consumer(*topic:str, bootstrap_servers:str, group_id:str) -> KafkaConsumer:
            """Create a Kafka consumer."""
            logger.info("Creating Consumer Object ..")
            return KafkaConsumer(
                *topic,
                group_id=group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                bootstrap_servers=[bootstrap_servers],
                auto_offset_reset='earliest'
            )