from camera_uploader.app import config
from camera_uploader.app.photo_uploader import CameraUploader


def main():
    """
    Main function to initialize and run the CameraUploader.

    This function creates an instance of CameraUploader with the server URL
    specified in the configuration and starts the image capture and upload process.
    """
    uploader = CameraUploader(server_url=config.SERVER_URL)
    uploader.main()

if __name__ == "__main__":
    main()
