import { Router } from "express";
import { CameraController } from "../controllers/cameraController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// All camera routes require authentication
router.use(authenticateToken);

// Camera CRUD operations
router.post("/", CameraController.createCamera);
router.get("/", CameraController.getCameras);
router.get("/:camera_id", CameraController.getCameraById);
router.put("/:camera_id", CameraController.updateCamera);
router.delete("/:camera_id", CameraController.deleteCamera);

// Camera assignment operations
router.post("/:camera_id/assign", CameraController.assignCamera);
router.delete("/:camera_id/assign/:user_id", CameraController.removeAssignment);
router.get("/:camera_id/assignments", CameraController.getCameraAssignments);

export default router;
