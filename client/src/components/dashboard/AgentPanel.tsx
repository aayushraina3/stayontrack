"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useAppStore } from "@/stores/useAppStore"
import {
  useGetMotivation,
  useActivateBlocker,
  useGetInsights,
  useGeneratePlan,
} from "@/hooks/useAgents"
import { sessionApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type {
  MotivationResponse,
  PlanningResponse,
  BlockerResponse,
  InsightsResponse,
  WorkSession,
  Goal,
} from "@/types"
import { Progress } from "@/components/ui/progress"
import { Brain, Target, Shield, Eye, MessageCircle, Zap } from "lucide-react"
import { motion } from "framer-motion"

type AgentMessagesRecord = {
  motivator?: MotivationResponse
  planner?: PlanningResponse
  blocker?: BlockerResponse
  observer?: InsightsResponse
}

export function AgentPanel() {
  const { user } = useUser()
  const { userProfile, currentTask, focusSession, sessions, goals } =
    useAppStore()
  const [agentMessages, setAgentMessages] = useState<AgentMessagesRecord>({})
  const [agentStats, setAgentStats] = useState({
    motivationsGiven: 0,
    distractionsBlocked: 0,
    insightsGenerated: 0,
  })

  // Calculate stats from sessions data instead of localStorage
  useEffect(() => {
    if (user?.id && sessions) {
      const today = new Date().toDateString()
      const todaySessions = sessions.filter((session: WorkSession) => {
        // Handle both Date and string types for startTime
        const sessionDate =
          session.startTime instanceof Date
            ? session.startTime.toDateString()
            : new Date(session.startTime).toDateString()
        return sessionDate === today
      })

      // Count agent interactions from all today's sessions
      let motivationsGiven = 0
      let distractionsBlocked = 0
      let insightsGenerated = 0

      todaySessions.forEach((session: WorkSession) => {
        if (session.agentInteractions) {
          session.agentInteractions.forEach((interaction) => {
            // Use agentType instead of type for consistency
            switch (interaction.agentType) {
              case "motivator":
                motivationsGiven++
                break
              case "blocker":
                distractionsBlocked += interaction.distractionsBlocked || 1
                break
              case "observer":
                insightsGenerated += interaction.insightsCount || 1
                break
              case "planner":
                insightsGenerated += 1 // Plans are insights too
                break
            }
          })
        }
      })

      setAgentStats({
        motivationsGiven,
        distractionsBlocked,
        insightsGenerated,
      })
    }
  }, [user?.id, sessions])

  // Function to record agent interaction to current session
  const recordAgentInteraction = async (
    agentType: string,
    data: Record<string, unknown>
  ) => {
    if (focusSession?.id) {
      try {
        await sessionApi.addAgentInteraction(focusSession.id, {
          agentType: agentType as
            | "motivator"
            | "planner"
            | "blocker"
            | "observer",
          message: "", // Default empty message
          timestamp: new Date(),
          data: data,
        })
        console.log(
          `Recorded ${agentType} interaction to session ${focusSession.id}`
        )
      } catch (error) {
        console.error(`Failed to record ${agentType} interaction:`, error)
      }
    }
  }

  const getMotivation = useGetMotivation()
  const activateBlocker = useActivateBlocker()
  const getInsights = useGetInsights()
  const generatePlan = useGeneratePlan()

  // Calculate real stats from session data
  const today = new Date().toDateString()
  const todaySessions = (sessions || []).filter((session: WorkSession) => {
    // Handle both Date and string types for startTime
    const sessionDate =
      session.startTime instanceof Date
        ? session.startTime.toDateString()
        : new Date(session.startTime).toDateString()
    return sessionDate === today
  })

  // Calculate additional metrics from sessions
  const totalFocusTime = todaySessions.reduce((total, session) => {
    return total + (session.duration || 0)
  }, 0)

  const averageFocusScore =
    todaySessions.length > 0
      ? todaySessions.reduce(
          (total, session) => total + (session.focusScore || 0),
          0
        ) / todaySessions.length
      : 0

  const agents = [
    {
      id: "motivator",
      name: "Motivator",
      icon: Brain,
      color: "bg-green-500",
      description: "Get personalized motivation",
      active: userProfile?.preferences.motivationalReminders ?? true,
      action: "Get Motivation",
      handler: handleGetMotivation,
    },
    {
      id: "planner",
      name: "Planner",
      icon: Target,
      color: "bg-blue-500",
      description: "Optimize your schedule",
      active: true,
      action: "Generate Plan",
      handler: handleGeneratePlan,
    },
    {
      id: "blocker",
      name: "Blocker",
      icon: Shield,
      color: "bg-red-500",
      description: "Block distractions",
      active: !!focusSession && !focusSession.completed,
      action: focusSession ? "Active" : "Activate",
      handler: handleActivateBlocker,
    },
    {
      id: "observer",
      name: "Observer",
      icon: Eye,
      color: "bg-purple-500",
      description: "Get productivity insights",
      active: userProfile?.preferences.dailyInsights ?? true,
      action: "Get Insights",
      handler: handleGetInsights,
    },
  ]

  async function handleGetMotivation() {
    if (!user?.id || !currentTask) return

    try {
      const result = await getMotivation.mutateAsync({
        task: currentTask.title,
        energy: 3, // Could be dynamic based on user input
        progress: currentTask.progress / 100,
        userId: user.id,
        timeframe: "day",
      })

      setAgentMessages((prev) => ({
        ...prev,
        motivator: result,
      }))

      // Record interaction to current session
      await recordAgentInteraction("motivator", {
        motivationMessage: result.message,
        tone: result.tone,
        energyBoost: result.energyBoost,
        actionableAdvice: result.actionableAdvice,
        taskTitle: currentTask.title,
      })
    } catch (error) {
      console.error("Failed to get motivation:", error)
    }
  }

  async function handleActivateBlocker() {
    if (!user?.id || !currentTask) return

    try {
      const result = await activateBlocker.mutateAsync({
        userId: user.id,
        taskType: currentTask.category as string,
        sessionDuration: currentTask.estimatedTime,
        distractionLevel: "medium", // Could be based on user profile
      })

      setAgentMessages((prev) => ({
        ...prev,
        blocker: result,
      }))

      // Record interaction to current session
      await recordAgentInteraction("blocker", {
        distractionsBlocked: result.blockedSites?.length || 5,
        blockedSites: result.blockedSites,
        taskType: currentTask.category,
        sessionDuration: currentTask.estimatedTime,
      })
    } catch (error) {
      console.error("Failed to activate blocker:", error)
    }
  }

  async function handleGetInsights() {
    if (!user?.id) return

    try {
      const result = await getInsights.mutateAsync({
        userId: user.id,
        timeframe: "day",
      })

      setAgentMessages((prev) => ({
        ...prev,
        observer: result,
      }))

      // Record interaction to current session
      await recordAgentInteraction("observer", {
        insightsCount: result.insights?.length || 1,
        insights: result.insights,
        recommendations: result.recommendations,
        performanceScore: result.performanceScore,
        trends: result.trends,
      })
    } catch (error) {
      console.error("Failed to get insights:", error)
    }
  }

  async function handleGeneratePlan() {
    if (!user?.id) return

    try {
      // Use user's goals and current context
      const activeGoals = (goals || []).filter((goal) => !goal.completed)

      const result = await generatePlan.mutateAsync({
        goals: activeGoals,
        availableTime: 8 * 60 * 60, // 8 hours in seconds
        energy: 3, // Default energy level
        userId: user.id,
      })

      setAgentMessages((prev) => ({
        ...prev,
        planner: result,
      }))

      // Record interaction to current session
      await recordAgentInteraction("planner", {
        tasksGenerated: result.tasks?.length || 0,
        scheduleBlocks: result.schedule?.length || 0,
        estimatedCompletionTime: result.estimatedCompletionTime,
        recommendations: result.recommendations,
        goalsTargeted: activeGoals.length,
      })
    } catch (error) {
      console.error("Failed to generate plan:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>AI Agents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent, index) => {
              const Icon = agent.icon
              const message =
                agentMessages[agent.id as keyof AgentMessagesRecord]

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border rounded-lg transition-all ${
                    agent.active ? "bg-green-50 border-green-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${agent.color} text-white`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-gray-600">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={agent.active ? "default" : "secondary"}>
                        {agent.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-3 p-3 bg-white rounded border-l-4 border-blue-500"
                    >
                      <div className="flex items-start space-x-2">
                        <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          {agent.id === "motivator" &&
                            message &&
                            "message" in message && (
                              <div>
                                <p className="text-sm">
                                  {(message as MotivationResponse).message}
                                </p>
                                {(message as MotivationResponse)
                                  .actionableAdvice && (
                                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                                    {(
                                      message as MotivationResponse
                                    ).actionableAdvice.map(
                                      (advice: string, i: number) => (
                                        <li key={i}>• {advice}</li>
                                      )
                                    )}
                                  </ul>
                                )}
                              </div>
                            )}
                          {agent.id === "blocker" &&
                            message &&
                            "message" in message && (
                              <div>
                                <p className="text-sm">
                                  {(message as BlockerResponse).message}
                                </p>
                                {(message as BlockerResponse).blockedSites && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Blocking:{" "}
                                    {(message as BlockerResponse).blockedSites
                                      .slice(0, 3)
                                      .join(", ")}
                                    {(message as BlockerResponse).blockedSites
                                      .length > 3 &&
                                      ` +${
                                        (message as BlockerResponse)
                                          .blockedSites.length - 3
                                      } more`}
                                  </p>
                                )}
                              </div>
                            )}
                          {agent.id === "planner" &&
                            message &&
                            "tasks" in message && (
                              <div>
                                <p className="text-sm font-medium">
                                  Generated{" "}
                                  {(message as PlanningResponse).tasks.length}{" "}
                                  tasks
                                </p>
                                <div className="mt-2 space-y-1">
                                  {(message as PlanningResponse).tasks
                                    .slice(0, 3)
                                    .map((task, i: number) => (
                                      <p
                                        key={i}
                                        className="text-xs text-gray-600"
                                      >
                                        • {task.title} (
                                        {Math.round(task.estimatedTime / 60)}
                                        min)
                                      </p>
                                    ))}
                                  {(message as PlanningResponse).tasks.length >
                                    3 && (
                                    <p className="text-xs text-gray-500">
                                      +
                                      {(message as PlanningResponse).tasks
                                        .length - 3}{" "}
                                      more tasks
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          {agent.id === "observer" &&
                            message &&
                            "insights" in message && (
                              <div>
                                <p className="text-sm font-medium">
                                  Performance Score:{" "}
                                  {
                                    (message as InsightsResponse)
                                      .performanceScore
                                  }
                                  /10
                                </p>
                                <div className="mt-2 space-y-1">
                                  {(message as InsightsResponse).insights
                                    .slice(0, 2)
                                    .map((insight, i: number) => (
                                      <p
                                        key={i}
                                        className="text-xs text-gray-600"
                                      >
                                        • {insight.title}
                                      </p>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Activity Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Focus Sessions</span>
              <Badge variant="outline">{todaySessions.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Focus Time</span>
              <Badge variant="outline">
                {Math.round(totalFocusTime / 60)}m
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Focus Score</span>
              <Badge variant="outline">
                {averageFocusScore > 0 ? averageFocusScore.toFixed(1) : "0.0"}
                /10
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Motivations Given</span>
              <Badge variant="outline">{agentStats.motivationsGiven}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Distractions Blocked</span>
              <Badge variant="outline">{agentStats.distractionsBlocked}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Insights Generated</span>
              <Badge variant="outline">{agentStats.insightsGenerated}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
