import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile details fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  // Alert/Snackbar state
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAddress(user.address || '');
    }
  }, [user]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !address.trim()) {
      setAlertMsg('Name, Email, and Physical Address are required.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (name.length < 2 || name.length > 60) {
      setAlertMsg('Name must be between 2 and 60 characters.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMsg('Please provide a valid email address.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (address.length > 400) {
      setAlertMsg('Address cannot exceed 400 characters.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmittingDetails(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
      });

      updateUser(updatedUser);
      setAlertMsg('Profile details updated successfully.');
      setAlertSeverity('success');
      setOpenSnackbar(true);
      setIsEditingDetails(false);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to update profile details. Please try again.';
      setAlertMsg(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      setAlertSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlertMsg('All password fields are required.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMsg('New Password and Confirm New Password do not match.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setAlertMsg('New password must be between 8 and 16 characters.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
    if (!passwordRegex.test(newPassword)) {
      setAlertMsg('New password must contain at least one uppercase letter and one special character.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setAlertMsg('Password changed successfully.');
      setAlertSeverity('success');
      setOpenSnackbar(true);
      // Clear fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to update password. Please try again.';
      setAlertMsg(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      setAlertSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        Account Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your profile settings and change password credentials.
      </Typography>

      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Personal Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                component="form"
                onSubmit={handleUpdateDetails}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditingDetails || isSubmittingDetails}
                  fullWidth
                  required
                />
                <TextField
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditingDetails || isSubmittingDetails}
                  fullWidth
                  required
                />
                <TextField
                  label="Physical Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditingDetails || isSubmittingDetails}
                  multiline
                  rows={2}
                  fullWidth
                  required
                />
                <TextField
                  label="Account Type"
                  value={user?.role || ''}
                  disabled
                  fullWidth
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  {!isEditingDetails ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditingDetails(true)}
                      fullWidth
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => {
                          setIsEditingDetails(false);
                          if (user) {
                            setName(user.name);
                            setEmail(user.email);
                            setAddress(user.address || '');
                          }
                        }}
                        disabled={isSubmittingDetails}
                        fullWidth
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isSubmittingDetails}
                        fullWidth
                      >
                        {isSubmittingDetails ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                component="form"
                onSubmit={handleUpdatePassword}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <TextField
                  label="Current Password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                  helperText="Must be 8-16 characters, contain at least one uppercase letter and one special character."
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
