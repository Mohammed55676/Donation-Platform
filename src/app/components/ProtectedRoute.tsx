import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '../context/AuthContext';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole | UserRole[];
  allowedUserType?: string | string[];
}

export function ProtectedRoute({ children, allowedRole, allowedUserType }: ProtectedRouteProps) {
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

  const isRoleAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(user!.role)
    : allowedRole ? user?.role === allowedRole : true;

  // Users without a user_type (e.g. volunteers) always pass the user_type check
  const isUserTypeAllowed = allowedUserType
    ? !user?.user_type ||
      (Array.isArray(allowedUserType)
        ? allowedUserType.includes(user!.user_type!)
        : user?.user_type === allowedUserType)
    : true;

  if (!isRoleAllowed || !isUserTypeAllowed) {
    if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user?.user_type === 'charity') return <Navigate to="/dashboard/charity" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
