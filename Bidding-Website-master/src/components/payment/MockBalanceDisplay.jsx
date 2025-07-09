import React, { useState } from 'react';
import { FiDollarSign, FiLock, FiRefreshCw, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { useMockBalance } from '../../hooks/useMockBalance';
import MockAddBalanceModal from './MockAddBalanceModal';
import { mockPaymentService } from '../../services/mockPaymentService';

const MockBalanceDisplay = ({
  showAddBalance = true,
  onAddBalanceClick,
  refreshTrigger,
  className = ''
}) => {
  const { balanceInfo, loading, fetchBalanceInfo, formatAmount } = useMockBalance();
  const [showDetails, setShowDetails] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);

  const handleAddBalanceClick = () => {
    if (onAddBalanceClick) {
      onAddBalanceClick();
    } else {
      setShowAddBalanceModal(true);
    }
  };

  const handleAddBalanceSuccess = () => {
    fetchBalanceInfo(); // Refresh balance immediately
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset demo balance to 1000 ETB? This will clear all transaction history.')) {
      mockPaymentService.resetDemoData();
      fetchBalanceInfo();
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-green text-xl" />
            <h3 className="text-lg font-semibold text-gray-900">Account Balance (Demo)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
            <button
              onClick={fetchBalanceInfo}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-4">
          {/* Main Balance */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green mb-1">
              {formatAmount(balanceInfo.availableBalance)}
            </div>
            <div className="text-sm text-gray-600">Available Balance</div>
          </div>

          {/* Detailed Balance Info */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatAmount(balanceInfo.totalBalance)}
                </div>
                <div className="text-xs text-gray-500">Total Balance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {formatAmount(balanceInfo.heldAmount)}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <FiLock size={10} />
                  Held Amount
                </div>
              </div>
            </div>
          )}

          {/* Held Amount Warning */}
          {balanceInfo.heldAmount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800 text-sm">
                <FiLock size={14} />
                <span>
                  {formatAmount(balanceInfo.heldAmount)} is held for {balanceInfo.heldTransactions} active bid{balanceInfo.heldTransactions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Low Balance Warning */}
          {balanceInfo.availableBalance < 100 && balanceInfo.availableBalance > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-yellow-800 text-sm">
                <strong>Low Balance:</strong> Consider adding more funds to participate in auctions.
              </div>
            </div>
          )}

          {/* No Balance Warning */}
          {balanceInfo.availableBalance === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm">
                <strong>No Available Balance:</strong> Add funds to start bidding on auctions.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {showAddBalance && (
              <button
                onClick={handleAddBalanceClick}
                className="flex-1 bg-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiPlus size={16} />
                Add Balance
              </button>
            )}
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Reset Demo
            </button>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 text-sm">
              <strong>Demo Mode:</strong> This is a simulated balance system. No real money is involved.
              You start with 1000 ETB demo balance.
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
          </div>
        )}
      </div>

      {/* Add Balance Modal */}
      <MockAddBalanceModal
        isOpen={showAddBalanceModal}
        onClose={() => setShowAddBalanceModal(false)}
        onSuccess={handleAddBalanceSuccess}
      />
    </>
  );
};

export default MockBalanceDisplay;