from FrameExtractor.src.uploader import Uploader
from FrameExtractor.src.video_frame_extractor import VideoFrameExtractor
from FrameExtractor.src.encoder import Encoder
class Manager:
    def __init__(self):
        self.streamer = VideoFrameExtractor(r"C:\Users\Menachem\Desktop\Galil\Distributed-Face-Identity-Pipeline-DFIP\Distributed-Face-Identity-Pipeline-DFIP\FrameExtractor\src\WhatsApp Video 2025-09-16 at 12.47.08_120f9b40.mp4")
        self.encoder = Encoder()
        self.uploader = Uploader()

    async def extract(self):
        await self.uploader.connect_to_server()
        count = 1
        for frame in self.streamer.get_frames():
            try:
                encoded_frame = self.encoder.frame_encode(frame)
                await self.uploader.stream(encoded_frame)
                count += 1
            except:
                print("not sent frame")
