FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/face_detection/

CMD ["python", "-m", "face_detection.app.main"]


# to run this file, use:
# docker build -t face-detection .