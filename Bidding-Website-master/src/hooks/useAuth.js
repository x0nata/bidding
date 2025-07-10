import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { checkAuthStatus, refreshUserData } from '../redux/slices/authSlice';
import { User1 } from '../utils/userAvatars';

// Global flag to prevent multiple simultaneous auth checks
let globalAuthCheckInProgress = false;
let globalAuthCheckDone = false;

/**
 * Custom hook for authentication state management
 * Provides user data, authentication status, and helper functions
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const hasCheckedAuth = useRef(false);

  // Check authentication status only if not already done globally
  useEffect(() => {
    // Only check auth if:
    // 1. We haven't checked in this component instance
    // 2. No global auth check is in progress
    // 3. Global auth check hasn't been completed yet
    // 4. We have a token but no user data
    const token = localStorage.getItem('token');
    const shouldCheckAuth = !hasCheckedAuth.current &&
                           !globalAuthCheckInProgress &&
                           !globalAuthCheckDone &&
                           token &&
                           !isAuthenticated;

    if (shouldCheckAuth) {
      globalAuthCheckInProgress = true;
      hasCheckedAuth.current = true;

      dispatch(checkAuthStatus()).finally(() => {
        globalAuthCheckInProgress = false;
        globalAuthCheckDone = true;
      });
    } else if (isAuthenticated || !token) {
      // Mark as checked if we're already authenticated or have no token
      hasCheckedAuth.current = true;
      globalAuthCheckDone = true;
    }
  }, [dispatch, isAuthenticated]);

  // Get user display data with comprehensive fallbacks
  const getUserDisplayData = () => {
    if (!user) {
      return {
        name: "Guest User",
        email: "guest@example.com",
        photo: User1,
        role: "user",
        isAuthenticated: false
      };
    }

    return {
      name: user.name || "User",
      email: user.email || "user@example.com",
      photo: user.photo || user.avatar || user.profileImage || User1,
      role: user.role || "user",
      contactNumber: user.contactNumber || user.phone || "",
      address: user.address || "",
      createdAt: user.createdAt,
      isAuthenticated: true
    };
  };

  // Role checking functions
  const isAdmin = () => user?.role === "admin";
  const isUser = () => user?.role === "user" || user?.role === "admin";

  // Refresh user data function
  const refreshUser = () => {
    if (isAuthenticated) {
      dispatch(refreshUserData());
    }
  };

  // Get role display name
  const getRoleDisplayName = (role = user?.role) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "user":
        return "User";
      default:
        return "User";
    }
  };

  // Get role badge styling
  const getRoleBadgeClass = (role = user?.role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "user":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return {
    // Core auth state
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // User display data
    userDisplayData: getUserDisplayData(),
    
    // Role checking functions
    isAdmin: isAdmin(),
    isUser: isUser(),
    
    // Helper functions
    refreshUser,
    getRoleDisplayName,
    getRoleBadgeClass,
    
    // Role checking functions (callable)
    checkIsAdmin: isAdmin,
    checkIsUser: isUser
  };
};

export default useAuth;
