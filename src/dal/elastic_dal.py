from elasticsearch  import Elasticsearch, helpers

from src.exceptions.exception import NoSearchResult, NoIdentifiedPerson, NoElasticConnection
from src.utils.config import ElasticSearchConfig
import numpy as np

class ElasticSearchDal:
    def __init__(self):
        URL = ElasticSearchConfig.ELASTIC_URL
        self.REGULAR_INDEX = ElasticSearchConfig.REGULAR_INDEX_NAME
        self.OPTIMIZE_INDEX = ElasticSearchConfig.OPTIMIZE_INDEX_NAME
        self.REGULAR_MAPPING = ElasticSearchConfig.REGULAR_MAPPING
        self.OPTIMIZE_MAPPING = ElasticSearchConfig.OPTIMIZE_MAPPING

        self.es = Elasticsearch(URL)
        if self.es.ping():
            self._create_regular_index()
            self._create_index_with_optimize()
        else:
            raise NoElasticConnection()

    def _create_regular_index(self):
        if not self.es.indices.exists(index = self.REGULAR_INDEX, body = self.REGULAR_MAPPING):
            self.es.indices.create(index = self.REGULAR_INDEX)
            return True
        else:
            return False

    def _create_index_with_optimize(self):
        if not self.es.indices.exists(index=self.OPTIMIZE_INDEX, body=self.OPTIMIZE_MAPPING):
            self.es.indices.create(index=self.OPTIMIZE_INDEX)
            return True
        else:
            return False

    def search_vector(self, vector : list):
        query = {
            "size": 1,  # רק התוצאה הכי קרובה
            "query": {
                "script_score": {
                    "query": {"match_all": {}},  # כל המסמכים נבדקים
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                        "params": {"query_vector": vector}
                    }
                }
            }
        }

        hit = self.es.search(index = self.REGULAR_INDEX, body= query)['hits']['hits']
        if not hit:
            raise NoSearchResult()
        v2 = hit[0]["_source"]["embedding"]
        v2_np = np.array(v2)
        similarity_score  = self._cosine_similarity(vector, v2_np)
        if similarity_score >= 0.8:
            person_id = hit[0]["_source"]["person_id"]
            message = {"score" : similarity_score,
                       "person": person_id}
            return message
        else:
            raise NoIdentifiedPerson()

    def search_vector_optimization(self, vector : list) :
        query = {
            "size": 1,  # מחזיר את 5 הוקטורים הכי דומים
            "query": {
                "knn": {
                    "embedding": {
                        "vector": vector,
                        "k": 5
                    }
                }
            }
        }
        result = self.es.search(index=self.OPTIMIZE_INDEX, body=query)
        return result

    def add_vector(self, vector : list, person_id):
        doc={
            "embedding":vector,
            "person_id": person_id
        }
        return self.es.index(index=self.REGULAR_INDEX, id = person_id, document=doc)

    def _add_bulk_to_regular(self, vectors):
        if self.es:
            actions = []
            for i, vector in enumerate(vectors):
                actions.append({
                    "_index": self.REGULAR_INDEX,
                    "_id": i +100000,
                    "_source":{
                        "embedding": vector.tolist(),
                        "person_id":f"{i} people"
                    }
                })
                if i%10000==0:
                    print(i)
                    helpers.bulk(self.es, actions)
                    actions = []

            print("added regular")

    # def _add_bulk_to_optimize(self, vectors):
    #     if self.es:
    #         actions = []
    #         for i, vector in enumerate(vectors):
    #             actions.append({
    #                 "_index": self.OPTIMIZE_INDEX,
    #                 "_id": i,
    #                 "_source":{
    #                     "embedding": vector.tolist()
    #                 }
    #             })
    #         result = helpers.bulk(self.es, actions)
    #         print("added optimize")
    #         self.es.indices.put_settings(
    #             index=self.OPTIMIZE_INDEX,
    #             body={
    #                 "index": {
    #                     "refresh_interval": "0s"  # מיידי
    #                 }
    #             }
    #         )
    #         return result
    #     else:
    #         print("not ping")
    #         return 1

    @staticmethod
    def _cosine_similarity(v1, v2):
        v1 /= np.linalg.norm(v1)
        v2 /= np.linalg.norm(v2)
        return np.dot(v1, v2)

if __name__ == "__main__":
    es = ElasticSearchDal()
    # print(es.es.indices.delete(index=es.REGULAR_INDEX))
    vector = np.random.rand(512).tolist()
    # vectors = np.random.rand(100000, 512)
    # print("finish")
    # print(es._add_bulk_to_regular(vectors))
    # print(es.add_bulk_to_optimize(vectors))

    print(es.search_vector(vector))
    # print(es.search_vector_optimization(vector))
