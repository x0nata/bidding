import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Body, Caption, Container, Title } from "../../router";
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { commonClassNameOfInput } from "../../components/common/Design";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

import { RiAuctionFill } from "react-icons/ri";
import { GiTakeMyMoney } from "react-icons/gi";
import { formatETB } from "../../utils/currency";
import { getProductById, getAuctionDetails } from "../../redux/slices/productSlice";
import { placeBid, getBidsForProduct } from "../../redux/slices/biddingSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import { apiEndpoints } from "../../services/api";
// import websocketService from "../../services/websocket"; // Temporarily disabled
import BiddingInterface from "../../components/bidding/BiddingInterface";
import BidHistory from "../../components/bidding/BidHistory";
import CountdownTimer from "../../components/bidding/CountdownTimer";
import { useBiddingManager } from "../../components/bidding/BiddingManager";

export const ProductsDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { currentProduct, currentAuctionBids, isLoading } = useSelector((state) => state.product);
  const { bids, currentBid } = useSelector((state) => state.bidding);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Enhanced bidding functionality
  const biddingManager = useBiddingManager();

  const [activeTab, setActiveTab] = useState("description");
  const [bidAmount, setBidAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Load product data
  useEffect(() => {
    if (id) {
      // Try to get detailed auction data first, fallback to regular product data
      dispatch(getAuctionDetails(id)).catch(() => {
        // If auction details fail, try regular product endpoint
        dispatch(getProductById(id));
        dispatch(getBidsForProduct(id));
      });
    }
  }, [dispatch, id]);

  // Join auction room for real-time updates (temporarily disabled)
  useEffect(() => {
    if (currentProduct?._id) {
      // websocketService.joinAuction(currentProduct._id);
      return () => {
        // websocketService.leaveAuction(currentProduct._id);
      };
    }
  }, [currentProduct?._id]);

  // Calculate time left and auction status - different logic for live vs timed auctions
  useEffect(() => {
    // Live auctions don't have time-based endings
    if (currentProduct?.auctionType === 'Live') {
      // Live auctions are active until instant purchase price is reached or admin ends them
      if (currentProduct?.isSoldout) {
        setTimeLeft("ended");
      } else if (currentProduct?.instantPurchasePrice && getCurrentPrice() >= currentProduct.instantPurchasePrice) {
        setTimeLeft("ended");
      } else {
        setTimeLeft({ status: 'live' });
      }
      return;
    }

    // Timed auctions follow the original time-based logic
    if (currentProduct?.auctionEndDate || currentProduct?.endTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(currentProduct.auctionEndDate || currentProduct.endTime).getTime();
        const startTime = currentProduct.auctionStartDate ? new Date(currentProduct.auctionStartDate).getTime() : 0;
        const distance = endTime - now;

        // Check if auction hasn't started yet
        if (startTime && now < startTime) {
          const startDistance = startTime - now;
          const days = Math.floor(startDistance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((startDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((startDistance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((startDistance % (1000 * 60)) / 1000);

          setTimeLeft({ status: 'upcoming', days, hours, minutes, seconds });
        } else if (distance > 0) {
          // Auction is active
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ status: 'active', days, hours, minutes, seconds });
        } else {
          // Auction has ended
          setTimeLeft("ended");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentProduct?.auctionEndDate, currentProduct?.endTime, currentProduct?.auctionStartDate, currentProduct?.auctionType, currentProduct?.isSoldout, currentProduct?.instantPurchasePrice]);



  // Handle buy now action from URL
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'buynow' && currentProduct?.buyNowPrice) {
      handleBuyNow();
    }
  }, [searchParams, currentProduct]);



  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      dispatch(showError("Please login to place bids"));
      navigate("/login");
      return;
    }

    const minBid = parseFloat(currentBid?.amount || currentProduct?.startingPrice || 0) + 1;
    if (!bidAmount || parseFloat(bidAmount) < minBid) {
      dispatch(showError(`Bid amount must be at least $${minBid}`));
      return;
    }

    setIsPlacingBid(true);
    try {
      await dispatch(placeBid({
        productId: currentProduct._id,
        amount: parseFloat(bidAmount),
      })).unwrap();

      dispatch(showSuccess("Bid placed successfully!"));
      setBidAmount("");
    } catch (error) {
      dispatch(showError(error || "Failed to place bid"));
    } finally {
      setIsPlacingBid(false);
    }
  };

  // Note: Proxy bidding functionality removed as it's not supported by the backend

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      dispatch(showError("Please login to buy items"));
      navigate("/login");
      return;
    }

    if (!currentProduct?.buyNowPrice) {
      dispatch(showError("Buy Now option not available for this item"));
      return;
    }

    // Navigate to checkout or payment page
    navigate(`/checkout/${currentProduct._id}?type=buynow&amount=${currentProduct.buyNowPrice}`);
  };

  const getCurrentPrice = () => {
    // Use auction data if available, otherwise fallback to product data
    return currentProduct?.currentBid ||
           currentBid?.amount ||
           currentBid?.price ||
           currentProduct?.startingBid ||
           currentProduct?.startingPrice ||
           currentProduct?.price ||
           0;
  };

  const getBidsData = () => {
    // Use auction bids if available, otherwise use bidding slice bids
    return currentAuctionBids?.length > 0 ? currentAuctionBids : bids;
  };

  const getImageUrls = () => {
    const images = [];

    // Handle main image
    if (currentProduct?.image) {
      if (typeof currentProduct.image === 'string') {
        images.push(currentProduct.image);
      } else if (currentProduct.image.url) {
        images.push(currentProduct.image.url);
      } else if (currentProduct.image.filePath) {
        images.push(currentProduct.image.filePath);
      }
    }

    // Handle additional images
    if (currentProduct?.additionalImages && Array.isArray(currentProduct.additionalImages)) {
      currentProduct.additionalImages.forEach(img => {
        if (typeof img === 'string') {
          images.push(img);
        } else if (img.url) {
          images.push(img.url);
        } else if (img.filePath) {
          images.push(img.filePath);
        }
      });
    }

    // Handle legacy images array
    if (currentProduct?.images && Array.isArray(currentProduct.images)) {
      currentProduct.images.forEach(img => {
        if (typeof img === 'string') {
          images.push(img);
        } else if (img.url) {
          images.push(img.url);
        } else if (img.filePath) {
          images.push(img.filePath);
        }
      });
    }

    return images.length > 0 ? images : ["/images/placeholder-antique.jpg"];
  };

  const getMainImageUrl = () => {
    const images = getImageUrls();
    return images[selectedImage] || images[0] || "/images/placeholder-antique.jpg";
  };

  const getMinBidAmount = () => {
    return getCurrentPrice() + 1;
  };

  // Enhanced bid placed handler
  const handleBidPlaced = (bidData) => {
    // Update local state or trigger refresh
    dispatch(getBidsForProduct(id));

    // Show success message
    dispatch(showSuccess(`Bid placed successfully for $${bidData.amount.toLocaleString()}!`));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="pt-24 px-8">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => navigate("/")} className="text-primary hover:underline">
                Home
              </button>
              <span>/</span>
              <button onClick={() => navigate("/")} className="text-primary hover:underline">
                Antiques
              </button>
              <span>/</span>
              <span className="text-gray-600">{currentProduct.title}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* Image Gallery */}
            <div className="w-full lg:w-1/2">
              <div className="h-[70vh] mb-4">
                <img
                  src={getMainImageUrl()}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = "/images/placeholder-antique.jpg";
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {getImageUrls().length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {getImageUrls().map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? "border-primary" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${currentProduct.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-antique.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full lg:w-1/2">
              <div className="flex items-start justify-between mb-4">
                <Title level={2} className="capitalize flex-1">
                  {currentProduct.title}
                </Title>
              </div>

              {/* Category and Era */}
              <div className="flex items-center gap-4 mb-4">
                <Caption className="bg-gray-100 px-3 py-1 rounded-full">
                  {currentProduct.category?.name || "Antique"}
                </Caption>
                {currentProduct.era && (
                  <Caption className="bg-blue-100 px-3 py-1 rounded-full">
                    {currentProduct.era}
                  </Caption>
                )}
                {currentProduct.authenticity && (
                  <Caption className="bg-green-100 px-3 py-1 rounded-full text-green-700">
                    ✓ {currentProduct.authenticity.status || currentProduct.authenticity}
                  </Caption>
                )}
              </div>

              {/* Listed by User */}
              <div className="mb-6">
                {currentProduct.user ? (
                <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-md">
                    {currentProduct.user.name ? currentProduct.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1">
                    <Caption className="text-gray-600 text-sm font-medium">Listed by</Caption>
                    <Title level={4} className="text-gray-800 mb-1">
                      {currentProduct.user.name || 'Anonymous Seller'}
                    </Title>
                    {currentProduct.user.email && (
                      <Caption className="text-gray-500 text-sm">
                        📧 {currentProduct.user.email}
                      </Caption>
                    )}
                    {currentProduct.createdAt && (
                      <Caption className="text-gray-500 text-sm mt-1">
                        📅 Listed on {new Date(currentProduct.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Caption>
                    )}
                  </div>
                  <div className="text-green">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      A
                    </div>
                    <div className="flex-1">
                      <Caption className="text-gray-600 text-sm font-medium">Listed by</Caption>
                      <Title level={4} className="text-gray-600 mb-1">
                        Anonymous Seller
                      </Title>
                      <Caption className="text-gray-500 text-sm">
                        📧 Contact information not available
                      </Caption>
                      {currentProduct.createdAt && (
                        <Caption className="text-gray-500 text-sm mt-1">
                          📅 Listed on {new Date(currentProduct.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Caption>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex gap-5 mb-4">
                <div className="flex text-green">
                  {[...Array(5)].map((_, i) => (
                    <IoIosStar key={i} size={20} />
                  ))}
                </div>
                <Caption>({currentProduct.reviews?.length || 0} reviews)</Caption>
              </div>

              {/* Description */}
              <Body className="mb-6">
                {currentProduct.description || "Authentic antique piece with verified provenance."}
              </Body>

              {/* Item Details */}
              <div className="space-y-2 mb-6">
                <Caption><strong>Condition:</strong> {currentProduct.condition || "Excellent"}</Caption>
                <Caption><strong>Authenticity:</strong> {currentProduct.authenticity?.status || currentProduct.authenticity || "Verified"}</Caption>
                <Caption><strong>Provenance:</strong> {currentProduct.provenance || "Documented"}</Caption>
                {currentProduct.dimensions && (
                  <Caption><strong>Dimensions:</strong> {currentProduct.dimensions}</Caption>
                )}
                {currentProduct.material && (
                  <Caption><strong>Material:</strong> {currentProduct.material}</Caption>
                )}
              </div>

              {/* Time Left - Only show for timed auctions */}
              {currentProduct?.auctionType !== 'Live' && timeLeft !== "ended" && typeof timeLeft === "object" && (
                <>
                  <Caption className="mb-4">
                    <strong>
                      {timeLeft.status === 'upcoming' ? 'Auction starts in:' : 'Time left:'}
                    </strong>
                  </Caption>
                  <div className="flex gap-4 text-center mb-6">
                    <div className="p-4 px-6 shadow-s1 rounded-lg">
                      <Title level={4}>{timeLeft.days}</Title>
                      <Caption>Days</Caption>
                    </div>
                    <div className="p-4 px-6 shadow-s1 rounded-lg">
                      <Title level={4}>{timeLeft.hours}</Title>
                      <Caption>Hours</Caption>
                    </div>
                    <div className="p-4 px-6 shadow-s1 rounded-lg">
                      <Title level={4}>{timeLeft.minutes}</Title>
                      <Caption>Minutes</Caption>
                    </div>
                    <div className="p-4 px-6 shadow-s1 rounded-lg">
                      <Title level={4}>{timeLeft.seconds}</Title>
                      <Caption>Seconds</Caption>
                    </div>
                  </div>
                  {timeLeft.status === 'upcoming' && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                      <strong>Auction hasn't started yet</strong>
                    </div>
                  )}
                </>
              )}

              {/* Live Auction Status */}
              {currentProduct?.auctionType === 'Live' && timeLeft?.status === 'live' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <strong>Live Auction - Active Now!</strong>
                  </div>
                  <p className="mt-2 text-sm">
                    {currentProduct.instantPurchasePrice
                      ? `Bidding continues until someone bids ${formatETB(currentProduct.instantPurchasePrice)} or admin ends the auction.`
                      : 'Bidding continues until admin ends the auction.'
                    }
                  </p>
                </div>
              )}

              {timeLeft === "ended" && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <strong>
                    {currentProduct?.auctionType === 'Live'
                      ? (currentProduct?.instantPurchasePrice && getCurrentPrice() >= currentProduct.instantPurchasePrice
                          ? 'Auction Completed - Instant Purchase Price Reached!'
                          : 'Auction Ended by Administrator')
                      : 'Auction Ended'
                    }
                  </strong>
                </div>
              )}

              {/* Enhanced Auction Info */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                {/* Auction timing info - only for timed auctions */}
                {currentProduct?.auctionType !== 'Live' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Title className="flex items-center gap-2 mb-2">
                        {timeLeft?.status === 'upcoming' ? 'Auction starts:' : 'Auction ends:'}
                        <Caption>
                          {new Date(
                            timeLeft?.status === 'upcoming'
                              ? (currentProduct.auctionStartDate || currentProduct.startTime)
                              : (currentProduct.auctionEndDate || currentProduct.endTime)
                          ).toLocaleDateString()}
                        </Caption>
                      </Title>
                      <CountdownTimer
                        endDate={currentProduct.auctionEndDate || currentProduct.endTime}
                        auctionType={currentProduct.auctionType}
                        hideForLive={true}
                        className="mb-3"
                      />
                    </div>
                  </div>
                )}

                {/* Live auction info */}
                {currentProduct?.auctionType === 'Live' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Title className="flex items-center gap-2 mb-2">
                        Auction Type:
                        <Caption className="text-green-600 font-semibold">Live Auction</Caption>
                      </Title>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-700">
                          This is a live auction with no time limit.
                          {currentProduct.instantPurchasePrice && (
                            <span> Ends when someone bids {formatETB(currentProduct.instantPurchasePrice)} or admin closes it.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="text-right">
                    <Title className="flex items-center justify-end gap-2">
                      Current bid: <Caption className="text-3xl text-green">${getCurrentPrice().toLocaleString()}</Caption>
                    </Title>
                    <Caption className="text-gray-600">
                      {getBidsData()?.length || currentProduct?.totalBids || 0} bid{(getBidsData()?.length || currentProduct?.totalBids || 0) !== 1 ? 's' : ''}
                    </Caption>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Caption className="text-gray-600">Starting Price</Caption>
                    <Title level={5}>{formatETB(currentProduct.startingBid || currentProduct.startingPrice)}</Title>
                  </div>
                  {currentProduct.reservePrice && (
                    <div>
                      <Caption className="text-gray-600">Reserve Price</Caption>
                      <Title level={5} className={getCurrentPrice() >= currentProduct.reservePrice ? "text-green" : "text-orange-600"}>
                        {formatETB(currentProduct.reservePrice)}
                        {getCurrentPrice() >= currentProduct.reservePrice && " (Met)"}
                      </Title>
                    </div>
                  )}
                  {currentProduct.instantPurchasePrice && (
                    <div>
                      <Caption className="text-gray-600">Instant Purchase</Caption>
                      <Title level={5} className="text-red-500">{formatETB(currentProduct.instantPurchasePrice)}</Title>
                    </div>
                  )}
                  {currentProduct.buyNowPrice && (
                    <div>
                      <Caption className="text-gray-600">Buy Now Price</Caption>
                      <Title level={5} className="text-red-500">${currentProduct.buyNowPrice.toLocaleString()}</Title>
                    </div>
                  )}
                  {currentProduct.bidIncrement && (
                    <div>
                      <Caption className="text-gray-600">Bid Increment</Caption>
                      <Title level={5}>{formatETB(currentProduct.bidIncrement)}</Title>
                    </div>
                  )}
                </div>

                {/* Additional auction info row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <Caption className="text-gray-600">Auction Type</Caption>
                    <Title level={5} className={currentProduct.auctionType === 'Live' ? 'text-green' : 'text-blue-600'}>
                      {currentProduct.auctionType || 'Timed'}
                    </Title>
                  </div>
                  <div>
                    <Caption className="text-gray-600">Status</Caption>
                    <Title level={5} className={
                      currentProduct.isSoldout ? 'text-green' :
                      timeLeft === 'ended' ? 'text-red-500' :
                      timeLeft?.status === 'upcoming' ? 'text-orange-500' :
                      'text-blue-600'
                    }>
                      {currentProduct.isSoldout
                        ? 'Sold'
                        : currentProduct.auctionType === 'Live'
                          ? (timeLeft === 'ended' ? 'Ended' : 'Live')
                          : (timeLeft === 'ended' ? 'Ended' : (timeLeft?.status === 'upcoming' ? 'Upcoming' : 'Active'))
                      }
                    </Title>
                  </div>
                  <div>
                    <Caption className="text-gray-600">Verification</Caption>
                    <Title level={5} className={currentProduct.isverify ? 'text-green' : 'text-orange-500'}>
                      {currentProduct.isverify ? 'Verified' : 'Pending'}
                    </Title>
                  </div>
                  <div>
                    <Caption className="text-gray-600">Category</Caption>
                    <Title level={5} className="capitalize">{currentProduct.category || 'Uncategorized'}</Title>
                  </div>
                </div>
              </div>

              {/* Enhanced Bidding Section */}
              {((currentProduct?.auctionType === 'Live' && timeLeft?.status === 'live') ||
                (currentProduct?.auctionType !== 'Live' && timeLeft !== "ended" && timeLeft?.status !== 'upcoming')) && (
                <BiddingInterface
                  auction={{
                    id: currentProduct._id,
                    title: currentProduct.title,
                    currentBid: getCurrentPrice(),
                    startingBid: currentProduct.startingBid || currentProduct.startingPrice,
                    endDate: currentProduct.auctionEndDate || currentProduct.endTime,
                    totalBids: getBidsData()?.length || 0,
                    lastBidder: getBidsData()?.[0]?.bidder || getBidsData()?.[0]?.user,
                    reservePrice: currentProduct.reservePrice,
                    reserveMet: getCurrentPrice() >= (currentProduct.reservePrice || 0),
                    isSoldout: currentProduct.isSoldout,
                    auctionType: currentProduct.auctionType,
                    instantPurchasePrice: currentProduct.instantPurchasePrice
                  }}
                  onBidPlaced={handleBidPlaced}
                  className="mb-6"
                />
              )}

              {/* Buy Now Section */}
              {currentProduct.buyNowPrice && timeLeft !== "ended" && (
                <div className="p-6 shadow-s3 rounded-lg mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <GiTakeMyMoney size={24} className="text-red-500" />
                    <Title level={4}>Buy Now</Title>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-red-500 text-white py-3 px-8 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Buy Now for ${currentProduct.buyNowPrice}
                  </button>
                </div>
              )}
            </div>

          {/* Tabs Section */}
          <div className="details mt-12">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                className={`rounded-md px-6 py-3 transition-colors ${
                  activeTab === "description" ? "bg-primary text-white" : "bg-white text-black shadow-s3 hover:bg-gray-50"
                }`}
                onClick={() => handleTabClick("description")}
              >
                Description
              </button>
              <button
                className={`rounded-md px-6 py-3 transition-colors ${
                  activeTab === "auctionDetails" ? "bg-primary text-white" : "bg-white text-black shadow-s3 hover:bg-gray-50"
                }`}
                onClick={() => handleTabClick("auctionDetails")}
              >
                Auction Details
              </button>
              <button
                className={`rounded-md px-6 py-3 transition-colors ${
                  activeTab === "auctionHistory" ? "bg-primary text-white" : "bg-white text-black shadow-s3 hover:bg-gray-50"
                }`}
                onClick={() => handleTabClick("auctionHistory")}
              >
                Bid History ({getBidsData()?.length || 0})
              </button>
              <button
                className={`rounded-md px-6 py-3 transition-colors ${
                  activeTab === "provenance" ? "bg-primary text-white" : "bg-white text-black shadow-s3 hover:bg-gray-50"
                }`}
                onClick={() => handleTabClick("provenance")}
              >
                Provenance
              </button>
              <button
                className={`rounded-md px-6 py-3 transition-colors ${
                  activeTab === "reviews" ? "bg-primary text-white" : "bg-white text-black shadow-s3 hover:bg-gray-50"
                }`}
                onClick={() => handleTabClick("reviews")}
              >
                Reviews ({currentProduct.reviews?.length || 0})
              </button>
            </div>

            <div className="tab-content mt-8">
              {activeTab === "description" && (
                <div className="description-tab shadow-s3 p-8 rounded-md">
                  <Title level={4}>Description</Title>
                  <br />
                  <Caption className="leading-7">
                    {currentProduct.description || "No description available for this antique item."}
                  </Caption>
                  <br />
                  <Title level={4}>Product Overview</Title>
                  <div className="flex justify-between gap-5">
                    <div className="mt-4 capitalize w-1/2">
                      <div className="flex justify-between border-b py-3">
                        <Title>Category</Title>
                        <Caption>{currentProduct.category || 'Not specified'}</Caption>
                      </div>
                      {currentProduct.height && (
                        <div className="flex justify-between border-b py-3">
                          <Title>Height</Title>
                          <Caption>{currentProduct.height} (cm)</Caption>
                        </div>
                      )}
                      {currentProduct.lengthpic && (
                        <div className="flex justify-between border-b py-3">
                          <Title>Length</Title>
                          <Caption>{currentProduct.lengthpic} (cm)</Caption>
                        </div>
                      )}
                      {currentProduct.width && (
                        <div className="flex justify-between border-b py-3">
                          <Title>Width</Title>
                          <Caption>{currentProduct.width} (cm)</Caption>
                        </div>
                      )}
                      {currentProduct.weigth && (
                        <div className="flex justify-between border-b py-3">
                          <Title>Weight</Title>
                          <Caption>{currentProduct.weigth} (kg)</Caption>
                        </div>
                      )}
                      {currentProduct.mediumused && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Medium Used</Title>
                          <Caption>{currentProduct.mediumused}</Caption>
                        </div>
                      )}
                      {currentProduct.materials && currentProduct.materials.length > 0 && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Materials</Title>
                          <Caption>{currentProduct.materials.join(', ')}</Caption>
                        </div>
                      )}
                      {currentProduct.era && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Era</Title>
                          <Caption>{currentProduct.era}</Caption>
                        </div>
                      )}
                      {currentProduct.period && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Period</Title>
                          <Caption>{currentProduct.period}</Caption>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b">
                        <Title>Starting Price</Title>
                        <Caption>{formatETB(currentProduct.startingBid || currentProduct.startingPrice || 0)}</Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Current Price</Title>
                        <Caption className="text-green font-semibold">{formatETB(getCurrentPrice())}</Caption>
                      </div>
                      {currentProduct.reservePrice && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Reserve Price</Title>
                          <Caption className={getCurrentPrice() >= currentProduct.reservePrice ? "text-green" : "text-orange-600"}>
                            {formatETB(currentProduct.reservePrice)}
                            {getCurrentPrice() >= currentProduct.reservePrice && " (Met)"}
                          </Caption>
                        </div>
                      )}
                      {currentProduct.instantPurchasePrice && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Instant Purchase Price</Title>
                          <Caption className="text-red-500">{formatETB(currentProduct.instantPurchasePrice)}</Caption>
                        </div>
                      )}
                      {currentProduct.bidIncrement && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Bid Increment</Title>
                          <Caption>{formatETB(currentProduct.bidIncrement)}</Caption>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b">
                        <Title>Total Bids</Title>
                        <Caption>{getBidsData()?.length || currentProduct?.totalBids || 0}</Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Auction Type</Title>
                        <Caption className={currentProduct.auctionType === 'Live' ? 'text-green' : 'text-blue-600'}>
                          {currentProduct.auctionType || 'Timed'}
                        </Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Auction Status</Title>
                        <Caption className={
                          currentProduct.isSoldout ? 'text-green' :
                          timeLeft === 'ended' ? 'text-red-500' :
                          timeLeft?.status === 'upcoming' ? 'text-orange-500' :
                          'text-blue-600'
                        }>
                          {currentProduct.isSoldout
                            ? 'Sold'
                            : currentProduct.auctionType === 'Live'
                              ? (timeLeft === 'ended' ? 'Ended' : 'Live')
                              : (timeLeft === 'ended' ? 'Ended' : (timeLeft?.status === 'upcoming' ? 'Upcoming' : 'Active'))
                          }
                        </Caption>
                      </div>
                      {currentProduct.auctionStartDate && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Auction Start</Title>
                          <Caption>{new Date(currentProduct.auctionStartDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</Caption>
                        </div>
                      )}
                      {currentProduct.auctionEndDate && currentProduct.auctionType !== 'Live' && (
                        <div className="flex justify-between py-3 border-b">
                          <Title>Auction End</Title>
                          <Caption>{new Date(currentProduct.auctionEndDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</Caption>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-b">
                        <Title>Verified</Title>
                        <Caption className={currentProduct.isverify ? 'text-green' : 'text-orange-500'}>
                          {currentProduct.isverify ? 'Yes' : 'Pending'}
                        </Caption>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <Title>Created At</Title>
                        <Caption>{new Date(currentProduct.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</Caption>
                      </div>
                      <div className="flex justify-between py-3">
                        <Title>Updated At</Title>
                        <Caption>{new Date(currentProduct.updatedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</Caption>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className="h-[60vh] p-2 bg-green rounded-xl">
                        <img
                          src={getMainImageUrl()}
                          alt={currentProduct.title}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = "/images/placeholder-antique.jpg";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "auctionDetails" && (
                <div className="auction-details-tab shadow-s3 p-8 rounded-md">
                  <Title level={4}>Comprehensive Auction Details</Title>
                  <hr className="my-5" />

                  {/* Auction Timing Section */}
                  <div className="mb-8">
                    <Title level={5} className="mb-4">Auction Timing</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Auction Type:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentProduct.auctionType === 'Live' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {currentProduct.auctionType || 'Timed'}
                          </span>
                        </div>
                        {currentProduct.auctionStartDate && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Start Date:</span>
                            <span>{new Date(currentProduct.auctionStartDate).toLocaleString()}</span>
                          </div>
                        )}
                        {currentProduct.auctionEndDate && currentProduct.auctionType !== 'Live' && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">End Date:</span>
                            <span>{new Date(currentProduct.auctionEndDate).toLocaleString()}</span>
                          </div>
                        )}
                        {currentProduct.auctionType === 'Live' && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-700">
                              <strong>Live Auction:</strong> This auction has no fixed end time.
                              {currentProduct.instantPurchasePrice && (
                                <span> It will end when someone bids {formatETB(currentProduct.instantPurchasePrice)} or the administrator closes it.</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Current Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentProduct.isSoldout ? 'bg-green-100 text-green-800' :
                            timeLeft === 'ended' ? 'bg-red-100 text-red-800' :
                            timeLeft?.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {currentProduct.isSoldout
                              ? 'Sold'
                              : currentProduct.auctionType === 'Live'
                                ? (timeLeft === 'ended' ? 'Ended' : 'Live')
                                : (timeLeft === 'ended' ? 'Ended' : (timeLeft?.status === 'upcoming' ? 'Upcoming' : 'Active'))
                            }
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Verification Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentProduct.isverify ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {currentProduct.isverify ? 'Verified' : 'Pending Approval'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Listed On:</span>
                          <span>{new Date(currentProduct.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-8">
                    <Title level={5} className="mb-4">Pricing Information</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Starting Price:</span>
                          <span className="text-lg font-semibold">{formatETB(currentProduct.startingBid || currentProduct.startingPrice || 0)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Current Price:</span>
                          <span className="text-lg font-semibold text-green-600">{formatETB(getCurrentPrice())}</span>
                        </div>
                        {currentProduct.reservePrice && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Reserve Price:</span>
                            <span className={`text-lg font-semibold ${getCurrentPrice() >= currentProduct.reservePrice ? "text-green-600" : "text-orange-600"}`}>
                              {formatETB(currentProduct.reservePrice)}
                              {getCurrentPrice() >= currentProduct.reservePrice && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Met</span>
                              )}
                            </span>
                          </div>
                        )}
                        {currentProduct.instantPurchasePrice && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Instant Purchase:</span>
                            <span className="text-lg font-semibold text-red-500">{formatETB(currentProduct.instantPurchasePrice)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {currentProduct.bidIncrement && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Bid Increment:</span>
                            <span>{formatETB(currentProduct.bidIncrement)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="font-medium">Total Bids:</span>
                          <span className="font-semibold">{getBidsData()?.length || currentProduct?.totalBids || 0}</span>
                        </div>
                        {getBidsData()?.length > 0 && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Last Bid:</span>
                            <span>{new Date(getBidsData()[0]?.createdAt || Date.now()).toLocaleString()}</span>
                          </div>
                        )}
                        {currentProduct.finalPrice && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Final Sale Price:</span>
                            <span className="text-lg font-semibold text-green-600">{formatETB(currentProduct.finalPrice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="mb-8">
                    <Title level={5} className="mb-4">Seller Information</Title>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green text-white rounded-full flex items-center justify-center font-semibold text-lg">
                          {currentProduct.user?.name ? currentProduct.user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-medium">{currentProduct.user?.name || 'Anonymous Seller'}</p>
                          {currentProduct.user?.email && (
                            <p className="text-sm text-gray-600">{currentProduct.user.email}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Member since {new Date(currentProduct.user?.createdAt || currentProduct.createdAt).getFullYear()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(currentProduct.condition || currentProduct.authenticity || currentProduct.provenance) && (
                    <div className="mb-8">
                      <Title level={5} className="mb-4">Item Condition & Authenticity</Title>
                      <div className="space-y-3">
                        {currentProduct.condition && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Condition:</span>
                            <span>{currentProduct.condition}</span>
                          </div>
                        )}
                        {currentProduct.authenticity && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium">Authenticity:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              currentProduct.authenticity.status === 'Verified' ? 'bg-green-100 text-green-800' :
                              currentProduct.authenticity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {currentProduct.authenticity.status || currentProduct.authenticity || 'Pending'}
                            </span>
                          </div>
                        )}
                        {currentProduct.provenance && (
                          <div className="py-2">
                            <span className="font-medium">Provenance:</span>
                            <p className="mt-1 text-sm text-gray-700">{currentProduct.provenance}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "auctionHistory" && (
                <BidHistory
                  auctionId={currentProduct._id}
                  className="shadow-s3 rounded-md"
                />
              )}
              {activeTab === "provenance" && (
                <div className="provenance-tab shadow-s3 p-8 rounded-md">
                  <Title level={4}>Provenance & Authenticity</Title>
                  <hr className="my-5" />

                  {currentProduct.provenance ? (
                    <div className="mb-6">
                      <Title level={5}>Provenance</Title>
                      <Caption className="leading-7 mt-2">
                        {currentProduct.provenance}
                      </Caption>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Title level={5}>Provenance</Title>
                      <Caption className="text-gray-500">No provenance information available.</Caption>
                    </div>
                  )}

                  {currentProduct.authenticity && (
                    <div className="mb-6">
                      <Title level={5}>Authenticity</Title>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentProduct.authenticity.status === 'Verified' ? 'bg-green-100 text-green-800' :
                            currentProduct.authenticity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {currentProduct.authenticity.status || 'Pending'}
                          </span>
                        </div>
                        {currentProduct.authenticity.verifiedBy && (
                          <Caption>Verified by: {currentProduct.authenticity.verifiedBy}</Caption>
                        )}
                        {currentProduct.authenticity.verificationDate && (
                          <Caption>Verification Date: {new Date(currentProduct.authenticity.verificationDate).toLocaleDateString()}</Caption>
                        )}
                        {currentProduct.authenticity.certificateNumber && (
                          <Caption>Certificate Number: {currentProduct.authenticity.certificateNumber}</Caption>
                        )}
                      </div>
                    </div>
                  )}

                  {currentProduct.maker && (
                    <div className="mb-6">
                      <Title level={5}>Maker Information</Title>
                      <div className="mt-2">
                        {currentProduct.maker.name && (
                          <Caption>Name: {currentProduct.maker.name}</Caption>
                        )}
                        {currentProduct.maker.nationality && (
                          <Caption>Nationality: {currentProduct.maker.nationality}</Caption>
                        )}
                        {currentProduct.maker.lifespan && (
                          <Caption>Lifespan: {currentProduct.maker.lifespan}</Caption>
                        )}
                      </div>
                    </div>
                  )}

                  {currentProduct.appraisal && (
                    <div className="mb-6">
                      <Title level={5}>Appraisal Information</Title>
                      <div className="mt-2">
                        {currentProduct.appraisal.estimatedValue && (
                          <Caption>Estimated Value: ${currentProduct.appraisal.estimatedValue.toLocaleString()}</Caption>
                        )}
                        {currentProduct.appraisal.appraisedBy && (
                          <Caption>Appraised by: {currentProduct.appraisal.appraisedBy}</Caption>
                        )}
                        {currentProduct.appraisal.appraisalDate && (
                          <Caption>Appraisal Date: {new Date(currentProduct.appraisal.appraisalDate).toLocaleDateString()}</Caption>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="reviews-tab shadow-s3 p-8 rounded-md">
                  <Title level={5} className=" font-normal">
                    Reviews
                  </Title>
                  <hr className="my-5" />
                  <Title level={5} className=" font-normal text-red-500">
                    Coming Soon!
                  </Title>
                </div>
              )}
              {activeTab === "moreProducts" && (
                <div className="more-products-tab shadow-s3 p-8 rounded-md">
                  <h1>More Products</h1>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};
export const AuctionHistory = () => {
  return (
    <section className="py-16">
      <Container>
        <div className="shadow-s1 p-8 rounded-lg">
        <Title level={5} className=" font-normal">
          Auction History
        </Title>
        <hr className="my-5" />

        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-5">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Bid Amount(USD)
                </th>
                <th scope="col" className="px-6 py-3">
                  User
                </th>
                <th scope="col" className="px-6 py-3">
                  Auto
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">December 31, 2024 12:00 am</td>
                <td className="px-6 py-4">$200</td>
                <td className="px-6 py-4">Sunil Pokhrel</td>
                <td className="px-6 py-4"> </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </Container>
    </section>
  );
};
