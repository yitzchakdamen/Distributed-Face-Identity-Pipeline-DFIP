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
    image: str

def clean_base64_string(b64_string: str) -> str:
    match = re.match(r'data:image\/[a-zA-Z]+;base64,(.*)', b64_string)
    if match:
        return match.group(1)
    return b64_string

@app.post("/image/raw")
async def receive_base64_image(data: ImageData, request: Request):
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
