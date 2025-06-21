import { Injectable } from "@nestjs/common";
import { MotivationRequestDto } from "../dto/agents.dto";
import { MotivationResult } from "../../types";
import { RAGService } from "src/rag-service/rag.service";
import { AIService } from "src/ai-service/ai.service";

@Injectable()
export class MotivatorService {
  constructor(
    private readonly aiService: AIService,
    private readonly ragService: RAGService,
  ) {}

  async generateMotivation(
    request: MotivationRequestDto,
  ): Promise<MotivationResult> {
    try {
      const userContext = await this.ragService.buildContextPrompt(
        request.userId,
      );

      const systemPrompt = `You are a motivational coach specialized in helping people overcome procrastination. 

${userContext}

REQUIREMENTS:
1. Provide personalized motivation based on user's historical preferences
2. Address specific energy levels and task contexts
3. Include actionable advice for immediate implementation
4. Match the user's preferred motivation style
5. Be encouraging but realistic

RESPONSE FORMAT (JSON only):
{
  "message": "Motivational message",
  "actionableAdvice": ["advice1", "advice2"],
  "timestamp": "${new Date().toISOString()}"
}`;

      const userPrompt = `Task: ${request.task}
Energy Level: ${request.energy}/5
Progress: ${Math.round(request.progress * 100)}%
Timeframe: ${request.timeframe}

Generate motivation that will help me stay focused and productive.`;

      const response = await this.aiService.chatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const motivation = this.aiService.parseJsonResponse(
        response,
      ) as MotivationResult;
      return this.validateMotivationResponse(motivation);
    } catch (error) {
      console.error("Motivation generation error:", error);
      throw new Error("Failed to generate motivation");
    }
  }

  private validateMotivationResponse(
    motivation: MotivationResult,
  ): MotivationResult {
    return {
      message:
        motivation.message || "You've got this! Every small step counts.",
      tone: motivation.tone || "encouraging",
      encouragementLevel: Number(motivation.encouragementLevel) || 8,
      positivityScore: Number(motivation.positivityScore) || 8,
      actionableAdvice: Array.isArray(motivation.actionableAdvice)
        ? motivation.actionableAdvice
        : [
            "Take a 5-minute break and come back refreshed",
            "Break the task into smaller, manageable chunks",
          ],
      timestamp: motivation.timestamp || new Date().toISOString(),
    };
  }
}
