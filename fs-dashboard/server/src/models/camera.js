// Handles camera-related database operations

import { getSupabaseClient } from "../db/supabase.js";

const supabase = getSupabaseClient();

export class Camera {
  /**
   * Create a new camera
   * @param {Object} cameraData - Camera information
   * @param {string} cameraData.name - Camera name
   * @param {string} cameraData.camera_id - Unique camera identifier
   * @param {string} cameraData.connection_string - Camera connection string
   * @param {string} cameraData.created_by - User ID who created the camera
   * @returns {Promise<Object>} Created camera data
   */
  static async create(cameraData) {
    const { data, error } = await supabase
      .from("cameras")
      .insert([
        {
          name: cameraData.name,
          camera_id: cameraData.camera_id,
          connection_string: cameraData.connection_string,
          created_by: cameraData.created_by,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create camera: ${error.message}`);

    return data;
  }

  /**
   * Get cameras by user ID (cameras created by user or assigned to user)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of cameras
   */
  static async getCamerasByUserId(userId) {
    // Get cameras created by user
    const { data: createdCameras, error: createdError } = await supabase
      .from("cameras")
      .select("*")
      .eq("created_by", userId);

    if (createdError) throw new Error(`Failed to get created cameras: ${createdError.message}`);

    // Get cameras assigned to user
    const { data: assignedCameras, error: assignedError } = await supabase
      .from("camera_user_assignments")
      .select(
        `
        cameras (
          id,
          name,
          camera_id,
          connection_string,
          created_by,
          created_at,
          updated_at
        )
      `
      )
      .eq("user_id", userId);

    if (assignedError) throw new Error(`Failed to get assigned cameras: ${assignedError.message}`);

    // Combine and deduplicate cameras
    const allCameras = [...createdCameras];
    const assignedCameraData = assignedCameras.map((item) => item.cameras);

    assignedCameraData.forEach((assignedCamera) => {
      if (!allCameras.find((camera) => camera.id === assignedCamera.id)) allCameras.push(assignedCamera);
    });

    return allCameras;
  }

  /**
   * Get all cameras (admin only)
   * @returns {Promise<Array>} Array of all cameras
   */
  static async getAllCameras() {
    const { data, error } = await supabase
      .from("cameras")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get cameras: ${error.message}`);

    return data;
  }

  /**
   * Get camera by ID
   * @param {string} cameraId - Camera ID
   * @returns {Promise<Object>} Camera data
   */
  static async getById(cameraId) {
    const { data, error } = await supabase.from("cameras").select("*").eq("id", cameraId).single();

    if (error) throw new Error(`Failed to get camera: ${error.message}`);

    return data;
  }

  /**
   * Assign camera to user
   * @param {Object} assignmentData - Assignment information
   * @param {string} assignmentData.camera_id - Camera ID
   * @param {string} assignmentData.user_id - User ID to assign to
   * @param {string} assignmentData.assigned_by - User ID who made the assignment
   * @returns {Promise<Object>} Assignment data
   */
  static async assignToUser(assignmentData) {
    const { data, error } = await supabase
      .from("camera_user_assignments")
      .insert([
        {
          camera_id: assignmentData.camera_id,
          user_id: assignmentData.user_id,
          assigned_by: assignmentData.assigned_by,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to assign camera: ${error.message}`);

    return data;
  }

  /**
   * Remove camera assignment from user
   * @param {string} cameraId - Camera ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async removeAssignment(cameraId, userId) {
    const { error } = await supabase
      .from("camera_user_assignments")
      .delete()
      .eq("camera_id", cameraId)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to remove camera assignment: ${error.message}`);

    return true;
  }

  /**
   * Get camera assignments
   * @param {string} cameraId - Camera ID
   * @returns {Promise<Array>} Array of assignments
   */
  static async getAssignments(cameraId) {
    const { data, error } = await supabase
      .from("camera_user_assignments")
      .select(
        `
        *,
        users!camera_user_assignments_user_id_fkey (
          id,
          username,
          name,
          email,
          role
        ),
        assigned_by_user:users!camera_user_assignments_assigned_by_fkey (
          id,
          username,
          name
        )
      `
      )
      .eq("camera_id", cameraId);

    if (error) throw new Error(`Failed to get camera assignments: ${error.message}`);

    return data;
  }

  /**
   * Update camera
   * @param {string} cameraId - Camera ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated camera data
   */
  static async update(cameraId, updateData) {
    const { data, error } = await supabase
      .from("cameras")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cameraId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update camera: ${error.message}`);

    return data;
  }

  /**
   * Delete camera
   * @param {string} cameraId - Camera ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(cameraId) {
    const { error } = await supabase.from("cameras").delete().eq("id", cameraId);

    if (error) throw new Error(`Failed to delete camera: ${error.message}`);

    return true;
  }
}
