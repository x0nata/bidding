import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../components/common/layout/Layout";
import { Home } from "../screens/home/Home";

export const meta: MetaFunction = () => {
  return [
    { title: "Horn of Antiques - Ethiopian Antique Auction Platform" },
    { 
      name: "description", 
      content: "Discover and bid on authentic Ethiopian antiques and collectibles. Join Ethiopia's premier online auction platform for rare treasures and cultural artifacts." 
    },
    { name: "keywords", content: "Ethiopian antiques, auction, collectibles, cultural artifacts, bidding, Horn of Antiques" },
  ];
};

export default function HomePage() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
