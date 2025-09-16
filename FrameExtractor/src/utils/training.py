from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
import uvicorn
from pydantic import BaseModel
import re

app = FastAPI()

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

    try:
        while True:
            try:
                image_bytes = await websocket.receive_bytes()
            except Exception as e:
                await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
                break

            try:
                await websocket.send_text("Image processed successfully")
            except Exception as e:
               await websocket.send_text("Error processing image")

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except:
            pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8500)