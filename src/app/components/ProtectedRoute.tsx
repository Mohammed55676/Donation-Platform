import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to the appropriate dashboard for their actual role
    const roleRoutes: Record<UserRole, string> = {
      user: '/dashboard/user',
      volunteer: '/dashboard/volunteer',
      admin: '/dashboard/admin',
    };
    return <Navigate to={roleRoutes[user!.role]} replace />;
  }

  return <>{children}</>;
}
