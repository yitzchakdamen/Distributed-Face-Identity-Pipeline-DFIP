# main.py - Entry point for frame extraction pipeline
# Imports the Manager class and runs the extraction process asynchronously
from FrameExtractor.src.manager import Manager
import asyncio

if __name__ == "__main__":
    # Create a Manager instance to coordinate extraction
    manager = Manager()
    # Run the extract method asynchronously
    asyncio.run(manager.extract())