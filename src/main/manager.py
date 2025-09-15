from src.dal.elastic_dal import ElasticSearchDal
from src.exceptions.exception import NoIdentifiedPerson, NoAddedVector, NoSearchResult
from src.utils.logger import Logger
import hashlib
import json


class Manager:
    def __init__(self):
        self._es = ElasticSearchDal()
        self.logger = Logger().get_logger()

    def search_vector(self, _vector):
        try:
            self._es.search_vector(_vector)
        except NoIdentifiedPerson() as e:
            self.logger.info(e)
            self._add_person_without_id(_vector)
        except NoSearchResult as e:
            self.logger.warning(e)

    def _add_vector(self, _id, _vector):
        try:
            self._es.add_vector(_vector=_vector, _person_id= _id)
        except NoAddedVector as e:
            self.logger.warning(e)

    def _add_person_without_id(self, _vector):
        _id = self._generate_id_by_vector(_vector)
        return self._add_vector(_id, _vector)

    @staticmethod
    def _generate_id_by_vector(_vector : list) -> str:
        str_vector = json.dumps(_vector).encode('utf-8')
        hash_id =hashlib.sha256(str_vector).hexdigest()
        return hash_id


