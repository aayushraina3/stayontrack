"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/stores/useAppStore";
import { useGetInsights } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { InsightsResponse } from "@/types";

export function InsightsPanel() {
  const { user } = useUser();
  const { userProfile, goals, tasks, sessions } = useAppStore();
  const [insights, setInsights] = useState<InsightsResponse>();
  const [lastLoadedUserId, setLastLoadedUserId] = useState<string | null>(null);
  const getInsights = useGetInsights();
  const getInsightsRef = useRef(getInsights);

  // Keep ref updated
  useEffect(() => {
    getInsightsRef.current = getInsights;
  }, [getInsights]);

  const manualRefresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await getInsightsRef.current.mutateAsync({
        userId: user.id,
        timeframe: "week",
      });
      setInsights(result);
      setLastLoadedUserId(user.id);
    } catch (error) {
      console.error("Failed to load insights:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadInsights = async () => {
      if (!user?.id) return;

      try {
        const result = await getInsights.mutateAsync({
          userId: user.id,
          timeframe: "week",
        });
        setInsights(result);
        setLastLoadedUserId(user.id);
      } catch (error) {
        console.error("Failed to load insights:", error);
      }
    };

    // Only load if user changed and we haven't loaded for this user yet
    if (user?.id && user.id !== lastLoadedUserId) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, lastLoadedUserId]); // getInsights intentionally excluded to prevent infinite loops

  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasks = tasks;
  const completionRate =
    totalTasks.length > 0
      ? (completedTasks.length / totalTasks.length) * 100
      : 0;

  // Calculate real weekly stats from sessions and user data
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of this week
  weekStart.setHours(0, 0, 0, 0);

  const weeklySessions = (sessions || []).filter((session) => {
    const sessionDate = new Date(session.startTime || session.createdAt);
    return sessionDate >= weekStart;
  });

  // Calculate total focus hours from sessions
  const totalFocusMinutes = weeklySessions.reduce(
    (total, session) => {
      if (session.duration) {
        return total + session.duration / 60; // Convert seconds to minutes
      }
      return total;
    },
    0,
  );

  // Calculate weekly tasks completed (tasks completed this week)
  const weeklyTasksCompleted = completedTasks.filter((task) => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= weekStart;
  }).length;

  const weeklyStats = {
    tasksCompleted: weeklyTasksCompleted,
    focusHours: totalFocusMinutes / 60, // Convert minutes to hours
    streakDays: userProfile?.productivity?.currentStreak || 0,
    productivityScore:
      insights?.performanceScore ||
      userProfile?.productivity?.averageFocusScore ||
      0,
  };

  const trends = [
    {
      label: "Task Completion",
      value: weeklyTasksCompleted,
      change: 0, // Would need historical data to calculate real change
      trend: "up" as const,
      icon: Target,
    },
    {
      label: "Focus Time",
      value: Math.round(weeklyStats.focusHours * 10) / 10, // Round to 1 decimal
      change: 0, // Would need historical data to calculate real change
      trend: "up" as const,
      icon: Clock,
    },
    {
      label: "Productivity Score",
      value: Math.round(weeklyStats.productivityScore * 10) / 10, // Round to 1 decimal
      change: 0, // Would need historical data to calculate real change
      trend: "up" as const,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Insights</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={manualRefresh}
              disabled={getInsights.isPending}
            >
              {getInsights.isPending ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Performance Score */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {weeklyStats.productivityScore.toFixed(1)}/10
              </div>
              <div className="text-sm text-gray-600">Productivity Score</div>
              <Progress
                value={weeklyStats.productivityScore * 10}
                className="mt-2"
              />
            </div>

            {/* Trends */}
            <div className="space-y-3">
              {trends.map((trend, index) => {
                const Icon = trend.icon;
                const TrendIcon =
                  trend.trend === "up" ? TrendingUp : TrendingDown;

                return (
                  <motion.div
                    key={trend.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{trend.label}</div>
                        <div className="text-sm text-gray-600">
                          {typeof trend.value === "number" &&
                          trend.value % 1 !== 0
                            ? trend.value.toFixed(1)
                            : trend.value}
                          {trend.label === "Task Completion" && "%"}
                          {trend.label === "Focus Time" && "h"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${
                        trend.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {trend.change !== 0 && (
                        <>
                          <TrendIcon className="h-3 w-3" />
                          <span className="text-sm font-medium">
                            {Math.abs(trend.change)}%
                          </span>
                        </>
                      )}
                      {trend.change === 0 && (
                        <span className="text-sm text-gray-400">No change</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.insights
                ?.slice(0, 3)
                .map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="p-1 bg-blue-600 rounded text-white text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-blue-800 mt-1">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )) || (
                <div className="text-center py-4 text-gray-500">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Complete more tasks to unlock AI insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {weeklyStats.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600">Tasks Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {weeklyStats.streakDays}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
