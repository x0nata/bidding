import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hero, Process } from "../../router";
import { RecentlyAddedAuctions } from "../../components/home/RecentlyAddedAuctions";
import { getAllProducts, getActiveAuctions } from "../../redux/slices/productSlice";
import { getAllCategories } from "../../redux/slices/categorySlice";


export const Home = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.product);

  useEffect(() => {
    // Load initial data from database - ensure we get all existing products

    const loadInitialData = async () => {
      try {
        // Fetch with higher limit to ensure we get all recent products
        const productParams = { ...filters, limit: 100 };

        await Promise.all([
          dispatch(getAllProducts(productParams)),
          dispatch(getActiveAuctions()),
          dispatch(getAllCategories())
        ]);

      } catch (error) {
      }
    };

    loadInitialData();
  }, [dispatch, filters]);

  // Refresh data when component becomes visible (with smart refresh logic)
  useEffect(() => {
    let lastRefreshTime = Date.now();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime;

        // Only refresh if it's been more than 2 minutes since last refresh
        // This prevents aggressive refreshing that can interfere with newly added items
        if (timeSinceLastRefresh > 120000) { // 2 minutes

          const refreshData = async () => {
            try {
              const productParams = { ...filters, limit: 100 };
              await Promise.all([
                dispatch(getAllProducts(productParams)),
                dispatch(getActiveAuctions())
              ]);
              lastRefreshTime = Date.now();
            } catch (error) {
            }
          };

          refreshData();
        } else {
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch, filters]);

  return (
    <>
      <Hero />
      <RecentlyAddedAuctions />
      <Process />
    </>
  );
};
