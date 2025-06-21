import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase-service/firebase.service";

interface UserContext {
  completionRate: number;
  averageTaskDuration: number;
  preferredMotivationStyle: string;
  commonDistractions: string[];
  productiveTimeSlots: string[];
  taskComplexityPreference: "simple" | "moderate" | "complex";
  historicalPerformance: {
    totalTasks: number;
    completedTasks: number;
    averageFocusScore: number;
    streakRecord: number;
  };
}

@Injectable()
export class RAGService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getUserContext(userId: string): Promise<UserContext> {
    try {
      // Get user's historical data
      const sessions = await this.firebaseService.findMany("sessions", {
        userId,
      });
      const goals = await this.firebaseService.findMany("goals", { userId });
      const feedback = await this.firebaseService.findMany("feedback", {
        userId,
      });

      // Calculate completion rate
      const completedTasks = sessions.filter(
        (s) => s.status === "completed",
      ).length;
      const totalTasks = sessions.length;
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

      // Calculate average task duration
      const completedSessions = sessions.filter((s) => s.duration);
      const averageTaskDuration =
        completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.duration, 0) /
            completedSessions.length
          : 1800; // 30 minutes default

      // Analyze motivation preferences from feedback
      const motivationStyles = feedback
        .filter((f) => f.motivationEffectiveness)
        .map((f) => f.motivationStyle);
      const preferredMotivationStyle =
        this.getMostFrequent(motivationStyles) || "encouraging";

      // Extract common distractions
      const distractions = feedback
        .filter((f) => f.distractions)
        .flatMap((f) => f.distractions);
      const commonDistractions = this.getTopFrequent(distractions, 3);

      // Find productive time slots
      const productiveSlots = sessions
        .filter((s) => s.focusScore > 7)
        .map((s) => new Date(s.startTime).getHours());
      const productiveTimeSlots = this.getTopFrequent(productiveSlots, 3).map(
        (hour) => `${hour}:00-${hour + 1}:00`,
      );

      // Determine task complexity preference
      const complexityPreference = this.analyzeComplexityPreference(
        sessions,
        feedback,
      );

      // Calculate historical performance metrics
      const averageFocusScore =
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) /
            sessions.length
          : 0;

      const streakRecord = this.calculateMaxStreak(sessions);

      return {
        completionRate,
        averageTaskDuration,
        preferredMotivationStyle,
        commonDistractions,
        productiveTimeSlots,
        taskComplexityPreference: complexityPreference,
        historicalPerformance: {
          totalTasks,
          completedTasks,
          averageFocusScore,
          streakRecord,
        },
      };
    } catch (error) {
      console.error("Error getting user context:", error);
      // Return default context for new users
      return this.getDefaultUserContext();
    }
  }

  private getMostFrequent(items: string[]): string | null {
    if (items.length === 0) return null;

    const frequency = items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b,
    );
  }

  private getTopFrequent(items: any[], count: number): any[] {
    const frequency = items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<any, number>,
    );

    return Object.entries(frequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, count)
      .map(([item]) => item);
  }

  private analyzeComplexityPreference(
    sessions: any[],
    feedback: any[],
  ): "simple" | "moderate" | "complex" {
    // Analyze user's success rate with different task complexities
    const complexitySuccess = feedback.reduce(
      (acc, f) => {
        if (f.taskComplexity && f.completed) {
          acc[f.taskComplexity] = (acc[f.taskComplexity] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const bestComplexity = Object.keys(complexitySuccess).reduce(
      (a, b) => (complexitySuccess[a] > complexitySuccess[b] ? a : b),
      "moderate",
    );

    return bestComplexity as "simple" | "moderate" | "complex";
  }

  private calculateMaxStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const completedDates = sessions
      .filter((s) => s.status === "completed")
      .map((s) => new Date(s.createdAt).toDateString())
      .sort();

    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = new Date(completedDates[i - 1]);
      const currDate = new Date(completedDates[i]);
      const diffDays =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(maxStreak, currentStreak);
  }

  private getDefaultUserContext(): UserContext {
    return {
      completionRate: 0.7,
      averageTaskDuration: 1800,
      preferredMotivationStyle: "encouraging",
      commonDistractions: [],
      productiveTimeSlots: ["09:00-10:00", "14:00-15:00"],
      taskComplexityPreference: "moderate",
      historicalPerformance: {
        totalTasks: 0,
        completedTasks: 0,
        averageFocusScore: 0,
        streakRecord: 0,
      },
    };
  }

  async buildContextPrompt(userId: string): Promise<string> {
    const context = await this.getUserContext(userId);

    return `User Context:
- Completion Rate: ${(context.completionRate * 100).toFixed(1)}%
- Average Task Duration: ${Math.round(context.averageTaskDuration / 60)} minutes
- Preferred Motivation Style: ${context.preferredMotivationStyle}
- Common Distractions: ${context.commonDistractions.join(", ") || "None identified"}
- Productive Time Slots: ${context.productiveTimeSlots.join(", ")}
- Task Complexity Preference: ${context.taskComplexityPreference}
- Historical Performance: ${context.historicalPerformance.completedTasks}/${context.historicalPerformance.totalTasks} tasks completed
- Average Focus Score: ${context.historicalPerformance.averageFocusScore.toFixed(1)}/10
- Best Streak: ${context.historicalPerformance.streakRecord} days`;
  }
}
