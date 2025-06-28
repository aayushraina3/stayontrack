"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { TaskWithGoal } from "@/types";

interface TaskDialogProps {
  task: TaskWithGoal;
  onClose: () => void;
  onUpdate: (updates: Partial<TaskWithGoal>) => Promise<void>;
}

export function TaskDialog({ task, onClose, onUpdate }: TaskDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: task.title,
      description: task.description,
      estimatedTime: Math.round(task.estimatedTime / 60), // Convert to minutes
      scheduledTime: task.scheduledTime
        ? new Date(task.scheduledTime).toISOString().slice(0, 16)
        : "",
    },
  });

  const [priority, setPriority] = useState(task.priority);
  const [progress, setProgress] = useState([task.progress]);

  const onSubmit = async (data: {
    title: string;
    description?: string;
    estimatedTime: number;
    scheduledTime: string;
  }) => {
    const updates = {
      title: data.title,
      description: data.description,
      estimatedTime: data.estimatedTime * 60, // Convert back to seconds
      scheduledTime: data.scheduledTime
        ? new Date(data.scheduledTime).toISOString()
        : null,
      priority,
      progress: progress[0],
    } as Partial<TaskWithGoal>;

    await onUpdate(updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Task</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">Goal: {task.goalTitle}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
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
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">
                    Estimated Time (minutes)
                  </Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="5"
                    max="480"
                    {...register("estimatedTime", {
                      required: "Time is required",
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value: string) =>
                      setPriority(value as "low" | "medium" | "high")
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Scheduled Time (optional)</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  {...register("scheduledTime")}
                />
              </div>

              <div className="space-y-2">
                <Label>Progress: {progress[0]}%</Label>
                <div className="px-2">
                  <Slider
                    value={progress}
                    onValueChange={setProgress}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-black mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
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
                <Button type="submit" className="flex-1">
                  Update Task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
