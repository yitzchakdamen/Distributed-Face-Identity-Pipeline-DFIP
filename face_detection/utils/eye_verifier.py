from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple, Optional
import os
import cv2
import numpy as np


@dataclass(frozen=True)
class EyeDetection:
    """
    Single eye detection result.
    """
    bbox: Tuple[int, int, int, int]
    center: Tuple[float, float]


class EyeVerifier:
    """
    Verifies that a face crop plausibly contains eyes.
    Softer defaults: passes either two-eyes geometry OR a profile case with one eye.
    """

    def __init__(
        self,
        cascade_names: Optional[List[str]] = None,
        scale_factor: float = 1.2,
        min_neighbors: int = 4,  # העלאה נוספת לדיוק טוב יותר 
        eyes_upper_ratio: float = 0.75,  # הגבלה חזקה יותר של אזור החיפוש
        min_horizontal_gap_ratio: float = 0.15,  # דרישה למרחק גדול יותר בין העיניים
        max_vertical_delta_ratio: float = 0.35,  # הפחתה נוספת של הפער האנכי המותר
        min_crop_w_for_eyes: int = 40,  # משאיר כמו שהיה
        min_crop_h_for_eyes: int = 30,  # משאיר כמו שהיה
        enable_profile_ok: bool = True,
        min_profile_bbox_w: int = 60,  # משאיר כמו שהיה
        min_profile_bbox_h: int = 60,  # משאיר כמו שהיה 
        min_profile_sharpness: float = 80.0,  # העלאה משמעותית של סף החדות
    ) -> None:
        """
        Args:
            cascade_names: Optional list of Haar eye cascades to try in order.
            scale_factor: Pyramid scale factor for eye detector.
            min_neighbors: Haar minNeighbors for eye detector.
            eyes_upper_ratio: Eyes must lie above this fraction of crop height.
            min_horizontal_gap_ratio: Minimal left-right eye gap as fraction of width.
            max_vertical_delta_ratio: Max vertical misalignment as fraction of height.
            min_crop_w_for_eyes, min_crop_h_for_eyes: Minimal crop size to attempt eye finding.
            enable_profile_ok: Allow one-eye profile fallback.
            min_profile_bbox_w, min_profile_bbox_h: Minimal crop size to accept profile.
            min_profile_sharpness: Minimal variance-of-Laplacian to accept profile.
        """
        if cascade_names is None:
            cascade_names = [
                "haarcascade_eye_tree_eyeglasses.xml",
                "haarcascade_eye.xml",
            ]
        self._cascades: List[cv2.CascadeClassifier] = []
        
        try:
            # נסיון לטעון קסקדות מהמיקום הסטנדרטי
            for name in cascade_names:
                try:
                    path = os.path.join(cv2.data.haarcascades, name)
                    c = cv2.CascadeClassifier(path)
                    if not c.empty():
                        self._cascades.append(c)
                except (AttributeError, TypeError):
                    pass
                    
            # אם לא הצלחנו לטעון, ננסה מיקומים נוספים
            if not self._cascades:
                for name in cascade_names:
                    alt_paths = [
                        f"/usr/local/share/opencv4/haarcascades/{name}",
                        f"/usr/share/opencv4/haarcascades/{name}",
                        f"/usr/local/share/opencv/haarcascades/{name}",
                        f"C:/opencv/build/etc/haarcascades/{name}",
                    ]
                    
                    # ננסה למצוא את המיקום של ה-cascade בחבילת OpenCV
                    try:
                        import importlib.resources as pkg_resources
                        from cv2 import data as cv2_data
                        try:
                            opencv_dir = os.path.dirname(os.path.dirname(cv2.__file__))
                            alt_paths.append(os.path.join(opencv_dir, "data", "haarcascades", name))
                        except Exception:
                            pass
                    except (ImportError, AttributeError):
                        pass
                        
                    # נסיון לטעון מכל אחד מהנתיבים האלטרנטיביים
                    for path in alt_paths:
                        if os.path.exists(path):
                            c = cv2.CascadeClassifier(path)
                            if not c.empty():
                                self._cascades.append(c)
                                break
        except Exception as e:
            print(f"Error loading eye cascades: {e}")
                
        if not self._cascades:
            raise RuntimeError("Failed to load any eye cascades.")

        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.eyes_upper_ratio = eyes_upper_ratio
        self.min_horizontal_gap_ratio = min_horizontal_gap_ratio
        self.max_vertical_delta_ratio = max_vertical_delta_ratio
        self.min_crop_w_for_eyes = min_crop_w_for_eyes
        self.min_crop_h_for_eyes = min_crop_h_for_eyes
        self.enable_profile_ok = enable_profile_ok
        self.min_profile_bbox_w = min_profile_bbox_w
        self.min_profile_bbox_h = min_profile_bbox_h
        self.min_profile_sharpness = min_profile_sharpness

    def _enhance_eye_region(self, gray_crop: np.ndarray) -> np.ndarray:
        """שיפור אזור העיניים לזיהוי טוב יותר"""
        try:
            # יצירת CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray_crop)
            
            # העלאת ניגודיות
            alpha = 1.3  # פרמטר ניגודיות - ערכים גדולים מ-1 מגדילים את הניגודיות
            beta = 5     # פרמטר בהירות - ערכים חיוביים מגדילים את הבהירות
            enhanced = cv2.convertScaleAbs(enhanced, alpha=alpha, beta=beta)
            
            return enhanced
        except Exception:
            return gray_crop
    
    def _detect_eyes_with_threshold(self, gray_crop: np.ndarray) -> List[EyeDetection]:
        """זיהוי עיניים בעזרת סיפי עיבוד תמונה"""
        try:
            # החלקת התמונה להפחתת רעשים
            blurred = cv2.GaussianBlur(gray_crop, (5, 5), 0)
            
            # סף אדפטיבי
            thresh = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # פתיחה מורפולוגית להסרת רעשים קטנים
            kernel = np.ones((3, 3), np.uint8)
            opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
            
            # מציאת קונטורים
            contours, _ = cv2.findContours(opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            H, W = gray_crop.shape[:2]
            min_eye_area = (W * H) * 0.001  # אזור מינימלי של עין
            max_eye_area = (W * H) * 0.05   # אזור מקסימלי של עין
            
            eyes = []
            upper_half = int(H * 0.6)  # מיקוד החיפוש במחצית העליונה של הפנים
            
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                area = w * h
                
                # סינון לפי גודל וצורה
                if min_eye_area < area < max_eye_area and 0.5 < w / h < 2.0 and y < upper_half:
                    eyes.append(
                        EyeDetection(
                            bbox=(int(x), int(y), int(w), int(h)),
                            center=(float(x + w / 2.0), float(y + h / 2.0)),
                        )
                    )
            
            return eyes
        except Exception:
            return []
    
    def has_two_eyes(self, gray_crop: np.ndarray) -> bool:
        """
        מאמת שיש עיניים בתמונת פנים.
        משתמש במספר שיטות ומחזיר ציון מבוסס החלטה גמיש יותר מאשר כן/לא קטגורי.
        """
        H, W = gray_crop.shape[:2]
        
        # אם התמונה קטנה מדי, נניח שהיא בסדר
        if W < self.min_crop_w_for_eyes or H < self.min_crop_h_for_eyes:
            return True  # יותר מקל - נאמין לזיהוי הפנים גם בתמונות קטנות
        
        # שלב 1: ננסה בתמונה המקורית
        eyes = self._detect_eyes_best(gray_crop)
        if len(eyes) >= 2 and self._two_eyes_geometry_ok(eyes, W, H):
            return True
            
        # שלב 2: ננסה בתמונה משופרת
        enhanced = self._enhance_eye_region(gray_crop)
        enhanced_eyes = self._detect_eyes_best(enhanced)
        if len(enhanced_eyes) >= 2 and self._two_eyes_geometry_ok(enhanced_eyes, W, H):
            return True
            
        # שלב 3: ננסה עם שיטת הסף
        threshold_eyes = self._detect_eyes_with_threshold(gray_crop)
        if len(threshold_eyes) >= 2 and self._two_eyes_geometry_ok(threshold_eyes, W, H):
            return True
            
        # שלב 4: בדיקת מקרה פרופיל (עין אחת)
        if self.enable_profile_ok:
            all_eyes = eyes + enhanced_eyes + threshold_eyes
            if len(all_eyes) >= 1:
                if self._profile_ok(gray_crop, all_eyes, W, H):
                    return True
        
        # שלב 5: אם התמונה גדולה מספיק וחדה, נאשר אותה גם אם לא מצאנו עיניים
        # אבל רק בתנאים מחמירים יותר כדי למנוע זיהויים שגויים
        if W >= self.min_profile_bbox_w * 2.0 and H >= self.min_profile_bbox_h * 2.0:  # דרישה לגודל גדול יותר
            sharpness = float(cv2.Laplacian(gray_crop, cv2.CV_64F).var())
            # בדיקה מחמירה מאוד של חדות
            if sharpness >= self.min_profile_sharpness:  # שימוש בסף מלא
                # בדיקה של מאפייני פרצוף טיפוסיים
                
                # 1. בדיקת הבדלי בהירות בין אזורים שונים של הפנים
                upper_region = gray_crop[:int(H*0.4), :]  # אזור העיניים
                middle_region = gray_crop[int(H*0.4):int(H*0.7), :]  # אזור האף
                lower_region = gray_crop[int(H*0.7):, :]  # אזור הפה
                
                mean_upper = np.mean(upper_region) if upper_region.size > 0 else 0
                mean_middle = np.mean(middle_region) if middle_region.size > 0 else 0
                mean_lower = np.mean(lower_region) if lower_region.size > 0 else 0
                
                # בפרצופים יש הבדלי תאורה בין החלקים השונים
                # חישוב הפרש בהירות
                brightness_diff1 = abs(float(mean_upper) - float(mean_middle))
                brightness_diff2 = abs(float(mean_middle) - float(mean_lower))
                brightness_diff = max(brightness_diff1, brightness_diff2)
                
                # 2. בדיקת סימטריה אופקית
                left_half = gray_crop[:, :int(W/2)]
                right_half = gray_crop[:, int(W/2):]
                
                mean_left = np.mean(left_half) if left_half.size > 0 else 0
                mean_right = np.mean(right_half) if right_half.size > 0 else 0
                
                # פרצופים בד"כ סימטריים יחסית
                symmetry = abs(float(mean_left) - float(mean_right)) < 30
                
                # 3. בדיקת ניגודיות כללית של התמונה
                contrast = float(np.std(gray_crop))
                
                # אישור רק אם עוברים את כל הבדיקות המחמירות
                if brightness_diff > 10 and contrast > 20 and symmetry:
                    return True

        return False

    def _detect_eyes_best(self, gray_crop: np.ndarray) -> List[EyeDetection]:
        """
        Runs all configured cascades and returns the eye set with the highest count.
        """
        best: List[EyeDetection] = []
        for c in self._cascades:
            det = c.detectMultiScale(
                gray_crop,
                scaleFactor=self.scale_factor,
                minNeighbors=self.min_neighbors,
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            cur: List[EyeDetection] = []
            for (ex, ey, ew, eh) in det:
                cur.append(
                    EyeDetection(
                        bbox=(int(ex), int(ey), int(ew), int(eh)),
                        center=(float(ex + ew / 2.0), float(ey + eh / 2.0)),
                    )
                )
            if len(cur) > len(best):
                best = cur
        return best

    def _two_eyes_geometry_ok(self, eyes: List[EyeDetection], W: int, H: int) -> bool:
        """
        Validates two-eye geometry with softened constraints.
        """
        eyes_sorted = sorted(eyes, key=lambda e: e.center[0])
        left, right = eyes_sorted[0], eyes_sorted[-1]
        if not (left.center[1] < H * self.eyes_upper_ratio and right.center[1] < H * self.eyes_upper_ratio):
            return False
        horizontal_gap = right.center[0] - left.center[0]
        vertical_delta = abs(right.center[1] - left.center[1])
        if horizontal_gap < W * self.min_horizontal_gap_ratio:
            return False
        if vertical_delta > H * self.max_vertical_delta_ratio:
            return False
        return True

    def _profile_ok(self, gray_crop: np.ndarray, eyes: List[EyeDetection], W: int, H: int) -> bool:
        """
        Accepts a profile case with one clear eye and sufficient crop quality.
        """
        if W < self.min_profile_bbox_w or H < self.min_profile_bbox_h:
            return False
        eye = max(eyes, key=lambda e: e.bbox[2] * e.bbox[3])
        if not (eye.center[1] < H * self.eyes_upper_ratio):
            return False
        sharpness = float(cv2.Laplacian(gray_crop, cv2.CV_64F).var())
        if sharpness < self.min_profile_sharpness:
            return False
        return True
