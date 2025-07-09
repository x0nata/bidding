import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Caption } from '../common/Design';
import { CountdownTimer } from '../common/CountdownTimer';
import { AuctionStatusBadge } from '../common/AuctionStatusBadge';
import { FiUser, FiDollarSign, FiClock, FiEye } from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { formatCurrency } from '../../utils/formatters';

export const AuctionCard = ({ 
  auction, 
  showSellerName = true, 
  showCountdown = true, 
  variant = 'default',
  className = '' 
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get auction status
  const getAuctionStatus = () => {
    // Live auctions have different status logic
    if (auction.auctionType === 'Live') {
      if (auction.isSoldout) return 'ended';
      if (auction.instantPurchasePrice && auction.currentBid >= auction.instantPurchasePrice) return 'ended';
      return 'live';
    }

    // Timed auctions follow time-based logic
    if (!auction.auctionEndDate) return 'upcoming';

    const now = new Date();
    const endDate = new Date(auction.auctionEndDate);
    const startDate = new Date(auction.auctionStartDate || auction.createdAt);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';

    // Check if ending soon (within 24 hours)
    const hoursUntilEnd = (endDate - now) / (1000 * 60 * 60);
    if (hoursUntilEnd <= 24) return 'ending-soon';

    return 'active';
  };

  const auctionStatus = getAuctionStatus();

  // Get current bid or starting price
  const getCurrentPrice = () => {
    return auction.currentBid || auction.startingBid || auction.price || 0;
  };

  // Get seller name
  const getSellerName = () => {
    if (auction.user?.name) return auction.user.name;
    if (auction.seller?.name) return auction.seller.name;
    return 'Anonymous Seller';
  };

  // Handle card click
  const handleCardClick = () => {
    navigate(`/details/${auction._id}`);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Get image URL
  const getImageUrl = () => {
    if (imageError) return '/images/placeholder-antique.jpg';
    return auction.image?.filePath || auction.image?.url || '/images/placeholder-antique.jpg';
  };

  // Variant styles
  const getCardStyles = () => {
    const baseStyles = "bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100";
    
    switch (variant) {
      case 'compact':
        return `${baseStyles} h-full`;
      case 'featured':
        return `${baseStyles} lg:col-span-2`;
      default:
        return baseStyles;
    }
  };

  return (
    <div 
      className={`${getCardStyles()} ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl()}
          alt={auction.title}
          className={`w-full h-48 object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onError={handleImageError}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <AuctionStatusBadge status={auctionStatus} />
        </div>

        {/* Quick View Button */}
        <div className={`absolute top-3 right-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors">
            <FiEye className="text-sm" />
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 hover:text-yellow-600 transition-colors">
          {auction.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-green-600" />
            <div>
              <Caption className="text-xs text-gray-500">
                {auction.currentBid ? 'Current Bid' : 'Starting Bid'}
              </Caption>
              <div className="font-bold text-green-600 text-lg">
                {formatCurrency(getCurrentPrice())}
              </div>
            </div>
          </div>
          
          {/* Bid Count */}
          {auction.totalBids > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <MdGavel className="text-sm" />
              <Caption className="text-xs">{auction.totalBids} bids</Caption>
            </div>
          )}
        </div>

        {/* Seller Info */}
        {showSellerName && (
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <FiUser className="text-sm" />
            <Caption className="text-sm">{getSellerName()}</Caption>
          </div>
        )}

        {/* Countdown Timer */}
        {showCountdown && auction.auctionEndDate && auctionStatus !== 'ended' && (
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="text-orange-500 text-sm" />
              <Caption className="text-xs text-gray-500 uppercase tracking-wide">
                {auctionStatus === 'upcoming' ? 'Starts In' : 'Ends In'}
              </Caption>
            </div>
            <CountdownTimer 
              endDate={auctionStatus === 'upcoming' ? auction.auctionStartDate : auction.auctionEndDate}
              size="small"
              showLabels={false}
            />
          </div>
        )}

        {/* Auction Ended */}
        {auctionStatus === 'ended' && (
          <div className="border-t border-gray-100 pt-3">
            <div className="text-center py-2">
              <Caption className="text-red-600 font-medium">Auction Ended</Caption>
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};

export default AuctionCard;
