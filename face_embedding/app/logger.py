import logging
from elasticsearch import Elasticsearch
from datetime import datetime
from face_embedding.app import config


class Logger:
    _logger = None

    @classmethod
    def get_logger(cls, name: str = "Logger", es_host=config.ES_URI, index=config.ES_LOG_INDEX, level=logging.DEBUG):
        if cls._logger:
            return cls._logger
        
        logger = logging.getLogger(name)
        logger.setLevel(level)

        if not logger.handlers:
            es = Elasticsearch(es_host)

            class ESHandler(logging.Handler):
                def emit(self, record):
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
