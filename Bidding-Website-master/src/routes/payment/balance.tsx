import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import BalanceManagement from "../../screens/payment/BalanceManagement";

export const meta: MetaFunction = () => {
  return [
    { title: "Balance Management - Horn of Antiques" },
    { 
      name: "description", 
      content: "Manage your account balance, add funds, and view transaction history on Horn of Antiques." 
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

export default function BalancePage() {
  return (
    <Layout>
      <DashboardLayout>
        <BalanceManagement />
      </DashboardLayout>
    </Layout>
  );
}
