import React, { useState, useEffect } from "react";
import { getAllUsers } from "../services/userService";
import { getAllCameras } from "../services/cameraService";
import { useAuth } from "../context/AuthContext";
import CameraAssignment from "../components/CameraAssignment";
import UserCreationForm from "../components/UserCreationForm";
import type { IUser } from "../@types/User";
import type { ICamera } from "../@types/Camera";
import "./UserManagementPage.css";

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "create" | "assign">("users");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load users and cameras in parallel
      const [usersResponse, camerasResponse] = await Promise.all([
        getAllUsers(),
        getAllCameras()
      ]);
      
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      } else {
        setError(usersResponse.error || "Failed to load users");
      }
      
      if (camerasResponse.success && camerasResponse.data) {
        setCameras(camerasResponse.data);
      }
      
    } catch (err: any) {
      console.error("Error loading data:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access user management. Only admin and operator roles can manage users.");
      } else {
        setError(err.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const hasUserManagementAccess = () => {
    return currentUser?.role === "admin" || currentUser?.role === "operator";
  };

  if (!hasUserManagementAccess()) {
    return (
      <div className="user-management-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access user management.</p>
          <p>Only administrators and operators can manage users and camera assignments.</p>
          <p>Your current role: <strong>{currentUser?.role}</strong></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="loading-state">
          <h2>Loading...</h2>
          <p>Loading user management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-page">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <h1>User Management</h1>
      
      <div className="user-info">
        <p>Welcome, <strong>{currentUser?.name}</strong> ({currentUser?.role})</p>
        <p>You have {currentUser?.role === "admin" ? "full" : "limited"} user management permissions.</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          View Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create User
        </button>
        <button
          className={`tab-btn ${activeTab === "assign" ? "active" : ""}`}
          onClick={() => setActiveTab("assign")}
        >
          Assign Cameras
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "users" && (
          <div className="users-tab">
            <h2>System Users</h2>
            {users.length === 0 ? (
              <div className="no-data">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-grid">
                {users.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-header">
                      <h3>{user.name}</h3>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="user-details">
                      <p><strong>Username:</strong> {user.username}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="summary-stats">
              <h3>User Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Users:</span>
                  <span className="stat-value">{users.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Admins:</span>
                  <span className="stat-value">{users.filter(u => u.role === "admin").length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Operators:</span>
                  <span className="stat-value">{users.filter(u => u.role === "operator").length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Viewers:</span>
                  <span className="stat-value">{users.filter(u => u.role === "viewer").length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="create-tab">
            <UserCreationForm />
          </div>
        )}

        {activeTab === "assign" && (
          <div className="assign-tab">
            <CameraAssignment />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
