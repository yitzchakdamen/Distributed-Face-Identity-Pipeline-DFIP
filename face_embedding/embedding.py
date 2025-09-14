import cv2
import numpy as np
from insightface.app import FaceAnalysis
import logging

logger = logging.getLogger(__name__)

class FaceEmbedding:
    def __init__(self):
        """Initialize the face analysis model."""
        provider = 'CPUExecutionProvider'
        self.app = FaceAnalysis(providers=[provider])
        self.app.prepare(ctx_id=-1, det_size=(320, 320))

    def extract_embedding(self, image_bytes: bytes) -> np.ndarray:
        """Extract face embedding from image bytes."""
        try:
            np_arr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("Cannot decode image bytes")
            faces = self.app.get(image)
            if not faces:
                raise ValueError("No face detected")
            logger.info(f"Extracted embedding of shape: {faces[0].embedding.shape}")
            return faces[0].embedding
        except Exception as e:
            logger.error(f"Error extracting embedding: {e}")
            raise 

