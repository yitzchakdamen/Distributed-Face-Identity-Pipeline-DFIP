FROM python:3.11-slim

WORKDIR /app

COPY updating_vector_identities_service/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy only this service's source
COPY updating_vector_identities_service /app/updating_vector_identities_service

CMD ["python", "-m", "updating_vector_identities_service.amain"]

