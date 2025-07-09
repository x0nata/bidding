import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { WinningBidList } from "../../screens/product/WinningBidList";

export const meta: MetaFunction = () => {
  return [
    { title: "Winning Products - Horn of Antiques" },
    { 
      name: "description", 
      content: "View your winning bids and purchased antiques on Horn of Antiques. Manage your successful auction purchases." 
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

export default function WinningProductsPage() {
  return (
    <Layout>
      <DashboardLayout>
        <WinningBidList />
      </DashboardLayout>
    </Layout>
  );
}
