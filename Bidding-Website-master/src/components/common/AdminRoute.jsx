import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  const isAdminAuthenticated = () => {
    console.log('AdminRoute check:', { isAuthenticated, user: user?.role });
    return isAuthenticated && user && user.role === 'admin';
  };

  if (!isAdminAuthenticated()) {
    console.log('Admin authentication failed, redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
