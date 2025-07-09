import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { Title, Body, Caption } from "../../components/common/Design";
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiAward,
  FiClock,
  FiEye,
  FiRefreshCw,
  FiArrowRight,
  FiActivity
} from "react-icons/fi";
import {
  MdGavel,
  MdTrendingUp,
  MdOutlineCategory,
  MdOutlineTimer,
  MdOutlineShoppingCart,
  MdDashboard
} from "react-icons/md";
import { BsGraphUp, BsCollection, BsCashCoin } from "react-icons/bs";
import { RiAuctionFill } from "react-icons/ri";
import { CiMedal } from "react-icons/ci";
import { GiBarbedStar } from "react-icons/gi";
import { HiOutlineUsers } from "react-icons/hi2";
import { apiEndpoints } from "../../services/api";
import { adminAnalyticsApi } from "../../services/adminApi";
import { getUserBids } from "../../redux/slices/biddingSlice";
import { formatETB } from "../../utils/currency";

// Import new modern dashboard components
import { ModernStatsCard } from "../../components/dashboard/ModernStatsCard";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { RecentBids } from "../../components/dashboard/RecentBids";
import { WonItems } from "../../components/dashboard/WonItems";
import { ActiveAuctions } from "../../components/dashboard/ActiveAuctions";
import { ActiveBidsCounter } from "../../components/dashboard/ActiveBidsCounter";

// Import custom hook and utilities
import { useDashboard } from "../../hooks/useDashboard";
import { DashboardErrorBoundary } from "../../components/common/ErrorBoundary";
import { DashboardSkeleton } from "../../components/common/LoadingSkeleton";

export const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    user,
    userProducts,
    wonProducts,
    activeAuctions,
    userBids,
    dashboardLoading,
    productsLoading,
    bidsLoading,
    bidsError,
    lastRefresh,
    refreshBids,
    refreshProducts,
    refreshAuctions,
    refreshAll,
    stats,
    generateActivityFeed
  } = useDashboard();

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
  });

  const role = user?.role || "user";

  useEffect(() => {
    // Load admin stats if admin
    if (role === "admin") {
      loadAdminStats();
    }
  }, [role]);

  const loadAdminStats = async () => {
    try {
      // Use the correct admin analytics API that makes proper backend calls
      const stats = await adminAnalyticsApi.getSystemStats();
      setAdminStats({
        totalUsers: stats.totalUsers,
        totalProducts: stats.totalProducts,
        totalCategories: 0, // This would need to be added to backend if needed
        totalRevenue: stats.totalRevenue,
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  // Render modern dashboard content
  const renderModernDashboard = () => {
    if (role === "admin") {
      return renderAdminDashboard();
    }

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="text-gray-800 mb-2">
                Welcome back, {user?.name}! 👋
              </Title>
              <Body className="text-gray-600 mb-4">
                Here's what's happening with your auctions today.
                {lastRefresh && (
                  <span className="text-sm text-gray-500 block mt-1">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </Body>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Caption className="text-green-600 font-medium">
                    {stats.activeBids} Active Bids
                  </Caption>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <Caption className="text-blue-600 font-medium">
                    {stats.itemsWon} Items Won
                  </Caption>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <Caption className="text-purple-600 font-medium">
                    {formatETB(stats.balance)} Balance
                  </Caption>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <MdGavel size={40} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatsCard
            title="Account Balance"
            value={formatETB(stats.balance)}
            icon={FiDollarSign}
            color="green"
            subtitle="Available funds"
            loading={dashboardLoading}
            onClick={() => window.location.href = '/profile'}
          />
          <ModernStatsCard
            title="Active Bids"
            value={stats.activeBids}
            icon={MdGavel}
            color="blue"
            subtitle="Currently bidding"
            loading={bidsLoading}
            trend={stats.winningBids > 0 ? `${stats.winningBids} winning` : null}
            trendDirection="up"
            onClick={() => window.location.href = '/my-bids'}
          />
          <ModernStatsCard
            title="Items Won"
            value={stats.itemsWon}
            icon={FiAward}
            color="purple"
            subtitle="Successful auctions"
            loading={productsLoading}
            onClick={() => window.location.href = '/antiques'}
          />
          <ModernStatsCard
            title="Total Bid Value"
            value={formatETB(stats.totalBidsValue)}
            icon={FiTrendingUp}
            color="orange"
            subtitle="All time bids"
            loading={bidsLoading}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions userRole={role} />

        {/* Active Bids Counter */}
        <div className="slide-up">
          <ActiveBidsCounter />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bids */}
          <div className="slide-up">
            <RecentBids
              bids={userBids}
              loading={bidsLoading}
              error={bidsError}
              onRefresh={refreshBids}
            />
          </div>

          {/* Activity Feed */}
          <div className="slide-up">
            <ActivityFeed
              activities={generateActivityFeed()}
              loading={dashboardLoading}
              onRefresh={refreshAll}
            />
          </div>
        </div>

        {/* Won Items */}
        <div className="slide-up">
          <WonItems
            wonItems={wonProducts}
            loading={productsLoading}
            onRefresh={refreshProducts}
          />
        </div>

        {/* Active Auctions */}
        <div className="slide-up">
          <ActiveAuctions
            auctions={activeAuctions}
            loading={productsLoading}
            onRefresh={refreshAuctions}
          />
        </div>
      </div>
    );
  };



  // Admin dashboard (keep existing admin functionality)
  const renderAdminDashboard = () => (
    <>
      <section>
        <div className="shadow-s1 p-8 rounded-lg mb-12">
          <Title level={5} className="font-normal">
            Admin Dashboard
          </Title>
          <hr className="my-5" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {/* Admin Stats Cards */}
            <ModernStatsCard
              title="Account Balance"
              value={formatETB(stats.balance)}
              icon={FiDollarSign}
              color="green"
              subtitle="Available funds"
              loading={dashboardLoading}
            />

            <ModernStatsCard
              title="Items Won"
              value={stats.itemsWon}
              icon={FiAward}
              color="blue"
              subtitle="Successful auctions"
              loading={productsLoading}
            />

            <ModernStatsCard
              title="Your Products"
              value={stats.totalListings}
              icon={BsCollection}
              color="purple"
              subtitle="Listed items"
              loading={productsLoading}
            />

            {/* Admin-specific stats */}
            {role === "admin" && (
              <>
                <ModernStatsCard
                  title="All Products"
                  value={adminStats.totalProducts}
                  icon={MdOutlineCategory}
                  color="orange"
                  subtitle="Platform total"
                  loading={dashboardLoading}
                />
                <ModernStatsCard
                  title="All Users"
                  value={adminStats.totalUsers}
                  icon={FiShoppingBag}
                  color="indigo"
                  subtitle="Registered users"
                  loading={dashboardLoading}
                />
                <ModernStatsCard
                  title="Live Auctions"
                  value={activeAuctions.length}
                  icon={RiAuctionFill}
                  color="green"
                  subtitle="Currently active"
                  loading={productsLoading}
                />
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shadow-s1 p-8 rounded-lg mb-12">
          <Title level={5} className="font-normal mb-6">
            Quick Actions
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NavLink
              to="/add-product"
              className="bg-primary text-white p-4 rounded-lg text-center hover:bg-primary-dark transition-colors"
            >
              <MdDashboard size={24} className="mx-auto mb-2" />
              <span>Add Product</span>
            </NavLink>

            <NavLink
              to="/product"
              className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
            >
              <GiBarbedStar size={24} className="mx-auto mb-2" />
              <span>My Products</span>
            </NavLink>

            <NavLink
              to="/winning-products"
              className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
            >
              <CiMedal size={24} className="mx-auto mb-2" />
              <span>Won Items</span>
            </NavLink>

            {role === "admin" && (
              <NavLink
                to="/userlist"
                className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600 transition-colors"
              >
                <HiOutlineUsers size={24} className="mx-auto mb-2" />
                <span>Manage Users</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="shadow-s1 p-8 rounded-lg">
          <Title level={5} className="font-normal mb-6">
            Recent Activity
          </Title>

          {bidsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading your bids...</p>
            </div>
          ) : bidsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading bids: {bidsError}</p>
              <button
                onClick={refreshBids}
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
              <p>No recent activity</p>
              <NavLink to="/" className="text-primary hover:underline">
                Start bidding on antiques
              </NavLink>
            </div>
          )}
        </div>
      </section>
    </>
  );

  // Main return statement - render modern dashboard
  return (
    <DashboardErrorBoundary fallbackMessage="The dashboard encountered an error. Please refresh the page to try again.">
      <section className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {dashboardLoading ? (
            <DashboardSkeleton />
          ) : (
            renderModernDashboard()
          )}
        </div>
      </section>
    </DashboardErrorBoundary>
  );
};

export const UserProduct = () => {
  return (
    <>
      <div className="shadow-s1 p-8 rounded-lg">
        <Title level={5} className=" font-normal">
          Purchasing
        </Title>
        <hr className="my-5" />
        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-5">
                  Title
                </th>
                <th scope="col" className="px-6 py-3">
                  Bidding ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Bid Amount(ETB)
                </th>
                <th scope="col" className="px-6 py-3">
                  Image
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">Auction Title 01</td>
                <td className="px-6 py-4">Bidding_HvO253gT</td>
                <td className="px-6 py-4">1222.8955</td>
                <td className="px-6 py-4">
                  <img className="w-10 h-10" src="https://bidout-react.vercel.app/images/bg/order1.png" alt="Jeseimage" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green me-2"></div> Success
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <NavLink to="#" type="button" className="font-medium text-green">
                    <MdDashboard size={25} />
                  </NavLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
