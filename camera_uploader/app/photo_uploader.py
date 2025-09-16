import cv2
import base64
import requests
import time
from camera_uploader.app import config
from camera_uploader.app.logger import Logger



class CameraUploader:
    """
    CameraUploader captures images from the webcam, encodes them in base64,
    and sends them to a specified FastAPI server endpoint.
    """
    def __init__(self, server_url: str):
        self.server_url = server_url
        self.logger = Logger.get_logger(__name__)

    @staticmethod
    def encode_image_to_base64(frame, format_to: str = '.jpg') -> str:
        ret, buffer = cv2.imencode(format_to, frame)
        if not ret:
            raise ValueError("Failed to encode image")

        b64_string = base64.b64encode(buffer).decode('utf-8')

        mime_type = 'jpeg' if format_to == '.jpg' else 'png' if format_to == '.png' else 'octet-stream'
        return f"data:image/{mime_type};base64,{b64_string}"

    def send_image(self, frame):
        try:
            b64_image = self.encode_image_to_base64(frame)
            payload = {"image": b64_image}
            response = requests.post(self.server_url, json=payload)
            self.logger.info(f"Sent image, got response: {response.status_code} - {response.text}")
        except Exception as e:
            self.logger.error(f"Failed to send image: {e}")
            
    def main(self, interval: int = 1):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise RuntimeError("Could not open video device")

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    self.logger.error("Failed to capture frame")
                    break

                self.send_image(frame)
                time.sleep(interval)  
        except KeyboardInterrupt:
            self.logger.info("Stopped by user.")
        finally:
            cap.release()
            cv2.destroyAllWindows()
