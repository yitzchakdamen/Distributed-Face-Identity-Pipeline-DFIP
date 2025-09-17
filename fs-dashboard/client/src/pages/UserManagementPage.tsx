import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/userService';
import type { IUser } from '../@types/User';
import UserCreationForm from '../components/UserCreationForm';
import CameraAssignment from '../components/CameraAssignment';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`user-mgm-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (tabValue === 0) {
      loadUsers();
    }
  }, [tabValue]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRoleChipColor = (role: string) => {
      switch (role) {
          case 'admin': return 'error';
          case 'operator': return 'warning';
          case 'viewer': return 'info';
          default: return 'default';
      }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
          <Tab label={`View Users (${users.length})`} id="user-mgm-tab-0" />
          <Tab label="Create User" id="user-mgm-tab-1" />
          <Tab label="Assign Cameras" id="user-mgm-tab-2" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading && <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
            <Paper sx={{overflow: 'hidden'}}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell component="th" scope="row">{user.name}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Chip label={user.role} color={getRoleChipColor(user.role)} size="small" /></TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" variant="outlined">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <UserCreationForm />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <CameraAssignment />
      </TabPanel>
    </Box>
  );
};

export default UserManagementPage;
