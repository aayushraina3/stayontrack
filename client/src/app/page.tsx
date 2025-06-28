"use client";

import React, { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Dashboard } from "@/components/dashboard/MainDashboard";
import { useAppStore } from "@/stores/useAppStore";
import { User, WorkStyle, Goal } from "@/types";
import { RedirectToSignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { LandingPage } from "@/components/landing/LandingPage";

export default function HomePage() {
  const { user } = useUser();
  const { userProfile, isOnboarding, loadUserProfile } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (user?.id && !userProfile) {
        await loadUserProfile(user.id);
      }
      setIsLoading(false);
    };

    if (user) {
      initializeUser();
    } else {
      setIsLoading(false);
    }
  }, [user, userProfile, loadUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading StayOnTrack+...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>{isOnboarding ? <OnboardingFlow /> : <Dashboard />}</SignedIn>
    </>
  );
}
