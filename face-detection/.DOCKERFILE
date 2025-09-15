FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /app/src
COPY ./utils /app/utils
COPY ./app /app/app

CMD ["python", "-m", "app.main"]


# to run this file, use:
# docker build -t face-detection .