import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../components/common/layout/Layout";
import { Search } from "../components/Search";

export const meta: MetaFunction = () => {
  return [
    { title: "Search Antiques - Horn of Antiques" },
    { 
      name: "description", 
      content: "Search and discover authentic Ethiopian antiques and collectibles. Find rare treasures and cultural artifacts on Horn of Antiques." 
    },
    { name: "keywords", content: "search antiques, Ethiopian collectibles, auction search, antique finder" },
  ];
};

export default function SearchPage() {
  return (
    <Layout>
      <Search />
    </Layout>
  );
}
