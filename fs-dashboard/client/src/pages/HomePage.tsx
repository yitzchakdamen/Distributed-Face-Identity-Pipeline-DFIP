import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Grid, Card, CardContent, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
    <Box sx={{ mr: 2, color: color }}>
      {React.cloneElement(icon, { style: { fontSize: 40 } })}
    </Box>
    <Box>
      <Typography variant="h5" component="div">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Box>
  </Card>
);

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Dummy data - in a real app, this would come from an API
  const stats = {
    activeCameras: 12,
    todaysEvents: 48,
    highRiskAlerts: 3,
    systemStatus: 'Online',
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Cameras" value={stats.activeCameras} icon={<CameraAltIcon />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Today's Events" value={stats.todaysEvents} icon={<EventIcon />} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="High Risk Alerts" value={stats.highRiskAlerts} icon={<WarningIcon />} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="System Status" value={stats.systemStatus} icon={<CheckCircleIcon />} color="success.main" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Box>
          <Button component={RouterLink} to="/events" variant="contained" sx={{ mr: 2 }}>
            View Recent Events
          </Button>
          <Button component={RouterLink} to="/cameras" variant="outlined">
            Manage Cameras
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;
