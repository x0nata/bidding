import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../redux/slices/productSlice';
import { Container, Title, Caption } from '../common/Design';
import { AuctionCard } from '../home/AuctionCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { MdClear } from 'react-icons/md';

export const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { products, isLoading } = useSelector((state) => state.product);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filteredResults, setFilteredResults] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults([]);
      return;
    }

    const filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase();

      // Helper function to safely check string fields
      const safeStringIncludes = (field) => {
        return field && typeof field === 'string' && field.toLowerCase().includes(searchLower);
      };

      // Helper function to safely check array fields
      const safeArrayIncludes = (array) => {
        return Array.isArray(array) && array.some(item =>
          item && typeof item === 'string' && item.toLowerCase().includes(searchLower)
        );
      };

      return (
        safeStringIncludes(product.title) ||
        safeStringIncludes(product.description) ||
        safeStringIncludes(product.category) ||
        safeStringIncludes(product.era) ||
        safeStringIncludes(product.maker) ||
        safeStringIncludes(product.style) ||
        safeStringIncludes(product.condition) ||
        safeStringIncludes(product.provenance) ||
        safeArrayIncludes(product.materials) ||
        safeArrayIncludes(product.techniques)
      );
    });

    // Sort results
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.currentBid || a.startingBid || 0) - (b.currentBid || b.startingBid || 0);
        case 'price-high':
          return (b.currentBid || b.startingBid || 0) - (a.currentBid || a.startingBid || 0);
        case 'ending-soon':
          return new Date(a.auctionEndDate) - new Date(b.auctionEndDate);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default: // relevance
          return 0;
      }
    });

    setFilteredResults(sorted);
  }, [products, searchTerm, sortBy]);

  // Load products on component mount
  useEffect(() => {
    dispatch(getAllProducts({ limit: 100 }));
  }, [dispatch]);

  // Update search term from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== searchTerm) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
    navigate('/');
  };

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <Container className="py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Title level={1} className="text-2xl md:text-3xl font-bold text-gray-800">
              Search Results
            </Title>
            <button
              onClick={handleClearSearch}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <MdClear size={20} />
              <span>Clear & Go Home</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="text-gray-400" size={20} />
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 text-gray-800 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Search antiques, vintage items, collectibles..."
              />
            </div>
          </form>

          {/* Results Info & Controls */}
          {searchTerm && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Caption className="text-gray-600">
                {isLoading ? 'Searching...' : `${filteredResults.length} results for "${searchTerm}"`}
              </Caption>
              
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiList size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16">
            <LoadingSpinner size="large" />
            <Caption className="mt-4 text-gray-600">Searching...</Caption>
          </div>
        ) : !searchTerm.trim() ? (
          <EmptyState
            icon={FiSearch}
            title="Start Your Search"
            description="Enter a search term above to find antiques, vintage items, and collectibles."
          />
        ) : filteredResults.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredResults.map((item) => (
              <AuctionCard 
                key={item._id} 
                auction={item}
                showSellerName={true}
                showCountdown={true}
                variant={viewMode === 'list' ? 'featured' : 'default'}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FiSearch}
            title="No Results Found"
            description={`No items found for "${searchTerm}". Try different keywords or browse our categories.`}
            actionText="Browse All Items"
            onAction={() => navigate('/auctions')}
          />
        )}
      </Container>
    </div>
  );
};

export default SearchResults;
