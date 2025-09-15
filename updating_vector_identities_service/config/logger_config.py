import logging 
from elasticsearch import Elasticsearch 
from datetime import datetime 


class LoggerConfig:
    
    @staticmethod
    def config_ESHandler(es_host,  index):   
        es = Elasticsearch(es_host) 
        class ESHandler(logging.Handler): 
            def emit(self, record): 
                try: 
                    es.index(index=index, document={
                        "timestamp": datetime.utcnow().isoformat(),
                        "level": record.levelname,
                        "logger": record.name, 
                        "message": record.getMessage() 
                        }) 
                except Exception as e: 
                    print(f"ES log failed: {e}") 
        return [ESHandler(), logging.StreamHandler()]