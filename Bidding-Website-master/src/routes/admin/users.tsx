import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { UserList } from "../../admin/UserList";

export const meta: MetaFunction = () => {
  return [
    { title: "User Management - Horn of Antiques Admin" },
    { 
      name: "description", 
      content: "Admin user management dashboard for Horn of Antiques. Manage all platform users and their accounts." 
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

export default function AdminUsersPage() {
  return (
    <Layout>
      <DashboardLayout>
        <UserList />
      </DashboardLayout>
    </Layout>
  );
}
