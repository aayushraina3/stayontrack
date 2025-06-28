"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/stores/useAppStore";
import { useGeneratePlan } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskDialog } from "./TaskDialog";
import { Calendar, Clock, Play, MoreVertical, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskWithGoal, Task, Goal } from "@/types";

export function TaskList() {
  const { user } = useUser();
  const {
    goals,
    tasks,
    currentTask,
    setCurrentTask,
    updateTask,
    addTask,
    startFocusSession,
    updateGoal,
    loadUserGoals,
    getTasksForGoal,
  } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<TaskWithGoal | null>(null);
  const [filter, setFilter] = useState<
    "all" | "today" | "pending" | "completed"
  >("all");
  const generatePlan = useGeneratePlan();

  // Get all tasks with goal information
  const allTasks = (tasks || [])
    .filter((task) => task && task.id) // Ensure task exists and has an ID
    .map((task) => {
      const goal = goals.find((g) => g.id === task.goalId);
      return {
        ...task,
        goalTitle: goal?.title || "Unknown Goal",
      };
    });

  // Debug: Log any tasks without IDs or duplicate IDs
  if (allTasks.length > 0) {
    const taskIds = allTasks.map((t) => t.id);
    const uniqueIds = new Set(taskIds);
    if (taskIds.length !== uniqueIds.size) {
      console.warn("TaskList: Found duplicate task IDs:", taskIds);
    }
    const tasksWithoutIds = allTasks.filter((t) => !t.id);
    if (tasksWithoutIds.length > 0) {
      console.warn("TaskList: Found tasks without IDs:", tasksWithoutIds);
    }
  }

  const filteredTasks = allTasks.filter((task) => {
    switch (filter) {
      case "today":
        const today = new Date().toDateString();
        return (
          task.scheduledTime &&
          new Date(task.scheduledTime).toDateString() === today
        );
      case "pending":
        return !task.completed;
      case "completed":
        return task.completed;
      default:
        return true;
    }
  });

  const handleTaskToggle = (
    goalId: string,
    taskId: string,
    completed: boolean,
  ) => {
    updateTask(goalId, taskId, { completed, progress: completed ? 100 : 0 });
  };

  const handleStartFocus = (task: TaskWithGoal) => {
    if (!user?.id) return;
    setCurrentTask(task);
    startFocusSession(task.id, user.id);
  };

  const generateTasksForGoal = async (goal: Goal) => {
    if (!user?.id) return;

    try {
      const result = await generatePlan.mutateAsync({
        goals: [goal],
        availableTime: 8 * 3600, // 8 hours default
        energy: 3, // medium energy default
        userId: user.id,
      });

      console.log("Generated plan result:", result);

      // Update the goal with generated tasks
      if (result && result.tasks && result.tasks.length > 0) {
        // Create each task individually
        for (let index = 0; index < result.tasks.length; index++) {
          const task = result.tasks[index];
          const taskWithDefaults = {
            ...task,
            id: `task_${goal.id}_${index}`,
            goalId: goal.id,
            completed: false,
            progress: 0,
            createdAt: new Date().toISOString(),
          };

          await addTask(goal.id, taskWithDefaults);
        }

        // Refresh the goals list to ensure we have the latest data
        if (user?.id) {
          await loadUserGoals(user.id);
        }
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeRemaining = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled.getTime() - now.getTime();

    if (diff < 0) return "Overdue";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)} days`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Task Dialog */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updates) => {
            await updateTask(selectedTask.goalId, selectedTask.id, updates);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Your Tasks</span>
            </CardTitle>
            <div className="flex space-x-2">
              {["all", "today", "pending", "completed"].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType as "all" | "today" | "pending" | "completed")}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Goals with Tasks */}
      <div className="space-y-4">
        {(goals || []) // Ensure goals is an array
          .filter((goal) => goal && goal.id) // Ensure goal exists and has an ID
          .map((goal) => {
            const goalTasks = getTasksForGoal(goal.id).filter((task) => {
              switch (filter) {
                case "today":
                  const today = new Date().toDateString();
                  return (
                    task.scheduledTime &&
                    new Date(task.scheduledTime).toDateString() === today
                  );
                case "pending":
                  return !task.completed;
                case "completed":
                  return task.completed;
                default:
                  return true;
              }
            });

            if (goalTasks.length === 0 && filter !== "all") return null;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className={goal.completed ? "opacity-75" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <CardTitle className="text-lg">
                            {goal.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant="outline"
                              className={getPriorityColor(goal.priority)}
                            >
                              {goal.priority}
                            </Badge>
                            <Badge variant="outline">{goal.category}</Badge>
                            <span className="text-sm text-gray-500">
                              Due:{" "}
                              {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(goal.progress)}% Complete
                          </div>
                          <Progress
                            value={goal.progress}
                            className="w-24 mt-1"
                          />
                        </div>
                        {goalTasks.length === 0 && (
                          <Button
                            size="sm"
                            onClick={() => generateTasksForGoal(goal)}
                            disabled={generatePlan.isPending}
                          >
                            {generatePlan.isPending
                              ? "Generating..."
                              : "Generate Tasks"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {goalTasks.length > 0 && (
                    <CardContent>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {goalTasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                                task.completed
                                  ? "bg-gray-50 opacity-75"
                                  : "bg-white"
                              } ${
                                currentTask?.id === task.id
                                  ? "ring-2 ring-blue-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={(checked: boolean) =>
                                      handleTaskToggle(
                                        goal.id,
                                        task.id,
                                        checked
                                      )
                                    }
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h4
                                        className={`font-medium ${
                                          task.completed
                                            ? "line-through text-gray-500"
                                            : ""
                                        }`}
                                      >
                                        {task.title}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className={getPriorityColor(
                                          task.priority,
                                        )}
                                      >
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {Math.round(task.estimatedTime / 60)}{" "}
                                          min
                                        </span>
                                      </div>
                                      {task.scheduledTime && (
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>
                                            {getTimeRemaining(
                                              task.scheduledTime,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {task.progress > 0 &&
                                        task.progress < 100 && (
                                          <div className="flex items-center space-x-2">
                                            <Progress
                                              value={task.progress}
                                              className="w-16 h-1"
                                            />
                                            <span>{task.progress}%</span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {!task.completed && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleStartFocus({
                                          ...task,
                                          goalId: goal.id,
                                          goalTitle: goal.title,
                                        })
                                      }
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Focus
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setSelectedTask({
                                        ...task,
                                        goalId: goal.id,
                                        goalTitle: goal.title,
                                      })
                                    }
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "all"
                ? "Create your first goal to get started with AI-powered task planning."
                : `No ${filter} tasks at the moment.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
