from event_processor_service.app.kafka_consumer import KafkaSubscriber
from event_processor_service.app.mongo_client import MongoHandler
from event_processor_service.app.event_processor import EventProcessor
import config
import logging
import json


logger =  logging.getLogger("config.LOGGER_NAME")
logging.basicConfig(level=logging.DEBUG)

logger.debug("jjjj")

class EventProcessorService(object):
    def __init__(self):
        self.consumer = KafkaSubscriber(config.KAFKA_TOPIC, config.KAFKA_CONSUMER_GROUP)
        self.mongo_handler = MongoHandler(config.MONGO_URI, config.MONGO_DB, config.MONGO_COLLECTION)

    def consume_messages_from_kafka(self):
        logger.info("Consumer_mongo started listening to Kafka...")
        try:
            for message in self.consumer.listen():
                logger.info(f"Received message: {message}")
                if hasattr(message, "value"):
                    payload = message.value
                else:
                    payload = message

                if isinstance(payload, bytes):
                    payload = payload.decode("utf-8")

                if isinstance(payload, str):
                    try:
                        msg = json.loads(payload)
                    except Exception as e:
                        logger.error(f"Invalid JSON: {e} | payload={payload}")
                        continue
                elif isinstance(payload, dict):
                    msg = payload
                else:
                    logger.error(f"Unexpected payload type: {type(payload)}")
                    continue
                event_processor = EventProcessor(msg)
                doc = event_processor.process_event()
                self.send_to_mongo(doc)

        except Exception as e:
            logger.error(f"Error consuming saving: {e}")

    def send_to_mongo(self, doc):
        try:
            self.mongo_handler.insert_document(doc)
            logger.info(f"Saved to Mongo: {doc}")
        except Exception as e:
            print(f"MongoDB error: {e}")
            logger.error(f"MongoDB error: {e}")


if __name__ == "__main__":
    service = EventProcessorService()
    service.consume_messages_from_kafka()
    
