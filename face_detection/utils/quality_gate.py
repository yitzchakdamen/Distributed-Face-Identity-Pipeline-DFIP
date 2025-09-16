from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple
import os
import cv2
import numpy as np

@dataclass(frozen=True)
class QualityResult:
    """Decision and diagnostics for a single face crop."""
    passed: bool
    score: float
    reasons: List[str]
    metrics: Dict[str, float]
    thresholds_version: str

class QualityGate:
    """
    Evaluates a face crop for minimal training quality.
    Thresholds via ENV:
      QG_MIN_BBOX_H=128, QG_MIN_BBOX_W=128,
      QG_MIN_SHARPNESS=150, QG_BRIGHTNESS_LO=60, QG_BRIGHTNESS_HI=190,
      QG_CONTRAST_MIN=25, QG_THRESHOLDS_VERSION=v1
    """

    def __init__(self) -> None:
        self.min_bbox_h = int(os.getenv("QG_MIN_BBOX_H", "64"))
        self.min_bbox_w = int(os.getenv("QG_MIN_BBOX_W", "64"))
        self.min_sharpness = float(os.getenv("QG_MIN_SHARPNESS", "20"))
        self.brightness_lo = float(os.getenv("QG_BRIGHTNESS_LO", "20"))
        self.brightness_hi = float(os.getenv("QG_BRIGHTNESS_HI", "230"))
        self.contrast_min = float(os.getenv("QG_CONTRAST_MIN", "10"))
        self.version = os.getenv("QG_THRESHOLDS_VERSION", "v1")

    def assess(self, crop_bgr: np.ndarray, bbox_size: Tuple[int, int]) -> QualityResult:
        """
        Args:
            crop_bgr: cropped face (BGR).
            bbox_size: (w, h) of the detected box (pre-crop).
        Returns:
            QualityResult with pass/fail, score, reasons, and raw metrics.
        """
        reasons: List[str] = []
        metrics: Dict[str, float] = {}

        w, h = int(bbox_size[0]), int(bbox_size[1])
        if h < self.min_bbox_h or w < self.min_bbox_w:
            reasons.append("too_small")

        gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
        sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        metrics["sharpness_varlap"] = sharp
        if sharp < self.min_sharpness:
            reasons.append("blurry")

        mean, std = cv2.meanStdDev(gray)
        brightness = float(mean[0][0])
        contrast = float(std[0][0])
        metrics["brightness_mean"] = brightness
        metrics["contrast_std"] = contrast

        if not (self.brightness_lo <= brightness <= self.brightness_hi):
            reasons.append("bad_exposure")
        if contrast < self.contrast_min:
            reasons.append("low_contrast")

        # Simple normalized score (0..1) for telemetry (not used for decision)
        score = (
            (0 if "too_small" in reasons else 1)
            + min(1.0, sharp / max(self.min_sharpness, 1.0))
            + (1 if self.brightness_lo <= brightness <= self.brightness_hi else 0)
            + min(1.0, contrast / max(self.contrast_min, 1.0))
        ) / 4.0

        return QualityResult(
            passed=len(reasons) == 0,
            score=score,
            reasons=reasons,
            metrics=metrics,
            thresholds_version=self.version,
        )
