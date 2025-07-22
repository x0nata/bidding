import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeBid } from '../../redux/slices/biddingSlice';
import { Title, Body } from '../common/Design';
import { MdGavel, MdTrendingUp, MdWarning, MdCheckCircle, MdError, MdWifi, MdWifiOff } from 'react-icons/md';
import { FiDollarSign, FiUsers, FiLock } from 'react-icons/fi';
import { RiAuctionFill } from 'react-icons/ri';
import { BsGraphUp, BsShieldCheck } from 'react-icons/bs';
import BidConfirmationModal from './BidConfirmationModal';
import CountdownTimer from './CountdownTimer';
import InstantPurchaseWinnerModal from './InstantPurchaseWinnerModal';
import { useAuctionUpdates } from '../../hooks/useBiddingUpdates';
import { validateBidAmount } from '../../utils/validation';
import instantPurchaseService from '../../services/instantPurchaseService';
import concurrentBidHandler from '../../services/concurrentBidHandler';
import { useBankBiddingBalance } from '../../hooks/useBankBalance';
import BankAddBalanceModal from '../payment/BankAddBalanceModal';
import ErrorHandlingService from '../../services/errorHandlingService';
import { formatETB, formatETBNumber, generateQuickBidAmounts } from '../../utils/currency';
import mockBalanceIntegration from '../../services/mockBalanceIntegration';

const BiddingInterface = ({ auction, onBidPlaced, onAuctionEnded, className = '' }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [currentBid, setCurrentBid] = useState(auction?.currentBid || auction?.startingBid || 0);
  const [totalBids, setTotalBids] = useState(auction?.totalBids || 0);
  const [lastBidder, setLastBidder] = useState(auction?.lastBidder || null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showInstantPurchaseSuccess, setShowInstantPurchaseSuccess] = useState(false);
  const [instantPurchaseData, setInstantPurchaseData] = useState(null);
  const [auctionEnded, setAuctionEnded] = useState(auction?.isSoldout || false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Use the bank balance hook for real-time balance updates
  const {
    balanceInfo,
    formatAmount,
    validateBidAmount: validateBidBalance,
    fetchBalanceInfo
  } = useBankBiddingBalance();

  // Real-time bidding updates
  const { bidUpdates, getBidUpdate, isConnected } = useAuctionUpdates(auction?.id);

  // Calculate minimum bid increment
  const calculateMinIncrement = (currentPrice) => {
    if (currentPrice < 100) return 5;
    if (currentPrice < 500) return 10;
    if (currentPrice < 1000) return 25;
    if (currentPrice < 5000) return 50;
    if (currentPrice < 10000) return 100;
    return 250;
  };

  const minIncrement = calculateMinIncrement(currentBid);
  const minimumBid = currentBid + minIncrement;

  // Different logic for auction activity based on type
  const isAuctionActive = !auctionEnded && (auction?.auctionType === 'Live'
    ? (!auction?.isSoldout &&
       !(auction?.instantPurchasePrice && currentBid >= auction.instantPurchasePrice))  // Live auctions are active until sold out, instant purchase reached, or ended by admin
    : (new Date(auction?.endDate) > new Date() && !auction?.isSoldout)); // Timed auctions check end date

  const isMyBid = lastBidder?.id === user?.id;

  // Update local state when real-time updates arrive
  useEffect(() => {
    const update = getBidUpdate(auction?.id);
    if (update) {
      setCurrentBid(update.currentBid);
      setTotalBids(update.totalBids);
      setLastBidder(update.lastBidder);

      // Clear success message if user was outbid
      if (update.lastBidder?.id !== user?.id && bidSuccess) {
        setBidSuccess('');
      }
    }
  }, [bidUpdates, auction?.id, user?.id, bidSuccess, getBidUpdate]);

  const validateBid = (amount) => {
    // Use centralized validation for bid amount
    const amountError = validateBidAmount(amount, minimumBid);
    if (amountError) return amountError;

    // Additional auction-specific validations
    if (!isAuthenticated) {
      return 'Please log in to place a bid';
    }

    if (!isAuctionActive) {
      return 'This auction has ended';
    }

    // Check if user is trying to bid on their own auction
    // Backend uses 'user' field to identify auction owner
    const auctionOwnerId = auction?.user?._id || auction?.user;
    const currentUserId = user?._id || user?.id;
    
    if (auctionOwnerId && currentUserId && auctionOwnerId.toString() === currentUserId.toString()) {
      return 'You cannot bid on your own auction';
    }

    // Use the balance validation from the hook
    const balanceValidation = validateBidBalance(amount);
    if (!balanceValidation.valid) {
      return balanceValidation.error;
    }

    return null;
  };

  const handleAddBalanceClick = () => {
    setShowAddBalanceModal(true);
  };

  const handleAddBalanceSuccess = () => {
    fetchBalanceInfo(); // Refresh balance immediately
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    setBidError('');
    setBidSuccess('');
    
    const error = validateBid(bidAmount);
    if (error) {
      setBidError(error);
      return;
    }
    
    setShowConfirmation(true);
  };

  const confirmBid = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmation(false);
      
      // Initialize mock balance if needed
      await mockBalanceIntegration.initializeMockBalance();
      
      // Sync mock balance for bidding
      try {
        await mockBalanceIntegration.syncBalanceForBidding(parseFloat(bidAmount));
      } catch (mockError) {
        // Mock balance sync failed, proceeding anyway
      }
      
      // Check if this bid will trigger instant purchase
      const bidAmountFloat = parseFloat(bidAmount);
      const willTriggerInstantPurchase = instantPurchaseService.checkInstantPurchase(bidAmountFloat, auction);

      // Prepare bid data
      const bidData = {
        productId: auction.id || auction._id,
        amount: bidAmountFloat,
        bidType: 'Manual',
        instantPurchase: willTriggerInstantPurchase
      };

      // Handle concurrent bids
      const concurrentResult = await concurrentBidHandler.handleConcurrentBid(
        auction.id || auction._id,
        bidData,
        user
      );

      if (!concurrentResult.success) {
        setBidError(concurrentResult.error);
        return;
      }

      // Use the real API to place the bid
      const response = await dispatch(placeBid(bidData)).unwrap();

      // Define bid amount for use in callbacks and events
      const newBidAmount = parseFloat(bidAmount);
      let finalAmount = newBidAmount;

      // Check if instant purchase was triggered
      if (response.instantPurchase && response.auctionEnded) {
        // Handle instant purchase victory
        finalAmount = response.finalPrice;
        setCurrentBid(response.finalPrice);
        setLastBidder({ id: user?.id, name: user?.name });
        setBidSuccess(`🎉 Congratulations! You won the auction with an instant purchase of ${formatETB(response.finalPrice)}!`);
        setBidAmount('');

        // Update auction status to ended
        if (onAuctionEnded) {
          onAuctionEnded({
            reason: 'instant_purchase',
            winner: user,
            finalPrice: response.finalPrice
          });
        }

        // Show instant purchase modal or notification
        showInstantPurchaseModal(response);

      } else if (response.auctionEnded && !response.instantPurchase) {
        // Another bidder triggered instant purchase
        setBidError('Auction ended - another bidder triggered instant purchase while you were bidding.');

      } else {
        // Normal bid placement
        setCurrentBid(newBidAmount);
        setTotalBids(prev => prev + 1);
        setLastBidder({ id: user?.id, name: user?.name });
        setBidSuccess(`Bid placed successfully for ${formatETB(newBidAmount)}!`);
        setBidAmount('');
      }

      // Refresh balance after placing a bid (only if not an error scenario)
      if (!response.auctionEnded || response.instantPurchase) {
        fetchBalanceInfo();

        // Also trigger global balance refresh for consistency across all components
        const event = new CustomEvent('bankBalanceUpdate', {
          detail: { operation: 'bid_placed', amount: finalAmount }
        });
        window.dispatchEvent(event);

        // Call parent callback
        if (onBidPlaced) {
          onBidPlaced({
            amount: finalAmount,
            bidder: user,
            timestamp: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {

      // Use the error handling service for better user experience
      const processedError = ErrorHandlingService.handleBiddingError(
        error,
        {
          auctionId: auction.id,
          bidAmount: parseFloat(bidAmount),
          currentBid,
          minimumBid
        },
        dispatch
      );

      setBidError(processedError.message);

      // Handle specific error actions
      if (processedError.code === 'INSUFFICIENT_BALANCE') {
        // Auto-open add balance modal for insufficient balance
        setTimeout(() => {
          setShowAddBalanceModal(true);
        }, 2000);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const getSuggestedBids = () => {
    return generateQuickBidAmounts(currentBid, 4);
  };

  const handleSuggestedBid = (amount) => {
    setBidAmount(amount.toString());
    setBidError('');
  };

  const showInstantPurchaseModal = (response) => {
    // Process instant purchase with enhanced service
    instantPurchaseService.processInstantPurchase(
      { id: response.bidId, amount: response.finalPrice },
      auction,
      user
    ).then((result) => {
      if (result.success) {
        setInstantPurchaseData(response);
        setShowWinnerModal(true); // Show the new winner modal
        setAuctionEnded(true);
      }
    }).catch((error) => {
      console.error('Error processing instant purchase:', error);
      setBidError('Error processing instant purchase. Please contact support.');
    });
  };

  const closeInstantPurchaseModal = () => {
    setShowInstantPurchaseSuccess(false);
    setInstantPurchaseData(null);
  };

  if (!auction) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <Body className="text-gray-600">Auction information not available</Body>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-green text-white p-6 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <MdGavel className="text-3xl flex-shrink-0" />
            <div>
              <Title level={4} className="text-white mb-1">Place Your Bid</Title>
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-2 text-sm">
                {isConnected ? (
                  <>
                    <MdWifi className="text-white" />
                    <span className="text-white opacity-90">Live Updates Active</span>
                  </>
                ) : (
                  <>
                    <MdWifiOff className="text-red-300" />
                    <span className="text-red-300">Connection Lost</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <CountdownTimer
              endDate={auction.endDate}
              auctionType={auction.auctionType}
              hideForLive={true}
            />
          </div>
        </div>
      </div>

      {/* Current Bid Info */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <FiDollarSign className="mx-auto text-green text-3xl mb-2" />
            <Body className="text-gray-600 text-xs font-medium mb-1">Current Bid</Body>
            <Title level={4} className="text-green font-bold text-lg">{formatETBNumber(currentBid)}</Title>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <FiUsers className="mx-auto text-blue-600 text-3xl mb-2" />
            <Body className="text-gray-600 text-xs font-medium mb-1">Total Bids</Body>
            <Title level={4} className="text-blue-600 font-bold text-lg">{totalBids}</Title>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <BsGraphUp className="mx-auto text-purple-600 text-3xl mb-2" />
            <Body className="text-gray-600 text-xs font-medium mb-1 whitespace-nowrap">Min Increment</Body>
            <Title level={4} className="text-purple-600 font-bold text-lg">{formatETBNumber(minIncrement)}</Title>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            {auction.instantPurchasePrice ? (
              <>
                <MdGavel className="mx-auto text-red-600 text-3xl mb-2" />
                <Body className="text-gray-600 text-xs font-medium mb-1 whitespace-nowrap">
                  {auction.auctionType === 'Live' ? 'Instant Win' : 'Buy It Now'}
                </Body>
                <Title level={4} className="text-red-600 font-bold text-lg">{formatETBNumber(auction.instantPurchasePrice)}</Title>
              </>
            ) : (
              <>
                <BsShieldCheck className="mx-auto text-orange-600 text-3xl mb-2" />
                <Body className="text-gray-600 text-xs font-medium mb-1 whitespace-nowrap">Reserve Status</Body>
                <Title level={4} className={auction.reserveMet ? "text-green font-bold text-lg" : "text-orange-600 font-bold text-lg"}>
                  {auction.reserveMet ? 'Met' : 'Not Met'}
                </Title>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auction Type Info */}
      {auction.auctionType === 'Live' && (
        <div className="p-3 bg-green-50 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <RiAuctionFill className="text-green text-xl" />
            <Body className="text-green-800 font-medium">
              Live Auction - No time limit!
              {auction.instantPurchasePrice &&
                ` Ends when someone bids ${formatETB(auction.instantPurchasePrice)} or admin closes it.`
              }
            </Body>
          </div>
        </div>
      )}

      {/* Last Bidder Info */}
      {lastBidder && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MdTrendingUp className="text-blue-600" />
              <Body className="text-blue-800">
                {isMyBid ? 'You are the highest bidder!' : `Leading bidder: ${lastBidder.name}`}
              </Body>
            </div>
            {isMyBid && <MdCheckCircle className="text-green text-xl" />}
          </div>
        </div>
      )}

      {/* Bidding Form */}
      <div className="p-6">
        {!isAuctionActive ? (
          <div className="text-center py-8">
            {instantPurchaseData ? (
              <>
                <MdCheckCircle className="mx-auto text-green-500 text-4xl mb-2" />
                <Title level={4} className="text-green-600 mb-2">Auction Won by Instant Purchase!</Title>
                <Body className="text-gray-600 mb-2">
                  This auction ended when a bidder reached the instant purchase price.
                </Body>
                <Body className="text-sm text-green-600 font-medium">
                  Final Price: {formatETB(instantPurchaseData.finalPrice)}
                </Body>
              </>
            ) : (
              <>
                <MdWarning className="mx-auto text-red-500 text-4xl mb-2" />
                <Title level={4} className="text-red-600 mb-2">
                  {auction?.auctionType === 'Live' ? 'Live Auction Ended' : 'Auction Ended'}
                </Title>
                <Body className="text-gray-600">
                  {auction?.auctionType === 'Live'
                    ? 'This live auction has been ended by the administrator.'
                    : 'This auction is no longer accepting bids.'
                  }
                </Body>
              </>
            )}
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-12 px-6">
            <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <MdWarning className="text-orange-500 text-4xl" />
            </div>
            <Title level={3} className="text-gray-900 mb-3">Login Required to Bid</Title>
            <Body className="text-gray-600 mb-6 max-w-md mx-auto">
              You need to be logged in to participate in this auction. Join thousands of bidders and start winning amazing items!
            </Body>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-green text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 font-semibold text-lg shadow-lg transform hover:scale-105"
              >
                Log In to Bid
              </button>
              <p className="text-sm text-gray-500">
                Don't have an account? <button onClick={() => navigate('/register')} className="text-green hover:text-green-600 font-medium">Sign up here</button>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance Information */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                  <FiDollarSign className="text-green text-xl" />
                  Your Bidding Balance
                </h4>
                <button
                  type="button"
                  onClick={handleAddBalanceClick}
                  className="bg-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  + Add Balance
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Available Balance</span>
                    <span className="font-bold text-green text-lg">
                      {formatAmount(balanceInfo.availableBalance)}
                    </span>
                  </div>
                </div>
                {balanceInfo.heldAmount > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium flex items-center gap-1">
                        <FiLock size={14} />
                        Held Amount
                      </span>
                      <span className="font-bold text-orange-600 text-lg">
                        {formatAmount(balanceInfo.heldAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {balanceInfo.availableBalance < minimumBid && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MdWarning className="text-yellow-600 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-800">Insufficient Balance</p>
                      <p className="text-yellow-700 text-sm">
                        You need at least {formatAmount(minimumBid)} to place a bid on this auction.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-6">
              {/* Bid Amount Input */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Enter Your Bid Amount
                </label>
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    Minimum bid: <span className="font-semibold text-green">{formatETB(minimumBid)}</span>
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">ETB</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value);
                      setBidError('');
                      setBidSuccess('');
                    }}
                    placeholder={minimumBid.toString()}
                    min={minimumBid}
                    step="1"
                    className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green focus:border-green outline-none text-xl font-bold text-center transition-all duration-200"
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    Enter amount in Ethiopian Birr (ETB)
                  </p>
                </div>
              </div>

            {/* Suggested Bids */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MdTrendingUp className="text-blue-600" />
                Quick Bid Options
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Click on any amount below to quickly set your bid
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getSuggestedBids().map((amount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestedBid(amount)}
                    className="bg-gray-100 hover:bg-green hover:text-white text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-semibold border border-gray-200 hover:border-green transform hover:scale-105"
                  >
                    {formatETBNumber(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Error/Success Messages */}
            {bidError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MdError className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Bid Error</h4>
                    <p className="text-red-700 text-sm mt-1">{bidError}</p>
                  </div>
                </div>
              </div>
            )}

            {bidSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MdCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Bid Successful</h4>
                    <p className="text-green-700 text-sm mt-1">{bidSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !bidAmount}
                className="w-full bg-green text-white py-4 px-6 rounded-lg hover:bg-green-600 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Placing Your Bid...</span>
                  </>
                ) : (
                  <>
                    <RiAuctionFill className="text-xl" />
                    <span>Place Bid Now</span>
                  </>
                )}
              </button>
              {bidAmount && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  You're about to bid <span className="font-semibold text-green">{formatETB(bidAmount)}</span>
                </p>
              )}
            </div>
          </form>
          </div>
        )}
      </div>

      {/* Auto-refresh Toggle */}
      <div className="px-6 pb-4">
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span>Auto-refresh bid data</span>
        </label>
      </div>

      {/* Bid Confirmation Modal */}
      {showConfirmation && (
        <BidConfirmationModal
          bidAmount={parseFloat(bidAmount)}
          currentBid={currentBid}
          auctionTitle={auction.title}
          onConfirm={confirmBid}
          onCancel={() => setShowConfirmation(false)}
          userBalance={balanceInfo.availableBalance}
        />
      )}

      {/* Add Balance Modal */}
      <BankAddBalanceModal
        isOpen={showAddBalanceModal}
        onClose={() => setShowAddBalanceModal(false)}
        onSuccess={handleAddBalanceSuccess}
      />

      {/* Instant Purchase Success Modal */}
      {showInstantPurchaseSuccess && instantPurchaseData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <MdCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <Title level={2} className="text-green-600 mb-2">🎉 Instant Purchase Victory!</Title>
              <Body className="text-gray-600">
                Congratulations! You won the auction instantly!
              </Body>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium">{auction.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Winning Bid:</span>
                  <span className="font-bold text-green-600">{formatETB(instantPurchaseData.finalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Instant Purchase Price:</span>
                  <span className="font-medium">{formatETB(instantPurchaseData.instantPurchasePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction Type:</span>
                  <span className="font-medium">{auction.auctionType}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <Body className="text-blue-800 text-sm">
                <strong>What's Next:</strong><br />
                • You'll be contacted by the seller for payment<br />
                • Complete payment within 48 hours<br />
                • Shipping details will be provided after payment
              </Body>
            </div>

            <button
              onClick={closeInstantPurchaseModal}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Awesome! Close
            </button>
          </div>
        </div>
      )}

      {/* Auction Ended Overlay */}
      {auctionEnded && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm">
            <MdWarning className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <Title level={3} className="text-gray-900 mb-2">Auction Ended</Title>
            <Body className="text-gray-600 mb-4">
              This auction has ended. No more bids can be placed.
            </Body>
            {instantPurchaseData && (
              <Body className="text-sm text-green-600 font-medium">
                Won by instant purchase: {formatETB(instantPurchaseData.finalPrice)}
              </Body>
            )}
          </div>
        </div>
      )}

      {/* Instant Purchase Winner Modal */}
      {showWinnerModal && instantPurchaseData && (
        <InstantPurchaseWinnerModal
          isOpen={showWinnerModal}
          onClose={() => {
            setShowWinnerModal(false);
            setInstantPurchaseData(null);
          }}
          productTitle={auction?.title}
          finalPrice={instantPurchaseData.finalPrice}
          productId={auction?.id || auction?._id}
          auction={auction}
          winner={user}
        />
      )}
    </div>
  );
};

export default BiddingInterface;