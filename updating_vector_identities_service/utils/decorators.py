import logging
from functools import wraps
from config.config import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)


def log_func(func):
    """ decorator log for function """
    def wrapper(*args, **kwargs):
        logger.info(f" Running .... ({func.__name__} ) with args: ({args}), kwargs: ({kwargs})")
        result = func(*args, **kwargs)
        logger.info(f" Function finished ({func.__name__}) returned: {result}\n")
        return result 
    return wrapper


def safe_execute(return_strategy="none"):
    """
    Decorator for safe execution with logging.
    
    :param return_strategy: 
        - "none"    ->  None (default)
        - "error"   ->  dict with error information
        - "raise"   -> raise Exception
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                logger.info(f"Running .... ({func.__name__}) with args={args}, kwargs={kwargs}")
                result = func(*args, **kwargs)
                logger.info(f"Function finished ({func.__name__}) returned: {result}\n")
                return result 
            
            except Exception as e:
                import traceback

                error_type = type(e).__name__
                error_msg = str(e)
                func_name = func.__name__
                tb = traceback.format_exc() 

                logger.error(
                    f"\n --------- \n"
                    f"Error in function '{func_name}'\n"
                    f"Type: {error_type}\n"
                    f"Args: {args}, Kwargs: {kwargs}\n"
                    f"Message: {error_msg}\n"
                    f"\n --------- \n"
                    #f"Traceback:\n{tb}"
                )

                if return_strategy == "none": return None
                elif return_strategy == "error":
                    return {
                        "function": func_name,
                        "error_type": error_type,
                        "error_message": error_msg,
                        "args": args,
                        "kwargs": kwargs,
                        "traceback": tb
                    }
                elif return_strategy == "raise": raise
                else: raise ValueError(f"Unknown return_strategy: {return_strategy}")

        return wrapper
    return decorator




    
