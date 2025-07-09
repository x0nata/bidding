import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, getActiveAuctions } from '../../redux/slices/productSlice';
import { getAllCategories } from '../../redux/slices/categorySlice';
import { Title, Caption, Container } from '../../components/common/Design';
import { AuctionCard } from '../../components/home/AuctionCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FiFilter, FiGrid, FiList, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { MdGavel, MdTrendingUp } from 'react-icons/md';

export const UserAuctions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, activeAuctions, isLoading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    sortBy: 'newest',
    search: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);

  // Get all user auctions
  const getAllUserAuctions = () => {
    const allAuctions = [...products, ...activeAuctions];
    const uniqueAuctions = allAuctions.filter((auction, index, self) => 
      index === self.findIndex(a => a._id === auction._id)
    );

    return uniqueAuctions.filter(auction => 
      !auction.isSoldout && auction.auctionEndDate && new Date(auction.auctionEndDate) > new Date()
    );
  };

  // Apply filters
  const applyFilters = () => {
    let auctions = getAllUserAuctions();

    // Category filter
    if (filters.category !== 'all') {
      auctions = auctions.filter(auction => 
        auction.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      auctions = auctions.filter(auction => {
        const now = new Date();
        const endDate = new Date(auction.auctionEndDate);
        const startDate = new Date(auction.auctionStartDate || auction.createdAt);
        
        switch (filters.status) {
          case 'live':
            return now >= startDate && now < endDate;
          case 'upcoming':
            return now < startDate;
          case 'ending-soon':
            const hoursUntilEnd = (endDate - now) / (1000 * 60 * 60);
            return hoursUntilEnd <= 24 && now < endDate;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      auctions = auctions.filter(auction =>
        auction.title?.toLowerCase().includes(searchTerm) ||
        auction.description?.toLowerCase().includes(searchTerm) ||
        auction.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'ending-soon':
        auctions.sort((a, b) => new Date(a.auctionEndDate) - new Date(b.auctionEndDate));
        break;
      case 'price-high':
        auctions.sort((a, b) => (b.currentBid || b.startingBid || 0) - (a.currentBid || a.startingBid || 0));
        break;
      case 'price-low':
        auctions.sort((a, b) => (a.currentBid || a.startingBid || 0) - (b.currentBid || b.startingBid || 0));
        break;
      case 'popular':
        auctions.sort((a, b) => (b.totalBids || 0) - (a.totalBids || 0));
        break;
      default: // newest
        auctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredAuctions(auctions);
  };

  // Load data
  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getActiveAuctions());
    dispatch(getAllCategories());
  }, [dispatch]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [products, activeAuctions, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getAllProducts()),
      dispatch(getActiveAuctions())
    ]);
    setRefreshing(false);
  };

  return (
    <div className="pt-32">
      <Container className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full">
            <MdGavel className="text-2xl text-white" />
          </div>
          <Title level={1} className="text-4xl font-bold text-gray-900">
            User Auctions
          </Title>
        </div>
        <Caption className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse all active auctions from our community of collectors and dealers
        </Caption>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <MdTrendingUp className="text-3xl text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{filteredAuctions.length}</div>
          <Caption className="text-gray-600">Active Auctions</Caption>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <MdGavel className="text-3xl text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {filteredAuctions.filter(a => a.totalBids > 0).length}
          </div>
          <Caption className="text-gray-600">With Bids</Caption>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FiRefreshCw className="text-3xl text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {filteredAuctions.filter(a => {
              const hoursUntilEnd = (new Date(a.auctionEndDate) - new Date()) / (1000 * 60 * 60);
              return hoursUntilEnd <= 24;
            }).length}
          </div>
          <Caption className="text-gray-600">Ending Soon</Caption>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="upcoming">Upcoming</option>
              <option value="ending-soon">Ending Soon</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            >
              <option value="newest">Newest First</option>
              <option value="ending-soon">Ending Soon</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* View Mode and Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <FiList />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && filteredAuctions.length === 0 ? (
        <div className="text-center py-16">
          <LoadingSpinner size="large" />
          <Caption className="mt-4 text-gray-600">Loading auctions...</Caption>
        </div>
      ) : filteredAuctions.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredAuctions.map((auction) => (
            <AuctionCard 
              key={auction._id} 
              auction={auction}
              showSellerName={true}
              showCountdown={true}
              variant={viewMode === 'list' ? 'featured' : 'default'}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="products"
          title="No Auctions Found"
          subtitle="No auctions match your current filters. Try adjusting your search criteria or browse all categories."
          actionText="Create Your First Listing"
          actionLink="/add-product"
        />
      )}
      </Container>
    </div>
  );
};

export default UserAuctions;
