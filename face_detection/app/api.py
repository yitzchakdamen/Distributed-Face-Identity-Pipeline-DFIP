from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, status
from fastapi.responses import JSONResponse
import uvicorn
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
    
@app.websocket("/camera/upload-image")
async def websocket_image_endpoint(websocket: WebSocket):
    """
    Receive raw image bytes via WebSocket, decode and process them.

    Args:
        websocket (WebSocket): WebSocket connection from the client.

    Raises:
        WebSocketDisconnect: If the client disconnects.
        Exception: If an unexpected error occurs, closes the WebSocket with internal error code.
    """
    await websocket.accept()
    client_host = websocket.client.host if websocket.client else "unknown"
    logger.info(f"WebSocket connection accepted from {client_host}")

    try:
        while True:
            try:
                image_bytes = await websocket.receive_bytes()
            except Exception as e:
                logger.warning(f"Failed to receive bytes from {client_host}: {e}")
                await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
                break

            try:
                face_detection_app.process_image(image_bytes)
                logger.info(f"Image processed successfully from {client_host}, size={len(image_bytes)} bytes")
                await websocket.send_text("Image processed successfully")
            except Exception as e:
                logger.error(f"Failed to process image from {client_host}: {e}")
                await websocket.send_text("Error processing image")

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected from {client_host}")

    except Exception as e:
        logger.exception(f"Unexpected WebSocket error from {client_host}: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
