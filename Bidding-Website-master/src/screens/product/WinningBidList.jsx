import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { getWonProducts } from '../../redux/slices/productSlice';
import { showError } from '../../redux/slices/notificationSlice';
import { MdVerified, MdDownload, MdRemoveRedEye } from 'react-icons/md';
import { FiAward, FiDollarSign, FiCalendar, FiRefreshCw, FiEye } from 'react-icons/fi';
import { RiAuctionFill } from 'react-icons/ri';
import { BsCollection } from 'react-icons/bs';
import { formatETB } from '../../utils/currency';
import { useBalanceUpdates } from '../../hooks/useBalanceUpdates';

export const WinningBidList = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wonProducts, isLoading } = useSelector((state) => state.product);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('auctionEndDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Balance integration
  const { balanceInfo, formatAmount } = useBalanceUpdates();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWonItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const fetchWonItems = async () => {
    try {
      setLoading(true);
      await dispatch(getWonProducts()).unwrap();
    } catch (error) {
      dispatch(showError('Failed to load your won items'));
    } finally {
      setLoading(false);
    }
  };

  const refreshWonItems = async () => {
    try {
      setRefreshing(true);
      await dispatch(getWonProducts()).unwrap();
    } catch (error) {
      dispatch(showError('Failed to refresh won items'));
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Filter and sort won items
  const filteredItems = Array.isArray(wonProducts) ? wonProducts.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'auctionEndDate' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  // Calculate statistics
  const stats = {
    totalWonItems: filteredItems.length,
    totalSpent: filteredItems.reduce((sum, item) => sum + (item.currentBid || item.price || 0), 0),
    averageWinningBid: filteredItems.length > 0 ?
      filteredItems.reduce((sum, item) => sum + (item.currentBid || item.price || 0), 0) / filteredItems.length : 0,
    currentBalance: balanceInfo.availableBalance || 0
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
          <Body>Loading your won items...</Body>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <FiAward className="mx-auto text-gray-400 text-6xl mb-4" />
          <Title level={4} className="text-gray-600 mb-2">Login Required</Title>
          <Body className="text-gray-500 mb-6">Please log in to view your won auction items.</Body>
          <NavLink
            to="/login"
            className="bg-green text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors inline-block"
          >
            Log In
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Title level={2} className="mb-2 flex items-center gap-3">
            <FiAward className="text-green" />
            Won Items
          </Title>
          <Body className="text-gray-600">
            Antiques you've successfully won at auction - Horn of Antiques collection.
          </Body>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshWonItems}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
          >
            <FiRefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{stats.totalWonItems}</Title>
              <Body className="text-gray-600 text-sm">Items Won</Body>
            </div>
            <FiAward className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-blue-600">{formatETB(stats.totalSpent)}</Title>
              <Body className="text-gray-600 text-sm">Total Spent</Body>
            </div>
            <FiDollarSign className="text-blue-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-purple-600">{formatETB(Math.round(stats.averageWinningBid))}</Title>
              <Body className="text-gray-600 text-sm">Avg Win Price</Body>
            </div>
            <BsCollection className="text-purple-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-orange-600">{formatETB(stats.currentBalance)}</Title>
              <Body className="text-gray-600 text-sm">Current Balance</Body>
            </div>
            <FiDollarSign className="text-orange-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search won items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="auctionEndDate-desc">Recently Won</option>
            <option value="auctionEndDate-asc">Oldest First</option>
            <option value="currentBid-desc">Highest Price</option>
            <option value="currentBid-asc">Lowest Price</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
            <Body className="text-gray-600">
              {filteredItems.length} won items
            </Body>
          </div>
        </div>
      </div>

      {/* Won Items Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {currentItems.length === 0 ? (
          <div className="p-8 text-center">
            <FiAward size={64} className="mx-auto mb-4 text-gray-300" />
            <Title level={4} className="mb-2">No won items found</Title>
            <Body className="text-gray-600 mb-6">
              {searchTerm
                ? `No won items match "${searchTerm}". Try adjusting your search.`
                : "You haven't won any auctions yet. Start bidding on amazing antiques!"
              }
            </Body>
            <NavLink
              to="/"
              className="bg-green text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors inline-block"
            >
              Browse Auctions
            </NavLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {currentItems.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
                {/* Item Image */}
                <div className="relative mb-4">
                  <img
                    src={item.image?.url || item.image || '/images/placeholder.jpg'}
                    alt={item.title || 'Won item'}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  {item.authenticity?.status === 'Verified' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <MdVerified size={16} />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-green bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium">
                    WON
                  </div>
                </div>

                {/* Item Details */}
                <div className="space-y-3">
                  <div>
                    <NavLink
                      to={`/details/${item._id}`}
                      className="hover:text-green transition-colors"
                    >
                      <Title level={5} className="font-medium text-gray-800 mb-1 line-clamp-2">
                        {item.title}
                      </Title>
                    </NavLink>
                    {item.category && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Condition */}
                  {item.condition && (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                    </div>
                  )}

                  {/* Winning Bid */}
                  <div className="flex items-center gap-1">
                    <FiDollarSign size={14} className="text-green" />
                    <Body className="text-green font-semibold">
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
                      <MdDownload size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredItems.length)}</span> of{' '}
                    <span className="font-medium">{filteredItems.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-green border-green text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
