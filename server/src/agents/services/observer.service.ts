import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../../firebase-service/firebase.service";
import { AIService } from "../../ai-service/ai.service";
import { SessionsService } from "../../sessions/sessions.service";
import { TasksService } from "../../tasks/tasks.service";
import { v4 as uuidv4 } from "uuid";
import { FeedbackDto, InsightRequestDto } from "../dto/agents.dto";
import { InsightPromptRequest, HourlyData } from "../../types/index";
import { Session } from "src/sessions/dto/session.dto";

type Recommendation = {
  type: string;
  title: string;
  description: string;
  priority: string;
};

type InterruptionPattern = {
  type: string;
  frequency: string;
  impact: string;
};

@Injectable()
export class ObserverService {
  private readonly collection = "user_insights";

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly aiService: AIService,
    private readonly sessionsService: SessionsService,
    private readonly tasksService: TasksService,
  ) {}

  async generateInsights(request: InsightRequestDto, refresh: boolean) {
    // Check for cached insights if not refreshing
    if (!refresh) {
      const cached = await this.getCachedInsights(
        request.userId,
        request.timeframe,
      );
      if (cached && this.isCacheValid(cached.createdAt, request.timeframe)) {
        return cached;
      }
    }

    // Gather data from various sources
    const [sessionStats, taskStats, patterns] = await Promise.all([
      this.sessionsService.getStats(
        request.userId,
        request.timeframe || "week",
      ),
      this.tasksService.getTaskStats(
        request.userId,
        request.timeframe || "week",
      ),
      this.analyzePatterns(request.userId),
    ]);

    // Generate AI insights
    const aiInsights = await this.generateAIInsights(request.userId, {
      sessions: sessionStats,
      tasks: taskStats,
      patterns,
      timeframe: request.timeframe || "week",
    });

    const insights = {
      id: uuidv4(),
      userId: request.userId,
      timeframe: request.timeframe || "week",
      sessionStats,
      taskStats,
      patterns,
      aiInsights,
      createdAt: new Date(),
    };

    // Store insights
    await this.firebaseService.create(this.collection, insights, insights.id);

    return insights;
  }

  async analyzePatterns(userId: string) {
    const sessions = await this.sessionsService.findByUser(userId, 100);

    if (sessions.length < 5) {
      return {
        peakHours: [],
        averageSessionLength: 0,
        consistencyScore: 0,
        focusTrends: "insufficient_data",
        interruptionPatterns: [],
      };
    }

    // Analyze peak productivity hours
    const hourlyData = this.groupSessionsByHour(sessions);
    const peakHours = this.findPeakHours(hourlyData);

    // Calculate consistency
    const consistencyScore = this.calculateConsistency(sessions);

    // Analyze focus trends
    const focusTrends = this.analyzeFocusTrends(sessions);

    // Analyze interruption patterns
    const interruptionPatterns = this.analyzeInterruptions(sessions);

    return {
      peakHours,
      averageSessionLength: this.calculateAverageSessionLength(sessions),
      consistencyScore,
      focusTrends,
      interruptionPatterns,
      totalDataPoints: sessions.length,
    };
  }

  async getRecommendations(userId: string) {
    const patterns = await this.analyzePatterns(userId);
    // const recentInsights = await this.getRecentInsights(userId);

    const recommendations: Recommendation[] = [];

    // Time-based recommendations
    if (patterns.peakHours.length > 0) {
      recommendations.push({
        type: "timing",
        title: "Optimize Your Schedule",
        description: `You're most productive at ${patterns.peakHours.join(", ")}. Try scheduling important tasks during these hours.`,
        priority: "high",
      });
    }

    // Session length recommendations
    if (patterns.averageSessionLength < 1500) {
      // Less than 25 minutes
      recommendations.push({
        type: "duration",
        title: "Extend Focus Sessions",
        description:
          "Try gradually increasing your focus sessions to 25-45 minutes for better deep work.",
        priority: "medium",
      });
    } else if (patterns.averageSessionLength > 5400) {
      // More than 90 minutes
      recommendations.push({
        type: "duration",
        title: "Take More Breaks",
        description:
          "Consider shorter sessions with regular breaks to maintain high focus quality.",
        priority: "medium",
      });
    }

    // Consistency recommendations
    if (patterns.consistencyScore < 0.6) {
      recommendations.push({
        type: "consistency",
        title: "Build a Routine",
        description:
          "Try to work at similar times each day to build a strong productivity habit.",
        priority: "high",
      });
    }

    // Interruption-based recommendations
    if (patterns.interruptionPatterns.length > 0) {
      const mainInterruption = patterns.interruptionPatterns[0];
      recommendations.push({
        type: "focus",
        title: "Reduce Interruptions",
        description: `${mainInterruption.type} seems to be your main distraction. Consider using website blockers or phone settings.`,
        priority: "high",
      });
    }

    return {
      recommendations,
      basedOn: {
        patterns,
        dataPoints: patterns.totalDataPoints,
      },
      generatedAt: new Date(),
    };
  }

  private async generateAIInsights(userId: string, data: InsightPromptRequest) {
    const prompt = this.buildInsightPrompt(data);

    try {
      const response = await this.aiService.chatCompletion([
        {
          role: "system",
          content:
            "You are a productivity analyst AI. Provide actionable insights based on user data. Be encouraging but honest about areas for improvement.",
        },
        { role: "user", content: prompt },
      ]);

      return {
        summary: response,
        keyFindings: this.extractKeyFindings(response),
        actionItems: this.extractActionItems(response),
      };
    } catch (error) {
      console.error("AI insight generation failed:", error);
      return {
        summary: "Unable to generate AI insights at this time.",
        keyFindings: [],
        actionItems: [],
      };
    }
  }

  private buildInsightPrompt(data: InsightPromptRequest): string {
    const { sessions, tasks, patterns, timeframe } = data;

    return `Analyze this user's ${timeframe} productivity data:

SESSION DATA:
- Total sessions: ${sessions.summary?.totalSessions || 0}
- Total focus time: ${Math.round((sessions.summary?.totalDuration || 0) / 60)} minutes
- Average focus score: ${sessions.summary?.avgFocusScore || 0}/100
- Average session length: ${Math.round((sessions.summary?.avgSessionLength || 0) / 60)} minutes
- Interruptions: ${sessions.summary?.totalInterruptions || 0}

TASK DATA:
- Total tasks: ${tasks.total || 0}
- Completed: ${tasks.completed || 0}
- Completion rate: ${Math.round(tasks.completionRate || 0)}%

PATTERNS:
- Peak hours: ${patterns.peakHours?.join(", ") || "Not enough data"}
- Consistency score: ${Math.round((patterns.consistencyScore || 0) * 100)}%
- Focus trend: ${patterns.focusTrends || "stable"}

Provide 2-3 key insights and 2-3 specific action items for improvement.`;
  }

  private extractKeyFindings(response: string): string[] {
    const findings: string[] = [];
    const lines = response.split("\n");

    for (const line of lines) {
      if (
        line.toLowerCase().includes("finding") ||
        line.toLowerCase().includes("insight") ||
        line.toLowerCase().includes("pattern")
      ) {
        findings.push(line.trim());
      }
    }

    return findings.slice(0, 3);
  }

  private extractActionItems(response: string): string[] {
    const actions: string[] = [];
    const lines = response.split("\n");

    for (const line of lines) {
      if (
        line.toLowerCase().includes("recommend") ||
        line.toLowerCase().includes("try") ||
        line.toLowerCase().includes("consider") ||
        line.toLowerCase().includes("action")
      ) {
        actions.push(line.trim());
      }
    }

    return actions.slice(0, 3);
  }

  private async getCachedInsights(userId: string, timeframe: string) {
    const cached = await this.firebaseService.query(this.collection, (ref) =>
      ref
        .where("userId", "==", userId)
        .where("timeframe", "==", timeframe)
        .orderBy("createdAt", "desc")
        .limit(1),
    );

    return cached[0] || null;
  }

  private isCacheValid(createdAt: any, timeframe: string): boolean {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursSinceCreated =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    switch (timeframe) {
      case "day":
        return hoursSinceCreated < 6; // 6 hours for daily insights
      case "week":
        return hoursSinceCreated < 24; // 24 hours for weekly insights
      case "month":
        return hoursSinceCreated < 72; // 72 hours for monthly insights
      default:
        return false;
    }
  }

  private groupSessionsByHour(sessions: Session[]): HourlyData[] {
    const hourlyData = Array.from({ length: 24 }, () => ({
      sessions: 0,
      totalFocusScore: 0,
      totalDuration: 0,
    }));

    sessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      hourlyData[hour].sessions += 1;
      hourlyData[hour].totalFocusScore += session.focusScore || 0;
      hourlyData[hour].totalDuration += session.duration || 0;
    });

    return hourlyData.map((data, hour) => ({
      hour,
      ...data,
      avgFocusScore:
        data.sessions > 0 ? data.totalFocusScore / data.sessions : 0,
    }));
  }

  private findPeakHours(hourlyData: HourlyData[]): string[] {
    const productiveHours = hourlyData
      .filter((data) => data.sessions >= 2) // At least 2 sessions
      .sort((a, b) => b.avgFocusScore - a.avgFocusScore)
      .slice(0, 3);

    return productiveHours.map((data) => `${data.hour}:00`);
  }

  private calculateConsistency(sessions: Session[]): number {
    if (sessions.length < 7) return 0;

    const dailyData = {};
    sessions.forEach((session) => {
      const day = new Date(session.startTime).toDateString();
      if (!dailyData[day]) {
        dailyData[day] = 0;
      }
      dailyData[day] += 1;
    });

    const days = Object.keys(dailyData);
    const avgSessionsPerDay = sessions.length / days.length;
    const variance =
      days.reduce((sum, day) => {
        const diff = dailyData[day] - avgSessionsPerDay;
        return sum + diff * diff;
      }, 0) / days.length;

    // Lower variance = higher consistency
    return Math.max(0, 1 - variance / avgSessionsPerDay);
  }

  private analyzeFocusTrends(sessions: Session[]): string {
    if (sessions.length < 10) return "insufficient_data";

    const recentSessions = sessions.slice(0, Math.floor(sessions.length / 2));
    const olderSessions = sessions.slice(Math.floor(sessions.length / 2));

    const recentAvg =
      recentSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) /
      recentSessions.length;
    const olderAvg =
      olderSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) /
      olderSessions.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return "improving";
    if (change < -10) return "declining";
    return "stable";
  }

  private analyzeInterruptions(sessions: Session[]): InterruptionPattern[] {
    // const interruptionTypes = [
    //   "notifications",
    //   "social_media",
    //   "meetings",
    //   "other",
    // ];

    const patterns: InterruptionPattern[] = [];

    const avgInterruptions =
      sessions.reduce((sum, s) => sum + (s.interruptions || 0), 0) /
      sessions.length;

    if (avgInterruptions > 2) {
      patterns.push({
        type: "general",
        frequency: "high",
        impact: "significant",
      });
    }

    return patterns;
  }

  private calculateAverageSessionLength(sessions: Session[]): number {
    if (sessions.length === 0) return 0;
    return (
      sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
    );
  }

  private async getRecentInsights(userId: string) {
    return await this.firebaseService.query(this.collection, (ref) =>
      ref.where("userId", "==", userId).orderBy("createdAt", "desc").limit(5),
    );
  }

  async submitFeedback(feedback: FeedbackDto) {
    const feedbackRecord = {
      id: uuidv4(),
      ...feedback,
      createdAt: new Date(),
    };

    return await this.firebaseService.create(
      "insight_feedback",
      feedbackRecord,
      feedbackRecord.id,
    );
  }

  async submitInsightFeedback(feedback: {
    userId: string;
    insightId: string;
    helpful: boolean;
    comment?: string;
    submittedAt: Date;
  }) {
    const feedbackRecord = {
      id: uuidv4(),
      ...feedback,
      createdAt: new Date(),
    };

    return await this.firebaseService.create(
      "insight_feedback",
      feedbackRecord,
      feedbackRecord.id,
    );
  }
}
