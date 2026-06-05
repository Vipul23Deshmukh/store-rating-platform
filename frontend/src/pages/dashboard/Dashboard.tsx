import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import AdminDashboard from './AdminDashboard';
import OwnerDashboard from './OwnerDashboard';
import UserDashboard from './UserDashboard';
import { Box, Typography } from '@mui/material';

export const Dashboard: React.FC = () => {
  const { role, isAdmin, isStoreOwner, isUser } = usePermission();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isStoreOwner()) {
    return <OwnerDashboard />;
  }

  if (isUser()) {
    return <UserDashboard />;
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h5" color="error">
        Error: Role '{role}' has no dashboard view.
      </Typography>
    </Box>
  );
};

export default Dashboard;
