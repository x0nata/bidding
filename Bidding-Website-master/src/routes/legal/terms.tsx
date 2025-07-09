import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import TermsOfService from "../../screens/legal/TermsOfService";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service - Horn of Antiques" },
    { 
      name: "description", 
      content: "Read Horn of Antiques' terms of service to understand the rules and conditions for using our Ethiopian antique auction platform." 
    },
    { name: "keywords", content: "terms of service, user agreement, auction terms, Horn of Antiques" },
  ];
};

export default function TermsPage() {
  return (
    <Layout>
      <TermsOfService />
    </Layout>
  );
}
