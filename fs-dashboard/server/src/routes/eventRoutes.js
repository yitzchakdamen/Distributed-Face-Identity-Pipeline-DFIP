// Event routes for handling event-related requests

import express from "express";
import {
  getEvents,
  getEventById,
  getEventImage,
  getEventsStats,
  getEventsCount
} from "../controllers/eventController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/events
 * @desc    Get events for authenticated user with optional filters
 * @access  Private (requires authentication)
 * @query   page, limit, level, startDate, endDate, cameraId
 */
router.get("/", getEvents);

/**
 * @route   GET /api/events/stats
 * @desc    Get events statistics for authenticated user
 * @access  Private (requires authentication)
 * @query   startDate, endDate, level
 */
router.get("/stats", getEventsStats);

/**
 * @route   GET /api/events/count
 * @desc    Get events count for authenticated user
 * @access  Private (requires authentication)
 * @query   startDate, endDate, level
 */
router.get("/count", getEventsCount);

/**
 * @route   GET /api/events/:id
 * @desc    Get specific event by ID
 * @access  Private (requires authentication and camera access)
 * @params  id - Event ObjectId
 */
router.get("/:id", getEventById);

/**
 * @route   GET /api/events/:id/image
 * @desc    Get event image from GridFS
 * @access  Private (requires authentication and camera access)
 * @params  id - Event ObjectId
 * @query   download, format
 */
router.get("/:id/image", getEventImage);

export default router;
