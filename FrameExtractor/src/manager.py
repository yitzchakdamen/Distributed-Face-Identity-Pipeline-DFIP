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
                        if frame is None and count > 2:
                            break
                        bytes_frame = self.encoder.frame_encode(frame)
                        count+=1
                        print(count)
                        # await self.uploader.stream(bytes_frame)
                        await asyncio.sleep(0.01)
                    except Exception as e:
                        print(f"not sent frame\n {e}")
        finally:
            self.extractor.release()

