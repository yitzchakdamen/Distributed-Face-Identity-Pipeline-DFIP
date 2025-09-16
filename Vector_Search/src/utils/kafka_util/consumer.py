from kafka import KafkaConsumer
from Vector_Search.src.utils.config.config import KafkaConfig
import json
from Vector_Search.src.utils.logger import Logger


class Consumer:
    def __init__(self, _topic = KafkaConfig.LISTEN_TOPIC):
        self.TOPIC = _topic
        self.consumer = self.get_consumer_events()
        self.logger = Logger.get_logger()

    def get_consumer_events(self):
        # The consumer object contains the topic name, json deserializer,Kafka servers
        # and kafka_util time out in ms, Stops the iteration if no message after 1 sec
        self.consumer = KafkaConsumer(*self.TOPIC,
                                      group_id='my-group',
                                      value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                                      bootstrap_servers=[f'{KafkaConfig.KAFKA_HOST}:{KafkaConfig.KAFKA_PORT}']
                                      )
        return self.consumer


    def listen_topic(self):
        self.logger.info(f"Start listen to {self.TOPIC} TOPIC")
        # Iterate through the messages
        if self.consumer is not None:
            for message in self.consumer:

                yield self.customize_message(message)
    @staticmethod
    def customize_message(message):
        return {
            KafkaConfig.VALUE : message.value,
            KafkaConfig.TOPIC : message.topic
        }


