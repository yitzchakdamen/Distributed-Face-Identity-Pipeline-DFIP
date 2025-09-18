// Direct camera routes without /api/mongo prefix
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { mongoGridFSService } from "../services/mongoGridFSService.js";
import { shouldUseMongoDB } from "../utils/mongoUtils.js";
import { Camera } from "../models/camera.js";

const router = express.Router();

/**
 * Get events for a specific camera from MongoDB
 */
router.get("/:cameraId/events", authenticateToken, async (req, res) => {
  try {
    if (!shouldUseMongoDB()) {
      return res.status(503).json({
        success: false,
        error: "MongoDB functionality is not configured or unavailable"
      });
    }
    
    await mongoGridFSService.connect();
    
    const { cameraId } = req.params;
    const { 
      level, 
      startDate, 
      endDate, 
      limit = 50, 
      skip = 0,
      includeImages = false
    } = req.query;
    
    // Check if user has access to the requested camera
    const userCameras = await getUserCameras(req.user.id, req.user.role);
    if (!userCameras.includes(cameraId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You don't have access to this camera"
      });
    }
    
    const filters = {
      camera_id: cameraId,
      level,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      skip: parseInt(skip),
    };
    
    const events = await mongoGridFSService.getEvents(filters);
    
    // Add images to events if requested
    let eventsResponse = events;
    if (includeImages === 'true') {
      eventsResponse = await Promise.all(
        events.map(async (event) => {
          const eventData = { ...event };
          
          // Get image if image_id exists
          if (event.image_id) {
            try {
              const base64Image = await mongoGridFSService.getImageAsBase64(event.image_id);
              eventData.image = base64Image;
            } catch (error) {
              console.warn(`Failed to get image ${event.image_id}:`, error.message);
            }
          }
          
          return eventData;
        })
      );
    }
    
    return res.status(200).json({
      success: true,
      data: eventsResponse,
      pagination: {
        total: await mongoGridFSService.countEvents(filters),
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching camera events:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch camera events"
    });
  }
});

/**
 * Get the most recent event for a specific camera
 */
router.get("/:cameraId/latest", authenticateToken, async (req, res) => {
  try {
    if (!shouldUseMongoDB()) {
      return res.status(503).json({
        success: false,
        error: "MongoDB functionality is not configured or unavailable"
      });
    }
    
    await mongoGridFSService.connect();
    
    const { cameraId } = req.params;
    const { includeImage = false } = req.query;
    
    // Check if user has access to the requested camera
    const userCameras = await getUserCameras(req.user.id, req.user.role);
    if (!userCameras.includes(cameraId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You don't have access to this camera"
      });
    }
    
    const latestEvent = await mongoGridFSService.getLatestEvent(cameraId);
    
    if (!latestEvent) {
      return res.status(404).json({
        success: false,
        error: "No events found for this camera"
      });
    }
    
    // Add image if requested
    if (includeImage === 'true' && latestEvent.image_id) {
      try {
        latestEvent.image = await mongoGridFSService.getImageAsBase64(latestEvent.image_id);
      } catch (error) {
        console.warn(`Failed to get image ${latestEvent.image_id}:`, error.message);
      }
    }
    
    return res.status(200).json({
      success: true,
      data: latestEvent
    });
  } catch (error) {
    console.error('Error fetching latest camera event:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch latest camera event"
    });
  }
});

/**
 * Get event statistics for a specific camera
 */
router.get("/:cameraId/stats", authenticateToken, async (req, res) => {
  try {
    if (!shouldUseMongoDB()) {
      return res.status(503).json({
        success: false,
        error: "MongoDB functionality is not configured or unavailable"
      });
    }
    
    await mongoGridFSService.connect();
    
    const { cameraId } = req.params;
    let { startDate, endDate } = req.query;
    
    // Default to last 7 days if not specified
    if (!startDate) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      startDate = sevenDaysAgo.toISOString();
    }
    
    if (!endDate) {
      endDate = new Date().toISOString();
    }
    
    // Check if user has access to the requested camera
    const userCameras = await getUserCameras(req.user.id, req.user.role);
    if (!userCameras.includes(cameraId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You don't have access to this camera"
      });
    }
    
    const stats = await mongoGridFSService.getCameraStats(cameraId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching camera statistics:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch camera statistics"
    });
  }
});

/**
 * Get a specific image from a camera
 */
router.get("/:cameraId/image/:imageId", authenticateToken, async (req, res) => {
  try {
    if (!shouldUseMongoDB()) {
      return res.status(503).json({
        success: false,
        error: "MongoDB functionality is not configured or unavailable"
      });
    }
    
    await mongoGridFSService.connect();
    
    const { cameraId, imageId } = req.params;
    const { format = 'binary' } = req.query;
    
    // Check if user has access to the requested camera
    const userCameras = await getUserCameras(req.user.id, req.user.role);
    if (!userCameras.includes(cameraId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You don't have access to this camera"
      });
    }
    
    // Verify image belongs to this camera
    const event = await mongoGridFSService.getEventByImageId(imageId);
    if (!event || event.camera_id !== cameraId) {
      return res.status(404).json({
        success: false,
        error: "Image not found for this camera"
      });
    }
    
    if (format === 'base64') {
      const base64Image = await mongoGridFSService.getImageAsBase64(imageId);
      return res.status(200).json({
        success: true,
        data: base64Image
      });
    } else {
      // Stream the binary image data
      const stream = await mongoGridFSService.getImageStream(imageId);
      res.set('Content-Type', 'image/jpeg');
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Error fetching camera image:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch camera image"
    });
  }
});

// Helper function to get user cameras
async function getUserCameras(userId, userRole) {
  if (userRole === 'admin') {
    const allCameras = await Camera.getAllCameras();
    return allCameras.map(camera => camera.camera_id);
  } else {
    const userCameras = await Camera.getCamerasByUserId(userId);
    return userCameras.map(camera => camera.camera_id);
  }
}

export default router;
