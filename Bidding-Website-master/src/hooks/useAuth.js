import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { checkAuthStatus, refreshUserData } from '../redux/slices/authSlice';
import { User1 } from '../utils/userAvatars';

/**
 * Custom hook for authentication state management
 * Provides user data, authentication status, and helper functions
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

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
