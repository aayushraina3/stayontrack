import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase-service/firebase.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskStatus } from "../types/index";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TasksService {
  private readonly collection = "tasks";

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createTaskDto: CreateTaskDto) {
    // Filter out undefined values to avoid Firestore errors
    const cleanedDto = Object.fromEntries(
      Object.entries(createTaskDto).filter(([_, value]) => value !== undefined),
    );

    // Use provided ID (for frontend compatibility) or generate a new UUID
    const taskId = createTaskDto.id || uuidv4();

    const task = {
      id: taskId,
      ...cleanedDto,
      status: createTaskDto.status || TaskStatus.TODO,
      completed:
        createTaskDto.completed !== undefined ? createTaskDto.completed : false,
      progress:
        createTaskDto.progress !== undefined ? createTaskDto.progress : 0,
      createdAt: createTaskDto.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.firebaseService.create(this.collection, task, taskId);
  }

  async findById(id: string) {
    return await this.firebaseService.findById(this.collection, id);
  }

  async findByUser(
    userId: string,
    filters: { status?: TaskStatus; priority?: string } = {},
  ) {
    const queryFilters: any = { userId };

    if (filters.status) {
      queryFilters.status = filters.status;
    }

    if (filters.priority) {
      queryFilters.priority = filters.priority;
    }

    const tasks = await this.firebaseService.findMany(
      this.collection,
      queryFilters,
    );

    // Sort tasks by priority and creation date
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findByGoal(goalId: string) {
    const tasks = await this.firebaseService.findMany(this.collection, {
      goalId: goalId,
    });

    // Sort tasks by priority and creation date
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Filter out undefined values to avoid Firestore errors
    const cleanedDto = Object.fromEntries(
      Object.entries(updateTaskDto).filter(([_, value]) => value !== undefined),
    );

    const updateData = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    return await this.firebaseService.update(this.collection, id, updateData);
  }

  async delete(id: string) {
    return await this.firebaseService.delete(this.collection, id);
  }

  async complete(id: string) {
    const updateData = {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.firebaseService.update(this.collection, id, updateData);
  }

  async getTaskStats(
    userId: string,
    timeframe: "day" | "week" | "month" = "week",
  ) {
    const tasks = await this.findByUser(userId);

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const filteredTasks = tasks.filter(
      (task) => new Date(task.createdAt) >= startDate,
    );

    const completed = filteredTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED,
    );
    const inProgress = filteredTasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS,
    );
    const todo = filteredTasks.filter(
      (task) => task.status === TaskStatus.TODO,
    );

    return {
      total: filteredTasks.length,
      completed: completed.length,
      inProgress: inProgress.length,
      todo: todo.length,
      completionRate:
        filteredTasks.length > 0
          ? (completed.length / filteredTasks.length) * 100
          : 0,
      avgEstimatedTime:
        filteredTasks.length > 0
          ? filteredTasks.reduce((sum, task) => sum + task.estimatedTime, 0) /
            filteredTasks.length
          : 0,
    };
  }
}
