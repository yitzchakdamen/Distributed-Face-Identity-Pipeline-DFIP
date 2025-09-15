import unittest
from utils.config import LOGGER_NAME, MONGO_URI, MONGODB_DB_NAME
from utils.id_creator import create_unique_id
import os


class TestConfig(unittest.TestCase):
    """Test suite for configuration module"""
    
    def test_logger_name_default(self):
        """Test logger name default value"""
        # Clear environment variable if it exists
        if 'LOGGER_NAME' in os.environ:
            del os.environ['LOGGER_NAME']
        
        # Reload config module to get default value
        import importlib
        from utils import config
        importlib.reload(config)
        
        self.assertEqual(config.LOGGER_NAME, "logger")
    
    def test_logger_name_from_env(self):
        """Test logger name from environment variable"""
        os.environ['LOGGER_NAME'] = "test_logger"
        
        # Reload config module to get environment value
        import importlib
        from utils import config
        importlib.reload(config)
        
        self.assertEqual(config.LOGGER_NAME, "test_logger")
        
        # Clean up
        del os.environ['LOGGER_NAME']
    
    def test_mongo_uri_default(self):
        """Test MongoDB URI default value"""
        # Clear environment variable if it exists
        if 'MONGO_URI' in os.environ:
            del os.environ['MONGO_URI']
        
        # Reload config module to get default value
        import importlib
        from utils import config
        importlib.reload(config)
        
        self.assertEqual(config.MONGO_URI, "localhost:27017")
    
    def test_mongo_uri_from_env(self):
        """Test MongoDB URI from environment variable"""
        test_uri = "mongodb://test-host:27017"
        os.environ['MONGO_URI'] = test_uri
        
        # Reload config module to get environment value
        import importlib
        from utils import config
        importlib.reload(config)
        
        self.assertEqual(config.MONGO_URI, test_uri)
        
        # Clean up
        del os.environ['MONGO_URI']
    
    def test_mongodb_db_name_default(self):
        """Test MongoDB database name default value"""
        # Clear environment variable if it exists
        if 'MONGODB_DB_NAME' in os.environ:
            del os.environ['MONGODB_DB_NAME']
        
        # Reload config module to get default value
        import importlib
        from utils import config
        importlib.reload(config)
        
        self.assertEqual(config.MONGODB_DB_NAME, "test-db")
    
    def test_mongodb_db_name_from_env(self):
        """Test MongoDB database name from environment variable"""
        test_db = "production_db"
        os.environ['MONGODB_DB_NAME'] = test_db
        
        # Reload config module to get environment value
        import importlib
        from utils import config
        importlib.reload(config)
        
        self.assertEqual(config.MONGODB_DB_NAME, test_db)
        
        # Clean up
        del os.environ['MONGODB_DB_NAME']


class TestIdCreator(unittest.TestCase):
    """Test suite for ID creator utility"""
    
    def test_create_unique_id_format(self):
        """Test that create_unique_id returns proper UUID format"""
        unique_id = create_unique_id()
        
        # Check that it's a string
        self.assertIsInstance(unique_id, str)
        
        # Check that it has the right length (UUID4 format: 8-4-4-4-12)
        self.assertEqual(len(unique_id), 36)
        
        # Check that it has the right number of hyphens
        self.assertEqual(unique_id.count('-'), 4)
        
        # Check format pattern (basic validation)
        parts = unique_id.split('-')
        self.assertEqual(len(parts), 5)
        self.assertEqual(len(parts[0]), 8)
        self.assertEqual(len(parts[1]), 4)
        self.assertEqual(len(parts[2]), 4)
        self.assertEqual(len(parts[3]), 4)
        self.assertEqual(len(parts[4]), 12)
    
    def test_create_unique_id_uniqueness(self):
        """Test that create_unique_id generates unique values"""
        ids = set()
        
        # Generate 100 IDs and check they're all unique
        for _ in range(100):
            new_id = create_unique_id()
            self.assertNotIn(new_id, ids, "Generated duplicate ID")
            ids.add(new_id)
    
    def test_create_unique_id_valid_uuid(self):
        """Test that create_unique_id generates valid UUID"""
        import uuid
        
        for _ in range(10):
            generated_id = create_unique_id()
            
            # This should not raise an exception if it's a valid UUID
            try:
                uuid.UUID(generated_id)
            except ValueError:
                self.fail(f"Generated ID '{generated_id}' is not a valid UUID")


if __name__ == '__main__':
    unittest.main()
