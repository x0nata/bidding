import React, { useState } from 'react';
import { Title } from '../../router';
import BankBalanceDisplay from '../../components/payment/BankBalanceDisplay';
import BankAddBalanceModal from '../../components/payment/BankAddBalanceModal';
import BankTransactionHistory from '../../components/payment/BankTransactionHistory';
import { FiInfo, FiShield, FiCreditCard } from 'react-icons/fi';

const BalanceManagement = () => {
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddBalanceSuccess = () => {
    // Trigger refresh of balance and transaction history
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddBalanceClick = () => {
    setShowAddBalanceModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-900 mb-2">
            Balance Management
          </Title>
          <p className="text-gray-600">
            Manage your account balance for participating in Horn of Antiques auctions
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <FiInfo className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Demo Bank Payment System</h4>
              <p className="text-blue-800 text-sm">
                This is a demonstration bank payment system for Horn of Antiques. No real money will be transferred. 
                Use any account number (minimum 8 digits) for testing the auction bidding functionality.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Balance and Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Display */}
            <BankBalanceDisplay
              showAddBalance={true}
              onAddBalanceClick={handleAddBalanceClick}
              refreshTrigger={refreshTrigger}
            />

            {/* Quick Info Cards */}
            <div className="space-y-4">
              {/* Security Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FiShield className="text-green" size={20} />
                  <h4 className="font-medium text-gray-900">Secure Payments</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Your payment information is encrypted and secure. We use industry-standard 
                  security measures to protect your data.
                </p>
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FiCreditCard className="text-green" size={20} />
                  <h4 className="font-medium text-gray-900">How Bidding Works</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-green text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                    <span>Add balance via bank transfer</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-green text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                    <span>Place bids on auctions (amount is held)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-green text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                    <span>Win: Payment deducted | Lose: Amount refunded</span>
                  </div>
                </div>
              </div>

              {/* Demo Bank Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">Demo Bank Account</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Account Number</div>
                    <div className="text-gray-600 font-mono">12345678901</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Account Holder</div>
                    <div className="text-gray-600">Demo User</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Bank Name</div>
                    <div className="text-gray-600">Demo Bank Ethiopia</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Use any account number with minimum 8 digits for testing
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <BankTransactionHistory
              refreshTrigger={refreshTrigger}
              className="h-fit"
            />
          </div>
        </div>

        {/* Add Balance Modal */}
        <BankAddBalanceModal
          isOpen={showAddBalanceModal}
          onClose={() => setShowAddBalanceModal(false)}
          onSuccess={handleAddBalanceSuccess}
        />
      </div>
    </div>
  );
};

export default BalanceManagement;