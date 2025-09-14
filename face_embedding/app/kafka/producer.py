from confluent_kafka import Producer
import json
from face_embedding.app.logger import Logger



class KafkaProducer:
    """
    Kafka producer wrapper for sending messages to Kafka topics.

    Attributes:
        __producer (Producer): The underlying confluent_kafka Producer instance.
    """

    def __init__(self, config: dict):
        """
        Initialize Kafka producer.

        Args:
            config (dict): Configuration dictionary for the Kafka producer.
        """
        self.__producer = Producer(config)
        self.logger = Logger.get_logger(__name__)


    def delivery_report(self, err, msg):
        """
        Callback for message delivery reports.

        Args:
            err: Error information if delivery failed, else None.
            msg: The Kafka message object.
        """
        if err is not None:
            self.logger.error(f"Message delivery failed: {err}")
        else:
            self.logger.info(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def produce(self, topic: str, message: dict, max_retries: int = 3):
        """
        Produce a message to the specified Kafka topic.

        Args:
            topic (str): The Kafka topic to send the message to.
            message (dict): The message payload as a dictionary.
            max_retries (int, optional): Maximum number of retries for BufferError. Defaults to 3.
        """
        retries = 0
        while retries < max_retries:
            try:
                message_bytes = json.dumps(message).encode('utf-8')
                self.__producer.produce(topic, value=message_bytes, callback=self.delivery_report)
                self.__producer.poll(0)
                return
            except BufferError as e:
                self.logger.warning(f"Local producer queue is full ({len(self.__producer)} messages awaiting delivery): {e}")
                self.__producer.poll(1)
                retries += 1
            except Exception as e:
                self.logger.error(f"Produce error: {e}")
                break

    def flush(self):
        """
        Flush the producer to ensure all messages are sent.
        """
        self.__producer.flush()

