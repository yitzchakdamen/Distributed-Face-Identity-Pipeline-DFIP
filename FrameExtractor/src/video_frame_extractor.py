import time

import cv2
from collections import deque
from FrameExtractor.src.config.VideoFrameExtractorConfig import VideoFrameExtractorConfig as config
class VideoFrameExtractor:
    def __init__(self, _source):
        self.capture = cv2.VideoCapture(_source)
        self.window_size = config.SLIDING_WINDOW_SIZE * config.MAX_FRAMES_PER_SECONDS
        self.frame_window = deque(maxlen=self.window_size)

    def get_frames(self, _interval_sec = config.INTERVAL_SEC):
        try:
            last_sent = 0
            success = True
            while success:
                success, frame = self.capture.read()
                now = time.time()
                if now - last_sent >= _interval_sec:
                    yield frame
                    last_sent = now
        finally:
            self.capture.release()