from Vector_Search.src.utils.logger import Logger
from Vector_Search.src.utils.kafka_util import producer



class VectorProducer:
    """
    Sends vector data and metadata to Kafka using a producer.
    """
    def __init__(self):
        # Initialize logger and Kafka producer
        self.logger = Logger().get_logger()
        self.producer = producer.Producer()

    def send_vector(self, vector_with_metadata : dict):
        """
        Publish vector and metadata to Kafka topic.
        :param vector_with_metadata: Dictionary containing vector and metadata.
        """
        self.producer.publish_message(vector_with_metadata)
