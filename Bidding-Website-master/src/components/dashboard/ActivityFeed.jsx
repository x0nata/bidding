import React from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import { 
  FiClock, 
  FiDollarSign, 
  FiAward, 
  FiTrendingUp,
  FiRefreshCw,
  FiArrowRight
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';

export const ActivityFeed = ({ 
  activities = [], 
  loading = false, 
  error = null,
  onRefresh,
  maxItems = 5 
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'bid_placed':
        return <MdGavel className="text-blue-600" size={16} />;
      case 'bid_won':
        return <FiAward className="text-green-600" size={16} />;
      case 'bid_outbid':
        return <FiTrendingUp className="text-red-600" size={16} />;
      case 'auction_ended':
        return <FiClock className="text-gray-600" size={16} />;
      default:
        return <FiDollarSign className="text-gray-600" size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'bid_placed':
        return 'border-l-blue-500 bg-blue-50';
      case 'bid_won':
        return 'border-l-green-500 bg-green-50';
      case 'bid_outbid':
        return 'border-l-red-500 bg-red-50';
      case 'auction_ended':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">Recent Activity</Title>
          <div className="animate-spin">
            <FiRefreshCw size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
        <Title level={4} className="text-gray-800">Recent Activity</Title>
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
            to="/profile" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <FiArrowRight size={14} />
          </NavLink>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading activity</div>
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
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock size={24} className="text-gray-400" />
          </div>
          <Title level={5} className="text-gray-600 mb-2">No recent activity</Title>
          <Caption className="text-gray-500 mb-4">
            Start bidding on auctions to see your activity here
          </Caption>
          <NavLink 
            to="/" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Browse Auctions
          </NavLink>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, maxItems).map((activity, index) => (
            <div 
              key={activity.id || index}
              className={`
                border-l-4 pl-4 py-3 rounded-r-lg transition-all duration-200 hover:shadow-sm
                ${getActivityColor(activity.type)}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Body className="text-gray-800 text-sm font-medium">
                        {activity.title}
                      </Body>
                      <Caption className="text-gray-600 mt-1">
                        {activity.description}
                      </Caption>
                      {activity.amount && (
                        <div className="flex items-center gap-1 mt-2">
                          <FiDollarSign size={12} className="text-green-600" />
                          <Caption className="text-green-600 font-medium">
                            ${activity.amount.toLocaleString()}
                          </Caption>
                        </div>
                      )}
                    </div>
                    <Caption className="text-gray-500 text-xs flex-shrink-0 ml-2">
                      {formatTimeAgo(activity.createdAt)}
                    </Caption>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
