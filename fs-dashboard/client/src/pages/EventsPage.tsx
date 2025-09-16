import React, { useState, useEffect } from "react";
import { getAllEvents } from "../services/eventService";
import type { IEvent } from "../@types/Event";
import EventImageModal from "../components/EventImageModal";
import "./EventsPage.css";

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getAllEvents({ limit: 20 });
        
        if (response.success && response.data) {
          setEvents(response.data);
        } else {
          setError(response.error || "Failed to fetch events");
        }
      } catch (err: any) {
        setError(err.message || "Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewImage = (event: IEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="events-page">
      <h1>Face Recognition Events</h1>
      
      <div className="events-list">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className={`event-card ${event.level}`}>
              <div className="event-header">
                <span className="event-time">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
                <span className={`risk-badge ${event.level}`}>
                  {event.level?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="event-details">
                <p><strong>Person ID:</strong> {event.person_id}</p>
                <p><strong>Camera:</strong> {event.camera_id}</p>
                <p><strong>Confidence:</strong> {(event.metadata.confidence * 100).toFixed(1)}%</p>
                <p><strong>Detection Type:</strong> {event.metadata.detection_type}</p>
                <p><strong>Processing Time:</strong> {event.metadata.processing_time_ms}ms</p>
              </div>
              
              <div className="event-actions">
                <button 
                  className="view-image-btn"
                  onClick={() => handleViewImage(event)}
                  disabled={!event.image_id}
                >
                  {event.image_id ? 'View Image' : 'No Image Available'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <EventImageModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default EventsPage;
