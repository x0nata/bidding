import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const LiveAuctionRoom = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidType, setBidType] = useState('Manual');
  const [maxBid, setMaxBid] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [connected, setConnected] = useState(false);
  
  const socketRef = useRef(null);
  const bidHistoryRef = useRef(null);

  useEffect(() => {
    fetchAuctionDetails();
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [auctionId]);

  useEffect(() => {
    // Auto-scroll bid history to bottom when new bids arrive
    if (bidHistoryRef.current) {
      bidHistoryRef.current.scrollTop = bidHistoryRef.current.scrollHeight;
    }
  }, [bids]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await fetch(`/api/product/auctions/${auctionId}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuction(data.auction);
        setBids(data.bids);
        setCurrentBid(data.auction.currentBid);
        setTimeRemaining(data.auction.timeRemaining);
      } else {
        toast.error('Failed to load auction details');
      }
    } catch (error) {
      toast.error('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token'); // Adjust based on your auth implementation
    
    socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5002', {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current.emit('join_auction', auctionId);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('auction_state', (state) => {
      setCurrentBid(state.currentBid);
      setTimeRemaining(state.timeRemaining);
      setViewerCount(state.viewerCount);
    });

    socketRef.current.on('new_bid', (bidData) => {
      setBids(prev => [bidData, ...prev]);
      setCurrentBid(bidData.bidAmount);
      
      // Show notification for new bids
      if (bidData.bidder.name !== 'You') {
        toast.info(`New bid: $${bidData.bidAmount} by ${bidData.bidder.name}`);
      }
    });

    socketRef.current.on('user_joined', (data) => {
      setViewerCount(data.viewerCount);
    });

    socketRef.current.on('user_left', (data) => {
      setViewerCount(data.viewerCount);
    });

    socketRef.current.on('auction_extended', (data) => {
      setTimeRemaining(data.newEndTime - Date.now());
      toast.info(data.message);
    });

    socketRef.current.on('auction_ended', (data) => {
      toast.success('Auction has ended!');
      setTimeRemaining(0);
    });

    socketRef.current.on('bid_error', (error) => {
      toast.error(error.message);
      setBidding(false);
    });

    socketRef.current.on('bid_success', (data) => {
      toast.success(data.message);
      setBidAmount('');
      setMaxBid('');
      setBidding(false);
    });

    socketRef.current.on('error', (error) => {
      toast.error(error.message);
    });
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    
    if (!bidAmount || isNaN(bidAmount)) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (bidType === 'Proxy' && (!maxBid || isNaN(maxBid))) {
      toast.error('Please enter a valid maximum bid for proxy bidding');
      return;
    }

    setBidding(true);
    
    const bidData = {
      auctionId,
      bidAmount: parseFloat(bidAmount),
      bidType,
      maxBid: bidType === 'Proxy' ? parseFloat(maxBid) : undefined
    };

    socketRef.current.emit('place_bid', bidData);
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'Ended';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getMinimumBid = () => {
    return currentBid + (auction?.bidIncrement || 10);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">Auction not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Auction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auction Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{auction.title}</h1>
                <p className="text-gray-600 mt-2">{auction.description}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    connected ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  {connected ? 'Connected' : 'Disconnected'}
                </div>
                <p className="text-sm text-gray-500 mt-1">{viewerCount} viewers</p>
              </div>
            </div>

            {/* Auction Image */}
            {auction.image && (
              <div className="mb-6">
                <img
                  src={auction.image.url}
                  alt={auction.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Current Bid & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Current Bid</h3>
                <p className="text-3xl font-bold text-blue-600">${currentBid.toLocaleString()}</p>
                {auction.reservePrice > 0 && (
                  <p className="text-sm text-gray-600">
                    Reserve: ${auction.reservePrice.toLocaleString()} 
                    {currentBid >= auction.reservePrice ? ' (Met)' : ' (Not Met)'}
                  </p>
                )}
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Auction Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-3xl font-bold text-green-600">LIVE</p>
                </div>
                <p className="text-sm text-gray-600">
                  {auction.auctionType} Auction - No time limit
                </p>
                {auction.instantPurchasePrice && (
                  <p className="text-sm text-green-700 mt-1">
                    Ends at ${auction.instantPurchasePrice.toLocaleString()} or admin decision
                  </p>
                )}
              </div>
            </div>

            {/* Bidding Form */}
            {(!auction.isSoldout && !(auction.instantPurchasePrice && currentBid >= auction.instantPurchasePrice)) && (
              <form onSubmit={handlePlaceBid} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bid Type
                    </label>
                    <select
                      value={bidType}
                      onChange={(e) => setBidType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Manual">Manual Bid</option>
                      <option value="Proxy">Proxy Bid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bid Amount ($)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={getMinimumBid()}
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Min: $${getMinimumBid()}`}
                      required
                    />
                  </div>
                  
                  {bidType === 'Proxy' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Bid ($)
                      </label>
                      <input
                        type="number"
                        value={maxBid}
                        onChange={(e) => setMaxBid(e.target.value)}
                        min={bidAmount}
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your maximum"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={bidding || !connected}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {bidding ? 'Placing Bid...' : `Place ${bidType} Bid`}
                </button>
                
                {bidType === 'Proxy' && (
                  <p className="text-sm text-gray-600 mt-2">
                    Proxy bidding will automatically bid for you up to your maximum amount.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bid History Sidebar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Bid History</h3>
          
          <div 
            ref={bidHistoryRef}
            className="space-y-3 max-h-96 overflow-y-auto"
          >
            {bids.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No bids yet</p>
            ) : (
              bids.map((bid, index) => (
                <div
                  key={bid.bidId || index}
                  className={`p-3 rounded-lg ${
                    bid.isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      ${bid.bidAmount.toLocaleString()}
                    </span>
                    {bid.isWinning && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Winning
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bid.bidder.name}
                    {bid.bidType === 'Proxy' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                        Proxy
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(bid.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionRoom;
