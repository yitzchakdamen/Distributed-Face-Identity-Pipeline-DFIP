from Vector_Search.src.utils.logger import Logger
from Vector_Search.src.utils.kafka_util import consumer



class FetchingData:
    """
    Handles continuous fetching of data from Kafka topics using a consumer.
    """
    def __init__(self):
        # Initialize Kafka consumer and logger
        self.consumer = consumer.Consumer()
        self.logger = Logger().get_logger()
        self.podcasts_metadata = self.consumer.listen_topic()

    def fetch(self):
        """
        Fetch the next metadata item from the Kafka topic iterator.
        Should be called in a loop.
        :return: Metadata dictionary.
        """
        metadata = next(self.podcasts_metadata)
        return metadata


