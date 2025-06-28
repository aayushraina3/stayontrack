import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";
import { agentApi, sessionApi } from "@/lib/api";
import type {
  Task,
  WorkSession,
  AgentInteraction,
  TaskWithGoal,
} from "@/types";
import { formatDuration } from "@/lib/utils";

interface WorkspaceViewProps {
  currentTask: TaskWithGoal | null; // Changed to TaskWithGoal for consistency
  onTaskComplete: () => void;
  onTaskChange: (task: TaskWithGoal) => void; // Changed to TaskWithGoal
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  currentTask,
  onTaskComplete,
  onTaskChange,
}) => {
  const { time, isRunning, start, pause, reset, formattedTime } = useTimer();
  const [session, setSession] = useState<WorkSession | null>(null);
  const [agentSuggestions, setAgentSuggestions] = useState<AgentInteraction[]>(
    [],
  );
  const [focusStreak, setFocusStreak] = useState(0);
  const [isBlockerActive, setIsBlockerActive] = useState(false);

  useEffect(() => {
    if (currentTask && isRunning && !session) {
      startNewSession();
    }
  }, [currentTask, isRunning]);

  useEffect(() => {
    if (isRunning && time > 0 && time % 300 === 0) {
      // Every 5 minutes
      checkForAgentInterventions();
    }
  }, [time, isRunning]);

  const startNewSession = async () => {
    if (!currentTask) return;

    try {
      const newSession = await sessionApi.startSession(currentTask.id); // ← Fixed
      setSession(newSession);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const endSession = async (completed: boolean = false) => {
    if (!session) return;

    try {
      await sessionApi.endSession(session.id, {
        // ← Fixed
        focusScore: calculateFocusScore(),
        notes: completed ? "Task completed" : "Session paused",
      });

      if (completed) {
        setFocusStreak((prev) => prev + 1);
        onTaskComplete();
      }

      setSession(null);
      pause();
      reset();
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  };

  const calculateFocusScore = (): number => {
    // Simple focus score based on session length and minimal assumptions
    const targetTime = currentTask?.estimatedTime || 1800; // 30 min default
    const efficiency = Math.min(time / targetTime, 1);
    return Math.round(efficiency * 100);
  };

  const checkForAgentInterventions = async () => {
    if (!currentTask) return;

    // Motivator check - if user seems to be struggling
    if (time > currentTask.estimatedTime * 1.2) {
      try {
        const motivation = await agentApi.getMotivation({
          task: currentTask.title,
          energy: 3, // You could make this dynamic
          progress: currentTask.progress / 100,
          userId: "user-id", // Get from your auth context
          timeframe: "day",
        });

        setAgentSuggestions((prev) => [
          ...prev,
          {
            id: `motivator_${Date.now()}`,
            agentType: "motivator",
            message: motivation.message,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Failed to get motivation:", error);
      }
    }
  };

  const activateBlocker = async () => {
    if (!currentTask) return;

    try {
      const blocker = await agentApi.activateBlocker({
        userId: "user-id", // Get from your auth context
        taskType: currentTask.category || "work",
        sessionDuration: currentTask.estimatedTime,
        distractionLevel: "medium",
      });

      setIsBlockerActive(true);
      setAgentSuggestions((prev) => [
        ...prev,
        {
          id: `blocker_${Date.now()}`,
          agentType: "blocker",
          message: blocker.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to activate blocker:", error);
    }
  };

  const dismissSuggestion = (id: string) => {
    setAgentSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  if (!currentTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No active task
          </h3>
          <p className="text-gray-600">Select a task to start working</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Session Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                🎯 {currentTask.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>⏱️ {formattedTime}</span>
                <span>🔥 Focus streak: {focusStreak} tasks</span>
                <span>📊 Est. {formatDuration(currentTask.estimatedTime)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isRunning ? (
                <Button onClick={start} size="lg">
                  Start
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => endSession(false)}>
                    Pause
                  </Button>
                  <Button onClick={() => endSession(true)} variant="default">
                    Done
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Suggestions */}
      {agentSuggestions.length > 0 && (
        <div className="space-y-3">
          {agentSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {suggestion.agentType === "motivator" && "💪"}
                      {suggestion.agentType === "planner" && "📋"}
                      {suggestion.agentType === "blocker" && "🚫"}
                      {suggestion.agentType === "observer" && "👁️"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {suggestion.agentType}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {suggestion.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {suggestion.agentType === "blocker" && !isBlockerActive && (
                      <Button size="sm" onClick={activateBlocker}>
                        Activate
                      </Button>
                    )}
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Details */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Task Details</h3>
        </CardHeader>
        <CardContent>
          {currentTask.description && (
            <p className="text-gray-700 mb-4">{currentTask.description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Priority:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  currentTask.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : currentTask.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {currentTask.priority}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-500">Estimated:</span>
              <span className="ml-2">
                {formatDuration(currentTask.estimatedTime)}
              </span>
            </div>

            {currentTask.deadline && (
              <div>
                <span className="font-medium text-gray-500">Due:</span>
                <span className="ml-2">
                  {new Date(currentTask.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {currentTask.tags && currentTask.tags.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-500 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentTask.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
