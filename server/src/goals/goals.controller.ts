import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { GoalsService } from "./goals.service";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { UpdateGoalDto } from "./dto/update-goal.dto";

@ApiTags("goals")
@Controller("api/goals")
@UseGuards(ThrottlerGuard)
export class GoalsController {
  private readonly logger = new Logger(GoalsController.name);

  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new goal" })
  @ApiResponse({ status: 201, description: "Goal created successfully" })
  async createGoal(@Body() createGoalDto: CreateGoalDto) {
    try {
      this.logger.log(`Creating goal: ${createGoalDto.title}`);
      const goal = await this.goalsService.create(createGoalDto);
      return { success: true, data: goal };
    } catch (error) {
      this.logger.error("Failed to create goal:", error);
      throw error;
    }
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get all goals for a user" })
  async getUserGoals(@Param("userId") userId: string) {
    try {
      this.logger.log(`Fetching goals for user: ${userId}`);
      const goals = await this.goalsService.findByUser(userId);
      return { success: true, data: goals };
    } catch (error) {
      this.logger.error("Failed to fetch goals:", error);
      throw error;
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a goal" })
  async updateGoal(
    @Param("id") id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    try {
      this.logger.log(`Updating goal: ${id}`);
      const goal = await this.goalsService.update(id, updateGoalDto);
      return { success: true, data: goal };
    } catch (error) {
      this.logger.error("Failed to update goal:", error);
      throw error;
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a goal" })
  async deleteGoal(@Param("id") id: string) {
    try {
      this.logger.log(`Deleting goal: ${id}`);
      await this.goalsService.delete(id);
      return { success: true, message: "Goal deleted successfully" };
    } catch (error) {
      this.logger.error("Failed to delete goal:", error);
      throw error;
    }
  }
}
