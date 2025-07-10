import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { getUserProducts, updateProduct } from '../../redux/slices/productSlice';
import { showError, showSuccess, showWarning } from '../../redux/slices/notificationSlice';
import { FiDollarSign, FiCalendar, FiTrendingUp, FiPackage, FiEdit3, FiStopCircle, FiEye, FiClock, FiUsers } from 'react-icons/fi';
import { MdOutlineInventory, MdAnalytics } from 'react-icons/md';
import { RiAuctionFill } from 'react-icons/ri';
import { BsCheckCircle, BsClock } from 'react-icons/bs';
import axios from 'axios';

const SalesHistory = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { userProducts, loading, error } = useSelector((state) => state.product);
  
  const [filter, setFilter] = useState('all'); // all, sold, active, ended
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest
  const [dateRange, setDateRange] = useState('all'); // all, week, month, year

  // New state for enhanced features
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    startingBid: '',
    buyNowPrice: '',
    reservePrice: '',
    images: []
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getUserProducts());
    }
  }, [dispatch, isAuthenticated, user]);

  // Helper functions for auction management
  const getAuctionStatus = (product) => {
    const now = new Date();
    const endDate = new Date(product.auctionEndDate);

    if (product.auctionType === 'live') {
      return product.sold ? 'sold' : 'live';
    }

    if (product.sold) return 'sold';
    if (now > endDate) return 'ended';
    if (now < new Date(product.auctionStartDate)) return 'upcoming';
    return 'active';
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusBadge = (product) => {
    const status = getAuctionStatus(product);
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      live: { color: 'bg-blue-100 text-blue-800', label: 'Live' },
      ended: { color: 'bg-gray-100 text-gray-800', label: 'Ended' },
      sold: { color: 'bg-green-100 text-green-800', label: 'Sold' },
      upcoming: { color: 'bg-yellow-100 text-yellow-800', label: 'Upcoming' }
    };

    const config = statusConfig[status] || statusConfig.ended;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Action handlers
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title,
      description: product.description,
      startingBid: product.startingBid,
      buyNowPrice: product.buyNowPrice || '',
      reservePrice: product.reservePrice || '',
      images: []
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    setLoadingActions(prev => ({ ...prev, [editingProduct._id]: 'editing' }));

    try {
      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('description', editFormData.description);
      formData.append('startingBid', editFormData.startingBid);
      if (editFormData.buyNowPrice) formData.append('buyNowPrice', editFormData.buyNowPrice);
      if (editFormData.reservePrice) formData.append('reservePrice', editFormData.reservePrice);

      // Add new images if any
      editFormData.images.forEach(image => {
        formData.append('images', image);
      });

      await dispatch(updateProduct({ id: editingProduct._id, productData: formData })).unwrap();
      dispatch(showSuccess('Product updated successfully'));
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      dispatch(showError(error.message || 'Failed to update product'));
    } finally {
      setLoadingActions(prev => ({ ...prev, [editingProduct._id]: null }));
    }
  };

  const handleEndAuction = (product) => {
    setConfirmAction({
      type: 'endAuction',
      product,
      title: 'End Auction Early',
      message: `Are you sure you want to end the auction for "${product.title}" early? This action cannot be undone.`
    });
    setShowConfirmDialog(true);
  };

  const executeEndAuction = async (product) => {
    setLoadingActions(prev => ({ ...prev, [product._id]: 'ending' }));

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002/api';
      await axios.post(`${API_URL}/api/bidding/end/${product._id}`, {}, {
        withCredentials: true
      });

      dispatch(showSuccess('Auction ended successfully'));
      dispatch(getUserProducts()); // Refresh the list
    } catch (error) {
      dispatch(showError(error.response?.data?.message || 'Failed to end auction'));
    } finally {
      setLoadingActions(prev => ({ ...prev, [product._id]: null }));
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction?.type === 'endAuction') {
      executeEndAuction(confirmAction.product);
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = userProducts || [];

    // Apply filters
    switch (filter) {
      case 'sold':
        filtered = filtered.filter(product => product.sold || (product.isSoldout && product.currentBid > 0));
        break;
      case 'active':
        filtered = filtered.filter(product => {
          const status = getAuctionStatus(product);
          return status === 'active' || status === 'live';
        });
        break;
      case 'ended':
        filtered = filtered.filter(product => {
          const status = getAuctionStatus(product);
          return status === 'ended';
        });
        break;
      case 'unsold':
        filtered = filtered.filter(product => {
          const status = getAuctionStatus(product);
          return status === 'ended' && !product.sold;
        });
        break;
      default:
        break;
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(product => new Date(product.createdAt) >= cutoffDate);
    }

    // Apply sorting (create a copy to avoid mutating the original array)
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case 'oldest':
        sortedFiltered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        sortedFiltered.sort((a, b) => (b.currentBid || b.startingBid) - (a.currentBid || a.startingBid));
        break;
      case 'lowest':
        sortedFiltered.sort((a, b) => (a.currentBid || a.startingBid) - (b.currentBid || b.startingBid));
        break;
      default: // newest
        sortedFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return sortedFiltered;
  };

  const calculateStats = () => {
    const products = userProducts || [];
    const soldProducts = products.filter(p => getAuctionStatus(p) === 'sold');
    const totalRevenue = soldProducts.reduce((sum, p) => sum + (p.currentBid || p.finalPrice || 0), 0);
    const activeProducts = products.filter(p => {
      const status = getAuctionStatus(p);
      return status === 'active' || status === 'live';
    });

    return {
      totalListings: products.length,
      soldItems: soldProducts.length,
      activeListings: activeProducts.length,
      totalRevenue
    };
  };

  const stats = calculateStats();
  const filteredProducts = getFilteredAndSortedProducts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Body>Loading your sales history...</Body>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Title level={2} className="mb-4 text-red-600">Error Loading Sales History</Title>
          <Body className="mb-6">{error}</Body>
          <button
            onClick={() => dispatch(getUserProducts())}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="mb-2 flex items-center gap-3">
          <MdAnalytics className="text-primary" />
          Sales History
        </Title>
        <Body className="text-gray-600">
          Track your listing performance and sales analytics.
        </Body>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-blue-800">{stats.totalListings}</Title>
              <Caption className="text-blue-600">Total Listings</Caption>
            </div>
            <FiPackage size={40} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green-800">{stats.soldItems}</Title>
              <Caption className="text-green-600">Items Sold</Caption>
            </div>
            <BsCheckCircle size={40} className="text-green-500" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-orange-800">{stats.activeListings}</Title>
              <Caption className="text-orange-600">Active Listings</Caption>
            </div>
            <RiAuctionFill size={40} className="text-orange-500" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-purple-800">${stats.totalRevenue.toFixed(2)}</Title>
              <Caption className="text-purple-600">Total Revenue</Caption>
            </div>
            <FiDollarSign size={40} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Caption className="font-medium">Filter:</Caption>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'sold', label: 'Sold' },
                  { key: 'active', label: 'Active' },
                  { key: 'ended', label: 'Ended' },
                  { key: 'unsold', label: 'Unsold' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      filter === key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Caption className="font-medium">Period:</Caption>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Caption className="font-medium">Sort by:</Caption>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Price</option>
              <option value="lowest">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <MdOutlineInventory size={64} className="mx-auto mb-4 text-gray-300" />
            <Title level={4} className="mb-2">No products found</Title>
            <Body className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't listed any products yet. Start selling your antiques!"
                : `No ${filter} products found. Try adjusting your filters.`
              }
            </Body>
            <NavLink
              to="/add-product"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors inline-block"
            >
              List Your First Item
            </NavLink>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.image?.url || '/images/placeholder.jpg'}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {product.isSoldout && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">SOLD</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <NavLink 
                        to={`/details/${product._id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <Title level={5} className="font-medium">
                          {product.title}
                        </Title>
                      </NavLink>
                      {getStatusBadge(product)}
                    </div>

                    <Body className="text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </Body>

                    {/* Enhanced Product Info */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-green-500" />
                        <div>
                          <Caption className="text-gray-500">Starting Bid</Caption>
                          <div className="font-medium">${product.startingBid}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-blue-500" />
                        <div>
                          <Caption className="text-gray-500">Current Bid</Caption>
                          <div className="font-medium">${product.currentBid || product.startingBid}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiUsers className="text-purple-500" />
                        <div>
                          <Caption className="text-gray-500">Total Bids</Caption>
                          <div className="font-medium">{product.totalBids || 0}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiClock className="text-orange-500" />
                        <div>
                          <Caption className="text-gray-500">
                            {getAuctionStatus(product) === 'active' ? 'Time Left' : 'End Date'}
                          </Caption>
                          <div className="font-medium">
                            {getAuctionStatus(product) === 'active'
                              ? formatTimeRemaining(product.auctionEndDate)
                              : new Date(product.auctionEndDate).toLocaleDateString()
                            }
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-500" />
                        <div>
                          <Caption className="text-gray-500">Listed</Caption>
                          <div className="font-medium">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => window.open(`/details/${product._id}`, '_blank')}
                          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <FiEye size={16} />
                          View Details
                        </button>

                        {getAuctionStatus(product) !== 'sold' && (
                          <button
                            onClick={() => handleEditProduct(product)}
                            disabled={loadingActions[product._id] === 'editing'}
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
                          >
                            {loadingActions[product._id] === 'editing' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <FiEdit3 size={16} />
                            )}
                            Edit
                          </button>
                        )}

                        {(getAuctionStatus(product) === 'active' || getAuctionStatus(product) === 'live') && (
                          <button
                            onClick={() => handleEndAuction(product)}
                            disabled={loadingActions[product._id] === 'ending'}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                          >
                            {loadingActions[product._id] === 'ending' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <FiStopCircle size={16} />
                            )}
                            End Early
                          </button>
                        )}
                      </div>

                      {/* Revenue/Status Display */}
                      <div className="text-right">
                        {product.sold && (
                          <div className="text-green-600 font-medium">
                            Revenue: ${product.currentBid || product.finalPrice}
                          </div>
                        )}
                        {getAuctionStatus(product) === 'ended' && !product.sold && (
                          <div className="text-gray-500 font-medium">
                            No Sale
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Title level={3}>Edit Product</Title>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting Bid ($)
                    </label>
                    <input
                      type="number"
                      value={editFormData.startingBid}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, startingBid: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buy Now Price ($)
                    </label>
                    <input
                      type="number"
                      value={editFormData.buyNowPrice}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, buyNowPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reserve Price ($)
                    </label>
                    <input
                      type="number"
                      value={editFormData.reservePrice}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, reservePrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, images: Array.from(e.target.files) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Caption className="text-gray-500 mt-1">
                    Select new images to add to your listing (existing images will be kept)
                  </Caption>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loadingActions[editingProduct?._id] === 'editing'}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loadingActions[editingProduct?._id] === 'editing' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <Title level={4} className="mb-4">{confirmAction.title}</Title>
              <Body className="text-gray-600 mb-6">{confirmAction.message}</Body>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
