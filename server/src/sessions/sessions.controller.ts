import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { SessionsService } from "./sessions.service";
import {
  StartSessionDto,
  EndSessionDto,
  SessionFeedbackDto,
} from "./dto/session.dto";

@ApiTags("sessions")
@Controller("api/sessions")
@UseGuards(ThrottlerGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post("start")
  @ApiOperation({ summary: "Start a new work session" })
  @ApiResponse({ status: 201, description: "Session started successfully" })
  async startSession(@Body() startSessionDto: StartSessionDto) {
    try {
      return await this.sessionsService.start(startSessionDto);
    } catch (error) {
      throw new HttpException(
        "Failed to start session",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/end")
  @ApiOperation({ summary: "End a work session" })
  async endSession(
    @Param("id") sessionId: string,
    @Body() endSessionDto: EndSessionDto,
  ) {
    try {
      return await this.sessionsService.end(sessionId, endSessionDto);
    } catch (error) {
      throw new HttpException(
        "Failed to end session",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/feedback")
  @ApiOperation({ summary: "Submit session feedback" })
  async submitFeedback(
    @Param("id") sessionId: string,
    @Body() feedbackDto: SessionFeedbackDto,
  ) {
    try {
      console.log(
        `SessionsController: Submitting feedback for session ${sessionId}`,
      );
      console.log(`SessionsController: Feedback payload:`, feedbackDto);
      return await this.sessionsService.addFeedback(sessionId, feedbackDto);
    } catch (error) {
      console.error(
        `SessionsController: Error submitting feedback for session ${sessionId}:`,
        error,
      );
      throw new HttpException(
        `Failed to submit feedback: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/agent-interaction")
  @ApiOperation({ summary: "Add agent interaction to session" })
  async addAgentInteraction(
    @Param("id") sessionId: string,
    @Body() interaction: any,
  ) {
    try {
      console.log(
        `SessionsController: Adding agent interaction to session ${sessionId}`,
      );
      return await this.sessionsService.addAgentInteraction(
        sessionId,
        interaction,
      );
    } catch (error) {
      console.error(
        `SessionsController: Error adding agent interaction to session ${sessionId}:`,
        error,
      );
      throw new HttpException(
        `Failed to add agent interaction: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get user sessions" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getSessions(
    @Param("userId") userId: string,
    @Query("limit") limit: number = 50,
  ) {
    try {
      console.log(
        `SessionsController: Getting sessions for userId: ${userId}, limit: ${limit}`,
      );
      const result = await this.sessionsService.findByUser(userId, limit);
      console.log(
        `SessionsController: Successfully retrieved ${result.length} sessions`,
      );
      return result;
    } catch (error) {
      console.error(
        `SessionsController: Error getting sessions for userId ${userId}:`,
        error,
      );
      throw new HttpException(
        `Failed to fetch sessions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get session details" })
  async getSession(@Param("id") sessionId: string) {
    try {
      const session = await this.sessionsService.findById(sessionId);
      if (!session) {
        throw new HttpException("Session not found", HttpStatus.NOT_FOUND);
      }
      return session;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Failed to fetch session",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("stats/:userId")
  @ApiOperation({ summary: "Get session statistics" })
  @ApiQuery({ name: "timeframe", required: false })
  async getSessionStats(
    @Param("userId") userId: string,
    @Query("timeframe") timeframe: "day" | "week" | "month" = "week",
  ) {
    try {
      return await this.sessionsService.getStats(userId, timeframe);
    } catch (error) {
      throw new HttpException(
        "Failed to fetch session stats",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
