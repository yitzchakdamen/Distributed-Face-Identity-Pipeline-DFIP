import unittest
from unittest.mock import Mock, patch, MagicMock
from bson import ObjectId
import tempfile
import os
from src.mongo_dal import SimpleGridFSWriter


class TestSimpleGridFSWriter(unittest.TestCase):
    """Test suite for SimpleGridFSWriter class"""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Mock MongoDB components
        self.mock_client = Mock()
        self.mock_db = Mock()
        self.mock_fs = Mock()
        
        # Create a temporary test file
        self.test_file = tempfile.NamedTemporaryFile(delete=False)
        self.test_file.write(b"test image data")
        self.test_file.close()
        
        self.test_payload = {
            "image": b"test_image_bytes",
            "image_id": "test-face-123",
            "event_ts": "2024-01-01T12:00:00Z"
        }
    
    def tearDown(self):
        """Clean up after each test method."""
        if os.path.exists(self.test_file.name):
            os.unlink(self.test_file.name)
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_init_connection(self, mock_gridfs, mock_mongo_client):
        """Test SimpleGridFSWriter initialization"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db",
            bucket_name="test_bucket"
        )
        
        mock_mongo_client.assert_called_once_with("mongodb://localhost:27017")
        mock_gridfs.assert_called_once()
        self.assertIsNotNone(writer)
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_insert_image_with_bytes(self, mock_gridfs, mock_mongo_client):
        """Test inserting image with bytes payload"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        # Mock GridFS put method to return an ObjectId
        expected_object_id = ObjectId()
        self.mock_fs.put.return_value = expected_object_id
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        result = writer.insert_image(self.test_payload)
        
        self.assertEqual(result, expected_object_id)
        self.mock_fs.put.assert_called_once()
        
        # Check the arguments passed to put
        call_args = self.mock_fs.put.call_args
        self.assertEqual(call_args[0][0], b"test_image_bytes")  # image bytes
        self.assertEqual(call_args[1]['filename'], "test-face-123")
        self.assertEqual(call_args[1]['metadata']['ext_id'], "test-face-123")
        self.assertEqual(call_args[1]['metadata']['event_ts'], "2024-01-01T12:00:00Z")
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_insert_image_with_file_path(self, mock_gridfs, mock_mongo_client):
        """Test inserting image with file path"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        expected_object_id = ObjectId()
        self.mock_fs.put.return_value = expected_object_id
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        payload_with_file = {
            "image": self.test_file.name,
            "image_id": "test-face-456",
            "event_ts": "2024-01-01T12:00:00Z"
        }
        
        result = writer.insert_image(payload_with_file)
        
        self.assertEqual(result, expected_object_id)
        self.mock_fs.put.assert_called_once()
        
        # Check that file content was read
        call_args = self.mock_fs.put.call_args
        self.assertEqual(call_args[0][0], b"test image data")
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_insert_image_missing_required_keys(self, mock_gridfs, mock_mongo_client):
        """Test insert_image with missing required keys"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        # Test missing image_id
        incomplete_payload = {
            "image": b"test_data",
            "event_ts": "2024-01-01T12:00:00Z"
        }
        
        with self.assertRaises(ValueError) as context:
            writer.insert_image(incomplete_payload)
        
        self.assertIn("missing required keys", str(context.exception))
        self.assertIn("image_id", str(context.exception))
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_insert_image_invalid_file_path(self, mock_gridfs, mock_mongo_client):
        """Test insert_image with invalid file path"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        payload_with_invalid_file = {
            "image": "/nonexistent/file.jpg",
            "image_id": "test-face-789",
            "event_ts": "2024-01-01T12:00:00Z"
        }
        
        with self.assertRaises(ValueError) as context:
            writer.insert_image(payload_with_invalid_file)
        
        self.assertIn("Image normalization failed", str(context.exception))
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_read_image_bytes_with_bytes(self, mock_gridfs, mock_mongo_client):
        """Test _read_image_bytes with bytes input"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        test_bytes = b"test image data"
        result = writer._read_image_bytes(test_bytes)
        self.assertEqual(result, test_bytes)
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_read_image_bytes_with_bytearray(self, mock_gridfs, mock_mongo_client):
        """Test _read_image_bytes with bytearray input"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        test_bytearray = bytearray(b"test image data")
        result = writer._read_image_bytes(test_bytearray)
        self.assertEqual(result, b"test image data")
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_read_image_bytes_with_file_path(self, mock_gridfs, mock_mongo_client):
        """Test _read_image_bytes with file path"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        result = writer._read_image_bytes(self.test_file.name)
        self.assertEqual(result, b"test image data")
    
    @patch('src.mongo_dal.MongoClient')
    @patch('src.mongo_dal.gridfs.GridFS')
    def test_read_image_bytes_invalid_type(self, mock_gridfs, mock_mongo_client):
        """Test _read_image_bytes with invalid input type"""
        mock_mongo_client.return_value = self.mock_client
        mock_gridfs.return_value = self.mock_fs
        
        writer = SimpleGridFSWriter(
            uri="mongodb://localhost:27017",
            db_name="test_db"
        )
        
        with self.assertRaises(ValueError) as context:
            writer._read_image_bytes(123)  # Invalid type
        
        self.assertIn("must be bytes-like or a file path string", str(context.exception))


if __name__ == '__main__':
    unittest.main()
