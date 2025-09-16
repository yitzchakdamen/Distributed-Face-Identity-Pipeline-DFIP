from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
import uvicorn
from pydantic import BaseModel
import re

app = FastAPI()

class ImageData(BaseModel):
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
    await websocket.accept()
    while True:
            try:
                image_bytes = await websocket.receive_bytes()
                print(image_bytes)
                break
            except Exception as e:
                print(e)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8500)