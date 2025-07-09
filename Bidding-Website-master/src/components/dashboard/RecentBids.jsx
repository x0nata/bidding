import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import {
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiArrowRight,
  FiEye,
  FiImage
} from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { formatETB } from '../../utils/currency';

// Enhanced Image Component with loading states
const BidItemImage = ({ product, bidId }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    setImageError(true);
    // Use a data URL for a simple gray placeholder to avoid 404 errors
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA3MEM4MCA2Ni42ODYzIDgzLjMxMzcgNjQgODcuNSA2NEgxMTIuNUMxMTYuNjg2IDY0IDEyMCA2Ni42ODYzIDEyMCA3MFY5MEMxMjAgOTMuMzEzNyAxMTYuNjg2IDk2IDExMi41IDk2SDg3LjVDODMuMzEzNyA5NiA4MCA5My4zMTM3IDgwIDkwVjcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTIwSDEyMEwxMDAgMTQwTDgwIDEyMEg2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
  };

  const getImageUrl = (product) => {
    // Use a data URL for placeholder to avoid 404 errors
    const placeholderDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA3MEM4MCA2Ni42ODYzIDgzLjMxMzcgNjQgODcuNSA2NEgxMTIuNUMxMTYuNjg2IDY0IDEyMCA2Ni42ODYzIDEyMCA3MFY5MEMxMjAgOTMuMzEzNyAxMTYuNjg2IDk2IDExMi41IDk2SDg3LjVDODMuMzEzNyA5NiA4MCA5My4zMTM3IDgwIDkwVjcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTIwSDEyMEwxMDAgMTQwTDgwIDEyMEg2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';

    if (!product) return placeholderDataUrl;

    // Handle different image data structures
    if (product.image) {
      // Cloudinary object structure
      if (product.image.filePath) {
        return product.image.filePath;
      }
      // Direct URL string
      if (typeof product.image === 'string') {
        return product.image;
      }
      // Object with url property
      if (product.image.url) {
        return product.image.url;
      }
      // Object with secure_url property (Cloudinary)
      if (product.image.secure_url) {
        return product.image.secure_url;
      }
    }

    // Handle legacy images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (firstImage.filePath) {
        return firstImage.filePath;
      }
      if (firstImage.url) {
        return firstImage.url;
      }
    }

    // Fallback to placeholder
    return placeholderDataUrl;
  };

  return (
    <div className="flex-shrink-0 relative">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {/* Loading placeholder */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <FiImage size={20} className="text-gray-400" />
          </div>
        )}

        {/* Error fallback */}
        {imageError && !imageLoading && (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FiImage size={20} className="text-gray-400" />
          </div>
        )}

        {/* Actual image */}
        <img
          src={getImageUrl(product)}
          alt={product?.title || 'Auction item'}
          className={`w-full h-full object-cover transition-all duration-200 hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export const RecentBids = ({
  bids = [],
  loading = false,
  error = null,
  onRefresh,
  maxItems = 5
}) => {
  const getBidStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'winning':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'outbid':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'won':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lost':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBidStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'winning':
        return <FiTrendingUp className="text-green-600" size={14} />;
      case 'outbid':
        return <FiTrendingDown className="text-red-600" size={14} />;
      case 'active':
        return <MdGavel className="text-blue-600" size={14} />;
      case 'won':
        return <FiTrendingUp className="text-emerald-600" size={14} />;
      case 'lost':
        return <FiTrendingDown className="text-gray-600" size={14} />;
      default:
        return <MdGavel className="text-gray-600" size={14} />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const bidDate = new Date(date);
    const diffInMinutes = Math.floor((now - bidDate) / (1000 * 60));

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
          <Title level={4} className="text-gray-800">Recent Bids</Title>
          <div className="animate-spin">
            <FiRefreshCw size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
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
          <Title level={4} className="text-gray-800">Recent Bids</Title>
          <Caption className="text-gray-600 mt-1">
            Track your latest bidding activity
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
            to="/my-bids" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All
            <FiArrowRight size={14} />
          </NavLink>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading bids</div>
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
      ) : !Array.isArray(bids) || bids.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdGavel size={24} className="text-gray-400" />
          </div>
          <Title level={5} className="text-gray-600 mb-2">No bids yet</Title>
          <Caption className="text-gray-500 mb-4">
            Start bidding on auctions to see your bids here
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
          {(Array.isArray(bids) ? bids : []).slice(0, maxItems).map((bid, index) => (
            <div
              key={bid._id || index}
              className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              {/* Product Image */}
              <BidItemImage product={bid.product} bidId={bid._id} />

              {/* Bid Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Title level={6} className="text-gray-800 font-medium truncate text-sm sm:text-base">
                      {bid.product?.title || 'Unknown Item'}
                    </Title>
                    <div className="flex items-center gap-2 mt-1">
                      <FiDollarSign size={14} className="text-green-600 flex-shrink-0" />
                      <Body className="text-green-600 font-semibold text-sm sm:text-base">
                        {formatETB(bid.price || bid.amount || 0)}
                      </Body>
                    </div>
                    <Caption className="text-gray-500 mt-1 text-xs sm:text-sm">
                      {formatTimeAgo(bid.createdAt)}
                    </Caption>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-4">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0
                      ${getBidStatusColor(bid.bidStatus || bid.status)}
                    `}>
                      {getBidStatusIcon(bid.bidStatus || bid.status)}
                      <span className="hidden sm:inline">
                        {(bid.bidStatus || bid.status || 'active').charAt(0).toUpperCase() +
                         (bid.bidStatus || bid.status || 'active').slice(1)}
                      </span>
                      <span className="sm:hidden">
                        {(bid.bidStatus || bid.status || 'active').charAt(0).toUpperCase()}
                      </span>
                    </span>

                    <NavLink
                      to={`/details/${bid.product?._id || bid.productId}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      title="View auction"
                    >
                      <FiEye size={14} className="text-gray-600" />
                    </NavLink>
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

export default RecentBids;
