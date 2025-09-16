// Business logic for event operations with role-based access control

import { Event } from "../models/event.js";
import { CameraService } from "./cameraService.js";

export class EventService {
  /**
   * Get events for user based on their accessible cameras
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Events data
   */
  static async getEventsForUser(userId, userRole, options = {}) {
    try {
      // Get cameras accessible to user
      const cameras = await CameraService.getCamerasForUser(userId, userRole);
      
      if (cameras.length === 0) {
        return {
          events: [],
          pagination: {
            total: 0,
            page: options.page || 1,
            limit: options.limit || 10,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        };
      }

      // Extract camera IDs
      const cameraIds = cameras.map(camera => camera.camera_id);

      // Get events for these cameras
      return await Event.getEventsByCameraIds(cameraIds, options);
    } catch (error) {
      throw new Error(`Failed to get events for user: ${error.message}`);
    }
  }

  /**
   * Get single event with access control
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Event data
   */
  static async getEventById(eventId, userId, userRole) {
    try {
      // Get the event first
      const event = await Event.getEventById(eventId);

      // Check if user has access to this event's camera
      const hasAccess = await this.userHasAccessToCamera(userId, userRole, event.camera_id);
      
      if (!hasAccess) {
        throw new Error("Access denied to this event");
      }

      return event;
    } catch (error) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  /**
   * Get event image with access control
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Buffer>} Image buffer
   */
  static async getEventImage(eventId, userId, userRole) {
    try {
      // First get the event to check access and get image_id
      const event = await this.getEventById(eventId, userId, userRole);
      
      if (!event.image_id) {
        throw new Error("No image associated with this event");
      }

      // Get the image using image_id from event
      const imageBuffer = await Event.getImageById(event.image_id);
      
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Image data is empty or corrupted");
      }

      return imageBuffer;
    } catch (error) {
      console.error("Error getting event image:", error);
      
      if (error.message.includes("not found") || error.message.includes("Access denied")) {
        throw error; // Re-throw known errors
      }
      
      throw new Error(`Failed to get event image: ${error.message}`);
    }
  }

  /**
   * Get events statistics for user
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Events statistics
   */
  static async getEventsStatsForUser(userId, userRole) {
    try {
      // Get cameras accessible to user
      const cameras = await CameraService.getCamerasForUser(userId, userRole);
      
      if (cameras.length === 0) {
        return {
          totalEvents: 0,
          levelStats: [],
          camerasCount: 0
        };
      }

      const cameraIds = cameras.map(camera => camera.camera_id);

      // Get statistics
      const [totalEvents, levelStats] = await Promise.all([
        Event.getEventsCount(cameraIds),
        Event.getEventsStatsByLevel(cameraIds)
      ]);

      return {
        totalEvents,
        levelStats,
        camerasCount: cameras.length
      };
    } catch (error) {
      throw new Error(`Failed to get events statistics: ${error.message}`);
    }
  }

  /**
   * Check if user has access to a specific camera
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {string} cameraId - Camera ID
   * @returns {Promise<boolean>} Access status
   */
  static async userHasAccessToCamera(userId, userRole, cameraId) {
    try {
      const cameras = await CameraService.getCamerasForUser(userId, userRole);
      return cameras.some(camera => camera.camera_id === cameraId);
    } catch (error) {
      console.error("Error checking camera access:", error);
      return false;
    }
  }

  /**
   * Get events with enhanced data (includes camera info)
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Enhanced events data
   */
  static async getEnhancedEventsForUser(userId, userRole, options = {}) {
    try {
      const eventsData = await this.getEventsForUser(userId, userRole, options);
      
      if (eventsData.events.length === 0) {
        return eventsData;
      }

      // Get user cameras for reference
      const cameras = await CameraService.getCamerasForUser(userId, userRole);
      const cameraMap = new Map(cameras.map(camera => [camera.camera_id, camera]));

      // Enhance events with camera information
      const enhancedEvents = eventsData.events.map(event => ({
        ...event,
        camera_info: cameraMap.get(event.camera_id) || null
      }));

      return {
        ...eventsData,
        events: enhancedEvents
      };
    } catch (error) {
      throw new Error(`Failed to get enhanced events: ${error.message}`);
    }
  }
}
