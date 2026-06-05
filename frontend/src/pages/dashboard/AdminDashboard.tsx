import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { adminService, AdminStats } from '../../services/admin.service';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load system statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box sx={{ py: 2 }}>
      {/* Title section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Admin Control Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Oversee system performance, manage users, and configure local stores.
          </Typography>
        </Box>
        <IconButton onClick={fetchStats} disabled={loading} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
          {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards Row */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Total Users */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px 0 rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Total Users
                  </Typography>
                  {loading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {stats?.totalUsers ?? '--'}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    p: 1.5,
                    borderRadius: 3,
                    display: 'flex',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Stores */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px 0 rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Total Stores
                  </Typography>
                  {loading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      {stats?.totalStores ?? '--'}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText',
                    p: 1.5,
                    borderRadius: 3,
                    display: 'flex',
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Ratings */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px 0 rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Total Ratings
                  </Typography>
                  {loading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main' }}>
                      {stats?.totalRatings ?? '--'}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    bgcolor: 'warning.light',
                    color: 'warning.contrastText',
                    p: 1.5,
                    borderRadius: 3,
                    display: 'flex',
                  }}
                >
                  <StarIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions and Administration Sections */}
      <Grid container spacing={4}>
        {/* Left Side - Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }} variant="outlined">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Quick Management Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/users/create')}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)' },
                }}
              >
                Create New User
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<AddHomeWorkIcon />}
                onClick={() => navigate('/stores/create')}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)' },
                }}
              >
                Create New Store
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              * Creating a user supports roles: User, Store Owner, or Admin.
              Creating a store will assign the administrator as the direct owner.
            </Typography>
          </Paper>
        </Grid>

        {/* Right Side - Quick Lists Navigation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }} variant="outlined">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Navigate to Administrative Views
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                onClick={() => navigate('/users')}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Global Users List
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      View all registered clients, owners, and admins.
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIcon fontSize="small" />
              </Box>

              <Box
                onClick={() => navigate('/stores')}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StorefrontIcon color="secondary" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Global Stores List
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Verify ratings, address info, and delete stores.
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIcon fontSize="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
