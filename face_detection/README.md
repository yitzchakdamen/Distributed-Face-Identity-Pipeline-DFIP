# Face Detection Service

A robust and efficient face detection microservice designed for distributed pipeline processing. This service detects faces in images, extracts face crops, and publishes metadata to distributed systems including MongoDB and Kafka.

## Overview

The Face Detection Service is a production-ready component that processes images to detect and extract human faces. It provides deterministic face identification, comprehensive error handling, and seamless integration with distributed storage and messaging systems.

## Core Features

- **Multi-format Input Support**: Processes images from file paths, raw bytes, or NumPy arrays
- **Dual Detection Engines**: Uses both OpenCV Haar cascades and DNN models for robust detection
- **Automatic Model Management**: Downloads required DNN models automatically if missing
- **Image Enhancement**: Built-in image preprocessing for improved detection accuracy
- **Quality Gate Validation**: Filters low-quality faces based on size, sharpness, brightness, and contrast
- **Eye Verification**: Validates face authenticity by detecting eye presence and positioning
- **Deterministic Face IDs**: Generates stable, content-based UUIDs to prevent duplicates
- **MongoDB Integration**: Stores face crops in GridFS with comprehensive metadata
- **Kafka Messaging**: Publishes face metadata for downstream processing
- **FastAPI Web Server**: RESTful API and WebSocket endpoints for image processing
- **Elasticsearch Logging**: Comprehensive logging and monitoring capabilities
- **Error Resilience**: Graceful handling of failures without pipeline interruption

## Architecture

### Detection Models

The service uses dual detection engines for maximum accuracy:

#### Haar Cascade Classifier
- **Type**: Traditional computer vision approach
- **Model**: `haarcascade_frontalface_default.xml` (OpenCV built-in)
- **Use Case**: Fast detection, good for high-quality frontal faces
- **Configuration**: Scale factor, min neighbors, min size parameters

#### DNN Face Detection Model
- **Type**: Deep Neural Network approach
- **Model Files**: 
  - `deploy.prototxt`: Network architecture configuration
  - `res10_300x300_ssd_iter_140000.caffemodel`: Pre-trained weights (~5.1MB)
- **Source**: OpenCV official repository
- **Use Case**: More accurate detection across various angles and lighting conditions
- **Auto-download**: Models are automatically downloaded if missing during initialization

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
Main face detection engine with advanced features:
- Dual detection methods (Haar + DNN) with automatic fallback
- Image enhancement preprocessing (CLAHE, denoising)
- Quality gate integration for face validation
- Eye verification for authenticity checking
- Configurable detection parameters and confidence thresholds
- Multi-format image input handling
- Error handling and comprehensive logging

#### `QualityGate`
Face quality validation system:
- **Size Validation**: Minimum bounding box dimensions
- **Sharpness Analysis**: Laplacian variance for blur detection
- **Brightness Assessment**: Pixel intensity analysis
- **Contrast Evaluation**: Local contrast measurement
- **Configurable Thresholds**: Environment variable configuration
- **Detailed Metrics**: Quality scores and diagnostic information

#### `EyeVerifier`
Eye detection and validation system:
- **Eye Detection**: Multiple Haar cascade classifiers
- **Geometric Validation**: Eye positioning and spacing analysis
- **Profile Support**: Single-eye detection for profile faces
- **Configurable Parameters**: Scale factor, neighbors, region constraints
- **Fallback Logic**: Graceful handling of edge cases

#### `FaceDetectionApp`
Application orchestrator with enhanced capabilities:
- Coordinates the complete face detection pipeline
- Manages quality validation and eye verification
- Handles MongoDB and Kafka integrations
- Processes enhancement and filtering logic
- Component initialization and error recovery

#### `MongoImageStorage`
MongoDB GridFS integration:
- Stores face images in GridFS
- Maintains metadata associations
- Handles connection management

#### `KafkaPublisher`
Enhanced Kafka messaging integration:
- Built on `confluent-kafka` for high performance and reliability
- Idempotent delivery with full acknowledgments
- Safe in-flight message ordering
- Comprehensive error handling and retry logic
- Configurable security options
- Bulk and single message publishing support

### FastAPI Web Server

The service includes a web API server built with FastAPI:

#### REST Endpoints

**POST `/upload-image`**
- **Purpose**: Process base64-encoded images via HTTP
- **Input**: JSON payload with base64 image data
- **Output**: Processing status and metadata
- **Features**: Automatic data URI prefix handling

#### WebSocket Endpoints  

**WebSocket `/camera/upload-image`**
- **Purpose**: Real-time image processing via WebSocket
- **Input**: Raw image bytes
- **Output**: Processing confirmation messages
- **Use Case**: Live camera feeds and streaming applications

#### Server Configuration
- **Host**: `0.0.0.0` (configurable)
- **Port**: `8000` (configurable)
- **Framework**: FastAPI with Uvicorn ASGI server
- **Features**: Automatic API documentation, request validation, error handling

## Dependencies

### Core Libraries
- **OpenCV** (`opencv-python==4.12.0.88`): Computer vision and face detection algorithms
- **NumPy** (`numpy==2.2.6`): Numerical computing and array operations
- **PyMongo** (`pymongo==4.15.0`): MongoDB connectivity and GridFS operations
- **Confluent-Kafka** (`confluent-kafka==2.11.1`): High-performance Kafka producer client
- **Elasticsearch** (`elasticsearch==9.1.1`): Search and analytics engine integration

### Web API Framework
- **FastAPI** (`fastapi==0.116.1`): Modern, fast web framework for building APIs
- **Uvicorn** (`uvicorn[standard]==0.35.0`): ASGI server for FastAPI applications

### Utility Libraries
- **python-dateutil** (`python-dateutil==2.9.0.post0`): Date/time manipulation
- **typing-extensions** (`typing_extensions==4.15.0`): Extended type hints
- **dnspython** (`dnspython==2.8.0`): DNS resolution utilities
- **certifi** (`certifi==2025.8.3`): Certificate validation
- **urllib3** (`urllib3==2.5.0`): HTTP client library
- **six** (`six==1.17.0`): Python 2/3 compatibility utilities

## Configuration

The service uses environment variables for configuration:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGODB_DB_NAME=face_identity
COLLECTION_NAME=Photo_storage

# Kafka Configuration
KAFKA_BOOTSTRAP=localhost:9092
KAFKA_TOPIC=image_uploaded

# Elasticsearch Configuration (for logging)
ES_HOST=localhost
ES_PORT=9200
ES_LOG_INDEX=logger

# Logging Configuration
LOGGER_NAME=logger

# Quality Gate Configuration (optional)
QG_MIN_BBOX_H=50
QG_MIN_BBOX_W=50
QG_MIN_SHARPNESS=150
QG_BRIGHTNESS_LO=60
QG_BRIGHTNESS_HI=190
QG_CONTRAST_MIN=25
QG_THRESHOLDS_VERSION=v1

# Eye Verifier Configuration (optional)
EV_SCALE_FACTOR=1.2
EV_MIN_NEIGHBORS=4
EV_EYES_UPPER_RATIO=0.75
EV_MIN_HORIZONTAL_GAP_RATIO=0.15
```

## Usage

### Basic Face Extraction

```python
from face_detection.src.face_detection import FaceExtractor

# Initialize extractor with enhanced parameters
extractor = FaceExtractor(
    scale_factor=1.15,           # Enhanced detection accuracy
    min_neighbors=5,             # Higher precision
    min_size=(30, 30),          # Minimum face size
    encode_format=".png",       # Output format
    dnn_confidence=0.75,        # DNN confidence threshold
    enable_image_enhancement=True  # Enable preprocessing
)

# Extract faces from file
faces = extractor.extract_faces("path/to/image.jpg")

# Extract faces from bytes
with open("image.jpg", "rb") as f:
    image_bytes = f.read()
faces = extractor.extract_faces(image_bytes)

# Extract faces with source hint
faces = extractor.extract_faces(
    image="path/to/image.jpg",
    source_hint="profile_photo"
)
```

### Full Pipeline Usage

```python
from face_detection.app.main import FaceDetectionApp

# Initialize application with all components
app = FaceDetectionApp()

# Process image through complete pipeline
# (detection, quality validation, eye verification, storage, messaging)
app.process_image("path/to/image.jpg")
```

### FastAPI Web Server Usage

#### Running the Server

```python
from face_detection.app.api import app
import uvicorn

# Start the server
uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### REST API Example

```bash
# Send base64 image via POST
curl -X POST "http://localhost:8000/upload-image" \
     -H "Content-Type: application/json" \
     -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."}'
```

#### WebSocket Example

```javascript
const ws = new WebSocket('ws://localhost:8000/camera/upload-image');
ws.onopen = function() {
    // Send raw image bytes
    ws.send(imageBytes);
};
```

### Factory Functions

```python
from face_detection.utils.factory import create_mongo_payload, create_kafka_payload
from face_detection.src.face_detection import FaceObject

# Create MongoDB payload for GridFS storage
mongo_data = create_mongo_payload(face_object, source_hint="upload")

# Create Kafka payload for event streaming
kafka_data = create_kafka_payload(face_object, source_hint="upload")
```

### Quality Gate Usage

```python
from face_detection.utils.quality_gate import QualityGate
import cv2

# Initialize quality gate
qg = QualityGate()

# Validate face quality
image = cv2.imread("face_crop.jpg")
result = qg.evaluate_face_crop(image, bbox=(x, y, w, h))

if result.passed:
    print(f"Face passed quality check with score: {result.score}")
else:
    print(f"Face failed: {result.reasons}")
```

### Eye Verifier Usage

```python
from face_detection.utils.eye_verifier import EyeVerifier
import cv2

# Initialize eye verifier
verifier = EyeVerifier()

# Verify eyes in face crop
face_image = cv2.imread("face_crop.jpg")
result = verifier.verify_eyes_in_face(face_image)

if result.eyes_detected:
    print(f"Found {len(result.eyes)} eyes")
else:
    print("No eyes detected")
```

## Installation

### Prerequisites
- Python 3.11 or higher
- MongoDB instance (for face storage)
- Kafka cluster (for event streaming)
- Elasticsearch cluster (for logging, optional)
- OpenCV system dependencies (handled automatically in Docker)

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
# Set environment variables or create .env file
export MONGO_URI=mongodb://localhost:27017
export KAFKA_BOOTSTRAP=localhost:9092
export ES_HOST=localhost
# ... other configuration variables
```

5. **Download Models (Optional)**
```bash
# Models are downloaded automatically, but can be manually placed in:
# face_detection/models/deploy.prototxt
# face_detection/models/res10_300x300_ssd_iter_140000.caffemodel
```

### Docker Installation

```bash
# Build the Docker image
docker build -f Dockerfile -t face-detection-service .

# Run with docker-compose (includes all dependencies)
docker-compose up -d
```

## API Reference

### FaceExtractor Methods

#### `extract_faces(image, source_hint=None)`
Detects and extracts faces from input image using dual detection engines.

**Parameters:**
- `image`: Image input (str path, bytes, or np.ndarray)
- `source_hint`: Optional source identifier for metadata

**Returns:** List of `FaceObject` instances

**Features:**
- Automatic DNN model download if missing
- Image enhancement preprocessing
- Quality gate validation
- Eye verification
- Fallback between detection methods

### FaceDetectionApp Methods

#### `process_image(image_input, source_hint=None)`
Processes image through the complete pipeline including detection, validation, storage, and messaging.

**Parameters:**
- `image_input`: Image to process (path, bytes, or array)
- `source_hint`: Optional source identifier

**Returns:** Processing status and metadata

### FastAPI Endpoints

#### `POST /upload-image`
Process base64-encoded images via REST API.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
}
```

**Response:**
```json
{
  "message": "Image received successfully.",
  "size_bytes": 45678
}
```

#### `WebSocket /camera/upload-image`
Real-time image processing via WebSocket connection.

**Input:** Raw image bytes
**Output:** Text confirmation messages

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

The service uses enhanced detection parameters for improved accuracy:

- **scale_factor**: `1.15` (higher precision, slower processing)
- **min_neighbors**: `5` (reduced false positives)
- **min_size**: `(30, 30)` (minimum face dimensions)
- **dnn_confidence**: `0.75` (high confidence threshold for DNN)
- **enable_image_enhancement**: `True` (preprocessing enabled by default)

### Quality Gate Thresholds

Default quality validation parameters:

- **Minimum Bounding Box**: 50x50 pixels
- **Sharpness Threshold**: 150 (Laplacian variance)
- **Brightness Range**: 60-190 (pixel intensity)
- **Minimum Contrast**: 25 (local contrast)

### Resource Usage

- **Memory**: Scales with image size and face count (recommend 512MB minimum)
- **CPU**: Benefits from multi-core processors for dual detection
- **Storage**: ~5MB for DNN models, variable for face crops
- **Network**: Required for MongoDB, Kafka, and Elasticsearch connections


