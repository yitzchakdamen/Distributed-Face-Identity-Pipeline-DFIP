import json
from confluent_kafka import Consumer
from face_embedding.app.logger import Logger



class KafkaConsumer:
    """
    Kafka consumer wrapper for subscribing to topics and processing messages.

    Attributes:
        __consumer (Consumer): The underlying confluent_kafka Consumer instance.
        __running (bool): Flag to control the consumer loop.
    """

    def __init__(self, config: dict, topics: list):
        """
        Initialize Kafka consumer and subscribe to topics.

        Args:
            config (dict): Configuration dictionary for the Kafka consumer.
            topics (list): List of topic names to subscribe to.
        """
        self.__consumer = Consumer(config)
        self.__consumer.subscribe(topics)
        self.__running = True
        self.logger = Logger.get_logger(__name__)
        self.logger.info(f"Subscribed to topics: {topics}")


    def stop(self):
        """
        Stop the consumer loop.
        """
        self.__running = False

    def consume(self, process_message, timeout: float = 1.0):
        """
        Consume messages from Kafka and process them with the provided callback.

        Args:
            process_message (Callable): Callback function to process each message (receives dict).
            timeout (float, optional): Poll timeout in seconds. Defaults to 1.0.
        """
        try:
            while self.__running:
                msg = self.__consumer.poll(timeout)
                if msg is None:
                    continue
                if msg.error():
                    self.logger.error(f"Consumer error: {msg.error()}")
                    continue
                try:
                    message_value = json.loads(msg.value().decode('utf-8'))
                    process_message(message_value)
                except Exception as e:
                    self.logger.error(f"Decode error: {e}")
        except Exception as e:
            self.logger.info(f"Consumer stopped: {e}")
        finally:
            self.__consumer.close()