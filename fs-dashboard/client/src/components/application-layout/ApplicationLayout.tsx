import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import { Box, Container } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const ApplicationLayout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.includes(location.pathname);

  // If user is authenticated and not on a public page, show the dashboard layout
  if (isAuthenticated && !isPublicPage) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // For public pages (or when not authenticated), show a simple centered layout
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default ApplicationLayout;
