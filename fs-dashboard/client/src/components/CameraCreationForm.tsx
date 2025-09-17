import React, { useState } from 'react';
import { createCamera } from '../services/cameraService';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';

interface CameraFormData {
  name: string;
  camera_id: string;
  connection_string: string;
}

const CameraCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<CameraFormData>({
    name: '',
    camera_id: '',
    connection_string: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateCameraId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const cameraId = `CAM_${timestamp}_${random}`.toUpperCase();
    setFormData((prev) => ({ ...prev, camera_id: cameraId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name || !formData.camera_id || !formData.connection_string) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await createCamera(formData);
      if (response.success) {
        setSuccess(`Camera "${formData.name}" created successfully! You can now view it in the 'View Cameras' tab.`);
        setFormData({ name: '', camera_id: '', connection_string: '' });
      } else {
        setError(response.error || 'Failed to create camera.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 700, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create a New Camera
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Camera Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            fullWidth
            helperText="A descriptive name for easy identification (e.g., Main Entrance)."
          />

          <TextField
            label="Camera ID"
            name="camera_id"
            value={formData.camera_id}
            onChange={handleInputChange}
            required
            fullWidth
            helperText="A unique identifier used by the system."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button onClick={generateCameraId}>Generate</Button>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Connection String"
            name="connection_string"
            value={formData.connection_string}
            onChange={handleInputChange}
            required
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., rtsp://admin:password@192.168.1.100:554/stream1"
            helperText="The full URL to access the camera stream (supports http, https, rtsp)."
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Camera'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CameraCreationForm;
