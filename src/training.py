from src.utils.config import KafkaConfig
from src.utils.kafka_util.producer import Producer
import numpy as np

producer = Producer(_topic=KafkaConfig.NEW_VECTOR_TOPIC)
def r (vector):
    t ={
	"message": "New vector",
	"image_id": 21547,
	"vector": vector,
	"camera_id": 12,
	"event_ts": "2025-02-30 12:50:24",
	"Image_capture_time" : "2025-02-30 12:50:24"
}
    return t
for i in range(500):
    vector = np.random.rand(512).tolist()
    t = r(vector)
    producer.publish_message(t)
    print(i, t)