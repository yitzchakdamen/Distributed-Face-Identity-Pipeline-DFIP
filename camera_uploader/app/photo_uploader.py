import cv2
import time
import websocket
from camera_uploader.app.logger import Logger


class CameraUploader:
    """
    CameraUploader captures images from the webcam and sends them as binary data
    directly to a specified FastAPI WebSocket server endpoint.

    Attributes:
        ws_url (str): The WebSocket URL of the FastAPI server to upload images to.
        logger (Logger): Logger instance for logging events and errors.
        ws (websocket.WebSocket): The active WebSocket connection.
    """

    def __init__(self, ws_url: str):
        """
        Initialize the CameraUploader and open WebSocket connection.

        Args:
            ws_url (str): The WebSocket URL of the FastAPI server endpoint.
        """
        self.ws_url = ws_url
        self.logger = Logger.get_logger(__name__)
        self.ws = None
        self.connect()

    def connect(self):
        """Establish a WebSocket connection to the server."""
        try:
            self.ws = websocket.WebSocket()
            self.ws.connect(self.ws_url)
            self.logger.info(f"Connected to WebSocket server at {self.ws_url}")
        except Exception as e:
            self.logger.error(f"Failed to connect to WebSocket server: {e}")
            raise


    @staticmethod
    def encode_image_to_bytes(frame, format_to: str = '.jpg') -> bytes:
        """
        Encode an image frame to binary format (JPEG or PNG).

        Args:
            frame: Image frame (numpy array) captured from OpenCV.
            format_to (str): Image format for encoding ('.jpg', '.png'). Defaults to '.jpg'.

        Returns:
            bytes: Encoded image bytes.

        Raises:
            ValueError: If image encoding fails.
        """
        ret, buffer = cv2.imencode(format_to, frame)
        if not ret:
            raise ValueError("Failed to encode image")
        return buffer.tobytes()

    def send_image(self, frame):
        """
        Encode and send an image frame as binary data to the FastAPI WebSocket server.

        Args:
            frame: Image frame (numpy array) captured from OpenCV.

        Logs response status and errors.
        """
        image_bytes = None
        try:
            image_bytes = self.encode_image_to_bytes(frame)
            self.ws.send(image_bytes, opcode=websocket.ABNF.OPCODE_BINARY)
            response = self.ws.recv()
            self.logger.info(f"Server response: {response}")
            self.logger.info(f"Sent binary image of size {len(image_bytes)} bytes to WebSocket server")
        except websocket.WebSocketConnectionClosedException:
            self.logger.warning("WebSocket connection closed by server. Trying to reconnect...")
            if image_bytes:
                try:
                    self.connect()
                    self.ws.send(image_bytes, opcode=websocket.ABNF.OPCODE_BINARY)
                    response = self.ws.recv()
                    self.logger.info(f"Server response: {response}")
                    self.logger.info("Reconnected and sent image successfully")
                except Exception as reconnect_error:
                    self.logger.error(f"Failed to reconnect and send image: {reconnect_error}")
        except Exception as e:
            self.logger.error(f"Failed to send image over WebSocket: {e}")



    def main(self, interval: int = 1):
        """
        Main loop for capturing and uploading images from the webcam at regular intervals.

        Args:
            interval (int): Time in seconds between captures. Defaults to 1.

        Raises:
            RuntimeError: If the video device cannot be opened.
        """
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
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}")
        finally:
            if self.ws:
                try:
                    self.ws.close()
                    self.logger.info("WebSocket connection closed")
                except Exception as e:
                    self.logger.error(f"Error closing WebSocket: {e}")
            cap.release()
            cv2.destroyAllWindows()