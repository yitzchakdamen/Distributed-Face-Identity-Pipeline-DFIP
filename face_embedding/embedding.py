import cv2
import numpy as np
from insightface.app import FaceAnalysis
import logging

logger = logging.getLogger(__name__)

class FaceEmbedding:
    def __init__(self, use_gpu=False):
        """Initialize the face analysis model."""
        provider = 'CUDAExecutionProvider' if use_gpu else 'CPUExecutionProvider'
        self.app = FaceAnalysis(providers=[provider])
        self.__ctx_id = 0 if use_gpu else -1
        self.app.prepare(ctx_id=self.__ctx_id, det_size=(640, 640))

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


