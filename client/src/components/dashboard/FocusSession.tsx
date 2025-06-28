"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/stores/useAppStore";
import { useSubmitFeedback } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Clock, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function FocusSession() {
  const { user } = useUser();
  const {
    focusSession,
    currentTask,
    endFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    updateTask,
  } = useAppStore();

  const submitFeedback = useSubmitFeedback();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    focusScore: [8],
    distractions: "",
    completed: false,
    energyAfter: [3],
    recommendations: "",
    difficulty: "moderate" as "simple" | "moderate" | "complex",
  });

  // Timer effect
  useEffect(() => {
    if (!focusSession || focusSession.paused || focusSession.completed) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [focusSession]);

  // Calculate progress
  const estimatedTime = currentTask?.estimatedTime || 1800; // 30 min default
  const progress = Math.min((timeElapsed / estimatedTime) * 100, 100);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePause = () => {
    if (focusSession?.paused) {
      resumeFocusSession();
    } else {
      pauseFocusSession();
    }
  };

  const handleEnd = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    if (!user?.id || !focusSession || !currentTask) return;

    const distractionsArray = feedbackData.distractions
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const recommendationsArray = feedbackData.recommendations
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    try {
      // Map the feedback data to the expected format
      const feeling =
        feedbackData.focusScore[0] >= 8
          ? "great"
          : feedbackData.focusScore[0] >= 5
            ? "okay"
            : "struggled";

      const helpfulFactors = [];
      if (feedbackData.completed) helpfulFactors.push("Task completion");
      if (feedbackData.focusScore[0] >= 7) helpfulFactors.push("Good focus");
      if (distractionsArray.length === 0)
        helpfulFactors.push("No distractions");
      if (helpfulFactors.length === 0) helpfulFactors.push("Time management");

      // Only submit feedback to backend if this is a backend session
      if (focusSession.isBackendSession) {
        console.log(
          "Submitting feedback to backend for session:",
          focusSession.id,
        );
        await submitFeedback.mutateAsync({
          userId: user.id,
          sessionId: focusSession.id,
          feeling,
          helpfulFactors,
          notes: `Focus: ${feedbackData.focusScore[0]}/10, Energy: ${
            feedbackData.energyAfter[0]
          }/5, Difficulty: ${feedbackData.difficulty}${
            recommendationsArray.length > 0
              ? `, Recommendations: ${recommendationsArray.join(", ")}`
              : ""
          }`,
        });
      } else {
        console.log(
          "Skipping backend feedback submission for local session:",
          focusSession.id,
        );
      }

      // Update task progress
      const newProgress = feedbackData.completed
        ? 100
        : Math.max(currentTask.progress, progress);
      updateTask(currentTask.goalId, currentTask.id, {
        progress: newProgress,
        completed: feedbackData.completed,
        actualTime: timeElapsed,
      });

      // End session
      endFocusSession(feedbackData.focusScore[0], distractionsArray);
      setShowFeedback(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (!focusSession || !currentTask) return null;

  if (showFeedback) {
    return (
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>Session Complete!</CardTitle>
          <p className="text-gray-600">
            Help us improve your experience by sharing feedback about this
            session.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-blue-800">Time Focused</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-green-800">Progress Made</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="completed"
                checked={feedbackData.completed}
                onChange={(e) =>
                  setFeedbackData((prev) => ({
                    ...prev,
                    completed: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="completed" className="font-medium">
                I completed this task
              </Label>
            </div>

            <div className="space-y-2">
              <Label>How focused were you? (1-10)</Label>
              <div className="px-2">
                <Slider
                  value={feedbackData.focusScore}
                  onValueChange={(value) =>
                    setFeedbackData((prev) => ({ ...prev, focusScore: value }))
                  }
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Distracted</span>
                  <span className="font-medium">
                    {feedbackData.focusScore[0]}/10
                  </span>
                  <span>Completely Focused</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Energy level after session (1-5)</Label>
              <div className="px-2">
                <Slider
                  value={feedbackData.energyAfter}
                  onValueChange={(value) =>
                    setFeedbackData((prev) => ({ ...prev, energyAfter: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Exhausted</span>
                  <span className="font-medium">
                    {feedbackData.energyAfter[0]}/5
                  </span>
                  <span>Energized</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distractions">
                What distracted you? (comma-separated)
              </Label>
              <Input
                id="distractions"
                value={feedbackData.distractions}
                onChange={(e) =>
                  setFeedbackData((prev) => ({
                    ...prev,
                    distractions: e.target.value,
                  }))
                }
                placeholder="e.g., phone, social media, noise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">
                Suggestions for improvement
              </Label>
              <Textarea
                id="recommendations"
                value={feedbackData.recommendations}
                onChange={(e) =>
                  setFeedbackData((prev) => ({
                    ...prev,
                    recommendations: e.target.value,
                  }))
                }
                placeholder="What would help you focus better next time?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFeedback(false)}
              className="flex-1"
            >
              Skip Feedback
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={submitFeedback.isPending}
              className="flex-1"
            >
              {submitFeedback.isPending ? "Submitting..." : "Submit & Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-lg mx-4"
    >
      <Card className="border-2 border-blue-200 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Focus Session</span>
          </CardTitle>
          <p className="text-gray-600">{currentTask.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
              {formatTime(timeElapsed)}
            </div>
            <Progress value={progress} className="w-full h-3" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>0:00</span>
              <span>{Math.round(progress)}% Complete</span>
              <span>{formatTime(estimatedTime)}</span>
            </div>
          </div>

          {/* Task Info */}
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {Math.round(currentTask.estimatedTime / 60)} min planned
              </span>
            </Badge>
            <Badge
              variant="outline"
              className={
                currentTask.priority === "high"
                  ? "border-red-500 text-red-700"
                  : currentTask.priority === "medium"
                    ? "border-yellow-500 text-yellow-700"
                    : "border-green-500 text-green-700"
              }
            >
              {currentTask.priority} priority
            </Badge>
          </div>

          {/* Status */}
          {focusSession.paused && (
            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <Pause className="h-4 w-4" />
                <span className="font-medium">Session Paused</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Take your time. Resume when you&apos;re ready to continue.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex space-x-3">
            <Button onClick={handlePause} variant="outline" className="flex-1">
              {focusSession.paused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              onClick={handleEnd}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>

          {/* Motivation Tip */}
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-800 mb-1">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Stay Focused!</span>
            </div>
            <p className="text-sm text-blue-700">
              You&apos;re making great progress. Every minute counts toward your
              goal!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
