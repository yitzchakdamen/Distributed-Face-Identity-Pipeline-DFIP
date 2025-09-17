import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

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
  alerts?: Alert[];
}

const MongoAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetch('/api/mongo/alerts');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: AlertsResponse = await response.json();
      if (data.success) {
        setAlerts(data.data || data.alerts || []);
      } else {
        throw new Error('API returned an error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter) setFilter(newFilter);
  };

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.level === filter);

  const getChipColor = (level: string) => {
    switch (level) {
      case 'alert': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  if (loading && alerts.length === 0) return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>;
  if (error && alerts.length === 0) return <Alert severity="error" action={<Button onClick={fetchAlerts}>Retry</Button>}>{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Security Alerts</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { fetchAlerts(); setIsSnackbarOpen(true); }} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange} sx={{ mb: 2 }}>
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="alert">Alert</ToggleButton>
        <ToggleButton value="info">Info</ToggleButton>
      </ToggleButtonGroup>

      <Grid container spacing={3}>
        {filteredAlerts.map((alert, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card>
              {alert.image && <CardMedia component="img" height="194" image={alert.image} alt="Alert" />}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={alert.level.toUpperCase()} color={getChipColor(alert.level)} size="small" />
                  <Typography variant="caption">{new Date(alert.time).toLocaleString()}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{alert.message}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredAlerts.length === 0 && !loading && (
            <Grid item xs={12}><Typography>No alerts to display for this filter.</Typography></Grid>
        )}
      </Grid>

      <Snackbar open={isSnackbarOpen} autoHideDuration={3000} onClose={() => setIsSnackbarOpen(false)} message="Alerts refreshed" />
    </Box>
  );
};

export default MongoAlerts;
