import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../redux/slices/categorySlice";
import { getAllProducts, setFilters } from "../redux/slices/productSlice";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { Container, Title, Body } from "./common/Design";
import { FiSearch, FiFilter } from "react-icons/fi";

export const Search = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Get data from Redux store using correct selectors
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.category);
  const { isLoading: productsLoading } = useSelector((state) => state.product);

  // Load categories on component mount
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Handle category selection
  const handleCategoryClick = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    // Update filters in Redux store and fetch filtered products
    dispatch(setFilters({ category: categoryId }));
    dispatch(getAllProducts({ category: categoryId, limit: 100 }));
  };

  // Handle "View All" click
  const handleViewAllClick = () => {
    setSelectedCategory("");
    // Clear category filter and fetch all products
    dispatch(setFilters({ category: "" }));
    dispatch(getAllProducts({ limit: 100 }));
  };

  // Check if we have categories to display
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  // Don't render anything if loading or no categories
  if (categoriesLoading) {
    return (
      <section className="py-8">
        <Container>
          <div className="flex justify-center">
            <LoadingSpinner size="small" />
          </div>
        </Container>
      </section>
    );
  }

  // Don't render the component if no categories are available
  if (!hasCategories) {
    return null;
  }

  return (
    <section className="search py-12 bg-gray-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary bg-opacity-10 px-4 py-2 rounded-full mb-4">
            <FiFilter className="text-primary" size={16} />
            <span className="text-primary font-medium text-sm">Browse Categories</span>
          </div>
          <Title level={3} className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Find Antiques by Category
          </Title>
          <Body className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of authentic antiques organized by category
          </Body>
        </div>

        {/* Loading indicator for products */}
        {productsLoading && (
          <div className="flex justify-center mb-6">
            <LoadingSpinner size="small" />
          </div>
        )}

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {/* View All Button */}
          <button
            onClick={handleViewAllClick}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105
              ${!selectedCategory
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
              }
            `}
          >
            <FiSearch size={16} />
            <span>View All</span>
          </button>

          {/* Category Buttons */}
          {categories.map((category) => {
            const categoryId = category._id;
            const categoryName = category.title || category.name;
            const isSelected = selectedCategory === categoryId;

            return (
              <button
                key={categoryId}
                onClick={() => handleCategoryClick(categoryId, categoryName)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 capitalize
                  ${isSelected
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
                  }
                `}
              >
                {categoryName}
              </button>
            );
          })}
        </div>

        {/* Selected Category Indicator */}
        {selectedCategory && (
          <div className="text-center mt-6">
            <Body className="text-gray-600">
              Showing results for: <span className="font-semibold text-primary capitalize">
                {categories.find(cat => cat._id === selectedCategory)?.title ||
                 categories.find(cat => cat._id === selectedCategory)?.name}
              </span>
            </Body>
          </div>
        )}
      </Container>
    </section>
  );
};
