from FrameExtractor.src.manager import Manager
import asyncio

if __name__ == "__main__":
    manager = Manager()
    asyncio.run(manager.extract())