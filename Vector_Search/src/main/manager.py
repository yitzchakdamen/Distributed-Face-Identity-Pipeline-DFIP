import elasticsearch

from Vector_Search.src.dal.elastic_dal import ElasticSearchDal
from Vector_Search.src.exceptions.exception import NoIdentifiedPerson, NoAddedVector, NoSearchResult, SearchGotWrong
from Vector_Search.src.main.fetching_data import FetchingData
from Vector_Search.src.main.send_data import SendData
from Vector_Search.src.utils.logger import Logger
import hashlib
import json


class Manager:
    def __init__(self):
        self._es = ElasticSearchDal()
        self.logger = Logger().get_logger()

        self.fetcher = FetchingData()
        self.vector_registry = None
        self.send_data = SendData()

    def listen_message(self):
        listen = True
        while listen:
            vector_record = self.fetcher.fetch()
            vector = vector_record["vector"]
            try:
                result = self._search_vector(vector)
                vector_record = vector_record | result
                self.send_data.send_data(vector_record)
                print(vector_record)
            except SearchGotWrong as e:
                self.logger.warning(e)
                print(vector_record)


    def _search_vector(self, _vector) -> str:
        try:
            _id = self._es.search_vector(_vector)
            return _id
        except NoIdentifiedPerson as e:
            self.logger.warning(e)
            return self._add_person_without_id(_vector)
        except elasticsearch.BadRequestError as e:
            self.logger.warning(e)
            raise SearchGotWrong

        except NoSearchResult as e:
            self.logger.warning(e)
            return None

    def _add_vector(self, _id, _vector):
        try:
            return self._es.add_vector(_vector=_vector, _person_id= _id)
        except NoAddedVector as e:
            self.logger.warning(e)

    def _add_person_without_id(self, _vector):
        try:
            _id = self._generate_id_by_vector(_vector)
            return self._add_vector(_id, _vector)
        except NoAddedVector as e:
            self.logger.warning(e)
            raise NoAddedVector(_vector)

    @staticmethod
    def _generate_id_by_vector(_vector : list) -> str:
        str_vector = json.dumps(_vector).encode('utf-8')
        hash_id =hashlib.sha256(str_vector).hexdigest()
        return hash_id


