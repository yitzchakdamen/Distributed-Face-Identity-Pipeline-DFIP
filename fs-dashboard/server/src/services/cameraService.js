// BLL for camera operations

import { Camera } from "../models/camera.js";

export class CameraService {
  /**
   * Create a new camera
   * @param {Object} cameraData - Camera data
   * @param {string} userId - ID of user creating the camera
   * @param {string} userRole - Role of user creating the camera
   * @returns {Promise<Object>} Created camera
   */
  static async createCamera(cameraData, userId, userRole) {
    // Only operators and admins can create cameras
    if (!["operator", "admin"].includes(userRole))
      throw new Error("Insufficient permissions to create camera");

    try {
      const camera = await Camera.create({ ...cameraData, created_by: userId });

      return camera;
    } catch (error) {
      if (error.message.includes("duplicate key")) throw new Error("Camera ID already exists");

      throw error;
    }
  }

  /**
   * Get cameras for a user based on their role
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Array>} Array of cameras
   */
  static async getCamerasForUser(userId, userRole) {
    try {
      if (userRole === "admin")
        // Admin can see all cameras
        return await Camera.getAllCameras();
      // Operators and viewers see their own and assigned cameras
      else return await Camera.getCamerasByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get cameras: ${error.message}`);
    }
  }

  /**
   * Get camera by ID with authorization check
   * @param {string} cameraId - Camera ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Camera data
   */
  static async getCameraById(cameraId, userId, userRole) {
    try {
      const camera = await Camera.getById(cameraId);

      // Check if user has access to this camera
      if (!this.userHasAccessToCamera(camera, userId, userRole))
        throw new Error("Insufficient permissions to access this camera");

      return camera;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign camera to user
   * @param {string} cameraId - Camera ID
   * @param {string} targetUserId - User ID to assign camera to
   * @param {string} assignerId - User ID making the assignment
   * @param {string} assignerRole - Role of user making the assignment
   * @returns {Promise<Object>} Assignment data
   */
  static async assignCameraToUser(cameraId, targetUserId, assignerId, assignerRole) {
    // Only operators and admins can assign cameras
    if (!["operator", "admin"].includes(assignerRole))
      throw new Error("Insufficient permissions to assign camera");

    try {
      // Check if camera exists and if assigner has access
      const camera = await Camera.getById(cameraId);

      if (assignerRole === "operator" && camera.created_by !== assignerId)
        throw new Error("Operators can only assign cameras they created");

      const assignment = await Camera.assignToUser({
        camera_id: cameraId,
        user_id: targetUserId,
        assigned_by: assignerId,
      });

      return assignment;
    } catch (error) {
      if (error.message.includes("duplicate key")) throw new Error("Camera is already assigned to this user");

      throw error;
    }
  }

  /**
   * Remove camera assignment
   * @param {string} cameraId - Camera ID
   * @param {string} targetUserId - User ID to remove assignment from
   * @param {string} removerId - User ID removing the assignment
   * @param {string} removerRole - Role of user removing the assignment
   * @returns {Promise<boolean>} Success status
   */
  static async removeCameraAssignment(cameraId, targetUserId, removerId, removerRole) {
    // Only operators and admins can remove assignments
    if (!["operator", "admin"].includes(removerRole))
      throw new Error("Insufficient permissions to remove camera assignment");

    try {
      // Check if camera exists and if remover has access
      const camera = await Camera.getById(cameraId);

      if (removerRole === "operator" && camera.created_by !== removerId)
        throw new Error("Operators can only manage assignments for cameras they created");

      return await Camera.removeAssignment(cameraId, targetUserId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get camera assignments
   * @param {string} cameraId - Camera ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Array>} Array of assignments
   */
  static async getCameraAssignments(cameraId, userId, userRole) {
    try {
      // Check if user has access to this camera
      const camera = await Camera.getById(cameraId);

      if (!this.userHasAccessToCamera(camera, userId, userRole))
        throw new Error("Insufficient permissions to view camera assignments");

      return await Camera.getAssignments(cameraId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update camera
   * @param {string} cameraId - Camera ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Updated camera data
   */
  static async updateCamera(cameraId, updateData, userId, userRole) {
    try {
      const camera = await Camera.getById(cameraId);

      // Check permissions
      if (userRole === "admin" || camera.created_by === userId)
        return await Camera.update(cameraId, updateData);
      else throw new Error("Insufficient permissions to update this camera");
    } catch (error) {
      if (error.message.includes("duplicate key")) throw new Error("Camera ID already exists");

      throw error;
    }
  }

  /**
   * Delete camera
   * @param {string} cameraId - Camera ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<boolean>} Success status
   */
  static async deleteCamera(cameraId, userId, userRole) {
    try {
      const camera = await Camera.getById(cameraId);

      // Check permissions
      if (userRole === "admin" || camera.created_by === userId) return await Camera.delete(cameraId);
      else throw new Error("Insufficient permissions to delete this camera");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user has access to a camera
   * @param {Object} camera - Camera object
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {boolean} Whether user has access
   */
  static userHasAccessToCamera(camera, userId, userRole) {
    // Admin has access to all cameras
    if (userRole === "admin") return true;

    // User has access if they created the camera
    if (camera.created_by === userId) return true;

    // For assigned cameras, we would need to check assignments
    // This is a simplified check - in practice, we might want to
    // fetch assignments or include them in the camera query
    return false;
  }
}
