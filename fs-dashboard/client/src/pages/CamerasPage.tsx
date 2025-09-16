import React, { useState, useEffect } from "react";
import { getAllCameras } from "../services/cameraService";
import CameraCreationForm from "../components/CameraCreationForm";
import { useAuth } from "../context/AuthContext";
import type { ICamera } from "../@types/Camera";
import "./CamerasPage.css";

const CamerasPage: React.FC = () => {
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await getAllCameras();
        
        if (response.success && response.data) {
          setCameras(response.data);
        } else {
          setError(response.error || "Failed to fetch cameras");
        }
      } catch (err: any) {
        setError(err.message || "Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  if (loading) {
    return <div className="loading">Loading cameras...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="cameras-page">
      <h1>Camera Management</h1>
      
      <div className="cameras-grid">
        {cameras.length === 0 ? (
          <p>No cameras found.</p>
        ) : (
          cameras.map((camera) => (
            <div key={camera.id} className="camera-card">
              <div className="camera-header">
                <h3>{camera.name}</h3>
                <span className="status-badge active">
                  ACTIVE
                </span>
              </div>
              
              <div className="camera-details">
                <p><strong>Camera ID:</strong> {camera.camera_id}</p>
                <p><strong>Connection:</strong> {camera.connection_string}</p>
                <p><strong>Created:</strong> {new Date(camera.created_at).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(camera.updated_at).toLocaleString()}</p>
              </div>
              
              <div className="camera-actions">
                <button className="action-btn view">View Details</button>
                <button className="action-btn edit">Edit</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CamerasPage;
