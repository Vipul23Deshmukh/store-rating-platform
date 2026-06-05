import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  StorefrontOutlined,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { LoginRequest, Role } from '../../types';

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

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null);
    try {
      await login(data);
      // Role-based redirect: get user from freshly stored token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const redirectPath = from || getRoleRedirectPath(payload.role as Role);
          navigate(redirectPath, { replace: true });
          return;
        } catch {
          // fallback below
        }
      }
      navigate(from || '/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Invalid email or password.');
    }
  };

  return (
    <Box className="auth-background">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="auth-card fade-in-up" elevation={0}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo / Brand */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              <StorefrontOutlined sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
          </Box>

          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              color: '#000000',
              mb: 0.5,
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'rgba(0, 0, 0, 0.55)', mb: 4 }}
          >
            Sign in to the Store Rating Platform
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
            <TextField
              margin="normal"
              fullWidth
              id="login-email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#4b5563', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...register('email', {
                required: 'Email is required.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please provide a valid email address.',
                },
              })}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#4b5563', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#4b5563' }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password', {
                required: 'Password is required.',
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
                background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: 'rgba(255,255,255,0.5)',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Sign In'
              )}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#818CF8',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#A5B4FC',
                    },
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
