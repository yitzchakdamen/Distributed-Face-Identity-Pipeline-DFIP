from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Union
import os
import cv2
import numpy as np
from face_detection.utils.id_creator import create_stable_face_id, now_utc_iso_ms
from face_detection.utils.logger import Logger
from face_detection.utils.quality_gate import QualityGate
from face_detection.utils.eye_verifier import EyeVerifier 
logger = Logger.get_logger(__name__)

@dataclass(frozen=True)
class FaceObject:
    """Immutable container for a single cropped face."""
    face_id: str
    bbox: Tuple[int, int, int, int]
    width: int
    height: int
    content_type: str
    image_bytes: bytes
    timestamp_utc: str
    source_hint: Optional[str] = None

    def to_dict(self) -> dict:
        data = asdict(self)
        data["image_bytes"] = self.image_bytes
        return data

class FaceExtractor:
    """Lean face detector and cropper using OpenCV Haar cascade."""

    def __init__(
        self,
        scale_factor: float = 1.1,
        min_neighbors: int = 4,
        min_size: Tuple[int, int] = (64, 64),
        encode_format: str = ".png",
    ) -> None:
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.min_size = min_size
        self.encode_format = encode_format.lower()
        if self.encode_format not in (".png", ".jpg", ".jpeg"):
            raise ValueError("encode_format must be .png, .jpg, or .jpeg")

        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.cascade = cv2.CascadeClassifier(cascade_path)
        if self.cascade.empty():
            raise RuntimeError(f"Failed to load Haar cascade from: {cascade_path}")

        # NEW: enable/disable quality gate with ENV (default on)
        self._qg_enabled = os.getenv("QG_ENABLED", "1") in ("1", "true", "True", "yes")
        self._qg = QualityGate() if self._qg_enabled else None
        self.eye_verifier = EyeVerifier()
        self.logger = logger

    def extract_faces(
        self,
        image: Union[str, bytes, np.ndarray],
        source_hint: Optional[str] = None,
        max_faces: Optional[int] = None,
    ) -> List[FaceObject]:
        """Detect and crop faces; returns FaceObject list."""
        try:
            bgr = self._to_bgr(image)
            gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

            faces = self.cascade.detectMultiScale(
                gray,
                scaleFactor=self.scale_factor,
                minNeighbors=self.min_neighbors,
                minSize=self.min_size,
                flags=cv2.CASCADE_SCALE_IMAGE,
            )
            if max_faces and max_faces > 0:
                faces = faces[:max_faces]

            outputs: List[FaceObject] = []
            for (x, y, w, h) in faces:
                crop = bgr[max(0, y): y + h, max(0, x): x + w]
                gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                if not self.eye_verifier.has_two_eyes(gray_crop):
                    self.logger.debug("Rejected face (eyes not detected) at bbox=%s", (x, y, w, h))
                    continue

                # NEW: quality check (drop if fails), no signature changes
                if self._qg is not None:
                    result = self._qg.assess(crop, (int(w), int(h)))
                    if not result.passed:
                        self.logger.debug(
                            "Rejected face (quality): reasons=%s metrics=%s",
                            result.reasons, result.metrics
                        )
                        continue

                face_bytes, content_type = self._encode_face_crop(crop)
                face_id = create_stable_face_id(face_bytes)

                outputs.append(
                    FaceObject(
                        face_id=face_id,
                        bbox=(int(x), int(y), int(w), int(h)),
                        width=int(w),
                        height=int(h),
                        content_type=content_type,
                        image_bytes=face_bytes,
                        timestamp_utc=now_utc_iso_ms(),
                        source_hint=source_hint,
                    )
                )

            if outputs:
                self.logger.info("Extracted %d face(s)", len(outputs))
            else:
                self.logger.info("No faces extracted")
            return outputs

        except Exception as ex:
            self.logger.error("Face extraction failed: %s", str(ex))
            return []

    @staticmethod
    def _to_bgr(image: Union[str, bytes, np.ndarray]) -> np.ndarray:
        """Convert path/bytes/array to a valid BGR numpy image."""
        if isinstance(image, np.ndarray):
            mat = image
        elif isinstance(image, str):
            mat = cv2.imread(image, cv2.IMREAD_COLOR)
        elif isinstance(image, (bytes, bytearray)):
            arr = np.frombuffer(image, dtype=np.uint8)
            mat = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        else:
            raise ValueError("Unsupported image type")
        if mat is None or not isinstance(mat, np.ndarray) or mat.ndim < 2:
            raise ValueError("Failed to decode image input")
        if mat.ndim == 2:
            return cv2.cvtColor(mat, cv2.COLOR_GRAY2BGR)
        return mat

    def _encode_face_crop(self, crop: np.ndarray) -> Tuple[bytes, str]:
        """Encode crop to bytes and return (bytes, content_type)."""
        ok, buf = cv2.imencode(self.encode_format, crop)
        if not ok:
            raise RuntimeError(f"Failed to encode face crop as {self.encode_format}")
        content_type = "image/png" if self.encode_format == ".png" else "image/jpeg"
        return buf.tobytes(), content_type



# test the changes
if __name__ == "__main__":
    detector = FaceExtractor()
    test_image_path = "C:/Users/brdwn/Downloads/IMG_20230801_180311.jpg"  # replace with your test image
    faces = detector.extract_faces(test_image_path, source_hint="test_image")
    for face in faces:
        print(f"Face ID: {face.face_id}, Size: {face.width}x{face.height}, Source: {face.source_hint}")
        with open(f"{face.face_id}.png", "wb") as f:
            f.write(face.image_bytes)