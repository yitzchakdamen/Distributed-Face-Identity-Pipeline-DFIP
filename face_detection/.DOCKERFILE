FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ /app/face_detection/app/
COPY src/ /app/face_detection/src/
COPY utils/ /app/face_detection/utils/

CMD ["python", "-m", "face_detection.app.main"]
