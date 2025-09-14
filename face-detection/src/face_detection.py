import uuid
import hashlib
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Union

import cv2
import numpy as np
logger = logging.getLogger("face_detection")

@dataclass(frozen=True)
class FaceObject:
    """
    Immutable container for a single cropped face.

    Attributes:
        face_id: Stable UUID derived from the face content (sha256-based UUID5).
        bbox: Bounding box as (x, y, w, h) in the source image coordinate space.
        width: Width of the cropped face in pixels.
        height: Height of the cropped face in pixels.
        content_type: MIME type of the encoded face image.
        image_bytes: Encoded image bytes (PNG by default).
        timestamp_utc: ISO8601 UTC timestamp when the crop was produced.
        source_hint: Optional hint about the image source (e.g., filename or tag).
    """
    face_id: str
    bbox: Tuple[int, int, int, int]
    width: int
    height: int
    content_type: str
    image_bytes: bytes
    timestamp_utc: str
    source_hint: Optional[str] = None

    # def to_dict(self) -> dict:
    #     """
    #     Convert the face object into a dict suitable for serialization or insertion to a DB.

    #     Returns:
    #         A JSON-serializable dictionary of the face object.
    #     """
    #     data = asdict(self)
    #     data["image_bytes"] = self.image_bytes  # keep bytes; caller can Base64 if needed
    #     return data


class NoFacesFoundError(Exception):
    """
    Raised internally when no faces are detected in the provided image.
    """


class FaceExtractor:
    """
    Efficient face detector and cropper for pipeline use.

    This class loads an OpenCV Haar cascade once and provides a robust `extract_faces`
    method that accepts image inputs in multiple formats, detects faces, and returns
    clean `FaceObject` instances for downstream persistence (e.g., MongoDB/GridFS).

    Features:
        - Robust input handling: file path, raw bytes, NumPy array (BGR/RGB/gray).
        - Tunable detection parameters for performance/precision trade-offs.
        - Deterministic face IDs based on image content to avoid duplicates.
        - Comprehensive logging and error handling that won't crash your pipeline.

    Args:
        scale_factor: Pyramid scale factor for the Haar cascade (typical 1.05–1.2).
        min_neighbors: Minimum neighbor rectangles to retain a detection.
        min_size: Minimum face size in pixels (w, h).
        logger: Optional logger; if None, a module-level logger is configured.
        encode_format: Output image encoding ('.png' or '.jpg'); PNG is lossless.
    """

    def __init__(
        self,
        scale_factor: float = 1.1,
        min_neighbors: int = 5,
        min_size: Tuple[int, int] = (30, 30),
        encode_format: str = ".png",
    ) -> None:
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.min_size = min_size
        self.encode_format = encode_format.lower()
        self.logger = logger 
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.cascade = cv2.CascadeClassifier(cascade_path)
        if self.cascade.empty():
            raise RuntimeError(f"Failed to load Haar cascade from: {cascade_path}")
        if self.encode_format not in (".png", ".jpg", ".jpeg"):
            raise ValueError("encode_format must be one of: .png, .jpg, .jpeg")

    def extract_faces(
        self,
        image: Union[str, bytes, np.ndarray],
        source_hint: Optional[str] = None,
        max_faces: Optional[int] = None,
    ) -> List[FaceObject]:
        """
        Detect and crop faces from the provided image.

        The method never raises for the common “no faces” case; it logs a warning
        and returns an empty list to keep the pipeline flowing. Catastrophic I/O or
        decode errors are logged and also yield an empty list.

        Args:
            image: One of:
                - str: filesystem path to an image file
                - bytes: raw encoded image bytes (e.g., JPEG/PNG)
                - np.ndarray: image matrix in BGR/RGB/gray
            source_hint: Optional label stored in each FaceObject for traceability.
            max_faces: Optional cap on the number of faces to return (first N by detection order).

        Returns:
            A list of FaceObject instances. Empty if no faces are found or on non-fatal errors.
        """
        try:
            image_matrix = self._to_bgr(image)
            image_gray = cv2.cvtColor(image_matrix, cv2.COLOR_BGR2GRAY)
            faces = self.cascade.detectMultiScale(
                image_gray,
                scaleFactor=self.scale_factor,
                minNeighbors=self.min_neighbors,
                minSize=self.min_size,
                flags=cv2.CASCADE_SCALE_IMAGE,
            )
            if len(faces) == 0:
                raise NoFacesFoundError("No faces detected in image.")
            if max_faces is not None and max_faces > 0:
                faces = faces[:max_faces]

            outputs: List[FaceObject] = []
            for (x, y, w, h) in faces:
                crop = image_matrix[y : y + h, x : x + w]
                ok, buf = cv2.imencode(self.encode_format, crop)
                if not ok:
                    self.logger.error("Failed to encode a cropped face; skipping segment.")
                    continue
                content_type = "image/png" if self.encode_format == ".png" else "image/jpeg"
                face_bytes = buf.tobytes()
                face_id = self._stable_uuid(face_bytes)
                outputs.append(
                    FaceObject(
                        face_id=face_id,
                        bbox=(int(x), int(y), int(w), int(h)),
                        width=int(w),
                        height=int(h),
                        content_type=content_type,
                        image_bytes=face_bytes,
                        timestamp_utc=datetime.now(timezone.utc).isoformat(),
                        source_hint=source_hint,
                    )
                )
            self.logger.info("Extracted %d face(s).", len(outputs))
            return outputs

        except NoFacesFoundError as nf:
            self.logger.warning("No faces found: %s", str(nf))
            return []
        except Exception as ex:
            self.logger.exception("Face extraction failed: %s", str(ex))
            return []

    @staticmethod
    def _to_bgr(image: Union[str, bytes, np.ndarray]) -> np.ndarray:
        """
        Convert an input image in various forms to a BGR NumPy array.

        Args:
            image: Path, encoded bytes, or NumPy array (BGR/RGB/gray).

        Returns:
            A NumPy array in BGR color order.

        Raises:
            ValueError: If the input cannot be decoded into an image matrix.
        """
        if isinstance(image, np.ndarray):
            mat = image
        elif isinstance(image, str):
            mat = cv2.imread(image, cv2.IMREAD_COLOR)
        elif isinstance(image, (bytes, bytearray)):
            arr = np.frombuffer(image, dtype=np.uint8)
            mat = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        else:
            raise ValueError("Unsupported image type. Provide path, bytes, or np.ndarray.")
        if mat is None:
            raise ValueError("Failed to decode image input.")
        if len(mat.shape) == 2:
            mat = cv2.cvtColor(mat, cv2.COLOR_GRAY2BGR)
        elif mat.shape[2] == 4:
            mat = cv2.cvtColor(mat, cv2.COLOR_BGRA2BGR)
        return mat

    @staticmethod
    def _stable_uuid(content: bytes) -> str:
        """
        Produce a deterministic UUID5 from the sha256 of the provided content.

        Args:
            content: Bytes used to derive a stable identifier.

        Returns:
            A string UUID that is stable for identical content.
        """
        sha = hashlib.sha256(content).hexdigest()
        ns = uuid.UUID("00000000-0000-0000-0000-000000000000")
        return str(uuid.uuid5(ns, sha))
