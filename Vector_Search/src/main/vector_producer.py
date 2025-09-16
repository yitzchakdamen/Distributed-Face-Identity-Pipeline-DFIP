from Vector_Search.src.utils.logger import Logger
from Vector_Search.src.utils.kafka_util import producer


class VectorProducer:
    """
    Send to metadata and vector to kafka_util.
    """
    def __init__(self):
        self.logger = Logger().get_logger()
        self.producer = producer.Producer()

    def send_vector(self, vector_with_metadata : dict):
        """
        Upload metadata to Elastic, and audios to Mongo.
        :param vector_with_metadata:
        :return:
        """
        self.producer.publish_message(vector_with_metadata)
