import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { Dashboard } from "../../screens/dashboard/Dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Horn of Antiques" },
    { 
      name: "description", 
      content: "Manage your auctions, bids, and account settings on Horn of Antiques dashboard." 
    },
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

  // In a real implementation, you might want to validate the token here
  // For now, we'll let the component handle the auth check
  return null;
};

export default function DashboardPage() {
  return (
    <Layout>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </Layout>
  );
}
