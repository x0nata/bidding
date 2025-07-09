import React, { useState, useEffect } from 'react';
import { FiClock, FiCheck, FiLock, FiRefreshCw, FiDollarSign, FiArrowUpRight, FiArrowDownLeft, FiX } from 'react-icons/fi';
import { bankPaymentService } from '../../services/bankPaymentService';
import { useBankBalance } from '../../hooks/useBankBalance';

const BankTransactionHistory = ({ refreshTrigger = 0, className = "" }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { formatAmount } = useBankBalance();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bankPaymentService.getTransactions(50, 0);
      setTransactions(response.transactions || []);
    } catch (err) {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchTransactions();
    }
  }, [refreshTrigger]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <FiArrowDownLeft className="text-green" size={16} />;
      case 'HOLD':
        return <FiLock className="text-orange-500" size={16} />;
      case 'RELEASE':
        return <FiArrowUpRight className="text-blue-500" size={16} />;
      case 'PAYMENT':
        return <FiArrowUpRight className="text-red-500" size={16} />;
      default:
        return <FiDollarSign className="text-gray-500" size={16} />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green';
      case 'HOLD':
        return 'text-orange-600';
      case 'RELEASE':
        return 'text-blue-600';
      case 'PAYMENT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: <FiCheck size={12} /> },
      HELD: { color: 'bg-orange-100 text-orange-800', icon: <FiLock size={12} /> },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock size={12} /> },
      FAILED: { color: 'bg-red-100 text-red-800', icon: <FiX size={12} /> }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Refresh transactions"
        >
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {transactions.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <FiDollarSign className="mx-auto text-gray-400 mb-3" size={48} />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h4>
            <p className="text-gray-600">
              Your transaction history will appear here once you start adding balance or placing bids.
            </p>
          </div>
        )}

        {transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {transaction.description}
                    </h4>
                    {getStatusBadge(transaction.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {formatDate(transaction.timestamp)}
                  </div>
                  
                  {transaction.bankDetails && (
                    <div className="text-xs text-gray-500 mt-1">
                      Account: {transaction.bankDetails.accountNumber} • {transaction.bankDetails.accountHolder}
                    </div>
                  )}
                  
                  {transaction.productId && (
                    <div className="text-xs text-gray-500 mt-1">
                      Product ID: {transaction.productId}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'DEPOSIT' || transaction.type === 'RELEASE' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </div>
                  
                  {transaction.balanceAfter !== undefined && (
                    <div className="text-xs text-gray-500">
                      Balance: {formatAmount(transaction.balanceAfter)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {transactions.length >= 50 && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                // Implement pagination if needed
              }}
              className="text-green hover:text-green-600 font-medium text-sm"
            >
              Load More Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankTransactionHistory;