import json
from confluent_kafka import Consumer
import logging


logger = logging.getLogger(__name__)

class KafkaConsumer:
    def __init__(self, config: dict, topics: list):
        self.__consumer = Consumer(config)
        self.__consumer.subscribe(topics)
        self.__running = True

    def stop(self):
        self.__running = False

    def consume(self, process_message, timeout: float = 1.0):
        try:
            while self.__running:
                msg = self.__consumer.poll(timeout)
                if msg is None:
                    continue
                if msg.error():
                    logger.error(f"Consumer error: {msg.error()}")
                    continue
                try:
                    message_value = json.loads(msg.value().decode('utf-8'))
                    process_message(message_value)
                except Exception as e:
                    logger.error(f"Decode error: {e}")
        except Exception as e:
            logger.info(f"Consumer stopped: {e}")
        finally:
            self.__consumer.close()