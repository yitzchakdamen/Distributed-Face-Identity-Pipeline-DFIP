// Event controller for handling HTTP requests related to events

import { EventService } from "../services/eventService.js";
import { validate as ValidationService } from "../services/validationService.js";
import {
  getEventsQuerySchema,
  eventIdSchema,
  imageQuerySchema,
  eventsStatsQuerySchema
} from "../schemas/eventSchemas.js";

/**
 * Get events for the authenticated user based on their camera access
 */
export const getEvents = async (req, res, next) => {
  try {
    // Validate query parameters
    const validatedQuery = ValidationService(
      req.query,
      getEventsQuerySchema
    );

    const userId = req.user.id;
    const userRole = req.user.role;
    const { page, limit, level, startDate, endDate, cameraId } = validatedQuery;

    // Get events for user with pagination
    const result = await EventService.getEventsForUser(userId, userRole, {
      page,
      limit,
      level,
      startDate,
      endDate,
      cameraId
    });

    res.status(200).json({
      success: true,
      data: result.events,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNext: page * limit < result.total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific event by ID
 */
export const getEventById = async (req, res, next) => {
  try {
    // Validate event ID
    const validatedParams = ValidationService(
      req.params,
      eventIdSchema
    );

    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = validatedParams;

    // Get event for user (includes access check)
    const event = await EventService.getEventById(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event image from GridFS
 */
export const getEventImage = async (req, res, next) => {
  try {
    // Validate event ID
    const validatedParams = ValidationService(
      req.params,
      eventIdSchema
    );

    // Validate query parameters
    const validatedQuery = ValidationService(
      req.query,
      imageQuerySchema
    );

    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = validatedParams;
    const { download, format } = validatedQuery;

    // Get image stream
    const imageData = await EventService.getEventImage(id, userId, userRole);

    // Set appropriate headers
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Length': imageData.length,
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      ...(download && {
        'Content-Disposition': `attachment; filename="event-${id}-image.${format}"`
      })
    });

    // Send image data
    res.status(200).send(imageData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get events statistics for the authenticated user
 */
export const getEventsStats = async (req, res, next) => {
  try {
    // Validate query parameters
    const validatedQuery = ValidationService(
      req.query,
      eventsStatsQuerySchema
    );

    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, level } = validatedQuery;

    // Get events statistics for user
    const stats = await EventService.getEventsStatsForUser(userId, userRole);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get events count for the authenticated user
 */
export const getEventsCount = async (req, res, next) => {
  try {
    // Validate query parameters (optional filters)
    const validatedQuery = ValidationService(
      req.query,
      eventsStatsQuerySchema
    );

    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, level } = validatedQuery;

    // Get events statistics for user (contains count)
    const stats = await EventService.getEventsStatsForUser(userId, userRole);

    res.status(200).json({
      success: true,
      data: { count: stats.totalEvents }
    });
  } catch (error) {
    next(error);
  }
};
