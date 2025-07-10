import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, getActiveAuctions } from '../../redux/slices/productSlice';
import { Title, Caption } from '../common/Design';
import { AuctionCard } from './AuctionCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { FiClock, FiTrendingUp, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { MdGavel } from 'react-icons/md';
import { useProductUpdates } from '../../hooks/useProductUpdates';
// import websocketService from '../../services/websocket'; // Temporarily disabled

export const RecentlyAddedAuctions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, activeAuctions, userProducts, isLoading } = useSelector((state) => state.product);
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showNewItemNotification, setShowNewItemNotification] = useState(false);
  const [websocketConnected, setWebsocketConnected] = useState(false);

  // Handle product updates with callback
  const handleProductUpdate = useCallback((updateInfo) => {
    const recent = getRecentlyAddedAuctions();
    setRecentAuctions(recent);
    setLastUpdateTime(Date.now());

    // Show notification for new items
    if (updateInfo.newProducts || updateInfo.newUserProducts) {
      setShowNewItemNotification(true);
      setTimeout(() => setShowNewItemNotification(false), 3000); // Hide after 3 seconds
    }
  }, []);

  // Use the product updates hook
  const { refreshAllData } = useProductUpdates(handleProductUpdate);

  // Get recently added auctions (last 7 days, sorted by newest first)
  const getRecentlyAddedAuctions = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


    // Combine all product sources: products, activeAuctions, and userProducts
    // Ensure all arrays are valid before spreading
    const safeProducts = Array.isArray(products) ? products : [];
    const safeActiveAuctions = Array.isArray(activeAuctions) ? activeAuctions : [];
    const safeUserProducts = Array.isArray(userProducts) ? userProducts : [];

    const allAuctions = [...safeProducts, ...safeActiveAuctions, ...safeUserProducts];

    // Remove duplicates based on _id
    const uniqueAuctions = allAuctions.filter((auction, index, self) =>
      auction && auction._id && index === self.findIndex(a => a && a._id === auction._id)
    );


    const recentAuctions = uniqueAuctions
      .filter(auction => {
        if (!auction || !auction.createdAt) {
          return false;
        }

        const createdDate = new Date(auction.createdAt);
        const isRecent = createdDate >= sevenDaysAgo;

        // More inclusive filtering for database products
        const now = new Date();

        // Check if auction is active based on multiple criteria
        let isActive = false;

        // 1. Check auction status from backend
        if (auction.auctionStatus === 'active' || auction.auctionStatus === 'live') {
          isActive = true;
        }

        // 2. Check auction end date
        if (auction.auctionEndDate && new Date(auction.auctionEndDate) > now) {
          isActive = true;
        }

        // 3. Check if it's a Buy Now auction
        if (auction.auctionType === 'Buy Now') {
          isActive = true;
        }

        // 4. Check if it's not sold out
        if (!auction.isSoldout && auction.isActive !== false) {
          isActive = true;
        }

        // 5. For newly created products (might not have all fields set)
        if (Array.isArray(userProducts) && userProducts.some(up => up._id === auction._id)) {
          isActive = true;
        }

        const shouldInclude = isRecent && isActive;

        if (shouldInclude) {
        }

        return shouldInclude;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8); // Show maximum 8 items


    return recentAuctions;
  };

  // Fetch data on component mount - ensure we get ALL products from database
  useEffect(() => {

    // Fetch all products without filters to ensure we get everything from database
    const fetchAllData = async () => {
      try {
        await Promise.all([
          dispatch(getAllProducts({ limit: 100 })), // Increase limit to get more products
          dispatch(getActiveAuctions())
        ]);
      } catch (error) {
      }
    };

    fetchAllData();
  }, [dispatch]);

  // Update recent auctions when data changes
  useEffect(() => {

    // Log current database state for debugging

    const recent = getRecentlyAddedAuctions();
    setRecentAuctions(recent);
    setLastUpdateTime(Date.now());

    // Verify the filtered results

  }, [products, activeAuctions, userProducts]);

  // Force refresh when new products are added (listen to userProducts length changes)
  useEffect(() => {
    if (Array.isArray(userProducts) && userProducts.length > 0) {
      const recent = getRecentlyAddedAuctions();
      setRecentAuctions(recent);
      setLastUpdateTime(Date.now());
    }
  }, [Array.isArray(userProducts) ? userProducts.length : 0]);

  // Setup WebSocket listeners for real-time updates (temporarily disabled)
  useEffect(() => {
    const setupWebSocketListeners = () => {
      // WebSocket temporarily disabled
      setWebsocketConnected(false);
      return;

      // setWebsocketConnected(true);

      // Listen for new product/auction events
      const handleNewProduct = (productData) => {
        // Trigger a gentle refresh without full API call
        const recent = getRecentlyAddedAuctions();
        setRecentAuctions(recent);
        setLastUpdateTime(Date.now());
        setShowNewItemNotification(true);
        setTimeout(() => setShowNewItemNotification(false), 3000);
      };

      const handleProductUpdate = (updateData) => {
        // Only refresh if it affects recently added auctions
        const recent = getRecentlyAddedAuctions();
        setRecentAuctions(recent);
        setLastUpdateTime(Date.now());
      };

      // Subscribe to events
      websocketService.on('newProduct', handleNewProduct);
      websocketService.on('productUpdate', handleProductUpdate);
      websocketService.on('auctionUpdate', handleProductUpdate);

      // Cleanup function
      return () => {
        websocketService.off('newProduct', handleNewProduct);
        websocketService.off('productUpdate', handleProductUpdate);
        websocketService.off('auctionUpdate', handleProductUpdate);
      };
    };

    const cleanup = setupWebSocketListeners();
    return cleanup;
  }, [getRecentlyAddedAuctions]);

  // Manual refresh function (intelligent refresh)
  const refreshData = async (force = false) => {
    const timeSinceLastUpdate = Date.now() - lastUpdateTime;

    // If WebSocket is connected and it's been less than 1 minute, just update from current state
    if (!force && websocketConnected && timeSinceLastUpdate < 60000) {
      const recent = getRecentlyAddedAuctions();
      setRecentAuctions(recent);
      setLastUpdateTime(Date.now());
      return;
    }

    try {
      await refreshAllData();
      // Force immediate update
      const recent = getRecentlyAddedAuctions();
      setRecentAuctions(recent);
      setLastUpdateTime(Date.now());
    } catch (error) {
    }
  };

  // Calculate user products length safely
  const userProductsLength = Array.isArray(userProducts) ? userProducts.length : 0;

  // Set up auto-refresh with longer interval and smarter logic
  useEffect(() => {
    // Only auto-refresh if there are no recent user products (to avoid overwriting new listings)
    const shouldAutoRefresh = userProductsLength === 0 ||
      (Date.now() - lastUpdateTime) > 300000; // 5 minutes since last update

    if (!shouldAutoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      // Only refresh if page is visible and no recent user activity
      if (!document.hidden && (Date.now() - lastUpdateTime) > 300000) {
        refreshData();
      }
    }, 120000); // 2 minutes instead of 30 seconds

    setRefreshInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch, userProductsLength, lastUpdateTime]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const handleViewAllAuctions = () => {
    navigate('/auctions/user-listings');
  };

  if (isLoading && recentAuctions.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <Caption className="mt-4 text-gray-600">Loading recent auctions...</Caption>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative">
      <div className="container mx-auto px-4">

        {/* New Item Notification */}
        {showNewItemNotification && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-lg" />
              <span className="font-medium">New auction added!</span>
            </div>
          </div>
        )}
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full">
              <MdGavel className="text-2xl text-white" />
            </div>
            <Title level={2} className="text-3xl md:text-4xl font-bold text-gray-900">
              Recently Added Auctions
            </Title>
            {/* Refresh Button with Connection Status */}
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => refreshData(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                title="Refresh auctions"
              >
                <FiRefreshCw className="text-gray-600 hover:text-gray-800" />
              </button>
              {/* Connection Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${websocketConnected ? 'bg-green-500' : 'bg-gray-400'}`}
                   title={websocketConnected ? 'Real-time updates active' : 'Real-time updates inactive'} />
            </div>
          </div>
          <Caption className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the latest antique treasures added by our community of collectors and dealers
          </Caption>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {recentAuctions.length} New This Week
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Live Bidding Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiRefreshCw className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Updated {new Date(lastUpdateTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        {recentAuctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {recentAuctions.map((auction) => (
                <AuctionCard 
                  key={auction._id} 
                  auction={auction}
                  showSellerName={true}
                  showCountdown={true}
                  variant="compact"
                />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={handleViewAllAuctions}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>View All User Auctions</span>
                <FiArrowRight className="text-lg" />
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            icon={MdGavel}
            title="No Recent Auctions"
            description="No new auctions have been added in the past week. Be the first to list your antique treasures!"
            actionText="Create Your First Listing"
            onAction={() => navigate('/add-product')}
          />
        )}
      </div>
    </section>
  );
};

export default RecentlyAddedAuctions;
