import React from 'react';
import { Title, Body } from '../common/Design';
import { MdGavel, MdWarning, MdCheckCircle } from 'react-icons/md';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { formatETB, formatETBNumber } from '../../utils/currency';

const BidConfirmationModal = ({
  bidAmount,
  currentBid,
  auctionTitle,
  onConfirm,
  onCancel,
  isSubmitting = false,
  userBalance = null
}) => {
  const bidIncrease = bidAmount - currentBid;
  const isSignificantIncrease = bidIncrease > (currentBid * 0.2); // 20% increase

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="bg-green text-white p-4 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MdGavel className="text-2xl" />
            <Title level={4} className="text-white">Confirm Your Bid</Title>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Auction Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Body className="text-gray-600 text-sm mb-1">Auction Item</Body>
            <Title level={5} className="text-gray-800">{auctionTitle}</Title>
          </div>

          {/* Bid Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <FiDollarSign className="mx-auto text-blue-600 text-2xl mb-1" />
              <Body className="text-blue-600 text-sm">Current Bid</Body>
              <Title level={4} className="text-blue-800">{formatETBNumber(currentBid)}</Title>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <FiTrendingUp className="mx-auto text-green text-2xl mb-1" />
              <Body className="text-green text-sm">Your Bid</Body>
              <Title level={4} className="text-green">{formatETBNumber(bidAmount)}</Title>
            </div>
          </div>

          {/* Bid Increase */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Body className="text-yellow-800">Bid Increase:</Body>
              <Title level={5} className="text-yellow-800">
                +${bidIncrease.toLocaleString()}
              </Title>
            </div>
            {isSignificantIncrease && (
              <div className="flex items-center space-x-2 mt-2 text-yellow-700">
                <MdWarning size={16} />
                <Body className="text-sm">This is a significant increase from the current bid</Body>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <MdWarning className="text-orange-600 mt-0.5" />
              <div>
                <Body className="text-orange-800 font-medium text-sm">Important:</Body>
                <Body className="text-orange-700 text-sm mt-1">
                  By placing this bid, you agree to purchase this item if you win the auction. 
                  All bids are binding and cannot be retracted.
                </Body>
              </div>
            </div>
          </div>

          {/* Confirmation Checklist */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MdCheckCircle className="text-green" />
              <Body className="text-gray-700 text-sm">I understand this bid is binding</Body>
            </div>
            <div className="flex items-center space-x-2">
              <MdCheckCircle className="text-green" />
              <Body className="text-gray-700 text-sm">
                I have sufficient funds to complete this purchase
                {userBalance && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Available balance: {formatETBNumber(userBalance)}
                  </span>
                )}
              </Body>
            </div>
            <div className="flex items-center space-x-2">
              <MdCheckCircle className="text-green" />
              <Body className="text-gray-700 text-sm">I agree to the auction terms and conditions</Body>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green text-white rounded-lg hover:bg-primary transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Placing Bid...</span>
              </>
            ) : (
              <>
                <MdGavel />
                <span>Confirm Bid</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidConfirmationModal;
