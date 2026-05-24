"use client";

import { useAuth } from "@/context/AuthContext";
import LandingPage from "./landing/page";
import OnboardingPage from "./onboarding/page";
import DashboardPage from "./dashboard/page";

export default function Home() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  // If the user is authenticated, route them dynamically based on onboarding status
  if (user) {
    if (profile && profile.onboarded) {
      return <DashboardPage />;
    } else {
      return <OnboardingPage />;
    }
  }

  // Public visitor sees the SaaS landing page
  return <LandingPage />;
}
