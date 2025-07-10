import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LoginAsSeller,
  Register,
  Login,
  UserProfile,
  DashboardLayout,
  Layout,
  CreateCategory,
  UpdateCategory,
  UpdateProductByAdmin,
  AdminProductList,
  Income,
  Dashboard,
  ProductList,
  ProductEdit,
  AddProduct,
  ProductsDetailsPage,
  Home,
  About,
  Services,
  Contact,
  RoleBasedRoute,
  MyBids,
  SalesHistory,
  OnboardingRouter,
  BuyerOnboarding,
  SellerOnboarding,
  NotFound,
  ScrollToTop,
  PrivateRoute,
  PrivacyPolicy,
  TermsOfService,
  HelpFAQ,
  NewsletterUnsubscribe,
  UserAuctions,
  BalanceManagement,
} from "./router/index.js";

// Import components directly to avoid circular dependencies
import { Catgeorylist } from "./admin/category/Catgeorylist";
import { WinningBidList } from "./screens/product/WinningBidList";
import { UserList } from "./admin/UserList";

import SearchResults from "./components/search/SearchResults";
import { checkAuthStatus } from "./redux/slices/authSlice";
import { getAllCategories } from "./redux/slices/categorySlice";
import websocketService from "./services/websocket";
import OnboardingCheck from "./components/common/OnboardingCheck";
import NotificationSystem from "./components/common/NotificationSystem";
import AdminRoute from "./components/common/AdminRoute";
import { AdminLogin } from "./screens/admin/AdminLogin";
import { AdminDashboard } from "./screens/admin/AdminDashboard";
// import AuthDebug from "./components/debug/AuthDebug";
// import BiddingTest from "./components/debug/BiddingTest";
// import BalanceDebug from "./components/debug/BalanceDebug";

function App() {
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
    <>
      <BrowserRouter>
        <OnboardingCheck>
          <ScrollToTop />
          <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <SearchResults />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/seller/login"
            element={
              <PrivateRoute>
                <Layout>
                  <LoginAsSeller />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route
            path="/onboarding"
            element={<OnboardingRouter />}
          />
          <Route
            path="/onboarding/buyer"
            element={<BuyerOnboarding />}
          />
          <Route
            path="/onboarding/seller"
            element={<SellerOnboarding />}
          />

          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout>
                <Services />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />

          <Route
            path="/privacy"
            element={
              <Layout>
                <PrivacyPolicy />
              </Layout>
            }
          />
          <Route
            path="/terms"
            element={
              <Layout>
                <TermsOfService />
              </Layout>
            }
          />
          <Route
            path="/help"
            element={
              <Layout>
                <HelpFAQ />
              </Layout>
            }
          />
          <Route
            path="/newsletter/unsubscribe/:token"
            element={
              <Layout>
                <NewsletterUnsubscribe />
              </Layout>
            }
          />
          <Route
            path="/add-product"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <AddProduct />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          {/* ✅ MOVED: This route moved to admin section with proper AdminRoute protection */}
          <Route
            path="/product/update/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <ProductEdit />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/details/:id"
            element={
              <Layout>
                <ProductsDetailsPage />
              </Layout>
            }
          />
          <Route
            path="/auctions/user-listings"
            element={
              <Layout>
                <UserAuctions />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/product"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <ProductList />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          {/* ✅ MOVED: These admin routes moved to admin section with proper AdminRoute protection */}
          <Route
            path="/winning-products"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <WinningBidList />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />


          <Route
            path="/my-bids"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <MyBids />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/sales-history"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <SalesHistory />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <UserProfile />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/balance"
            element={
              <PrivateRoute>
                <Layout>
                  <BalanceManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/category"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <Catgeorylist />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/category/create"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <CreateCategory />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/category/update/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardLayout>
                    <UpdateCategory />
                  </DashboardLayout>
                </Layout>
              </PrivateRoute>
            }
          />
          {/* Admin Routes - Must come before catch-all route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* ✅ ADDED: Missing Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <UserList />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <AdminProductList />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <Catgeorylist />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories/create"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <CreateCategory />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories/update/:id"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <UpdateCategory />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/update/:id"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <UpdateProductByAdmin />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/income"
            element={
              <AdminRoute>
                <Layout>
                  <DashboardLayout>
                    <Income />
                  </DashboardLayout>
                </Layout>
              </AdminRoute>
            }
          />

          {/* Catch-all route for 404 - Must be last */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
        </OnboardingCheck>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Slide}
        />

        {/* Custom notification system */}
        <NotificationSystem />

        {/* Debug components - temporary for balance debugging */}
        {/* <AuthDebug /> */}
        {/* <BiddingTest /> */}
        {/* <BalanceDebug /> */}
      </BrowserRouter>
    </>
  );
}

export default App;
