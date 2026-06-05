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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  StorefrontOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest, Role } from '../../types';

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

const getRoleRedirectPath = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return '/dashboard';
    case Role.STORE_OWNER:
      return '/dashboard';
    case Role.USER:
      return '/stores';
    default:
      return '/dashboard';
  }
};

// ── Validation rules matching backend DTOs ────────────────────────────────────
const validationRules = {
  name: {
    required: 'Full name is required.',
    minLength: { value: 2, message: 'Name must be at least 2 characters long.' },
    maxLength: { value: 60, message: 'Name cannot exceed 60 characters.' },
  },
  email: {
    required: 'Email is required.',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please provide a valid email address.',
    },
    maxLength: { value: 255, message: 'Email is too long.' },
  },
  password: {
    required: 'Password is required.',
    minLength: { value: 8, message: 'Password must be between 8 and 16 characters.' },
    maxLength: { value: 16, message: 'Password must be between 8 and 16 characters.' },
    pattern: {
      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      message: 'Must contain at least one uppercase letter and one special character.',
    },
  },
  address: {
    required: 'Address is required.',
    maxLength: { value: 400, message: 'Address cannot exceed 400 characters.' },
  },
};

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    defaultValues: { name: '', email: '', password: '', address: '', role: Role.USER },
    mode: 'onBlur',
  });

  const watchedPassword = watch('password', '');
  const passwordStrength = useMemo(() => getPasswordStrength(watchedPassword), [watchedPassword]);

  // Inline requirement checks for visual feedback
  const passwordChecks = useMemo(() => {
    const p = watchedPassword;
    return [
      { label: '8–16 characters', met: p.length >= 8 && p.length <= 16 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(p) },
      { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterRequest) => {
    setServerError(null);
    try {
      await registerUser(data);
      // Role-based redirect
      const redirectPath = getRoleRedirectPath(data.role || Role.USER);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box className="auth-background">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="auth-card fade-in-up" elevation={0} sx={{ maxWidth: 520 }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo / Brand */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #EC4899 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)',
              }}
            >
              <StorefrontOutlined sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
          </Box>

          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ fontWeight: 800, color: '#fff', mb: 0.5, letterSpacing: '-0.02em' }}
          >
            Create Account
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'rgba(255,255,255,0.55)', mb: 4 }}
          >
            Join the Store Rating Platform today
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
            {/* Name */}
            <TextField
              margin="normal"
              fullWidth
              id="register-name"
              label="Full Name"
              autoComplete="name"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message || 'Min 2, max 60 characters'}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('name', validationRules.name)}
            />

            {/* Email */}
            <TextField
              margin="normal"
              fullWidth
              id="register-email"
              label="Email Address"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('email', validationRules.email)}
            />

            {/* Password */}
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              error={!!errors.password}
              helperText={errors.password?.message}
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
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password', validationRules.password)}
            />

            {/* Password Strength Bar */}
            {watchedPassword && (
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

                {/* Password requirement chips */}
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

            {/* Address */}
            <TextField
              margin="normal"
              fullWidth
              id="register-address"
              label="Physical Address"
              multiline
              rows={2}
              error={!!errors.address}
              helperText={errors.address?.message || 'Max 400 characters'}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <LocationIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('address', validationRules.address)}
            />

            {/* Role Selection */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.role}>
                  <InputLabel
                    id="role-select-label"
                    sx={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    Account Type
                  </InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="register-role-select"
                    label="Account Type"
                    {...field}
                    sx={{
                      '& .MuiSelect-select': { color: 'rgba(255,255,255,0.92)' },
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: {
                          sx: {
                            backgroundColor: '#1E293B',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            '& .MuiMenuItem-root': {
                              color: 'rgba(255,255,255,0.85)',
                              '&:hover': { backgroundColor: 'rgba(99,102,241,0.15)' },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(99,102,241,0.25)',
                                '&:hover': { backgroundColor: 'rgba(99,102,241,0.3)' },
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value={Role.USER}>Normal User (Browse & Rate)</MenuItem>
                    <MenuItem value={Role.STORE_OWNER}>Store Owner (Manage Stores)</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                </FormControl>
              )}
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
                background: 'linear-gradient(135deg, #EC4899 0%, #6366F1 100%)',
                boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #DB2777 0%, #4F46E5 100%)',
                  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: 'rgba(236, 72, 153, 0.3)',
                  color: 'rgba(255,255,255,0.5)',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Create Account'
              )}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#F472B6',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#F9A8D4',
                    },
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
