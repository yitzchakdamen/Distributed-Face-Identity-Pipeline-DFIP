// MongoDB Gallery Page - combines persons gallery and alerts

import React, { useState } from 'react';
import MongoGallery from '../components/MongoGallery';
import MongoAlerts from '../components/MongoAlerts';
import './MongoPage.css';

const MongoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'alerts'>('gallery');

  return (
    <div className="mongo-page">
      <div className="mongo-page-header">
        <h1>MongoDB Data Viewer</h1>
        <p className="subtitle">View persons gallery and security alerts from MongoDB</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <span className="tab-icon">👥</span>
          Persons Gallery
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <span className="tab-icon">🚨</span>
          Security Alerts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'gallery' && <MongoGallery />}
        {activeTab === 'alerts' && <MongoAlerts />}
      </div>
    </div>
  );
};

export default MongoPage;
