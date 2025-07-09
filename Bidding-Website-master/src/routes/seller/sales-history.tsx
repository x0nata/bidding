import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import SalesHistory from "../../screens/seller/SalesHistory";

export const meta: MetaFunction = () => {
  return [
    { title: "Sales History - Horn of Antiques" },
    { 
      name: "description", 
      content: "View your sales history and completed auctions on Horn of Antiques. Track your selling performance and earnings." 
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

export default function SalesHistoryPage() {
  return (
    <Layout>
      <DashboardLayout>
        <SalesHistory />
      </DashboardLayout>
    </Layout>
  );
}
