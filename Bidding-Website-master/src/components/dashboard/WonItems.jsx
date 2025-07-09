import React from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import {
  FiAward,
  FiDollarSign,
  FiCalendar,
  FiRefreshCw,
  FiArrowRight,
  FiEye,
  FiDownload
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { formatETB } from '../../utils/currency';

export const WonItems = ({ 
  wonItems = [], 
  loading = false, 
  error = null,
  onRefresh,
  maxItems = 4 
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'very good':
        return 'text-blue-600 bg-blue-100';
      case 'good':
        return 'text-yellow-600 bg-yellow-100';
      case 'fair':
        return 'text-orange-600 bg-orange-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">Won Items</Title>
          <div className="animate-spin">
            <FiRefreshCw size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
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
          <Title level={4} className="text-gray-800">Won Items</Title>
          <Caption className="text-gray-600 mt-1">
            Antiques you've successfully won at auction
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
            to="/antiques" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <FiArrowRight size={14} />
          </NavLink>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading won items</div>
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
      ) : !Array.isArray(wonItems) || wonItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAward size={24} className="text-gray-400" />
          </div>
          <Title level={5} className="text-gray-600 mb-2">No won items yet</Title>
          <Caption className="text-gray-500 mb-4">
            Win your first auction to see your collection here
          </Caption>
          <NavLink 
            to="/" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Browse Auctions
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Array.isArray(wonItems) ? wonItems : []).slice(0, maxItems).map((item, index) => (
            <div 
              key={item._id || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
            >
              {/* Item Image */}
              <div className="relative mb-4">
                <img
                  src={item.image?.url || item.image || '/images/placeholder.jpg'}
                  alt={item.title || 'Won item'}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                {item.authenticity?.status === 'Verified' && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <MdVerified size={16} />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  Won
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-2">
                <Title level={6} className="text-gray-800 font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title || 'Unknown Item'}
                </Title>

                {/* Era and Condition */}
                <div className="flex items-center gap-2 flex-wrap">
                  {item.era && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {item.era}
                    </span>
                  )}
                  {item.condition && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  )}
                </div>

                {/* Winning Bid */}
                <div className="flex items-center gap-1">
                  <FiDollarSign size={14} className="text-green-600" />
                  <Body className="text-green-600 font-semibold">
                    {formatETB(item.currentBid || item.price || 0)}
                  </Body>
                  <Caption className="text-gray-500 ml-1">winning bid</Caption>
                </div>

                {/* Date Won */}
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} className="text-gray-500" />
                  <Caption className="text-gray-500">
                    Won {formatDate(item.auctionEndDate || item.createdAt)}
                  </Caption>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <NavLink
                    to={`/details/${item._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </NavLink>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Download certificate"
                  >
                    <FiDownload size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {Array.isArray(wonItems) && wonItems.length > maxItems && (
        <div className="mt-6 text-center">
          <NavLink
            to="/antiques"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View all {wonItems.length} won items
            <FiArrowRight size={16} />
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default WonItems;
