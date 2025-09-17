import React, { useState, useEffect } from "react";
import "./SettingsPage.css";

interface NotificationSettings {
  enablePopups: boolean;
  refreshInterval: number; // seconds
  enableNewEventNotifications: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enablePopups: true,
    refreshInterval: 30,
    enableNewEventNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h2>Notification Settings</h2>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.enablePopups}
              onChange={(e) => handleSettingChange('enablePopups', e.target.checked)}
            />
            <span className="setting-text">Enable popup notifications for new events</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.enableNewEventNotifications}
              onChange={(e) => handleSettingChange('enableNewEventNotifications', e.target.checked)}
            />
            <span className="setting-text">Show notification icon for new events</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label-block">
            <span className="setting-text">Refresh interval (seconds):</span>
            <select
              value={settings.refreshInterval}
              onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
              className="setting-select"
            >
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={handleSave} className="save-button">
          Save Settings
        </button>
        {saved && <span className="save-success">Settings saved successfully!</span>}
      </div>
    </div>
  );
};

export default SettingsPage;
