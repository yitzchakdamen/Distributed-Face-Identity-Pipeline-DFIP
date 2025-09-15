# Face Detection Service

A robust and efficient face detection microservice designed for distributed pipeline processing. This service detects faces in images, extracts face crops, and publishes metadata to distributed systems including MongoDB and Kafka.

## Overview

The Face Detection Service is a production-ready component that processes images to detect and extract human faces. It provides deterministic face identification, comprehensive error handling, and seamless integration with distributed storage and messaging systems.

## Core Features

- **Multi-format Input Support**: Processes images from file paths, raw bytes, or NumPy arrays
- **Robust Face Detection**: Uses OpenCV Haar cascades with configurable detection parameters
- **Deterministic Face IDs**: Generates stable, content-based UUIDs to prevent duplicates
- **MongoDB Integration**: Stores face crops in GridFS with metadata
- **Kafka Messaging**: Publishes face metadata for downstream processing
- **Comprehensive Logging**: Detailed logging for monitoring and debugging
- **Error Resilience**: Graceful handling of failures without pipeline interruption

## Architecture

### Core Classes

#### `FaceObject`
Immutable dataclass representing a detected face:
- `face_id`: Stable UUID derived from face content
- `bbox`: Bounding box coordinates (x, y, width, height)
- `width`, `height`: Face dimensions in pixels
- `content_type`: MIME type of encoded face image
- `image_bytes`: Encoded face image data
- `timestamp_utc`: ISO8601 UTC timestamp
- `source_hint`: Optional source identifier

#### `FaceExtractor`
Main face detection engine:
- Configurable Haar cascade parameters
- Multi-format image input handling
- Face detection and cropping
- Error handling and logging

#### `FaceDetectionApp`
Application orchestrator:
- Coordinates face extraction workflow
- Manages MongoDB and Kafka integrations
- Handles component initialization and error recovery

#### `MongoImageStorage`
MongoDB GridFS integration:
- Stores face images in GridFS
- Maintains metadata associations
- Handles connection management

#### `KafkaPublisher`
Kafka messaging integration:
- Publishes face metadata to topics
- Handles connection failures
- Configurable retry mechanisms

## Dependencies

### Core Libraries
- **OpenCV** (`cv2`): Image processing and face detection
- **NumPy**: Array operations and image manipulation
- **PyMongo**: MongoDB connectivity and GridFS operations
- **Kafka-Python**: Kafka producer functionality

### Utility Libraries
- **UUID**: Unique identifier generation
- **Hashlib**: Content-based ID generation
- **Datetime**: Timestamp management
- **Logging**: Comprehensive logging framework

## Configuration

The service uses environment variables for configuration:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGODB_DB_NAME=face_detection_db

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_FACE_TOPIC=face_detections

# Logging Configuration
LOGGER_NAME=face_detection
LOG_LEVEL=INFO
```

## Usage

### Basic Face Extraction

```python
from src.face_detection import FaceExtractor

# Initialize extractor
extractor = FaceExtractor(
    scale_factor=1.1,
    min_neighbors=5,
    min_size=(30, 30),
    encode_format=".png"
)

# Extract faces from file
faces = extractor.extract_faces("path/to/image.jpg")

# Extract faces from bytes
with open("image.jpg", "rb") as f:
    image_bytes = f.read()
faces = extractor.extract_faces(image_bytes)

# Extract faces with limits
faces = extractor.extract_faces(
    image="path/to/image.jpg",
    source_hint="profile_photo",
    max_faces=3
)
```

### Full Pipeline Usage

```python
from app.main import FaceDetectionApp

# Initialize application
app = FaceDetectionApp()

# Process image through full pipeline
app.process_image("path/to/image.jpg", source_hint="user_upload")
```

### Factory Functions

```python
from utils.factory import create_mongo_payload, create_kafka_payload
from src.face_detection import FaceObject

# Create MongoDB payload
mongo_data = create_mongo_payload(face_object, source_hint="upload")

# Create Kafka payload
kafka_data = create_kafka_payload(face_object, source_hint="upload")
```

## Installation

### Prerequisites
- Python 3.8 or higher
- MongoDB instance
- Kafka cluster
- OpenCV system dependencies

### Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd face-detection
```

2. **Create Virtual Environment**
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## API Reference

### FaceExtractor Methods

#### `extract_faces(image, source_hint=None, max_faces=None)`
Detects and extracts faces from input image.

**Parameters:**
- `image`: Image input (str path, bytes, or np.ndarray)
- `source_hint`: Optional source identifier
- `max_faces`: Maximum number of faces to return

**Returns:** List of `FaceObject` instances

### FaceDetectionApp Methods

#### `process_image(image_input, source_hint=None)`
Processes image through complete pipeline.

**Parameters:**
- `image_input`: Image to process
- `source_hint`: Optional source identifier

**Returns:** Processing status and metadata

## Error Handling

The service implements comprehensive error handling:

- **Input Validation**: Validates image formats and parameters
- **Detection Failures**: Gracefully handles no-face scenarios
- **Storage Errors**: Logs and continues on MongoDB failures
- **Messaging Errors**: Retries and logs Kafka publishing failures
- **Pipeline Resilience**: Continues processing despite component failures

## Testing

### Run Test Suite

```bash
# Run all tests
python tests/reliable_tests.py

# Run specific test categories
python -m unittest tests.test_face_detection
python -m unittest tests.test_integration
```

### Test Coverage

The test suite includes:
- Unit tests for core detection logic
- Integration tests for full pipeline
- Mock-based tests for external dependencies
- Edge case and error condition testing

## Monitoring and Logging

### Log Levels
- **DEBUG**: Detailed processing information
- **INFO**: Processing milestones and results
- **WARNING**: Non-fatal issues and fallbacks
- **ERROR**: Component failures and exceptions

### Key Metrics
- Faces detected per image
- Processing time per operation
- Storage and messaging success rates
- Error frequencies and types

## Performance Considerations

### Detection Parameters
- **scale_factor**: Lower values increase accuracy but reduce speed
- **min_neighbors**: Higher values reduce false positives
- **min_size**: Larger values improve processing speed

### Resource Usage
- Memory scales with image size and face count
- CPU usage depends on detection parameters
- Network usage for MongoDB and Kafka operations


