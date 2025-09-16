# Face Detection Service - Docker Setup

This directory contains the Docker configuration for the Face Detection Service, part of the Distributed Face Identity Pipeline (DFIP).

## Files Overview

- `.DOCKERFILE` - Main Dockerfile for building the face detection service
- `docker-compose.yml` - Complete stack with all dependencies
- `.dockerignore` - Files to exclude from Docker build context
- `requirements.txt` - Python dependencies

## Features

### Docker Image Features
- **Base Image**: Python 3.11 slim for optimal size and security
- **System Dependencies**: All OpenCV and face detection requirements pre-installed
- **DNN Models**: Automatic download and verification of face detection models
- **Security**: Non-root user execution
- **Health Checks**: Built-in service health monitoring
- **Model Backup**: Automatic model download if files are missing

### Model Handling
The service includes two pre-trained models:
1. `deploy.prototxt` - DNN model configuration
2. `res10_300x300_ssd_iter_140000.caffemodel` - Pre-trained weights (~5.1MB)

Models are automatically downloaded during build if not present in the `models/` directory.

## Quick Start

### Build and Run Single Service
```bash
# Build the image
docker build -f .DOCKERFILE -t face-detection-service .

# Run the container
docker run -d \
  --name face-detection \
  -e MONGO_URI=mongodb://host.docker.internal:27017 \
  -e KAFKA_BOOTSTRAP=host.docker.internal:9092 \
  -v ./detected_faces:/app/face_detection/detected_faces \
  face-detection-service
```

### Run Complete Stack with Dependencies
```bash
# Start all services (MongoDB, Kafka, Elasticsearch, Face Detection)
docker-compose up -d

# View logs
docker-compose logs -f face-detection

# Stop all services
docker-compose down
```

## Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB_NAME` | `face_identity` | Database name |
| `COLLECTION_NAME` | `Photo_storage` | Collection for image storage |
| `KAFKA_BOOTSTRAP` | `localhost:9092` | Kafka bootstrap servers |
| `KAFKA_TOPIC` | `image_uploaded` | Kafka topic for events |
| `LOGGER_NAME` | `face_detection_service` | Logger identifier |
| `ES_HOST` | `localhost` | Elasticsearch host |
| `ES_PORT` | `9200` | Elasticsearch port |
| `ES_LOG_INDEX` | `face_detection_logs` | Elasticsearch index for logs |

### Volume Mounts
- `/app/face_detection/detected_faces` - Output directory for detected faces
- `/app/face_detection/logs` - Log files
- `/app/face_detection/data` - Input data directory (read-only)

## Deployment Options

### Development
```bash
docker-compose up -d
```

### Production
For production deployment, consider:
1. Using external MongoDB, Kafka, and Elasticsearch clusters
2. Implementing proper secret management
3. Setting up log aggregation
4. Configuring resource limits

### Kubernetes
Example deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: face-detection-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: face-detection
  template:
    metadata:
      labels:
        app: face-detection
    spec:
      containers:
      - name: face-detection
        image: face-detection-service:latest
        env:
        - name: MONGO_URI
          value: "mongodb://mongo-service:27017"
        - name: KAFKA_BOOTSTRAP
          value: "kafka-service:9092"
        resources:
          limits:
            memory: "1Gi"
            cpu: "500m"
          requests:
            memory: "512Mi"
            cpu: "250m"
```

## Troubleshooting

### Common Issues

1. **Model Download Failures**
   - Check internet connectivity during build
   - Manually copy models to `models/` directory before build

2. **OpenCV Issues**
   - Ensure system dependencies are installed (handled in Dockerfile)
   - For custom bases, install: `libgl1-mesa-glx libglib2.0-0`

3. **Memory Issues**
   - Increase container memory limits
   - Monitor memory usage with `docker stats`

4. **Permission Issues**
   - Ensure volume mount directories are writable
   - Check file ownership in mounted volumes

### Health Check
The container includes a health check that verifies the face detection module can be imported:
```bash
docker inspect face-detection --format='{{.State.Health.Status}}'
```

### Debugging
```bash
# Access container shell
docker exec -it face-detection bash

# View logs
docker logs face-detection

# Check mounted volumes
docker exec face-detection ls -la /app/face_detection/
```

## Performance Considerations

- **CPU**: Service benefits from multi-core processors for face detection
- **Memory**: Minimum 512MB, recommended 1GB for optimal performance
- **Storage**: Models require ~5MB, detected faces vary by usage
- **Network**: Stable connection required for Kafka and MongoDB

## Security Notes

- Service runs as non-root user `facedetection`
- No sensitive data in environment variables (use secrets management)
- Models downloaded from official OpenCV repositories
- Container filesystem is read-only except for designated volumes