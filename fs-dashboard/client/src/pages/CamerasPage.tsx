import React, { useState, useEffect } from 'react';
import { getAllCameras } from '../services/cameraService';
import CameraCreationForm from '../components/CameraCreationForm';
import { useAuth } from '../context/AuthContext';
import type { ICamera } from '../@types/Camera';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`camera-tabpanel-${index}`}
      aria-labelledby={`camera-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CamerasPage: React.FC = () => {
  const { user } = useAuth();
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await getAllCameras();
        if (response.success && response.data) {
          setCameras(response.data);
        } else {
          setError(response.error || 'Failed to fetch cameras');
        }
      } catch (err: any) {
        setError(err.message || 'Network error occurred');
      } finally {
        setLoading(false);
      }
    };
    if (tabValue === 0) {
        fetchCameras();
    }
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const canCreate = user && ['operator', 'admin'].includes(user.role);

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Camera Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="camera management tabs">
          <Tab label="View Cameras" id="camera-tab-0" />
          {canCreate && <Tab label="Create Camera" id="camera-tab-1" />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading && <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <Grid container spacing={3}>
            {cameras.length === 0 ? (
              <Grid item xs={12}><Typography>No cameras found.</Typography></Grid>
            ) : (
              cameras.map((camera) => (
                <Grid item key={camera.id} xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <Typography variant="h6">{camera.name}</Typography>
                        <Chip label="ACTIVE" color="success" size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap gutterBottom>
                        ID: {camera.camera_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Connection: {camera.connection_string}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">View Details</Button>
                      <Button size="small">Edit</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </TabPanel>

      {canCreate && (
        <TabPanel value={tabValue} index={1}>
          <CameraCreationForm />
        </TabPanel>
      )}
    </Box>
  );
};

export default CamerasPage;
