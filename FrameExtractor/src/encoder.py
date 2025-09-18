
# encoder.py - Encodes video frames to base64 for transmission/storage
import cv2
import base64
from FrameExtractor.src.config.EncoderConfig import EncoderConfig as config

class Encoder:
    """
    Provides static method to encode frames as base64 strings.
    """
    @staticmethod
    def frame_encode(_frame):
        """
        Encodes a frame using the specified format and returns base64 bytes.
        """
        _, buffer = cv2.imencode(config.FORMAT, _frame)
        return base64.b64encode(buffer)