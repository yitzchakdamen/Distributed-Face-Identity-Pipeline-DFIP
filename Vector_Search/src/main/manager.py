from Vector_Search.src.main.vector_store import VectorStore
from Vector_Search.src.exceptions.exception import SearchGotWrong
from Vector_Search.src.main.fetching_data import FetchingData
from Vector_Search.src.main.vector_producer import VectorProducer
from Vector_Search.src.utils.config.config import KafkaConfig
from Vector_Search.src.utils.logger import Logger




class Manager:
    """
    Manages the flow of the vector search service.
    Listens to two Kafka topics and classifies messages for processing:
    1. NEW_VECTOR_TOPIC: For new entries, searches for similar faces or adds a new one.
    2. NEW_VECTOR_APPROVAL_PERSON: For adding a new approved person.
    """
    def __init__(self):
        # Initialize logger, fetcher, vector store, and producer
        self.logger = Logger().get_logger()
        self.fetcher = FetchingData()
        self.vector_store = VectorStore()
        self.vector_producer = VectorProducer()

    def listen_message(self):
        """
        Continuously fetch and process messages from Kafka.
        """
        listen = True
        while listen:
            vector_record = self.fetcher.fetch()
            self.classified_records(vector_record)

    def classified_records(self, _vector_record):
        """
        Classify and process records based on topic type.
        """
        merged_result_vector_record = None
        if _vector_record[KafkaConfig.TOPIC] == KafkaConfig.NEW_VECTOR_TOPIC:
            merged_result_vector_record = self.new_entry(_vector_record[KafkaConfig.VALUE])
        elif _vector_record[KafkaConfig.TOPIC] == KafkaConfig.NEW_VECTOR_APPROVAL_PERSON:
            merged_result_vector_record = self.new_approval_person(_vector_record[KafkaConfig.VALUE])

        if merged_result_vector_record is not None:
            self.vector_producer.send_vector(merged_result_vector_record)
        print(merged_result_vector_record)

    def new_entry(self, _vector_record):
        """
        Search for a similar vector or add a new entry if not found.
        """
        try:
            return self.vector_store.search_vector(_vector_record)
        except SearchGotWrong as e:
            self.logger.warning(e)
            print(_vector_record)

    def new_approval_person(self, _vector_record):
        """
        Add a new approval person to the vector store.
        """
        return self.vector_store.create_approval_person(_vector_record)

