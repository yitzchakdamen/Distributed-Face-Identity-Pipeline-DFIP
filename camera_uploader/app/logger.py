import logging
from elasticsearch import Elasticsearch
from datetime import datetime
from camera_uploader.app import config


class Logger:
    """
    Logger utility for logging to both Elasticsearch and console.

    This class provides a singleton logger instance that writes logs to Elasticsearch and the console.
    """
    _logger = None

    @classmethod
    def get_logger(
        cls,
        name: str = "Logger",
        es_host=config.ES_URI,
        index=config.ES_INDEX,
        level=logging.DEBUG
    ):
        """
        Get a singleton logger instance configured to log to Elasticsearch and console.

        Args:
            name (str): Logger name. Defaults to "Logger".
            es_host (str): Elasticsearch host URI. Defaults to config.ES_URI.
            index (str): Elasticsearch index name. Defaults to config.ES_LOG_INDEX.
            level (int): Logging level. Defaults to logging.DEBUG.

        Returns:
            logging.Logger: Configured logger instance.
        """
        if cls._logger:
            return cls._logger

        logger = logging.getLogger(name)
        logger.setLevel(level)

        if not logger.handlers:
            es = Elasticsearch(es_host)

            class ESHandler(logging.Handler):
                """
                Custom logging handler for sending logs to Elasticsearch.
                """
                def emit(self, record):
                    """
                    Emit a log record to Elasticsearch.

                    Args:
                        record (logging.LogRecord): The log record to emit.
                    """
                    try:
                        log_entry = self.format(record)
                        es.index(index=index, document={
                            "timestamp": datetime.now().isoformat(),
                            "level": record.levelname,
                            "logger": record.name,
                            "message": record.getMessage(),
                            "log": log_entry
                        })
                    except Exception as e:
                        print(f"ES log failed: {e}")

            es_handler = ESHandler()
            es_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            logger.addHandler(es_handler)

            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            logger.addHandler(console_handler)

        cls._logger = logger
        return logger