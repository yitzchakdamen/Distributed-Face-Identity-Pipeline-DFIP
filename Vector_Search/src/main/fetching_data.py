from Vector_Search.src.utils.logger import Logger
from Vector_Search.src.utils.kafka_util import consumer


class FetchingData:
    """
    Fetching always data from kafka_util.
    """
    def __init__(self):
        self.consumer = consumer.Consumer()
        self.logger = Logger().get_logger()
        self.podcasts_metadata = self.consumer.listen_topic()


    def fetch(self):
        """
        Metadata fetched by 'next'. Should call by 'while' loop.
        :return:  Metadata.
        """
        metadata = next(self.podcasts_metadata)
        return metadata


