import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import { userService } from '../../services/user.service';
import { User, Role, UpdateUserRequest } from '../../types';

// Extended type for user details containing count statistics from backend findOne
interface UserDetailResponse extends User {
  _count?: {
    stores: number;
    ratings: number;
  };
}

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserRequest>({
    defaultValues: {
      name: '',
      email: '',
      address: '',
      role: Role.USER,
    },
  });

  const fetchUserDetails = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await userService.get(id);
      setUser(data);
      // Pre-populate form
      reset({
        name: data.name,
        email: data.email,
        address: data.address,
        role: data.role,
      });
    } catch (err: any) {
      console.error('Failed to load user details:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const onSubmit = async (data: UpdateUserRequest) => {
    if (!id) return;
    setSaveLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updatedUser = await userService.update(id, data);
      setSuccessMsg('User profile updated successfully!');
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
      setEditMode(false);
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save updates.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg && !user) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>Back to Users</Button>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
      {/* Breadcrumbs and back button */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/users'); }}>
            Users
          </Link>
          <Typography color="text.primary">User Profile</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifySelf: 'flex-start', gap: 1 }}>
          <IconButton onClick={() => navigate('/users')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            User Account Profile
          </Typography>
        </Box>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Side: Stats and Info Cards */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Main Info Card */}
            <Card sx={{ borderRadius: 3, textAlign: 'center', p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Paper
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  elevation={3}
                >
                  <PersonIcon sx={{ fontSize: 44 }} />
                </Paper>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>

              <Chip
                label={user.role}
                color={
                  user.role === Role.ADMIN
                    ? 'error'
                    : user.role === Role.STORE_OWNER
                    ? 'secondary'
                    : 'primary'
                }
                sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                Registered On
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                {new Date(user.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Typography>

              <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                Last Updated
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {new Date(user.updatedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Typography>
            </Card>

            {/* Counts Stats Card */}
            <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Activity Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorefrontIcon color="action" fontSize="small" />
                    <Typography variant="body2">Stores Owned</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {user._count?.stores ?? 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="action" fontSize="small" />
                    <Typography variant="body2">Ratings Submitted</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {user._count?.ratings ?? 0}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid>

        {/* Right Side: Details Form Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', height: '100%' }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Administrative Details
                  </Typography>
                  {!editMode && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      size="small"
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>

                <Grid container spacing={3}>
                  {/* Name */}
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
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          slotProps={{
                            input: {
                              readOnly: !editMode,
                            }
                          }}
                          variant={editMode ? 'outlined' : 'filled'}
                        />
                      )}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                          fullWidth
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          slotProps={{
                            input: {
                              readOnly: !editMode,
                            }
                          }}
                          variant={editMode ? 'outlined' : 'filled'}
                        />
                      )}
                    />
                  </Grid>

                  {/* Role */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="role"
                      control={control}
                      rules={{ required: 'Role is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select={editMode}
                          label="System Role"
                          fullWidth
                          error={!!errors.role}
                          helperText={errors.role?.message}
                          slotProps={{
                            input: {
                              readOnly: !editMode,
                            }
                          }}
                          variant={editMode ? 'outlined' : 'filled'}
                        >
                          <MenuItem value={Role.USER}>Regular User</MenuItem>
                          <MenuItem value={Role.STORE_OWNER}>Store Owner</MenuItem>
                          <MenuItem value={Role.ADMIN}>Administrator</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Address */}
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
                          label="Physical Address"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.address}
                          helperText={errors.address?.message}
                          slotProps={{
                            input: {
                              readOnly: !editMode,
                            }
                          }}
                          variant={editMode ? 'outlined' : 'filled'}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>

              {editMode && (
                <CardActions sx={{ p: 4, pt: 0, justifyContent: 'flex-end', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CloseIcon />}
                    onClick={() => {
                      setEditMode(false);
                      setErrorMsg(null);
                      // Reset to existing user details
                      reset({
                        name: user.name,
                        email: user.email,
                        address: user.address,
                        role: user.role,
                      });
                    }}
                    disabled={saveLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardActions>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetailPage;
