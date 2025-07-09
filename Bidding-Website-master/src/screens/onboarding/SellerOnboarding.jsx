import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { completeOnboarding, setCurrentStep, setTotalSteps } from '../../redux/slices/onboardingSlice';
import { showSuccess } from '../../redux/slices/notificationSlice';
import { FiPlus, FiDollarSign, FiCamera, FiCalendar, FiArrowRight, FiArrowLeft, FiCheck, FiPackage } from 'react-icons/fi';
import { MdOutlineInventory, MdAnalytics, MdVerified } from 'react-icons/md';
import { RiAuctionFill } from 'react-icons/ri';
import { HiOutlineChartBar } from 'react-icons/hi';

const SellerOnboarding = () => {
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
      title: "Welcome to Selling!",
      icon: <FiPackage size={48} className="text-primary" />,
      content: (
        <div className="text-center">
          <Title level={3} className="mb-4">Welcome, {user?.name}! 🏪</Title>
          <Body className="text-gray-600 mb-6 max-w-2xl mx-auto">
            You're now ready to start selling your antique treasures to collectors across Ethiopia.
            Our platform connects you with serious Ethiopian buyers and provides all the tools you need for successful auctions.
          </Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <FiDollarSign size={32} className="text-green-500 mx-auto mb-3" />
              <Title level={5} className="text-green-800 mb-2">Maximize Revenue in Ethiopia</Title>
              <Caption className="text-green-600">Competitive auction format</Caption>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <MdVerified size={32} className="text-blue-500 mx-auto mb-3" />
              <Title level={5} className="text-blue-800 mb-2">Expert Support</Title>
              <Caption className="text-blue-600">Professional appraisal services</Caption>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <HiOutlineChartBar size={32} className="text-purple-500 mx-auto mb-3" />
              <Title level={5} className="text-purple-800 mb-2">Analytics</Title>
              <Caption className="text-purple-600">Track performance & trends</Caption>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Creating Your First Listing",
      icon: <FiPlus size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">List Your Antiques Like a Pro</Title>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                  High-Quality Photos
                </Title>
                <Body className="text-gray-600 mb-4">
                  Great photos are crucial for successful auctions. Take multiple angles, close-ups of details, 
                  and any maker's marks or signatures.
                </Body>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Caption className="font-medium text-blue-700">Photo Tips:</Caption>
                  <ul className="mt-2 text-sm text-blue-600 space-y-1">
                    <li>• Use natural lighting when possible</li>
                    <li>• Include scale references (coins, rulers)</li>
                    <li>• Show any damage or wear honestly</li>
                    <li>• Capture maker's marks and signatures</li>
                  </ul>
                </div>
              </div>
              <div>
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                  Detailed Descriptions
                </Title>
                <Body className="text-gray-600 mb-4">
                  Provide comprehensive information about your item's history, condition, provenance, 
                  and any interesting stories.
                </Body>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Caption className="font-medium text-green-700">Include:</Caption>
                  <ul className="mt-2 text-sm text-green-600 space-y-1">
                    <li>• Age and period (if known)</li>
                    <li>• Materials and construction</li>
                    <li>• Condition assessment</li>
                    <li>• Provenance or history</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
              <Title level={4} className="mb-4 flex items-center gap-2">
                <FiCamera className="text-orange-500" />
                Professional Photography Service
              </Title>
              <Body className="text-gray-600 mb-4">
                For high-value items ($500+), consider our professional photography service. 
                Our photographers specialize in antiques and can significantly increase your final sale price.
              </Body>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                Learn More About Photo Service
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Setting Auction Parameters",
      icon: <RiAuctionFill size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Optimize Your Auction Settings</Title>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <FiDollarSign className="text-blue-500" />
                  Starting Bid Strategy
                </Title>
                <Body className="text-gray-600 mb-4">
                  Set your starting bid strategically to attract bidders while protecting your investment.
                </Body>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <Caption className="font-medium text-blue-700">Low Start (Recommended)</Caption>
                    <Body className="text-sm text-blue-600 mt-1">
                      Attracts more bidders, creates excitement, often leads to higher final prices
                    </Body>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <Caption className="font-medium text-gray-700">Reserve Price</Caption>
                    <Body className="text-sm text-gray-600 mt-1">
                      Set a hidden minimum price to protect valuable items
                    </Body>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-green-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <FiCalendar className="text-green-500" />
                  Auction Duration
                </Title>
                <Body className="text-gray-600 mb-4">
                  Choose the optimal auction length based on your item's appeal and market demand.
                </Body>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">3 Days</span>
                    <span className="text-xs text-green-600">Quick turnover</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded">
                    <span className="text-sm font-medium">7 Days</span>
                    <span className="text-xs text-green-700">Most popular</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">10 Days</span>
                    <span className="text-xs text-green-600">Maximum exposure</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
                <Title level={4} className="mb-4">Timing Your Auction</Title>
                <Body className="text-gray-600 mb-4">
                  When your auction ends can significantly impact the final price.
                </Body>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <Caption className="font-medium text-purple-700">Best Ending Times:</Caption>
                    <ul className="mt-2 text-sm text-purple-600 space-y-1">
                      <li>• Sunday evenings (7-9 PM)</li>
                      <li>• Weekday evenings (6-8 PM)</li>
                      <li>• Avoid major holidays</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <Caption className="font-medium text-yellow-700">💡 Pro Tip:</Caption>
                    <Body className="text-sm text-yellow-600 mt-1">
                      Consider your target audience's time zone. International items may benefit from different timing.
                    </Body>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-orange-300 rounded-lg p-6">
                <Title level={4} className="mb-4">Shipping & Handling</Title>
                <Body className="text-gray-600 mb-4">
                  Clear shipping policies build buyer confidence and reduce disputes.
                </Body>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Calculate accurate shipping costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Offer insurance for valuable items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Specify handling time clearly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Seller Dashboard",
      icon: <MdAnalytics size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Manage Your Selling Business</Title>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white border-2 border-primary rounded-lg p-4">
                <Title level={5} className="mb-3 flex items-center gap-2">
                  <MdOutlineInventory className="text-primary" />
                  My Listings
                </Title>
                <Body className="text-sm text-gray-600 mb-3">
                  Manage all your active and completed auctions. Edit descriptions, add photos, 
                  and track bidding activity.
                </Body>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Active: 5</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Sold: 23</span>
                </div>
              </div>

              <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                <Title level={5} className="mb-3 flex items-center gap-2">
                  <HiOutlineChartBar className="text-green-500" />
                  Sales Analytics
                </Title>
                <Body className="text-sm text-gray-600 mb-3">
                  Track your performance with detailed analytics including revenue trends, 
                  category performance, and buyer demographics.
                </Body>
                <Caption className="text-green-600">📊 View monthly and yearly reports</Caption>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                <Title level={5} className="mb-3 flex items-center gap-2">
                  <MdVerified className="text-purple-500" />
                  Expert Services
                </Title>
                <Body className="text-sm text-gray-600 mb-3">
                  Get professional appraisals, authentication, and condition reports 
                  to increase buyer confidence and final sale prices.
                </Body>
                <Caption className="text-purple-600">🔍 Request appraisal for items over $200</Caption>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4">
                <Title level={5} className="mb-3">Quick Actions</Title>
                <div className="space-y-2">
                  <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors text-sm">
                    Create New Listing
                  </button>
                  <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors text-sm">
                    View Sales History
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <Title level={4} className="mb-4 text-white">🎯 Success Tips for New Sellers</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Caption className="font-medium text-blue-100">Build Your Reputation:</Caption>
                <ul className="mt-2 space-y-1 text-blue-50">
                  <li>• Start with lower-value items</li>
                  <li>• Provide excellent customer service</li>
                  <li>• Ship quickly and securely</li>
                </ul>
              </div>
              <div>
                <Caption className="font-medium text-blue-100">Maximize Sales:</Caption>
                <ul className="mt-2 space-y-1 text-blue-50">
                  <li>• Research similar sold items</li>
                  <li>• Use all available photo slots</li>
                  <li>• Respond to questions promptly</li>
                </ul>
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
        role: 'seller',
        completedAt: new Date().toISOString(),
        stepsCompleted: totalSteps
      })).unwrap();
      
      dispatch(showSuccess('Welcome to selling on Antique Auctions! Your onboarding is complete.'));
      navigate('/dashboard', { replace: true });
    } catch (error) {
    }
  };

  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="text-primary mb-2">Seller Onboarding</Title>
          <Body className="text-gray-600">Learn how to successfully sell your antiques!</Body>
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
                {isLoading ? 'Completing...' : 'Start Selling'}
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

export default SellerOnboarding;
