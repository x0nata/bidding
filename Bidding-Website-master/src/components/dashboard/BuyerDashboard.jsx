import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import { BsCashCoin } from 'react-icons/bs';
import { CiMedal } from 'react-icons/ci';
import { GiBarbedStar } from 'react-icons/gi';

import { RiAuctionFill } from 'react-icons/ri';
import { MdOutlineGavel, MdTrendingUp } from 'react-icons/md';
import { FiShoppingBag, FiClock, FiHeart } from 'react-icons/fi';
import { getUserBids } from '../../redux/slices/biddingSlice';
import { formatETB } from '../../utils/currency';

export const BuyerDashboard = ({ 
  user, 
  userBids, 
  wonProducts, 
  bidsLoading, 
  bidsError,
  getActiveUserBids,
  getUserBalance 
}) => {
  const dispatch = useDispatch();

  // Calculate buyer-specific metrics
  const totalBidsPlaced = Array.isArray(userBids) ? userBids.length : 0;
  const activeBids = getActiveUserBids();
  const wonAuctions = wonProducts.length;

  return (
    <>
      {/* Welcome Section */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="text-primary mb-2">
              Buyer Dashboard - Welcome back, {user?.name}! 🎯
            </Title>
            <Body className="text-gray-600">
              Track your bidding activity, manage your watchlist, and discover amazing antique treasures.
            </Body>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Caption className="text-green-600">Account Balance: {formatETB(user?.balance || 0)}</Caption>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <Caption className="text-blue-600">Active Bids: {activeBids}</Caption>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="/images/dashboard/buyer-welcome.png" 
              alt="Buyer Dashboard" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Buyer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Account Balance */}
        <div className="shadow-s3 border border-blue-200 bg-blue-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <BsCashCoin size={60} className="text-blue-600" />
          <div>
            <Title level={1} className="text-blue-800">{formatETB(getUserBalance())}</Title>
            <Caption className="text-blue-600">Account Balance</Caption>
          </div>
        </div>

        {/* Active Bids */}
        <div className="shadow-s3 border border-orange-200 bg-orange-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <MdOutlineGavel size={60} className="text-orange-600" />
          <div>
            <Title level={1} className="text-orange-800">{activeBids}</Title>
            <Caption className="text-orange-600">Active Bids</Caption>
          </div>
        </div>

        {/* Items Won */}
        <div className="shadow-s3 border border-green-200 bg-green-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <CiMedal size={60} className="text-green-600" />
          <div>
            <Title level={1} className="text-green-800">{wonAuctions}</Title>
            <Caption className="text-green-600">Items Won</Caption>
          </div>
        </div>

        {/* Total Bids */}
        <div className="shadow-s3 border border-purple-200 bg-purple-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <GiBarbedStar size={60} className="text-purple-600" />
          <div>
            <Title level={1} className="text-purple-800">{totalBidsPlaced}</Title>
            <Caption className="text-purple-600">Total Bids</Caption>
          </div>
        </div>
      </div>

      {/* Quick Actions for Buyers */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <Title level={5} className="font-normal mb-6">
          Quick Actions
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NavLink
            to="/"
            className="bg-primary text-white p-4 rounded-lg text-center hover:bg-primary-dark transition-colors"
          >
            <FiShoppingBag size={24} className="mx-auto mb-2" />
            <span>Browse Auctions</span>
          </NavLink>

          <NavLink
            to="/my-bids"
            className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
          >
            <MdOutlineGavel size={24} className="mx-auto mb-2" />
            <span>My Bids</span>
          </NavLink>

          <NavLink
            to="/"
            className="bg-red-500 text-white p-4 rounded-lg text-center hover:bg-red-600 transition-colors"
          >
            <FiHeart size={24} className="mx-auto mb-2" />
            <span>Browse Items</span>
          </NavLink>

          <NavLink
            to="/winning-products"
            className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
          >
            <CiMedal size={24} className="mx-auto mb-2" />
            <span>Won Items</span>
          </NavLink>
        </div>

        {/* Onboarding Link */}
        <div className="mt-4 text-center">
          <NavLink
            to="/onboarding/buyer"
            className="text-primary hover:text-primary-dark transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>📚 Revisit Buyer Guide</span>
          </NavLink>
        </div>
      </div>

      {/* Recent Bidding Activity */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <Title level={5} className="font-normal">
            Recent Bidding Activity
          </Title>
          <NavLink to="/profile" className="text-primary hover:text-primary-dark text-sm">
            View All →
          </NavLink>
        </div>

        {bidsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading your bids...</p>
          </div>
        ) : bidsError ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading bids: {bidsError}</p>
            <button 
              onClick={() => dispatch(getUserBids())}
              className="mt-2 text-primary hover:text-primary-dark text-sm"
            >
              Try again
            </button>
          </div>
        ) : Array.isArray(userBids) && userBids.length > 0 ? (
          <div className="space-y-4">
            {userBids.slice(0, 5).map((bid) => (
              <div key={bid._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={bid.product?.image || "/images/placeholder.jpg"}
                    alt={bid.product?.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <Title className="text-sm font-medium">{bid.product?.title}</Title>
                    <p className="text-gray-500 text-sm">Bid placed: ${bid.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    bid.status === "winning" ? "bg-green-100 text-green-700" :
                    bid.status === "outbid" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {bid.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <RiAuctionFill size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No recent bidding activity</p>
            <NavLink to="/" className="text-primary hover:underline">
              Start bidding on antiques
            </NavLink>
          </div>
        )}
      </div>

      {/* Recommended Items */}
      <div className="shadow-s1 p-8 rounded-lg">
        <Title level={5} className="font-normal mb-6">
          Recommended for You
        </Title>
        <div className="text-center py-8 text-gray-500">
          <MdTrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Personalized recommendations coming soon!</p>
          <p className="text-sm mt-2">Based on your bidding history and interests</p>
        </div>
      </div>
    </>
  );
};
