export { PrivateRoute } from "./PrivateRoute";
export { ScrollToTop } from "../utils/ScrollToTop";
export { NotFound } from "../components/common/NotFound";
// WinningBidList is imported directly in App.js to avoid circular dependency
// UserList is imported directly in App.js to avoid circular dependency
export { default as RoleBasedRoute } from "../components/common/RoleBasedRoute";
export { default as MyBids } from "../screens/buyer/MyBids";
export { default as SalesHistory } from "../screens/seller/SalesHistory";
export { default as OnboardingRouter } from "../screens/onboarding/OnboardingRouter";
export { default as BuyerOnboarding } from "../screens/onboarding/BuyerOnboarding";
export { default as SellerOnboarding } from "../screens/onboarding/SellerOnboarding";
export { default as PrivacyPolicy } from "../screens/legal/PrivacyPolicy";
export { default as TermsOfService } from "../screens/legal/TermsOfService";
export { default as HelpFAQ } from "../screens/help/HelpFAQ";
export { default as NewsletterUnsubscribe } from "../screens/newsletter/NewsletterUnsubscribe";
export { default as BalanceManagement } from "../screens/payment/BalanceManagement";

// Home Section
export { CategoryCard } from "../components/cards/CategoryCard";
export { CategorySlider } from "../components/hero/CategorySlider";
export { Hero } from "../components/hero/Hero";
export { Process } from "../components/hero/Process";
export { Trust } from "../components/hero/Trust";
export { FeaturedAuction } from "../components/hero/FeaturedAuction";
export { Home } from "../screens/home/Home";

// Page Routes
export { About } from "../screens/about/About";
export { Services } from "../screens/services/Services";
export { Contact } from "../screens/contact/Contact";

//Admin Product  Routes
export { Dashboard } from "../screens/dashboard/Dashboard";
export { AdminProductList } from "../admin/product/AdminProductList";
export { UpdateProductByAdmin } from "../admin/product/UpdateProductByAdmin";
export { Income } from "../admin/Income";

//Category  Routes
export { CreateCategory } from "../admin/category/CreateCategory";
export { UpdateCategory } from "../admin/category/UpdateCategory";
// Catgeorylist is imported directly in App.js to avoid circular dependency

//Product Routes
export { ProductsDetailsPage } from "../screens/product/ProductsDetailsPage";
export { ProductList } from "../screens/product/productlist/ProductList";
export { ProductEdit } from "../screens/product/ProductEdit";
export { AddProduct } from "../screens/product/AddProject";

//Auction Routes
export { UserAuctions } from "../screens/auctions/UserAuctions";

// Utilis Routes
export { DateFormatter } from "../utils/DateFormatter";

// Common Routes
export { Loader } from "../components/common/Loader";
export { Search } from "../components/Search";
export { CategoryDropDown } from "../components/common/CategoryDropDown";
export { Title, Body, Caption, CustomLink, CustomNavLink, Container, PrimaryButton, ProfileCard, Heading, CustomNavLinkList } from "../components/common/Design";

// Layout Routes
export { DashboardLayout } from "../components/common/layout/DashboardLayout";
export { Layout } from "../components/common/layout/Layout";

// Hook Routes

// Auth Routes
export { Register } from "../screens/auth/Register";
export { Login } from "../screens/auth/Login";
export { LoginAsSeller } from "../screens/auth/LoginAsSeller";
export { UserProfile } from "../screens/auth/UserProfile";
