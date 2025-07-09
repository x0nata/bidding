import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Container, Title, Body } from "../../router";
import { LoadingSpinner, EmptyState } from "../common/CommonUI";
import { FaChevronLeft, FaChevronRight, FaGem, FaChair, FaPalette, FaCoins, FaBook, FaClock, FaMusic } from "react-icons/fa";
import { GiClothes, GiWineGlass } from "react-icons/gi";

export const CategorySlider = () => {
  const { categories, isLoading } = useSelector((state) => state.category);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Category icons mapping
  const categoryIcons = {
    'Jewelry': FaGem,
    'Furniture': FaChair,
    'Art': FaPalette,
    'Ceramics': FaGem,
    'Coins': FaCoins,
    'Books': FaBook,
    'Textiles': GiClothes,
    'Glassware': GiWineGlass,
    'Clocks': FaClock,
    'Musical': FaMusic,
  };

  // Transform categories for CategoryCard component with enhanced styling
  const transformedCategories = categories.slice(0, 12).map((category, index) => {
    const categoryName = category.title || category.name;
    const IconComponent = categoryIcons[categoryName] || FaGem;

    return {
      id: category._id || index + 1,
      title: categoryName,
      image: `https://via.placeholder.com/200x200/5BBB7B/FFFFFF?text=${encodeURIComponent(categoryName)}`,
      path: `/auctions?category=${encodeURIComponent(categoryName)}`,
      icon: IconComponent,
      count: category.productCount || Math.floor(Math.random() * 50) + 10, // Mock count for demo
      description: category.description || `Discover authentic ${categoryName.toLowerCase()} from various eras`
    };
  });

  const itemsPerView = 6;
  const maxIndex = Math.max(0, transformedCategories.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (transformedCategories.length > itemsPerView) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [transformedCategories.length, maxIndex, nextSlide]);

  return (
    <>
      <section className="category-slider py-20 bg-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-primary rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-green-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-yellow-500 rounded-full"></div>
        </div>

        <Container className="relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary bg-opacity-10 px-4 py-2 rounded-full mb-4">
              <FaGem className="text-primary" size={16} />
              <span className="text-primary font-medium text-sm">Curated Collections</span>
            </div>
            <Title level={2} className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Browse by Categories
            </Title>
            <Body className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our carefully curated collection of authentic antique categories,
              each verified by expert appraisers and backed by certificates of authenticity.
            </Body>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading categories..." />
          ) : transformedCategories.length > 0 ? (
            <div className="relative">
              {/* Navigation Buttons */}
              {transformedCategories.length > itemsPerView && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
                    aria-label="Previous categories"
                  >
                    <FaChevronLeft className="text-primary" size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
                    aria-label="Next categories"
                  >
                    <FaChevronRight className="text-primary" size={20} />
                  </button>
                </>
              )}

              {/* Categories Grid */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out gap-6"
                  style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
                >
                  {transformedCategories.map((item) => (
                    <div key={item.id} className="flex-shrink-0" style={{ width: `${100 / itemsPerView}%` }}>
                      <EnhancedCategoryCard item={item} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              {transformedCategories.length > itemsPerView && (
                <div className="flex justify-center mt-8 gap-2">
                  {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Categories Available"
              message="Categories will appear here once they are added by administrators."
            />
          )}

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Categories
              <FaChevronRight size={16} />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
};

// Enhanced Category Card Component
const EnhancedCategoryCard = ({ item }) => {
  const IconComponent = item.icon;

  return (
    <Link to={item.path} className="group block">
      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-gray-100 hover:border-primary">
        {/* Icon and Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-primary bg-opacity-10 p-3 rounded-xl group-hover:bg-primary group-hover:bg-opacity-100 transition-all duration-300">
            <IconComponent className="text-primary group-hover:text-white transition-colors duration-300" size={24} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{item.count}</div>
            <div className="text-xs text-gray-500">Items</div>
          </div>
        </div>

        {/* Title */}
        <Title level={4} className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">
          {item.title}
        </Title>

        {/* Description */}
        <Body className="text-gray-600 text-sm leading-relaxed mb-4">
          {item.description}
        </Body>

        {/* Action */}
        <div className="flex items-center justify-between">
          <span className="text-primary font-medium text-sm group-hover:underline">
            Explore Collection
          </span>
          <FaChevronRight className="text-primary group-hover:translate-x-1 transition-transform duration-300" size={14} />
        </div>
      </div>
    </Link>
  );
};
