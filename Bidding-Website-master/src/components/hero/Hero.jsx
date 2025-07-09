import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Body, Container, PrimaryButton, Title } from "../../router";
import { IoIosSearch } from "react-icons/io";
import { FaGavel, FaShieldAlt, FaCertificate, FaUsers, FaGlobe } from "react-icons/fa";
import { MdVerified } from "react-icons/md";



// Hero slide data
const HERO_SLIDES = [
  {
    title: "Horn of Antiques",
    subtitle: "Antique Auction for Ethiopia",
    description: "Welcome to Ethiopia's premier marketplace for authentic antiques and collectibles. Connect with local sellers and discover rare Ethiopian treasures with verified provenance."
  },
  {
    title: "Expert Authentication",
    subtitle: "Certified & Verified Items",
    description: "Every item undergoes rigorous authentication by our expert appraisers specializing in Ethiopian heritage. Bid with confidence knowing each piece comes with detailed provenance and certificates."
  },
  {
    title: "Live Auction Experience",
    subtitle: "Real-time Bidding Platform",
    description: "Experience the thrill of live auctions from anywhere in Ethiopia. Our advanced platform provides real-time bidding and secure transactions for Ethiopian collectors."
  }
];

// Trust badge data
const TRUST_BADGES = [
  { icon: FaUsers, value: "5,000+", label: "Ethiopian Collectors", color: "border-primary text-primary" },
  { icon: FaGavel, value: "200+", label: "Live Auctions", color: "border-green-500 text-green-500" },
  { icon: FaCertificate, value: "99%", label: "Authenticated", color: "border-yellow-500 text-yellow-500" },
  { icon: FaGlobe, value: "12+", label: "Ethiopian Regions", color: "border-blue-500 text-blue-500" }
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const currentHero = HERO_SLIDES[currentSlide];

  return (
    <>
      <section className="hero bg-primary py-16 relative overflow-hidden">
        {/* Simplified Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-white rounded-full"></div>
        </div>

        <Container className="relative z-10">
          <div className="flex items-center justify-center text-center min-h-[500px]">
            {/* Main Content - Centered */}
            <div className="w-full max-w-4xl text-white">
              {/* Trust Indicators */}
              <TrustIndicators />

              {/* Main Content */}
              <div className="mb-8">
                <Title level={1} className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentHero.title}
                </Title>
                <Title level={2} className="text-xl md:text-3xl font-light text-green-200 mb-6">
                  {currentHero.subtitle}
                </Title>
                <Body className="text-lg md:text-xl leading-relaxed text-gray-200 mb-6 max-w-3xl mx-auto">
                  {currentHero.description}
                </Body>
              </div>

              {/* Search Box */}
              <div className="mb-6 max-w-2xl mx-auto">
                <SearchBox />
              </div>

              {/* Action Buttons */}
              <ActionButtons />
            </div>
          </div>

          {/* Slide Indicators */}
          <SlideIndicators
            slides={HERO_SLIDES}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
          />
        </Container>
      </section>

      {/* Trust Badges Section */}
      <TrustBadgesSection />
    </>
  );
};

// Component: Trust Indicators
const TrustIndicators = () => (
  <div className="flex items-center justify-center gap-4 mb-8">
    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
      <FaShieldAlt className="text-green-300" size={14} />
      <span className="text-sm font-medium">Secure Bidding</span>
    </div>
  </div>
);



// Component: Action Buttons
const ActionButtons = () => {
  const navigate = useNavigate();

  const handleStartBidding = () => {
    navigate('/auctions/user-listings');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <PrimaryButton
        onClick={handleStartBidding}
        className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-4 rounded-lg font-semibold transition-all duration-300 text-lg"
      >
        Get Started
      </PrimaryButton>
      <button
        onClick={handleLearnMore}
        className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-4 rounded-lg font-semibold transition-all duration-300 text-lg"
      >
        Learn More
      </button>
    </div>
  );
};



// Component: Slide Indicators
const SlideIndicators = ({ slides, currentSlide, onSlideChange }) => (
  <div className="flex justify-center mt-8 gap-2">
    {slides.map((_, index) => (
      <button
        key={index}
        onClick={() => onSlideChange(index)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
        }`}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))}
  </div>
);

// Component: Trust Badges Section
const TrustBadgesSection = () => (
  <div className="bg-white w-full py-16 -mt-10 rounded-t-[40px] relative z-20">
    <Container>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-8">
        {TRUST_BADGES.map((badge, index) => (
          <TrustBadge key={index} {...badge} />
        ))}
      </div>
    </Container>
  </div>
);

// Component: Trust Badge
const TrustBadge = ({ icon: Icon, value, label, color }) => (
  <div className={`bg-white rounded-xl p-6 shadow-lg text-center border-t-4 ${color}`}>
    <Icon className={`mx-auto mb-2 ${color.split(' ')[1]}`} size={32} />
    <div className="font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Component: Search Box
const SearchBox = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const suggestions = ["Victorian Jewelry", "Ming Dynasty Vase", "Art Deco Furniture", "Vintage Watches"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page with query parameter
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="hero-search" className="sr-only">
          Search for antiques and collectibles
        </label>
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
            <IoIosSearch className="text-gray-400" size={24} />
          </div>
          <input
            type="search"
            id="hero-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-16 pr-32 py-4 text-gray-800 placeholder-gray-500 bg-transparent border-none outline-none focus:ring-0"
            placeholder="Search antiques, vintage items, collectibles..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <PrimaryButton
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              Search
            </PrimaryButton>
          </div>
        </div>
      </form>

      {/* Search Suggestions */}
      <div className="mt-3">
        <div className="text-sm text-green-200 mb-2">Popular:</div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full hover:bg-opacity-30 transition-all duration-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


