import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import { 
  FiClock, 
  FiDollarSign, 
  FiUsers,
  FiRefreshCw,
  FiArrowRight,
  FiEye,
  FiHeart
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { formatETB } from '../../utils/currency';

export const ActiveAuctions = ({ 
  auctions = [], 
  loading = false, 
  error = null,
  onRefresh,
  maxItems = 6 
}) => {
  const [timeRemaining, setTimeRemaining] = useState({});

  // Update countdown timers
  useEffect(() => {
    const updateTimers = () => {
      const newTimeRemaining = {};
      auctions.forEach(auction => {
        if (auction.auctionEndDate) {
          const now = new Date().getTime();
          const endTime = new Date(auction.auctionEndDate).getTime();
          const difference = endTime - now;
          
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            newTimeRemaining[auction._id] = { days, hours, minutes, seconds, ended: false };
          } else {
            newTimeRemaining[auction._id] = { ended: true };
          }
        }
      });
      setTimeRemaining(newTimeRemaining);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [auctions]);

  const formatTimeRemaining = (auctionId) => {
    const time = timeRemaining[auctionId];
    if (!time) return 'Loading...';
    if (time.ended) return 'Ended';
    
    if (time.days > 0) return `${time.days}d ${time.hours}h`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
    if (time.minutes > 0) return `${time.minutes}m ${time.seconds}s`;
    return `${time.seconds}s`;
  };

  const getTimeRemainingColor = (auctionId) => {
    const time = timeRemaining[auctionId];
    if (!time || time.ended) return 'text-gray-500';
    
    if (time.days === 0 && time.hours === 0 && time.minutes < 30) {
      return 'text-red-600'; // Ending soon
    } else if (time.days === 0 && time.hours < 2) {
      return 'text-orange-600'; // Ending today
    }
    return 'text-green-600'; // Time remaining
  };

  const getAuctionStatus = (auction) => {
    const time = timeRemaining[auction._id];
    if (!time) return 'active';
    if (time.ended) return 'ended';
    
    if (time.days === 0 && time.hours === 0 && time.minutes < 30) {
      return 'ending-soon';
    }
    return 'active';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ending-soon':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">Active Auctions</Title>
          <div className="animate-spin">
            <FiRefreshCw size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="text-gray-800">Active Auctions</Title>
          <Caption className="text-gray-600 mt-1">
            Discover and bid on amazing antiques
          </Caption>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={16} className="text-gray-600" />
            </button>
          )}
          <NavLink 
            to="/" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <FiArrowRight size={14} />
          </NavLink>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading auctions</div>
          <Caption className="text-gray-500 mb-4">{error}</Caption>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Try again
            </button>
          )}
        </div>
      ) : !Array.isArray(auctions) || auctions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdGavel size={24} className="text-gray-400" />
          </div>
          <Title level={5} className="text-gray-600 mb-2">No active auctions</Title>
          <Caption className="text-gray-500 mb-4">
            Check back later for new auction listings
          </Caption>
          <NavLink 
            to="/" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Browse All Auctions
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(auctions) ? auctions : []).slice(0, maxItems).map((auction, index) => {
            const status = getAuctionStatus(auction);
            return (
              <div 
                key={auction._id || index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
              >
                {/* Auction Image */}
                <div className="relative">
                  <img
                    src={auction.image?.url || auction.image || '/images/placeholder.jpg'}
                    alt={auction.title || 'Auction item'}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                      ${getStatusBadge(status)}
                    `}>
                      {status === 'ending-soon' ? 'Ending Soon' : 
                       status === 'ended' ? 'Ended' : 'Live'}
                    </span>
                  </div>

                  {/* Watchlist Button */}
                  <button className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                    <FiHeart size={14} className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>

                {/* Auction Details */}
                <div className="p-4">
                  <Title level={6} className="text-gray-800 font-medium line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {auction.title || 'Unknown Item'}
                  </Title>

                  {/* Current Bid */}
                  <div className="flex items-center gap-1 mb-2">
                    <FiDollarSign size={14} className="text-green-600" />
                    <Body className="text-green-600 font-semibold">
                      {formatETB(auction.currentBid || auction.startingBid || 0)}
                    </Body>
                    <Caption className="text-gray-500 ml-1">
                      {auction.totalBids ? `(${auction.totalBids} bids)` : 'Starting bid'}
                    </Caption>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center gap-1 mb-3">
                    <FiClock size={14} className={getTimeRemainingColor(auction._id)} />
                    <Caption className={getTimeRemainingColor(auction._id)}>
                      {formatTimeRemaining(auction._id)}
                    </Caption>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <NavLink
                      to={`/details/${auction._id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {status === 'ended' ? 'View Results' : 'Place Bid'}
                    </NavLink>
                    <NavLink
                      to={`/details/${auction._id}`}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="View details"
                    >
                      <FiEye size={16} className="text-gray-600" />
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(auctions) && auctions.length > maxItems && (
        <div className="mt-6 text-center">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View all {auctions.length} active auctions
            <FiArrowRight size={16} />
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default ActiveAuctions;
