import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Donations } from './pages/Donations';
import { DonationDetails } from './pages/DonationDetails';
import { AddDonation } from './pages/AddDonation';
import { Volunteer } from './pages/Volunteer';
import { Requests } from './pages/Requests';
import { NotFound } from './pages/NotFound';

// Auth
import { AuthLayout } from './pages/auth/AuthLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Dashboards
import { UserDashboard } from './pages/UserDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  // Auth pages (no navbar/footer)
  {
    Component: AuthLayout,
    children: [
      { path: '/login', Component: Login },
      { path: '/signup', Component: Signup },
      { path: '/forgot-password', Component: ForgotPassword },
    ],
  },

  // Role-specific dashboards (protected, no shared layout)
  {
    path: '/dashboard/user',
    element: (
      <ProtectedRoute allowedRole="user">
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/volunteer',
    element: (
      <ProtectedRoute allowedRole="volunteer">
        <VolunteerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/admin',
    element: (
      <ProtectedRoute allowedRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  // Legacy redirect
  { path: '/dashboard', element: <Navigate to="/dashboard/user" replace /> },

  // Main public layout
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'donations', Component: Donations },
      { path: 'donations/:id', Component: DonationDetails },
      { path: 'add-donation', Component: AddDonation },
      { path: 'volunteer', Component: Volunteer },
      { path: 'requests', Component: Requests },
      { path: '*', Component: NotFound },
    ],
  },
]);
