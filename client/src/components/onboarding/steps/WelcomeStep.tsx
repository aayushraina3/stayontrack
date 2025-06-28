"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface WelcomeStepProps {
  data?: OnboardingData;
  onNext: (data?: OnboardingData) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function WelcomeStep({ data, onNext }: WelcomeStepProps) {
  const { user } = useUser();
  const [name, setName] = useState(
    data?.personalInfo?.name || user?.firstName || "",
  );

  const handleNext = () => {
    if (name.trim()) {
      onNext({
        personalInfo: {
          ...data?.personalInfo,
          name: name.trim(),
          email: user?.emailAddresses[0]?.emailAddress || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          workingHours: { start: "09:00", end: "17:00" },
        },
      });
    }
  };

  const features = [
    "AI-powered task planning and scheduling",
    "Personalized motivation and encouragement",
    "Smart distraction blocking during focus sessions",
    "Detailed productivity insights and recommendations",
    "Adaptive learning from your work patterns",
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to StayOnTrack! 👋
        </h2>
        <p className="text-gray-600 text-lg">
          Your AI-powered productivity companion is ready to help you overcome
          procrastination and achieve your goals.
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-4">
            What you&apos;ll get:
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-blue-800">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">What should we call you?</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleNext}
          size="lg"
          className="px-8"
          disabled={!name.trim()}
        >
          Let&apos;s Get Started
        </Button>
      </div>
    </div>
  );
}
