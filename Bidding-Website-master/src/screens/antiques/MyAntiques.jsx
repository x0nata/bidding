import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption, Container } from '../../components/common/Design';
import { 
  FiAward, 
  FiDollarSign, 
  FiCalendar,
  FiEye,
  FiDownload,
  FiFilter,
  FiGrid,
  FiList,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import { MdVerified, MdGavel } from 'react-icons/md';
import { BsCollection, BsTrophy } from 'react-icons/bs';
import { getUserProducts, getWonProducts } from '../../redux/slices/productSlice';
import { formatETB } from '../../utils/currency';

export const MyAntiques = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userProducts, wonProducts, isLoading } = useSelector((state) => state.product);
  
  const [activeTab, setActiveTab] = useState('won');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    dispatch(getWonProducts());
    dispatch(getUserProducts());
  }, [dispatch]);

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
        return 'text-green-600 bg-green-100 border-green-200';
      case 'very good':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'good':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'fair':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'poor':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'ended':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'sold':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const filterAndSortItems = (items) => {
    let filtered = items.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterBy !== 'all') {
      filtered = filtered.filter(item => {
        switch (filterBy) {
          case 'verified':
            return item.authenticity?.status === 'Verified';
          case 'recent':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return new Date(item.createdAt) > oneMonthAgo;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-high':
          return (b.currentBid || b.biddingPrice || b.price || 0) - (a.currentBid || a.biddingPrice || a.price || 0);
        case 'price-low':
          return (a.currentBid || a.biddingPrice || a.price || 0) - (b.currentBid || b.biddingPrice || b.price || 0);
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });
  };

  const renderItemCard = (item, isWon = false) => (
    <div 
      key={item._id}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden 
        hover:shadow-md hover:border-gray-300 transition-all duration-200 group
        ${viewMode === 'list' ? 'flex' : ''}
      `}
    >
      {/* Item Image */}
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img
          src={item.image?.url || item.image || '/images/placeholder.jpg'}
          alt={item.title || 'Antique item'}
          className={`object-cover ${viewMode === 'list' ? 'w-full h-32' : 'w-full h-48'} group-hover:scale-105 transition-transform duration-300`}
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isWon && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <BsTrophy size={12} />
              Won
            </span>
          )}
          {item.authenticity?.status === 'Verified' && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <MdVerified size={12} />
              Verified
            </span>
          )}
        </div>

        {!isWon && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.isSoldout ? 'sold' : 'active')}`}>
              {item.isSoldout ? 'Sold' : 'Active'}
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className={`${viewMode === 'list' ? 'flex justify-between items-start' : 'space-y-3'}`}>
          <div className={viewMode === 'list' ? 'flex-1 pr-4' : ''}>
            <Title level={6} className="text-gray-800 font-medium line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {item.title || 'Unknown Item'}
            </Title>

            {/* Era and Condition */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {item.era && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  {item.era}
                </span>
              )}
              {item.condition && (
                <span className={`text-xs px-2 py-1 rounded-full border ${getConditionColor(item.condition)}`}>
                  {item.condition}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-1 mb-2">
              <FiDollarSign size={14} className="text-green-600" />
              <Body className="text-green-600 font-semibold">
                {formatETB(item.currentBid || item.biddingPrice || item.price || 0)}
              </Body>
              <Caption className="text-gray-500 ml-1">
                {isWon ? 'winning bid' : 'current price'}
              </Caption>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1">
              <FiCalendar size={14} className="text-gray-500" />
              <Caption className="text-gray-500">
                {isWon 
                  ? `Won ${formatDate(item.auctionEndDate || item.updatedAt)}`
                  : `Listed ${formatDate(item.createdAt)}`
                }
              </Caption>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-col' : 'pt-3'}`}>
            <NavLink
              to={`/details/${item._id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Details
            </NavLink>
            {isWon && (
              <button
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Download certificate"
              >
                <FiDownload size={16} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const currentItems = activeTab === 'won' ? wonProducts : userProducts;
  const filteredItems = filterAndSortItems(currentItems || []);

  return (
    <Container>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BsCollection size={24} className="text-blue-600" />
              </div>
              <div>
                <Title level={2} className="text-gray-800">My Antiques Collection</Title>
                <Caption className="text-gray-600">
                  Manage your won items and current listings
                </Caption>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <BsTrophy className="text-green-600" size={24} />
                  <div>
                    <Title level={4} className="text-gray-800">{wonProducts?.length || 0}</Title>
                    <Caption className="text-gray-600">Items Won</Caption>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <MdGavel className="text-blue-600" size={24} />
                  <div>
                    <Title level={4} className="text-gray-800">{userProducts?.length || 0}</Title>
                    <Caption className="text-gray-600">Active Listings</Caption>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <FiDollarSign className="text-purple-600" size={24} />
                  <div>
                    <Title level={4} className="text-gray-800">
                      ${((wonProducts || []).reduce((sum, item) => sum + (item.biddingPrice || item.currentBid || 0), 0)).toLocaleString()}
                    </Title>
                    <Caption className="text-gray-600">Total Value</Caption>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('won')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'won'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Won Items ({wonProducts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'listings'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                My Listings ({userProducts?.length || 0})
              </button>
            </div>

            {/* Filters and Controls */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Items</option>
                    <option value="verified">Verified Only</option>
                    <option value="recent">Recent (30 days)</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FiGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FiList size={16} />
                    </button>
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={() => {
                      dispatch(getWonProducts());
                      dispatch(getUserProducts());
                    }}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Refresh"
                  >
                    <FiRefreshCw size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'won' ? <BsTrophy size={24} className="text-gray-400" /> : <MdGavel size={24} className="text-gray-400" />}
              </div>
              <Title level={4} className="text-gray-600 mb-2">
                {activeTab === 'won' ? 'No won items yet' : 'No listings yet'}
              </Title>
              <Caption className="text-gray-500 mb-4">
                {activeTab === 'won' 
                  ? 'Win your first auction to see your collection here'
                  : 'Create your first listing to start selling'
                }
              </Caption>
              <NavLink 
                to={activeTab === 'won' ? '/' : '/add-product'}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {activeTab === 'won' ? 'Browse Auctions' : 'Create Listing'}
              </NavLink>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredItems.map(item => renderItemCard(item, activeTab === 'won'))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default MyAntiques;
