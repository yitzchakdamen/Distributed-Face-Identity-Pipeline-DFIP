/**
 * Camera Manager API Routes
 * Provides endpoints to monitor and control the camera manager
 */
import { Router } from "express";
import { cameraManager } from "../services/camera-manager/CameraManager.js";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * Get camera manager status
 */
router.get("/status", requireRole(["admin", "operator"]), (req, res) => {
    try {
        const allWorkers = cameraManager.getAllWorkers();
        
        res.json({
            success: true,
            data: {
                is_running: cameraManager.isRunning,
                worker_count: allWorkers.length,
                workers: allWorkers
            }
        });
    } catch (error) {
        console.error("Get camera manager status error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get worker status for specific camera
 */
router.get("/workers/:camera_id", requireRole(["admin", "operator"]), (req, res) => {
    try {
        const { camera_id } = req.params;
        const workerStatus = cameraManager.getWorkerStatus(camera_id);
        
        if (!workerStatus) {
            return res.status(404).json({
                success: false,
                message: "Worker not found for this camera"
            });
        }

        res.json({
            success: true,
            data: {
                camera_id,
                ...workerStatus
            }
        });
    } catch (error) {
        console.error("Get worker status error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Test endpoint to manually trigger camera events (for testing)
 */
router.post("/test/camera-events", requireRole(["admin"]), (req, res) => {
    try {
        const { event_type, camera_id } = req.body;
        
        // Mock camera object for testing
        const mockCamera = {
            id: camera_id,
            name: `Test Camera ${camera_id}`,
            connection_string: "rtsp://test:test@192.168.1.100:554/stream",
            status: event_type === 'enabled' ? 'enabled' : 'disabled'
        };

        // Publish test event
        if (event_type === 'enabled') {
            cameraManager.handleCameraEnabled({
                camera_id,
                camera: mockCamera,
                timestamp: new Date().toISOString()
            });
        } else if (event_type === 'disabled') {
            cameraManager.handleCameraDisabled({
                camera_id,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            message: `Test ${event_type} event triggered for camera ${camera_id}`
        });
    } catch (error) {
        console.error("Test camera event error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
