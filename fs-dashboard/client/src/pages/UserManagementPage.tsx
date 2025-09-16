import React, { useState, useEffect } from "react";
import { getAllCameras } from "../services/cameraService";
import CameraAssignment from "../components/CameraAssignment";
import type { IUser } from "../@types/User";
import type { ICamera } from "../@types/Camera";
import "./UserManagementPage.css";

const UserManagementPage: React.FC = () => {
  // Mock users data for demonstration
  const [users] = useState<IUser[]>([
    {
      id: "1",
      username: "admin",
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
      created_at: "2025-09-16T10:00:00Z",
      updated_at: "2025-09-16T10:00:00Z"
    },
    {
      id: "2", 
      username: "operator1",
      name: "Camera Operator",
      email: "operator@test.com",
      role: "operator",
      created_at: "2025-09-16T10:00:00Z",
      updated_at: "2025-09-16T10:00:00Z"
    },
    {
      id: "3",
      username: "viewer1", 
      name: "Security Viewer",
      email: "viewer@test.com",
      role: "viewer",
      created_at: "2025-09-16T10:00:00Z",
      updated_at: "2025-09-16T10:00:00Z"
    }
  ]);
  
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const camerasResponse = await getAllCameras();

        if (camerasResponse.success && camerasResponse.data) {
          setCameras(camerasResponse.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch cameras");
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  if (loading) {
    return <div className="loading">Loading users and cameras...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="user-management-page">
      <h1>User Management</h1>
      <p className="feature-notice">
        Camera assignment feature coming soon. Currently showing all users and cameras.
      </p>

      <div className="management-grid">
        <div className="users-section">
          <h2>Users ({users.length})</h2>
          <div className="users-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-card ${selectedUser?.id === user.id ? "selected" : ""}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cameras-section">
          <h2>Available Cameras ({cameras.length})</h2>
          <div className="cameras-list">
            {cameras.map((camera) => (
              <div key={camera.id} className="camera-card">
                <div className="camera-info">
                  <h3>{camera.name}</h3>
                  <p>
                    <strong>Camera ID:</strong> {camera.camera_id}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(camera.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="assignment-section">
          <h3>Camera Assignment for {selectedUser.name}</h3>
          <CameraAssignment />
        </div>
      )}
      
      {!selectedUser && (
        <div className="camera-assignment-section">
          <CameraAssignment />
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
