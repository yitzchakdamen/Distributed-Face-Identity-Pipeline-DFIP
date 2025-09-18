# Vector_Search

Service for storing, searching, and managing face vectors using ElasticSearch and Kafka.

## Structure
- `src/main/`: Main service logic (manager, vector store, producer, etc.)
- `src/dal/`: Data access layer for ElasticSearch.
- `src/utils/`: Utilities, configuration, and logging.
- `src/exceptions/`: Custom exception classes.

## Features
- Listens to Kafka topics for new face vectors and approval persons.
- Searches for similar faces or adds new entries with unique IDs.
- Publishes results and metadata back to Kafka.

## Usage
1. Configure ElasticSearch and Kafka endpoints in `src/utils/config/config.py`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the service:
   ```bash
   python src/main/main.py
   ```

## Configuration
- Kafka topics and ElasticSearch settings are in `src/utils/config/config.py`.

## Notes
- Ensure ElasticSearch and Kafka are running and accessible.
- Logging is handled via the `Logger` utility.
