"use client";

import { useState } from "react";
import type { StepComponentProps, AgentSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Shield, Eye, CheckCircle } from "lucide-react";

export function AgentCalibrationStep({
  data,
  onNext,
  onBack,
  isLast,
}: StepComponentProps) {
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    plannerEnabled: data.plannerEnabled ?? true,
    motivatorEnabled: data.motivatorEnabled ?? true,
    blockerEnabled: data.blockerEnabled ?? true,
    observerEnabled: data.observerEnabled ?? true,
    plannerSettings: {
      autoSchedule: data.plannerSettings?.autoSchedule ?? true,
      adaptivePlanning: data.plannerSettings?.adaptivePlanning ?? true,
      timeBuffers: data.plannerSettings?.timeBuffers ?? true,
    },
    motivatorSettings: {
      frequency: data.motivatorSettings?.frequency || "medium",
      sessionReminders: data.motivatorSettings?.sessionReminders ?? true,
      achievementCelebration:
        data.motivatorSettings?.achievementCelebration ?? true,
    },
    blockerSettings: {
      strictMode: data.blockerSettings?.strictMode ?? false,
      allowBreakOverride: data.blockerSettings?.allowBreakOverride ?? true,
      socialMediaBlocking: data.blockerSettings?.socialMediaBlocking ?? true,
    },
    observerSettings: {
      dailyInsights: data.observerSettings?.dailyInsights ?? true,
      weeklyReports: data.observerSettings?.weeklyReports ?? true,
      performanceTracking: data.observerSettings?.performanceTracking ?? true,
    },
  });

  const agents = [
    {
      id: "planner",
      name: "Planner Agent",
      description:
        "Creates optimized task schedules and breaks down complex goals",
      icon: Target,
      color: "bg-blue-500",
      enabled: agentSettings.plannerEnabled,
      settings: agentSettings.plannerSettings,
    },
    {
      id: "motivator",
      name: "Motivator Agent",
      description:
        "Provides personalized encouragement and keeps you motivated",
      icon: Brain,
      color: "bg-green-500",
      enabled: agentSettings.motivatorEnabled,
      settings: agentSettings.motivatorSettings,
    },
    {
      id: "blocker",
      name: "Blocker Agent",
      description:
        "Blocks distractions and maintains focus during work sessions",
      icon: Shield,
      color: "bg-red-500",
      enabled: agentSettings.blockerEnabled,
      settings: agentSettings.blockerSettings,
    },
    {
      id: "observer",
      name: "Observer Agent",
      description: "Analyzes your patterns and provides productivity insights",
      icon: Eye,
      color: "bg-purple-500",
      enabled: agentSettings.observerEnabled,
      settings: agentSettings.observerSettings,
    },
  ];

  const toggleAgent = (agentId: string) => {
    setAgentSettings((prev) => ({
      ...prev,
      [`${agentId}Enabled`]: !prev[`${agentId}Enabled` as keyof typeof prev],
    }));
  };

  const updatePlannerSetting = (
    setting: keyof AgentSettings["plannerSettings"],
    value: boolean,
  ) => {
    setAgentSettings((prev) => ({
      ...prev,
      plannerSettings: { ...prev.plannerSettings, [setting]: value },
    }));
  };

  const updateMotivatorSetting = (
    setting: keyof AgentSettings["motivatorSettings"],
    value: boolean | "low" | "medium" | "high",
  ) => {
    setAgentSettings((prev) => ({
      ...prev,
      motivatorSettings: { ...prev.motivatorSettings, [setting]: value },
    }));
  };

  const updateBlockerSetting = (
    setting: keyof AgentSettings["blockerSettings"],
    value: boolean,
  ) => {
    setAgentSettings((prev) => ({
      ...prev,
      blockerSettings: { ...prev.blockerSettings, [setting]: value },
    }));
  };

  const updateObserverSetting = (
    setting: keyof AgentSettings["observerSettings"],
    value: boolean,
  ) => {
    setAgentSettings((prev) => ({
      ...prev,
      observerSettings: { ...prev.observerSettings, [setting]: value },
    }));
  };

  const handleNext = () => {
    onNext(agentSettings);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Agent Setup
        </h2>
        <p className="text-gray-600">
          Configure your AI assistants to work exactly how you need them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Card
              key={agent.id}
              className={`transition-all ${
                agent.enabled ? "ring-2 ring-blue-200" : "opacity-75"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </div>
              </CardHeader>

              {agent.enabled && (
                <CardContent className="space-y-4">
                  {agent.id === "planner" && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Auto-schedule tasks</Label>
                        <Switch
                          checked={agentSettings.plannerSettings.autoSchedule}
                          onCheckedChange={(checked: boolean) =>
                            updatePlannerSetting("autoSchedule", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Adaptive planning</Label>
                        <Switch
                          checked={
                            agentSettings.plannerSettings.adaptivePlanning
                          }
                          onCheckedChange={(checked: boolean) =>
                            updatePlannerSetting("adaptivePlanning", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Include time buffers</Label>
                        <Switch
                          checked={agentSettings.plannerSettings.timeBuffers}
                          onCheckedChange={(checked: boolean) =>
                            updatePlannerSetting("timeBuffers", checked)
                          }
                        />
                      </div>
                    </>
                  )}

                  {agent.id === "motivator" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">Motivation frequency</Label>
                        <div className="flex space-x-2">
                          {(["low", "medium", "high"] as const).map((freq) => (
                            <Badge
                              key={freq}
                              variant={
                                agentSettings.motivatorSettings.frequency ===
                                freq
                                  ? "default"
                                  : "outline"
                              }
                              className="cursor-pointer"
                              onClick={() =>
                                updateMotivatorSetting("frequency", freq)
                              }
                            >
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Session reminders</Label>
                        <Switch
                          checked={
                            agentSettings.motivatorSettings.sessionReminders
                          }
                          onCheckedChange={(checked: boolean) =>
                            updateMotivatorSetting("sessionReminders", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Achievement celebrations
                        </Label>
                        <Switch
                          checked={
                            agentSettings.motivatorSettings
                              .achievementCelebration
                          }
                          onCheckedChange={(checked: boolean) =>
                            updateMotivatorSetting(
                              "achievementCelebration",
                              checked,
                            )
                          }
                        />
                      </div>
                    </>
                  )}

                  {agent.id === "blocker" && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Strict blocking mode</Label>
                        <Switch
                          checked={agentSettings.blockerSettings.strictMode}
                          onCheckedChange={(checked: boolean) =>
                            updateBlockerSetting("strictMode", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Allow emergency override
                        </Label>
                        <Switch
                          checked={
                            agentSettings.blockerSettings.allowBreakOverride
                          }
                          onCheckedChange={(checked: boolean) =>
                            updateBlockerSetting("allowBreakOverride", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Block social media</Label>
                        <Switch
                          checked={
                            agentSettings.blockerSettings.socialMediaBlocking
                          }
                          onCheckedChange={(checked: boolean) =>
                            updateBlockerSetting("socialMediaBlocking", checked)
                          }
                        />
                      </div>
                    </>
                  )}

                  {agent.id === "observer" && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Daily insights</Label>
                        <Switch
                          checked={agentSettings.observerSettings.dailyInsights}
                          onCheckedChange={(checked: boolean) =>
                            updateObserverSetting("dailyInsights", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Weekly reports</Label>
                        <Switch
                          checked={agentSettings.observerSettings.weeklyReports}
                          onCheckedChange={(checked: boolean) =>
                            updateObserverSetting("weeklyReports", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Performance tracking</Label>
                        <Switch
                          checked={
                            agentSettings.observerSettings.performanceTracking
                          }
                          onCheckedChange={(checked: boolean) =>
                            updateObserverSetting(
                              "performanceTracking",
                              checked,
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Ready to Start</h3>
              <p className="text-green-800 text-sm">
                Your AI agents are configured and ready to help you achieve your
                goals. You can always adjust these settings later from your
                dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLast ? "Complete Setup" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
