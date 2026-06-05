import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  LinearProgress,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  LockReset as LockResetIcon,
  CheckCircleOutlined,
  ErrorOutlined,
  ArrowBack,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/auth.service';

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Password strength calculator ──────────────────────────────────────────────
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) return { score: (score / 6) * 100, label: 'Weak', color: '#EF4444' };
  if (score <= 4) return { score: (score / 6) * 100, label: 'Fair', color: '#F59E0B' };
  return { score: (score / 6) * 100, label: 'Strong', color: '#10B981' };
};

export const ChangePasswordPage: React.FC = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const watchedNewPassword = watch('newPassword', '');
  const passwordStrength = useMemo(() => getPasswordStrength(watchedNewPassword), [watchedNewPassword]);

  const passwordChecks = useMemo(() => {
    const p = watchedNewPassword;
    return [
      { label: '8–16 characters', met: p.length >= 8 && p.length <= 16 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(p) },
      { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];
  }, [watchedNewPassword]);

  const onSubmit = async (data: ChangePasswordForm) => {
    setServerError(null);
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setSuccessOpen(true);
      reset();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update password. Please try again.');
    }
  };

  return (
    <Box className="auth-background">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="auth-card fade-in-up" elevation={0} sx={{ maxWidth: 500 }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Back Link */}
          <Box sx={{ mb: 2 }}>
            <Link
              component={RouterLink}
              to="/profile"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: '#818CF8' },
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
              Back to Profile
            </Link>
          </Box>

          {/* Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              }}
            >
              <LockResetIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
          </Box>

          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ fontWeight: 800, color: '#fff', mb: 0.5, letterSpacing: '-0.02em' }}
          >
            Change Password
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'rgba(255,255,255,0.55)', mb: 4 }}
          >
            Update your account security credentials
          </Typography>

          {serverError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-icon': { color: '#F87171' },
              }}
            >
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Current Password */}
            <TextField
              margin="normal"
              fullWidth
              id="change-old-password"
              label="Current Password"
              type={showOldPassword ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {showOldPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('oldPassword', {
                required: 'Current password is required.',
              })}
            />

            {/* New Password */}
            <TextField
              margin="normal"
              fullWidth
              id="change-new-password"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('newPassword', {
                required: 'New password is required.',
                minLength: { value: 8, message: 'New password must be between 8 and 16 characters.' },
                maxLength: { value: 16, message: 'New password must be between 8 and 16 characters.' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
                  message: 'Must contain at least one uppercase letter and one special character.',
                },
              })}
            />

            {/* Password Strength Bar */}
            {watchedNewPassword && (
              <Box sx={{ mt: 1, mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: passwordStrength.color,
                      borderRadius: 2,
                      transition: 'all 0.4s ease',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600 }}>
                    {passwordStrength.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {passwordChecks.map((check) => (
                    <Chip
                      key={check.label}
                      size="small"
                      icon={
                        check.met ? (
                          <CheckCircleOutlined sx={{ fontSize: 14 }} />
                        ) : (
                          <ErrorOutlined sx={{ fontSize: 14 }} />
                        )
                      }
                      label={check.label}
                      sx={{
                        fontSize: '0.7rem',
                        height: 24,
                        backgroundColor: check.met
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(255, 255, 255, 0.06)',
                        color: check.met ? '#34D399' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${check.met ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        '& .MuiChip-icon': {
                          color: check.met ? '#34D399' : 'rgba(255,255,255,0.3)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Confirm Password */}
            <TextField
              margin="normal"
              fullWidth
              id="change-confirm-password"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('confirmPassword', {
                required: 'Please confirm your new password.',
                validate: (value) =>
                  value === watchedNewPassword || 'Passwords do not match.',
              })}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #4F46E5 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: 'rgba(16, 185, 129, 0.3)',
                  color: 'rgba(255,255,255,0.5)',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Update Password'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={5000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{
            borderRadius: '12px',
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          Password changed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePasswordPage;
