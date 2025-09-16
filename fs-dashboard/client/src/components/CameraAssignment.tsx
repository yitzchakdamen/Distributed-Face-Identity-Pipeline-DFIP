import React, { useState, useEffect } from "react";
import { getAllCameras, assignCameraToUser, removeCameraAssignment, getCameraAssignments } from "../services/cameraService";
import { getUsersByRole } from "../services/userService";
import type { ICamera } from "../@types/Camera";
import type { IUser } from "../@types/User";
import "./CameraAssignment.css";

interface Assignment {
  id: string;
  camera_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  users: IUser;
}

const CameraAssignment: React.FC = () => {
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [viewers, setViewers] = useState<IUser[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedViewer, setSelectedViewer] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    loadCameras();
    loadViewers();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await getAllCameras();
      if (response.success && response.data) {
        setCameras(response.data);
      }
    } catch (err) {
      setError("Failed to load cameras");
    }
  };

  const loadViewers = async () => {
    try {
      const response = await getUsersByRole("viewer");
      if (response.success && response.data) {
        setViewers(response.data);
      }
    } catch (err) {
      setError("Failed to load viewers");
    }
  };

  const loadAssignments = async (cameraId: string) => {
    if (!cameraId) return;
    
    try {
      const response = await getCameraAssignments(cameraId);
      if (response.success && response.data) {
        setAssignments(response.data);
      }
    } catch (err) {
      setError("Failed to load assignments");
    }
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId);
    if (cameraId) {
      loadAssignments(cameraId);
    } else {
      setAssignments([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedCamera || !selectedViewer) {
      setError("Please select both camera and viewer");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await assignCameraToUser(selectedCamera, selectedViewer);
      if (response.success) {
        setSuccess("Camera assigned successfully");
        loadAssignments(selectedCamera);
        setSelectedViewer("");
      } else {
        setError(response.error || "Failed to assign camera");
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign camera");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (userId: string) => {
    if (!selectedCamera) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await removeCameraAssignment(selectedCamera, userId);
      if (response.success) {
        setSuccess("Assignment removed successfully");
        loadAssignments(selectedCamera);
      } else {
        setError(response.error || "Failed to remove assignment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="camera-assignment">
      <h2>Camera Assignment</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="assignment-form">
        <div className="form-group">
          <label htmlFor="camera-select">Select Camera:</label>
          <select
            id="camera-select"
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="form-select"
          >
            <option value="">-- Select Camera --</option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name} ({camera.camera_id})
              </option>
            ))}
          </select>
        </div>

        {selectedCamera && (
          <>
            <div className="form-group">
              <label htmlFor="viewer-select">Assign to Viewer:</label>
              <div className="assign-control">
                <select
                  id="viewer-select"
                  value={selectedViewer}
                  onChange={(e) => setSelectedViewer(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Select Viewer --</option>
                  {viewers.map((viewer) => (
                    <option key={viewer.id} value={viewer.id}>
                      {viewer.name} ({viewer.username})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!selectedViewer || loading}
                  className="assign-btn"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>

            <div className="assignments-section">
              <h3>Current Assignments</h3>
              {assignments.length === 0 ? (
                <p className="no-assignments">No assignments for this camera</p>
              ) : (
                <div className="assignments-list">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="assignment-item">
                      <div className="assignment-info">
                        <span className="user-name">{assignment.users.name}</span>
                        <span className="username">({assignment.users.username})</span>
                        <span className="assigned-date">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.user_id)}
                        disabled={loading}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraAssignment;
