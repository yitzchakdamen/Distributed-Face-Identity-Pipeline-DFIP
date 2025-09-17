import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./HomePage.css";

interface DashboardStats {
  activeCameras: number;
  todaysEvents: number;
  highRiskAlerts: number;
  systemStatus: string;
  userCameras: any[];
}

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeCameras: 0,
    todaysEvents: 0,
    highRiskAlerts: 0,
    systemStatus: 'loading',
    userCameras: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="home-page">
        <div className="welcome-message">
          <h1>Welcome to FaceAlert</h1>
          <p>Please log in to access the face recognition monitoring system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="dashboard-overview">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {user?.name}!</p>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchDashboardStats}>Try Again</button>
          </div>
        )}
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Cameras</h3>
            <div className="stat-number">
              {loading ? '...' : stats.activeCameras}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Today's Events</h3>
            <div className="stat-number">
              {loading ? '...' : stats.todaysEvents}
            </div>
          </div>
          
          <div className={`stat-card ${stats.highRiskAlerts > 0 ? 'danger' : ''}`}>
            <h3>High Risk Alerts</h3>
            <div className="stat-number">
              {loading ? '...' : stats.highRiskAlerts}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>System Status</h3>
            <div className={`stat-status ${stats.systemStatus === 'online' ? 'online' : 'offline'}`}>
              {loading ? 'Loading...' : (stats.systemStatus === 'online' ? 'Online' : 'Offline')}
            </div>
          </div>
        </div>
        
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <a href="/events" className="action-button">View Recent Events</a>
            <a href="/cameras" className="action-button">Manage Cameras</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
