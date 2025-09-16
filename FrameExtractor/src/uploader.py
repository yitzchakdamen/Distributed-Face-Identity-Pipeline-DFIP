import asyncio

import websockets
from pathlib import Path
from FrameExtractor.src.exceptions.exceptions import FrameNotSent
from FrameExtractor.src.config.UploaderConfig import UploaderConfig as config
class Uploader:
    def __init__(self, _path = config.PATH_SENT, _uri = config.WEB_SOCKET_URI,
                 _retries = config.RETRIES, _retry_delay = config.RETRY_DELAY):
        self.path =Path(_path)
        self.uri = _uri
        self.websocket = None
        self.retries = _retries
        self.retry_delay = _retry_delay

    # def upload(self, _encoded_frame : str, count):
    #     import cv2
    #     import base64
    #     import numpy as np
    #
    #     # b64_string = התוצאה שקיבלת
    #
    #     # 1. המרה חזרה לבייטים
    #     img_bytes = base64.b64decode(_encoded_frame)
    #
    #     # 2. הפוך ל־NumPy array
    #     img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    #
    #     # 3. פענוח לתמונה
    #     img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    #     filename = f"{count}.png"
    #     path = self.path /"image"
    #     fullpath = Path(self.path).cwd()/"image"
    #     fullpath.mkdir(parents=True, exist_ok=True)
    #     fullpath = str(fullpath / filename)
    #     cv2.imwrite(fullpath, img)
    #
    #     # עכשיו img הוא פריים OpenCV
    #     # cv2.imshow("Recovered Image", img)
    #     # cv2.waitKey(0)
    #     # cv2.destroyAllWindows()

    def _is_disconnect(self) -> bool:
        return self.websocket is None or self.websocket.close


    async def connect_to_server(self):
            for attempt in range(self.retries):
                await asyncio.sleep(self.retry_delay)
                self.websocket = await websockets.connect(self.uri)
                if not self._is_disconnect():
                    return
            raise RuntimeError()

    async def stream(self, frame_str):
        try:
            if self._is_disconnect():
                await self.connect_to_server()
            await self.websocket.send(frame_str)
        except RuntimeError:
            raise FrameNotSent()


