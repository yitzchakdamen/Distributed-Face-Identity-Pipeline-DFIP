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

def camera():
    import cv2
    import subprocess

    # הגדרות
    width = 1280
    height = 720
    fps = 120
    rtsp_url = "rtsp://localhost:8554/live.stream"

    # פתח מצלמה (או כל מקור וידאו אחר)
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_FPS, fps)

    # פקודת FFmpeg
    SRT_URL = "srt://127.0.0.1:9000?pkt_size=1316"

    # פקודת FFmpeg לשליחת פריימים ל-SRT

    ffmpeg_cmd = [
        "ffmpeg",
        "-f", "rawvideo",
        "-pix_fmt", "bgr24",
        "-s", f"{width}x{height}",
        "-r", "30",
        "-i", "pipe:0",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-f", "mpegts",
        "srt://127.0.0.1:9000?mode=listener"
    ]

    # הפעלת FFmpeg
    ffmpeg_process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # כתיבה ל-FFmpeg
            ffmpeg_process.stdin.write(frame.tobytes())

    finally:
        cap.release()
        ffmpeg_process.stdin.close()
        ffmpeg_process.wait()


if __name__ == "__main__":
    # uvicorn.run(app, host="0.0.0.0", port=8500)
    camera()