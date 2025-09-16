import React, { useState } from "react";
import { createCamera } from "../services/cameraService";
import { useAuth } from "../context/AuthContext";
import "./CameraCreationForm.css";

interface CameraFormData {
  name: string;
  camera_id: string;
  connection_string: string;
}

const CameraCreationForm: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<CameraFormData>({
    name: "",
    camera_id: "",
    connection_string: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateCameraId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const cameraId = `CAM_${timestamp}_${random}`.toUpperCase();
    setFormData(prev => ({ ...prev, camera_id: cameraId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name || !formData.camera_id || !formData.connection_string) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.name.length < 3) {
      setError("Camera name must be at least 3 characters long");
      setLoading(false);
      return;
    }

    if (formData.camera_id.length < 5) {
      setError("Camera ID must be at least 5 characters long");
      setLoading(false);
      return;
    }

    // Basic URL validation for connection string
    const urlPattern = /^(https?|rtsp):\/\/.+/;
    if (!urlPattern.test(formData.connection_string)) {
      setError("Connection string must be a valid URL (http, https, or rtsp)");
      setLoading(false);
      return;
    }

    try {
      const response = await createCamera(formData);
      if (response.success) {
        setSuccess(`Camera "${formData.name}" created successfully`);
        setFormData({
          name: "",
          camera_id: "",
          connection_string: ""
        });
      } else {
        setError(response.error || "Failed to create camera");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create camera");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to create cameras
  if (!currentUser || !["operator", "admin"].includes(currentUser.role)) {
    return (
      <div className="camera-creation-form">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>Only operators and administrators can create cameras.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-creation-form">
      <h2>Create New Camera</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-group">
          <label htmlFor="name">Camera Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Enter camera name (e.g., Main Entrance Camera)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="camera_id">Camera ID *</label>
          <div className="camera-id-control">
            <input
              type="text"
              id="camera_id"
              name="camera_id"
              value={formData.camera_id}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter unique camera ID (e.g., CAM001)"
            />
            <button
              type="button"
              onClick={generateCameraId}
              className="generate-btn"
            >
              Generate
            </button>
          </div>
          <small className="help-text">
            Must be unique across all cameras. Use the Generate button for automatic ID.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="connection_string">Connection String *</label>
          <textarea
            id="connection_string"
            name="connection_string"
            value={formData.connection_string}
            onChange={handleInputChange}
            required
            className="form-textarea"
            placeholder="Enter camera connection URL (e.g., rtsp://192.168.1.100:554/stream1)"
            rows={3}
          />
          <small className="help-text">
            Supported protocols: HTTP, HTTPS, RTSP. Include authentication if required.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Creating..." : "Create Camera"}
          </button>
        </div>
      </form>

      <div className="camera-info">
        <h3>Camera Setup Guide</h3>
        <ul>
          <li><strong>Name:</strong> Choose a descriptive name for easy identification</li>
          <li><strong>Camera ID:</strong> Unique identifier used by the system</li>
          <li><strong>Connection String:</strong> URL to access the camera stream</li>
        </ul>
        
        <h4>Common Connection String Examples:</h4>
        <div className="examples">
          <code>rtsp://admin:password@192.168.1.100:554/stream1</code>
          <code>http://192.168.1.101:8080/video</code>
          <code>https://camera.example.com/live/stream</code>
        </div>
      </div>
    </div>
  );
};

export default CameraCreationForm;
