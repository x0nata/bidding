import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { Income } from "../../admin/Income";

export const meta: MetaFunction = () => {
  return [
    { title: "Income Management - Horn of Antiques Admin" },
    { 
      name: "description", 
      content: "Admin income management dashboard for Horn of Antiques. View commission earnings and revenue analytics." 
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

export default function AdminIncomePage() {
  return (
    <Layout>
      <DashboardLayout>
        <Income />
      </DashboardLayout>
    </Layout>
  );
}
