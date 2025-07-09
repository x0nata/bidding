import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { store } from "./redux/store";
import { checkAuthStatus } from "./redux/slices/authSlice";
import { getAllCategories } from "./redux/slices/categorySlice";
import websocketService from "./services/websocket";
import OnboardingCheck from "./components/common/OnboardingCheck";
import NotificationSystem from "./components/common/NotificationSystem";
import { ScrollToTop } from "./utils/ScrollToTop";

// App component that handles initialization logic
function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status on app load only if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuthStatus());
    }

    // Load categories
    dispatch(getAllCategories());

    // Connect to WebSocket
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [dispatch]);

  return (
    <OnboardingCheck>
      <ScrollToTop />
      <Outlet />
      
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Custom notification system */}
      <NotificationSystem />
    </OnboardingCheck>
  );
}

// Root component that provides Redux store
export default function Root() {
  return (
    <Provider store={store}>
      <AppInitializer />
    </Provider>
  );
}
