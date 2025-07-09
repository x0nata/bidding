import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { completeOnboarding, setCurrentStep, setTotalSteps, updateOnboardingData } from '../../redux/slices/onboardingSlice';
import { showSuccess } from '../../redux/slices/notificationSlice';
import { FiUpload, FiAward, FiUsers, FiArrowRight, FiArrowLeft, FiCheck, FiFileText } from 'react-icons/fi';
import { GiMagnifyingGlass, GiDiploma } from 'react-icons/gi';
import { MdVerified, MdAssignment } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';

const ExpertOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentStep, isLoading, onboardingData } = useSelector((state) => state.onboarding);
  
  const [activeStep, setActiveStep] = useState(0);
  const [expertiseAreas, setExpertiseAreas] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const totalSteps = 4;

  useEffect(() => {
    dispatch(setTotalSteps(totalSteps));
    dispatch(setCurrentStep(0));
  }, [dispatch]);

  const availableExpertiseAreas = [
    'Victorian Furniture', 'Art Deco', 'Chinese Porcelain', 'European Ceramics',
    'Vintage Jewelry', 'Antique Silver', 'Oil Paintings', 'Watercolors',
    'Sculpture', 'Textiles', 'Clocks & Watches', 'Scientific Instruments',
    'Books & Manuscripts', 'Maps & Prints', 'Coins & Currency', 'Stamps',
    'Toys & Games', 'Musical Instruments', 'Militaria', 'Tribal Art'
  ];

  const steps = [
    {
      title: "Welcome, Expert!",
      icon: <HiOutlineAcademicCap size={48} className="text-primary" />,
      content: (
        <div className="text-center">
          <Title level={3} className="mb-4">Welcome, {user?.name}! 🎓</Title>
          <Body className="text-gray-600 mb-6 max-w-2xl mx-auto">
            As a certified expert appraiser, you play a crucial role in our antique auction ecosystem. 
            Your expertise helps buyers and sellers make informed decisions about valuable antique items.
          </Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <GiMagnifyingGlass size={32} className="text-blue-500 mx-auto mb-3" />
              <Title level={5} className="text-blue-800 mb-2">Professional Appraisals</Title>
              <Caption className="text-blue-600">Provide expert valuations</Caption>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <MdVerified size={32} className="text-green-500 mx-auto mb-3" />
              <Title level={5} className="text-green-800 mb-2">Authentication</Title>
              <Caption className="text-green-600">Verify item authenticity</Caption>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <FiAward size={32} className="text-purple-500 mx-auto mb-3" />
              <Title level={5} className="text-purple-800 mb-2">Build Reputation</Title>
              <Caption className="text-purple-600">Earn recognition & fees</Caption>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Setup Your Expertise Profile",
      icon: <FiAward size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Define Your Areas of Expertise</Title>
          <div className="max-w-4xl mx-auto">
            <Body className="text-gray-600 mb-6 text-center">
              Select the categories where you have professional knowledge and experience. 
              You can add more areas later as your expertise grows.
            </Body>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <Title level={4} className="mb-4">Select Your Expertise Areas</Title>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableExpertiseAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      const newAreas = expertiseAreas.includes(area)
                        ? expertiseAreas.filter(a => a !== area)
                        : [...expertiseAreas, area];
                      setExpertiseAreas(newAreas);
                      dispatch(updateOnboardingData({ expertiseAreas: newAreas }));
                    }}
                    className={`p-3 rounded-lg text-sm transition-colors ${
                      expertiseAreas.includes(area)
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-300 hover:border-primary'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              <Caption className="text-blue-600 mt-4">
                Selected: {expertiseAreas.length} areas
              </Caption>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-green-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <FiUsers className="text-green-500" />
                  Experience Level
                </Title>
                <Body className="text-gray-600 mb-4">
                  Help buyers understand your level of expertise in the antique field.
                </Body>
                <div className="space-y-2">
                  {['Beginner (1-3 years)', 'Intermediate (4-10 years)', 'Advanced (11-20 years)', 'Master (20+ years)'].map((level) => (
                    <label key={level} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={level}
                        onChange={(e) => dispatch(updateOnboardingData({ experienceLevel: e.target.value }))}
                        className="text-primary"
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white border-2 border-purple-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <MdAssignment className="text-purple-500" />
                  Specialization
                </Title>
                <Body className="text-gray-600 mb-4">
                  What makes your expertise unique? This helps match you with relevant appraisal requests.
                </Body>
                <textarea
                  placeholder="e.g., 'Specialist in 18th-century French furniture with focus on provenance research and restoration assessment...'"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  onChange={(e) => dispatch(updateOnboardingData({ specialization: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Upload Certifications",
      icon: <GiDiploma size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Verify Your Credentials</Title>
          <div className="max-w-4xl mx-auto">
            <Body className="text-gray-600 mb-6 text-center">
              Upload your professional certifications, degrees, and credentials to build trust with clients. 
              All documents are securely stored and verified by our team.
            </Body>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <FiFileText className="text-blue-500" />
                  Professional Certifications
                </Title>
                <Body className="text-gray-600 mb-4">
                  Upload certificates from recognized appraisal organizations.
                </Body>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <FiUpload size={32} className="text-gray-400 mx-auto mb-2" />
                    <Caption className="text-gray-500">Click to upload or drag and drop</Caption>
                    <Caption className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</Caption>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Caption className="font-medium">Accepted certifications:</Caption>
                    <ul className="mt-1 space-y-1">
                      <li>• ASA (American Society of Appraisers)</li>
                      <li>• AAA (American Appraisers Association)</li>
                      <li>• ISA (International Society of Appraisers)</li>
                      <li>• University degrees in Art History, Archaeology, etc.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-green-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <HiOutlineAcademicCap className="text-green-500" />
                  Educational Background
                </Title>
                <Body className="text-gray-600 mb-4">
                  Share your educational qualifications and relevant training.
                </Body>
                <div className="space-y-4">
                  <div>
                    <Caption className="mb-2">Highest Degree</Caption>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                      <option value="">Select degree level</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">Ph.D.</option>
                      <option value="professional">Professional Certificate</option>
                    </select>
                  </div>
                  <div>
                    <Caption className="mb-2">Field of Study</Caption>
                    <input
                      type="text"
                      placeholder="e.g., Art History, Archaeology, Museum Studies"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <Caption className="mb-2">Institution</Caption>
                    <input
                      type="text"
                      placeholder="University or Institution name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MdVerified className="text-yellow-600 mt-1" />
                <div>
                  <Caption className="font-medium text-yellow-800">Verification Process</Caption>
                  <Body className="text-sm text-yellow-700 mt-1">
                    Our team will review your credentials within 2-3 business days. You'll receive an email 
                    confirmation once verified. Verified experts receive a special badge and higher priority in appraisal requests.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Appraisal Workflow",
      icon: <GiMagnifyingGlass size={48} className="text-primary" />,
      content: (
        <div>
          <Title level={3} className="mb-6 text-center">Your Expert Dashboard & Workflow</Title>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-2 border-primary rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <GiMagnifyingGlass className="text-primary" />
                  Appraisal Queue
                </Title>
                <Body className="text-gray-600 mb-4">
                  Review incoming appraisal requests matched to your expertise areas. 
                  Accept requests that align with your knowledge and availability.
                </Body>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Caption className="font-medium text-blue-700">What you'll see:</Caption>
                  <ul className="mt-2 text-sm text-blue-600 space-y-1">
                    <li>• Item photos and descriptions</li>
                    <li>• Seller's questions and concerns</li>
                    <li>• Estimated complexity and time required</li>
                    <li>• Proposed fee for the appraisal</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white border-2 border-green-300 rounded-lg p-6">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <FiFileText className="text-green-500" />
                  Appraisal Process
                </Title>
                <Body className="text-gray-600 mb-4">
                  Follow our structured process to deliver comprehensive, professional appraisals.
                </Body>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                    <span className="text-sm">Initial assessment & research</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                    <span className="text-sm">Detailed analysis & valuation</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                    <span className="text-sm">Generate professional report</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                    <span className="text-sm">Submit & receive payment</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-lg mb-6">
              <Title level={4} className="mb-4 text-white">💰 Earning Potential</Title>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Title level={2} className="text-white">$50-200</Title>
                  <Caption className="text-purple-100">Basic Appraisal</Caption>
                  <Body className="text-sm text-purple-50 mt-1">Simple items, condition assessment</Body>
                </div>
                <div className="text-center">
                  <Title level={2} className="text-white">$200-500</Title>
                  <Caption className="text-purple-100">Detailed Appraisal</Caption>
                  <Body className="text-sm text-purple-50 mt-1">Complex items, research required</Body>
                </div>
                <div className="text-center">
                  <Title level={2} className="text-white">$500+</Title>
                  <Caption className="text-purple-100">Expert Authentication</Caption>
                  <Body className="text-sm text-purple-50 mt-1">High-value items, provenance research</Body>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-orange-300 rounded-lg p-6">
                <Title level={4} className="mb-4">Quality Standards</Title>
                <Body className="text-gray-600 mb-4">
                  Maintain high standards to build your reputation and earn premium fees.
                </Body>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Thorough research and documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Professional report formatting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Timely delivery (typically 3-5 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Clear communication with clients</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
                <Title level={4} className="mb-4">Support & Resources</Title>
                <Body className="text-gray-600 mb-4">
                  Access tools and support to help you succeed as an expert appraiser.
                </Body>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Research database access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Report templates and tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Expert community forum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>24/7 technical support</span>
                  </div>
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
        role: 'expert',
        completedAt: new Date().toISOString(),
        stepsCompleted: totalSteps,
        expertiseAreas,
        ...onboardingData
      })).unwrap();
      
      dispatch(showSuccess('Welcome to the expert community! Your onboarding is complete.'));
      navigate('/dashboard', { replace: true });
    } catch (error) {
    }
  };

  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="text-primary mb-2">Expert Onboarding</Title>
          <Body className="text-gray-600">Set up your expert profile and start appraising!</Body>
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
                {isLoading ? 'Completing...' : 'Start Appraising'}
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

export default ExpertOnboarding;
