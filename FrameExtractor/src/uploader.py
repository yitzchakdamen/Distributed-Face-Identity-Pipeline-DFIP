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

    async def connect_to_server(self):
                self.websocket = await websockets.connect(self.uri)

    async def stream(self, bytes_frame):
        try:
            if self.websocket is None:
                    await self.connect_to_server()
            await self.websocket.send(bytes_frame)
        except RuntimeError:
            try:
                await self.connect_to_server()
                await self.websocket.send(bytes_frame)
            except:
                raise FrameNotSent()


