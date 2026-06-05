import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import Dashboard from '../pages/dashboard/Dashboard';
import StoreListPage from '../pages/stores/StoreListPage';
import StoreDetailPage from '../pages/stores/StoreDetailPage';
import UserListPage from '../pages/users/UserListPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import CreateUserPage from '../pages/users/CreateUserPage';
import CreateStorePage from '../pages/stores/CreateStorePage';
import ProfilePage from '../pages/profile/ProfilePage';
import MainLayout from '../components/Layout/MainLayout';
import ProtectedRoute from '../components/Guards/ProtectedRoute';
import { Role } from '../types';
import { RoleBasedRedirect } from '../components/Guards/RoleBasedRedirect';

export const router = createBrowserRouter([
  // ── Public Routes ───────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/change-password',
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },

  // ── Role-based Root Redirect ────────────────────────────────────────────────
  // Redirects authenticated users to their role's default page.
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleBasedRedirect />
      </ProtectedRoute>
    ),
  },

  // ── Dashboard (Admin & Store Owner) ─────────────────────────────────────────
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN, Role.STORE_OWNER]}>
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // ── Stores (All authenticated users) ────────────────────────────────────────
  {
    path: '/stores',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StoreListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stores/create',
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN, Role.STORE_OWNER]}>
        <MainLayout>
          <CreateStorePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stores/:id',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StoreDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // ── Users Management (Admin only) ───────────────────────────────────────────
  {
    path: '/users',
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN]}>
        <MainLayout>
          <UserListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/create',
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN]}>
        <MainLayout>
          <CreateUserPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/:id',
    element: (
      <ProtectedRoute allowedRoles={[Role.ADMIN]}>
        <MainLayout>
          <UserDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // ── Profile (All authenticated users) ───────────────────────────────────────
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // ── Fallback Catch-All ──────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
