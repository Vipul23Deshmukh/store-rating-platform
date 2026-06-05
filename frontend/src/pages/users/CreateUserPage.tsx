import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link,
  CardActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { Role, CreateUserRequest } from '../../types';

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserRequest>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      address: '',
      role: Role.USER,
    },
  });

  const onSubmit = async (data: CreateUserRequest) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await userService.create(data);
      setSuccessMsg('User created successfully!');
      reset();
      // Redirect after a brief delay so they see the success message
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create user. Please check your inputs.');
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
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/users'); }}>
            Users
          </Link>
          <Typography color="text.primary">Create User</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Add New User
          </Typography>
        </Box>
      </Box>

      {/* Main card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <PersonAddIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Details
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
              {/* Full Name */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: 'Name is required',
                    minLength: {
                      value: 20,
                      message: 'Name must be at least 20 characters long.',
                    },
                    maxLength: {
                      value: 60,
                      message: 'Name cannot exceed 60 characters.',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      placeholder="Enter full name (minimum 20 characters)"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              {/* Email Address */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                    maxLength: {
                      value: 255,
                      message: 'Email cannot exceed 255 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      type="email"
                      placeholder="e.g. john@example.com"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              {/* Role Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="System Role"
                      fullWidth
                      error={!!errors.role}
                      helperText={errors.role?.message}
                      disabled={loading}
                    >
                      <MenuItem value={Role.USER}>Regular User (Customer)</MenuItem>
                      <MenuItem value={Role.STORE_OWNER}>Store Owner</MenuItem>
                      <MenuItem value={Role.ADMIN}>System Administrator</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {/* Password */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be between 8 and 16 characters.',
                    },
                    maxLength: {
                      value: 16,
                      message: 'Password must be between 8 and 16 characters.',
                    },
                    validate: {
                      uppercase: (v) => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter.',
                      special: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Password must contain at least one special character.',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Temporary Password"
                      type="password"
                      placeholder="Minimum 8 chars, 1 uppercase, 1 special char"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              {/* Mailing Address */}
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="address"
                  control={control}
                  rules={{
                    required: 'Address is required',
                    maxLength: {
                      value: 400,
                      message: 'Address cannot exceed 400 characters.',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mailing Address"
                      placeholder="Enter standard physical address"
                      fullWidth
                      multiline
                      rows={3}
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
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </CardActions>
        </Box>
      </Card>
    </Box>
  );
};

export default CreateUserPage;
