import React from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import { MdOutlineInventory } from 'react-icons/md';
import { GiBarbedStar } from 'react-icons/gi';
import { RiAuctionFill } from 'react-icons/ri';
import { FiPackage, FiDollarSign, FiBarChart2, FiPlus } from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi';
import { IoStatsChartOutline } from 'react-icons/io5';

export const SellerDashboard = ({ 
  user, 
  userProducts, 
  activeAuctions,
  getUserBalance 
}) => {
  // Calculate seller-specific metrics
  const totalListings = Array.isArray(userProducts) ? userProducts.length : 0;
  const activeListings = Array.isArray(userProducts) 
    ? userProducts.filter(product => product.status === 'active').length 
    : 0;
  const soldItems = Array.isArray(userProducts) 
    ? userProducts.filter(product => product.status === 'sold').length 
    : 0;
  const totalRevenue = Array.isArray(userProducts) 
    ? userProducts.reduce((sum, product) => {
        return sum + (product.status === 'sold' ? (product.currentBid || product.price || 0) : 0);
      }, 0)
    : 0;

  return (
    <>
      {/* Welcome Section */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="text-primary mb-2">
              Seller Dashboard - {user?.name} 📈
            </Title>
            <Body className="text-gray-600">
              Manage your antique listings, track sales performance, and grow your business.
            </Body>
          </div>
          <div className="hidden md:block">
            <img 
              src="/images/dashboard/seller-welcome.png" 
              alt="Seller Dashboard" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Seller Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="shadow-s3 border border-green-200 bg-green-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <FiDollarSign size={60} className="text-green-600" />
          <div>
            <Title level={1} className="text-green-800">${totalRevenue.toFixed(2)}</Title>
            <Caption className="text-green-600">Total Revenue</Caption>
          </div>
        </div>

        {/* Active Listings */}
        <div className="shadow-s3 border border-blue-200 bg-blue-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <RiAuctionFill size={60} className="text-blue-600" />
          <div>
            <Title level={1} className="text-blue-800">{activeListings}</Title>
            <Caption className="text-blue-600">Active Listings</Caption>
          </div>
        </div>

        {/* Total Products */}
        <div className="shadow-s3 border border-purple-200 bg-purple-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <FiPackage size={60} className="text-purple-600" />
          <div>
            <Title level={1} className="text-purple-800">{totalListings}</Title>
            <Caption className="text-purple-600">Total Products</Caption>
          </div>
        </div>

        {/* Items Sold */}
        <div className="shadow-s3 border border-orange-200 bg-orange-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <GiBarbedStar size={60} className="text-orange-600" />
          <div>
            <Title level={1} className="text-orange-800">{soldItems}</Title>
            <Caption className="text-orange-600">Items Sold</Caption>
          </div>
        </div>
      </div>

      {/* Quick Actions for Sellers */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <Title level={5} className="font-normal mb-6">
          Seller Tools
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NavLink
            to="/add-product"
            className="bg-primary text-white p-4 rounded-lg text-center hover:bg-primary-dark transition-colors"
          >
            <FiPlus size={24} className="mx-auto mb-2" />
            <span>Add Product</span>
          </NavLink>

          <NavLink
            to="/product"
            className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
          >
            <MdOutlineInventory size={24} className="mx-auto mb-2" />
            <span>My Listings</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
          >
            <FiBarChart2 size={24} className="mx-auto mb-2" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/seller/sales-history"
            className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600 transition-colors"
          >
            <HiOutlineChartBar size={24} className="mx-auto mb-2" />
            <span>Sales History</span>
          </NavLink>
        </div>

        {/* Onboarding Link */}
        <div className="mt-4 text-center">
          <NavLink
            to="/onboarding/seller"
            className="text-primary hover:text-primary-dark transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>🏪 Revisit Seller Guide</span>
          </NavLink>
        </div>
      </div>

      {/* Recent Listings */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <Title level={5} className="font-normal">
            Recent Listings
          </Title>
          <NavLink to="/product" className="text-primary hover:text-primary-dark text-sm">
            View All →
          </NavLink>
        </div>

        {Array.isArray(userProducts) && userProducts.length > 0 ? (
          <div className="space-y-4">
            {userProducts.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={product.image || "/images/placeholder.jpg"}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <Title className="text-sm font-medium">{product.title}</Title>
                    <p className="text-gray-500 text-sm">
                      Starting bid: ${product.price} | Current: ${product.currentBid || product.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.status === "active" ? "bg-green-100 text-green-700" :
                    product.status === "sold" ? "bg-blue-100 text-blue-700" :
                    product.status === "ended" ? "bg-gray-100 text-gray-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {product.status || 'pending'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {product.bids?.length || 0} bids
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiPackage size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No products listed yet</p>
            <NavLink to="/add-product" className="text-primary hover:underline">
              Create your first listing
            </NavLink>
          </div>
        )}
      </div>

      {/* Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <div className="shadow-s1 p-8 rounded-lg">
          <Title level={5} className="font-normal mb-6">
            Performance Metrics
          </Title>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">
                {totalListings > 0 ? ((soldItems / totalListings) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Sale Price</span>
              <span className="font-semibold text-blue-600">
                ${soldItems > 0 ? (totalRevenue / soldItems).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Commission Balance</span>
              <span className="font-semibold text-purple-600">
                ${user?.commissionBalance || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="shadow-s1 p-8 rounded-lg">
          <Title level={5} className="font-normal mb-6">
            This Month
          </Title>
          <div className="text-center py-8 text-gray-500">
            <HiOutlineChartBar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Monthly analytics coming soon!</p>
            <p className="text-sm mt-2">Track your monthly performance and trends</p>
          </div>
        </div>
      </div>
    </>
  );
};
