import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { LoginAsSeller } from "../../screens/auth/LoginAsSeller";

export const meta: MetaFunction = () => {
  return [
    { title: "Seller Login - Horn of Antiques" },
    { 
      name: "description", 
      content: "Login as a seller to manage your antique listings and auctions on Horn of Antiques." 
    },
    { name: "keywords", content: "seller login, antique seller, auction seller, Horn of Antiques" },
  ];
};

export default function SellerLoginPage() {
  return (
    <Layout>
      <LoginAsSeller />
    </Layout>
  );
}
