import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FirebaseService } from "../firebase-service/firebase.service";
import {
  Session,
  StartSessionDto,
  EndSessionDto,
  SessionFeedbackDto,
} from "./dto/session.dto";
import { SessionDocument, SessionStats } from "../types/index";
import { v4 as uuidv4 } from "uuid";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

@Injectable()
export class SessionsService {
  private readonly collection = "work_sessions";

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async start(startSessionDto: StartSessionDto): Promise<Session> {
    const sessionData = {
      id: uuidv4(),
      ...startSessionDto,
      startTime: new Date(),
      status: "active" as const,
      focusScore: 0,
      interruptions: 0,
      agentInteractions: [],
      createdAt: new Date(),
    };

    const createdSession = await this.firebaseService.create(
      this.collection,
      sessionData,
      sessionData.id,
    );

    // Emit event for potential agent interventions
    this.eventEmitter.emit("session.started", {
      sessionId: sessionData.id,
      userId: startSessionDto.userId,
      taskId: startSessionDto.taskId,
    });

    return createdSession as Session;
  }

  async end(sessionId: string, endSessionDto: EndSessionDto): Promise<Session> {
    const session = (await this.findById(sessionId)) as Session | null;
    if (!session) {
      throw new Error("Session not found");
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - new Date(session.startTime).getTime()) / 1000,
    );

    const updateData = {
      endTime,
      duration,
      status: "completed" as const,
      focusScore: endSessionDto.focusScore,
      interruptions: endSessionDto.interruptions || 0,
      notes: endSessionDto.notes,
      updatedAt: new Date(),
    };

    await this.firebaseService.update(this.collection, sessionId, updateData);

    // Emit completion event
    this.eventEmitter.emit("session.completed", {
      sessionId,
      userId: session.userId,
      taskId: session.taskId,
      duration,
      focusScore: endSessionDto.focusScore,
    });

    return { ...session, ...updateData } as Session;
  }

  async addFeedback(sessionId: string, feedbackDto: SessionFeedbackDto) {
    try {
      console.log(`SessionsService: Adding feedback to session ${sessionId}`);
      console.log(`SessionsService: Feedback data:`, feedbackDto);

      // First check if session exists
      const existingSession = await this.firebaseService.findById(
        this.collection,
        sessionId,
      );
      if (!existingSession) {
        console.error(`SessionsService: Session ${sessionId} not found`);
        throw new Error(`Session ${sessionId} not found`);
      }

      console.log(`SessionsService: Found session:`, existingSession);

      // Convert DTO to plain object for Firestore compatibility
      const feedbackData = {
        feeling: feedbackDto.feeling,
        helpfulFactors: feedbackDto.helpfulFactors,
        notes: feedbackDto.notes,
      };

      const updateData = {
        feedback: feedbackData,
        updatedAt: new Date(),
      };

      const result = await this.firebaseService.update(
        this.collection,
        sessionId,
        updateData,
      );

      console.log(
        `SessionsService: Successfully updated session with feedback`,
      );
      return result;
    } catch (error) {
      console.error(
        `SessionsService: Error adding feedback to session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  async findById(sessionId: string) {
    return await this.firebaseService.findById(this.collection, sessionId);
  }

  async findByUser(userId: string, limit: number = 50) {
    try {
      console.log(
        `SessionsService: Finding sessions for userId: ${userId}, limit: ${limit}`,
      );

      // Simple query without orderBy to avoid index requirement
      const result = await this.firebaseService.query(this.collection, (ref) =>
        ref.where("userId", "==", userId).limit(limit),
      );

      // Sort in memory by startTime (descending - newest first)
      const sortedResult = result.sort((a, b) => {
        const timeA = a.startTime?.seconds || a.startTime?.getTime?.() || 0;
        const timeB = b.startTime?.seconds || b.startTime?.getTime?.() || 0;
        return timeB - timeA; // Descending order
      });

      console.log(
        `SessionsService: Found ${sortedResult.length} sessions for userId: ${userId}`,
      );
      return sortedResult as Session[];
    } catch (error) {
      console.error(
        `SessionsService: Error finding sessions for userId ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async getStats(userId: string, timeframe: "day" | "week" | "month" = "week") {
    const dateRange = this.getDateRange(timeframe);

    const sessions = await this.firebaseService.query(this.collection, (ref) =>
      ref
        .where("userId", "==", userId)
        .where("startTime", ">=", dateRange.start)
        .where("startTime", "<=", dateRange.end)
        .where("status", "==", "completed"),
    );

    if (sessions.length === 0) {
      return this.getEmptyStats();
    }

    const totalDuration = sessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0,
    );
    const avgFocusScore =
      sessions.reduce((sum, session) => sum + (session.focusScore || 0), 0) /
      sessions.length;
    const totalInterruptions = sessions.reduce(
      (sum, session) => sum + (session.interruptions || 0),
      0,
    );
    const avgSessionLength = totalDuration / sessions.length;

    // Group sessions by date for daily breakdown
    const dailyBreakdown = this.calculateDailyBreakdown(sessions);

    // Calculate productivity patterns
    const hourlyBreakdown = this.calculateHourlyBreakdown(sessions);

    return {
      summary: {
        totalSessions: sessions.length,
        totalDuration: totalDuration,
        avgFocusScore: Math.round(avgFocusScore),
        avgSessionLength: Math.round(avgSessionLength),
        totalInterruptions,
        focusEfficiency: this.calculateFocusEfficiency(
          totalDuration,
          totalInterruptions,
        ),
      },
      trends: {
        daily: dailyBreakdown,
        hourly: hourlyBreakdown,
      },
      timeframe,
      dateRange,
    };
  }

  private getDateRange(timeframe: string) {
    const now = new Date();

    switch (timeframe) {
      case "day":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  }

  private getEmptyStats() {
    return {
      summary: {
        totalSessions: 0,
        totalDuration: 0,
        avgFocusScore: 0,
        avgSessionLength: 0,
        totalInterruptions: 0,
        focusEfficiency: 100,
      },
      trends: {
        daily: [],
        hourly: [],
      },
    };
  }

  private calculateDailyBreakdown(sessions: any[]) {
    const dailyData = {};

    sessions.forEach((session) => {
      const date = new Date(session.startTime).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          sessions: 0,
          duration: 0,
          focusScore: 0,
          interruptions: 0,
        };
      }

      dailyData[date].sessions += 1;
      dailyData[date].duration += session.duration || 0;
      dailyData[date].focusScore += session.focusScore || 0;
      dailyData[date].interruptions += session.interruptions || 0;
    });

    return Object.values(dailyData).map((day: any) => ({
      ...day,
      avgFocusScore: Math.round(day.focusScore / day.sessions),
    }));
  }

  private calculateHourlyBreakdown(sessions: any[]) {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: 0,
      duration: 0,
      avgFocusScore: 0,
    }));

    sessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      hourlyData[hour].sessions += 1;
      hourlyData[hour].duration += session.duration || 0;
      hourlyData[hour].avgFocusScore += session.focusScore || 0;
    });

    return hourlyData
      .map((hourData) => ({
        ...hourData,
        avgFocusScore:
          hourData.sessions > 0
            ? Math.round(hourData.avgFocusScore / hourData.sessions)
            : 0,
      }))
      .filter((hourData) => hourData.sessions > 0);
  }

  private calculateFocusEfficiency(
    totalDuration: number,
    totalInterruptions: number,
  ): number {
    if (totalInterruptions === 0) return 100;

    // Assume each interruption costs 5 minutes of focus time
    const interruptionCost = totalInterruptions * 300; // 300 seconds = 5 minutes
    const efficiency =
      (totalDuration / (totalDuration + interruptionCost)) * 100;

    return Math.round(Math.max(0, efficiency));
  }

  async addAgentInteraction(sessionId: string, interaction: any) {
    const session = await this.findById(sessionId);
    if (!session) return null;

    const interactions = session.agentInteractions || [];
    interactions.push({
      ...interaction,
      timestamp: new Date(),
      id: uuidv4(),
    });

    return await this.firebaseService.update(this.collection, sessionId, {
      agentInteractions: interactions,
      updatedAt: new Date(),
    });
  }
}
