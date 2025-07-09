import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { completeOnboarding, setCurrentStep, setTotalSteps } from '../../redux/slices/onboardingSlice';
import { showSuccess } from '../../redux/slices/notificationSlice';
import { FiShoppingBag, FiHeart, FiDollarSign, FiClock, FiEye, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { MdOutlineGavel, MdTrendingUp } from 'react-icons/md';
import { RiAuctionFill } from 'react-icons/ri';
import { BsCheckCircle } from 'react-icons/bs';

const BuyerOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentStep, isLoading } = useSelector((state) => state.onboarding);
  
  const [activeStep, setActiveStep] = useState(0);
  const totalSteps = 4;

  useEffect(() => {
    dispatch(setTotalSteps(totalSteps));
    dispatch(setCurrentStep(0));
  }, [dispatch]);

  const steps = [
    {
      title: "Welcome to Antique Auctions!",
      icon: <FiShoppingBag size={48} className="text-primary" />,
      content: (
        <div className="text-center">
          <Title level={3} className="mb-4">Welcome, {user?.name}! 🎉</Title>
          <Body className="text-gray-600 mb-6 max-w-2xl mx-auto">
            You're now part of the world's premier antique auction platform. As a buyer, you'll have access to 
            thousands of unique antique items from verified sellers and expert-appraised collections.
          </Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <RiAuctionFill size={32} className="text-blue-500 mx-auto mb-3" />
              <Title level={5} className="text-blue-800 mb-2">Live Auctions</Title>
              <Caption className="text-blue-600">Participate in real-time bidding</Caption>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <BsCheckCircle size={32} className="text-green-500 mx-auto mb-3" />
              <Title level={5} className="text-green-800 mb-2">Verified Items</Title>
              <Caption className="text-green-600">Expert-authenticated antiques</Caption>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <FiHeart size={32} className="text-purple-500 mx-auto mb-3" />
              <Title level={5} className="text-purple-800 mb-2">Watchlists</Title>
              <Caption className="text-purple-600">Track your favorite items</Caption>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How to Browse & Search",
      icon: <FiEye size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Discover Amazing Antiques</Title>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Title level={4} className="mb-4 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                Browse Categories
              </Title>
              <Body className="text-gray-600 mb-4">
                Explore our curated categories including furniture, jewelry, art, ceramics, and more. 
                Each category is organized by era and style.
              </Body>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Caption className="font-medium">Popular Categories:</Caption>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Victorian Furniture', 'Art Deco', 'Chinese Porcelain', 'Vintage Jewelry'].map((cat) => (
                    <span key={cat} className="bg-primary text-white px-3 py-1 rounded-full text-sm">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Title level={4} className="mb-4 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Use Advanced Search
              </Title>
              <Body className="text-gray-600 mb-4">
                Filter by price range, auction end date, location, condition, and authenticity status 
                to find exactly what you're looking for.
              </Body>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Caption className="font-medium">Search Tips:</Caption>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Use specific keywords (e.g., "Ming Dynasty vase")</li>
                  <li>• Set price alerts for your budget</li>
                  <li>• Filter by auction ending soon</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Bidding Like a Pro",
      icon: <MdOutlineGavel size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Master the Art of Bidding</Title>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <Title level={4} className="mb-4 flex items-center gap-2">
                <MdTrendingUp className="text-blue-500" />
                Bidding Strategies
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Caption className="font-medium text-blue-700">Early Bidding</Caption>
                  <Body className="text-sm text-gray-600 mt-1">
                    Place early bids to show interest and gauge competition
                  </Body>
                </div>
                <div>
                  <Caption className="font-medium text-blue-700">Last-Minute Bidding</Caption>
                  <Body className="text-sm text-gray-600 mt-1">
                    Strategic bidding in final moments to secure wins
                  </Body>
                </div>
                <div>
                  <Caption className="font-medium text-blue-700">Proxy Bidding</Caption>
                  <Body className="text-sm text-gray-600 mt-1">
                    Set maximum bid and let the system bid for you
                  </Body>
                </div>
                <div>
                  <Caption className="font-medium text-blue-700">Research First</Caption>
                  <Body className="text-sm text-gray-600 mt-1">
                    Check item history, condition reports, and market value
                  </Body>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <FiClock className="text-yellow-600 mt-1" />
                <div>
                  <Caption className="font-medium text-yellow-800">Auction Timing</Caption>
                  <Body className="text-sm text-yellow-700 mt-1">
                    Most auctions end at specific times. Set reminders and be online during final minutes 
                    for competitive items. Our mobile app sends push notifications for ending auctions.
                  </Body>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <FiDollarSign className="text-green-600 mt-1" />
                <div>
                  <Caption className="font-medium text-green-800">Budget Management</Caption>
                  <Body className="text-sm text-green-700 mt-1">
                    Set a maximum budget before bidding and stick to it. Remember to factor in 
                    buyer's premium (typically 10-25%) and shipping costs.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Buyer Dashboard",
      icon: <FiShoppingBag size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Your Command Center</Title>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white border-2 border-primary rounded-lg p-4">
                <Title level={5} className="mb-3 flex items-center gap-2">
                  <MdOutlineGavel className="text-primary" />
                  My Bids
                </Title>
                <Body className="text-sm text-gray-600 mb-3">
                  Track all your active bids, won items, and bidding history in one place.
                </Body>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Active: 3</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Won: 12</span>
                </div>
              </div>

              <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                <Title level={5} className="mb-3 flex items-center gap-2">
                  <FiHeart className="text-purple-500" />
                  Watchlist
                </Title>
                <Body className="text-sm text-gray-600 mb-3">
                  Save items you're interested in and get notified when similar items are listed.
                </Body>
                <Caption className="text-purple-600">💡 Tip: Add items to watchlist to track price trends</Caption>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                <Title level={5} className="mb-3 flex items-center gap-2">
                  <BsCheckCircle className="text-green-500" />
                  Won Items
                </Title>
                <Body className="text-sm text-gray-600 mb-3">
                  Manage your successful purchases, track shipping, and leave feedback.
                </Body>
                <Caption className="text-green-600">📦 Payment and shipping details available here</Caption>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4">
                <Title level={5} className="mb-3">Quick Actions</Title>
                <div className="space-y-2">
                  <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors text-sm">
                    Browse Live Auctions
                  </button>
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm">
                    View My Bids
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      dispatch(setCurrentStep(nextStep));
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      dispatch(setCurrentStep(prevStep));
    }
  };

  const handleComplete = async () => {
    try {
      await dispatch(completeOnboarding({
        role: 'buyer',
        completedAt: new Date().toISOString(),
        stepsCompleted: totalSteps
      })).unwrap();
      
      dispatch(showSuccess('Welcome to Antique Auctions! Your onboarding is complete.'));
      navigate('/dashboard', { replace: true });
    } catch (error) {
    }
  };

  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="text-primary mb-2">Buyer Onboarding</Title>
          <Body className="text-gray-600">Let's get you started with buying amazing antiques!</Body>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= activeStep 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < activeStep ? <FiCheck /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    index < activeStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <Caption className="text-gray-500">
              Step {activeStep + 1} of {totalSteps}: {steps[activeStep].title}
            </Caption>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              {steps[activeStep].icon}
            </div>
            {steps[activeStep].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={handlePrevious}
              disabled={activeStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                activeStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FiArrowLeft />
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip Onboarding
            </button>

            {activeStep === totalSteps - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <FiCheck />
                {isLoading ? 'Completing...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Next
                <FiArrowRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOnboarding;
