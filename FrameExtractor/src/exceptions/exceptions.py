from FrameExtractor.src.utils.errors import Errors
class FrameNotSent(Exception):
    def __init__(self):
        super().__init__()