import { Injectable } from "@nestjs/common";
import { AIService } from "../../ai-service/ai.service";
import { RAGService } from "../../rag-service/rag.service";
import { BlockerConfiguration } from "../../types";

@Injectable()
export class BlockerService {
  constructor(
    private readonly aiService: AIService,
    private readonly ragService: RAGService,
  ) {}

  async generateBlockerConfig(request: {
    userId: string;
    taskType: string;
    sessionDuration: number;
    distractionLevel: "low" | "medium" | "high";
  }): Promise<BlockerConfiguration> {
    try {
      const userContext = await this.ragService.buildContextPrompt(
        request.userId,
      );

      const systemPrompt = `You are a focus optimization specialist. Create a distraction blocking configuration based on user's task and historical distraction patterns.

${userContext}

BLOCKING STRATEGIES:
1. Website blocking - Common distraction sites
2. Time-based restrictions - Limit access during focus periods
3. Break scheduling - Strategic breaks to maintain focus
4. Motivational interventions - Gentle reminders when distractions detected

RESPONSE FORMAT (JSON only):
{
  "sessionId": "session_${Date.now()}",
  "blockedSites": ["site1.com", "site2.com"],
  "allowedSites": ["essential-site.com"],
  "blockDuration": 3600,
  "breakIntervals": [1800, 3600],
  "distractionLevel": "medium",
  "customRules": [
    {
      "type": "time_limit",
      "value": "social-media",
      "duration": 300
    }
  ],
  "motivationalReminders": ["reminder1", "reminder2"]
}`;

      const userPrompt = `Task Type: ${request.taskType}
Session Duration: ${request.sessionDuration} seconds
Distraction Level: ${request.distractionLevel}

Create an optimal blocking configuration for maximum focus.`;

      const response = await this.aiService.chatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const config = this.aiService.parseJsonResponse(response);
      return this.validateBlockerResponse(config, request);
    } catch (error) {
      console.error("Blocker configuration error:", error);
      return this.getDefaultBlockerConfig(request);
    }
  }

  private validateBlockerResponse(
    config: any,
    request: any,
  ): BlockerConfiguration {
    return {
      sessionId: config.sessionId || `session_${Date.now()}`,
      blockedSites: Array.isArray(config.blockedSites)
        ? config.blockedSites
        : [
            "facebook.com",
            "twitter.com",
            "instagram.com",
            "youtube.com",
            "reddit.com",
          ],
      allowedSites: Array.isArray(config.allowedSites)
        ? config.allowedSites
        : [],
      blockDuration: Number(config.blockDuration) || request.sessionDuration,
      breakIntervals: Array.isArray(config.breakIntervals)
        ? config.breakIntervals
        : [1800],
      distractionLevel: config.distractionLevel || request.distractionLevel,
      customRules: Array.isArray(config.customRules) ? config.customRules : [],
      motivationalReminders: Array.isArray(config.motivationalReminders)
        ? config.motivationalReminders
        : [
            "Stay focused! You're doing great!",
            "Remember your goal - every minute counts!",
          ],
    };
  }

  private getDefaultBlockerConfig(request: any): BlockerConfiguration {
    return {
      sessionId: `session_${Date.now()}`,
      blockedSites: [
        "facebook.com",
        "twitter.com",
        "instagram.com",
        "youtube.com",
      ],
      allowedSites: [],
      blockDuration: request.sessionDuration,
      breakIntervals: [1800],
      distractionLevel: request.distractionLevel,
      customRules: [],
      motivationalReminders: ["Stay focused!", "You're making progress!"],
    };
  }

  // Method to activate blocking (this would interface with browser extension)
  activateBlocking(config: BlockerConfiguration): {
    success: boolean;
    message: string;
  } {
    try {
      // In a real implementation, this would:
      // 1. Send configuration to browser extension
      // 2. Set up system-level blocks if needed
      // 3. Schedule break intervals
      // 4. Start monitoring for distractions

      console.log("Activating blocker with config:", config);

      return {
        success: true,
        message: "Focus mode activated! Distractions are now blocked.",
      };
    } catch (error) {
      console.error("Blocker activation error:", error);
      return {
        success: false,
        message: "Failed to activate blocker. Please try again.",
      };
    }
  }
}
