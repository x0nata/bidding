import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../components/common/layout/Layout";
import { NotFound } from "../components/common/NotFound";

export const meta: MetaFunction = () => {
  return [
    { title: "Page Not Found - Horn of Antiques" },
    { 
      name: "description", 
      content: "The page you're looking for doesn't exist. Return to Horn of Antiques to continue browsing antiques." 
    },
  ];
};

export default function NotFoundPage() {
  return (
    <Layout>
      <NotFound />
    </Layout>
  );
}
