import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Title, Body } from '../common/Design';
import { MdTrendingUp, MdTrendingDown, MdRefresh, MdHistory, MdWifi, MdWifiOff } from 'react-icons/md';
import { FiClock, FiDollarSign, FiUser, FiEye } from 'react-icons/fi';
import { BsGraphUp, BsGraphDown } from 'react-icons/bs';
import { useAuctionUpdates } from '../../hooks/useBiddingUpdates';
import { formatETB } from '../../utils/currency';

const BidHistory = ({ auctionId, className = '', maxHeight = '400px' }) => {
  const { user } = useSelector((state) => state.auth);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time updates
  const { connectionStatus, bidUpdates, getBidUpdate, isConnected } = useAuctionUpdates(auctionId);

  // Mock bid history data
  const mockBids = [
    {
      id: 1,
      amount: 1300,
      bidder: { id: 'user1', name: 'Alice Cooper', isAnonymous: false },
      timestamp: '2024-01-25T14:30:00Z',
      isWinning: true,
      increment: 50
    },
    {
      id: 2,
      amount: 1250,
      bidder: { id: user?.id, name: user?.name || 'You', isAnonymous: false },
      timestamp: '2024-01-25T14:25:00Z',
      isWinning: false,
      increment: 50
    },
    {
      id: 3,
      amount: 1200,
      bidder: { id: 'user2', name: 'Bob Wilson', isAnonymous: false },
      timestamp: '2024-01-25T14:20:00Z',
      isWinning: false,
      increment: 50
    },
    {
      id: 4,
      amount: 1150,
      bidder: { id: 'user3', name: 'Charlie Brown', isAnonymous: false },
      timestamp: '2024-01-25T14:15:00Z',
      isWinning: false,
      increment: 50
    },
    {
      id: 5,
      amount: 1100,
      bidder: { id: 'user4', name: 'Diana Prince', isAnonymous: false },
      timestamp: '2024-01-25T14:10:00Z',
      isWinning: false,
      increment: 50
    },
    {
      id: 6,
      amount: 1050,
      bidder: { id: 'user5', name: 'Edward Smith', isAnonymous: false },
      timestamp: '2024-01-25T14:05:00Z',
      isWinning: false,
      increment: 50
    },
    {
      id: 7,
      amount: 1000,
      bidder: { id: 'user6', name: 'Fiona Green', isAnonymous: false },
      timestamp: '2024-01-25T14:00:00Z',
      isWinning: false,
      increment: 0 // Starting bid
    }
  ];

  useEffect(() => {
    fetchBidHistory();
  }, [auctionId]);

  // Update bid history when real-time updates arrive
  useEffect(() => {
    const update = getBidUpdate(auctionId);
    if (update && update.timestamp) {
      // Add new bid to history if it's newer than our latest bid
      const latestBid = bids[0];
      if (!latestBid || new Date(update.timestamp) > new Date(latestBid.timestamp)) {
        const newBid = {
          id: Date.now(),
          amount: update.currentBid,
          bidder: update.lastBidder,
          timestamp: update.timestamp,
          isWinning: true,
          increment: latestBid ? update.currentBid - latestBid.amount : 0
        };

        setBids(prev => [
          newBid,
          ...prev.map(bid => ({ ...bid, isWinning: false }))
        ]);
      }
    }
  }, [bidUpdates, auctionId, bids, getBidUpdate]);

  const fetchBidHistory = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/auctions/${auctionId}/bids`);
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setBids(mockBids);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const refreshBidHistory = async () => {
    try {
      setRefreshing(true);
      // Simulate new bid occasionally
      const random = Math.random();
      if (random > 0.8) {
        const newBid = {
          id: bids.length + 1,
          amount: bids[0]?.amount + 50 || 1350,
          bidder: { id: 'new-user', name: 'New Bidder', isAnonymous: false },
          timestamp: new Date().toISOString(),
          isWinning: true,
          increment: 50
        };
        
        const updatedBids = [newBid, ...bids.map(bid => ({ ...bid, isWinning: false }))];
        setBids(updatedBids);
      }
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const bidTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - bidTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getBidderDisplay = (bidder) => {
    if (bidder.id === user?.id) {
      return 'You';
    }
    if (bidder.isAnonymous) {
      return 'Anonymous Bidder';
    }
    return bidder.name;
  };

  const getBidRowColor = (bid, index) => {
    if (bid.bidder.id === user?.id) {
      return bid.isWinning ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
    }
    if (bid.isWinning) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
  };

  const displayedBids = showAll ? bids : bids.slice(0, 5);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green mx-auto mb-2"></div>
          <Body className="text-gray-600">Loading bid history...</Body>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MdHistory className="text-green text-xl" />
            <Title level={5} className="text-gray-800">Bid History</Title>
            <span className="bg-green text-white text-xs px-2 py-1 rounded-full">
              {bids.length} bids
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-1 text-sm">
              {isConnected ? (
                <>
                  <MdWifi className="text-green" />
                  <span className="text-green">Live</span>
                </>
              ) : (
                <>
                  <MdWifiOff className="text-red-500" />
                  <span className="text-red-500">Offline</span>
                </>
              )}
            </div>

            <label className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-green focus:ring-green"
              />
              <span>Auto-refresh</span>
            </label>
            <button
              onClick={refreshBidHistory}
              disabled={refreshing}
              className="text-green hover:text-primary transition-colors"
              title="Refresh bid history"
            >
              <MdRefresh className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Bid List */}
      <div style={{ maxHeight }} className="overflow-y-auto">
        {bids.length === 0 ? (
          <div className="p-6 text-center">
            <BsGraphUp className="mx-auto text-gray-400 text-3xl mb-2" />
            <Title level={5} className="text-gray-500 mb-1">No bids yet</Title>
            <Body className="text-gray-400">Be the first to place a bid!</Body>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayedBids.map((bid, index) => (
              <div
                key={bid.id}
                className={`p-4 transition-colors ${getBidRowColor(bid, index)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Bid Position */}
                    <div className="flex-shrink-0">
                      {bid.isWinning ? (
                        <div className="w-8 h-8 bg-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Bid Details */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Title level={6} className="text-gray-800">
                          {formatETB(bid.amount)}
                        </Title>
                        {bid.isWinning && (
                          <span className="bg-green text-white text-xs px-2 py-1 rounded-full font-medium">
                            Winning
                          </span>
                        )}
                        {bid.bidder.id === user?.id && !bid.isWinning && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Your Bid
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiUser size={12} />
                        <span>{getBidderDisplay(bid.bidder)}</span>
                        <span>•</span>
                        <FiClock size={12} />
                        <span>{formatTimeAgo(bid.timestamp)}</span>
                        {bid.increment > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green">+{formatETB(bid.increment)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bid Trend */}
                  <div className="flex items-center space-x-1">
                    {index < bids.length - 1 && (
                      <>
                        {bid.amount > bids[index + 1].amount ? (
                          <MdTrendingUp className="text-green" />
                        ) : (
                          <MdTrendingDown className="text-red-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {bids.length > 5 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-green hover:text-primary transition-colors text-sm font-medium"
          >
            {showAll ? `Show Less` : `Show All ${bids.length} Bids`}
          </button>
        </div>
      )}
    </div>
  );
};

export default BidHistory;
