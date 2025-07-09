import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import HelpFAQ from "../../screens/help/HelpFAQ";

export const meta: MetaFunction = () => {
  return [
    { title: "Help & FAQ - Horn of Antiques" },
    { 
      name: "description", 
      content: "Find answers to frequently asked questions about Horn of Antiques, bidding, authentication, and our Ethiopian antique auction services." 
    },
    { name: "keywords", content: "help, FAQ, frequently asked questions, auction help, bidding guide, Horn of Antiques" },
  ];
};

export default function HelpPage() {
  return (
    <Layout>
      <HelpFAQ />
    </Layout>
  );
}
