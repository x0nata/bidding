import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../components/common/layout/Layout";
import { Contact } from "../screens/contact/Contact";

export const meta: MetaFunction = () => {
  return [
    { title: "Contact Us - Horn of Antiques" },
    { 
      name: "description", 
      content: "Get in touch with Horn of Antiques. Contact our team for support, inquiries about Ethiopian antiques, or assistance with auctions." 
    },
    { name: "keywords", content: "contact Horn of Antiques, customer support, antique inquiries, auction help" },
  ];
};

export default function ContactPage() {
  return (
    <Layout>
      <Contact />
    </Layout>
  );
}
