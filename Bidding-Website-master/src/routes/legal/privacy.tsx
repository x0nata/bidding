import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import PrivacyPolicy from "../../screens/legal/PrivacyPolicy";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Horn of Antiques" },
    { 
      name: "description", 
      content: "Read Horn of Antiques' privacy policy to understand how we collect, use, and protect your personal information on our antique auction platform." 
    },
    { name: "keywords", content: "privacy policy, data protection, personal information, Horn of Antiques" },
  ];
};

export default function PrivacyPage() {
  return (
    <Layout>
      <PrivacyPolicy />
    </Layout>
  );
}
