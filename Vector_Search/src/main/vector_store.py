import elasticsearch
from Vector_Search.src.dal.elastic_dal import ElasticSearchDal
from Vector_Search.src.exceptions.exception import NoIdentifiedPerson, NoAddedVector, NoSearchResult, SearchGotWrong
from Vector_Search.src.utils.logger import Logger
from Vector_Search.src.utils.config.config import GeneralConfig
import hashlib
import json

class VectorStore:
    def __init__(self):
        self._es = ElasticSearchDal()
        self.logger = Logger().get_logger()

    def search_vector(self, _vector_record):
        vector = _vector_record[GeneralConfig.EMBEDDING]
        result = self._search_vector(vector)
        return _vector_record | result

    def create_approval_person(self, _vector_record):
        vector = _vector_record[GeneralConfig.EMBEDDING]
        result = self._add_person_without_id(vector)
        return _vector_record | result

    def _search_vector(self, _vector) -> str:
        try:
            record = self._es.search_vector(_vector)
            return record
        except (NoSearchResult, NoIdentifiedPerson) as e :
            self.logger.warning(e)
            return self._add_person_without_id(_vector)
        except elasticsearch.BadRequestError as e:
            self.logger.warning(e)
            raise SearchGotWrong

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
