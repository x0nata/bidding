import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = null, 
  allowedRoles = null,
  fallbackPath = "/dashboard",
  showUnauthorized = true 
}) => {
  const { isAuthenticated, user, isLoading } = useSelector((state: any) => state.auth);
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user role is in allowed roles list
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);

  // Check if user is authenticated and has admin role
  const isAdminAuthenticated = () => {
    return isAuthenticated && user && user.role === 'admin';
  };

  return isAdminAuthenticated() ? <>{children}</> : <Navigate to="/admin/login" replace />;
};
