// MongoDB Alerts component for displaying alerts/events with images

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MongoAlerts.css';

interface Alert {
  person_id: string;
  time: string;
  level: string;
  image_id: string;
  camera_id: string;
  message: string;
  image: string | null;
}

interface AlertsResponse {
  success: boolean;
  data?: Alert[];
  alerts?: Alert[]; // For backward compatibility
}

const MongoAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Fetch alerts data from MongoDB API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/mongo/alerts');
      const data: AlertsResponse = response.data;
      
      if (data.success) {
        setAlerts(data.data || data.alerts || []);
      } else {
        throw new Error('API returned error');
      }
    } catch (err: any) {
      if (err.response?.status === 503) {
        setError('MongoDB service is not available in production environment');
      } else if (err.response?.status === 504) {
        setError('MongoDB operation timed out. The database may be overloaded. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || 'Unknown error occurred');
      }
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter alerts based on current filter
  const filteredAlerts = currentFilter === 'all' 
    ? (alerts || [])
    : (alerts || []).filter(alert => alert.level === currentFilter);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US'),
      time: date.toLocaleTimeString('en-US')
    };
  };

  // Show notification
  const showNotification = (message: string, isError: boolean = false) => {
    // Simple notification - you can enhance this with a proper notification system
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${isError ? '#dc3545' : '#28a745'};
      color: white;
      border-radius: 6px;
      z-index: 1000;
      transition: all 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const handleRefresh = async () => {
    await fetchAlerts();
    showNotification('Alerts updated successfully');
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="mongo-alerts">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <div className="mongo-alerts">
        <div className="error">
          <h3>Error Loading Alerts</h3>
          <p>{error}</p>
          <button onClick={fetchAlerts} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mongo-alerts">
      <header className="alerts-header">
        <h1>Security Alerts System</h1>
        <button 
          onClick={handleRefresh} 
          className={`refresh-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Alerts'}
        </button>
      </header>

      {/* Filter Controls */}
      <div className="filter-controls">
        <button 
          className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCurrentFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'alert' ? 'active' : ''}`}
          onClick={() => setCurrentFilter('alert')}
        >
          Alerts
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'info' ? 'active' : ''}`}
          onClick={() => setCurrentFilter('info')}
        >
          Info
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">🔔</div>
            <p>No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const { date, time } = formatDateTime(alert.time);
            
            return (
              <div key={`${alert.person_id}-${index}`} className="alert-card">
                <div className="alert-header">
                  <span className={`alert-level level-${alert.level}`}>
                    {alert.level.toUpperCase()}
                  </span>
                  <span className="alert-time">
                    {date} {time}
                  </span>
                </div>
                
                <div className="alert-image">
                  {alert.image ? (
                    <img 
                      src={alert.image} 
                      alt="Alert image"
                      className="alert-img"
                    />
                  ) : (
                    <div className="no-image">
                      <div className="no-image-icon">📷</div>
                      <p>No image available</p>
                    </div>
                  )}
                </div>
                
                <div className="alert-body">
                  <p className="alert-message">{alert.message}</p>
                  
                  <div className="alert-details">
                    <div className="detail-item">
                      <span className="detail-label">Person ID:</span>
                      <span className="detail-value">
                        {alert.person_id.substring(0, 10)}...
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Camera ID:</span>
                      <span className="detail-value">{alert.camera_id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Image ID:</span>
                      <span className="detail-value">
                        {alert.image_id.substring(0, 10)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Loading overlay for refresh */}
      {loading && alerts.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner-small"></div>
        </div>
      )}
    </div>
  );
};

export default MongoAlerts;
