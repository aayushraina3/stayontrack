import { Injectable } from "@nestjs/common";
import { AIService } from "../../ai-service/ai.service";
import { RAGService } from "../../rag-service/rag.service";
import { PlanRequestDto } from "../dto/agents.dto";
import { PlanResult } from "../../types";

@Injectable()
export class PlannerService {
  constructor(
    private readonly aiService: AIService,
    private readonly ragService: RAGService,
  ) {}

  async generatePlan(request: PlanRequestDto): Promise<PlanResult> {
    try {
      const userContext = await this.ragService.buildContextPrompt(
        request.userId,
      );

      const systemPrompt = `You are an expert task planner. Create a detailed, actionable plan based on the user's goals and historical context.

${userContext}

REQUIREMENTS:
1. Break down complex goals into specific, actionable tasks
2. Estimate realistic time durations based on user's historical performance
3. Prioritize tasks effectively
4. Consider the user's productive time slots and energy patterns
5. Account for potential distractions and build in buffer time
6. Provide a feasibility score (0-10) based on user's completion rate

RESPONSE FORMAT (JSON only):
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Task title",
      "description": "Detailed description",
      "estimatedTime": 1800,
      "priority": "high|medium|low",
      "category": "work|personal|learning",
      "dependencies": ["task_id_if_any"]
    }
  ],
  "schedule": [
    {
      "taskId": "task_1",
      "timeSlot": "09:00-10:30",
      "date": "2024-01-15"
    }
  ],
  "estimatedTotalTime": 7200,
  "recommendations": ["recommendation1", "recommendation2"],
  "feasibilityScore": 8.5
}`;

      const userPrompt = `Goals: ${JSON.stringify(request.goals)}
Available Time: ${request.availableTime} seconds
Energy Level: ${request.energy}/5
Context: ${request.context || "General productivity"}

Create a comprehensive plan that maximizes success probability.`;

      const response = await this.aiService.chatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const plan = this.aiService.parseJsonResponse(response) as PlanResult;

      // Validate and sanitize the response
      return this.validatePlanResponse(plan);
    } catch (error) {
      console.error("Plan generation error:", error);
      throw new Error("Failed to generate plan");
    }
  }

  private validatePlanResponse(plan: PlanResult): PlanResult {
    return {
      tasks: Array.isArray(plan.tasks)
        ? plan.tasks.map((task, index) => ({
            id: task.id || `task_${index + 1}`,
            title: task.title || `Task ${index + 1}`,
            description: task.description || "",
            estimatedTime: Number(task.estimatedTime) || 1800,
            priority: ["low", "medium", "high"].includes(task.priority)
              ? task.priority
              : "medium",
            category: task.category || "work",
            dependencies: Array.isArray(task.dependencies)
              ? task.dependencies
              : [],
          }))
        : [],
      schedule: Array.isArray(plan.schedule) ? plan.schedule : [],
      estimatedTotalTime: Number(plan.estimatedTotalTime) || 0,
      recommendations: Array.isArray(plan.recommendations)
        ? plan.recommendations
        : [],
      feasibilityScore: Number(plan.feasibilityScore) || 7,
    };
  }
}
