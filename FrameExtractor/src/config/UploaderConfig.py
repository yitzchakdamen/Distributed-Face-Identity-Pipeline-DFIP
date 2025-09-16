class UploaderConfig:
    PATH_SENT = ""
    RETRIES = 5
    RETRY_DELAY = 2
    WEB_SOCKET_URI = f"ws://localhost:8500/camera/upload-image"