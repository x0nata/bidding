import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { DashboardLayout } from "../../components/common/layout/DashboardLayout";
import { UserProfile } from "../../screens/auth/UserProfile";

export const meta: MetaFunction = () => {
  return [
    { title: "My Profile - Horn of Antiques" },
    { 
      name: "description", 
      content: "Manage your Horn of Antiques profile, update personal information, and view account settings." 
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

export default function ProfilePage() {
  return (
    <Layout>
      <DashboardLayout>
        <UserProfile />
      </DashboardLayout>
    </Layout>
  );
}
