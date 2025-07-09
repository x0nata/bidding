import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Title, Body, PrimaryButton } from "../../router";
import { FaGavel, FaFire, FaCrown, FaEye, FaHeart, FaClock, FaShieldAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { formatETB } from "../../utils/currency";

export const FeaturedAuction = () => {
  const [timeLeft, setTimeLeft] = useState("");

  // Mock featured auction data - in real app, this would come from props or API
  const featuredAuction = {
    id: "featured-001",
    title: "Rare 18th Century Qing Dynasty Porcelain Vase",
    description: "An exceptional piece from the Qianlong period (1735-1796), featuring intricate blue and white patterns with gold accents. This museum-quality vase comes with full provenance documentation and expert authentication.",
    currentBid: 15750,
    startingPrice: 8500,
    buyNowPrice: 25000,
    totalBids: 47,
    watchers: 156,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop"
    ],
    category: "Ceramics",
    era: "18th Century",
    origin: "China",
    condition: "Excellent",
    seller: {
      name: "Heritage Antiques Ltd.",
      rating: 4.9,
      verified: true
    },
    features: [
      "Museum-quality piece",
      "Full provenance documentation",
      "Expert authentication included",
      "Worldwide shipping available",
      "30-day return guarantee"
    ]
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate time left
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(featuredAuction.endTime).getTime();
      const distance = endTime - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [featuredAuction.endTime]);

  // Auto-rotate images
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % featuredAuction.images.length);
    }, 4000);
    return () => clearInterval(imageTimer);
  }, [featuredAuction.images.length]);

  return (
    <section className="featured-auction py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 border border-yellow-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-yellow-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-yellow-400 rounded-full"></div>
      </div>

      <Container className="relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400 bg-opacity-20 px-4 py-2 rounded-full mb-4">
            <FaCrown className="text-yellow-400" size={16} />
            <span className="text-yellow-400 font-medium text-sm">Featured Auction</span>
          </div>
          <Title level={2} className="text-4xl md:text-5xl font-bold text-white mb-4">
            Spotlight Collection
          </Title>
          <Body className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Don't miss this exceptional piece - a rare opportunity to own a museum-quality antique with verified authenticity.
          </Body>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={featuredAuction.images[currentImageIndex]}
                alt={featuredAuction.title}
                className="w-full h-96 object-cover"
              />
              
              {/* Overlay Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FaFire size={12} />
                  Hot Auction
                </div>
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <MdVerified size={14} />
                  Authenticated
                </div>
              </div>

              {/* Stats Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FaGavel size={16} />
                      <span className="text-sm">{featuredAuction.totalBids} bids</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaEye size={16} />
                      <span className="text-sm">{featuredAuction.watchers} watching</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaClock size={16} />
                    <span className="text-sm font-semibold">{timeLeft}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Thumbnails */}
            <div className="flex gap-2 mt-4">
              {featuredAuction.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentImageIndex ? 'border-yellow-400' : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 bg-opacity-20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                  {featuredAuction.category}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400 text-sm">{featuredAuction.era}</span>
              </div>
              <Title level={1} className="text-3xl md:text-4xl font-bold text-white mb-4">
                {featuredAuction.title}
              </Title>
              <Body className="text-gray-300 leading-relaxed">
                {featuredAuction.description}
              </Body>
            </div>

            {/* Pricing */}
            <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Body className="text-gray-400 text-sm mb-1">Current Bid</Body>
                  <Title level={2} className="text-3xl font-bold text-yellow-400">
                    {formatETB(featuredAuction.currentBid)}
                  </Title>
                </div>
                <div>
                  <Body className="text-gray-400 text-sm mb-1">Buy Now Price</Body>
                  <Title level={2} className="text-3xl font-bold text-white">
                    {formatETB(featuredAuction.buyNowPrice)}
                  </Title>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <Title level={4} className="text-xl font-semibold text-white mb-4">
                Why This Piece is Special
              </Title>
              <div className="space-y-2">
                {featuredAuction.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FaShieldAlt className="text-yellow-400 flex-shrink-0" size={16} />
                    <Body className="text-gray-300">{feature}</Body>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={`/details/${featuredAuction.id}`} className="flex-1">
                <PrimaryButton className="w-full bg-yellow-400 text-black hover:bg-yellow-500 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105">
                  Place Bid Now
                </PrimaryButton>
              </Link>
              <button className="flex-1 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                <div className="flex items-center justify-center gap-2">
                  <FaHeart size={18} />
                  Add to Watchlist
                </div>
              </button>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">
                  {featuredAuction.seller.name.charAt(0)}
                </span>
              </div>
              <div>
                <Body className="text-white font-semibold">
                  {featuredAuction.seller.name}
                  {featuredAuction.seller.verified && (
                    <MdVerified className="inline ml-1 text-green-400" size={16} />
                  )}
                </Body>
                <Body className="text-gray-400 text-sm">
                  ⭐ {featuredAuction.seller.rating} • Verified Seller
                </Body>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
