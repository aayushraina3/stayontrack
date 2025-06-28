"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalSettingStep } from "./steps/GoalSettingStep";
import { WorkStyleStep } from "./steps/WorkStyleStep";
import { AgentCalibrationStep } from "./steps/AgentCalibrationStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import type { UserProfile, OnboardingData } from "@/types";

const ONBOARDING_STEPS = [
  { title: "Welcome", component: WelcomeStep },
  { title: "Set Your Goals", component: GoalSettingStep },
  { title: "Work Style Assessment", component: WorkStyleStep },
  { title: "AI Agent Setup", component: AgentCalibrationStep },
];

export function OnboardingFlow() {
  const { user } = useUser();
  const router = useRouter();
  const {
    onboardingStep,
    setOnboardingStep,
    completeOnboarding,
    createUserProfile,
    addGoal,
  } = useAppStore();
  const [formData, setFormData] = useState<OnboardingData>({});

  const currentStep = ONBOARDING_STEPS[onboardingStep];
  const isLastStep = onboardingStep === ONBOARDING_STEPS.length - 1;
  const progress = ((onboardingStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = async (stepData?: OnboardingData) => {
    if (stepData) {
      setFormData({ ...formData, ...stepData });
    }

    if (isLastStep) {
      const userProfile: UserProfile = {
        id: user?.id || "",

        personalInfo: {
          name: formData.personalInfo?.name || user?.firstName || "User",
          email: user?.emailAddresses?.[0]?.emailAddress || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          workingHours: {
            start: formData.personalInfo?.workingHours?.start || "09:00",
            end: formData.personalInfo?.workingHours?.end || "17:00",
          },
        },

        preferences: {
          theme: "light",
          notifications: true,
          motivationalReminders: true,
          dailyInsights: true,
          breakReminders: true,
          agentPersonalities: {
            motivator: formData.workStyle?.motivationStyle || "encouraging",
            planner: "detailed",
            observer: "analytical",
          },
          blockedSites: [],
        },

        productivity: {
          tasksCompleted: 0,
          totalFocusTime: 0,
          averageFocusScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
          streakRecord: 0,
        },

        agentSettings: {
          plannerEnabled: formData.plannerEnabled ?? true,
          motivatorEnabled: formData.motivatorEnabled ?? true,
          blockerEnabled: formData.blockerEnabled ?? true,
          observerEnabled: formData.observerEnabled ?? true,
          plannerSettings: {
            autoSchedule: formData.plannerSettings?.autoSchedule ?? true,
            adaptivePlanning:
              formData.plannerSettings?.adaptivePlanning ?? true,
            timeBuffers: formData.plannerSettings?.timeBuffers ?? true,
          },
          motivatorSettings: {
            frequency: formData.motivatorSettings?.frequency || "medium",
            sessionReminders:
              formData.motivatorSettings?.sessionReminders ?? true,
            achievementCelebration:
              formData.motivatorSettings?.achievementCelebration ?? true,
          },
          blockerSettings: {
            strictMode: formData.blockerSettings?.strictMode ?? false,
            allowBreakOverride:
              formData.blockerSettings?.allowBreakOverride ?? true,
            socialMediaBlocking:
              formData.blockerSettings?.socialMediaBlocking ?? true,
          },
          observerSettings: {
            dailyInsights: formData.observerSettings?.dailyInsights ?? true,
            weeklyReports: formData.observerSettings?.weeklyReports ?? true,
            performanceTracking:
              formData.observerSettings?.performanceTracking ?? true,
          },
        },

        goals: [], // Goals will be added separately after UserProfile creation
        onboardingComplete: true, // Mark onboarding as complete
      };

      // Store workStyle separately if needed, or add it to OnboardingData
      const onboardingData = {
        ...formData,
        workStyle: {
          workingHours: formData.workStyle?.workingHours || "standard",
          breakFrequency: formData.workStyle?.breakFrequency || [30],
          taskComplexity: formData.workStyle?.taskComplexity || "moderate",
          motivationStyle: formData.workStyle?.motivationStyle || "encouraging",
          distractionLevel: formData.workStyle?.distractionLevel || "medium",
          focusTime: formData.workStyle?.focusTime || [60],
          workEnvironment: formData.workStyle?.workEnvironment || "quiet",
          energyPeaks: formData.workStyle?.energyPeaks || ["morning"],
        },
      };

      // Create user profile in Firebase
      await createUserProfile(userProfile);

      // Store goals separately since they're not part of UserProfile
      if (formData.goals) {
        for (const goal of formData.goals) {
          await addGoal(goal);
        }
      }

      completeOnboarding();
      router.push("/dashboard");
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleBack = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Step {onboardingStep + 1} of {ONBOARDING_STEPS.length}:{" "}
                {currentStep.title}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <StepComponent
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={onboardingStep === 0}
            isLast={isLastStep}
          />
        </CardContent>
      </Card>
    </div>
  );
}
