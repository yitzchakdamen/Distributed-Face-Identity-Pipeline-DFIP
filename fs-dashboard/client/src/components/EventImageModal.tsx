import React, { useState, useEffect } from "react";
import type { IEvent } from "../@types/Event";
import "./EventImageModal.css";

interface EventImageModalProps {
  event: IEvent;
  isOpen: boolean;
  onClose: () => void;
}

const EventImageModal: React.FC<EventImageModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event._id) {
      loadEventImage();
    }
    
    // Cleanup blob URL when modal closes
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isOpen, event._id]);

  const loadEventImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build image URL using the event ID, not the image_id
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const imageURL = `${baseURL}/events/${event._id}/image`;
      
      // For images with auth, we need to handle the authorization properly
      const response = await fetch(imageURL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
      }
      
      // Create blob URL for the image
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      setImageUrl(blobURL);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load image");
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    setError("Image could not be loaded");
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="event-image-modal-overlay" onClick={handleOverlayClick}>
      <div className="event-image-modal">
        <div className="modal-header">
          <h3>Event Image Details</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="event-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Person ID:</span>
                <span className="value">{event.person_id}</span>
              </div>
              <div className="info-item">
                <span className="label">Camera:</span>
                <span className="value">{event.camera_id}</span>
              </div>
              <div className="info-item">
                <span className="label">Timestamp:</span>
                <span className="value">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Risk Level:</span>
                <span className={`value risk-level ${event.level}`}>
                  {event.level?.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Confidence:</span>
                <span className="value">
                  {(event.metadata.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="info-item">
                <span className="label">Detection Type:</span>
                <span className="value">{event.metadata.detection_type}</span>
              </div>
            </div>
          </div>

          <div className="image-container">
            {loading && <div className="image-loading">Loading image...</div>}
            
            {error && (
              <div className="image-error">
                <p>Unable to load image</p>
                <p className="error-message">{error}</p>
                <p className="image-id">Event ID: {event._id}</p>
              </div>
            )}

            {!error && (
              <img
                src={imageUrl}
                alt={`Event ${event._id}`}
                className="event-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: loading ? "none" : "block" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventImageModal;
