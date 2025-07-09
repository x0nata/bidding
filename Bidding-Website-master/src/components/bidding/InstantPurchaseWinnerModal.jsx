import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Title, Body } from '../common/Design';
import { MdClose, MdCheckCircle, MdLocationOn, MdPhone, MdEmail } from 'react-icons/md';
import { FiTruck, FiMapPin } from 'react-icons/fi';
import { formatETB } from '../../utils/currency';
import { markAsProcessed } from '../../redux/slices/notificationSlice';
import api from '../../services/api';
import instantPurchaseService from '../../services/instantPurchaseService';

const InstantPurchaseWinnerModal = ({
  isOpen,
  onClose,
  productTitle,
  finalPrice,
  productId,
  notificationId,
  auction,
  winner
}) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    const required = ['fullName', 'phoneNumber', 'address', 'city', 'region'];
    for (let field of required) {
      if (!deliveryInfo[field].trim()) {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    }
    
    // Basic phone validation
    if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(deliveryInfo.phoneNumber)) {
      return 'Please enter a valid phone number';
    }
    
    // Basic email validation if provided
    if (deliveryInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Submit delivery information using enhanced service
      const result = await instantPurchaseService.submitDeliveryInfo(
        productId,
        deliveryInfo,
        finalPrice,
        auction,
        winner
      );

      if (result.success) {
        setSubmitted(true);

        // Mark notification as processed
        if (notificationId) {
          dispatch(markAsProcessed(notificationId));
        }

        // Auto-close after 5 seconds to allow user to read confirmation
        setTimeout(() => {
          onClose();
        }, 5000);
      } else {
        setError(result.message || 'Failed to submit delivery information. Please try again.');
      }

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit delivery information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <MdCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <Title level={3} className="text-green-600 mb-2">Delivery Information Submitted!</Title>
            <Body className="text-gray-600">
              Thank you! We have received your delivery information. You will be contacted shortly to arrange delivery of your winning item.
            </Body>
          </div>
          <button
            onClick={onClose}
            className="bg-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MdCheckCircle className="text-3xl" />
              <div>
                <Title level={3} className="text-white">🎉 Congratulations! You Won!</Title>
                <Body className="text-green-100">Instant Purchase Victory</Body>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Winner Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <Title level={4} className="text-green-800 mb-2">Auction Won!</Title>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-semibold text-gray-900">{productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Price:</span>
                <span className="font-bold text-green-600 text-lg">{formatETB(finalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Type:</span>
                <span className="font-semibold text-blue-600">Instant Purchase</span>
              </div>
            </div>
          </div>

          {/* Delivery Information Form */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <FiTruck className="text-blue-600 text-xl" />
              <Title level={4} className="text-gray-900">Delivery Information</Title>
            </div>
            <Body className="text-gray-600 mb-4">
              Please provide your delivery information so we can arrange shipment of your winning item.
            </Body>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={deliveryInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={deliveryInfo.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+251 9XX XXX XXX"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={deliveryInfo.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <div className="relative">
                  <MdLocationOn className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your complete street address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={deliveryInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region *
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={deliveryInfo.region}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Region/State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={deliveryInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Postal Code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={deliveryInfo.additionalNotes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any special delivery instructions or notes..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Body className="text-red-700">{error}</Body>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FiMapPin />
                      <span>Submit Delivery Information</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantPurchaseWinnerModal;
