import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkOnboardingStatus } from '../../redux/slices/onboardingSlice';
import BuyerOnboarding from './BuyerOnboarding';
import SellerOnboarding from './SellerOnboarding';
import { Title, Body } from '../../components/common/Design';

const OnboardingRouter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isOnboardingCompleted, isLoading } = useSelector((state) => state.onboarding);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }

    // Check onboarding status
    dispatch(checkOnboardingStatus());
  }, [dispatch, isAuthenticated, user, navigate]);

  useEffect(() => {
    // If onboarding is already completed, redirect to dashboard
    if (isOnboardingCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [isOnboardingCompleted, navigate]);

  // Show loading while checking status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Title level={4} className="mb-2">Setting up your experience...</Title>
          <Body className="text-gray-600">Please wait while we prepare your onboarding.</Body>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // If onboarding is completed, don't render anything (will redirect)
  if (isOnboardingCompleted) {
    return null;
  }

  // For unified user role, show combined onboarding
  // Since all users can buy and sell, we'll show a unified onboarding experience
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white max-w-4xl mx-auto p-8 m-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <Title level={3} className="text-gray-800 mb-4">Welcome to Antique Auction System</Title>
          <Body className="text-gray-600">
            Complete your profile setup to start buying and selling antiques
          </Body>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <Title level={4} className="text-gray-800 mb-4">Buying Features</Title>
            <BuyerOnboarding />
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <Title level={4} className="text-gray-800 mb-4">Selling Features</Title>
            <SellerOnboarding />
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="text-white bg-green font-medium rounded-full text-lg px-16 py-3 hover:bg-primary transition ease-in-out"
          >
            Complete Setup & Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingRouter;
