import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AdminRedirectGuard - Automatically redirects admin users from user dashboard URLs to admin pages
 * This component ensures admins never see the regular user dashboard interface
 */
const AdminRedirectGuard = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Define mapping of user dashboard URLs to admin equivalents
  const adminRedirectMap = {
    '/dashboard': '/admin/dashboard',
    '/product': '/admin/products',
    '/userlist': '/admin/users',
    '/winning-products': '/admin/dashboard', // Redirect to admin dashboard for won items
    '/add-product': '/admin/products',
    '/product/update': '/admin/products',
    '/categories': '/admin/categories',
    '/income': '/admin/income',
    '/transportation': '/admin/transportation'
  };

  useEffect(() => {
    // Only redirect if user is authenticated and is an admin
    if (isAuthenticated && user?.role === 'admin') {
      const currentPath = location.pathname;
      
      // Check if current path should be redirected for admin users
      const redirectPath = adminRedirectMap[currentPath];
      
      if (redirectPath) {
        console.log(`AdminRedirectGuard: Redirecting admin from ${currentPath} to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
        return;
      }

      // Handle dynamic routes (like /product/update/:id)
      for (const [userPath, adminPath] of Object.entries(adminRedirectMap)) {
        if (currentPath.startsWith(userPath + '/')) {
          const dynamicPart = currentPath.substring(userPath.length);
          const newPath = adminPath + dynamicPart;
          console.log(`AdminRedirectGuard: Redirecting admin from ${currentPath} to ${newPath}`);
          navigate(newPath, { replace: true });
          return;
        }
      }

      // Special case: if admin is on any user dashboard route, redirect to admin dashboard
      const userDashboardRoutes = [
        '/my-bids',
        '/sales-history',
        '/balance',
        '/profile'
      ];

      if (userDashboardRoutes.some(route => currentPath.startsWith(route))) {
        console.log(`AdminRedirectGuard: Redirecting admin from user route ${currentPath} to admin dashboard`);
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return children;
};

export default AdminRedirectGuard;
