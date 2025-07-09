import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { RiAuctionFill } from "react-icons/ri";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdVerified } from "react-icons/md";
import { Caption, ProfileCard, Title } from "../common/Design";
import { placeBid } from "../../redux/slices/biddingSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import WatchlistButton from "../common/WatchlistButton";
import { formatETB } from "../../utils/currency";

export const ProductCard = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [showBidInput, setShowBidInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate time left for auction - only for timed auctions
  useEffect(() => {
    // For live auctions, show different status
    if (item?.auctionType === 'Live') {
      setTimeLeft(item?.isSoldout ? "Auction Ended" : "Live Auction");
      return;
    }

    // For timed auctions, calculate countdown
    if (item?.endTime || item?.auctionEndDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(item.endTime || item.auctionEndDate).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${minutes}m ${seconds}s`);
          }
        } else {
          setTimeLeft("Auction Ended");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [item?.endTime, item?.auctionEndDate, item?.auctionType, item?.isSoldout]);



  const handleQuickBid = async () => {
    if (!isAuthenticated) {
      dispatch(showError("Please login to place bids"));
      navigate("/login");
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= parseFloat(item.currentBid || item.startingPrice)) {
      dispatch(showError("Bid amount must be higher than current bid"));
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(placeBid({
        productId: item._id,
        amount: parseFloat(bidAmount),
      })).unwrap();

      dispatch(showSuccess("Bid placed successfully!"));
      setShowBidInput(false);
      setBidAmount("");
    } catch (error) {
      dispatch(showError(error || "Failed to place bid"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      dispatch(showError("Please login to buy items"));
      navigate("/login");
      return;
    }

    if (item.buyNowPrice || item.instantPurchasePrice) {
      navigate(`/details/${item._id}?action=buynow`);
    } else {
      dispatch(showError("Buy Now option not available for this item"));
    }
  };

  const getStatusColor = () => {
    if (item?.status === "ended" || timeLeft === "Auction Ended") return "text-red-500 bg-red-100";
    if (item?.auctionType === "Live" && !item?.isSoldout) return "text-green-500 bg-green-100";
    if (item?.status === "active") return "text-green bg-green_100";
    if (item?.status === "upcoming") return "text-blue-500 bg-blue-100";
    return "text-gray-500 bg-gray-100";
  };

  const getStatusText = () => {
    if (item?.status === "ended" || timeLeft === "Auction Ended") return "Ended";
    if (item?.auctionType === "Live" && !item?.isSoldout) return "Live Auction";
    if (item?.status === "active") return "Active";
    if (item?.status === "upcoming") return "Upcoming";
    return "Available";
  };

  return (
    <>
      <div className="bg-white shadow-s1 rounded-xl p-3">
        <div className="h-56 relative overflow-hidden">
          <NavLink to={`/details/${item?._id}`}>
            <img src={item?.image} alt={item?.image} className="w-full h-full object-cover rounded-xl hover:scale-105 hover:cursor-pointer transition-transform duration-300 ease-in-out" />
          </NavLink>
          <ProfileCard className="shadow-s1 absolute right-3 bottom-3">
            <RiAuctionFill size={22} className="text-green" />
          </ProfileCard>

          {/* Certificate Verification Badge */}
          {item?.certificate && (
            <div className="absolute top-3 left-3 bg-green text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <MdVerified size={14} />
              Certified
            </div>
          )}

          <div className="absolute top-0 left-0 p-2 w-full">
            <div className="flex items-center justify-between">
              <Caption className={`px-3 py-1 text-sm rounded-full ${getStatusColor()}`}>
                {getStatusText()}
              </Caption>
              <div className="flex gap-2">
                <Caption className="text-white bg-black bg-opacity-70 px-3 py-1 text-sm rounded-full">
                  {item?.totalBids || 0} Bids
                </Caption>
                {timeLeft && (
                  <Caption className="text-white bg-black bg-opacity-70 px-3 py-1 text-sm rounded-full">
                    {timeLeft}
                  </Caption>
                )}
              </div>
            </div>
          </div>

          {/* Watchlist Button */}
          <div className="absolute top-3 right-3">
            <WatchlistButton
              productId={item?._id}
              size={20}
              className="bg-white bg-opacity-80 hover:bg-opacity-100"
            />
          </div>
        </div>
        <div className="details mt-4">
          <NavLink to={`/details/${item?._id}`}>
            <Title className="uppercase hover:text-primary transition-colors cursor-pointer">
              {item?.title || "Antique Item"}
            </Title>
          </NavLink>

          {/* Category and Era */}
          <div className="flex items-center gap-2 mt-2">
            <Caption className="text-gray-500">{item?.category?.name || "Antique"}</Caption>
            {item?.era && (
              <>
                <span className="text-gray-300">•</span>
                <Caption className="text-gray-500">{item.era}</Caption>
              </>
            )}
          </div>

          {/* Listed by User */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
                {item?.user?.name ? item.user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col">
                <Caption className="text-gray-600 text-xs">
                  Listed by <span className="font-medium text-gray-800">
                    {item?.user?.name || 'Anonymous Seller'}
                  </span>
                </Caption>
                {item.createdAt && (
                  <Caption className="text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Caption>
                )}
              </div>
            </div>
          </div>

          <hr className="mt-3" />

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <RiAuctionFill size={35} className="text-green" />
              </div>
              <div>
                <Caption className="text-green">Current Bid</Caption>
                <Title className="text-lg">
                  {formatETB(item?.currentBid || item?.startingPrice || item?.biddingPrice || 0)}
                </Title>
              </div>
            </div>

            {(item?.buyNowPrice || item?.instantPurchasePrice) && (
              <>
                <div className="w-[1px] h-10 bg-gray-300"></div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <GiTakeMyMoney size={35} className="text-red-500" />
                  </div>
                  <div>
                    <Caption className="text-red-500">
                      {item?.auctionType === 'Live' ? 'Instant Win' : 'Buy Now'}
                    </Caption>
                    <Title className="text-lg">
                      {formatETB(item.buyNowPrice || item.instantPurchasePrice)}
                    </Title>
                  </div>
                </div>
              </>
            )}
          </div>

          <hr className="mb-3" />

          {/* Quick Bid Input */}
          {showBidInput && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ETB ${(parseFloat(item?.currentBid || item?.startingPrice || 0) + 1).toFixed(0)}`}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  min={parseFloat(item?.currentBid || item?.startingPrice || 0) + 1}
                  step="1"
                />
                <button
                  onClick={handleQuickBid}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isLoading ? "..." : "Bid"}
                </button>
                <button
                  onClick={() => setShowBidInput(false)}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 gap-2">
            {item?.status !== "ended" && timeLeft !== "Auction Ended" ? (
              <button
                onClick={() => setShowBidInput(!showBidInput)}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                {showBidInput ? "Cancel" : "Place Bid"}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg text-sm cursor-not-allowed"
              >
                Auction Ended
              </button>
            )}

            {(item?.buyNowPrice || item?.instantPurchasePrice) && item?.status !== "ended" && timeLeft !== "Auction Ended" && (
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                {item?.auctionType === 'Live' ? 'Instant Win' : 'Buy Now'}
              </button>
            )}

            <WatchlistButton
              productId={item?._id}
              size={20}
              className="border border-gray-300 hover:bg-gray-50"
            />
          </div>

          {/* Additional Info */}
          <div className="mt-3 text-center">
            <NavLink
              to={`/details/${item?._id}`}
              className="text-sm text-primary hover:underline"
            >
              View Details →
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

ProductCard.propTypes = {
  item: PropTypes.any,
};
