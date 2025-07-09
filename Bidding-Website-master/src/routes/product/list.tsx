import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { ProductList } from "../../screens/product/productlist/ProductList";

export const meta: MetaFunction = () => {
  return [
    { title: "My Products - Horn of Antiques" },
    { 
      name: "description", 
      content: "Manage your listed products and auctions on Horn of Antiques. View, edit, and track your antique listings." 
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

// Loader function to check authentication before rendering
export const loader: LoaderFunction = async ({ request }) => {
  // Check if user is authenticated
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    // Redirect to login with the current location
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return null;
};

export default function ProductListPage() {
  return (
    <Layout>
      <DashboardLayout>
        <ProductList />
      </DashboardLayout>
    </Layout>
  );
}
