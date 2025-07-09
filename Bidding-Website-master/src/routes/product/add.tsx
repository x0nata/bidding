import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { AddProduct } from "../../screens/product/AddProject";

export const meta: MetaFunction = () => {
  return [
    { title: "Add Product - Horn of Antiques" },
    { 
      name: "description", 
      content: "List your authentic Ethiopian antiques and collectibles for auction on Horn of Antiques." 
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

export default function AddProductPage() {
  return (
    <Layout>
      <DashboardLayout>
        <AddProduct />
      </DashboardLayout>
    </Layout>
  );
}
