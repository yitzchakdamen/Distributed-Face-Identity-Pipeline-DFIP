from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple, Optional
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
        min_neighbors: int = 3,
        eyes_upper_ratio: float = 0.80,
        min_horizontal_gap_ratio: float = 0.14,
        max_vertical_delta_ratio: float = 0.45,
        min_crop_w_for_eyes: int = 80,
        min_crop_h_for_eyes: int = 60,
        enable_profile_ok: bool = True,
        min_profile_bbox_w: int = 140,
        min_profile_bbox_h: int = 120,
        min_profile_sharpness: float = 90.0,
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
        for name in cascade_names:
            path = cv2.data.haarcascades + name
            c = cv2.CascadeClassifier(path)
            if not c.empty():
                self._cascades.append(c)
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

    def has_two_eyes(self, gray_crop: np.ndarray) -> bool:
        """
        Returns True if the crop likely contains eyes.
        Accepts either two-eyes geometry or a single-eye profile fallback.
        """
        H, W = gray_crop.shape[:2]
        if W < self.min_crop_w_for_eyes or H < self.min_crop_h_for_eyes:
            return False

        eyes = self._detect_eyes_best(gray_crop)
        if len(eyes) >= 2 and self._two_eyes_geometry_ok(eyes, W, H):
            return True

        if self.enable_profile_ok and len(eyes) >= 1:
            if self._profile_ok(gray_crop, eyes, W, H):
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
