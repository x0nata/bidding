import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "root.tsx",
    children: [
      // Public routes
      {
        index: true,
        file: "routes/home.tsx",
      },
      {
        path: "search",
        file: "routes/search.tsx",
      },
      {
        path: "login",
        file: "routes/auth/login.tsx",
      },
      {
        path: "register",
        file: "routes/auth/register.tsx",
      },
      {
        path: "about",
        file: "routes/about.tsx",
      },
      {
        path: "services",
        file: "routes/services.tsx",
      },
      {
        path: "contact",
        file: "routes/contact.tsx",
      },
      {
        path: "privacy",
        file: "routes/legal/privacy.tsx",
      },
      {
        path: "terms",
        file: "routes/legal/terms.tsx",
      },
      {
        path: "help",
        file: "routes/help/faq.tsx",
      },
      {
        path: "newsletter/unsubscribe/:token",
        file: "routes/newsletter/unsubscribe.tsx",
      },
      {
        path: "details/:id",
        file: "routes/product/details.tsx",
      },
      {
        path: "auctions/user-listings",
        file: "routes/auctions/user-listings.tsx",
      },
      
      // Onboarding routes
      {
        path: "onboarding",
        file: "routes/onboarding/router.tsx",
      },
      {
        path: "onboarding/buyer",
        file: "routes/onboarding/buyer.tsx",
      },
      {
        path: "onboarding/seller",
        file: "routes/onboarding/seller.tsx",
      },
      
      // Protected routes (will be wrapped with PrivateRoute component)
      {
        path: "seller/login",
        file: "routes/auth/seller-login.tsx",
      },
      {
        path: "dashboard",
        file: "routes/dashboard/index.tsx",
      },
      {
        path: "profile",
        file: "routes/auth/profile.tsx",
      },
      {
        path: "balance",
        file: "routes/payment/balance.tsx",
      },
      {
        path: "add-product",
        file: "routes/product/add.tsx",
      },
      {
        path: "product",
        file: "routes/product/list.tsx",
      },
      {
        path: "product/update/:id",
        file: "routes/product/edit.tsx",
      },
      {
        path: "my-bids",
        file: "routes/buyer/my-bids.tsx",
      },
      {
        path: "seller/sales-history",
        file: "routes/seller/sales-history.tsx",
      },
      {
        path: "winning-products",
        file: "routes/product/winning-bids.tsx",
      },
      
      // Admin routes
      {
        path: "admin/login",
        file: "routes/admin/login.tsx",
      },
      {
        path: "admin/dashboard",
        file: "routes/admin/dashboard.tsx",
      },
      {
        path: "admin/income",
        file: "routes/admin/income.tsx",
      },
      {
        path: "product/admin",
        file: "routes/admin/product/list.tsx",
      },
      {
        path: "product/admin/update/:id",
        file: "routes/admin/product/update.tsx",
      },
      {
        path: "userlist",
        file: "routes/admin/users.tsx",
      },
      
      // Category routes
      {
        path: "category",
        file: "routes/admin/category/list.tsx",
      },
      {
        path: "category/create",
        file: "routes/admin/category/create.tsx",
      },
      {
        path: "category/update/:id",
        file: "routes/admin/category/update.tsx",
      },
      
      // Catch-all route for 404
      {
        path: "*",
        file: "routes/not-found.tsx",
      },
    ],
  },
] satisfies RouteConfig;
