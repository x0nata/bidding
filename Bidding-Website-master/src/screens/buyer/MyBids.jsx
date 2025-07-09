import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { getUserBids } from '../../redux/slices/biddingSlice';
import { showError } from '../../redux/slices/notificationSlice';
import { MdOutlineGavel, MdTrendingUp, MdTrendingDown, MdCheckCircle, MdCancel, MdRefresh } from 'react-icons/md';
import { FiClock, FiDollarSign, FiEye, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import { RiAuctionFill } from 'react-icons/ri';
import { BsCheckCircle, BsXCircle, BsGraphUp, BsGraphDown } from 'react-icons/bs';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import { formatETB } from '../../utils/currency';
import { useBalanceUpdates } from '../../hooks/useBalanceUpdates';

const MyBids = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Use real bids from Redux store (same as dashboard)
  const { userBids: bids, isLoading: bidsLoading, error: bidsError } = useSelector(state => state.bidding);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('bidTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [bidsPerPage] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Balance integration for bid validation
  const { balanceInfo, hasSufficientBalance, formatAmount } = useBalanceUpdates();



  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyBids();
    } else {
      setLoading(false); // Stop loading if not authenticated
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterAndSortBids();
  }, [bids, searchTerm, filterStatus, sortBy, sortOrder]);

  // Update loading state based on Redux state
  useEffect(() => {
    setLoading(bidsLoading);
  }, [bidsLoading]);

  // Auto-refresh every 30 seconds for active bids
  useEffect(() => {
    if (autoRefresh && bids.some(bid => {
      const status = (bid.bidStatus || bid.status || '').toLowerCase();
      return status === 'active' || status === 'winning';
    })) {
      const interval = setInterval(() => {
        refreshBids();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, bids]);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      // Fetch real bids from API (same endpoint as dashboard)
      await dispatch(getUserBids()).unwrap();
    } catch (error) {
      dispatch(showError('Failed to load your bids'));
    } finally {
      setLoading(false);
    }
  };

  const refreshBids = async () => {
    try {
      setRefreshing(true);
      // Refresh real bids from API (same as dashboard)
      await dispatch(getUserBids()).unwrap();
    } catch (error) {
      dispatch(showError('Failed to refresh bids'));
    } finally {
      setRefreshing(false);
    }
  };

  const filterAndSortBids = () => {
    // Handle case when bids is empty or undefined
    if (!Array.isArray(bids) || bids.length === 0) {
      setFilteredBids([]);
      setCurrentPage(1);
      return;
    }

    let filtered = bids.filter(bid => {
      // Add null/undefined check for bid object
      if (!bid || typeof bid !== 'object') {
        return false;
      }

      const matchesSearch = (bid.product?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (bid.product?.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (bid.product?.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const bidStatus = bid.bidStatus || bid.status || '';
      const matchesStatus = filterStatus === 'all' || bidStatus.toLowerCase() === filterStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort bids with defensive programming
    filtered.sort((a, b) => {
      // Add null/undefined checks for sort values
      let aValue = a && a[sortBy] !== undefined ? a[sortBy] : '';
      let bValue = b && b[sortBy] !== undefined ? b[sortBy] : '';

      // Handle date fields
      if (sortBy === 'bidTime') {
        aValue = a?.createdAt ? new Date(a.createdAt) : new Date(0);
        bValue = b?.createdAt ? new Date(b.createdAt) : new Date(0);
      } else if (sortBy === 'auctionEndTime') {
        aValue = a?.product?.endDate ? new Date(a.product.endDate) : new Date(0);
        bValue = b?.product?.endDate ? new Date(b.product.endDate) : new Date(0);
      } else if (sortBy === 'bidAmount') {
        aValue = a?.price || a?.amount || 0;
        bValue = b?.price || b?.amount || 0;
      } else if (sortBy === 'currentHighestBid') {
        aValue = a?.product?.currentBid || a?.product?.price || 0;
        bValue = b?.product?.currentBid || b?.product?.price || 0;
      }

      // Handle null/undefined values in comparison
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBids(filtered);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    // Add null/undefined check
    if (!status || typeof status !== 'string') {
      return 'bg-gray-100 text-gray-800';
    }

    switch (status) {
      case 'winning':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'won':
        return 'bg-blue-100 text-blue-800';
      case 'outbid':
        return 'bg-orange-100 text-orange-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    // Add null/undefined check
    if (!status || typeof status !== 'string') {
      return null;
    }

    switch (status) {
      case 'winning':
      case 'active':
        return <MdTrendingUp className="mr-1" />;
      case 'won':
        return <MdCheckCircle className="mr-1" />;
      case 'outbid':
        return <MdTrendingDown className="mr-1" />;
      case 'lost':
        return <MdCancel className="mr-1" />;
      default:
        return null;
    }
  };

  // Helper function to safely format status text
  const formatStatusText = (status) => {
    if (!status || typeof status !== 'string') {
      return 'Unknown';
    }

    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'winning':
        return 'Winning';
      case 'outbid':
        return 'Outbid';
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      case 'ended':
        return 'Ended';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Helper function to check if auction has ended
  const isAuctionEnded = (endTime) => {
    if (!endTime) return false;
    try {
      const now = new Date();
      const end = new Date(endTime);
      return end <= now;
    } catch (error) {
      return false;
    }
  };

  // Helper function to safely access bid properties (including nested properties)
  const safeBidProperty = (bid, property, defaultValue = '') => {
    if (!bid || typeof bid !== 'object') {
      return defaultValue;
    }

    // Handle nested properties like 'product.title'
    const keys = property.split('.');
    let value = bid;

    for (const key of keys) {
      if (value && typeof value === 'object' && value[key] !== undefined && value[key] !== null) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  };

  const formatTimeRemaining = (endTime) => {
    // Add null/undefined check
    if (!endTime) return 'Unknown';

    try {
      const now = new Date();
      const end = new Date(endTime);

      // Check if date is valid
      if (isNaN(end.getTime())) return 'Invalid Date';

      const diff = end - now;

      if (diff <= 0) return 'Ended';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getTimeRemainingColor = (endTime) => {
    // Add null/undefined check
    if (!endTime) return 'text-gray-600';

    try {
      const now = new Date();
      const end = new Date(endTime);

      // Check if date is valid
      if (isNaN(end.getTime())) return 'text-gray-600';

      const diff = end - now;
      const hours = diff / (1000 * 60 * 60);

      if (hours <= 1) return 'text-red-600';
      if (hours <= 24) return 'text-orange-600';
      return 'text-gray-600';
    } catch (error) {
      return 'text-gray-600';
    }
  };

  // Calculate statistics using same logic as dashboard
  const getActiveUserBids = () => {
    if (!Array.isArray(bids)) return 0;
    return bids.filter(bid => {
      const status = bid.bidStatus || bid.status || '';
      const normalizedStatus = status.toLowerCase();
      return normalizedStatus === "active" ||
             normalizedStatus === "winning" ||
             bid.isWinningBid === true;
    }).length;
  };

  const getWonBids = () => {
    if (!Array.isArray(bids)) return 0;
    return bids.filter(bid => {
      const status = bid.bidStatus || bid.status || '';
      const normalizedStatus = status.toLowerCase();
      return normalizedStatus === "won" || normalizedStatus === "completed";
    }).length;
  };

  const getTotalBidsValue = () => {
    if (!Array.isArray(bids)) return 0;
    return bids.reduce((total, bid) => total + (bid.price || bid.amount || 0), 0);
  };

  const stats = {
    totalBids: Array.isArray(bids) ? bids.length : 0,
    activeBids: getActiveUserBids(),
    wonAuctions: getWonBids(),
    totalBidsValue: getTotalBidsValue(),
    currentBalance: balanceInfo.availableBalance || 0
  };

  // Pagination
  const indexOfLastBid = currentPage * bidsPerPage;
  const indexOfFirstBid = indexOfLastBid - bidsPerPage;
  const currentBids = filteredBids.slice(indexOfFirstBid, indexOfLastBid);
  const totalPages = Math.ceil(filteredBids.length / bidsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
          <Body>Loading your bids...</Body>
        </div>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RiAuctionFill className="mx-auto text-gray-400 text-6xl mb-4" />
          <Title level={4} className="text-gray-600 mb-2">Login Required</Title>
          <Body className="text-gray-500 mb-6">Please log in to view your bidding activity and auction history.</Body>
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
            <MdOutlineGavel className="text-green" />
            My Bids
          </Title>
          <Body className="text-gray-600">
            Track all your bidding activity and auction results.
          </Body>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiRefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Auto Refresh</span>
          </button>
          <button
            onClick={refreshBids}
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
              <Title level={1} className="text-green">{stats.totalBids}</Title>
              <Body className="text-gray-600 text-sm">Total Bids</Body>
            </div>
            <RiAuctionFill className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-blue-600">{stats.activeBids}</Title>
              <Body className="text-gray-600 text-sm">Active</Body>
            </div>
            <FiClock className="text-blue-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{stats.wonAuctions}</Title>
              <Body className="text-gray-600 text-sm">Won</Body>
            </div>
            <MdCheckCircle className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{formatETB(stats.totalBidsValue)}</Title>
              <Body className="text-gray-600 text-sm">Total Bid Value</Body>
            </div>
            <FiDollarSign className="text-green text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bids..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="winning">Winning</option>
            <option value="outbid">Outbid</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

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
            <option value="bidTime-desc">Newest First</option>
            <option value="bidTime-asc">Oldest First</option>
            <option value="bidAmount-desc">Highest Bid</option>
            <option value="bidAmount-asc">Lowest Bid</option>
            <option value="auctionEndTime-asc">Ending Soon</option>
            <option value="currentHighestBid-desc">Highest Current</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
            <Body className="text-gray-600">
              {filteredBids.length} of {bids.length} bids
            </Body>
          </div>
        </div>
      </div>

      {/* Bids List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {currentBids.length === 0 ? (
          <div className="p-8 text-center">
            <RiAuctionFill size={64} className="mx-auto mb-4 text-gray-300" />
            <Title level={4} className="mb-2">No bids found</Title>
            <Body className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? "You haven't placed any bids yet. Start bidding on amazing antiques!"
                : `No ${filterStatus} bids found. Try adjusting your filters.`
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
          <div className="divide-y divide-gray-200">
            {currentBids.map((bid) => {
              // Add defensive check for bid object
              if (!bid || typeof bid !== 'object') {
                return null;
              }

              return (
              <div key={safeBidProperty(bid, 'id', Math.random())} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {safeBidProperty(bid, 'product.images.0') ? (
                        <img
                          src={safeBidProperty(bid, 'product.images.0')}
                          alt={safeBidProperty(bid, 'product.title', 'Auction Item')}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center" style={{ display: safeBidProperty(bid, 'product.images.0') ? 'none' : 'flex' }}>
                        <RiAuctionFill className="text-gray-500 text-2xl" />
                      </div>
                    </div>
                    {((safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')) === 'lost' || (safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')) === 'won') && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')) === 'won' ? 'WON' : 'ENDED'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bid Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <NavLink
                          to={`/details/${safeBidProperty(bid, 'product._id', '#')}`}
                          className="hover:text-green transition-colors"
                        >
                          <Title level={5} className="font-medium text-gray-800 mb-1">
                            {safeBidProperty(bid, 'product.title', 'Untitled Item')}
                          </Title>
                        </NavLink>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                            {safeBidProperty(bid, 'product.category', 'Uncategorized')}
                          </span>
                          <span className="text-gray-500 text-sm">by {safeBidProperty(bid, 'product.seller.name', 'Unknown Seller')}</span>
                        </div>
                        <Body className="text-gray-600 text-sm line-clamp-2">
                          {safeBidProperty(bid, 'product.description', 'No description available')}
                        </Body>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status'))}`}>
                        {getStatusIcon(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status'))}
                        {formatStatusText(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status'))}
                      </span>
                    </div>

                    {/* Bid Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-green" />
                        <div>
                          <Caption className="text-gray-500">Your Bid</Caption>
                          <div className="font-medium text-gray-900">{formatETB(safeBidProperty(bid, 'price', 0) || safeBidProperty(bid, 'amount', 0))}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MdTrendingUp className="text-blue-500" />
                        <div>
                          <Caption className="text-gray-500">Current High</Caption>
                          <div className="font-medium text-gray-900">{formatETB(safeBidProperty(bid, 'product.currentBid', 0) || safeBidProperty(bid, 'product.price', 0))}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiClock className={getTimeRemainingColor(safeBidProperty(bid, 'product.endDate'))} />
                        <div>
                          <Caption className="text-gray-500">Time Left</Caption>
                          <div className={`font-medium ${getTimeRemainingColor(safeBidProperty(bid, 'product.endDate'))}`}>
                            {formatTimeRemaining(safeBidProperty(bid, 'product.endDate'))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <BsGraphUp className="text-purple-500" />
                        <div>
                          <Caption className="text-gray-500">Total Bids</Caption>
                          <div className="font-medium text-gray-900">{safeBidProperty(bid, 'product.totalBids', 0)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div>
                          <Caption className="text-gray-500">Bid Date</Caption>
                          <div className="font-medium text-gray-900">
                            {safeBidProperty(bid, 'createdAt') ? new Date(safeBidProperty(bid, 'createdAt')).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info for Won/Lost Auctions */}
                    {((safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')) === 'won' || (safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')) === 'lost') && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Caption className="text-gray-500">Final Price</Caption>
                            <div className="font-medium text-gray-900">{formatETB(safeBidProperty(bid, 'product.currentBid', 0) || safeBidProperty(bid, 'price', 0))}</div>
                          </div>
                          {(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')) === 'won' ? (
                            <div>
                              <Caption className="text-gray-500">You Won!</Caption>
                              <div className="font-medium text-green">Congratulations!</div>
                            </div>
                          ) : (
                            <div>
                              <Caption className="text-gray-500">Winner</Caption>
                              <div className="font-medium text-gray-900">{safeBidProperty(bid, 'product.winner.name', 'Unknown')}</div>
                            </div>
                          )}
                          <div>
                            <Caption className="text-gray-500">Reserve Met</Caption>
                            <div className={`font-medium ${safeBidProperty(bid, 'product.reserveMet', false) ? 'text-green' : 'text-red-600'}`}>
                              {safeBidProperty(bid, 'product.reserveMet', false) ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Next Minimum Bid for Active Auctions */}
                    {(() => {
                      const status = (safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')).toLowerCase();
                      return (status === 'active' || status === 'winning' || status === 'outbid');
                    })() && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Caption className="text-blue-700">Next Minimum Bid</Caption>
                            <div className="font-medium text-blue-900">{formatETB(safeBidProperty(bid, 'product.nextMinBid', 0) || (safeBidProperty(bid, 'product.currentBid', 0) + 50))}</div>
                          </div>
                          <div className="text-right">
                            <Caption className="text-blue-700">Current Bid</Caption>
                            <div className="font-medium text-blue-900">{formatETB(safeBidProperty(bid, 'product.currentBid', 0))}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <NavLink
                          to={`/details/${safeBidProperty(bid, 'product._id', '#')}`}
                          className="bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors text-sm flex items-center gap-2"
                        >
                          <FiEye size={16} />
                          View Auction
                        </NavLink>

                        {(() => {
                          const status = (safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')).toLowerCase();
                          return (status === 'active' || status === 'winning' || status === 'outbid');
                        })() && (
                          <NavLink
                            to={`/details/${safeBidProperty(bid, 'product._id', '#')}#bidding`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <RiAuctionFill size={16} />
                            {(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')).toLowerCase() === 'outbid' ? 'Bid Again' : 'Increase Bid'}
                          </NavLink>
                        )}


                      </div>

                      {/* Bid Status Indicator */}
                      <div className="text-right">
                        {(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')).toLowerCase() === 'outbid' && (
                          <div className="text-orange-600 text-sm font-medium">
                            Outbid by {formatETB(Math.max(0, (safeBidProperty(bid, 'product.currentBid', 0) - (safeBidProperty(bid, 'price', 0) || safeBidProperty(bid, 'amount', 0)))))}
                          </div>
                        )}
                        {(safeBidProperty(bid, 'bidStatus') || safeBidProperty(bid, 'status')).toLowerCase() === 'winning' && (
                          <div className="text-green text-sm font-medium">
                            Currently Winning
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
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
                    Showing <span className="font-medium">{indexOfFirstBid + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastBid, filteredBids.length)}</span> of{' '}
                    <span className="font-medium">{filteredBids.length}</span> results
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

export default MyBids;
