import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../components/common/layout/Layout";
import { About } from "../screens/about/About";

export const meta: MetaFunction = () => {
  return [
    { title: "About Us - Horn of Antiques" },
    { 
      name: "description", 
      content: "Learn about Horn of Antiques, Ethiopia's premier antique auction platform. Discover our mission to preserve Ethiopian heritage through authentic antiques." 
    },
    { name: "keywords", content: "about Horn of Antiques, Ethiopian heritage, antique auction platform, cultural preservation" },
  ];
};

export default function AboutPage() {
  return (
    <Layout>
      <About />
    </Layout>
  );
}
