FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    v4l-utils \
    && rm -rf /var/lib/apt/lists/*

COPY camera_uploader/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire package to ensure proper module resolution
COPY camera_uploader ./camera_uploader

CMD ["python", "-m", "camera_uploader.app.main"]
