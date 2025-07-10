import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkOnboardingStatus } from '../../redux/slices/onboardingSlice';

const OnboardingCheck = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isOnboardingCompleted, isLoading } = useSelector((state) => state.onboarding);

  // Routes that should skip onboarding check
  const skipOnboardingRoutes = [
    '/login',
    '/register',
    '/onboarding',
    '/onboarding/buyer',
    '/onboarding/seller',
    '/onboarding/expert',
    '/about',
    '/contact',
    '/',
    '/details',
    '/admin' // Skip onboarding for all admin routes
  ];

  useEffect(() => {
    // Only check onboarding for authenticated users
    if (isAuthenticated && user) {
      dispatch(checkOnboardingStatus());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Skip onboarding check for certain routes
    const shouldSkipCheck = skipOnboardingRoutes.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );

    if (shouldSkipCheck) {
      return;
    }

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    // Skip onboarding for admin users
    if (isAuthenticated && user && !isLoading && !isOnboardingCompleted && user.role !== 'admin') {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, isOnboardingCompleted, isLoading, location.pathname, navigate]);

  return children;
};

export default OnboardingCheck;
