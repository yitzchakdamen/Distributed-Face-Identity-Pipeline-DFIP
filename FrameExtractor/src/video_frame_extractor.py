
# video_frame_extractor.py - Extracts frames from a video file at specified intervals
import time
import cv2
from collections import deque
from FrameExtractor.src.config.VideoFrameExtractorConfig import VideoFrameExtractorConfig as config

class VideoFrameExtractor:
    """
    Handles video capture and frame extraction at set intervals.
    """
    def __init__(self, _source):
        # Open the video file or stream
        self.capture = cv2.VideoCapture(_source)
        self.window_size = config.SLIDING_WINDOW_SIZE * config.MAX_FRAMES_PER_SECONDS
        # self.frame_window = deque(maxlen=self.window_size)

    def get_frames(self, _interval_sec = config.INTERVAL_SEC):
        """
        Generator that yields frames every _interval_sec seconds.
        """
        last_sent = 0
        success = True
        while success:
            success, frame = self.capture.read()
            if not success:
                break
            now = time.time()
            if now - last_sent >= _interval_sec:
                last_sent = now
                yield frame

    def release(self):
        # Release the video capture resource
        self.capture.release()
