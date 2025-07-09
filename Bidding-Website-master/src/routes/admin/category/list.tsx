import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../../components/common/layout/Layout";
import { DashboardLayout } from "../../../components/common/layout/DashboardLayout";
import { Catgeorylist } from "../../../admin/category/Catgeorylist";

export const meta: MetaFunction = () => {
  return [
    { title: "Category Management - Horn of Antiques Admin" },
    { 
      name: "description", 
      content: "Admin category management dashboard for Horn of Antiques. Manage product categories and classifications." 
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

export default function AdminCategoryListPage() {
  return (
    <Layout>
      <DashboardLayout>
        <Catgeorylist />
      </DashboardLayout>
    </Layout>
  );
}
