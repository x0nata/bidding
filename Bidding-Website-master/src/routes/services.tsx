import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../components/common/layout/Layout";
import { Services } from "../screens/services/Services";

export const meta: MetaFunction = () => {
  return [
    { title: "Our Services - Horn of Antiques" },
    { 
      name: "description", 
      content: "Explore our comprehensive antique auction services including live auctions, authentication, appraisals, and consignment services for Ethiopian antiques." 
    },
    { name: "keywords", content: "antique services, auction services, authentication, appraisal, consignment, Ethiopian antiques" },
  ];
};

export default function ServicesPage() {
  return (
    <Layout>
      <Services />
    </Layout>
  );
}
