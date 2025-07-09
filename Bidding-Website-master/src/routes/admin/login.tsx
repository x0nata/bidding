import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { AdminLogin } from "../../screens/admin/AdminLogin";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Login - Horn of Antiques" },
    { 
      name: "description", 
      content: "Admin login portal for Horn of Antiques. Authorized personnel only." 
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export default function AdminLoginPage() {
  return (
    <Layout>
      <AdminLogin />
    </Layout>
  );
}
