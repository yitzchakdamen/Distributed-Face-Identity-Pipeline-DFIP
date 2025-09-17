// Dashboard routes for real-time statistics

import express from "express";
import { mongoGridFSService } from "../services/mongoGridFSService.js";
import { isMongoDBAvailable } from "../db/mongodb.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getUserById } from "../services/userService.js";
import { Camera } from "../models/camera.js";

const router = express.Router();

// Get dashboard statistics based on user role and assigned cameras
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stats = {
      activeCameras: 0,
      todaysEvents: 0,
      highRiskAlerts: 0,
      systemStatus: 'offline',
      userCameras: []
    };

    // Get user's assigned cameras
    if (userRole === 'admin') {
      // Admin sees all cameras
      const allCameras = await Camera.getAllCameras();
      stats.activeCameras = allCameras.length;
      stats.userCameras = allCameras;
    } else {
      // Regular users see only their assigned cameras
      const userCameras = await Camera.getCamerasByUserId(userId);
      stats.userCameras = userCameras;
      stats.activeCameras = userCameras.length;
    }

    // Check MongoDB system status
    if (isMongoDBAvailable()) {
      stats.systemStatus = 'online';
      
      try {
        await mongoGridFSService.connect();
        
        // Get today's events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysEvents = await mongoGridFSService.db.collection('events')
          .countDocuments({
            timestamp: {
              $gte: today,
              $lt: tomorrow
            }
          });

        stats.todaysEvents = todaysEvents;

        // Get high risk alerts (events with confidence > 0.8)
        const highRiskAlerts = await mongoGridFSService.db.collection('events')
          .countDocuments({
            timestamp: {
              $gte: today,
              $lt: tomorrow
            },
            'detection_metadata.confidence': { $gt: 0.8 }
          });

        stats.highRiskAlerts = highRiskAlerts;

      } catch (mongoError) {
        console.warn('MongoDB query failed:', mongoError.message);
        // Keep system status as online but use fallback values
      }
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard stats',
      details: error.message 
    });
  }
});

export default router;
