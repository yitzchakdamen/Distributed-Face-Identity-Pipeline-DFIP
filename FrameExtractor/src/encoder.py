import cv2
import base64
from FrameExtractor.src.config.EncoderConfig import EncoderConfig as config

class Encoder:
    @staticmethod
    def frame_encode(_frame):
        _, buffer = cv2.imencode(config.FORMAT, _frame)
        return base64.b64encode(buffer)