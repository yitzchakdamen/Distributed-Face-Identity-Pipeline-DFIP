import React, { useState, useEffect } from "react";
import { getAllCameras, assignCameraToUser } from "../services/cameraService";
import { getAllUsers } from "../services/userService";
import type { ICamera } from "../@types/Camera";
import type { IUser } from "../@types/User";
import "./CameraAssignment.css";

const CameraAssignment: React.FC = () => {
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    loadCameras();
    loadUsers();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await getAllCameras();
      if (response.success && response.data) {
        setCameras(response.data);
      } else {
        setError(response.error || "Failed to load cameras");
      }
    } catch (err: any) {
      console.error("Error loading cameras:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view cameras.");
      } else {
        setError(err.message || "Failed to load cameras");
      }
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || "Failed to load users");
      }
    } catch (err: any) {
      console.error("Error loading users:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view users. Only admin and operator roles can assign cameras.");
      } else {
        setError(err.message || "Failed to load users");
      }
    }
  };

  const handleAssignCamera = async () => {
    if (!selectedCamera || !selectedUser) {
      setError("Please select both camera and user");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await assignCameraToUser(selectedCamera, selectedUser);
      
      if (response.success) {
        setSuccess("Camera assigned successfully!");
        setSelectedCamera("");
        setSelectedUser("");
      } else {
        setError(response.error || "Failed to assign camera");
      }
    } catch (err: any) {
      console.error("Error assigning camera:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to assign cameras. Only admin and operator roles can assign cameras.");
      } else {
        setError(err.message || "Failed to assign camera");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="camera-assignment">
      <h2>Camera Assignment</h2>
      
      <div className="auth-info">
        <p><strong>Permission Requirements:</strong></p>
        <ul>
          <li>Only <strong>Admin</strong> and <strong>Operator</strong> roles can assign cameras</li>
          <li>You must be logged in to access this feature</li>
          <li>If you see permission errors, please check your role with an administrator</li>
        </ul>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      <div className="assignment-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="camera-select">Select Camera:</label>
            <select
              id="camera-select"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a camera...</option>
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name} ({camera.camera_id})
                </option>
              ))}
            </select>
            {cameras.length === 0 && (
              <small className="help-text">No cameras available. Check your permissions or ask an admin to create cameras.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="user-select">Select User:</label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username}) - {user.role}
                </option>
              ))}
            </select>
            {users.length === 0 && (
              <small className="help-text">No users available. Check your permissions.</small>
            )}
          </div>
        </div>

        <button
          onClick={handleAssignCamera}
          disabled={loading || !selectedCamera || !selectedUser}
          className="assign-btn"
        >
          {loading ? "Assigning..." : "Assign Camera"}
        </button>
      </div>

      <div className="assignment-info">
        <h3>How Camera Assignment Works</h3>
        <p>
          Camera assignment allows you to control which users can view specific cameras. 
          This is part of the role-based access control system.
        </p>
        <ul>
          <li><strong>Admin</strong>: Can assign any camera to any user</li>
          <li><strong>Operator</strong>: Can assign cameras to viewer users</li>
          <li><strong>Viewer</strong>: Can only view cameras assigned to them</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraAssignment;
