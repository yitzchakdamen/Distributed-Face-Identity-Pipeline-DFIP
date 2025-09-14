import json
import logging
import time
from typing import Any, Dict, Iterable, List, Optional, Tuple, Union
from utils.config import LOGGER_NAME
from confluent_kafka import Producer, KafkaException, KafkaError

logger = logging.getlogger(LOGGER_NAME)
JSONLike = Union[Dict[str, Any], List[Any]]
PayloadLike = Union[JSONLike, str, bytes]


class KafkaPublisher:
    """High-reliability JSON/bytes publisher built on confluent_kafka.Producer.

    This publisher configures idempotent delivery, full acknowledgments,
    and safe in-flight ordering. It exposes a clear API for single and bulk
    publishing with explicit error reporting through logs and raised exceptions.

    Example:
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="events"
        )
        publisher.publish({"id": 1, "event": "hello"}, key="1")
        publisher.flush()
    """

    def __init__(
        self,
        bootstrap: str,
        topic: str,
        *,
        security: Optional[Dict[str, str]] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Initialize the publisher with safe defaults and optional security.

        Args:
            bootstrap: Kafka bootstrap servers string (e.g., "localhost:9092").
            topic: Default topic to publish to.
            logger: Optional logger instance; if None, a module logger is created.
            security: Optional security properties (e.g., SASL/SSL for cloud clusters).
            extra: Optional advanced librdkafka overrides.
        """
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
        """Serialize payload to bytes (UTF-8 for str/JSON, passthrough for bytes).

        Args:
            value: JSON-like object, str, or bytes.

        Returns:
            UTF-8 encoded bytes.
        """
        if isinstance(value, bytes):
            return value
        if isinstance(value, str):
            return value.encode("utf-8")
        return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    def _on_delivery(self, err: Optional[KafkaError], msg) -> None:
        """Delivery callback that records and logs failures in detail.

        Args:
            err: KafkaError or None.
            msg: The message object delivered or failed to deliver.
        """
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

    def publish(
        self,
        value: PayloadLike,
        *,
        key: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
        topic: Optional[str] = None,
        max_buffer_wait_s: float = 5.0,
    ) -> None:
        """Enqueue a single record for delivery and poll the producer.

        Args:
            value: JSON-like object, str, or bytes to publish.
            key: Optional partitioning key for ordering within a partition.
            headers: Optional message headers as a dict of str->str.
            topic: Optional override for the target topic; defaults to the ctor topic.
            max_buffer_wait_s: Maximum time to wait if the local queue is full.

        Raises:
            RuntimeError: On immediate produce errors (non-buffer) or after buffer wait timeout.
        """
        serialized = self._serialize(value)
        headers_list = [(k, v.encode("utf-8")) for k, v in (headers or {}).items()]

        deadline = time.time() + max_buffer_wait_s
        while True:
            try:
                self._producer.produce(
                    topic or self._topic,
                    value=serialized,
                    key=key,
                    headers=headers_list if headers_list else None,
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
        items: Iterable[Tuple[PayloadLike, Optional[str], Optional[Dict[str, str]]]],
        *,
        topic: Optional[str] = None,
        max_buffer_wait_s: float = 5.0,
    ) -> None:
        """Enqueue multiple records efficiently with periodic polling.

        Args:
            items: Iterable of (value, key, headers) tuples.
            topic: Optional override for the target topic per batch call.
            max_buffer_wait_s: Maximum time to wait if the local queue is full.

        Raises:
            RuntimeError: If the local queue remains full beyond the timeout or on produce errors.
        """
        for value, key, headers in items:
            self.publish(
                value,
                key=key,
                headers=headers,
                topic=topic,
                max_buffer_wait_s=max_buffer_wait_s,
            )
        self._producer.poll(0)

    def flush(self, timeout: float = 10.0) -> None:
        """Block until all queued messages are delivered or timeout expires.

        Args:
            timeout: Maximum time in seconds to wait for outstanding deliveries.

        Raises:
            RuntimeError: If any delivery errors were recorded during callbacks.
        """
        remaining = self._producer.flush(timeout)
        if remaining > 0:
            raise RuntimeError(f"Flush timed out with {remaining} messages still pending delivery.")
        if self._delivery_errors:
            errors = "; ".join(self._delivery_errors)
            self._delivery_errors.clear()
            raise RuntimeError(f"One or more deliveries failed: {errors}")
