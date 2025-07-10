import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../../redux/slices/authSlice';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  // Check auth status on mount and when location changes
  useEffect(() => {
    // Only check auth status if we don't have user data or if not authenticated
    if (!isAuthenticated || !user) {
      console.log('AdminRoute: Checking auth status due to missing authentication');
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isAuthenticated, user, location.pathname]);

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
    const isValid = isAuthenticated && user && user.role === 'admin';
    console.log('AdminRoute check:', {
      isAuthenticated,
      userRole: user?.role,
      isValid,
      currentPath: location.pathname
    });
    return isValid;
  };

  // If not authenticated or not admin, redirect to admin login
  if (!isAdminAuthenticated()) {
    console.log('Admin authentication failed, redirecting to admin login');
    // Preserve the attempted URL for redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
