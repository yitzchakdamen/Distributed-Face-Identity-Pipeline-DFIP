import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

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
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    setIsSnackbarOpen(true);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enablePopups}
                onChange={handleSwitchChange}
                name="enablePopups"
              />
            }
            label="Enable popup notifications for new events"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableNewEventNotifications}
                onChange={handleSwitchChange}
                name="enableNewEventNotifications"
              />
            }
            label="Show notification icon for new events"
          />
          <FormControl sx={{ mt: 2, minWidth: 200 }} size="small">
             <InputLabel id="refresh-interval-label">Refresh Interval</InputLabel>
            <Select
              labelId="refresh-interval-label"
              name="refreshInterval"
              value={settings.refreshInterval}
              label="Refresh Interval"
              onChange={handleSelectChange}
            >
              <MenuItem value={10}>10 seconds</MenuItem>
              <MenuItem value={15}>15 seconds</MenuItem>
              <MenuItem value={30}>30 seconds</MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
              <MenuItem value={120}>2 minutes</MenuItem>
              <MenuItem value={300}>5 minutes</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
