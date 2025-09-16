
"""
API module for image upload and processing in the face_detection service.

Provides a FastAPI endpoint for receiving base64-encoded images, decoding, and processing them using FaceDetectionApp.
Logs all operations and errors using the project logger.
"""

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import base64
import re
from face_detection.utils.logger import Logger
from face_detection.app.main import FaceDetectionApp

app = FastAPI()
face_detection_app = FaceDetectionApp()
logger = Logger.get_logger(__name__)


class ImageData(BaseModel):
    """
    Pydantic model for receiving base64-encoded image data in the request body.

    Attributes:
        image (str): Base64-encoded image string (may include data URI prefix).
    """
    image: str


def clean_base64_string(b64_string: str) -> str:
    """
    Remove data URI prefix from a base64-encoded image string, if present.

    Args:
        b64_string (str): The base64 string, possibly with a data URI prefix.

    Returns:
        str: Clean base64 string without prefix.
    """
    match = re.match(r'data:image\/[a-zA-Z]+;base64,(.*)', b64_string)
    if match:
        return match.group(1)
    return b64_string


@app.post("/upload-image")
async def receive_base64_image(data: ImageData, request: Request):
    """
    Receive a base64-encoded image via POST, decode and process it.

    Args:
        data (ImageData): Request body containing the base64 image string.
        request (Request): FastAPI request object (for client info).

    Returns:
        dict: Success message and image size in bytes, or error message.

    Raises:
        HTTPException: If base64 decoding fails or image processing fails.
    """
    try:
        image_b64 = clean_base64_string(data.image)
        try:
            image_bytes = base64.b64decode(image_b64, validate=True)
        except Exception as e:
            logger.warning(f"Base64 decode failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")

        try:
            face_detection_app.process_image(image_bytes)
            logger.info("Image processed successfully.")
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            raise HTTPException(status_code=500, detail="Failed to process image.")

        logger.info(f"Received image from {request.client.host}. Size: {len(image_bytes)} bytes")

        return {
            "message": "Image received successfully.",
            "size_bytes": len(image_bytes)
        }

    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        raise http_exc

    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        return {"error": "Internal server error"}
