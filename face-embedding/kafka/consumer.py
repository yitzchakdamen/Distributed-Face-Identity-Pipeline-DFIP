import json
from confluent_kafka import Consumer
import logging


logger = logging.getLogger(__name__)

class KafkaConsumer:
    def __init__(self, config: dict, topics: list):
        self.consumer = Consumer(config)
        self.consumer.subscribe(topics)
        self.running = True

    def stop(self):
        self.running = False

    def consume(self, process_message, timeout: float = 1.0):
        try:
            while self.running:
                msg = self.consumer.poll(timeout)
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
            self.consumer.close()