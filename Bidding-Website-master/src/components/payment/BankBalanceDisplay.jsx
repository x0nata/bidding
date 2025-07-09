import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiLock, FiRefreshCw, FiPlus, FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';
import { useBankBalance } from '../../hooks/useBankBalance';

const BankBalanceDisplay = ({
  showAddBalance = true,
  onAddBalanceClick = null,
  refreshTrigger = 0,
  className = ""
}) => {
  const { balanceInfo, loading, fetchBalanceInfo, formatAmount } = useBankBalance();
  const [showDetails, setShowDetails] = useState(false);

  // Refresh balance when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchBalanceInfo();
    }
  }, [refreshTrigger, fetchBalanceInfo]);

  const handleAddBalance = () => {
    if (onAddBalanceClick) {
      onAddBalanceClick();
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-green text-lg" />
          <span className="font-medium text-gray-700">Account Balance</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
          <button
            onClick={fetchBalanceInfo}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh balance"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Available Balance */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {formatAmount(balanceInfo.availableBalance)}
        </div>
        <div className="text-sm text-gray-600">Available for bidding</div>
      </div>

      {/* Balance Details */}
      {showDetails && (
        <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Balance:</span>
            <span className="font-medium">{formatAmount(balanceInfo.totalBalance)}</span>
          </div>
          {balanceInfo.heldAmount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <FiLock size={12} />
                  Held for Bids:
                </span>
                <span className="font-medium text-orange-600">
                  -{formatAmount(balanceInfo.heldAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Bids:</span>
                <span className="font-medium">{balanceInfo.heldTransactions}</span>
              </div>
            </>
          )}
          <hr className="my-2" />
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-700">Available:</span>
            <span className="text-green">{formatAmount(balanceInfo.availableBalance)}</span>
          </div>
        </div>
      )}

      {/* Add Balance Button */}
      {showAddBalance && (
        <button
          onClick={handleAddBalance}
          className="w-full flex items-center justify-center gap-2 bg-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          <FiPlus size={16} />
          Add Balance
        </button>
      )}

      {/* Demo Notice */}
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800 flex items-center gap-1">
          <FiInfo size={12} />
          Demo payment system - Bank transfer only
        </div>
      </div>

      {/* Low Balance Warning */}
      {balanceInfo.availableBalance < 100 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Low Balance:</strong> Consider adding more balance to participate in auctions.
          </div>
        </div>
      )}

      {/* Held Amount Info */}
      {balanceInfo.heldAmount > 0 && !showDetails && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm text-orange-800 flex items-center gap-1">
            <FiLock size={12} />
            {formatAmount(balanceInfo.heldAmount)} held for {balanceInfo.heldTransactions} active bid{balanceInfo.heldTransactions !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankBalanceDisplay;