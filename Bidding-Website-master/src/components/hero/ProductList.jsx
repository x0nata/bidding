import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Title, Body } from "../../router";
import { ProductCard } from "../cards/ProductCard";
import { setFilters } from "../../redux/slices/productSlice";
import { EmptyState } from "../common/EmptyState";
import { FaFire, FaClock, FaGavel, FaFilter, FaTrophy, FaSort } from "react-icons/fa";

export const ProductList = () => {
  const dispatch = useDispatch();
  const { products, activeAuctions, isLoading, filters } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  const [viewMode, setViewMode] = useState("all"); // "all", "live", "upcoming"
  const [sortBy, setSortBy] = useState("newest"); // newest, ending, popular, price

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  // Enhanced product filtering and sorting
  const getDisplayProducts = () => {
    let filteredProducts;
    switch (viewMode) {
      case "live":
        filteredProducts = activeAuctions;
        break;
      case "upcoming":
        filteredProducts = products.filter(p => p.auctionStatus === "upcoming");
        break;
      default:
        filteredProducts = products;
    }

    // Create a copy of the array before sorting to avoid mutating Redux state
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "ending":
          return new Date(a.endTime) - new Date(b.endTime);
        case "popular":
          return (b.totalBids || 0) - (a.totalBids || 0);
        case "price":
          return (b.currentBid || b.startingPrice || 0) - (a.currentBid || a.startingPrice || 0);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const displayProducts = getDisplayProducts();

  // Get view mode stats
  const getViewModeStats = () => {
    return {
      all: products.length,
      live: activeAuctions.length,
      upcoming: products.filter(p => p.auctionStatus === "upcoming").length
    };
  };

  const stats = getViewModeStats();

  return (
    <>
      <section className="product-home py-20 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-40 h-40 border border-primary rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 border border-green-500 rounded-full"></div>
        </div>

        <Container className="relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary bg-opacity-10 px-4 py-2 rounded-full mb-4">
              <FaGavel className="text-primary" size={16} />
              <span className="text-primary font-medium text-sm">Live Auctions</span>
            </div>
            <Title level={2} className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Featured Antique Auctions
            </Title>
            <Body className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover rare and authentic antiques from around the world. Bid on unique pieces
              with verified provenance and expert authentication.
            </Body>
          </div>

          {/* Enhanced Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-6">
              {/* View Mode Tabs with Enhanced Styling */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("all")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    viewMode === "all"
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaTrophy size={16} />
                  All Antiques
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    viewMode === "all" ? "bg-white bg-opacity-20" : "bg-gray-200"
                  }`}>
                    {stats.all}
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("live")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    viewMode === "live"
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaFire size={16} />
                  Live Auctions
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    viewMode === "live" ? "bg-white bg-opacity-20" : "bg-gray-200"
                  }`}>
                    {stats.live}
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("upcoming")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    viewMode === "upcoming"
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaClock size={16} />
                  Upcoming
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    viewMode === "upcoming" ? "bg-white bg-opacity-20" : "bg-gray-200"
                  }`}>
                    {stats.upcoming}
                  </span>
                </button>
              </div>

              {/* Filters and Sort */}
              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="ending">Ending Soon</option>
                    <option value="popular">Most Popular</option>
                    <option value="price">Highest Price</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 my-8">
              {displayProducts.slice(0, 12).map((item) => (
                <ProductCard item={item} key={item._id} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="products"
              title={
                viewMode === "live"
                  ? "No Live Auctions"
                  : viewMode === "upcoming"
                  ? "No Upcoming Auctions"
                  : "No Antiques Listed Yet"
              }
              subtitle={
                viewMode === "live"
                  ? "No live auctions are currently active. Check back soon for exciting bidding opportunities!"
                  : viewMode === "upcoming"
                  ? "No upcoming auctions scheduled. New auctions are added regularly."
                  : "Be the first to discover and list authentic antiques on our premium auction platform."
              }
              actionText={
                viewMode === "all" ? "List Your First Antique" : "Browse All Antiques"
              }
              actionLink={
                viewMode === "all" ? "/add-product" : "/"
              }
              showFeatures={viewMode === "all"}
            />
          )}
        </Container>
      </section>
    </>
  );
};
