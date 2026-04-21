import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(user!.role)
    : allowedRole ? user?.role === allowedRole : true;

  if (!isAllowed) {
    // Redirect to the appropriate dashboard for their actual role
    const roleRoutes: Record<UserRole, string> = {
      user: '/dashboard',
      admin: '/dashboard/admin',
      volunteer: '/dashboard',
    };
    return <Navigate to={roleRoutes[user!.role]} replace />;
  }

  return <>{children}</>;
}
