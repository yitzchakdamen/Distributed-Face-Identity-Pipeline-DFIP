import React, { useState, useEffect } from "react";
import { getAllEvents } from "../services/eventService";
import type { IEvent } from "../@types/Event";
import "./EventsPage.css";

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <div key={event.id} className={`event-card ${event.risk_level}`}>
              <div className="event-header">
                <span className="event-time">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
                <span className={`risk-badge ${event.risk_level}`}>
                  {event.risk_level?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="event-details">
                <p><strong>Person ID:</strong> {event.person_id}</p>
                <p><strong>Camera:</strong> {event.camera_id}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Confidence:</strong> {(event.confidence * 100).toFixed(1)}%</p>
                {event.message && <p><strong>Message:</strong> {event.message}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;
