import asyncio

from FrameExtractor.src.uploader import Uploader
from FrameExtractor.src.video_frame_extractor import VideoFrameExtractor
from FrameExtractor.src.encoder import Encoder
class Manager:
    def __init__(self):
        self.extractor = VideoFrameExtractor(r"C:\Users\Menachem\Desktop\Galil\Distributed-Face-Identity-Pipeline-DFIP\Distributed-Face-Identity-Pipeline-DFIP\FrameExtractor\src\WhatsApp Video 2025-09-16 at 12.47.08_120f9b40.mp4")
        self.encoder = Encoder()
        self.uploader = Uploader()

    async def extract(self):
        count = 0
        try:
            for frame in self.extractor.get_frames():
                    try:
                        count += 1
                        # await self.uploader.stream(bytes_frame)
                        bytes_frame = self.encoder.frame_encode(frame)
                        # await self.uploader.stream(bytes_frame)
                        print(count)
                    except Exception as e:
                        print(f"not sent frame\n {e}")
        finally:
            self.extractor.release()

