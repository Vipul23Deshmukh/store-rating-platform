import React from 'react';
import { Card, CardContent, Typography, Box, Button, Grid } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useNavigate } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
        Customer Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Discover local stores, leave reviews, and rate your favorite business spots.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StorefrontIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Explore Stores</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Browse & Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RateReviewIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">My Reviews</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>--</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={() => navigate('/stores')}>
          Explore Stores
        </Button>
      </Box>
    </Box>
  );
};

export default UserDashboard;
