from Vector_Search.src.main.vector_store import VectorStore
from Vector_Search.src.exceptions.exception import SearchGotWrong
from Vector_Search.src.main.fetching_data import FetchingData
from Vector_Search.src.main.vector_producer import VectorProducer
from Vector_Search.src.utils.config.config import KafkaConfig
from Vector_Search.src.utils.logger import Logger



class Manager:
    """
    Manage the flow.
    Listen to 2 topic.
    Classified the topics to 2 different funcs.
    1. For new entry people.
    2. For add new APPROVAL person.
    For new entry: Search for a similar person face, if not exist, add, with unique ID.
    For add APPROVAL person, just add with unique ID
    """
    def __init__(self):
        self.logger = Logger().get_logger()

        self.fetcher = FetchingData()
        self.vector_store = VectorStore()
        self.vector_producer = VectorProducer()

    def listen_message(self):
        listen = True
        while listen:
            self.logger.info("Listening to Kafka topics...")
            vector_record = self.fetcher.fetch()
            self.classified_records(vector_record)

    def classified_records(self, _vector_record):
        merged_result_vector_record = None
        if _vector_record[KafkaConfig.TOPIC] == KafkaConfig.NEW_VECTOR_TOPIC:
            merged_result_vector_record = self.new_entry(_vector_record[KafkaConfig.VALUE])
        elif _vector_record[KafkaConfig.TOPIC] == KafkaConfig.NEW_VECTOR_APPROVAL_PERSON:
            merged_result_vector_record = self.new_approval_person(_vector_record[KafkaConfig.VALUE])

        if merged_result_vector_record is not None:
            self.vector_producer.send_vector(merged_result_vector_record)

    def new_entry(self, _vector_record):
        try:
            return self.vector_store.search_vector(_vector_record)
        except SearchGotWrong as e:
            self.logger.warning(e)

    def new_approval_person(self, _vector_record):
        return self.vector_store.create_approval_person(_vector_record)

