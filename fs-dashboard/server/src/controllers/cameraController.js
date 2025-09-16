import { CameraService } from "../services/cameraService.js";
import { validate } from "../services/validationService.js";

import Joi from "joi";
import {
  createCameraSchema,
  updateCameraSchema,
  assignCameraSchema,
  cameraIdSchema,
  getCamerasQuerySchema,
} from "../schemas/cameraSchemas.js";

export class CameraController {
  /**
   * Create a new camera
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createCamera(req, res) {
    try {
      // Validate request body
      const { error, value } = validate(req.body, createCameraSchema);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Get user info from token
      const { id: userId, role } = req.user;

      // Create camera
      const camera = await CameraService.createCamera(value, userId, role);

      res.status(201).json({
        success: true,
        message: "Camera created successfully",
        data: camera,
      });
    } catch (error) {
      console.error("Create camera error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get cameras for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCameras(req, res) {
    try {
      // Validate query parameters
      const { error, value } = validate(req.query, getCamerasQuerySchema);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;

      // Get cameras for user
      const cameras = await CameraService.getCamerasForUser(userId, role);

      res.json({
        success: true,
        message: "Cameras retrieved successfully",
        data: cameras,
        total: cameras.length,
      });
    } catch (error) {
      console.error("Get cameras error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get camera by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCameraById(req, res) {
    try {
      // Validate camera ID parameter
      const { error, value } = validate({
        camera_id: req.params.camera_id,
      }, cameraIdSchema);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid camera ID",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;
      const { camera_id } = value;

      // Get camera
      const camera = await CameraService.getCameraById(camera_id, userId, role);

      res.json({
        success: true,
        message: "Camera retrieved successfully",
        data: camera,
      });
    } catch (error) {
      console.error("Get camera by ID error:", error);
      const statusCode = error.message.includes("permissions") ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update camera
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateCamera(req, res) {
    try {
      // Validate camera ID parameter
      const { error: idError, value: idValue } = validate({
        camera_id: req.params.camera_id,
      }, cameraIdSchema);
      if (idError) {
        return res.status(400).json({
          success: false,
          message: "Invalid camera ID",
          errors: idError.details.map((detail) => detail.message),
        });
      }

      // Validate request body
      const { error: bodyError, value: bodyValue } = validate(
        req.body,
        updateCameraSchema
      );
      if (bodyError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: bodyError.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;
      const { camera_id } = idValue;

      // Update camera
      const updatedCamera = await CameraService.updateCamera(camera_id, bodyValue, userId, role);

      res.json({
        success: true,
        message: "Camera updated successfully",
        data: updatedCamera,
      });
    } catch (error) {
      console.error("Update camera error:", error);
      const statusCode = error.message.includes("permissions") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete camera
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteCamera(req, res) {
    try {
      // Validate camera ID parameter
      const { error, value } = validate({
        camera_id: req.params.camera_id,
      }, cameraIdSchema);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid camera ID",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;
      const { camera_id } = value;

      // Delete camera
      await CameraService.deleteCamera(camera_id, userId, role);

      res.json({
        success: true,
        message: "Camera deleted successfully",
      });
    } catch (error) {
      console.error("Delete camera error:", error);
      const statusCode = error.message.includes("permissions") ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Assign camera to user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async assignCamera(req, res) {
    try {
      // Validate camera ID parameter
      const { error: idError, value: idValue } = validate({
        camera_id: req.params.camera_id,
      }, cameraIdSchema);
      if (idError) {
        return res.status(400).json({
          success: false,
          message: "Invalid camera ID",
          errors: idError.details.map((detail) => detail.message),
        });
      }

      // Validate request body
      const { error: bodyError, value: bodyValue } = validate(
        req.body,
        assignCameraSchema
      );
      if (bodyError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: bodyError.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;
      const { camera_id } = idValue;
      const { user_id } = bodyValue;

      // Assign camera
      const assignment = await CameraService.assignCameraToUser(camera_id, user_id, userId, role);

      res.status(201).json({
        success: true,
        message: "Camera assigned successfully",
        data: assignment,
      });
    } catch (error) {
      console.error("Assign camera error:", error);
      const statusCode = error.message.includes("permissions") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Remove camera assignment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async removeAssignment(req, res) {
    try {
      // Validate camera ID parameter
      const { error: idError, value: idValue } = validate({
        camera_id: req.params.camera_id,
      }, cameraIdSchema);
      if (idError) {
        return res.status(400).json({
          success: false,
          message: "Invalid camera ID",
          errors: idError.details.map((detail) => detail.message),
        });
      }

      // Validate user ID parameter
      const userIdSchema = Joi.object({
        user_id: Joi.string().uuid().required()
      });
      const { error: userError, value: userValue } = validate(
        { user_id: req.params.user_id },
        userIdSchema
      );
      if (userError) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
          errors: userError.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;
      const { camera_id } = idValue;
      const { user_id } = userValue;

      // Remove assignment
      await CameraService.removeCameraAssignment(camera_id, user_id, userId, role);

      res.json({
        success: true,
        message: "Camera assignment removed successfully",
      });
    } catch (error) {
      console.error("Remove assignment error:", error);
      const statusCode = error.message.includes("permissions") ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get camera assignments
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCameraAssignments(req, res) {
    try {
      // Validate camera ID parameter
      const { error, value } = validate({
        camera_id: req.params.camera_id,
      }, cameraIdSchema);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid camera ID",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const { id: userId, role } = req.user;
      const { camera_id } = value;

      // Get assignments
      const assignments = await CameraService.getCameraAssignments(camera_id, userId, role);

      res.json({
        success: true,
        message: "Camera assignments retrieved successfully",
        data: assignments,
      });
    } catch (error) {
      console.error("Get camera assignments error:", error);
      const statusCode = error.message.includes("permissions") ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
}
