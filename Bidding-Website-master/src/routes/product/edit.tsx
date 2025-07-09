import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { ProductEdit } from "../../screens/product/ProductEdit";

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Product - Horn of Antiques" },
    { 
      name: "description", 
      content: "Edit your antique listing details, update images, and manage auction settings on Horn of Antiques." 
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

export default function ProductEditPage() {
  return (
    <Layout>
      <DashboardLayout>
        <ProductEdit />
      </DashboardLayout>
    </Layout>
  );
}
