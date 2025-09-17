import { Router } from "express";
import { CameraController } from "../controllers/cameraController.js";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

// All camera routes require authentication
router.use(authenticateToken);

// Camera CRUD operations (admin and operator only)
router.post("/", requireRole(["admin", "operator"]), CameraController.createCamera);
router.get("/", CameraController.getCameras); // All authenticated users can view cameras they have access to
router.get("/runtime", CameraController.getCamerasWithRuntime); // Get cameras with runtime status
router.get("/:camera_id", CameraController.getCameraById);
router.put("/:camera_id", requireRole(["admin", "operator"]), CameraController.updateCamera);
router.patch("/:camera_id/status", requireRole(["admin", "operator"]), CameraController.updateCameraStatus);
router.delete("/:camera_id", requireRole("admin"), CameraController.deleteCamera);

// Worker heartbeat endpoint (for camera workers to report status)
router.post("/:camera_id/heartbeat", CameraController.workerHeartbeat);

// Camera assignment operations (admin and operator only)
router.post("/:camera_id/assign", requireRole(["admin", "operator"]), CameraController.assignCamera);
router.delete("/:camera_id/assign/:user_id", requireRole(["admin", "operator"]), CameraController.removeAssignment);
router.get("/:camera_id/assignments", requireRole(["admin", "operator"]), CameraController.getCameraAssignments);

export default router;
