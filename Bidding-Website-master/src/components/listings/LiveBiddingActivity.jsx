import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiDollarSign,
  FiActivity,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import { MdGavel, MdTrendingUp } from 'react-icons/md';
import { BsLightning } from 'react-icons/bs';
import { formatETB } from '../../utils/currency';

const LiveBiddingActivity = ({ listing, className = '' }) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Mock real-time activity updates (in real implementation, this would come from WebSocket)
  useEffect(() => {
    if (listing.recentBids && listing.recentBids.length > 0) {
      setRecentActivity(listing.recentBids);
      setLastUpdate(new Date());
    }
  }, [listing.recentBids]);

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get bid trend indicator
  const getBidTrend = () => {
    if (recentActivity.length < 2) return null;
    
    const latest = recentActivity[0];
    const previous = recentActivity[1];
    const increase = latest.amount - previous.amount;
    const percentage = ((increase / previous.amount) * 100).toFixed(1);

    return {
      increase,
      percentage,
      isPositive: increase > 0
    };
  };

  const trend = getBidTrend();

  if (listing.totalBids === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <MdGavel className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-medium">No bids yet</div>
          <div className="text-xs">Be the first to place a bid!</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BsLightning className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">Live Bidding Activity</span>
          </div>
          <div className="flex items-center gap-3">
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <FiTrendingUp className="w-3 h-3" />
                <span>+{trend.percentage}%</span>
              </div>
            )}
            <div className="text-sm text-gray-500">
              {listing.totalBids} bid{listing.totalBids !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Current Highest Bid</div>
            <div className="flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xl font-bold text-green-600">
                ${listing.currentBid?.toLocaleString() || '0'}
              </span>
            </div>
            {listing.latestBidder && (
              <div className="text-sm text-gray-600 mt-1">
                by {listing.latestBidder.name}
              </div>
            )}
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-1">Bidding Activity</div>
            <div className="flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-blue-600" />
              <span className="font-medium">
                {listing.totalBids} total bids
              </span>
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-500 mt-1">
                Updated {formatTimeAgo(lastUpdate)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Recent Bids</h4>
          {recentActivity.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Show less' : 'Show all'}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(isExpanded ? recentActivity : recentActivity.slice(0, 3)).map((bid, index) => (
            <div
              key={bid.id || index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {bid.bidder?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {bid.bidder?.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimeAgo(bid.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-bold ${
                  index === 0 ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {formatETB(bid.amount || 0)}
                </div>
                {index === 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Highest Bid
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {recentActivity.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            <FiActivity className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No recent bidding activity</div>
          </div>
        )}
      </div>

      {/* Reserve Price Status */}
      {listing.reservePrice > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Reserve Price: ${listing.reservePrice.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${
              listing.reserveMet ? 'text-green-600' : 'text-orange-600'
            }`}>
              {listing.reserveMet ? '✓ Reserve Met' : 'Reserve Not Met'}
            </div>
          </div>
          {!listing.reserveMet && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (listing.currentBid / listing.reservePrice) * 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ${(listing.reservePrice - listing.currentBid).toLocaleString()} needed to meet reserve
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveBiddingActivity;
