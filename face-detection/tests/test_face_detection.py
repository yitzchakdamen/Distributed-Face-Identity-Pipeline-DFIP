import unittest
import tempfile
import os
import cv2
import numpy as np
from datetime import datetime, timezone
from src.face_detection import FaceExtractor, FaceObject, NoFacesFoundError


class TestFaceExtractor(unittest.TestCase):
    """Test suite for FaceExtractor class"""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.extractor = FaceExtractor()
        
        # Create a simple test image with a face-like rectangle
        self.test_image = np.zeros((200, 200, 3), dtype=np.uint8)
        # Add a white rectangle that might be detected as a face
        cv2.rectangle(self.test_image, (50, 50), (150, 150), (255, 255, 255), -1)
        
        # Create a temporary image file
        self.temp_image = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(self.temp_image.name, self.test_image)
        self.temp_image.close()
        
    def tearDown(self):
        """Clean up after each test method."""
        if os.path.exists(self.temp_image.name):
            os.unlink(self.temp_image.name)
    
    def test_init_default_parameters(self):
        """Test FaceExtractor initialization with default parameters"""
        extractor = FaceExtractor()
        self.assertEqual(extractor.scale_factor, 1.1)
        self.assertEqual(extractor.min_neighbors, 5)
        self.assertEqual(extractor.min_size, (30, 30))
        self.assertEqual(extractor.encode_format, ".png")
        self.assertIsNotNone(extractor.cascade)
    
    def test_init_custom_parameters(self):
        """Test FaceExtractor initialization with custom parameters"""
        extractor = FaceExtractor(
            scale_factor=1.2,
            min_neighbors=3,
            min_size=(40, 40),
            encode_format=".jpg"
        )
        self.assertEqual(extractor.scale_factor, 1.2)
        self.assertEqual(extractor.min_neighbors, 3)
        self.assertEqual(extractor.min_size, (40, 40))
        self.assertEqual(extractor.encode_format, ".jpg")
    
    def test_init_invalid_format(self):
        """Test FaceExtractor initialization with invalid format"""
        with self.assertRaises(ValueError):
            FaceExtractor(encode_format=".gif")
    
    def test_extract_faces_from_file_path(self):
        """Test face extraction from file path"""
        faces = self.extractor.extract_faces(self.temp_image.name)
        self.assertIsInstance(faces, list)
        # Note: This test image might not actually contain detectable faces
        # so we just check that the method runs without error
    
    def test_extract_faces_from_numpy_array(self):
        """Test face extraction from numpy array"""
        faces = self.extractor.extract_faces(self.test_image)
        self.assertIsInstance(faces, list)
    
    def test_extract_faces_from_bytes(self):
        """Test face extraction from image bytes"""
        with open(self.temp_image.name, 'rb') as f:
            image_bytes = f.read()
        faces = self.extractor.extract_faces(image_bytes)
        self.assertIsInstance(faces, list)
    
    def test_extract_faces_with_source_hint(self):
        """Test face extraction with source hint"""
        faces = self.extractor.extract_faces(self.temp_image.name, source_hint="test_image")
        for face in faces:
            self.assertEqual(face.source_hint, "test_image")
    
    def test_extract_faces_with_max_faces(self):
        """Test face extraction with max_faces limit"""
        faces = self.extractor.extract_faces(self.temp_image.name, max_faces=2)
        self.assertLessEqual(len(faces), 2)
    
    def test_to_bgr_with_numpy_array(self):
        """Test _to_bgr with numpy array input"""
        result = FaceExtractor._to_bgr(self.test_image)
        self.assertEqual(result.shape, self.test_image.shape)
        np.testing.assert_array_equal(result, self.test_image)
    
    def test_to_bgr_with_gray_image(self):
        """Test _to_bgr with grayscale image"""
        gray_image = np.zeros((100, 100), dtype=np.uint8)
        result = FaceExtractor._to_bgr(gray_image)
        self.assertEqual(len(result.shape), 3)
        self.assertEqual(result.shape[2], 3)
    
    def test_to_bgr_with_invalid_input(self):
        """Test _to_bgr with invalid input"""
        with self.assertRaises(ValueError):
            FaceExtractor._to_bgr("nonexistent_file.jpg")
        
        with self.assertRaises(ValueError):
            FaceExtractor._to_bgr(123)  # Invalid type
    
    def test_stable_uuid_consistency(self):
        """Test that create_stable_face_id produces consistent results"""
        from utils.id_creator import create_stable_face_id
        content = b"test content"
        uuid1 = create_stable_face_id(content)
        uuid2 = create_stable_face_id(content)
        self.assertEqual(uuid1, uuid2)
    
    def test_stable_uuid_different_content(self):
        """Test that create_stable_face_id produces different results for different content"""
        from utils.id_creator import create_stable_face_id
        content1 = b"test content 1"
        content2 = b"test content 2"
        uuid1 = create_stable_face_id(content1)
        uuid2 = create_stable_face_id(content2)
        self.assertNotEqual(uuid1, uuid2)


class TestFaceObject(unittest.TestCase):
    """Test suite for FaceObject dataclass"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.face_data = {
            'face_id': 'test-uuid-123',
            'bbox': (10, 20, 100, 120),
            'width': 100,
            'height': 120,
            'content_type': 'image/png',
            'image_bytes': b'fake_image_data',
            'timestamp_utc': datetime.now(timezone.utc).isoformat(),
            'source_hint': 'test_image.jpg'
        }
    
    def test_face_object_creation(self):
        """Test FaceObject creation"""
        face = FaceObject(**self.face_data)
        self.assertEqual(face.face_id, 'test-uuid-123')
        self.assertEqual(face.bbox, (10, 20, 100, 120))
        self.assertEqual(face.width, 100)
        self.assertEqual(face.height, 120)
        self.assertEqual(face.content_type, 'image/png')
        self.assertEqual(face.image_bytes, b'fake_image_data')
        self.assertEqual(face.source_hint, 'test_image.jpg')
    
    def test_face_object_immutable(self):
        """Test that FaceObject is immutable (frozen dataclass)"""
        face = FaceObject(**self.face_data)
        with self.assertRaises(AttributeError):
            face.face_id = 'new-id'
    
    def test_to_dict(self):
        """Test FaceObject to_dict method"""
        face = FaceObject(**self.face_data)
        result_dict = face.to_dict()
        
        self.assertEqual(result_dict['face_id'], self.face_data['face_id'])
        self.assertEqual(result_dict['bbox'], self.face_data['bbox'])
        self.assertEqual(result_dict['width'], self.face_data['width'])
        self.assertEqual(result_dict['height'], self.face_data['height'])
        self.assertEqual(result_dict['content_type'], self.face_data['content_type'])
        self.assertEqual(result_dict['image_bytes'], self.face_data['image_bytes'])
        self.assertEqual(result_dict['source_hint'], self.face_data['source_hint'])


if __name__ == '__main__':
    unittest.main()
