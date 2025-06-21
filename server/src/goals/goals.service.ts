import { Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "../firebase-service/firebase.service";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { Goal, Task } from "src/types";
import { UpdateGoalDto } from "./dto/update-goal.dto";

@Injectable()
export class GoalsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createGoalDto: CreateGoalDto) {
    // Filter out undefined values to avoid Firestore errors
    const cleanedDto = Object.fromEntries(
      Object.entries(createGoalDto).filter(([_, value]) => value !== undefined),
    );

    // Handle deadline/targetDate field mapping
    if (cleanedDto.deadline && !cleanedDto.targetDate) {
      cleanedDto.targetDate = cleanedDto.deadline;
    }

    // Use provided ID (for frontend compatibility) or generate a new one
    const goalId = cleanedDto.id || `goal_${Date.now()}`;

    const goalData = {
      id: goalId,
      ...cleanedDto,
      createdAt: cleanedDto.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed:
        cleanedDto.completed !== undefined ? cleanedDto.completed : false,
      progress: cleanedDto.progress !== undefined ? cleanedDto.progress : 0,
      tasks: Array.isArray(cleanedDto.tasks) ? cleanedDto.tasks : [],
    };

    const result = await this.firebaseService.create("goals", goalData, goalId);
    return result;
  }

  async findByUser(userId: string) {
    const goals = await this.firebaseService.findMany("goals", {
      userId: userId,
    });
    return goals;
  }

  async findOne(id: string): Promise<Goal> {
    const goal = await this.firebaseService.findById("goals", id);
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    return goal as Goal;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto) {
    const existingGoal = await this.findOne(id);

    // Filter out undefined values to avoid Firestore errors
    const cleanedDto = Object.fromEntries(
      Object.entries(updateGoalDto).filter(([_, value]) => value !== undefined),
    );

    const updatedData = {
      ...cleanedDto,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService.update("goals", id, updatedData);
    return { ...existingGoal, ...updatedData };
  }

  async delete(id: string) {
    await this.findOne(id); // Check if exists
    await this.firebaseService.delete("goals", id);
    return { deleted: true };
  }

  async addTask(goalId: string, task: Task) {
    const goal = await this.findOne(goalId);
    const updatedTasks = [...(goal.tasks || []), task];

    await this.firebaseService.update("goals", goalId, {
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });

    return { ...goal, tasks: updatedTasks };
  }

  async updateTask(goalId: string, taskId: string, taskUpdates: Partial<Task>) {
    const goal = await this.findOne(goalId);
    const updatedTasks = goal.tasks.map((task) =>
      task.id === taskId ? { ...task, ...taskUpdates } : task,
    );

    // Calculate goal progress based on completed tasks
    const completedTasks = updatedTasks.filter((task) => task.completed);
    const progress =
      updatedTasks.length > 0
        ? Math.round((completedTasks.length / updatedTasks.length) * 100)
        : 0;

    await this.firebaseService.update("goals", goalId, {
      tasks: updatedTasks,
      progress,
      completed: progress === 100,
      updatedAt: new Date().toISOString(),
    });

    return { ...goal, tasks: updatedTasks, progress };
  }

  async deleteTask(goalId: string, taskId: string) {
    const goal = await this.findOne(goalId);
    const updatedTasks = goal.tasks.filter((task) => task.id !== taskId);

    // Recalculate progress
    const completedTasks = updatedTasks.filter((task) => task.completed);
    const progress =
      updatedTasks.length > 0
        ? Math.round((completedTasks.length / updatedTasks.length) * 100)
        : 0;

    await this.firebaseService.update("goals", goalId, {
      tasks: updatedTasks,
      progress,
      completed: progress === 100,
      updatedAt: new Date().toISOString(),
    });

    return { ...goal, tasks: updatedTasks, progress };
  }
}
