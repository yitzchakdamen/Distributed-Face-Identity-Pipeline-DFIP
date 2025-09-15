from elasticsearch  import Elasticsearch, helpers

from Vector_Search.src.exceptions.exception import NoSearchResult, NoIdentifiedPerson, NoElasticConnection, NoAddedVector
from Vector_Search.src.utils.config.config import ElasticSearchConfig, GeneralConfig as gen
import numpy as np

from Vector_Search.src.utils.logger import Logger


class ElasticSearchDal:
    def __init__(self):
        URL = ElasticSearchConfig.ELASTIC_URL
        self.REGULAR_INDEX = ElasticSearchConfig.REGULAR_INDEX_NAME
        self.REGULAR_MAPPING = ElasticSearchConfig.REGULAR_MAPPING

        self.es = Elasticsearch(URL)
        if self.es.ping():
            self._create_regular_index()
        else: raise NoElasticConnection()

        self.logger = Logger().get_logger()

    def _create_regular_index(self):
        if not self.es.indices.exists(index = self.REGULAR_INDEX, body = self.REGULAR_MAPPING):
            self.es.indices.create(index = self.REGULAR_INDEX)
            return True
        else:
            return False

    def search_vector(self, _vector : list):
        query = gen.QUERY(_vector)

        hit = self.es.search(index = self.REGULAR_INDEX, body= query)['hits']['hits']
        if not hit:
            raise NoSearchResult()
        v2 = hit[0][gen.SOURCE][gen.EMBEDDING]
        v2_np = np.array(v2)
        similarity_score  = self._cosine_similarity(_vector, v2_np)
        if similarity_score >= gen.THRESHOLD_SCORE:
            person_id = hit[0][gen.SOURCE][gen.PERSON_ID]
            return self.generate_result_dict(similarity_score, person_id)

        else:
            raise NoIdentifiedPerson()
    @staticmethod
    def generate_result_dict(_similarity_score, _id):
        return {"score": _similarity_score,
                   "person_id": _id}

    def add_vector(self, _vector : list, _person_id) -> dict:
        try:
            doc={
                f"{gen.EMBEDDING}":_vector,
                "person_id": _person_id
            }
            result = self.es.index(index=self.REGULAR_INDEX, id = _person_id, document=doc)
            if result["result"] == "created":
                return self.generate_result_dict(1, _person_id)
        except Exception() as e:
            self.logger.warning(e)
            raise NoAddedVector(_vector)

    def _add_bulk_to_regular(self, vectors):
        if self.es:
            actions = []
            for i, vector in enumerate(vectors):
                actions.append({
                    "_index": self.REGULAR_INDEX,
                    "_id": i +100000,
                    "_source":{
                        f"{gen.EMBEDDING}": vector.tolist(),
                        "person_id":f"{i} people"
                    }
                })
                if i%10000==0:
                    print(i)
                    helpers.bulk(self.es, actions)
                    actions = []

            print("added regular")

    @staticmethod
    def _cosine_similarity(v1, v2):
        v1 /= np.linalg.norm(v1)
        v2 /= np.linalg.norm(v2)
        return np.dot(v1, v2)

if __name__ == "__main__":
    es = ElasticSearchDal()
    # print(es.es.indices.delete(index=es.REGULAR_INDEX))
    # vector = np.random.rand(512).tolist()
    # vectors = np.random.rand(100000, 512)
    # print("finish")
    # print(es._add_bulk_to_regular(vectors))
    # print(es.add_bulk_to_optimize(vectors))

    # print(es.search_vector(vector))
    # print(es.search_vector_optimization(vector))
