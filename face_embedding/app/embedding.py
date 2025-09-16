import cv2
import numpy as np
from insightface.app import FaceAnalysis
from face_embedding.app.logger import Logger



class FaceEmbedding:
    """
    Handles face embedding extraction using the insightface library.

    Attributes:
        app (FaceAnalysis): The face analysis model instance.
    """

    def __init__(self):
        """
        Initialize the face analysis model with CPU provider and prepare it for inference.
        """
        provider = 'CPUExecutionProvider'
        self.app = FaceAnalysis(providers=[provider])
        self.app.prepare(ctx_id=-1, det_size=(320, 320))
        self.logger = Logger.get_logger(__name__)
        self.logger.info("FaceEmbedding model initialized.")


    def extract_embedding(self, image_bytes: bytes) -> np.ndarray:
        """
        Extract face embedding from image bytes.

        Args:
            image_bytes (bytes): The image data as bytes (e.g., JPEG/PNG encoded).

        Returns:
            np.ndarray: The embedding vector of the detected face.

        Raises:
            ValueError: If the image cannot be decoded or no face is detected.
            Exception: For any other error during extraction.
        """
        try:
            np_arr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("Cannot decode image bytes")
            faces = self.app.get(image)
            if not faces:
                raise ValueError("No face detected")
            self.logger.info(f"Extracted embedding of shape: {faces[0].embedding.shape}")
            return faces[0].embedding
        except Exception as e:
            self.logger.error(f"Error extracting embedding: {e}")
            raise 

