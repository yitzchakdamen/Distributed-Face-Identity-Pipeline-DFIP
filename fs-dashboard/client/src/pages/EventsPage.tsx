import React, { useState, useEffect } from "react";
import { getAllEvents } from "../services/eventService";
import api from "../services/api";
import type { IEvent } from "../@types/Event";
import EventImageModal from "../components/EventImageModal";
import "./EventsPage.css";

interface EventFilters {
  level?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
}

interface UserCamera {
  id: string;
  name: string;
  camera_id: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCameras, setUserCameras] = useState<UserCamera[]>([]);
  const [filters, setFilters] = useState<EventFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserCameras();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!refreshing) {
      fetchEvents();
    }
  }, [filters]);

  const fetchUserCameras = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      if (response.data.success) {
        setUserCameras(response.data.stats.userCameras || []);
      }
    } catch (error) {
      console.error('Error fetching user cameras:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      const queryFilters: any = { limit: 50 };
      if (filters.level) queryFilters.level = filters.level;
      if (filters.cameraId) queryFilters.cameraId = filters.cameraId;
      if (filters.startDate) queryFilters.startDate = filters.startDate;
      if (filters.endDate) queryFilters.endDate = filters.endDate;
      
      const response = await getAllEvents(queryFilters);
      
      if (response.success && response.data) {
        setEvents(response.data);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch events");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewImage = (event: IEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading && events.length === 0) {
    return <div className="loading">Loading events...</div>;
  }

  if (error && events.length === 0) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchEvents}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Face Recognition Events</h1>
        <p>Events from your assigned cameras</p>
      </div>
      
      <div className="events-filters">
        <div className="filter-group">
          <label htmlFor="level-filter">Risk Level:</label>
          <select
            id="level-filter"
            value={filters.level || ''}
            onChange={(e) => handleFilterChange('level', e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="camera-filter">Camera:</label>
          <select
            id="camera-filter"
            value={filters.cameraId || ''}
            onChange={(e) => handleFilterChange('cameraId', e.target.value)}
          >
            <option value="">All Cameras</option>
            {userCameras.map((camera) => (
              <option key={camera.camera_id} value={camera.camera_id}>
                {camera.name} ({camera.camera_id})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date">From Date:</label>
          <input
            type="date"
            id="start-date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">To Date:</label>
          <input
            type="date"
            id="end-date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
          <button 
            onClick={fetchEvents} 
            className="refresh-btn"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>Error: {error}</p>
          <button onClick={fetchEvents}>Retry</button>
        </div>
      )}
      
      <div className="events-list">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found.</p>
            {userCameras.length === 0 && (
              <p>You don't have any cameras assigned to you. Contact your administrator.</p>
            )}
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className={`event-card ${event.level}`}>
              <div className="event-header">
                <span className="event-time">
                  {new Date(event.time).toLocaleString()}
                </span>
                <span className={`risk-badge ${event.level}`}>
                  {event.level?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="event-details">
                <p><strong>Person ID:</strong> {event.person_id}</p>
                <p><strong>Camera:</strong> {event.camera_id}</p>
                <p><strong>Level:</strong> {event.level}</p>
                <p><strong>Time:</strong> {new Date(event.time).toLocaleString()}</p>
                <p><strong>Message:</strong> {event.message}</p>
              </div>
              
              <div className="event-actions">
                <button 
                  className="view-image-btn"
                  onClick={() => handleViewImage(event)}
                  disabled={!event._id}
                >
                  View Image
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
