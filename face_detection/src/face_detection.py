# # from dataclasses import dataclass, asdict
# # from typing import List, Optional, Tuple, Union
# # import os
# # import cv2
# # import numpy as np
# # from face_detection.utils.id_creator import create_stable_face_id, now_utc_iso_ms
# # from face_detection.utils.logger import Logger
# # from face_detection.utils.quality_gate import QualityGate
# # from face_detection.utils.eye_verifier import EyeVerifier 
# # logger = Logger.get_logger(__name__)

# # MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
# # DNN_FACE_PROTO = os.path.join(MODELS_DIR, "deploy.prototxt")
# # DNN_FACE_MODEL = os.path.join(MODELS_DIR, "res10_300x300_ssd_iter_140000.caffemodel")

# # @dataclass(frozen=True)
# # class FaceObject:
# #     """Immutable container for a single cropped face."""
# #     face_id: str
# #     bbox: Tuple[int, int, int, int]
# #     width: int
# #     height: int
# #     content_type: str
# #     image_bytes: bytes
# #     timestamp_utc: str
# #     source_hint: Optional[str] = None

# #     def to_dict(self) -> dict:
# #         data = asdict(self)
# #         data["image_bytes"] = self.image_bytes
# #         return data

# # class FaceExtractor:
# #     """Advanced face detector and cropper supporting multiple detection methods."""

# #     def __init__(
# #         self,
# #         scale_factor: float = 1.15,  # הגדלה נוספת לסינון יותר מדויק
# #         min_neighbors: int = 5,  # העלאה נוספת לדיוק גבוה יותר
# #         min_size: Tuple[int, int] = (30, 30),  # שמירה על גודל מינימלי לא משתנה
# #         encode_format: str = ".png",
# #         dnn_confidence: float = 0.75,  # העלאה משמעותית של סף הביטחון ב-DNN
# #         enable_image_enhancement: bool = True
# #     ) -> None:
# #         self.scale_factor = scale_factor
# #         self.min_neighbors = min_neighbors
# #         self.min_size = min_size
# #         self.encode_format = encode_format.lower()
# #         self.dnn_confidence = dnn_confidence
# #         self.enable_image_enhancement = enable_image_enhancement
# #         self.logger = logger
        
# #         if self.encode_format not in (".png", ".jpg", ".jpeg"):
# #             raise ValueError("encode_format must be .png, .jpg, or .jpeg")

# #         # הגדרת מודל Haar Cascade
# #         try:
# #             haar_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
# #             self.cascade = cv2.CascadeClassifier(haar_path)
# #         except AttributeError:
# #             # מנתיב אלטרנטיבי אם cv2.data.haarcascades אינו זמין
# #             opencv_dir = os.path.dirname(os.path.dirname(cv2.__file__))
# #             haar_path = os.path.join(opencv_dir, "data", "haarcascades", "haarcascade_frontalface_default.xml")
# #             if not os.path.exists(haar_path):
# #                 # נסיון למצוא את הקובץ בנתיבים אלטרנטיביים
# #                 alt_paths = [
# #                     "/usr/local/share/opencv4/haarcascades/haarcascade_frontalface_default.xml",
# #                     "/usr/share/opencv4/haarcascades/haarcascade_frontalface_default.xml",
# #                     "/usr/local/share/opencv/haarcascades/haarcascade_frontalface_default.xml",
# #                     "C:/opencv/build/etc/haarcascades/haarcascade_frontalface_default.xml"
# #                 ]
# #                 for path in alt_paths:
# #                     if os.path.exists(path):
# #                         haar_path = path
# #                         break
                        
# #             self.cascade = cv2.CascadeClassifier(haar_path)
        
# #         if self.cascade.empty():
# #             raise RuntimeError(f"Failed to load Haar cascade from: {haar_path}")
            
# #         # הגדרת מודל DNN (לפנים)
# #         self.use_dnn = True
# #         os.makedirs(MODELS_DIR, exist_ok=True)
        
# #         # בדיקה אם קבצי המודלים קיימים
# #         if not os.path.exists(DNN_FACE_PROTO) or not os.path.exists(DNN_FACE_MODEL):
# #             self.logger.warning("DNN model files missing. Downloading them...")
# #             self.use_dnn = self._download_dnn_models()
        
# #         # טעינת מודל DNN אם קיים
# #         if self.use_dnn:
# #             try:
# #                 self.net = cv2.dnn.readNetFromCaffe(DNN_FACE_PROTO, DNN_FACE_MODEL)
# #                 self.logger.info("DNN face detection model loaded successfully")
# #             except Exception as e:
# #                 self.use_dnn = False
# #                 self.logger.error(f"Failed to load DNN model: {e}")

# #         # NEW: enable/disable quality gate with ENV (default on)
# #         self._qg_enabled = os.getenv("QG_ENABLED", "1") in ("1", "true", "True", "yes")
# #         self._qg = QualityGate() if self._qg_enabled else None
# #         self.eye_verifier = EyeVerifier()
# #         self.logger = logger
        
# #     def _download_dnn_models(self) -> bool:
# #         """הורדת מודלי DNN אם הם חסרים"""
# #         try:
# #             import urllib.request
            
# #             # יוצרים את התיקייה אם היא לא קיימת
# #             os.makedirs(os.path.dirname(DNN_FACE_PROTO), exist_ok=True)
            
# #             # קישורים להורדת המודלים
# #             proto_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
# #             model_url = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20180205_fp16/res10_300x300_ssd_iter_140000_fp16.caffemodel"
            
# #             # הורדת הקבצים
# #             urllib.request.urlretrieve(proto_url, DNN_FACE_PROTO)
# #             urllib.request.urlretrieve(model_url, DNN_FACE_MODEL)
            
# #             self.logger.info("DNN models downloaded successfully")
# #             return True
# #         except Exception as e:
# #             self.logger.error(f"Failed to download DNN models: {e}")
# #             return False

# #     def _enhance_image(self, image: np.ndarray) -> np.ndarray:
# #         """שיפור איכות תמונה לפני זיהוי פנים"""
# #         if not self.enable_image_enhancement:
# #             return image
            
# #         try:
# #             # המרה למרחב צבע LAB לשיפור בהירות וניגודיות
# #             lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
# #             l, a, b = cv2.split(lab)
            
# #             # שיפור ניגודיות באמצעות CLAHE
# #             clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
# #             cl = clahe.apply(l)
            
# #             # איחוד מחדש של הערוצים
# #             enhanced_lab = cv2.merge((cl, a, b))
# #             enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
# #             denoised = cv2.fastNlMeansDenoisingColored(enhanced, None, 5, 5, 7, 21)
            
# #             return denoised
# #         except Exception as e:
# #             self.logger.warning(f"Image enhancement failed: {e}")
# #             return image
    
# #     def _detect_faces_haar(self, gray_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
# #         """זיהוי פנים באמצעות Haar Cascades"""
# #         faces = self.cascade.detectMultiScale(
# #             gray_image,
# #             scaleFactor=self.scale_factor,
# #             minNeighbors=self.min_neighbors,
# #             minSize=self.min_size,
# #             flags=cv2.CASCADE_SCALE_IMAGE,
# #         )
# #         return faces if len(faces) > 0 else []
    
# #     def _detect_faces_dnn(self, bgr_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
# #         """זיהוי פנים באמצעות מודל DNN"""
# #         if not self.use_dnn:
# #             return []
            
# #         try:
# #             h, w = bgr_image.shape[:2]
# #             # הכנת התמונה לקלט למודל - גודל 300x300
# #             blob = cv2.dnn.blobFromImage(
# #                 bgr_image, 1.0, (300, 300), 
# #                 [104, 117, 123], swapRB=False, crop=False
# #             )
            
# #             # העברת התמונה במודל
# #             self.net.setInput(blob)
# #             detections = self.net.forward()
            
# #             # עיבוד התוצאות
# #             faces = []
# #             for i in range(detections.shape[2]):
# #                 confidence = detections[0, 0, i, 2]
                
# #                 # סינון לפי סף ביטחון
# #                 if confidence > self.dnn_confidence:
# #                     # המרת הקואורדינטות למיקום בתמונה
# #                     x1 = int(detections[0, 0, i, 3] * w)
# #                     y1 = int(detections[0, 0, i, 4] * h)
# #                     x2 = int(detections[0, 0, i, 5] * w)
# #                     y2 = int(detections[0, 0, i, 6] * h)
                    
# #                     # חישוב רוחב וגובה
# #                     box_w = x2 - x1
# #                     box_h = y2 - y1
                    
# #                     # בדיקה שהתיבה בתוך גבולות התמונה
# #                     if x1 >= 0 and y1 >= 0 and box_w > 0 and box_h > 0:
# #                         faces.append((x1, y1, box_w, box_h))
            
# #             return faces
# #         except Exception as e:
# #             self.logger.error(f"DNN face detection failed: {e}")
# #             return []
    
# #     def _detect_faces_multiscale(self, bgr_image: np.ndarray, gray_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
# #         """זיהוי פנים במספר גדלי תמונה שונים לתפיסת פנים במרחקים שונים"""
# #         all_faces = []
# #         scales = [1.0, 0.75, 0.5]  # גדלים לבדיקה
        
# #         for scale in scales:
# #             if scale != 1.0:
# #                 # שינוי גודל התמונה לפי הסקאלה
# #                 width = int(gray_image.shape[1] * scale)
# #                 height = int(gray_image.shape[0] * scale)
# #                 dim = (width, height)
                
# #                 # שינוי גודל התמונות
# #                 resized_gray = cv2.resize(gray_image, dim, interpolation=cv2.INTER_AREA)
# #             else:
# #                 resized_gray = gray_image
                
# #             # זיהוי פנים בתמונה המשונה
# #             faces = self._detect_faces_haar(resized_gray)
            
# #             # התאמת הקואורדינטות חזרה לגודל המקורי
# #             if scale != 1.0 and len(faces) > 0:
# #                 scale_factor = 1.0 / scale
# #                 for i, (x, y, w, h) in enumerate(faces):
# #                     faces[i] = (
# #                         int(x * scale_factor), int(y * scale_factor),
# #                         int(w * scale_factor), int(h * scale_factor)
# #                     )
            
# #             # הוספה לרשימה הכוללת
# #             all_faces.extend(faces)
        
# #         # סינון כפילויות באמצעות Non-Maximum Suppression
# #         return self._filter_overlaps(all_faces)
    
# #     def _filter_overlaps(self, boxes: List[Tuple[int, int, int, int]], threshold: float = 0.5) -> List[Tuple[int, int, int, int]]:
# #         """סינון תיבות חופפות באמצעות Non-Maximum Suppression"""
# #         if not boxes:
# #             return []
            
# #         # המרה למערך נאמפי והפרדת הערכים
# #         if len(boxes) == 0:
# #             return []
            
# #         boxes_array = np.array(boxes)
# #         x1 = boxes_array[:, 0]
# #         y1 = boxes_array[:, 1]
# #         x2 = boxes_array[:, 0] + boxes_array[:, 2]
# #         y2 = boxes_array[:, 1] + boxes_array[:, 3]
        
# #         # חישוב שטחי התיבות
# #         areas = (x2 - x1 + 1) * (y2 - y1 + 1)
        
# #         # מיון לפי גודל התיבה (עדיפות לתיבות גדולות)
# #         indices = np.argsort(areas)[::-1]
        
# #         # ביצוע Non-Maximum Suppression
# #         keep = []
# #         while len(indices) > 0:
# #             i = indices[0]
# #             keep.append(i)
            
# #             # חישוב IoU עם כל התיבות הנותרות
# #             xx1 = np.maximum(x1[i], x1[indices[1:]])
# #             yy1 = np.maximum(y1[i], y1[indices[1:]])
# #             xx2 = np.minimum(x2[i], x2[indices[1:]])
# #             yy2 = np.minimum(y2[i], y2[indices[1:]])
            
# #             w = np.maximum(0, xx2 - xx1 + 1)
# #             h = np.maximum(0, yy2 - yy1 + 1)
            
# #             overlap = (w * h) / areas[indices[1:]]
            
# #             # שמירה רק על תיבות עם חפיפה נמוכה
# #             indices = np.delete(indices, np.concatenate(([0], np.where(overlap > threshold)[0] + 1)))
        
# #         return [boxes[i] for i in keep]

# #     def extract_faces(
# #         self,
# #         image: Union[str, bytes, np.ndarray],
# #         source_hint: Optional[str] = None,
# #         max_faces: Optional[int] = None,
# #     ) -> List[FaceObject]:
# #         """Detect and crop faces using multiple detection methods; returns FaceObject list."""
# #         try:
# #             # המרה לתמונת BGR
# #             bgr = self._to_bgr(image)
            
# #             # שיפור התמונה
# #             if self.enable_image_enhancement:
# #                 bgr = self._enhance_image(bgr)
                
# #             # המרה לגווני אפור
# #             gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
            
# #             # שלב 1: ניסיון זיהוי עם Haar Cascades (מהיר)
# #             faces = self._detect_faces_haar(gray)
            
# #             # שלב 2: אם לא נמצאו פנים, ננסה עם DNN (איטי יותר אך מדויק יותר)
# #             if len(faces) == 0 and self.use_dnn:
# #                 self.logger.debug("No faces found with Haar cascade, trying DNN model")
# #                 faces = self._detect_faces_dnn(bgr)
            
# #             # שלב 3: אם עדיין אין תוצאות, ננסה זיהוי במספר גדלים
# #             if len(faces) == 0:
# #                 self.logger.debug("No faces found with primary methods, trying multiscale detection")
# #                 faces = self._detect_faces_multiscale(bgr, gray)
            
# #             self.logger.debug(f"Total faces detected: {len(faces)}")
            
# #             # הגבלת מספר הפנים אם נדרש
# #             if max_faces and max_faces > 0:
# #                 faces = faces[:max_faces]

# #             outputs: List[FaceObject] = []
# #             for (x, y, w, h) in faces:
# #                 # וידוא שהמיקום תקין
# #                 x = max(0, x)
# #                 y = max(0, y)
# #                 if x + w > bgr.shape[1]:
# #                     w = bgr.shape[1] - x
# #                 if y + h > bgr.shape[0]:
# #                     h = bgr.shape[0] - y
                
# #                 if w <= 0 or h <= 0:
# #                     continue
                    
# #                 # חיתוך הפרצוף
# #                 crop = bgr[y:y+h, x:x+w]
# #                 gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                
# #                 # בדיקה מקדימה - יחס גובה/רוחב סביר לפרצוף
# #                 aspect_ratio = h / w if w > 0 else 0
# #                 if not (0.7 <= aspect_ratio <= 1.5):  # פרצופים בד"כ עגולים או מלבניים מעט
# #                     self.logger.debug(f"Rejected face (invalid aspect ratio {aspect_ratio:.2f}) at bbox=%s", (x, y, w, h))
# #                     continue
                    
# #                 # בדיקה מקדימה - פיזור בהירות סביר לפרצוף
# #                 _, std_dev = cv2.meanStdDev(gray_crop)
# #                 std_dev_val = float(std_dev[0][0])
# #                 if std_dev_val < 15:  # פרצופים בד"כ מכילים שינויי בהירות משמעותיים
# #                     self.logger.debug(f"Rejected face (low variation {std_dev_val:.2f}) at bbox=%s", (x, y, w, h))
# #                     continue
                
# #                 # בדיקת עיניים
# #                 if not self.eye_verifier.has_two_eyes(gray_crop):
# #                     self.logger.debug("Rejected face (eyes not detected) at bbox=%s", (x, y, w, h))
# #                     continue

# #                 # בדיקת איכות
# #                 if self._qg is not None:
# #                     result = self._qg.assess(crop, (int(w), int(h)))
# #                     if not result.passed:
# #                         self.logger.debug(
# #                             "Rejected face (quality): reasons=%s metrics=%s",
# #                             result.reasons, result.metrics
# #                         )
# #                         continue

# #                 # קידוד התמונה וחישוב מזהה
# #                 face_bytes, content_type = self._encode_face_crop(crop)
# #                 face_id = create_stable_face_id(face_bytes)

# #                 outputs.append(
# #                     FaceObject(
# #                         face_id=face_id,
# #                         bbox=(int(x), int(y), int(w), int(h)),
# #                         width=int(w),
# #                         height=int(h),
# #                         content_type=content_type,
# #                         image_bytes=face_bytes,
# #                         timestamp_utc=now_utc_iso_ms(),
# #                         source_hint=source_hint,
# #                     )
# #                 )

# #             if outputs:
# #                 self.logger.info("Extracted %d face(s)", len(outputs))
# #             else:
# #                 self.logger.info("No faces extracted")
# #             return outputs

# #         except Exception as ex:
# #             self.logger.error("Face extraction failed: %s", str(ex))
# #             return []

# #     @staticmethod
# #     def _to_bgr(image: Union[str, bytes, np.ndarray]) -> np.ndarray:
# #         """Convert path/bytes/array to a valid BGR numpy image."""
# #         if isinstance(image, np.ndarray):
# #             mat = image
# #         elif isinstance(image, str):
# #             mat = cv2.imread(image, cv2.IMREAD_COLOR)
# #         elif isinstance(image, (bytes, bytearray)):
# #             arr = np.frombuffer(image, dtype=np.uint8)
# #             mat = cv2.imdecode(arr, cv2.IMREAD_COLOR)
# #         else:
# #             raise ValueError("Unsupported image type")
# #         if mat is None or not isinstance(mat, np.ndarray) or mat.ndim < 2:
# #             raise ValueError("Failed to decode image input")
# #         if mat.ndim == 2:
# #             return cv2.cvtColor(mat, cv2.COLOR_GRAY2BGR)
# #         return mat

# #     def _encode_face_crop(self, crop: np.ndarray) -> Tuple[bytes, str]:
# #         """Encode crop to bytes and return (bytes, content_type)."""
# #         ok, buf = cv2.imencode(self.encode_format, crop)
# #         if not ok:
# #             raise RuntimeError(f"Failed to encode face crop as {self.encode_format}")
# #         content_type = "image/png" if self.encode_format == ".png" else "image/jpeg"
# #         return buf.tobytes(), content_type



# # test the changes
# # if __name__ == "__main__":
# #     detector = FaceExtractor()
# #     test_image_path = "C:/Users/brdwn/Downloads/IMG_20230801_180311.jpg"  # replace with your test image
# #     faces = detector.extract_faces(test_image_path, source_hint="test_image")
# #     for face in faces:
# #         print(f"Face ID: {face.face_id}, Size: {face.width}x{face.height}, Source: {face.source_hint}")
# #         with open(f"{face.face_id}.png", "wb") as f:
# #             f.write(face.image_bytes)




from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Union
import cv2
import numpy as np
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
        """Return a JSON-serializable dictionary of the face object."""
        data = asdict(self)
        data["image_bytes"] = self.image_bytes
        return data


class FaceExtractor:
    """Lean face detector and cropper using OpenCV Haar cascade."""

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
        if self.encode_format not in (".png", ".jpg", ".jpeg"):
            raise ValueError("encode_format must be .png, .jpg, or .jpeg")
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.cascade = cv2.CascadeClassifier(cascade_path)
        if self.cascade.empty():
            raise RuntimeError(f"Failed to load Haar cascade from: {cascade_path}")
        self.logger = logger

    def extract_faces(
        self,
        image: Union[str, bytes, np.ndarray],
        source_hint: Optional[str] = None,
        max_faces: Optional[int] = None,
    ) -> List[FaceObject]:
        """Detect and crop faces; return a list of FaceObject or an empty list on no-detections/errors."""
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
                crop = bgr[y:y + h, x:x + w]

                if not validate_face(crop, w, h):
                    self.logger.info("Face candidate rejected (low quality or not face-like)")
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

def validate_face(crop: np.ndarray, w: int, h: int) -> bool:
    """
    בדיקת איכות הפנים:
    - גודל מינימלי
    - חדות (blur)
    - יחס גובה/רוחב
    מחזירה True אם הפנים תקינים, אחרת False.
    """
    # מינימום גודל
    if w < 40 or h < 40:
        logger.info(f"Rejected face (too small): {w}x{h}")
        return False    
    # בדיקת טשטוש
    gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray_crop, cv2.CV_64F).var()
    if blur_score < 50:  # ערך סף – אפשר לשחק איתו
        logger.info(f"Rejected face (too blurry): blur_score={blur_score:.2f}")
        return False    
    # יחס גובה/רוחב
    aspect_ratio = w / float(h)
    if aspect_ratio < 0.7 or aspect_ratio > 1.3:
        logger.info(f"Rejected face (invalid aspect ratio): {aspect_ratio:.2f}")
        return False
    return True



# from dataclasses import dataclass, asdict
# from typing import List, Optional, Tuple, Union
# import cv2
# import numpy as np
# from retinaface import RetinaFace
# from face_detection.utils.id_creator import create_stable_face_id, now_utc_iso_ms
# from face_detection.utils.logger import Logger

# import insightface
# from insightface.app import FaceAnalysis

# # ctx_id=-1 = CPU בלבד, אם יש CUDA שים ctx_id=0
# app = FaceAnalysis(name="retinaface_mnet025_v2", root="./models")
# app.prepare(ctx_id=-1, det_size=(640, 640))  


# logger = Logger.get_logger(__name__)

# @dataclass(frozen=True)
# class FaceObject:
#     """Immutable container for a single cropped face."""
#     face_id: str
#     bbox: Tuple[int, int, int, int]
#     width: int
#     height: int
#     content_type: str
#     image_bytes: bytes
#     timestamp_utc: str
#     source_hint: Optional[str] = None

#     def to_dict(self) -> dict:
#         data = asdict(self)
#         data["image_bytes"] = self.image_bytes
#         return data


# class RetinaFaceExtractor:
#     """Face detector and cropper using RetinaFace."""

#     def __init__(self, threshold: float = 0.8, encode_format: str = ".png") -> None:
#         self.threshold = threshold
#         self.encode_format = encode_format.lower()
#         if self.encode_format not in (".png", ".jpg", ".jpeg"):
#             raise ValueError("encode_format must be .png, .jpg, or .jpeg")
#         self.logger = logger

#     def extract_faces(
#         self,
#         image: Union[str, bytes, np.ndarray],
#         source_hint: Optional[str] = None,
#         max_faces: Optional[int] = None,
#     ) -> List[FaceObject]:
#         try:
#             bgr = self._to_bgr(image)
#             rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

#             # RetinaFace.detect_faces מחזיר dict של detections
#             # detections = RetinaFace.detect_faces(rgb, threshold=self.threshold)
            
#             detections = app.get(image)  # image = numpy array (BGR)



            
#             if not detections:
#                 self.logger.info("No faces detected")
#                 return []
            
            

#             outputs: List[FaceObject] = []
#             for idx, (key, det) in enumerate(detections.items()):
#                 if max_faces and idx >= max_faces:
#                     break
#                 x1, y1, x2, y2 = det['facial_area']
#                 w, h = x2 - x1, y2 - y1
#                 crop = bgr[y1:y2, x1:x2]

#                 if not validate_face(crop, w, h):
#                     self.logger.info("Face candidate rejected (low quality or not face-like)")
#                     continue

#                 face_bytes, content_type = self._encode_face_crop(crop)
#                 face_id = create_stable_face_id(face_bytes)
#                 outputs.append(
#                     FaceObject(
#                         face_id=face_id,
#                         bbox=(int(x1), int(y1), int(w), int(h)),
#                         width=int(w),
#                         height=int(h),
#                         content_type=content_type,
#                         image_bytes=face_bytes,
#                         timestamp_utc=now_utc_iso_ms(),
#                         source_hint=source_hint,
#                     )
#                 )
#             self.logger.info("Extracted %d face(s)", len(outputs))
#             return outputs

#         except Exception as ex:
#             self.logger.error("Face extraction failed: %s", str(ex))
#             return []

#     @staticmethod
#     def _to_bgr(image: Union[str, bytes, np.ndarray]) -> np.ndarray:
#         if isinstance(image, np.ndarray):
#             mat = image
#         elif isinstance(image, str):
#             mat = cv2.imread(image, cv2.IMREAD_COLOR)
#         elif isinstance(image, (bytes, bytearray)):
#             arr = np.frombuffer(image, dtype=np.uint8)
#             mat = cv2.imdecode(arr, cv2.IMREAD_COLOR)
#         else:
#             raise ValueError("Unsupported image type")
#         if mat is None or not isinstance(mat, np.ndarray) or mat.ndim < 2:
#             raise ValueError("Failed to decode image input")
#         if mat.ndim == 2:
#             return cv2.cvtColor(mat, cv2.COLOR_GRAY2BGR)
#         return mat

#     def _encode_face_crop(self, crop: np.ndarray) -> Tuple[bytes, str]:
#         ok, buf = cv2.imencode(self.encode_format, crop)
#         if not ok:
#             raise RuntimeError(f"Failed to encode face crop as {self.encode_format}")
#         content_type = "image/png" if self.encode_format == ".png" else "image/jpeg"
#         return buf.tobytes(), content_type

# def validate_face(crop: np.ndarray, w: int, h: int) -> bool:
#     """בדיקת איכות הפנים: מינימום גודל, חדות, יחס גובה/רוחב."""
#     if w < 30 or h < 30:
#         logger.info(f"Rejected face (too small): {w}x{h}")
#         return False    
#     gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
#     blur_score = cv2.Laplacian(gray_crop, cv2.CV_64F).var()
#     if blur_score < 50:
#         logger.info(f"Rejected face (too blurry): blur_score={blur_score:.2f}")
#         return False    
#     aspect_ratio = w / float(h)
#     if aspect_ratio < 0.7 or aspect_ratio > 1.3:
#         logger.info(f"Rejected face (invalid aspect ratio): {aspect_ratio:.2f}")
#         return False
#     return True
