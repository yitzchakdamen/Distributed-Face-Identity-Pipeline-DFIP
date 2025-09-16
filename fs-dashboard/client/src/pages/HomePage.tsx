import React from "react";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="home-page">
        <div className="welcome-message">
          <h1>Welcome to DFIP Dashboard</h1>
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
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Cameras</h3>
            <div className="stat-number">12</div>
          </div>
          
          <div className="stat-card">
            <h3>Today's Events</h3>
            <div className="stat-number">48</div>
          </div>
          
          <div className="stat-card danger">
            <h3>High Risk Alerts</h3>
            <div className="stat-number">3</div>
          </div>
          
          <div className="stat-card">
            <h3>System Status</h3>
            <div className="stat-status online">Online</div>
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
