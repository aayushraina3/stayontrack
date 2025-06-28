"use client"

import { useState } from "react"
import type { StepComponentProps, WorkStyle } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

export function WorkStyleStep({ data, onNext, onBack }: StepComponentProps) {
  const [workStyle, setWorkStyle] = useState<WorkStyle>({
    workingHours: data.workStyle?.workingHours || "flexible",
    breakFrequency: data.workStyle?.breakFrequency || [30],
    taskComplexity: data.workStyle?.taskComplexity || "moderate",
    motivationStyle: data.workStyle?.motivationStyle || "encouraging",
    distractionLevel: data.workStyle?.distractionLevel || "medium",
    focusTime: data.workStyle?.focusTime || [90],
    workEnvironment: data.workStyle?.workEnvironment || "quiet",
    energyPeaks: data.workStyle?.energyPeaks || [],
  })

  const energyOptions = [
    { id: "early-morning", label: "Early Morning (6-9 AM)" },
    { id: "morning", label: "Morning (9-12 PM)" },
    { id: "afternoon", label: "Afternoon (12-3 PM)" },
    { id: "late-afternoon", label: "Late Afternoon (3-6 PM)" },
    { id: "evening", label: "Evening (6-9 PM)" },
    { id: "night", label: "Night (9 PM+)" },
  ]

  const handleEnergyPeakChange = (peakId: string, checked: boolean) => {
    setWorkStyle((prev) => ({
      ...prev,
      energyPeaks: checked
        ? [...prev.energyPeaks, peakId]
        : prev.energyPeaks.filter((id) => id !== peakId),
    }))
  }

  const handleNext = () => {
    onNext({
      ...data,
      workStyle: workStyle,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Work Style Assessment
        </h2>
        <p className="text-gray-600">
          Help us understand how you work best so we can personalize your
          experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Working Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Schedule</Label>
              <Select
                value={workStyle.workingHours}
                onValueChange={(value: WorkStyle["workingHours"]) =>
                  setWorkStyle({
                    ...workStyle,
                    workingHours: value as WorkStyle["workingHours"]
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early">
                    Early Bird (6 AM - 2 PM)
                  </SelectItem>
                  <SelectItem value="standard">
                    Standard (9 AM - 5 PM)
                  </SelectItem>
                  <SelectItem value="late">Night Owl (12 PM - 8 PM)</SelectItem>
                  <SelectItem value="flexible">Flexible Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Energy Peak Times</Label>
              <div className="space-y-2">
                {energyOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={workStyle.energyPeaks.includes(option.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleEnergyPeakChange(option.id, checked)
                      }
                    />
                    <Label htmlFor={option.id} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Focus Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ideal Focus Session Length</Label>
              <div className="px-2">
                <Slider
                  value={workStyle.focusTime}
                  onValueChange={(value: number[]) =>
                    setWorkStyle({ ...workStyle, focusTime: value })
                  }
                  max={180}
                  min={15}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black mt-1">
                  <span>15 min</span>
                  <span className="font-medium">
                    {workStyle.focusTime[0]} minutes
                  </span>
                  <span>3 hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Break Frequency</Label>
              <div className="px-2">
                <Slider
                  value={workStyle.breakFrequency}
                  onValueChange={(value: number[]) =>
                    setWorkStyle({ ...workStyle, breakFrequency: value })
                  }
                  max={120}
                  min={15}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black mt-1">
                  <span>15 min</span>
                  <span className="font-medium">
                    Every {workStyle.breakFrequency[0]} minutes
                  </span>
                  <span>2 hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Environment</Label>
              <Select
                value={workStyle.workEnvironment}
                onValueChange={(value: string) =>
                  setWorkStyle({
                    ...workStyle,
                    workEnvironment: value as
                      | "quiet"
                      | "background-noise"
                      | "music"
                      | "social",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiet">Quiet & Isolated</SelectItem>
                  <SelectItem value="background-noise">
                    Light Background Noise
                  </SelectItem>
                  <SelectItem value="music">Music & Sounds</SelectItem>
                  <SelectItem value="social">Social Environment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task & Motivation Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Task Complexity</Label>
              <Select
                value={workStyle.taskComplexity}
                onValueChange={(value: string) =>
                  setWorkStyle({
                    ...workStyle,
                    taskComplexity: value as
                      | "simple"
                      | "moderate"
                      | "complex"
                      | "mixed",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple, Quick Tasks</SelectItem>
                  <SelectItem value="moderate">Moderate Complexity</SelectItem>
                  <SelectItem value="complex">
                    Complex, Challenging Tasks
                  </SelectItem>
                  <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Distraction Level</Label>
              <Select
                value={workStyle.distractionLevel}
                onValueChange={(value: string) =>
                  setWorkStyle({
                    ...workStyle,
                    distractionLevel: value as "low" | "medium" | "high",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    Low - I stay focused easily
                  </SelectItem>
                  <SelectItem value="medium">
                    Medium - Sometimes get distracted
                  </SelectItem>
                  <SelectItem value="high">High - Easily distracted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Motivation Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Motivation Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>How do you prefer to be motivated?</Label>
              <Select
                value={workStyle.motivationStyle}
                onValueChange={(value: string) =>
                  setWorkStyle({
                    ...workStyle,
                    motivationStyle: value as
                      | "encouraging"
                      | "direct"
                      | "supportive"
                      | "energetic"
                      | "calm",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="encouraging">
                    Encouraging & Positive
                  </SelectItem>
                  <SelectItem value="direct">
                    Direct & Straightforward
                  </SelectItem>
                  <SelectItem value="supportive">
                    Supportive & Understanding
                  </SelectItem>
                  <SelectItem value="energetic">
                    Energetic & Enthusiastic
                  </SelectItem>
                  <SelectItem value="calm">Calm & Reassuring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong>{" "}
                {workStyle.motivationStyle === "encouraging"
                  ? "You're doing great! Keep up the momentum!"
                  : workStyle.motivationStyle === "direct"
                  ? "Time to focus. Let's get this task done."
                  : workStyle.motivationStyle === "supportive"
                  ? "I understand this is challenging. Take it one step at a time."
                  : workStyle.motivationStyle === "energetic"
                  ? "Let's crush this goal! You've got the energy!"
                  : "Take a deep breath. You're capable of completing this task calmly."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Continue</Button>
      </div>
    </div>
  )
}
