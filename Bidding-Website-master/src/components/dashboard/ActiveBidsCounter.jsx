import React, { useState, useEffect, useCallback } from 'react';
import { Title, Caption } from '../common/Design';
import { MdGavel, MdTrendingUp } from 'react-icons/md';
import { FiRefreshCw, FiActivity } from 'react-icons/fi';
import { apiEndpoints } from '../../services/api';
import websocketService from '../../services/websocket';

export const ActiveBidsCounter = ({ 
  className = "",
  showRefreshButton = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [activeBidsData, setActiveBidsData] = useState({
    totalActiveBids: 0,
    activeAuctions: 0,
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch active bids count from API
  const fetchActiveBidsCount = useCallback(async () => {
    try {
      setError(null);
      const response = await apiEndpoints.bidding.getTotalActiveBidsCount();
      setActiveBidsData(response.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load active bids count');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle WebSocket active bids count updates
  const handleActiveBidsCountUpdate = useCallback((eventData) => {
    setActiveBidsData({
      totalActiveBids: eventData.totalActiveBids,
      activeAuctions: eventData.activeAuctions,
      timestamp: new Date(eventData.timestamp)
    });
    setLastUpdate(new Date());
  }, []);

  // Handle individual bid updates (fallback)
  const handleBidUpdate = useCallback((eventData) => {
    // For individual bid events, increment counter as fallback
    // The main update should come from active_bids_count_update
    if (!eventData.auctionId) return;

    setActiveBidsData(prev => ({
      ...prev,
      totalActiveBids: prev.totalActiveBids + 1,
      timestamp: new Date()
    }));
    setLastUpdate(new Date());
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    if (websocketService.isSocketConnected()) {
      // Listen for active bids count updates (primary)
      websocketService.socket.on('active_bids_count_update', handleActiveBidsCountUpdate);

      // Listen for individual bid events (fallback)
      websocketService.socket.on('new_bid', handleBidUpdate);
      websocketService.socket.on('bid_success', handleBidUpdate);

      return () => {
        if (websocketService.socket) {
          websocketService.socket.off('active_bids_count_update', handleActiveBidsCountUpdate);
          websocketService.socket.off('new_bid', handleBidUpdate);
          websocketService.socket.off('bid_success', handleBidUpdate);
        }
      };
    }
  }, [handleActiveBidsCountUpdate, handleBidUpdate]);

  // Initial data fetch
  useEffect(() => {
    fetchActiveBidsCount();
  }, [fetchActiveBidsCount]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchActiveBidsCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchActiveBidsCount]);

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdGavel className="text-blue-600" size={24} />
            </div>
            <div>
              <Title level={4} className="text-gray-800">Active Bids</Title>
              <Caption className="text-gray-600">Platform-wide</Caption>
            </div>
          </div>
          <div className="animate-spin">
            <FiRefreshCw size={20} className="text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MdGavel className="text-red-600" size={24} />
            </div>
            <div>
              <Title level={4} className="text-gray-800">Active Bids</Title>
              <Caption className="text-red-600">Error loading data</Caption>
            </div>
          </div>
          {showRefreshButton && (
            <button
              onClick={fetchActiveBidsCount}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Retry"
            >
              <FiRefreshCw size={16} className="text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="text-center py-4">
          <Caption className="text-red-500 mb-2">{error}</Caption>
          <button
            onClick={fetchActiveBidsCount}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <MdGavel className="text-blue-600" size={24} />
          </div>
          <div>
            <Title level={4} className="text-gray-800">Active Bids</Title>
            <Caption className="text-gray-600">Platform-wide</Caption>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {websocketService.isSocketConnected() && (
            <div className="flex items-center gap-1 text-green-600">
              <FiActivity size={14} />
              <Caption className="text-green-600">Live</Caption>
            </div>
          )}
          {showRefreshButton && (
            <button
              onClick={fetchActiveBidsCount}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={16} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Counter */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {activeBidsData.totalActiveBids.toLocaleString()}
          </div>
          <Caption className="text-gray-600">
            Total active bids across all auctions
          </Caption>
        </div>

        {/* Additional Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {activeBidsData.activeAuctions}
            </div>
            <Caption className="text-gray-600">Active Auctions</Caption>
          </div>
          
          <div className="text-center">
            <div className="flex items-center gap-1 text-green-600">
              <MdTrendingUp size={16} />
              <span className="text-sm font-medium">Live Updates</span>
            </div>
            <Caption className="text-gray-500">
              {lastUpdate ? formatTimeAgo(lastUpdate) : 'Never'}
            </Caption>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBidsCounter;
