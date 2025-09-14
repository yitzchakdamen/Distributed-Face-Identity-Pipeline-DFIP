import unittest
from unittest.mock import Mock, patch, MagicMock
import tempfile
import os
from app.main import FaceDetectionApp


class TestFaceDetectionApp(unittest.TestCase):
    """Integration test suite for FaceDetectionApp"""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Create a temporary test image file
        self.test_image = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        self.test_image.write(b"fake_image_data_for_testing")
        self.test_image.close()
    
    def tearDown(self):
        """Clean up after each test method."""
        if os.path.exists(self.test_image.name):
            os.unlink(self.test_image.name)
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher') 
    @patch('app.main.FaceExtractor')
    def test_init_components(self, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test FaceDetectionApp initialization"""
        app = FaceDetectionApp()
        
        # Check that all components were initialized
        mock_face_extractor.assert_called_once()
        mock_mongo_writer.assert_called_once()
        mock_kafka_publisher.assert_called_once()
        
        # Check MongoDB writer initialization parameters
        mongo_call_args = mock_mongo_writer.call_args
        self.assertIn('uri', mongo_call_args[1])
        self.assertIn('db_name', mongo_call_args[1])
        self.assertEqual(mongo_call_args[1]['bucket_name'], "faces")
        
        # Check Kafka publisher initialization parameters
        kafka_call_args = mock_kafka_publisher.call_args
        self.assertEqual(kafka_call_args[1]['bootstrap'], "localhost:9092")
        self.assertEqual(kafka_call_args[1]['topic'], "detected-faces")
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher')
    @patch('app.main.FaceExtractor')
    def test_process_image_success(self, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test successful image processing"""
        # Set up mocks
        mock_face_obj = Mock()
        mock_face_obj.face_id = "test-face-123"
        mock_face_obj.image_bytes = b"fake_face_data"
        mock_face_obj.timestamp_utc = "2024-01-01T12:00:00Z"
        mock_face_obj.bbox = (10, 20, 100, 120)
        mock_face_obj.width = 100
        mock_face_obj.height = 120
        
        mock_extractor_instance = Mock()
        mock_extractor_instance.extract_faces.return_value = [mock_face_obj]
        mock_face_extractor.return_value = mock_extractor_instance
        
        mock_mongo_instance = Mock()
        mock_mongo_instance.insert_image.return_value = "mock_object_id_123"
        mock_mongo_writer.return_value = mock_mongo_instance
        
        mock_kafka_instance = Mock()
        mock_kafka_publisher.return_value = mock_kafka_instance
        
        # Create app and process image
        app = FaceDetectionApp()
        app.process_image(self.test_image.name)
        
        # Verify face extraction was called
        mock_extractor_instance.extract_faces.assert_called_once_with(self.test_image.name)
        
        # Verify MongoDB insertion was called
        mock_mongo_instance.insert_image.assert_called_once()
        mongo_call_args = mock_mongo_instance.insert_image.call_args[0][0]
        self.assertEqual(mongo_call_args['image'], b"fake_face_data")
        self.assertEqual(mongo_call_args['image_id'], "test-face-123")
        self.assertEqual(mongo_call_args['event_ts'], "2024-01-01T12:00:00Z")
        
        # Verify Kafka publishing was called
        mock_kafka_instance.publish.assert_called_once()
        kafka_call_args = mock_kafka_instance.publish.call_args[0][0]
        self.assertEqual(kafka_call_args['face_id'], "test-face-123")
        self.assertEqual(kafka_call_args['bbox'], (10, 20, 100, 120))
        self.assertEqual(kafka_call_args['width'], 100)
        self.assertEqual(kafka_call_args['height'], 120)
        self.assertEqual(kafka_call_args['mongo_file_id'], "mock_object_id_123")
        self.assertEqual(kafka_call_args['event_ts'], "2024-01-01T12:00:00Z")
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher')
    @patch('app.main.FaceExtractor')
    def test_process_image_multiple_faces(self, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test processing image with multiple faces"""
        # Create multiple mock face objects
        mock_faces = []
        for i in range(3):
            mock_face = Mock()
            mock_face.face_id = f"test-face-{i}"
            mock_face.image_bytes = f"fake_face_data_{i}".encode()
            mock_face.timestamp_utc = "2024-01-01T12:00:00Z"
            mock_face.bbox = (i*10, i*20, 100, 120)
            mock_face.width = 100
            mock_face.height = 120
            mock_faces.append(mock_face)
        
        mock_extractor_instance = Mock()
        mock_extractor_instance.extract_faces.return_value = mock_faces
        mock_face_extractor.return_value = mock_extractor_instance
        
        mock_mongo_instance = Mock()
        mock_mongo_instance.insert_image.side_effect = [f"object_id_{i}" for i in range(3)]
        mock_mongo_writer.return_value = mock_mongo_instance
        
        mock_kafka_instance = Mock()
        mock_kafka_publisher.return_value = mock_kafka_instance
        
        # Create app and process image
        app = FaceDetectionApp()
        app.process_image(self.test_image.name)
        
        # Verify MongoDB insertion was called 3 times
        self.assertEqual(mock_mongo_instance.insert_image.call_count, 3)
        
        # Verify Kafka publishing was called 3 times
        self.assertEqual(mock_kafka_instance.publish.call_count, 3)
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher')
    @patch('app.main.FaceExtractor')
    def test_process_image_no_faces(self, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test processing image with no faces detected"""
        mock_extractor_instance = Mock()
        mock_extractor_instance.extract_faces.return_value = []  # No faces
        mock_face_extractor.return_value = mock_extractor_instance
        
        mock_mongo_instance = Mock()
        mock_mongo_writer.return_value = mock_mongo_instance
        
        mock_kafka_instance = Mock()
        mock_kafka_publisher.return_value = mock_kafka_instance
        
        # Create app and process image
        app = FaceDetectionApp()
        app.process_image(self.test_image.name)
        
        # Verify face extraction was called
        mock_extractor_instance.extract_faces.assert_called_once_with(self.test_image.name)
        
        # Verify MongoDB and Kafka were not called since no faces detected
        mock_mongo_instance.insert_image.assert_not_called()
        mock_kafka_instance.publish.assert_not_called()
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher')
    @patch('app.main.FaceExtractor')
    @patch('app.main.logger')
    def test_process_image_extraction_error(self, mock_logger, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test handling of face extraction errors"""
        mock_extractor_instance = Mock()
        mock_extractor_instance.extract_faces.side_effect = Exception("Face extraction failed")
        mock_face_extractor.return_value = mock_extractor_instance
        
        mock_mongo_instance = Mock()
        mock_mongo_writer.return_value = mock_mongo_instance
        
        mock_kafka_instance = Mock()
        mock_kafka_publisher.return_value = mock_kafka_instance
        
        # Create app and process image
        app = FaceDetectionApp()
        app.process_image(self.test_image.name)
        
        # Verify error was logged
        mock_logger.error.assert_called()
        error_message = mock_logger.error.call_args[0][0]
        self.assertIn("Error processing image", error_message)
        self.assertIn("Face extraction failed", error_message)
        
        # Verify MongoDB and Kafka were not called due to error
        mock_mongo_instance.insert_image.assert_not_called()
        mock_kafka_instance.publish.assert_not_called()
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher')
    @patch('app.main.FaceExtractor')
    @patch('app.main.logger')
    def test_process_image_mongo_error(self, mock_logger, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test handling of MongoDB insertion errors"""
        mock_face_obj = Mock()
        mock_face_obj.face_id = "test-face-123"
        mock_face_obj.image_bytes = b"fake_face_data"
        mock_face_obj.timestamp_utc = "2024-01-01T12:00:00Z"
        mock_face_obj.bbox = (10, 20, 100, 120)
        mock_face_obj.width = 100
        mock_face_obj.height = 120
        
        mock_extractor_instance = Mock()
        mock_extractor_instance.extract_faces.return_value = [mock_face_obj]
        mock_face_extractor.return_value = mock_extractor_instance
        
        mock_mongo_instance = Mock()
        mock_mongo_instance.insert_image.side_effect = Exception("MongoDB connection failed")
        mock_mongo_writer.return_value = mock_mongo_instance
        
        mock_kafka_instance = Mock()
        mock_kafka_publisher.return_value = mock_kafka_instance
        
        # Create app and process image
        app = FaceDetectionApp()
        app.process_image(self.test_image.name)
        
        # Verify error was logged
        mock_logger.error.assert_called()
        error_message = mock_logger.error.call_args[0][0]
        self.assertIn("Error processing image", error_message)
        self.assertIn("MongoDB connection failed", error_message)
    
    @patch('app.main.SimpleGridFSWriter')
    @patch('app.main.KafkaPublisher')
    @patch('app.main.FaceExtractor')
    @patch('app.main.logger')
    def test_process_image_kafka_error(self, mock_logger, mock_face_extractor, mock_kafka_publisher, mock_mongo_writer):
        """Test handling of Kafka publishing errors"""
        mock_face_obj = Mock()
        mock_face_obj.face_id = "test-face-123"
        mock_face_obj.image_bytes = b"fake_face_data"
        mock_face_obj.timestamp_utc = "2024-01-01T12:00:00Z"
        mock_face_obj.bbox = (10, 20, 100, 120)
        mock_face_obj.width = 100
        mock_face_obj.height = 120
        
        mock_extractor_instance = Mock()
        mock_extractor_instance.extract_faces.return_value = [mock_face_obj]
        mock_face_extractor.return_value = mock_extractor_instance
        
        mock_mongo_instance = Mock()
        mock_mongo_instance.insert_image.return_value = "mock_object_id_123"
        mock_mongo_writer.return_value = mock_mongo_instance
        
        mock_kafka_instance = Mock()
        mock_kafka_instance.publish.side_effect = Exception("Kafka broker unavailable")
        mock_kafka_publisher.return_value = mock_kafka_instance
        
        # Create app and process image
        app = FaceDetectionApp()
        app.process_image(self.test_image.name)
        
        # Verify MongoDB insertion succeeded
        mock_mongo_instance.insert_image.assert_called_once()
        
        # Verify Kafka publishing was attempted
        mock_kafka_instance.publish.assert_called_once()
        
        # Verify error was logged
        mock_logger.error.assert_called()
        error_message = mock_logger.error.call_args[0][0]
        self.assertIn("Error processing image", error_message)
        self.assertIn("Kafka broker unavailable", error_message)


if __name__ == '__main__':
    unittest.main()
