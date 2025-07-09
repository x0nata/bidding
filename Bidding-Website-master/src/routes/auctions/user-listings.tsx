import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { UserAuctions } from "../../screens/auctions/UserAuctions";

export const meta: MetaFunction = () => {
  return [
    { title: "User Auctions - Horn of Antiques" },
    { 
      name: "description", 
      content: "Browse all active auctions from our community of collectors and dealers. Discover authentic Ethiopian antiques and collectibles." 
    },
    { name: "keywords", content: "user auctions, community auctions, Ethiopian antiques, active auctions, collectibles" },
  ];
};

export default function UserAuctionsPage() {
  return (
    <Layout>
      <UserAuctions />
    </Layout>
  );
}
