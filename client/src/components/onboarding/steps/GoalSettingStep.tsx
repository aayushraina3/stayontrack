"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { StepComponentProps, Goal } from "@/types";

export function GoalSettingStep({
  data,
  onNext,
  onBack,
  isFirst,
}: StepComponentProps) {
  const [goals, setGoals] = useState<Goal[]>(data.goals || []);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal>>({
    priority: "medium",
    category: "work",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const addGoal = (goalData: Partial<Goal>) => {
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title: goalData.title || "",
      description: goalData.description || "",
      deadline: goalData.deadline || "",
      priority: goalData.priority || "medium",
      category: goalData.category || "personal",
      completed: false,
      progress: 0,
      taskIds: [],
      createdAt: new Date().toISOString(),
    };

    setGoals([...goals, newGoal]);
    setCurrentGoal({ priority: "medium", category: "work" });
    reset();
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const handleNext = () => {
    if (goals.length === 0) {
      alert("Please add at least one goal to continue.");
      return;
    }
    onNext({ goals });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Your Goals
        </h2>
        <p className="text-gray-600">
          Tell us what you want to achieve. Our AI will help create the perfect
          plan.
        </p>
      </div>

      {/* Add Goal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(addGoal)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setCurrentGoal({
                      ...currentGoal,
                      priority: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("priority")}
                  value={currentGoal.priority}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  defaultValue="work"
                  onValueChange={(value: "work" | "personal" | "learning" | "health" | "creative") =>
                    setCurrentGoal({
                      ...currentGoal,
                      category: value
                    })
                  }
                >
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
                <input
                  type="hidden"
                  {...register("category")}
                  value={currentGoal.category}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Goals List */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Your Goals ({goals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          goal.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : goal.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {goal.priority}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {goal.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {goal.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {goal.deadline}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isFirst}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={goals.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
