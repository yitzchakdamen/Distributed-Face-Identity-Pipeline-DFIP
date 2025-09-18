
# manager.py - Coordinates the extraction, encoding, and uploading of video frames
import asyncio

from FrameExtractor.src.uploader import Uploader
from FrameExtractor.src.video_frame_extractor import VideoFrameExtractor
from FrameExtractor.src.encoder import Encoder

class Manager:
    """
    Manages the pipeline: extracts frames from video, encodes them, and uploads them.
    """
    def __init__(self):
        # Initialize the extractor, encoder, and uploader
        self.extractor = VideoFrameExtractor(r"C:\Users\Menachem\Desktop\Galil\Distributed-Face-Identity-Pipeline-DFIP\Distributed-Face-Identity-Pipeline-DFIP\FrameExtractor\src\WhatsApp Video 2025-09-16 at 12.47.08_120f9b40.mp4")
        self.encoder = Encoder()
        self.uploader = Uploader()

    async def extract(self):
        """
        Extract frames, encode, and (optionally) upload them.
        """
        count = 0
        try:
            for frame in self.extractor.get_frames():
                try:
                    count += 1
                    # Encode the frame
                    bytes_frame = self.encoder.frame_encode(frame)
                    # Optionally upload the frame (currently commented out)
                    # await self.uploader.stream(bytes_frame)
                    print(count)
                except Exception as e:
                    print(f"not sent frame\n {e}")
        finally:
            # Release video capture resources
            self.extractor.release()

