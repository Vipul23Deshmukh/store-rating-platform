import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link,
  CardActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../../services/store.service';
import { CreateStoreRequest } from '../../types';

export const CreateStorePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStoreRequest>({
    defaultValues: {
      name: '',
      email: '',
      address: '',
    },
  });

  const onSubmit = async (data: CreateStoreRequest) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await storeService.create(data);
      setSuccessMsg('Store registered successfully!');
      reset();
      // Redirect after a brief delay so they see the success message
      setTimeout(() => {
        navigate('/stores');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create store:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create store. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      {/* Header and Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/stores'); }}>
            Stores
          </Link>
          <Typography color="text.primary">Create Store</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/stores')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Register New Store
          </Typography>
        </Box>
      </Box>

      {/* Main card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <AddHomeWorkIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Store Details
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {successMsg}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Store Name */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: 'Store name is required',
                    maxLength: {
                      value: 60,
                      message: 'Store name cannot exceed 60 characters.',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Store Name"
                      placeholder="e.g. Starbucks Main St"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              {/* Store Contact Email */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Store contact email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                    maxLength: {
                      value: 255,
                      message: 'Store email cannot exceed 255 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact Email"
                      type="email"
                      placeholder="e.g. contact@starbucksmains.com"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              {/* Store Physical Address */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="address"
                  control={control}
                  rules={{
                    required: 'Store physical address is required',
                    maxLength: {
                      value: 400,
                      message: 'Store address cannot exceed 400 characters.',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Physical Address"
                      placeholder="Enter the complete address"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>

          <CardActions sx={{ p: 4, pt: 0, justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/stores')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddHomeWorkIcon />}
            >
              {loading ? 'Registering...' : 'Register Store'}
            </Button>
          </CardActions>
        </Box>
      </Card>
    </Box>
  );
};

export default CreateStorePage;
