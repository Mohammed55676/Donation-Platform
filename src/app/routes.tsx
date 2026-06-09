import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Donations } from './pages/Donations';
import { DonationDetails } from './pages/DonationDetails';
import { AddDonation } from './pages/AddDonation';
import { Volunteer } from './pages/Volunteer';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Locations } from './pages/Locations';
import { NotFound } from './pages/NotFound';

// Auth
import { AuthLayout } from './pages/auth/AuthLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyOtp } from './pages/auth/VerifyOtp';

import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

// Community
import { Feed } from './pages/community/Feed';
import { CreatePostPage } from './pages/community/Create';
import { Details } from './pages/community/Details';

// Chat
import { Messages } from './pages/messages/Messages';
import { ConversationChat } from './pages/messages/ConversationChat';

// Charity system
import { CharityDashboard } from './pages/CharityDashboard';

import { Notifications } from './pages/Notifications';

// Demo Payment
import { PaymentSuccess } from './pages/PaymentSuccess';

export const router = createBrowserRouter([
  // Auth pages (no navbar/footer)
  {
    Component: AuthLayout,
    children: [
      { path: '/login', Component: Login },
      { path: '/signup', Component: Signup },
      { path: '/forgot-password', Component: ForgotPassword },
      { path: '/reset-password', Component: ResetPassword },
      { path: '/verify-otp', Component: VerifyOtp },
    ],
  },

  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRole={['user']} allowedUserType={['donor']}>
        <Dashboard />
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
  {
    path: '/dashboard/charity',
    element: (
      <ProtectedRoute allowedRole="user" allowedUserType="charity">
        <CharityDashboard />
      </ProtectedRoute>
    ),
  },

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
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'locations', Component: Locations },
      { path: 'community', element: <ProtectedRoute><Feed /></ProtectedRoute> },
      { path: 'community/create', element: <ProtectedRoute><CreatePostPage /></ProtectedRoute> },
      { path: 'community/:postId', element: <ProtectedRoute><Details /></ProtectedRoute> },
      { path: 'messages', element: <ProtectedRoute><Messages /></ProtectedRoute> },
      { path: 'messages/:conversationId', element: <ProtectedRoute><ConversationChat /></ProtectedRoute> },
      { path: 'notifications', element: <ProtectedRoute><Notifications /></ProtectedRoute> },
      { path: 'payment-success', Component: PaymentSuccess },
      { path: '*', Component: NotFound },
    ],
  },
]);
