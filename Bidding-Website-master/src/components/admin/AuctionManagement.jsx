import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Title, Body } from '../../components/common/Design';
import { RiAuctionFill } from 'react-icons/ri';
import { HiOutlineSearch, HiOutlineDownload, HiOutlineClock } from 'react-icons/hi';
import { MdEdit, MdDelete, MdVisibility, MdCheckCircle, MdCancel, MdHistory, MdRefresh, MdPlayArrow, MdPause, MdStop } from 'react-icons/md';
import { FiEye, FiUsers } from 'react-icons/fi';
import { BsGraphUp } from 'react-icons/bs';
import { showSuccess, showError } from '../../redux/slices/notificationSlice';
import { adminAuctionApi } from '../../services/adminApi';
import { apiEndpoints } from '../../services/api';
// import websocketService from '../../services/websocket'; // Temporarily disabled

// Utility functions for status display
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'ended': return 'bg-purple-100 text-purple-800';
    case 'upcoming': return 'bg-indigo-100 text-indigo-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'active': return <MdPlayArrow className="text-green-600" />;
    case 'pending': return <MdPause className="text-yellow-600" />;
    case 'completed': return <MdCheckCircle className="text-blue-600" />;
    case 'ended': return <MdStop className="text-purple-600" />;
    case 'upcoming': return <HiOutlineClock className="text-indigo-600" />;
    case 'cancelled': return <MdCancel className="text-red-600" />;
    default: return <MdVisibility className="text-gray-600" />;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

const getApprovalStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AuctionManagement = () => {
  const dispatch = useDispatch();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [auctionsPerPage] = useState(10);
  const [selectedAuctions, setSelectedAuctions] = useState([]);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'bidHistory'
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    ended: 0
  });
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    requireReason: false,
    reasonPlaceholder: '',
    onConfirm: null
  });

  // Fetch auctions from enhanced backend API
  const fetchAuctions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        page: currentPage,
        limit: auctionsPerPage,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'All Categories' ? filterCategory : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      console.log('Fetching auctions with params:', queryParams);

      let response;
      try {
        // Try admin auction API first for complete auction management data
        try {
          response = await adminAuctionApi.getAllAuctions(queryParams);
          console.log('Admin auction API response:', response);
        } catch (adminApiError) {
          console.warn('Admin API failed, trying regular products API as fallback:', adminApiError);

          // Fallback to regular products API
          const productsResponse = await apiEndpoints.products.getAll(queryParams);
          console.log('Products API fallback response:', productsResponse);

          // Transform regular products to auction format for admin management
          if (productsResponse.data) {
            const products = Array.isArray(productsResponse.data.products) ? productsResponse.data.products :
                           Array.isArray(productsResponse.data) ? productsResponse.data : [];

            // Transform products to admin auction format
            const transformedAuctions = products.map(product => ({
              _id: product._id,
              title: product.title,
              description: product.description,
              category: product.category,
              seller: product.user || { name: 'Unknown', email: 'unknown@example.com' },
              auctionType: product.auctionType || 'Timed',
              startingBid: product.startingBid || product.price,
              reservePrice: product.reservePrice,
              instantPurchasePrice: product.instantPurchasePrice,
              currentPrice: product.currentBid || product.startingBid || product.price,
              finalPrice: product.finalPrice,
              auctionStartDate: product.auctionStartDate,
              auctionEndDate: product.auctionEndDate,
              status: product.auctionStatus || (product.isverify ? 'active' : 'pending'),
              isVerified: product.isverify,
              isSoldOut: product.isSoldout,
              bidCount: product.totalBids || 0,
              uniqueBidders: 0, // Not available in regular API
              highestBidder: null, // Not available in regular API
              soldTo: product.soldTo,
              image: product.image,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt
            }));

            response = {
              success: true,
              auctions: transformedAuctions,
              pagination: productsResponse.data.pagination || {
                currentPage: queryParams.page || 1,
                totalPages: Math.ceil(transformedAuctions.length / auctionsPerPage),
                totalCount: transformedAuctions.length,
                hasNext: false,
                hasPrev: false
              }
            };
          }
        }
      } catch (error) {
        console.error('All APIs failed:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }

      if (response && response.success) {
        const auctionsData = Array.isArray(response.auctions) ? response.auctions : [];
        console.log('Setting auctions data:', auctionsData.length, 'auctions found');
        console.log('📥 Setting auctions data:', auctionsData.length, 'auctions');
        console.log('📋 Auction data sample:', auctionsData.slice(0, 2).map(a => ({
          id: a._id,
          title: a.title,
          status: a.status,
          category: a.category,
          isVerified: a.isVerified,
          isSoldOut: a.isSoldOut
        })));
        setAuctions(auctionsData);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: auctionsData.length,
          hasNext: false,
          hasPrev: false
        });

        // Calculate stats based on actual auction status
        const newStats = {
          total: response.pagination?.totalCount || auctionsData.length,
          active: auctionsData.filter(a =>
            a.status === 'active' ||
            (a.isVerified && !a.isSoldOut && new Date(a.auctionEndDate) > new Date())
          ).length,
          completed: auctionsData.filter(a =>
            a.status === 'completed' || a.isSoldOut
          ).length,
          pending: auctionsData.filter(a =>
            a.status === 'pending' || !a.isVerified
          ).length,
          ended: auctionsData.filter(a =>
            a.status === 'ended' ||
            (!a.isSoldOut && new Date(a.auctionEndDate) < new Date())
          ).length
        };

        console.log('Calculated stats:', newStats);
        setStats(newStats);
      } else {
        // Handle case where response doesn't have success flag but has data
        if (response && Array.isArray(response)) {
          setAuctions(response);
          const newStats = {
            total: response.length,
            active: response.filter(a => a.status === 'active').length,
            completed: response.filter(a => a.status === 'completed').length,
            pending: response.filter(a => a.status === 'pending').length,
            ended: response.filter(a => a.status === 'ended').length
          };
          setStats(newStats);
        } else {
          setAuctions([]);
          setPagination({});
          setStats({ total: 0, active: 0, completed: 0, pending: 0, ended: 0 });
        }
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to fetch auctions';
      if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Unable to connect to server';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout: Server is taking too long to respond';
      } else if (error.response?.status === 404) {
        errorMessage = 'Auction management endpoint not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error: Please try again later';
      }

      dispatch(showError(errorMessage));

      // For debugging: Add some mock data to test rendering
      const mockAuctions = [
        {
          _id: 'mock-1',
          title: 'Mock Auction Item 1',
          category: 'Furniture',
          seller: { name: 'Mock Seller 1', email: 'seller1@example.com' },
          auctionType: 'Standard',
          startingBid: 100,
          currentPrice: 150,
          status: 'active',
          isVerified: true,
          isSoldOut: false,
          bidCount: 5,
          uniqueBidders: 3,
          auctionStartDate: new Date().toISOString(),
          auctionEndDate: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock-2',
          title: 'Mock Auction Item 2',
          category: 'Ceramics',
          seller: { name: 'Mock Seller 2', email: 'seller2@example.com' },
          auctionType: 'Reserve',
          startingBid: 200,
          currentPrice: 250,
          status: 'pending',
          isVerified: false,
          isSoldOut: false,
          bidCount: 2,
          uniqueBidders: 2,
          auctionStartDate: new Date().toISOString(),
          auctionEndDate: new Date(Date.now() + 172800000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock-3',
          title: 'Mock Auction Item 3',
          category: 'Art',
          seller: { name: 'Mock Seller 3', email: 'seller3@example.com' },
          auctionType: 'Standard',
          startingBid: 300,
          currentPrice: 350,
          status: 'active',
          isVerified: true,
          isSoldOut: false,
          bidCount: 8,
          uniqueBidders: 5,
          auctionStartDate: new Date().toISOString(),
          auctionEndDate: new Date(Date.now() + 259200000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      console.log('Setting mock auctions for debugging:', mockAuctions);
      setAuctions(mockAuctions);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: mockAuctions.length,
        hasNext: false,
        hasPrev: false
      });
      const mockStats = {
        total: mockAuctions.length,
        active: mockAuctions.filter(a => a.status === 'active').length,
        completed: mockAuctions.filter(a => a.status === 'completed' || a.isSoldOut).length,
        pending: mockAuctions.filter(a => a.status === 'pending' || !a.isVerified).length,
        ended: mockAuctions.filter(a => a.status === 'ended').length
      };

      console.log('📊 Setting mock stats:', mockStats);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, [currentPage, auctionsPerPage, filterStatus, filterCategory, searchTerm, sortBy, sortOrder, dispatch]);

  const categories = ['All Categories', 'Furniture', 'Ceramics', 'Jewelry', 'Paintings', 'Sculptures', 'Books', 'Textiles'];

  // Filter and sort auctions
  const filterAndSortAuctions = useCallback(() => {
    console.log('🔍 Filtering auctions...');
    console.log('📊 Current state:', {
      totalAuctions: auctions.length,
      searchTerm,
      filterStatus,
      filterCategory,
      sortBy,
      sortOrder
    });

    let filtered = [...auctions];
    console.log('📋 Initial auctions:', filtered.map(a => ({ id: a._id, title: a.title, status: a.status, category: a.category })));

    // Apply search filter
    if (searchTerm) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(auction =>
        auction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`🔍 Search filter "${searchTerm}": ${beforeSearch} → ${filtered.length} auctions`);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const beforeStatus = filtered.length;
      filtered = filtered.filter(auction => auction.status === filterStatus);
      console.log(`📊 Status filter "${filterStatus}": ${beforeStatus} → ${filtered.length} auctions`);
    }

    // Apply category filter
    if (filterCategory !== 'All Categories') {
      const beforeCategory = filtered.length;
      filtered = filtered.filter(auction => auction.category === filterCategory);
      console.log(`🏷️ Category filter "${filterCategory}": ${beforeCategory} → ${filtered.length} auctions`);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'endDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    console.log('✅ Final filtered auctions:', filtered.length, 'auctions');
    console.log('📋 Final auction list:', filtered.map(a => ({ id: a._id, title: a.title, status: a.status, category: a.category })));
    setFilteredAuctions(filtered);
  }, [auctions, searchTerm, filterStatus, filterCategory, sortBy, sortOrder]);

  // Initial fetch on component mount
  useEffect(() => {
    console.log('🚀 AuctionManagement component mounted, fetching auctions...');
    fetchAuctions();
  }, [fetchAuctions]);

  // Filter auctions when data or filters change
  useEffect(() => {
    filterAndSortAuctions();
  }, [filterAndSortAuctions]);

  // Monitor WebSocket connection status (temporarily disabled)
  useEffect(() => {
    const checkConnection = () => {
      setWebsocketConnected(false); // WebSocket temporarily disabled
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => clearInterval(connectionInterval);
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    const handleBidUpdate = (data) => {
      console.log('Received auction update:', data);

      if (data.type === 'bid_placed') {
        // Update specific auction in the list
        setAuctions(prevAuctions =>
          prevAuctions.map(auction =>
            auction._id === data.auctionId
              ? {
                  ...auction,
                  currentPrice: data.bidAmount,
                  bidCount: (auction.bidCount || 0) + 1,
                  highestBidder: data.bidder
                }
              : auction
          )
        );
      } else if (data.type === 'auction_ended' || data.type === 'auction_status_changed') {
        // Update auction status in real-time
        setAuctions(prevAuctions =>
          prevAuctions.map(auction =>
            auction._id === data.auctionId
              ? { ...auction, status: data.status, auctionStatus: data.status }
              : auction
          )
        );
      }
    };

    const handleAuctionUpdate = (data) => {
      console.log('Received real-time auction update:', data);
      handleBidUpdate(data);
    };

    // Listen for various auction events (temporarily disabled)
    // websocketService.on('auction_update', handleAuctionUpdate);
    // websocketService.on('bid_placed', handleAuctionUpdate);
    // websocketService.on('auction_ended', handleAuctionUpdate);

    return () => {
      // websocketService.off('auction_update', handleAuctionUpdate);
      // websocketService.off('bid_placed', handleAuctionUpdate);
      // websocketService.off('auction_ended', handleAuctionUpdate);
    };
  }, []);

  // Fetch auctions when filters change
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' && currentPage !== 1) {
        setCurrentPage(1);
      }
      // The fetchAuctions will be called automatically due to the dependency on searchTerm
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage]);

  const handleAuctionAction = async (action, auctionId, additionalData = {}) => {
    const auction = auctions.find(a => a._id === auctionId);

    try {
      switch (action) {
        case 'view':
          setSelectedAuction(auction);
          setModalMode('view');
          setShowAuctionModal(true);
          break;

        case 'edit':
          setSelectedAuction(auction);
          setModalMode('edit');
          setShowAuctionModal(true);
          break;

        case 'approve':
          try {
            await adminAuctionApi.changeAuctionStatus(auctionId, 'approve', 'Approved by admin');
            dispatch(showSuccess('Auction approved successfully'));
            fetchAuctions({ page: currentPage });
          } catch (apiError) {
            console.error('Approve API error:', apiError);
            dispatch(showError('Failed to approve auction. API may not be available.'));
          }
          break;

        case 'reject':
          const rejectReason = prompt('Please provide a reason for rejection:');
          if (rejectReason !== null) {
            try {
              await adminAuctionApi.changeAuctionStatus(auctionId, 'reject', rejectReason);
              dispatch(showSuccess('Auction rejected successfully'));
              fetchAuctions({ page: currentPage });
            } catch (apiError) {
              console.error('Reject API error:', apiError);
              dispatch(showError('Failed to reject auction. API may not be available.'));
            }
          }
          break;

        case 'pause':
          if (window.confirm('Are you sure you want to pause this auction? This will extend the end time by 24 hours.')) {
            try {
              await adminAuctionApi.changeAuctionStatus(auctionId, 'pause', 'Paused by admin');
              dispatch(showSuccess('Auction paused successfully'));
              fetchAuctions({ page: currentPage });
            } catch (apiError) {
              console.error('Pause API error:', apiError);
              dispatch(showError('Failed to pause auction. API may not be available.'));
            }
          }
          break;

        case 'cancel':
          const cancelReason = prompt('Please provide a reason for cancellation:');
          if (cancelReason !== null && window.confirm('Are you sure you want to cancel this auction? All bids will be invalidated.')) {
            try {
              await adminAuctionApi.changeAuctionStatus(auctionId, 'cancel', cancelReason);
              dispatch(showSuccess('Auction cancelled successfully'));
              fetchAuctions({ page: currentPage });
            } catch (apiError) {
              console.error('Cancel API error:', apiError);
              dispatch(showError('Failed to cancel auction. API may not be available.'));
            }
          }
          break;

        case 'end':
          const endReason = prompt('Please provide a reason for ending this auction early:');
          if (endReason !== null && window.confirm('Are you sure you want to end this auction early?')) {
            try {
              await adminAuctionApi.endAuctionEarly(auctionId, endReason);
              dispatch(showSuccess('Auction ended successfully'));
              fetchAuctions({ page: currentPage });
            } catch (apiError) {
              console.error('End auction API error:', apiError);
              dispatch(showError('Failed to end auction. API may not be available.'));
            }
          }
          break;

        case 'delete':
          setConfirmationDialog({
            isOpen: true,
            title: 'Delete Auction',
            message: `Are you sure you want to permanently delete the auction "${auction.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
              try {
                await adminAuctionApi.deleteAuction(auctionId);
                dispatch(showSuccess('Auction deleted successfully'));
                fetchAuctions({ page: currentPage });
                setConfirmationDialog({ ...confirmationDialog, isOpen: false });
              } catch (apiError) {
                console.error('Delete API error:', apiError);
                dispatch(showError('Failed to delete auction. API may not be available.'));
              }
            }
          });
          break;

        case 'bidHistory':
          setSelectedAuction(auction);
          setModalMode('bidHistory');
          setShowAuctionModal(true);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} on auction:`, error);
      dispatch(showError(error.toString()));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedAuctions.length === 0) {
      dispatch(showError('Please select auctions first'));
      return;
    }

    try {
      const confirmMessage = `Are you sure you want to ${action} ${selectedAuctions.length} auction${selectedAuctions.length > 1 ? 's' : ''}?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      // Process each selected auction
      const promises = selectedAuctions.map(async (auctionId) => {
        try {
          switch (action) {
            case 'approve':
              return await adminAuctionApi.changeAuctionStatus(auctionId, 'approve', 'Bulk approved by admin');
            case 'reject':
              return await adminAuctionApi.changeAuctionStatus(auctionId, 'reject', 'Bulk rejected by admin');
            case 'delete':
              return await adminAuctionApi.deleteAuction(auctionId);
            case 'pause':
              return await adminAuctionApi.changeAuctionStatus(auctionId, 'pause', 'Bulk paused by admin');
            default:
              throw new Error(`Unknown bulk action: ${action}`);
          }
        } catch (apiError) {
          console.error(`Bulk ${action} API error for auction ${auctionId}:`, apiError);
          throw new Error(`Failed to ${action} auction ${auctionId}: API may not be available`);
        }
      });

      await Promise.all(promises);

      dispatch(showSuccess(`Successfully ${action}d ${selectedAuctions.length} auction${selectedAuctions.length > 1 ? 's' : ''}`));
      setSelectedAuctions([]);
      fetchAuctions({ page: currentPage });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      dispatch(showError(`Failed to ${action} selected auctions: ${error.toString()}`));
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Title', 'Category', 'Seller', 'Auction Type', 'Starting Bid', 'Current Price', 'Status', 'Verified', 'Bid Count', 'Unique Bidders', 'Start Date', 'End Date'],
      ...filteredAuctions.map(auction => [
        auction.title,
        auction.category,
        auction.seller?.name || 'Unknown',
        auction.auctionType,
        auction.startingBid,
        auction.currentPrice,
        auction.status,
        auction.isVerified ? 'Yes' : 'No',
        auction.bidCount || 0,
        auction.uniqueBidders || 0,
        auction.auctionStartDate ? new Date(auction.auctionStartDate).toLocaleDateString() : '',
        auction.auctionEndDate ? new Date(auction.auctionEndDate).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auctions_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const formatTimeRemaining = (endDate, status) => {
    if (status === 'completed' || status === 'ended' || status === 'cancelled') {
      return 'Ended';
    }

    if (!endDate) return 'No end date';

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



  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RiAuctionFill className="text-green text-2xl" />
          <Title level={3} className="text-gray-800">Auction Management</Title>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            <HiOutlineDownload size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{stats.total}</Title>
              <Body className="text-gray-600">Total Auctions</Body>
            </div>
            <RiAuctionFill className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-blue-600">{stats.active}</Title>
              <Body className="text-gray-600">Active</Body>
            </div>
            <MdPlayArrow className="text-blue-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-yellow-600">{stats.pending}</Title>
              <Body className="text-gray-600">Pending Approval</Body>
            </div>
            <MdPause className="text-yellow-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-purple-600">{stats.completed}</Title>
              <Body className="text-gray-600">Completed</Body>
            </div>
            <MdCheckCircle className="text-purple-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-red-600">{stats.ended}</Title>
              <Body className="text-gray-600">Ended</Body>
            </div>
            <MdStop className="text-red-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions..."
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
            <option value="pending">Pending Approval</option>
            <option value="completed">Completed</option>
            <option value="ended">Ended</option>
            <option value="upcoming">Upcoming</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category === 'All Categories' ? 'all' : category}>
                {category}
              </option>
            ))}
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
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="auctionEndDate-asc">Ending Soon</option>
            <option value="currentPrice-desc">Highest Price</option>
            <option value="startingBid-desc">Highest Starting Bid</option>
            <option value="bidCount-desc">Most Bids</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>

        {/* Debug Section - Remove in production */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">
              Debug: {auctions.length} total, {filteredAuctions.length} filtered, Stats: {stats.total}
            </span>
            <button
              onClick={() => {
                console.log('🐛 Debug Info:');
                console.log('- auctions.length:', auctions.length);
                console.log('- filteredAuctions.length:', filteredAuctions.length);
                console.log('- searchTerm:', searchTerm);
                console.log('- filterStatus:', filterStatus);
                console.log('- filterCategory:', filterCategory);
                console.log('- stats:', stats);
                console.log('- Raw auctions:', auctions);
                console.log('- Filtered auctions:', filteredAuctions);
              }}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
            >
              Debug Console
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAuctions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedAuctions.length} auction{selectedAuctions.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="bg-green text-white px-3 py-1 rounded text-sm hover:bg-primary transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auctions Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
              <p className="text-gray-600">Loading auctions...</p>
            </div>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'All Categories'
                  ? 'No auctions match your current filters. Try adjusting your search criteria.'
                  : 'No auctions have been created yet.'}
              </p>
              <button
                onClick={() => {
                  console.log('🧹 Clearing all filters and refreshing...');
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('All Categories');
                  fetchAuctions();
                }}
                className="bg-green text-white px-4 py-2 rounded hover:bg-primary transition-colors"
              >
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'All Categories' ? 'Clear Filters' : 'Refresh'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAuctions.length === filteredAuctions.length && filteredAuctions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAuctions(filteredAuctions.map(a => a._id));
                      } else {
                        setSelectedAuctions([]);
                      }
                    }}
                    className="rounded border-gray-300 text-green focus:ring-green"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auction Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bidding Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuctions.map((auction) => (
                <tr key={auction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAuctions.includes(auction._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAuctions([...selectedAuctions, auction._id]);
                        } else {
                          setSelectedAuctions(selectedAuctions.filter(id => id !== auction._id));
                        }
                      }}
                      className="rounded border-gray-300 text-green focus:ring-green"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {auction.image && auction.image.url ? (
                          <img
                            src={auction.image.url}
                            alt={auction.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <RiAuctionFill className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {auction.title}
                          {auction.isVerified && (
                            <span className="ml-1 text-green" title="Verified Auction">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {auction.seller?.name || 'Unknown Seller'}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {auction._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {auction.auctionType || 'Timed'}
                      </span>
                      <div className="text-xs text-gray-600">{auction.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="font-medium text-green">
                        {formatCurrency(auction.currentPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Start: {formatCurrency(auction.startingBid)}
                      </div>
                      {auction.reservePrice && (
                        <div className="text-xs text-gray-500">
                          Reserve: {formatCurrency(auction.reservePrice)}
                        </div>
                      )}
                      {auction.instantPurchasePrice && (
                        <div className="text-xs text-blue-600">
                          Buy Now: {formatCurrency(auction.instantPurchasePrice)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(auction.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction.status)}`}>
                        {auction.status}
                      </span>
                    </div>
                    {!auction.isVerified && auction.status !== 'pending' && (
                      <div className="mt-1">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Needs Approval
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <FiUsers size={14} className="mr-1" />
                          <span className="font-medium">{auction.uniqueBidders || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <BsGraphUp size={14} className="mr-1" />
                          <span className="font-medium">{auction.bidCount || 0}</span>
                        </div>
                      </div>
                      {auction.highestBidder && (
                        <div className="text-xs text-gray-400">
                          Top: {auction.highestBidder.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatTimeRemaining(auction.auctionEndDate, auction.status)}
                      </div>
                      {auction.auctionEndDate && (
                        <div className="text-xs text-gray-500">
                          Ends: {new Date(auction.auctionEndDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleAuctionAction('view', auction._id)}
                        className="text-green hover:text-primary p-1 rounded"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleAuctionAction('edit', auction._id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Auction"
                      >
                        <MdEdit size={16} />
                      </button>

                      {/* Approval actions for pending auctions */}
                      {!auction.isVerified && (
                        <>
                          <button
                            onClick={() => handleAuctionAction('approve', auction._id)}
                            className="text-green hover:text-primary p-1 rounded"
                            title="Approve Auction"
                          >
                            <MdCheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleAuctionAction('reject', auction._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Reject Auction"
                          >
                            <MdCancel size={16} />
                          </button>
                        </>
                      )}

                      {/* Status control actions */}
                      {auction.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleAuctionAction('pause', auction._id)}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded"
                            title="Pause Auction"
                          >
                            <MdPause size={16} />
                          </button>
                          <button
                            onClick={() => handleAuctionAction('end', auction._id)}
                            className="text-purple-600 hover:text-purple-800 p-1 rounded"
                            title="End Auction Early"
                          >
                            <MdStop size={16} />
                          </button>
                        </>
                      )}

                      {/* Cancel action for non-completed auctions */}
                      {auction.status !== 'completed' && auction.status !== 'cancelled' && (
                        <button
                          onClick={() => handleAuctionAction('cancel', auction._id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Cancel Auction"
                        >
                          <MdCancel size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleAuctionAction('bidHistory', auction._id)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded"
                        title="View Bid History"
                      >
                        <MdHistory size={16} />
                      </button>
                      <button
                        onClick={() => handleAuctionAction('delete', auction._id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="Delete Auction"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * auctionsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * auctionsPerPage, pagination.totalCount)}</span> of{' '}
                    <span className="font-medium">{pagination.totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {/* Previous button */}
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-green border-green text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next button */}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Auction Modal */}
      {showAuctionModal && (
        <AuctionModal
          auction={selectedAuction}
          mode={modalMode}
          onClose={() => setShowAuctionModal(false)}
          onSave={async (auctionData) => {
            try {
              await adminAuctionApi.updateAuction(selectedAuction._id, auctionData);
              dispatch(showSuccess('Auction updated successfully'));
              fetchAuctions({ page: currentPage });
              setShowAuctionModal(false);
            } catch (error) {
              console.error('Update auction API error:', error);
              dispatch(showError('Failed to update auction. API may not be available.'));
            }
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog({ ...confirmationDialog, isOpen: false })}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmText={confirmationDialog.confirmText}
        cancelText={confirmationDialog.cancelText}
        type={confirmationDialog.type}
      />
    </div>
  );
};

// Enhanced Auction Modal Component
const AuctionModal = ({ auction, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState(auction || {});
  const [bidHistory, setBidHistory] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [bidPagination, setBidPagination] = useState({});
  const dispatch = useDispatch();

  // Fetch bid history when modal opens in bidHistory mode
  useEffect(() => {
    if (mode === 'bidHistory' && auction?._id) {
      fetchBidHistory();
    }
  }, [mode, auction]);

  const fetchBidHistory = async (page = 1) => {
    try {
      setLoadingBids(true);
      const response = await adminAuctionApi.getAuctionBidHistory(auction._id, { page, limit: 10 });

      if (response && response.success) {
        setBidHistory(response.bidHistory || []);
        setBidPagination(response.pagination || {});
      } else {
        // Provide mock bid history if API fails
        setBidHistory([
          {
            _id: 'mock-bid-1',
            amount: auction?.currentPrice || 150,
            bidder: { name: 'Sample Bidder', email: 'bidder@example.com' },
            timestamp: new Date().toISOString()
          }
        ]);
        setBidPagination({ currentPage: 1, totalPages: 1, totalCount: 1 });
      }
    } catch (error) {
      console.error('Error fetching bid history:', error);
      // Provide mock data on error
      setBidHistory([
        {
          _id: 'mock-bid-1',
          amount: auction?.currentPrice || 150,
          bidder: { name: 'Sample Bidder', email: 'bidder@example.com' },
          timestamp: new Date().toISOString()
        }
      ]);
      setBidPagination({ currentPage: 1, totalPages: 1, totalCount: 1 });
      dispatch(showError('Failed to load bid history - showing sample data'));
    } finally {
      setLoadingBids(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">
            {mode === 'view' ? 'Auction Details' :
             mode === 'edit' ? 'Edit Auction' :
             mode === 'bidHistory' ? 'Bid History' : 'Auction'}
          </Title>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'bidHistory' ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={5} className="text-gray-800 mb-2">Auction: {auction?.title}</Title>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Price:</span> ${auction?.currentPrice?.toLocaleString() || '0'}
                </div>
                <div>
                  <span className="font-medium">Total Bids:</span> {auction?.bidCount || 0}
                </div>
                <div>
                  <span className="font-medium">Unique Bidders:</span> {auction?.uniqueBidders || 0}
                </div>
                <div>
                  <span className="font-medium">Reserve Price:</span> ${auction?.reservePrice?.toLocaleString() || 'None'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Title level={5} className="text-gray-800">Bid History</Title>
                <button
                  onClick={() => fetchBidHistory(1)}
                  className="text-green hover:text-primary text-sm"
                  disabled={loadingBids}
                >
                  {loadingBids ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loadingBids ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
                </div>
              ) : bidHistory.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bidder</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bidHistory.map((bid, index) => (
                        <tr key={bid._id} className={bid.isWinning ? 'bg-green-50' : ''}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{bid.bidder.name}</div>
                              <div className="text-xs text-gray-500">{bid.bidder.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ${bid.amount.toLocaleString()}
                            {bid.maxBid && bid.maxBid > bid.amount && (
                              <div className="text-xs text-blue-600">Max: ${bid.maxBid.toLocaleString()}</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              bid.bidType === 'Proxy' ? 'bg-blue-100 text-blue-800' :
                              bid.bidType === 'Auto' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bid.bidType}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(bid.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              bid.isWinning ? 'bg-green-100 text-green-800' :
                              bid.status === 'Won' ? 'bg-blue-100 text-blue-800' :
                              bid.status === 'Lost' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bid.isWinning ? 'Winning' : bid.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Bid History Pagination */}
                  {bidPagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {bidHistory.length} of {bidPagination.totalBids} bids
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchBidHistory(bidPagination.currentPage - 1)}
                            disabled={!bidPagination.hasPrev}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => fetchBidHistory(bidPagination.currentPage + 1)}
                            disabled={!bidPagination.hasNext}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No bids found for this auction
                </div>
              )}
            </div>
          </div>
        ) : mode === 'view' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-gray-900">{auction?.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 max-h-32 overflow-y-auto">{auction?.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{auction?.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auction Type</label>
                  <p className="text-gray-900">{auction?.auctionType || 'Timed'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                  <div className="text-gray-900">
                    <div className="font-medium">{auction?.seller?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{auction?.seller?.email}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Bid</label>
                    <p className="text-gray-900">${auction?.startingBid?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                    <p className="font-medium text-green">${auction?.currentPrice?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Price</label>
                    <p className="text-gray-900">${auction?.reservePrice?.toLocaleString() || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buy Now Price</label>
                    <p className="text-gray-900">${auction?.instantPurchasePrice?.toLocaleString() || 'None'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-gray-900">
                      {auction?.auctionStartDate ? new Date(auction.auctionStartDate).toLocaleString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <p className="text-gray-900">
                      {auction?.auctionEndDate ? new Date(auction.auctionEndDate).toLocaleString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(auction?.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auction?.status)}`}>
                        {auction?.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      auction?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {auction?.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <Title level={2} className="text-green">{auction?.bidCount || 0}</Title>
                <Body className="text-gray-600">Total Bids</Body>
              </div>
              <div className="text-center">
                <Title level={2} className="text-green">{auction?.uniqueBidders || 0}</Title>
                <Body className="text-gray-600">Unique Bidders</Body>
              </div>
              <div className="text-center">
                <Title level={2} className="text-green">
                  {auction?.highestBidder ? auction.highestBidder.name : 'None'}
                </Title>
                <Body className="text-gray-600">Top Bidder</Body>
              </div>
              <div className="text-center">
                <Title level={2} className="text-green">
                  {auction?.soldTo ? auction.soldTo.name : 'None'}
                </Title>
                <Body className="text-gray-600">Winner</Body>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Ceramics">Ceramics</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Paintings">Paintings</option>
                  <option value="Sculptures">Sculptures</option>
                  <option value="Books">Books</option>
                  <option value="Textiles">Textiles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auction Type</label>
                <select
                  name="auctionType"
                  value={formData.auctionType || 'Timed'}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                >
                  <option value="Timed">Timed Auction</option>
                  <option value="Live">Live Auction</option>
                  <option value="Buy Now">Buy Now</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Bid *</label>
                <input
                  type="number"
                  name="startingBid"
                  value={formData.startingBid || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Price</label>
                <input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instant Purchase Price</label>
                <input
                  type="number"
                  name="instantPurchasePrice"
                  value={formData.instantPurchasePrice || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  name="auctionStartDate"
                  value={formData.auctionStartDate ? new Date(formData.auctionStartDate).toISOString().slice(0, 16) : ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="datetime-local"
                  name="auctionEndDate"
                  value={formData.auctionEndDate ? new Date(formData.auctionEndDate).toISOString().slice(0, 16) : ''}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green text-white rounded-lg hover:bg-primary transition-colors"
              >
                Update Auction
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'success': return 'bg-green hover:bg-primary';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <Title level={4} className="text-gray-800 mb-2">{title}</Title>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionManagement;
