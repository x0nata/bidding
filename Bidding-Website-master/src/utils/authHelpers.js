// Common authentication and authorization utilities

import { useSelector } from 'react-redux';

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Permission constants
export const PERMISSIONS = {
  CREATE_AUCTION: 'create_auction',
  MANAGE_USERS: 'manage_users',
  MANAGE_AUCTIONS: 'manage_auctions',
  PLACE_BIDS: 'place_bids',
  VIEW_ANALYTICS: 'view_analytics'
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.CREATE_AUCTION,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_AUCTIONS,
    PERMISSIONS.PLACE_BIDS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.CREATE_AUCTION,
    PERMISSIONS.PLACE_BIDS
  ]
};

// Authentication status checks
export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isUser: user?.role === USER_ROLES.USER || user?.role === USER_ROLES.ADMIN,
    userRole: user?.role
  };
};

// Permission checking functions
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Role checking functions
export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN;
};

export const isUser = (user) => {
  return user?.role === USER_ROLES.USER || user?.role === USER_ROLES.ADMIN;
};

// Authentication guards for components
export const requireAuth = (user, redirectTo = '/login') => {
  if (!user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

export const requireRole = (user, requiredRole, redirectTo = '/unauthorized') => {
  if (!user || user.role !== requiredRole) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

export const requirePermission = (user, permission, redirectTo = '/unauthorized') => {
  if (!user || !hasPermission(user.role, permission)) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

// Higher-order component for role-based access
export const withRoleAccess = (Component, requiredRole) => {
  return (props) => {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    if (requiredRole && user?.role !== requiredRole && user?.role !== USER_ROLES.ADMIN) {
      return <div>You don't have permission to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
};

// Higher-order component for permission-based access
export const withPermissionAccess = (Component, requiredPermission) => {
  return (props) => {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
      return <div>You don't have permission to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
};

// Utility functions for UI conditional rendering
export const canCreateAuction = (user) => {
  return hasPermission(user?.role, PERMISSIONS.CREATE_AUCTION);
};

export const canManageUsers = (user) => {
  return hasPermission(user?.role, PERMISSIONS.MANAGE_USERS);
};

export const canManageAuctions = (user) => {
  return hasPermission(user?.role, PERMISSIONS.MANAGE_AUCTIONS);
};

export const canPlaceBids = (user) => {
  return hasPermission(user?.role, PERMISSIONS.PLACE_BIDS);
};

export const canViewAnalytics = (user) => {
  return hasPermission(user?.role, PERMISSIONS.VIEW_ANALYTICS);
};

export const canVerifyCertificates = (user) => {
  return hasPermission(user?.role, PERMISSIONS.VERIFY_CERTIFICATES);
};

// Session management utilities
export const getSessionInfo = () => {
  const sessionData = localStorage.getItem('sessionInfo');
  return sessionData ? JSON.parse(sessionData) : null;
};

export const setSessionInfo = (info) => {
  localStorage.setItem('sessionInfo', JSON.stringify(info));
};

export const clearSessionInfo = () => {
  localStorage.removeItem('sessionInfo');
};

// Token management utilities
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// User preference utilities
export const getUserPreferences = () => {
  const prefs = localStorage.getItem('userPreferences');
  return prefs ? JSON.parse(prefs) : {};
};

export const setUserPreferences = (preferences) => {
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
};

export const updateUserPreference = (key, value) => {
  const prefs = getUserPreferences();
  prefs[key] = value;
  setUserPreferences(prefs);
};

// Navigation helpers based on user role
export const getDefaultRoute = (user) => {
  if (!user) return '/';

  switch (user.role) {
    case USER_ROLES.ADMIN:
      return '/dashboard';
    case USER_ROLES.USER:
      return '/dashboard';
    default:
      return '/';
  }
};

export const getMenuItems = (user) => {
  if (!user) return [];
  
  const baseItems = [
    { label: 'Home', path: '/', permission: null },
    { label: 'Browse Auctions', path: '/auctions', permission: null }
  ];
  
  const roleBasedItems = [];
  
  if (canCreateAuction(user)) {
    roleBasedItems.push({ label: 'Create Listing', path: '/create-listing', permission: PERMISSIONS.CREATE_AUCTION });
  }
  
  if (canPlaceBids(user)) {
    roleBasedItems.push(
      { label: 'My Bids', path: '/my-bids', permission: PERMISSIONS.PLACE_BIDS },
      { label: 'Watchlist', path: '/watchlist', permission: PERMISSIONS.PLACE_BIDS }
    );
  }
  
  if (canManageUsers(user) || canManageAuctions(user)) {
    roleBasedItems.push({ label: 'Admin Panel', path: '/admin', permission: PERMISSIONS.MANAGE_USERS });
  }
  
  return [...baseItems, ...roleBasedItems];
};

// Validation helpers
export const validateUserAccess = (user, resource, action) => {
  // Custom validation logic for specific resources and actions
  if (!user) return false;
  
  // Example: Only auction owners or admins can edit auctions
  if (resource === 'auction' && action === 'edit') {
    return user.role === USER_ROLES.ADMIN || resource.ownerId === user.id;
  }
  
  // Example: Only bid owners or admins can view bid details
  if (resource === 'bid' && action === 'view') {
    return user.role === USER_ROLES.ADMIN || resource.bidderId === user.id;
  }
  
  return true;
};
