import React from "react";
import type { MetaFunction } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import NewsletterUnsubscribe from "../../screens/newsletter/NewsletterUnsubscribe";

export const meta: MetaFunction = () => {
  return [
    { title: "Newsletter Unsubscribe - Horn of Antiques" },
    { 
      name: "description", 
      content: "Unsubscribe from Horn of Antiques newsletter. Manage your email preferences and subscription settings." 
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export default function NewsletterUnsubscribePage() {
  return (
    <Layout>
      <NewsletterUnsubscribe />
    </Layout>
  );
}
