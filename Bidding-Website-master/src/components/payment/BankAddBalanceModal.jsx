import React, { useState, useEffect } from 'react';
import { FiX, FiLock, FiCheck, FiCreditCard, FiInfo } from 'react-icons/fi';
import { useBankBalance } from '../../hooks/useBankBalance';
import { showSuccess, showError } from '../../redux/slices/notificationSlice';
import { useDispatch } from 'react-redux';

const BankAddBalanceModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Amount, 2: Bank Details, 3: Processing, 4: Success
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountHolder: ''
  });
  const [errors, setErrors] = useState({});
  const { addBalance, loading, formatAmount } = useBankBalance();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setBankDetails({
      accountNumber: '',
      accountHolder: ''
    });
    setErrors({});
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setErrors({ amount: 'Please enter a valid amount' });
      return false;
    }
    if (numAmount < 10) {
      setErrors({ amount: 'Minimum amount is 10 ETB' });
      return false;
    }
    if (numAmount > 100000) {
      setErrors({ amount: 'Maximum amount is 100,000 ETB' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateBankDetails = () => {
    const newErrors = {};
    
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 8) {
      newErrors.accountNumber = 'Please enter a valid account number (minimum 8 digits)';
    }
    
    if (!bankDetails.accountHolder || bankDetails.accountHolder.trim().length < 2) {
      newErrors.accountHolder = 'Please enter the account holder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountNext = () => {
    if (validateAmount()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateBankDetails()) {
      return;
    }

    setStep(3);

    try {

      const response = await addBalance(parseFloat(amount), bankDetails);


      setStep(4);
      dispatch(showSuccess(`Successfully added ${formatAmount(parseFloat(amount))} via bank transfer`));
      
      if (onSuccess) {
        onSuccess(response);
      }

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      dispatch(showError(error.message || 'Bank transfer failed. Please try again.'));
      setStep(2); // Go back to bank details step
    }
  };

  const fillDemoData = () => {
    setBankDetails({
      accountNumber: '12345678901',
      accountHolder: 'Demo User'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Balance - Bank Transfer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Amount */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-green ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="10"
                    max="100000"
                    step="0.01"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">ETB</span>
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:border-green hover:text-green transition-colors"
                  >
                    {quickAmount} ETB
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Demo Bank Transfer</h4>
                    <p className="text-sm text-blue-800">
                      This is a demo payment system. No real money will be transferred. 
                      Use any account number (minimum 8 digits) for testing.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAmountNext}
                className="w-full bg-green text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-lg">{formatAmount(parseFloat(amount))}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <FiCreditCard />
                    Bank Account Details
                  </h3>
                  <button
                    onClick={fillDemoData}
                    className="text-sm text-green hover:text-green-600 font-medium"
                  >
                    Fill Demo Data
                  </button>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> Use any account number with minimum 8 digits (e.g., 12345678901)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    placeholder="12345678901"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-green ${
                      errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength="20"
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green focus:border-green ${
                      errors.accountHolder ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.accountHolder && (
                    <p className="text-red-500 text-sm mt-1">{errors.accountHolder}</p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <FiLock size={16} />
                  <span className="text-sm font-medium">Secure Demo Transfer - No Real Money</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Transfer Funds'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Bank Transfer</h3>
              <p className="text-gray-600">Please wait while we process your bank transfer...</p>
              <div className="mt-4 text-sm text-gray-500">
                This usually takes a few seconds in demo mode
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-green text-xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Transfer Successful!</h3>
              <p className="text-gray-600 mb-4">
                {formatAmount(parseFloat(amount))} has been added to your account via bank transfer.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                You can now use this balance to participate in auctions.
              </div>
              <button
                onClick={onClose}
                className="bg-green text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAddBalanceModal;