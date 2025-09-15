import json
import time
from typing import Any, Dict, Iterable, List, Optional,Union
from utils.logger import Logger
from confluent_kafka import Producer, KafkaException, KafkaError

logger = Logger.getLogger(__name__)
JSONLike = Union[Dict[str, Any], List[Any]]
PayloadLike = Union[JSONLike, str, bytes]


class KafkaPublisher:
    """High-reliability JSON/bytes publisher built on confluent_kafka.Producer.

    This publisher configures idempotent delivery, full acknowledgments,
    and safe in-flight ordering. It exposes a clear API for single and bulk
    publishing with explicit error reporting through logs and raised exceptions.
    """

    def __init__(
        self,
        bootstrap: str,
        topic: str,
        *,
        security: Optional[Dict[str, str]] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Initialize the publisher with safe defaults and optional security."""
        self._logger = logger
        self._topic = topic

        conf: Dict[str, Any] = {
            "bootstrap.servers": bootstrap,
            "acks": "all",
            "enable.idempotence": True,
            "compression.type": "zstd",
            "linger.ms": 20,
            "batch.size": 131072,
            "message.timeout.ms": 120000,
            "max.in.flight.requests.per.connection": 1,
            "queue.buffering.max.messages": 100000,
        }
        if security:
            conf.update(security)
        if extra:
            conf.update(extra)

        self._producer = Producer(conf)
        self._delivery_errors: List[str] = []

    def _serialize(self, value: PayloadLike) -> bytes:
        """Serialize payload to bytes (UTF-8 for str/JSON, passthrough for bytes)."""
        if isinstance(value, bytes):
            return value
        if isinstance(value, str):
            return value.encode("utf-8")
        return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    def _on_delivery(self, err: Optional[KafkaError], msg) -> None:
        """Delivery callback that records and logs failures in detail."""
        if err is not None:
            info = (
                f"topic={msg.topic()} partition={msg.partition()} "
                f"key={msg.key()} opaque={msg.opaque()} error={err.str()} code={err.code()}"
            )
            self._delivery_errors.append(info)
            self._logger.error("Kafka delivery failed: %s", info)
        else:
            self._logger.debug(
                "Kafka delivery ok: topic=%s partition=%s offset=%s key=%s",
                msg.topic(), msg.partition(), msg.offset(), msg.key(),
            )

    def publish(self, value: PayloadLike, topic: Optional[str] = None, max_buffer_wait_s: float = 5.0) -> None:
        """
        Publish a single record to Kafka with error handling and logging.
        """
        serialized = self._serialize(value)

        deadline = time.time() + max_buffer_wait_s
        while True:
            try:
                self._producer.produce(
                    topic or self._topic,
                    value=serialized,
                    on_delivery=self._on_delivery,
                )
                break
            except BufferError:
                if time.time() >= deadline:
                    raise RuntimeError("Local producer queue is full and timed out while waiting.")
                self._logger.warning("Kafka local queue full; polling to drain...")
                self._producer.poll(0.1)
            except KafkaException as ex:
                raise RuntimeError(f"Produce failed: {ex}") from ex
            except Exception as ex:
                raise RuntimeError(f"Unexpected produce error: {ex}") from ex

        self._producer.poll(0)

    def publish_many(
        self,
        items: Iterable[PayloadLike],
        *,
        topic: Optional[str] = None,
        max_buffer_wait_s: float = 5.0,
    ) -> None:
        """Enqueue multiple records efficiently with periodic polling."""
        for value in items:
            self.publish(
                value,
                topic=topic,
                max_buffer_wait_s=max_buffer_wait_s,
            )
        self._producer.poll(0)

    def flush(self, timeout: float = 10.0) -> None:
        """Block until all queued messages are delivered or timeout expires."""
        remaining = self._producer.flush(timeout)
        if remaining > 0:
            raise RuntimeError(f"Flush timed out with {remaining} messages still pending delivery.")
        if self._delivery_errors:
            errors = "; ".join(self._delivery_errors)
            self._delivery_errors.clear()
            raise RuntimeError(f"One or more deliveries failed: {errors}")


# if __name__ == "__main__":
#     publisher = KafkaPublisher(
#         bootstrap="localhost:9092",
#         topic="test-topic",
#     )
#     try:
#         publisher.publish({"message": "Hello, Kafka!"})
#         publisher.flush()
#         print("Message published successfully.")
#     except Exception as e:
#         print(f"Failed to publish message: {e}")