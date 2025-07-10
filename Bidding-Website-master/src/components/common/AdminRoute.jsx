import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../../redux/slices/authSlice';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const authCheckInProgress = useRef(false);

  // Check auth status on mount and when location changes
  useEffect(() => {
    // Only check auth status if we don't have user data or if not authenticated
    // Use specific user properties to avoid infinite loops from user object changes
    const userRole = user?.role;
    const userId = user?._id;

    if ((!isAuthenticated || !user || !userRole) && !authCheckInProgress.current && !isLoading) {
      console.log('AdminRoute: Checking auth status due to missing authentication');
      console.log('AdminRoute: Current state before check:', { isAuthenticated, userRole, userId });
      authCheckInProgress.current = true;
      dispatch(checkAuthStatus()).finally(() => {
        authCheckInProgress.current = false;
      });
    } else {
      console.log('AdminRoute: Auth status OK, user role:', userRole);
    }
  }, [dispatch, isAuthenticated, user?.role, user?._id, location.pathname, isLoading]);

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
