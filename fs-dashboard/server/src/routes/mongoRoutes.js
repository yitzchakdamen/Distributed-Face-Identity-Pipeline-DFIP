// MongoDB routes for persons and alerts functionality

import express from "express";
import { mongoGridFSService } from "../services/mongoGridFSService.js";

const router = express.Router();

// Mock data for when MongoDB is unavailable
const mockPersonsData = {
  success: true,
  persons: [
    {
      person_id: "demo_person_001",
      images: [
        {
          image_id: "demo_image_001",
          filename: "demo_person_001_1.jpg",
          timestamp: new Date().toISOString(),
          base64_data: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gSW1hZ2U8L3RleHQ+PC9zdmc+"
        }
      ]
    }
  ],
  stats: {
    total_events: 1,
    total_persons: 1,
    total_images: 1,
    avg_images_per_person: 1.0,
    max_images_for_single_person: 1,
    min_images_for_single_person: 1
  }
};

const mockAlertsData = {
  success: true,
  data: [
    {
      person_id: "demo_person_001",
      time: new Date().toISOString(),
      level: "info",
      image_id: "demo_image_001",
      camera_id: "demo_camera_01",
      message: "Demo alert: MongoDB unavailable, showing mock data",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlZGQzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlbW8gQWxlcnQ8L3RleHQ+PC9zdmc+"
    }
  ],
  pagination: {
    limit: 50,
    skip: 0,
    total: 1
  }
};

/**
 * @route   GET /api/mongo/persons
 * @desc    Get all persons with their images from MongoDB
 * @access  Public (for demo purposes)
 */
router.get("/persons", async (req, res) => {
  try {
    // Check if in production environment without MongoDB
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.log('Production environment detected without MongoDB URI, returning mock data');
      return res.json(mockPersonsData);
    }
    
    // Check if MongoDB is available
    await mongoGridFSService.connect();
    
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
    console.log('MongoDB error:', error.message);
    
    if (error.message === 'Operation timeout') {
      res.status(504).json({
        success: false,
        error: "Gateway timeout",
        message: "MongoDB operation timed out. Please try again later."
      });
    } else {
      // MongoDB unavailable - return mock data instead of error
      console.log('Returning mock data for persons endpoint');
      res.json(mockPersonsData);
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
    // Check if in production environment without MongoDB
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.log('Production environment detected without MongoDB URI, returning mock alerts data');
      return res.json(mockAlertsData);
    }
    
    // Check if MongoDB is available
    await mongoGridFSService.connect();
    
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
    console.log('MongoDB error for alerts:', error.message);
    
    if (error.message === 'Operation timeout') {
      res.status(504).json({
        success: false,
        error: "Gateway timeout",
        message: "MongoDB operation timed out. Please try again later.",
      });
    } else {
      // MongoDB unavailable - return mock data instead of error
      console.log('Returning mock data for alerts endpoint');
      res.json(mockAlertsData);
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
