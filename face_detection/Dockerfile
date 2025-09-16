FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY face_detection/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/models && \
    curl -L -o /app/models/haarcascade_frontalface_default.xml \
        https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml && \
    curl -L -o /app/models/haarcascade_eye.xml \
        https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_eye.xml && \
    curl -L -o /app/models/haarcascade_eye_tree_eyeglasses.xml \
        https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_eye_tree_eyeglasses.xml

COPY face_detection ./face_detection

EXPOSE 8000

CMD ["uvicorn", "face_detection.app.api:app", "--host", "0.0.0.0", "--port", "8000"]
