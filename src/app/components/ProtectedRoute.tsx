import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '../context/AuthContext';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
