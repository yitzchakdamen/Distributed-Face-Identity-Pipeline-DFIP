from kafka import KafkaConsumer
import json
import config

class KafkaSubscriber:
    """
    Subscriber for consuming messages from a Kafka topic.
    """
    def __init__(self, topic: str, group_id: str):
        self.consumer = KafkaConsumer(
            bootstrap_servers=config.KAFKA_BOOTSTRAP,
            group_id=group_id,
            value_deserializer=lambda m: json.loads(m.decode("utf-8"))
        )
        self.consumer.subscribe([topic])

    def listen(self):
        for msg in self.consumer:
            yield msg.value

    def close(self):
        self.consumer.close()