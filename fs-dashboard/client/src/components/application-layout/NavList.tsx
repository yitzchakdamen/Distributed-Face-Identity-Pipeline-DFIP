import * as React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';
import { useAuth } from '../../context/AuthContext';

const NavList = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const mainNavItems = [
        { text: 'Dashboard', to: '/', icon: <DashboardIcon />, admin: false },
        { text: 'Events', to: '/events', icon: <EventIcon />, admin: false },
        { text: 'Cameras', to: '/cameras', icon: <CameraAltIcon />, admin: false },
        { text: 'MongoDB Gallery', to: '/mongo', icon: <StorageIcon />, admin: false },
        { text: 'Users', to: '/users', icon: <PeopleIcon />, admin: true },
    ];

    const secondaryNavItems = [
        { text: 'Settings', to: '/settings', icon: <SettingsIcon /> },
    ];

    return (
        <div>
            <List>
                {mainNavItems.map((item) => {
                    if (item.admin && user?.role !== 'admin') {
                        return null;
                    }
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton component={RouterLink} to={item.to} selected={location.pathname === item.to}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider />
            <List>
                {secondaryNavItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton component={RouterLink} to={item.to} selected={location.pathname === item.to}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemButton onClick={logout}>
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );
};

export default NavList;
