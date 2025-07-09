import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../../components/common/layout/Layout";
import { DashboardLayout } from "../../../components/common/layout/DashboardLayout";
import { CreateCategory } from "../../../admin/category/CreateCategory";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Category - Horn of Antiques Admin" },
    { 
      name: "description", 
      content: "Admin interface to create new product categories for Horn of Antiques platform." 
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

export default function AdminCreateCategoryPage() {
  return (
    <Layout>
      <DashboardLayout>
        <CreateCategory />
      </DashboardLayout>
    </Layout>
  );
}
