import React, { useState } from 'react';
import { createUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

interface UserFormData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

const UserCreationForm: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'viewer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await createUser(formData);
      if (response.success) {
        setSuccess(`User "${formData.name}" created successfully.`);
        setFormData({ username: '', password: '', name: '', email: '', role: 'viewer' });
      } else {
        setError(response.error || 'Failed to create user.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: {xs: 2, md: 4}, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>Create a New User</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {error && <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>}
          {success && <Grid item xs={12}><Alert severity="success">{success}</Alert></Grid>}

          <Grid item xs={12} sm={6}>
            <TextField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Username" name="username" value={formData.username} onChange={handleInputChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} required fullWidth helperText="Minimum 6 characters" />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select labelId="role-label" name="role" value={formData.role} label="Role" onChange={handleSelectChange}>
                {currentUser?.role === 'admin' && <MenuItem value="admin">Admin</MenuItem>}
                {currentUser?.role === 'admin' && <MenuItem value="operator">Operator</MenuItem>}
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ py: 1.5 }}>
              {loading ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default UserCreationForm;
