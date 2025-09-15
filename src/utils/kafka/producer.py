"""
This file contains the sample code which publishes message to the Kafka brokers.

1. publish_message function pushes the message to the topic
2. publish_message_with_key pushes the message with key

"""

# Import all the required packages
import json
from kafka import KafkaProducer, errors
from src.utils.config import KafkaConfig, Errors
from src.exceptions.exception import NoBrokerConnection
from src.utils.logger import Logger

class Producer:

    def __init__(self):
        self.url = f'{KafkaConfig.KAFKA_HOST}:{KafkaConfig.KAFKA_PORT}'
        self.producer = None
        self.logger = Logger().get_logger()


    def get_producer_config(self):
        # The Producer object requires the Kafka server, Json serializer
        try:
            self.producer = KafkaProducer(bootstrap_servers=[self.url],
                                          value_serializer=lambda x:
                                          json.dumps(x).encode('utf-8'))
        except errors.NoBrokersAvailable as e:
            self.producer = Errors.NO_BROKER_CONNECTION
            self.logger.warning(f"Can't connect to Kafka server. \n{e}")

        return self.producer

    # Publish json messages
    def publish_message(self, topic, message) -> bool:
        """
        This function will publish message to the topic which is received as a parameter
        :param producer: producer object to publish the message to Kafka servers
        :param topic: The topic to which the message will be published
        :param message: The event message
        :return: True if ent the message. Else false.
        """

        try:
            if self.producer == Errors.NO_BROKER_CONNECTION:
                raise NoBrokerConnection
            if self.producer is None:
                self.get_producer_config()
            self.producer.send(topic, message)
            self.producer.flush()
            return True
        except NoBrokerConnection as e:
            self.logger.warning(f"Can't connect to Kafka server. \n{e}")
            return False



if __name__ == '__main__':

    # Create the producer object with basic configurations
    producer = Producer().get_producer_config()

    #Publish message to a topic

    #Publish message to a topic with key to enable hashed partitioning
    # publish_message(get_producer_config(),"topic1",b"client1")

    # block until all async messages are sent
    producer.flush()