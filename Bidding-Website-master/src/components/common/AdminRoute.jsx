import React, { useEffect, useRef, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus, selectAuthState } from '../../redux/slices/authSlice';

// Global coordination with useAuth hook
let globalAuthCheckInProgress = false;
let globalAuthCheckDone = false;

const AdminRoute = ({ children }) => {
  // Use stable selector to prevent unnecessary re-renders
  const authState = useSelector(selectAuthState);
  const dispatch = useDispatch();
  const location = useLocation();
  const authCheckInProgress = useRef(false);
  const initialCheckDone = useRef(false);

  // Memoize auth validation to prevent infinite loops
  const authValidation = useMemo(() => {
    const currentRole = authState.userRole;
    const currentId = authState.userId;
    const hasValidAuth = authState.isAuthenticated && authState.hasUser && !!currentRole;
    const isAdminAuthenticated = hasValidAuth && currentRole === 'admin';

    return {
      role: currentRole,
      id: currentId,
      hasValidAuth,
      isAdminAuthenticated
    };
  }, [authState.userRole, authState.userId, authState.isAuthenticated, authState.hasUser]);

  // Check auth status only if needed and not already in progress globally
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Only check auth if:
    // 1. We have a token but no valid auth
    // 2. No auth check is in progress (local or global)
    // 3. We haven't completed initial check
    // 4. Global auth check hasn't been done
    const shouldCheckAuth = token &&
                           !authValidation.hasValidAuth &&
                           !authCheckInProgress.current &&
                           !globalAuthCheckInProgress &&
                           !initialCheckDone.current &&
                           !globalAuthCheckDone;

    if (shouldCheckAuth) {
      console.log('AdminRoute: Performing auth check');
      authCheckInProgress.current = true;
      globalAuthCheckInProgress = true;

      dispatch(checkAuthStatus()).finally(() => {
        authCheckInProgress.current = false;
        globalAuthCheckInProgress = false;
        initialCheckDone.current = true;
        globalAuthCheckDone = true;
      });
    } else if (authValidation.hasValidAuth && !initialCheckDone.current) {
      console.log('AdminRoute: Auth status OK, user role:', authValidation.role);
      initialCheckDone.current = true;
      globalAuthCheckDone = true;
    } else if (!token) {
      // No token, mark as done to prevent further checks
      initialCheckDone.current = true;
    }
  }, [authValidation.hasValidAuth, authValidation.role, dispatch]);

  // Show loading while checking authentication
  if (authState.isLoading || authCheckInProgress.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or not admin, redirect to admin login
  if (!authValidation.isAdminAuthenticated) {
    console.log('Admin authentication failed, redirecting to admin login', {
      hasValidAuth: authValidation.hasValidAuth,
      userRole: authValidation.role,
      currentPath: location.pathname
    });
    // Preserve the attempted URL for redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log('AdminRoute: Rendering admin content for user role:', authValidation.role);
  return children;
};

export default AdminRoute;
