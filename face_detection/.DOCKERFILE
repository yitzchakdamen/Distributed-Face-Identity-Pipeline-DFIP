FROM python:3.11-slim

# Set maintainer information
LABEL maintainer="Face Detection Service"
LABEL version="1.0"
LABEL description="Distributed Face Detection Service with DNN models"

# Install system dependencies required for OpenCV and face detection
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    libfontconfig1 \
    libgtk-3-0 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/face_detection/models \
    /app/face_detection/detected_faces \
    /app/face_detection/logs

COPY . /app/face_detection/

# Set Python path to include the app directory
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Download DNN models if they don't exist (backup mechanism)
RUN cd /app/face_detection/models && \
    if [ ! -f "deploy.prototxt" ]; then \
        echo "Downloading deploy.prototxt..." && \
        wget -q https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt; \
    fi && \
    if [ ! -f "res10_300x300_ssd_iter_140000.caffemodel" ]; then \
        echo "Downloading face detection model..." && \
        wget -q https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20180205_fp16/res10_300x300_ssd_iter_140000_fp16.caffemodel \
        -O res10_300x300_ssd_iter_140000.caffemodel; \
    fi

# Verify that model files exist and are not empty
RUN cd /app/face_detection/models && \
    ls -la && \
    test -s deploy.prototxt && \
    test -s res10_300x300_ssd_iter_140000.caffemodel && \
    echo "Model files verified successfully"

# Set default environment variables
ENV MONGO_URI=mongodb://localhost:27017
ENV MONGODB_DB_NAME=face_identity
ENV COLLECTION_NAME=Photo_storage
ENV KAFKA_BOOTSTRAP=localhost:9092
ENV KAFKA_TOPIC=image_uploaded
ENV LOGGER_NAME=face_detection_service
ENV ES_HOST=localhost
ENV ES_PORT=9200
ENV ES_LOG_INDEX=face_detection_logs

# Create non-root user for security
RUN groupadd -r facedetection && useradd -r -g facedetection facedetection

# Change ownership of the application directory
RUN chown -R facedetection:facedetection /app

# Switch to non-root user
USER facedetection

# Expose ports if needed (though this service typically doesn't expose HTTP endpoints)
# EXPOSE 8080

# Health check to verify the service is working
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import face_detection.src.face_detection; print('Service is healthy')" || exit 1

# Set the command to run the face detection service
CMD ["python", "-m", "face_detection.app.main"]
