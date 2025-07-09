import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { AdminDashboard } from "../../screens/admin/AdminDashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Dashboard - Horn of Antiques" },
    { 
      name: "description", 
      content: "Admin dashboard for managing Horn of Antiques platform. Monitor users, auctions, and system performance." 
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

// Loader function to check admin authentication before rendering
export const loader: LoaderFunction = async ({ request }) => {
  // Check if user is authenticated and has admin role
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  
  if (!token || user.role !== 'admin') {
    // Redirect to admin login
    return redirect('/admin/login');
  }

  return null;
};

export default function AdminDashboardPage() {
  return (
    <Layout>
      <DashboardLayout>
        <AdminDashboard />
      </DashboardLayout>
    </Layout>
  );
}
