import logging
from elasticsearch import Elasticsearch
from datetime import datetime
from src.utils.config import ElasticSearchConfig, LoggingConfig


class Logger:
    _logger = None
    @classmethod
    def get_logger(cls, name=LoggingConfig.INDEX_LOGS_NAME, es_host=ElasticSearchConfig.ELASTIC_URL,
                            index=LoggingConfig.INDEX_LOGS_NAME, level=logging.DEBUG):
        if cls._logger:
            return cls._logger
        logger = logging.getLogger(name)
        logger.setLevel(level)
        if not logger.handlers:
            es = Elasticsearch(es_host)
            class ESHandler(logging.Handler):
                def emit(self, record):
                    try:
                        es.index(index=index, document={
                                    "timestamp": datetime.now().isoformat(),
                                    "level": record.levelname,
                                    "logger": record.name,
                                    "message": record.getMessage()})
                    except Exception as e:
                        print(f"ES log failed: {e}")
            logger.addHandler(ESHandler())
            logger.addHandler(logging.StreamHandler())
            cls._logger = logger
            return logger