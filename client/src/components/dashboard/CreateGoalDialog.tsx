"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useAppStore } from "@/stores/useAppStore"
import { useGeneratePlan } from "@/hooks/useAgents"
import { SubmitHandler, useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { motion } from "framer-motion"

interface CreateGoalDialogProps {
  onClose: () => void
}

interface GoalFormData {
  title: string
  description: string
  deadline: string
}

export function CreateGoalDialog({ onClose }: CreateGoalDialogProps) {
  const { user } = useUser()
  const { addGoal, addTask, updateGoal } = useAppStore()
  const generatePlan = useGeneratePlan()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GoalFormData>()
  const [priority, setPriority] = useState("medium")
  const [category, setCategory] = useState("work")
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)

  const onSubmit: SubmitHandler<GoalFormData> = async (data) => {
    try {
      setIsGeneratingTasks(true)

      const newGoal = {
        id: `goal_${Date.now()}`,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        priority: priority as "low" | "medium" | "high",
        category: category as
          | "work"
          | "personal"
          | "learning"
          | "health"
          | "creative",
        taskIds: [],
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        userId: user?.id || "",
      }

      // First, create the goal
      await addGoal(newGoal)

      // Then, generate tasks using the planner agent
      try {
        const planResponse = await generatePlan.mutateAsync({
          goals: [newGoal],
          availableTime: 8 * 60 * 60, // 8 hours in seconds (default)
          energy: 3, // Medium energy level (default)
          userId: user?.id || "",
        })

        // Update the goal with generated tasks
        if (
          planResponse &&
          planResponse.tasks &&
          planResponse.tasks.length > 0
        ) {
          // Create each task individually
          for (let index = 0; index < planResponse.tasks.length; index++) {
            const task = planResponse.tasks[index]
            const taskWithDefaults = {
              ...task,
              id: `task_${newGoal.id}_${index}`,
              goalId: newGoal.id,
              completed: false,
              progress: 0,
              createdAt: new Date().toISOString(),
            }

            await addTask(newGoal.id, taskWithDefaults)
          }
        }
      } catch (plannerError) {
        console.warn(
          "Failed to generate tasks, goal created without tasks:",
          plannerError
        )
        // Goal was created successfully, just continue without tasks
      }

      setIsGeneratingTasks(false)
      onClose()
    } catch (error) {
      console.error("Failed to create goal:", error)
      setIsGeneratingTasks(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Goal</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g., Complete project proposal"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">
                    {errors.title.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your goal in detail..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register("deadline", {
                    required: "Deadline is required",
                  })}
                />
                {errors.deadline && (
                  <p className="text-sm text-red-600">
                    {errors.deadline.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isGeneratingTasks}
                >
                  {isGeneratingTasks
                    ? "Creating Goal & Tasks..."
                    : "Create Goal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
