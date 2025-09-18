# main.py - Entry point for vector search service
# Imports the Manager class and starts listening for messages
from Vector_Search.src.main.manager import Manager

if __name__ == "__main__":
    # Create a Manager instance to coordinate the service
    manager = Manager()
    # Start listening for incoming messages
    manager.listen_message()