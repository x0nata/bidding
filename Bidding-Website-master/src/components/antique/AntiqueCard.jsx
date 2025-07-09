import React from 'react';
import { Link } from 'react-router-dom';
import { formatETB } from '../../utils/currency';

const AntiqueCard = ({ product }) => {
  const {
    _id,
    title,
    image,
    currentBid,
    startingBid,
    reservePrice,
    reserveMet,
    totalBids,
    auctionStatus,
    timeRemaining,
    auctionType,
    era,
    condition,
    authenticity,
    rarity,
    maker
  } = product;

  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'Ended';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'live':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthenticityBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarityLevel) => {
    switch (rarityLevel) {
      case 'Unique':
        return 'text-purple-600';
      case 'Extremely Rare':
        return 'text-red-600';
      case 'Very Rare':
        return 'text-orange-600';
      case 'Rare':
        return 'text-yellow-600';
      case 'Uncommon':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative">
        <Link to={`/auction/${_id}`}>
          <img
            src={image?.url || '/placeholder-antique.jpg'}
            alt={title}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(auctionStatus)}`}>
            {auctionStatus === 'live' ? 'LIVE' : auctionStatus.toUpperCase()}
          </span>
        </div>

        {/* Auction Type Badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
            {auctionType}
          </span>
        </div>

        {/* Time Remaining Overlay */}
        {auctionStatus === 'active' && timeRemaining > 0 && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded flex items-center">
            <span className="mr-1 text-xs">⏰</span>
            <span className="text-xs font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Era */}
        <div className="mb-3">
          <Link to={`/auction/${_id}`}>
            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
          {era && (
            <p className="text-sm text-gray-600 mt-1">{era} Period</p>
          )}
        </div>

        {/* Maker Information */}
        {maker?.name && (
          <div className="mb-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">By:</span> {maker.name}
              {maker.nationality && ` (${maker.nationality})`}
            </p>
          </div>
        )}

        {/* Authenticity and Condition */}
        <div className="flex flex-wrap gap-2 mb-3">
          {authenticity?.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getAuthenticityBadge(authenticity.status)}`}>
              <span className="mr-1">🛡️</span>
              {authenticity.status}
            </span>
          )}
          
          {condition && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {condition}
            </span>
          )}
          
          {rarity && rarity !== 'Common' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${getRarityColor(rarity)}`}>
              {rarity}
            </span>
          )}
        </div>

        {/* Bidding Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid:</span>
            <span className="text-lg font-bold text-green-600">
              {formatETB(currentBid || startingBid)}
            </span>
          </div>

          {reservePrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reserve:</span>
              <span className={`text-sm font-medium ${reserveMet ? 'text-green-600' : 'text-orange-600'}`}>
                {reserveMet ? 'Met' : 'Not Met'}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">🔨</span>
              {totalBids || 0} bids
            </span>
            <span className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">👁️</span>
              {Math.floor(Math.random() * 50) + 10} watching
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {auctionStatus === 'active' || auctionStatus === 'live' ? (
            <Link
              to={`/auction/${_id}`}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block font-medium"
            >
              {auctionStatus === 'live' ? 'Join Live Auction' : 'Place Bid'}
            </Link>
          ) : auctionStatus === 'upcoming' ? (
            <Link
              to={`/auction/${_id}`}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center block font-medium"
            >
              View Details
            </Link>
          ) : (
            <Link
              to={`/auction/${_id}`}
              className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed text-center block font-medium"
            >
              Auction Ended
            </Link>
          )}

          <Link
            to={`/auction/${_id}`}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-center block"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AntiqueCard;
