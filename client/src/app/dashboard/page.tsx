"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/stores/useAppStore";
import { Dashboard } from "@/components/dashboard/MainDashboard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { isOnboarding } = useAppStore();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Clerk will handle redirect
  }

  if (isOnboarding) {
    return <OnboardingFlow />;
  }

  return <Dashboard />;
}
