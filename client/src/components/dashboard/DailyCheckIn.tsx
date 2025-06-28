"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sun, Coffee, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import type { DailyCheckinData, UserProfile } from "@/types";

interface DailyCheckinProps {
  onComplete: (data: DailyCheckinData) => void;
  userProfile?: UserProfile;
}

export function DailyCheckin({ onComplete, userProfile }: DailyCheckinProps) {
  const { user } = useUser();
  const [checkinData, setCheckinData] = useState({
    energy: [3],
    mood: [3],
    focus: [3],
    priorities: "",
    challenges: "",
    motivation: "",
    date: new Date().toISOString().slice(0, 10), // Default to today's date
  } as DailyCheckinData);

  const energyLabels = ["Exhausted", "Tired", "Okay", "Good", "Energized"];
  const moodLabels = ["Poor", "Low", "Neutral", "Good", "Great"];
  const focusLabels = [
    "Scattered",
    "Distracted",
    "Moderate",
    "Focused",
    "Laser Sharp",
  ];

  const handleSubmit = () => {
    // Save checkin data with proper ISO date
    const today = new Date().toISOString();
    const finalCheckinData = {
      ...checkinData,
      date: today,
    };

    // Pass data to parent component instead of localStorage
    onComplete(finalCheckinData);
  };

  const handleSkip = () => {
    // For skip, send minimal data with default values and proper date
    const today = new Date().toISOString();
    const skipCheckinData = {
      energy: [3], // Neutral default
      mood: [3], // Neutral default
      focus: [3], // Neutral default
      priorities: "", // Empty is fine now
      challenges: "",
      motivation: "",
      date: today,
    };

    onComplete(skipCheckinData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <span>
                Good morning, {userProfile?.personalInfo?.name || "there"}!
              </span>
            </CardTitle>
            <p className="text-gray-600">
              Let&apos;s start your day right. How are you feeling today?
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Level */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <Label className="font-medium">Energy Level</Label>
              </div>
              <div className="px-2">
                <Slider
                  value={checkinData.energy}
                  onValueChange={(value: number[]) =>
                    setCheckinData((prev) => ({ ...prev, energy: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black mt-2">
                  <span>Low</span>
                  <Badge variant="outline" className="text-yellow-600">
                    {energyLabels[checkinData.energy[0] - 1]}
                  </Badge>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Coffee className="h-4 w-4 text-blue-500" />
                <Label className="font-medium">Overall Mood</Label>
              </div>
              <div className="px-2">
                <Slider
                  value={checkinData.mood}
                  onValueChange={(value: number[]) =>
                    setCheckinData((prev) => ({ ...prev, mood: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black mt-2">
                  <span>Poor</span>
                  <Badge variant="outline" className="text-blue-600">
                    {moodLabels[checkinData.mood[0] - 1]}
                  </Badge>
                  <span>Great</span>
                </div>
              </div>
            </div>

            {/* Focus Readiness */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <Label className="font-medium">Focus Readiness</Label>
              </div>
              <div className="px-2">
                <Slider
                  value={checkinData.focus}
                  onValueChange={(value: number[]) =>
                    setCheckinData((prev) => ({ ...prev, focus: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black mt-2">
                  <span>Scattered</span>
                  <Badge variant="outline" className="text-green-600">
                    {focusLabels[checkinData.focus[0] - 1]}
                  </Badge>
                  <span>Sharp</span>
                </div>
              </div>
            </div>

            {/* Priorities */}
            <div className="space-y-2">
              <Label htmlFor="priorities" className="font-medium">
                What are your top 3 priorities today?
              </Label>
              <Textarea
                id="priorities"
                value={checkinData.priorities}
                onChange={(e) =>
                  setCheckinData((prev) => ({
                    ...prev,
                    priorities: e.target.value,
                  }))
                }
                placeholder="1. Complete project proposal&#10;2. Review team feedback&#10;3. Plan tomorrow's meetings"
                rows={3}
              />
            </div>

            {/* Challenges */}
            <div className="space-y-2">
              <Label htmlFor="challenges" className="font-medium">
                Any challenges or concerns today?
              </Label>
              <Textarea
                id="challenges"
                value={checkinData.challenges}
                onChange={(e) =>
                  setCheckinData((prev) => ({
                    ...prev,
                    challenges: e.target.value,
                  }))
                }
                placeholder="Deadline pressure, team meeting conflicts, etc."
                rows={2}
              />
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <Label htmlFor="motivation" className="font-medium">
                What&apos;s motivating you today?
              </Label>
              <Textarea
                id="motivation"
                value={checkinData.motivation}
                onChange={(e) =>
                  setCheckinData((prev) => ({
                    ...prev,
                    motivation: e.target.value,
                  }))
                }
                placeholder="Making progress on goals, helping the team, personal growth..."
                rows={2}
              />
            </div>

            {/* Personalized Message */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Today&apos;s AI Recommendation
              </h4>
              <p className="text-sm text-blue-800">
                {checkinData.energy[0] >= 4 && checkinData.focus[0] >= 4
                  ? "You're in great shape! This is perfect for tackling complex tasks. Consider starting with your most challenging priority."
                  : checkinData.energy[0] <= 2 || checkinData.focus[0] <= 2
                    ? "Low energy detected. Let's start with some lighter tasks to build momentum, then tackle bigger challenges when you're warmed up."
                    : "Good baseline energy. Mix of focused work and collaborative tasks would work well today."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip Check-in
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Start My Day
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
