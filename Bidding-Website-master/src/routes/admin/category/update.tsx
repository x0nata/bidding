import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../../components/common/layout/Layout";
import { DashboardLayout } from "../../../components/common/layout/DashboardLayout";
import { UpdateCategory } from "../../../admin/category/UpdateCategory";

export const meta: MetaFunction = () => {
  return [
    { title: "Update Category - Horn of Antiques Admin" },
    { 
      name: "description", 
      content: "Admin interface to update existing product categories for Horn of Antiques platform." 
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

export default function AdminUpdateCategoryPage() {
  return (
    <Layout>
      <DashboardLayout>
        <UpdateCategory />
      </DashboardLayout>
    </Layout>
  );
}
