import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import BuyerOnboarding from "../../screens/onboarding/BuyerOnboarding";

export const meta: MetaFunction = () => {
  return [
    { title: "Buyer Onboarding - Horn of Antiques" },
    { 
      name: "description", 
      content: "Learn how to buy authentic Ethiopian antiques and participate in auctions on Horn of Antiques." 
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

// Loader function to check authentication before rendering
export const loader: LoaderFunction = async ({ request }) => {
  // Check if user is authenticated
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    // Redirect to login with the current location
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return null;
};

export default function BuyerOnboardingPage() {
  return <BuyerOnboarding />;
}
