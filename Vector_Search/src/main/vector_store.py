import elasticsearch
from Vector_Search.src.dal.elastic_dal import ElasticSearchDal
from Vector_Search.src.exceptions.exception import NoIdentifiedPerson, NoAddedVector, NoSearchResult, SearchGotWrong
from Vector_Search.src.utils.logger import Logger
from Vector_Search.src.utils.config.config import GeneralConfig
import hashlib
import json


class VectorStore:
    """
    Handles storage and retrieval of vectors using ElasticSearch.
    Provides methods to search, add, and generate IDs for vectors.
    """
    def __init__(self):
        # Initialize ElasticSearch DAL and logger
        self._es = ElasticSearchDal()
        self.logger = Logger().get_logger()

    def search_vector(self, _vector_record):
        """
        Search for a vector in the database. If not found, add as new.
        """
        vector = _vector_record[GeneralConfig.EMBEDDING]
        result = self._search_vector(vector)
        return _vector_record | result

    def create_approval_person(self, _vector_record):
        """
        Add a new approval person vector to the database.
        """
        vector = _vector_record[GeneralConfig.EMBEDDING]
        result = self._add_person_without_id(vector)
        return _vector_record | result

    def _search_vector(self, _vector) -> str:
        """
        Search for a vector. If not found, add as new. Handles exceptions.
        """
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
        """
        Add a vector to the database with a specific ID.
        """
        try:
            return self._es.add_vector(_vector=_vector, _person_id= _id)
        except NoAddedVector as e:
            self.logger.warning(e)

    def _add_person_without_id(self, _vector):
        """
        Add a vector to the database, generating a unique ID from the vector.
        """
        try:
            _id = self._generate_id_by_vector(_vector)
            return self._add_vector(_id, _vector)
        except NoAddedVector as e:
            self.logger.warning(e)
            raise NoAddedVector(_vector)

    @staticmethod
    def _generate_id_by_vector(_vector : list) -> str:
        """
        Generate a unique hash ID for a vector.
        """
        str_vector = json.dumps(_vector).encode('utf-8')
        hash_id = hashlib.sha256(str_vector).hexdigest()
        return hash_id
