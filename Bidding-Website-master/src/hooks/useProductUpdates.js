import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProducts, getActiveAuctions } from '../redux/slices/productSlice';

/**
 * Custom hook to listen for product updates and refresh data accordingly
 * This ensures that newly created products appear immediately in the UI
 */
export const useProductUpdates = (onUpdate) => {
  const dispatch = useDispatch();
  const { products, userProducts, activeAuctions } = useSelector((state) => state.product);
  const previousProductsLength = useRef(products.length);
  const previousUserProductsLength = useRef(userProducts.length);
  const previousActiveAuctionsLength = useRef(activeAuctions.length);

  useEffect(() => {
    // Check if new products were added
    const hasNewProducts = products.length > previousProductsLength.current;
    const hasNewUserProducts = userProducts.length > previousUserProductsLength.current;
    const hasNewActiveAuctions = activeAuctions.length > previousActiveAuctionsLength.current;

    if (hasNewProducts || hasNewUserProducts || hasNewActiveAuctions) {
      
      // Call the update callback if provided
      if (onUpdate && typeof onUpdate === 'function') {
        onUpdate({
          newProducts: hasNewProducts,
          newUserProducts: hasNewUserProducts,
          newActiveAuctions: hasNewActiveAuctions,
          totalProducts: products.length,
          totalUserProducts: userProducts.length,
          totalActiveAuctions: activeAuctions.length
        });
      }
    }

    // Update the refs for next comparison
    previousProductsLength.current = products.length;
    previousUserProductsLength.current = userProducts.length;
    previousActiveAuctionsLength.current = activeAuctions.length;
  }, [products.length, userProducts.length, activeAuctions.length, onUpdate]);

  // Return refresh function for manual updates
  const refreshAllData = async () => {
    try {
      await Promise.all([
        dispatch(getAllProducts()),
        dispatch(getActiveAuctions())
      ]);
    } catch (error) {
    }
  };

  return {
    refreshAllData,
    hasProducts: products.length > 0,
    hasUserProducts: userProducts.length > 0,
    hasActiveAuctions: activeAuctions.length > 0
  };
};

export default useProductUpdates;
