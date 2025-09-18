# FrameExtractor

Pipeline module for extracting frames from video, encoding them, and uploading to a server.

## Structure
- `main.py`: Entry point for running the extraction pipeline.
- `manager.py`: Coordinates extraction, encoding, and uploading.
- `video_frame_extractor.py`: Handles frame extraction from video files.
- `encoder.py`: Encodes frames to base64.
- `uploader.py`: Uploads frames to a server via WebSocket.
- `config/`: Configuration files for each component.
- `exceptions/`: Custom exception classes.
- `utils/`: Utility functions and helpers.

## Usage
1. Place your video file in the `src/` directory or update the path in `manager.py`.
2. Run the pipeline:
   ```bash
   python src/main.py
   ```

## Requirements
Install dependencies from `requirements.txt`:
```bash
pip install -r requirements.txt
```

## Configuration
Edit the files in `src/config/` to adjust parameters such as frame interval, encoding format, and upload settings.

## Notes
- The uploader is currently commented out in the pipeline. Uncomment in `manager.py` to enable uploading.
- Make sure the server endpoint is running and accessible if uploading is enabled.
