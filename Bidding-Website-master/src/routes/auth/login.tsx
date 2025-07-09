import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { Login } from "../../screens/auth/Login";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Horn of Antiques" },
    { 
      name: "description", 
      content: "Sign in to your Horn of Antiques account to start bidding on Ethiopian antiques and collectibles." 
    },
  ];
};

export default function LoginPage() {
  return (
    <Layout>
      <Login />
    </Layout>
  );
}
