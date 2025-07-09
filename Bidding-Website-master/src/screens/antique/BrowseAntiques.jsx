import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AntiqueCard from '../../components/antique/AntiqueCard';
import AntiqueFilters from '../../components/antique/AntiqueFilters';
import { LoadingSpinner, EmptyState, Pagination } from '../../components/common/CommonUI';
import { useSearchAndFilter, usePagination } from '../../utils/formHelpers';
import { fetchProducts } from '../../utils/dataFetching';

const BrowseAntiques = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Use common search and filter utilities
  const {
    searchTerm,
    setSearchTerm,
    filters,
    sortBy,
    setSortBy,
    updateFilter,
    clearFilters,
    buildQueryParams
  } = useSearchAndFilter({
    category: searchParams.get('category') || '',
    auctionType: searchParams.get('auctionType') || '',
    era: searchParams.get('era') || '',
    condition: searchParams.get('condition') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    authenticity: searchParams.get('authenticity') || '',
    status: searchParams.get('status') || 'active',
    search: searchParams.get('search') || ''
  });

  // Use common pagination utilities
  const {
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    updatePagination
  } = usePagination(1, 20);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'most-bids', label: 'Most Bids' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: page.toString(),
        limit: '20',
        sort: sortBy
      };

      const data = await fetchProducts(params);
      setProducts(data.products || []);
      updatePagination(data.pagination || {});
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, updatePagination]);

  useEffect(() => {
    loadProducts(currentPage);
  }, [loadProducts, currentPage]);

  useEffect(() => {
    // Update URL params when filters change
    const params = buildQueryParams();
    setSearchParams(params);
  }, [filters, searchTerm, sortBy, setSearchParams, buildQueryParams]);

  const handleFiltersChange = (newFilters) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      updateFilter(key, value);
    });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handlePageChange = (page) => {
    goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getResultsText = () => {
    if (loading) return 'Loading...';
    if (!pagination.totalProducts) return 'No antiques found';
    
    const start = (pagination.currentPage - 1) * 20 + 1;
    const end = Math.min(pagination.currentPage * 20, pagination.totalProducts);
    
    return `Showing ${start}-${end} of ${pagination.totalProducts} antiques`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Antiques</h1>
              <p className="text-gray-600 mt-2">Discover authentic antiques and collectibles</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <span>⊞</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <span>☰</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">↕️</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <AntiqueFilters 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{getResultsText()}</span>
                {pagination.totalPages > 1 && (
                  <span className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No antiques found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map(product => (
                  <AntiqueCard 
                    key={product._id} 
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    const showPage = page === 1 || 
                                   page === pagination.totalPages || 
                                   Math.abs(page - pagination.currentPage) <= 2;
                    
                    if (!showPage) {
                      if (page === pagination.currentPage - 3 || page === pagination.currentPage + 3) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseAntiques;
