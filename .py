from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Union
import cv2
import numpy as np
from retinaface import RetinaFace
from face_detection.utils.id_creator import create_stable_face_id, now_utc_iso_ms
from face_detection.utils.logger import Logger

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


class RetinaFaceExtractor:
    """Face detector and cropper using RetinaFace."""

    def __init__(self, threshold: float = 0.8, encode_format: str = ".png") -> None:
        self.threshold = threshold
        self.encode_format = encode_format.lower()
        if self.encode_format not in (".png", ".jpg", ".jpeg"):
            raise ValueError("encode_format must be .png, .jpg, or .jpeg")
        self.logger = logger

    def extract_faces(
        self,
        image: Union[str, bytes, np.ndarray],
        source_hint: Optional[str] = None,
        max_faces: Optional[int] = None,
    ) -> List[FaceObject]:
        try:
            bgr = self._to_bgr(image)
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

            # RetinaFace.detect_faces מחזיר dict של detections
            detections = RetinaFace.detect_faces(rgb, threshold=self.threshold)

            if not detections:
                self.logger.info("No faces detected")
                return []

            outputs: List[FaceObject] = []
            for idx, (key, det) in enumerate(detections.items()):
                if max_faces and idx >= max_faces:
                    break
                x1, y1, x2, y2 = det['facial_area']
                w, h = x2 - x1, y2 - y1
                crop = bgr[y1:y2, x1:x2]

                if not validate_face(crop, w, h):
                    self.logger.info("Face candidate rejected (low quality or not face-like)")
                    continue

                face_bytes, content_type = self._encode_face_crop(crop)
                face_id = create_stable_face_id(face_bytes)
                outputs.append(
                    FaceObject(
                        face_id=face_id,
                        bbox=(int(x1), int(y1), int(w), int(h)),
                        width=int(w),
                        height=int(h),
                        content_type=content_type,
                        image_bytes=face_bytes,
                        timestamp_utc=now_utc_iso_ms(),
                        source_hint=source_hint,
                    )
                )
            self.logger.info("Extracted %d face(s)", len(outputs))
            return outputs

        except Exception as ex:
            self.logger.error("Face extraction failed: %s", str(ex))
            return []

    @staticmethod
    def _to_bgr(image: Union[str, bytes, np.ndarray]) -> np.ndarray:
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
        ok, buf = cv2.imencode(self.encode_format, crop)
        if not ok:
            raise RuntimeError(f"Failed to encode face crop as {self.encode_format}")
        content_type = "image/png" if self.encode_format == ".png" else "image/jpeg"
        return buf.tobytes(), content_type

def validate_face(crop: np.ndarray, w: int, h: int) -> bool:
    """בדיקת איכות הפנים: מינימום גודל, חדות, יחס גובה/רוחב."""
    if w < 30 or h < 30:
        logger.info(f"Rejected face (too small): {w}x{h}")
        return False    
    gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray_crop, cv2.CV_64F).var()
    if blur_score < 50:
        logger.info(f"Rejected face (too blurry): blur_score={blur_score:.2f}")
        return False    
    aspect_ratio = w / float(h)
    if aspect_ratio < 0.7 or aspect_ratio > 1.3:
        logger.info(f"Rejected face (invalid aspect ratio): {aspect_ratio:.2f}")
        return False
    return True
