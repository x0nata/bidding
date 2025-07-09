import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProducts, getWonProducts, getActiveAuctions } from '../redux/slices/productSlice';
import { getUserBids } from '../redux/slices/biddingSlice';
import { showError, showSuccess } from '../redux/slices/notificationSlice';
import { useBalanceUpdates } from './useBalanceUpdates';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userProducts, wonProducts, activeAuctions, isLoading: productsLoading } = useSelector((state) => state.product);
  const { userBids, isLoading: bidsLoading, error: bidsError } = useSelector((state) => state.bidding);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Use the balance hook for proper balance information
  const { balanceInfo, formatAmount } = useBalanceUpdates();

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      await Promise.all([
        dispatch(getUserProducts()),
        dispatch(getWonProducts()),
        dispatch(getUserBids()),
        dispatch(getActiveAuctions())
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      dispatch(showError("Failed to load dashboard data"));
    } finally {
      setDashboardLoading(false);
    }
  }, [dispatch]);



  // Refresh specific data
  const refreshBids = useCallback(() => {
    dispatch(getUserBids());
  }, [dispatch]);

  const refreshProducts = useCallback(() => {
    dispatch(getUserProducts());
    dispatch(getWonProducts());
  }, [dispatch]);

  const refreshAuctions = useCallback(() => {
    dispatch(getActiveAuctions());
  }, [dispatch]);

  const refreshAll = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Calculate user statistics
  const getUserBalance = useCallback(() => {
    return balanceInfo.availableBalance || 0;
  }, [balanceInfo.availableBalance]);

  const getActiveUserBids = useCallback(() => {
    if (!Array.isArray(userBids)) {
      return 0;
    }

    return userBids.filter(bid => {
      // Handle both capitalized (backend) and lowercase (legacy) status values
      const status = bid.bidStatus || bid.status || '';
      const normalizedStatus = status.toLowerCase();

      // Active bids include: Active, Winning statuses, or isWinningBid flag
      // Exclude: Won, Lost, Outbid statuses (these are completed/inactive)
      return normalizedStatus === "active" ||
             normalizedStatus === "winning" ||
             bid.isWinningBid === true;
    }).length;
  }, [userBids]);

  const getWinningBids = useCallback(() => {
    if (!Array.isArray(userBids)) {
      return 0;
    }

    return userBids.filter(bid => {
      // Handle both capitalized (backend) and lowercase (legacy) status values
      const status = bid.bidStatus || bid.status || '';
      const normalizedStatus = status.toLowerCase();

      // Winning bids are those with "winning" status or isWinningBid flag
      return normalizedStatus === "winning" ||
             bid.isWinningBid === true;
    }).length;
  }, [userBids]);

  const getTotalBidsValue = useCallback(() => {
    if (!Array.isArray(userBids)) {
      return 0;
    }
    return userBids.reduce((total, bid) => total + (bid.price || bid.amount || 0), 0);
  }, [userBids]);

  const getTotalWonValue = useCallback(() => {
    if (!Array.isArray(wonProducts)) {
      return 0;
    }
    return wonProducts.reduce((total, item) => 
      total + (item.biddingPrice || item.currentBid || item.price || 0), 0
    );
  }, [wonProducts]);

  const getActiveListings = useCallback(() => {
    if (!Array.isArray(userProducts)) {
      return 0;
    }
    return userProducts.filter(product => !product.isSoldout).length;
  }, [userProducts]);

  const getSoldListings = useCallback(() => {
    if (!Array.isArray(userProducts)) {
      return 0;
    }
    return userProducts.filter(product => product.isSoldout).length;
  }, [userProducts]);

  // Generate activity feed from user data
  const generateActivityFeed = useCallback(() => {
    const activities = [];
    
    // Add recent bids
    if (Array.isArray(userBids)) {
      userBids.slice(0, 3).forEach(bid => {
        activities.push({
          id: `bid-${bid._id}`,
          type: bid.bidStatus === 'winning' ? 'bid_won' : 'bid_placed',
          title: `Bid placed on ${bid.product?.title || 'auction item'}`,
          description: `You bid $${(bid.price || bid.amount || 0).toLocaleString()}`,
          amount: bid.price || bid.amount,
          createdAt: bid.createdAt
        });
      });
    }

    // Add won items
    if (Array.isArray(wonProducts)) {
      wonProducts.slice(0, 2).forEach(item => {
        activities.push({
          id: `won-${item._id}`,
          type: 'bid_won',
          title: `Won auction: ${item.title}`,
          description: `Congratulations! You won this auction`,
          amount: item.currentBid || item.biddingPrice || item.price,
          createdAt: item.auctionEndDate || item.updatedAt
        });
      });
    }

    // Add recent listings
    if (Array.isArray(userProducts)) {
      userProducts.slice(0, 2).forEach(product => {
        activities.push({
          id: `listing-${product._id}`,
          type: 'listing_created',
          title: `Listed: ${product.title}`,
          description: `Your item is now live for bidding`,
          amount: product.startingBid || product.price,
          createdAt: product.createdAt
        });
      });
    }

    // Sort by date
    return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [userBids, wonProducts, userProducts]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);



  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshAll]);

  return {
    // Data
    user,
    userProducts: Array.isArray(userProducts) ? userProducts : [],
    wonProducts: Array.isArray(wonProducts) ? wonProducts : [],
    activeAuctions: Array.isArray(activeAuctions) ? activeAuctions : [],
    userBids: Array.isArray(userBids) ? userBids : [],
    
    // Loading states
    dashboardLoading,
    productsLoading,
    bidsLoading,
    bidsError,
    lastRefresh,
    
    // Actions
    refreshBids,
    refreshProducts,
    refreshAuctions,
    refreshAll,
    loadDashboardData,
    
    // Computed values
    getUserBalance,
    getActiveUserBids,
    getWinningBids,
    getTotalBidsValue,
    getTotalWonValue,
    getActiveListings,
    getSoldListings,
    generateActivityFeed,
    
    // Statistics
    stats: {
      balance: getUserBalance(),
      activeBids: getActiveUserBids(),
      winningBids: getWinningBids(),
      totalBidsValue: getTotalBidsValue(),
      totalWonValue: getTotalWonValue(),
      itemsWon: Array.isArray(wonProducts) ? wonProducts.length : 0,
      activeListings: getActiveListings(),
      soldListings: getSoldListings(),
      totalListings: Array.isArray(userProducts) ? userProducts.length : 0
    }
  };
};

export default useDashboard;
