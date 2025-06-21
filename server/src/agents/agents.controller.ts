import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MotivatorService } from "./services/motivator.service";
import { PlannerService } from "./services/planner.service";
import { BlockerService } from "./services/blocker.service";
import { ObserverService } from "./services/observer.service";
import {
  MotivationRequestDto,
  PlanRequestDto,
  BlockerRequestDto,
  InsightRequestDto,
} from "./dto/agents.dto";

@ApiTags("agents")
@Controller("api/agents") // ← Changed from "agents" to "api/agents"
@UseGuards(ThrottlerGuard)
export class AgentsController {
  private readonly logger = new Logger(AgentsController.name);

  constructor(
    private readonly motivatorService: MotivatorService,
    private readonly plannerService: PlannerService,
    private readonly blockerService: BlockerService,
    private readonly observerService: ObserverService,
  ) {}

  @Post("motivator")
  @ApiOperation({
    summary: "Get motivational message",
    description:
      "Generate personalized motivation based on user context and goals",
  })
  @ApiResponse({
    status: 200,
    description: "Motivational message generated successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        tone: { type: "string" },
        encouragementLevel: { type: "number" },
        positivityScore: { type: "number" },
        timestamp: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request parameters",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async getMotivation(@Body() request: MotivationRequestDto) {
    try {
      this.logger.log(
        `Generating motivation for user: ${request.userId} task: ${request.task}`,
      );

      const result = await this.motivatorService.generateMotivation(request);

      this.logger.log("Motivation generated successfully");
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to generate motivation: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new HttpException(
        {
          message: "Failed to generate motivation",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("planner")
  @ApiOperation({
    summary: "Generate task plan",
    description:
      "Create an optimized task plan based on goals, available time, and energy level",
  })
  @ApiResponse({
    status: 200,
    description: "Task plan generated successfully",
    schema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              estimatedTime: { type: "number" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
            },
          },
        },
        schedule: { type: "array" },
        estimatedTotalTime: { type: "number" },
        recommendations: { type: "array", items: { type: "string" } },
        feasibilityScore: { type: "number" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      "Invalid request parameters - check goals, availableTime, and energy values",
  })
  async getPlan(@Body() request: PlanRequestDto) {
    try {
      // Enhanced validation
      if (
        !request.goals ||
        !Array.isArray(request.goals) ||
        request.goals.length === 0
      ) {
        throw new HttpException(
          "Goals array is required and must contain at least one goal",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!request.availableTime || request.availableTime <= 0) {
        throw new HttpException(
          "availableTime must be a positive number (in seconds)",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!request.energy || request.energy < 1 || request.energy > 5) {
        throw new HttpException(
          "energy must be a number between 1 and 5",
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Generating plan for ${request.goals.length} goals, ${request.availableTime}s available, energy: ${request.energy}`,
      );

      const result = await this.plannerService.generatePlan(request);

      this.logger.log(
        `Plan generated successfully with ${result.tasks.length} tasks`,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to generate plan: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Re-throw HttpExceptions (validation errors) as-is
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle other errors
      throw new HttpException(
        {
          message: "Failed to generate plan",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("blocker")
  @ApiOperation({
    summary: "Activate distraction blocker",
    description:
      "Configure and activate productivity blocker based on user preferences",
  })
  @ApiResponse({
    status: 200,
    description: "Blocker activated successfully",
  })
  async activateBlocker(@Body() request: BlockerRequestDto) {
    try {
      this.logger.log(
        `Activating blocker for duration: ${request.sessionDuration || "default"}`,
      );

      const result = await this.blockerService.generateBlockerConfig(request);

      this.logger.log("Blocker activated successfully");
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to activate blocker: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new HttpException(
        {
          message: "Failed to activate blocker",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("observer")
  @ApiOperation({
    summary: "Get productivity insights",
    description: "Analyze productivity data and generate actionable insights",
  })
  @ApiResponse({
    status: 200,
    description: "Insights generated successfully",
  })
  async getInsights(@Body() request: InsightRequestDto) {
    try {
      this.logger.log(
        `Generating insights for timeframe: ${request.timeframe || "default"}`,
      );

      const result = await this.observerService.generateInsights(
        request,
        false,
      );

      this.logger.log("Insights generated successfully");
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to generate insights: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new HttpException(
        {
          message: "Failed to generate insights",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":userId/patterns")
  @ApiOperation({ summary: "Get productivity patterns" })
  @ApiResponse({
    status: 200,
    description: "Productivity patterns retrieved successfully",
  })
  async getPatterns(@Param("userId") userId: string) {
    try {
      this.logger.log(`Getting patterns for user: ${userId}`);
      return await this.observerService.analyzePatterns(userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to analyze patterns for user ${userId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new HttpException(
        {
          message: "Failed to analyze patterns",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":userId/recommendations")
  @ApiOperation({ summary: "Get personalized recommendations" })
  @ApiResponse({
    status: 200,
    description: "Recommendations retrieved successfully",
  })
  async getRecommendations(@Param("userId") userId: string) {
    try {
      this.logger.log(`Getting recommendations for user: ${userId}`);
      return await this.observerService.getRecommendations(userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to get recommendations for user ${userId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new HttpException(
        {
          message: "Failed to get recommendations",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":userId/feedback")
  @ApiOperation({ summary: "Submit feedback on insights" })
  @ApiResponse({
    status: 200,
    description: "Feedback submitted successfully",
  })
  async submitFeedback(
    @Param("userId") userId: string,
    @Body() feedback: { insightId: string; helpful: boolean; comment?: string },
  ) {
    try {
      this.logger.log(`Submitting feedback for user: ${userId}`);

      // Create a basic feedback record
      const feedbackRecord = {
        userId,
        insightId: feedback.insightId,
        helpful: feedback.helpful,
        comment: feedback.comment,
        submittedAt: new Date(),
      };

      return await this.observerService.submitInsightFeedback(feedbackRecord);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to submit feedback for user ${userId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new HttpException(
        {
          message: "Failed to submit feedback",
          error:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Internal server error",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Health check endpoint for the agents service
  @Post("health")
  @ApiOperation({
    summary: "Health check for AI agents",
    description: "Check if all AI agent services are operational",
  })
  @ApiResponse({
    status: 200,
    description: "Health check completed",
    schema: {
      type: "object",
      properties: {
        status: { type: "string" },
        services: { type: "object" },
        timestamp: { type: "string" },
      },
    },
  })
  healthCheck() {
    try {
      // You can add service-specific health checks here
      const healthStatus = {
        status: "healthy",
        services: {
          motivator: "operational",
          planner: "operational",
          blocker: "operational",
          observer: "operational",
        },
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
      };

      return healthStatus;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Health check failed: ${errorMessage}`);

      throw new HttpException(
        {
          status: "unhealthy",
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
