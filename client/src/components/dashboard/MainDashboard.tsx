"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/stores/useAppStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DailyCheckin } from "./DailyCheckIn";
import { TaskList } from "./TaskList";
import { AgentPanel } from "./AgentPanel";
import { FocusSession } from "./FocusSession";
import { InsightsPanel } from "./InsightsPanel";
import { CreateGoalDialog } from "./CreateGoalDialog";
import { Plus, Target, Clock, TrendingUp, Brain } from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { user } = useUser();
  const {
    goals,
    tasks,
    sessions,
    userProfile,
    focusSession,
    currentTask,
    lastCheckin,
    loadUserGoals,
    loadUserTasks,
    loadUserSessions,
    loadUserProfile,
    setLastCheckin,
    storeCheckin,
    isLoading,
    resetUserProfileAttempt,
  } = useAppStore();
  const [showCheckin, setShowCheckin] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    console.log("MainDashboard: User ID changed:", user?.id);
    if (user?.id) {
      // Reset the profile attempt flag for new user
      resetUserProfileAttempt();

      // First, try to load the user profile
      loadUserProfile(user.id).then(() => {
        // Load all user data from the API
        loadUserGoals(user.id);
        loadUserTasks(user.id);
        loadUserSessions(user.id);
      });
    }
  }, [
    user?.id,
    loadUserGoals,
    loadUserTasks,
    loadUserSessions,
    loadUserProfile,
    resetUserProfileAttempt,
  ]);

  // Check if user needs daily check-in
  useEffect(() => {
    const today = new Date().toDateString();

    if (!lastCheckin || lastCheckin !== today) {
      setShowCheckin(true);
    }
  }, [lastCheckin]);

  const completedTasks = (Array.isArray(tasks) ? tasks : []).filter(
    (task) => task.completed,
  );
  const totalTasks = Array.isArray(tasks) ? tasks : [];
  const completionRate =
    totalTasks.length > 0
      ? (completedTasks.length / totalTasks.length) * 100
      : 0;

  const todayTasks = totalTasks.filter((task) => {
    const today = new Date().toDateString();
    return (
      task.scheduledTime &&
      new Date(task.scheduledTime).toDateString() === today
    );
  });

  const todayCompletedTasks = todayTasks.filter((task) => task.completed);

  const urgentGoals = (Array.isArray(goals) ? goals : []).filter((goal) => {
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const daysLeft = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 3 && !goal.completed;
  });

  // Debug logging
  console.log("MainDashboard: Current goals state:", {
    goalsCount: goals?.length || 0,
    goals: goals,
    activeGoals: goals?.filter((g) => !g.completed).length || 0,
    urgentGoals: urgentGoals.length,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Daily Check-in Modal */}
      {showCheckin && (
        <DailyCheckin
          userProfile={userProfile || undefined}
          onComplete={async (data) => {
            setShowCheckin(false);
            setLastCheckin(new Date().toDateString());

            // Store checkin data in Firebase via backend API
            if (user?.id) {
              await storeCheckin(user.id, data);
            }
          }}
        />
      )}

      {/* Create Goal Dialog */}
      {showCreateGoal && (
        <CreateGoalDialog onClose={() => setShowCreateGoal(false)} />
      )}

      {/* Focus Session Overlay */}
      {focusSession && !focusSession.completed && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <FocusSession />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                    ? "afternoon"
                    : "evening"}
                , {userProfile?.personalInfo?.name || "there"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {focusSession
                  ? "You're in a focus session!"
                  : "Ready to tackle your goals today?"}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateGoal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Goals
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goals.filter((g) => !g.completed).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {urgentGoals.length} urgent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayCompletedTasks.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(completionRate)}%
              </div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile?.productivity?.averageFocusScore?.toFixed(1) ||
                  "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Current streak: {userProfile?.productivity?.currentStreak || 0}{" "}
                days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Urgent Goals Alert */}
        {urgentGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">⚠️ Urgent Goals</CardTitle>
                <CardDescription className="text-red-600">
                  These goals have deadlines within 3 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {urgentGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-2 bg-white rounded"
                    >
                      <div>
                        <span className="font-medium">{goal.title}</span>
                        <Badge variant="destructive" className="ml-2">
                          Due {new Date(goal.deadline).toLocaleDateString()}
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <TaskList />
          </motion.div>

          {/* Right Column - Agents & Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <AgentPanel />
            <InsightsPanel />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
