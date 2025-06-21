import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskPriority, TaskStatus } from "../types/index";

@ApiTags("tasks")
@Controller("api/tasks")
@UseGuards(ThrottlerGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiResponse({ status: 201, description: "Task created successfully" })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    try {
      return await this.tasksService.create(createTaskDto);
    } catch (error) {
      throw new HttpException(
        "Failed to create task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Get tasks for a user" })
  @ApiQuery({ name: "userId", required: true })
  @ApiQuery({ name: "status", required: false, enum: TaskStatus })
  @ApiQuery({ name: "priority", required: false, enum: TaskPriority })
  async getTasks(
    @Query("userId") userId: string,
    @Query("status") status?: TaskStatus,
    @Query("priority") priority?: TaskPriority,
  ) {
    try {
      return await this.tasksService.findByUser(userId, { status, priority });
    } catch (error) {
      throw new HttpException(
        "Failed to fetch tasks",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("goal/:goalId")
  @ApiOperation({ summary: "Get all tasks for a specific goal" })
  async getTasksByGoal(@Param("goalId") goalId: string) {
    try {
      return await this.tasksService.findByGoal(goalId);
    } catch (error) {
      throw new HttpException(
        "Failed to fetch tasks for goal",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific task" })
  async getTask(@Param("id") id: string) {
    try {
      const task = await this.tasksService.findById(id);
      if (!task) {
        throw new HttpException("Task not found", HttpStatus.NOT_FOUND);
      }
      return task;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Failed to fetch task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a task" })
  async updateTask(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      return await this.tasksService.update(id, updateTaskDto);
    } catch (error) {
      throw new HttpException(
        "Failed to update task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a task" })
  async deleteTask(@Param("id") id: string) {
    try {
      return await this.tasksService.delete(id);
    } catch (error) {
      throw new HttpException(
        "Failed to delete task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id/complete")
  @ApiOperation({ summary: "Mark task as completed" })
  async completeTask(@Param("id") id: string) {
    try {
      return await this.tasksService.complete(id);
    } catch (error) {
      throw new HttpException(
        "Failed to complete task",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
