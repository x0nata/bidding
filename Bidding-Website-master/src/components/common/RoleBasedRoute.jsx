import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Title, Body } from './Design';

const RoleBasedRoute = ({
  children,
  allowedRoles = [],
  requiredRole = null,
  fallbackPath = "/dashboard",
  showUnauthorized = true
}) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
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

  const userRole = user?.role;

  // Check if user has required role
  const hasRequiredRole = () => {
    if (requiredRole) {
      return userRole === requiredRole || userRole === "admin";
    }
    
    if (allowedRoles.length > 0) {
      return allowedRoles.includes(userRole) || userRole === "admin";
    }
    
    return true; // No role restrictions
  };

  // If user doesn't have required role
  if (!hasRequiredRole()) {
    if (showUnauthorized) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.38 0 2.5-1.12 2.5-2.5 0-.394-.094-.77-.26-1.106L13.64 6.394a2.5 2.5 0 00-4.28 0L3.86 15.394c-.166.336-.26.712-.26 1.106 0 1.38 1.12 2.5 2.5 2.5z" />
                </svg>
              </div>
              <Title level={2} className="text-red-600 mb-2">Access Denied</Title>
              <Body className="text-gray-600 mb-6">
                You don't have permission to access this page. 
                {requiredRole && ` This page requires ${requiredRole} role.`}
                {allowedRoles.length > 0 && ` This page is restricted to: ${allowedRoles.join(', ')}.`}
              </Body>
              <div className="space-y-2">
                <Body className="text-sm text-gray-500">Your current role: <span className="font-medium capitalize">{userRole}</span></Body>
                <Body className="text-sm text-gray-500">
                  Contact an administrator if you believe this is an error.
                </Body>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors mr-3"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                const redirectPath = userRole === 'admin' ? '/admin/dashboard' : fallbackPath;
                window.location.href = redirectPath;
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    } else {
      // Redirect admin users to admin dashboard, regular users to user dashboard
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' : fallbackPath;
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default RoleBasedRoute;
