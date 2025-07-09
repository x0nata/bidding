import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { Register } from "../../screens/auth/Register";

export const meta: MetaFunction = () => {
  return [
    { title: "Register - Horn of Antiques" },
    { 
      name: "description", 
      content: "Join Horn of Antiques to start bidding on authentic Ethiopian antiques and collectibles. Create your account today." 
    },
    { name: "keywords", content: "register, sign up, create account, Ethiopian antiques, auction registration" },
  ];
};

export default function RegisterPage() {
  return (
    <Layout>
      <Register />
    </Layout>
  );
}
