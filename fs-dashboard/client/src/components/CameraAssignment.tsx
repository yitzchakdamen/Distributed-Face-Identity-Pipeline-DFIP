import React, { useState, useEffect } from 'react';
import { getAllCameras, assignCameraToUser } from '../services/cameraService';
import { getAllUsers } from '../services/userService';
import type { ICamera } from '../@types/Camera';
import type { IUser } from '../@types/User';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Grid,
  SelectChangeEvent
} from '@mui/material';

const CameraAssignment: React.FC = () => {
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [camerasRes, usersRes] = await Promise.all([getAllCameras(), getAllUsers()]);
        if (camerasRes.success && camerasRes.data) {
          setCameras(camerasRes.data);
        } else {
          setError(camerasRes.error || 'Failed to load cameras');
        }
        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data);
        } else {
          setError((prev) => (prev ? `${prev}, ` : '') + (usersRes.error || 'Failed to load users'));
        }
      } catch (err) {
        setError('An error occurred while loading data.');
      }
    };
    loadData();
  }, []);

  const handleAssignCamera = async () => {
    if (!selectedCamera || !selectedUser) {
      setError('Please select both a camera and a user.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await assignCameraToUser(selectedCamera, selectedUser);
      if (response.success) {
        setSuccess('Camera assigned successfully!');
        setSelectedCamera('');
        setSelectedUser('');
      } else {
        setError(response.error || 'Failed to assign camera.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: {xs: 2, md: 4}, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Assign Camera to User
      </Typography>
      <Grid container spacing={3}>
        {error && <Grid item xs={12}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Grid>}
        {success && <Grid item xs={12}><Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert></Grid>}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="camera-select-label">Select Camera</InputLabel>
            <Select
              labelId="camera-select-label"
              value={selectedCamera}
              label="Select Camera"
              onChange={(e: SelectChangeEvent) => setSelectedCamera(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {cameras.map((camera) => (
                <MenuItem key={camera.id} value={camera.id}>
                  {camera.name} ({camera.camera_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="user-select-label">Select User</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUser}
              label="Select User"
              onChange={(e: SelectChangeEvent) => setSelectedUser(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            onClick={handleAssignCamera}
            variant="contained"
            disabled={loading || !selectedCamera || !selectedUser}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Assign Camera'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CameraAssignment;
