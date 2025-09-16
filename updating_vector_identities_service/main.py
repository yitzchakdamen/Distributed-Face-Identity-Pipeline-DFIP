
import numpy as np
import logging

logger = logging.getLogger(__name__)


import json
from kafka import KafkaConsumer, KafkaProducer
from elasticsearch import Elasticsearch, NotFoundError
from datetime import datetime
import numpy as np

class KafkaManager:
    """
    KafkaManager handles Kafka producer and consumer operations.
    """
    def __init__(self, broker_servers):
        """
        :param broker_servers: List of Kafka broker addresses (e.g., ['localhost:9092'])
        """
        self.brokers = broker_servers

    def get_consumer(self, topic, group_id):
        """
        Create and return a KafkaConsumer object.
        :param topic: Kafka topic name (str)
        :param group_id: Consumer group id (str)
        :return: KafkaConsumer object
        """
        return KafkaConsumer(
            topic,
            bootstrap_servers=self.brokers,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            group_id=group_id,
            auto_offset_reset='latest'
        )

    def get_producer(self):
        """
        Create and return a KafkaProducer object.
        :return: KafkaProducer object
        """
        return KafkaProducer(
            bootstrap_servers=self.brokers,
            value_serializer=lambda m: json.dumps(m).encode('utf-8')
        )


class ElasticManager:
    """
    ElasticManager encapsulates all Elasticsearch read/write logic.

    """
    def __init__(self, hosts):
        """
        :param hosts: List of Elasticsearch hosts (e.g., ['localhost:9200'])
        """
        self.client = Elasticsearch(hosts)

    def index_doc(self, index, doc, doc_id=None):
        """
        Index a document into Elasticsearch.
        :param index: Target Elastic index (str)
        :param doc: The document (dict)
        :param doc_id: Optional document ID (str)
        """
        self.client.index(index=index, body=doc, id=doc_id, refresh=True)

    def get_docs_by_term(self, index, term_field, term_value, size=1000):
        """
        Retrieve documents matching a term query.
        :param index: Elastic index name (str)
        :param term_field: Field name to filter by (str)
        :param term_value: Value to filter by
        :param size: Max number of results (int)
        :return: List of documents (list of dict)
        """
        query = {"query": {"term": {term_field: term_value}}}
        resp = self.client.search(index=index, body=query, size=size)
        return [hit["_source"] for hit in resp["hits"]["hits"]]

    def get_doc_by_id(self, index, doc_id):
        """
        Retrieve a document by its ID.
        :param index: Index name
        :param doc_id: Document ID
        :return: Document dict or None if not found
        """
        try:
            return self.client.get(index=index, id=doc_id)['_source']
        except NotFoundError:
            return None


class VectorProcessor:
    """
    VectorProcessor aggregates and calculates weighted person vectors.
    Uses exponential decay based on time to weight vectors.
    """
    @staticmethod
    def weighted_mean(vectors, dates, decay_days=7):
        """
        Compute weighted average of vectors based on recency.
        :param vectors: List of vectors (list of list/float)
        :param dates: List of date strings ('YYYY-MM-DD HH:MM:SS')
        :param decay_days: How fast old events lose weight (int)
        :return: Weighted average vector (ndarray)
        """
        now = np.datetime64('now')
        # ממיר תאריכים
        date_objs = np.array([np.datetime64(d.replace("Z", "")) for d in dates], dtype="datetime64[ms]")
        seconds = (now - date_objs).astype("timedelta64[s]").astype(float)

        
        # חישוב משקלים אקספוננציאליים
        weights = np.exp(-seconds / (decay_days * 24 * 3600))
        weights /= np.sum(weights)

        # נרמול הווקטורים לפני ממוצע
        data = np.array([v / np.linalg.norm(v) for v in vectors])
        
        # ממוצע משוקלל
        return np.average(data, axis=0, weights=weights)



class PersonEventAggregator:
    """
    PersonEventAggregator counts event occurrences over different time periods.
    """
    @staticmethod
    def count_events_per_period(dates):
        """
        Returns counts: today, this week, this month, this year.
        :param dates: List of date strings
        :return: dict עם Today / This week / This month / This year
        """
        now = datetime.now()
        today = week = month = year = 0
        for d in dates:
            try:
                dt = datetime.strptime(d, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                dt = datetime.strptime(d, "%Y-%m-%dT%H:%M:%SZ")

            delta = now - dt
            if delta.days == 0: today += 1
            if delta.days < 7: week += 1
            if delta.days < 31: month += 1
            if dt.year == now.year: year += 1
        return {"Today": today, "This week": week, "This month": month, "This year": year}


class FaceIdentityPipeline:
    """
    FaceIdentityPipeline integrates Kafka and Elasticsearch to manage face identity data.
    """
    def __init__(self, kafka_brokers, es_hosts, group_id='face_group'):
        self.kafka = KafkaManager(kafka_brokers)
        self.elastic = ElasticManager(es_hosts)
        self.group_id = group_id

    def run(self):
        """
        Main loop: consume messages, process, and produce results.
        """
        consumer = self.kafka.get_consumer('new_vector_person', self.group_id)
        producer = self.kafka.get_producer()

        for msg in consumer:
            self.processing(data=msg.value, producer=producer)


    def processing(self, data, producer):
        """
        Process incoming data and update Elasticsearch.
        """
        person_id = data["person_id"]
        data.pop("message")

        # 1. עדכון אינדקס התמונה 
        self.elastic.index_doc(index="image_embeddings", doc=data)
        
        vectors, dates = self.get_all_event_by_person_id(person_id=person_id)
        print("vectors: ", len(vectors))

        self.processing_new_vector(person_id=person_id, vectors=vectors, dates=dates)
        self.send_event_msg(producer=producer, dates=dates, data=data)
        
    
    def get_all_event_by_person_id(self, person_id):
        """
        :param person_id: Person ID to query
        :return: List of vectors and their corresponding dates
        """
        docs = self.elastic.get_docs_by_term("image_embeddings", "person_id", person_id)
        vectors = [doc["vector"] for doc in docs]
        dates = [doc["time"] for doc in docs]
        return vectors, dates

    def processing_new_vector(self, person_id, vectors,  dates):
        """
        Process and index a new weighted vector for a person.
        """
        # 3. חישוב וקטור ייחודי משוקלל לפי זמן
        new_vector = VectorProcessor.weighted_mean(vectors, dates)
        self.elastic.index_doc(
            index="persons", doc={"person_id": person_id, "vector": new_vector},
            doc_id=person_id
        )
            
    def send_event_msg(self, producer, dates:list, data:dict):
        """
        Send event message to Kafka.
        """
        appear = PersonEventAggregator.count_events_per_period(dates)
        producer.send('event', {"Appears": appear} | data)
        producer.flush()
    

if __name__ == "__main__":
    # דוגמת הרצה אמיתית (להחליף לכתובות נכונות)
    pipeline = FaceIdentityPipeline(
        kafka_brokers=['localhost:9092'],
        es_hosts=['http://localhost:9200']
    )
    pipeline.run()
