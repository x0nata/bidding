import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { validateAuctionForm } from '../../utils/validation';
import { useFormState, useFormSubmission } from '../../utils/formHelpers';
import { fetchCategories, submitProductListing, verifyProductExists } from '../../utils/dataFetching';

import { logListingError } from '../../utils/errorMonitoring';

// Enhanced error display component
const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {error.stage ? `${error.stage.charAt(0).toUpperCase() + error.stage.slice(1)} Error` : 'Error'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>

            {error.troubleshooting && error.troubleshooting.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">Troubleshooting steps:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {error.troubleshooting.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {error.details && Object.keys(error.details).length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="mt-4 flex space-x-3">
            {error.isRetryable && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Try Again
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AntiqueListingForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [submissionError, setSubmissionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Use the common form state manager
  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleArrayInput,
    handleFileUpload,
    resetForm,
    setIsSubmitting
  } = useFormState({
    // Basic product info
    title: '',
    description: '',
    startingBid: '',
    reservePrice: '',
    category: '',

    // Antique-specific fields
    era: '',
    period: '',
    provenance: '',
    condition: 'Good',
    conditionDetails: '',
    materials: [],
    techniques: [],
    historicalSignificance: '',
    maker: {
      name: '',
      nationality: '',
      lifespan: ''
    },
    style: '',
    rarity: 'Common',

    // Auction settings
    auctionType: 'Timed',
    auctionStartDate: '',
    auctionEndDate: '',
    bidIncrement: 10,

    // Physical attributes
    height: '',
    width: '',
    lengthpic: '',
    weigth: '',
    mediumused: '',

    // Images
    images: []
  });

  const eraOptions = [
    'Ancient', 'Medieval', 'Renaissance', 'Baroque', 'Georgian', 
    'Victorian', 'Edwardian', 'Art Nouveau', 'Art Deco', 
    'Mid-Century Modern', 'Contemporary', 'Other'
  ];

  const conditionOptions = [
    'Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Restoration Required'
  ];

  const rarityOptions = [
    'Common', 'Uncommon', 'Rare', 'Very Rare', 'Extremely Rare', 'Unique'
  ];

  const auctionTypeOptions = [
    { value: 'Timed', label: 'Timed Auction' },
    { value: 'Live', label: 'Live Auction' },
    { value: 'Buy Now', label: 'Buy Now' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
    }
  };

  // Form handling functions are now provided by useFormState hook
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload('images', files);
  };

  const validateForm = () => {
    const validationError = validateAuctionForm(formData);
    if (validationError) {
      toast.error(validationError);
      return false;
    }
    return true;
  };

  // Enhanced form submission with comprehensive error handling and debugging
  const performSubmission = async (data, isRetry = false) => {
    let attemptRecord = null;

    try {
      setSubmissionError(null);

      if (isRetry) {
      } else {
        setRetryCount(0);
      }

      // Record the attempt for debugging

      const submitData = new FormData();

      // Add all form fields (only non-empty values)
      Object.keys(data).forEach(key => {
        const value = data[key];

        if (key === 'images' && Array.isArray(value) && value.length > 0) {
          value.forEach(image => {
            submitData.append('images', image);
          });
        } else if (key === 'materials' || key === 'techniques') {
          if (Array.isArray(value) && value.length > 0) {
            submitData.append(key, JSON.stringify(value));
          }
        } else if (key === 'maker') {
          if (value && typeof value === 'object' && (value.name || value.nationality || value.lifespan)) {
            submitData.append(key, JSON.stringify(value));
          }
        } else if (value !== null && value !== undefined && value !== '') {
          // Only append non-empty values
          submitData.append(key, value);
        }
      });

      const result = await submitProductListing(submitData);

      // Update attempt record with result
      if (attemptRecord) {
        attemptRecord.result = result;
      }

      if (!result.success) {
        const error = new Error(result.error?.message || 'Submission failed');
        error.stage = result.error?.stage;
        error.type = result.error?.type;
        error.code = result.error?.code;
        error.details = result.error?.details;
        error.isRetryable = result.error?.isRetryable;
        error.troubleshooting = result.error?.troubleshooting;
        throw error;
      }

      // Handle successful submission
      await handleSuccessfulSubmission(result.data, result.metadata);

      // Return success result for useFormSubmission hook
      return { success: true, data: result.data };

    } catch (error) {

      // Update attempt record with error
      if (attemptRecord) {
        attemptRecord.error = error;
      }

      // Log error for monitoring
      logListingError(error.stage || 'submission', error, {
        formData: data,
        isRetry,
        retryCount,
        timestamp: new Date().toISOString(),
        attemptId: attemptRecord?.timestamp
      });

      // Set the error for display
      setSubmissionError({
        message: error.message,
        stage: error.stage || 'unknown',
        type: error.type || 'UnknownError',
        code: error.code || 'GENERAL_ERROR',
        details: error.details || {},
        isRetryable: error.isRetryable !== false, // Default to retryable
        troubleshooting: error.troubleshooting || ['Please try again or contact support.']
      });

      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }

      // Return error result for useFormSubmission hook
      return { success: false, error: error.message };
    }
  };

  const handleSuccessfulSubmission = async (productData, metadata) => {
    try {
      // Verify the product was created successfully
      if (!productData || !productData._id) {
        throw new Error('Product creation failed - no product ID returned');
      }


      if (metadata?.requestId) {
      }

      // Verify the product exists in the database
      const exists = await verifyProductExists(productData._id);

      if (!exists) {
        throw new Error('Product creation failed - item not found in database');
      }


      // Clear any previous errors
      setSubmissionError(null);
      setRetryCount(0);

      // Show success message only after verification
      toast.success('Antique listing created successfully!');

      // Note: User listings refresh removed as My Listings feature was removed

      // Navigate to the product page
      navigate(`/product/${productData._id}`);

    } catch (verificationError) {
      setSubmissionError({
        message: verificationError.message,
        stage: 'verification',
        type: 'VerificationError',
        code: 'VERIFICATION_ERROR',
        details: { productId: productData?._id },
        isRetryable: true,
        troubleshooting: [
          'The listing may have been created but verification failed',
          'Try refreshing the page to see if your listing appears',
          'Contact support if the listing is missing'
        ]
      });
    }
  };

  // Use the common form submission handler
  const { handleSubmit: submitForm } = useFormSubmission(
    async (data) => {
      await performSubmission(data, false);
    },
    {
      onSuccess: () => {
        // Success is handled in performSubmission
      },
      resetOnSuccess: false
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await submitForm(formData, resetForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await performSubmission(formData, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorDismiss = () => {
    setSubmissionError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">List Your Antique</h2>

      {/* Enhanced Error Display */}
      <ErrorDisplay
        error={submissionError}
        onRetry={handleRetry}
        onDismiss={handleErrorDismiss}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Victorian Mahogany Writing Desk"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <optgroup key={category._id} label={category.title}>
                    <option value={category._id}>{category.title}</option>
                    {category.subcategories?.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        &nbsp;&nbsp;{sub.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the antique, including its history, condition, and unique features..."
              required
            />
          </div>
        </div>

        {/* Antique Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Antique Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Era
              </label>
              <select
                name="era"
                value={formData.era}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Era</option>
                {eraOptions.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {conditionOptions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rarity
              </label>
              <select
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rarityOptions.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
              </label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1850-1870, Early 19th Century"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <input
                type="text"
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Chippendale, Louis XVI, Arts and Crafts"
              />
            </div>
          </div>
        </div>

        {/* Auction Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Auction Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Bid * ($)
              </label>
              <input
                type="number"
                name="startingBid"
                value={formData.startingBid}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter starting bid amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reserve Price ($)
              </label>
              <input
                type="number"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional reserve price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Type *
              </label>
              <select
                name="auctionType"
                value={formData.auctionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {auctionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid Increment ($)
              </label>
              <input
                type="number"
                name="bidIncrement"
                value={formData.bidIncrement}
                onChange={handleInputChange}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {formData.auctionType === 'Timed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Start Date
                  <span className="text-sm text-gray-500 ml-1">(optional - defaults to immediate start)</span>
                </label>
                <input
                  type="datetime-local"
                  name="auctionStartDate"
                  value={formData.auctionStartDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction End Date
                  <span className="text-sm text-gray-500 ml-1">(optional - defaults to 7 days)</span>
                </label>
                <input
                  type="datetime-local"
                  name="auctionEndDate"
                  value={formData.auctionEndDate}
                  onChange={handleInputChange}
                  min={formData.auctionStartDate || new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Images</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload multiple images of your antique. First image will be the main display image.
            </p>

            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Images: {formData.images.length}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="text-sm text-gray-600 p-2 bg-white rounded border">
                      {image.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          {/* Debug Controls (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowDebugPanel(true)}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                title="Open Debug Panel"
              >
                🐛 Debug Panel
              </button>
              <button
                type="button"
                onClick={async () => {
                  alert('Diagnostic complete! Check browser console for detailed results.');
                }}
                className="px-3 py-1 text-xs bg-blue-200 text-blue-600 rounded hover:bg-blue-300"
                title="Run Full System Diagnostic"
              >
                🔍 Diagnose
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([report], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `listing-debug-report-${Date.now()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1 text-xs bg-green-200 text-green-600 rounded hover:bg-green-300"
                title="Download Debug Report"
              >
                📥 Export
              </button>
            </div>
          )}

          <div className="flex space-x-4 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </div>
      </form>

      {/* Debug Panel */}
        isVisible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </div>
  );
};

export default AntiqueListingForm;
