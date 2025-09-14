from confluent_kafka import Producer
import json
import logging

logger = logging.getLogger(__name__)

class KafkaProducer:
    def __init__(self, config: dict):
        """Initialize Kafka producer."""
        self.__producer = Producer(config)

    def delivery_report(self, err, msg):
        """Callback for message delivery reports."""
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.info(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def produce(self, topic: str, message: dict, max_retries: int = 3):
        """Produce a message to the specified Kafka topic."""
        retries = 0
        while retries < max_retries:
            try:
                message_bytes = json.dumps(message).encode('utf-8')
                self.__producer.produce(topic, value=message_bytes, callback=self.delivery_report)
                self.__producer.poll(0)
                return
            except BufferError as e:
                logger.warning(f"Local producer queue is full ({len(self.__producer)} messages awaiting delivery): {e}")
                self.__producer.poll(1)
                retries += 1
            except Exception as e:
                logger.error(f"Produce error: {e}")
                break

    def flush(self):
        """Flush the producer to ensure all messages are sent."""
        self.__producer.flush()