import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { redirect } from "react-router-dom";
import OnboardingRouter from "../../screens/onboarding/OnboardingRouter";

export const meta: MetaFunction = () => {
  return [
    { title: "Welcome to Horn of Antiques" },
    { 
      name: "description", 
      content: "Complete your onboarding to start buying and selling authentic Ethiopian antiques on Horn of Antiques." 
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

export default function OnboardingRouterPage() {
  return <OnboardingRouter />;
}
