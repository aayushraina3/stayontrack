import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define the union type for feelings
type FeelingType = "great" | "okay" | "struggled";

export interface SessionFeedbackData {
  feeling: string;
  helpfulFactors: string[];
  notes?: string;
  // Add other feedback fields as needed
}

interface SessionFeedbackProps {
  onFeedbackSubmit: (feedback: {
    feeling: FeelingType;
    helpfulFactors: string[];
    notes?: string;
  }) => void;
  taskTitle: string;
  duration: number;
  isOpen: boolean;
}

export const SessionFeedback: React.FC<SessionFeedbackProps> = ({
  onFeedbackSubmit,
  taskTitle,
  duration,
  isOpen,
}) => {
  const [feeling, setFeeling] = useState<FeelingType | null>(null);
  const [helpfulFactors, setHelpfulFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const HELPFUL_FACTORS = [
    "Time pressure",
    "Blocking distractions",
    "Breaking it down",
    "Encouragement",
    "Clear focus",
    "Good energy level",
    "Quiet environment",
    "Having a plan",
  ];

  const FEELINGS: { value: FeelingType; emoji: string; label: string }[] = [
    { value: "great", emoji: "🎯", label: "Great" },
    { value: "okay", emoji: "👍", label: "Okay" },
    { value: "struggled", emoji: "😅", label: "Struggled" },
  ];

  const handleFactorToggle = (factor: string) => {
    setHelpfulFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handleSubmit = () => {
    if (feeling) {
      onFeedbackSubmit({
        feeling,
        helpfulFactors,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setFeeling(null);
      setHelpfulFactors([]);
      setNotes("");
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Session Complete! 🎉
            </h2>
            <p className="text-gray-600">
              You worked on <strong>{taskTitle}</strong> for{" "}
              {formatDuration(duration)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              How did that feel?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {FEELINGS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFeeling(option.value)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    feeling === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  type="button"
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              What helped most?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {HELPFUL_FACTORS.map((factor) => (
                <label
                  key={factor}
                  className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={helpfulFactors.includes(factor)}
                    onChange={() => handleFactorToggle(factor)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{factor}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any additional notes? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What worked well? What could be improved?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={!feeling} className="w-full">
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
