// MongoDB routes for persons and alerts functionality

import express from "express";
import { mongoGridFSService } from "../services/mongoGridFSService.js";

const router = express.Router();

// Middleware to check MongoDB availability
const checkMongoDBAvailability = async (req, res, next) => {
  try {
    await mongoGridFSService.connect();
    next();
  } catch (error) {
    // MongoDB service unavailable - return 503 with JSON response
    res.status(503).json({
      success: false,
      error: "MongoDB service unavailable",
      message: "MongoDB connection not configured or service is down",
    });
  }
};

// Apply MongoDB check to all routes
router.use(checkMongoDBAvailability);

/**
 * @route   GET /api/mongo/persons
 * @desc    Get all persons with their images from MongoDB
 * @access  Public (for demo purposes)
 */
router.get("/persons", async (req, res) => {
  try {
    // Set timeout to prevent Heroku H12 errors
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 25000); // 25 seconds
    });

    const dataPromise = async () => {
      const persons = await mongoGridFSService.getPersonsWithImages();
      const stats = await mongoGridFSService.getStats();

      // Calculate additional statistics
      const totalImages = persons.reduce((sum, person) => sum + person.images.length, 0);
      const avgImagesPerPerson = persons.length > 0 ? totalImages / persons.length : 0;
      const maxImages = Math.max(...persons.map((p) => p.images.length), 0);
      const minImages = Math.min(...persons.filter((p) => p.images.length > 0).map((p) => p.images.length), 0);

      return {
        persons,
        stats: {
          ...stats,
          total_persons: persons.length,
          total_images: totalImages,
          avg_images_per_person: avgImagesPerPerson,
          max_images_for_single_person: maxImages,
          min_images_for_single_person: minImages || 0,
        }
      };
    };

    const result = await Promise.race([dataPromise(), timeoutPromise]);

    res.json({
      success: true,
      persons: result.persons,
      stats: result.stats,
    });
  } catch (error) {
    if (error.message === 'Operation timeout') {
      res.status(504).json({
        success: false,
        error: "Gateway timeout",
        message: "MongoDB operation timed out. Please try again later.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to fetch persons data",
        message: error.message,
      });
    }
  }
});

/**
 * @route   GET /api/mongo/alerts
 * @desc    Get all alerts/events from MongoDB with images
 * @access  Public (for demo purposes)
 */
router.get("/alerts", async (req, res) => {
  try {
    const { level, camera_id, limit = 50, skip = 0 } = req.query;

    const filters = {
      level,
      camera_id,
      limit: parseInt(limit),
      skip: parseInt(skip),
    };

    // Set timeout to prevent Heroku H12 errors
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 25000); // 25 seconds
    });

    const dataPromise = async () => {
      const events = await mongoGridFSService.getEvents(filters);

      // Add images to events
      const alertsWithImages = await Promise.all(
        events.map(async (event) => {
          const alertData = {
            person_id: event.person_id,
            time: event.time,
            level: event.level || "info",
            image_id: event.image_id,
            camera_id: event.camera_id,
            message: event.message || `Person detected: ${event.person_id}`,
            image: null,
          };

          // Get image if image_id exists
          if (event.image_id) {
            try {
              const base64Image = await mongoGridFSService.getImageAsBase64(event.image_id);
              alertData.image = base64Image;
            } catch (error) {
              console.warn(`Failed to get image ${event.image_id}:`, error.message);
            }
          }

          return alertData;
        })
      );

      return alertsWithImages;
    };

    const alertsWithImages = await Promise.race([dataPromise(), timeoutPromise]);

    res.json({
      success: true,
      data: alertsWithImages,
      pagination: {
        limit: filters.limit,
        skip: filters.skip,
        total: alertsWithImages.length,
      },
    });
  } catch (error) {
    if (error.message === 'Operation timeout') {
      res.status(504).json({
        success: false,
        error: "Gateway timeout",
        message: "MongoDB operation timed out. Please try again later.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to fetch alerts data",
        message: "MongoDB service is not available or an error occurred",
      });
    }
  }
});

/**
 * @route   GET /api/mongo/image/:imageId
 * @desc    Get specific image by ID
 * @access  Public (for demo purposes)
 */
router.get("/image/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    const { format = "base64" } = req.query;

    if (format === "base64") {
      const base64Image = await mongoGridFSService.getImageAsBase64(imageId);

      if (!base64Image) {
        return res.status(404).json({
          success: false,
          error: "Image not found",
        });
      }

      res.json({
        success: true,
        image: base64Image,
        image_id: imageId,
      });
    } else {
      // Stream the image directly
      const imageData = await mongoGridFSService.getImageById(imageId);

      if (!imageData) {
        return res.status(404).json({
          success: false,
          error: "Image not found",
        });
      }

      res.set({
        "Content-Type": imageData.contentType,
        "Content-Length": imageData.length,
        "Content-Disposition": `inline; filename="${imageData.filename}"`,
      });

      imageData.stream.pipe(res);
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch image",
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/mongo/stats
 * @desc    Get database statistics
 * @access  Public (for demo purposes)
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await mongoGridFSService.getStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
});

export default router;
