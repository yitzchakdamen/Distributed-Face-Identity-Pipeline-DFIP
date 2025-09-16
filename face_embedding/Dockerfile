FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libopenblas-dev \
    libomp-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY face_embedding/requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(); app.prepare(ctx_id=-1, det_size=(320, 320))"
RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(name='buffalo_l'); app.prepare(ctx_id=-1, det_size=(320, 320))"

COPY face_embedding/app ./face_embedding/app

CMD ["python", "-m", "face_embedding.app.main"]
