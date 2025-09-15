import unittest
from unittest.mock import Mock, patch, MagicMock, call
import json
from src.kafka_publisher import KafkaPublisher


class TestKafkaPublisher(unittest.TestCase):
    """Test suite for KafkaPublisher class"""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_payload = {
            "face_id": "test-face-123",
            "bbox": (10, 20, 100, 120),
            "width": 100,
            "height": 120,
            "mongo_file_id": "507f1f77bcf86cd799439011",
            "event_ts": "2024-01-01T12:00:00Z"
        }
    
    @patch('src.kafka_publisher.Producer')
    def test_init_default_config(self, mock_producer_class):
        """Test KafkaPublisher initialization with default config"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        # Check that Producer was called
        mock_producer_class.assert_called_once()
        call_args = mock_producer_class.call_args[0][0]
        
        self.assertEqual(call_args['bootstrap.servers'], "localhost:9092")
        self.assertEqual(call_args['enable.idempotence'], True)
        self.assertEqual(call_args['acks'], 'all')
        
        self.assertEqual(publisher._topic, "test-topic")
    
    @patch('src.kafka_publisher.Producer')
    def test_init_with_security(self, mock_producer_class):
        """Test KafkaPublisher initialization with security config"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        security_config = {
            "security.protocol": "SASL_SSL",
            "sasl.username": "user",
            "sasl.password": "pass"
        }
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic",
            security=security_config
        )
        
        call_args = mock_producer_class.call_args[0][0]
        self.assertEqual(call_args['security.protocol'], "SASL_SSL")
        self.assertEqual(call_args['sasl.username'], "user")
        self.assertEqual(call_args['sasl.password'], "pass")
    
    @patch('src.kafka_publisher.Producer')
    def test_init_with_extra_config(self, mock_producer_class):
        """Test KafkaPublisher initialization with extra config"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        extra_config = {
            "batch.size": 16384,
            "linger.ms": 5
        }
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic",
            extra=extra_config
        )
        
        call_args = mock_producer_class.call_args[0][0]
        self.assertEqual(call_args['batch.size'], 16384)
        self.assertEqual(call_args['linger.ms'], 5)
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_dict_payload(self, mock_producer_class):
        """Test publishing dictionary payload"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        publisher.publish(self.test_payload)
        
        # Check that produce was called
        mock_producer.produce.assert_called_once()
        call_args = mock_producer.produce.call_args
        
        self.assertEqual(call_args[0][0], "test-topic")  # topic is first positional arg
        
        # Check that payload was JSON serialized
        sent_data = call_args[1]['value']
        parsed_data = json.loads(sent_data)
        self.assertEqual(parsed_data, self.test_payload)
        
        # Check that poll was called
        mock_producer.poll.assert_called()
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_with_key(self, mock_producer_class):
        """Test publishing with message key"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        test_key = "face-123"
        publisher.publish(self.test_payload, key=test_key)
        
        call_args = mock_producer.produce.call_args
        self.assertEqual(call_args[1]['key'], test_key.encode('utf-8'))
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_string_payload(self, mock_producer_class):
        """Test publishing string payload"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        string_payload = "test message"
        publisher.publish(string_payload)
        
        call_args = mock_producer.produce.call_args
        self.assertEqual(call_args[1]['value'], string_payload.encode('utf-8'))
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_bytes_payload(self, mock_producer_class):
        """Test publishing bytes payload"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        bytes_payload = b"test message bytes"
        publisher.publish(bytes_payload)
        
        call_args = mock_producer.produce.call_args
        self.assertEqual(call_args[1]['value'], bytes_payload)
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_list_payload(self, mock_producer_class):
        """Test publishing list payload"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        list_payload = [1, 2, 3, "test"]
        publisher.publish(list_payload)
        
        call_args = mock_producer.produce.call_args
        sent_data = call_args[1]['value']
        parsed_data = json.loads(sent_data)
        self.assertEqual(parsed_data, list_payload)
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_bulk(self, mock_producer_class):
        """Test bulk publishing"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        payloads = [
            {"id": 1, "data": "test1"},
            {"id": 2, "data": "test2"},
            {"id": 3, "data": "test3"}
        ]
        
        publisher.publish_many(payloads)
        
        # Check that produce was called for each payload
        self.assertEqual(mock_producer.produce.call_count, 3)
        
        # Check that poll was called
        mock_producer.poll.assert_called()
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_bulk_with_keys(self, mock_producer_class):
        """Test bulk publishing with keys"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        payloads = [
            {"id": 1, "data": "test1"},
            {"id": 2, "data": "test2"}
        ]
        keys = ["key1", "key2"]
        
        publisher.publish_bulk(payloads, keys=keys)
        
        # Check produce calls
        produce_calls = mock_producer.produce.call_args_list
        self.assertEqual(len(produce_calls), 2)
        
        # Check first call
        self.assertEqual(produce_calls[0][1]['key'], b"key1")
        
        # Check second call
        self.assertEqual(produce_calls[1][1]['key'], b"key2")
    
    @patch('src.kafka_publisher.Producer')
    def test_publish_bulk_mismatched_keys(self, mock_producer_class):
        """Test bulk publishing with mismatched keys length"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        payloads = [{"id": 1}, {"id": 2}]
        keys = ["key1"]  # Less keys than payloads
        
        with self.assertRaises(ValueError) as context:
            publisher.publish_bulk(payloads, keys=keys)
        
        self.assertIn("Number of keys must match", str(context.exception))
    
    @patch('src.kafka_publisher.Producer')
    def test_close(self, mock_producer_class):
        """Test flushing the publisher"""
        mock_producer = Mock()
        mock_producer_class.return_value = mock_producer
        
        publisher = KafkaPublisher(
            bootstrap="localhost:9092",
            topic="test-topic"
        )
        
        publisher.flush()
        
        # Check that flush was called
        mock_producer.flush.assert_called()


if __name__ == '__main__':
    unittest.main()
