import React, { useState, useEffect } from 'react';

const AntiqueFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    auctionType: '',
    era: '',
    condition: '',
    priceMin: '',
    priceMax: '',
    authenticity: '',
    status: '',
    search: '',
    ...initialFilters
  });

  const eraOptions = [
    'Ancient', 'Medieval', 'Renaissance', 'Baroque', 'Georgian', 
    'Victorian', 'Edwardian', 'Art Nouveau', 'Art Deco', 
    'Mid-Century Modern', 'Contemporary', 'Other'
  ];

  const conditionOptions = [
    'Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Restoration Required'
  ];

  const auctionTypeOptions = [
    { value: 'Timed', label: 'Timed Auction' },
    { value: 'Live', label: 'Live Auction' },
    { value: 'Buy Now', label: 'Buy Now' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active Auctions' },
    { value: 'upcoming', label: 'Upcoming Auctions' },
    { value: 'ended', label: 'Ended Auctions' }
  ];

  const authenticityOptions = [
    { value: 'Verified', label: 'Verified Authentic' },
    { value: 'Pending', label: 'Pending Verification' },
    { value: 'Unverified', label: 'Unverified' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category/hierarchy');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      auctionType: '',
      era: '',
      condition: '',
      priceMin: '',
      priceMax: '',
      authenticity: '',
      status: '',
      search: ''
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <span>🔍</span>
            <span className="font-medium">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1"
            >
              <span>✖️</span>
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search antiques, makers, styles..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <optgroup key={category._id} label={category.title}>
                  <option value={category._id}>{category.title}</option>
                  {category.subcategories?.map(sub => (
                    <option key={sub._id} value={sub._id}>
                      &nbsp;&nbsp;{sub.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Auction Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Type
              </label>
              <select
                value={filters.auctionType}
                onChange={(e) => handleFilterChange('auctionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {auctionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Era and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Era
              </label>
              <select
                value={filters.era}
                onChange={(e) => handleFilterChange('era', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Eras</option>
                {eraOptions.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                {conditionOptions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                placeholder="Min Price"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                placeholder="Max Price"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Authenticity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authenticity
            </label>
            <select
              value={filters.authenticity}
              onChange={(e) => handleFilterChange('authenticity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Items</option>
              {authenticityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntiqueFilters;
