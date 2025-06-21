import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase-service/firebase.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateCheckinDto } from "./dto/checkin.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UsersService {
  private readonly collection = "users";

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createUserDto: CreateUserDto) {
    // Filter out undefined values to avoid Firestore errors
    const cleanedDto = Object.fromEntries(
      Object.entries(createUserDto).filter(([_, value]) => value !== undefined),
    );

    // Use provided ID (for Clerk integration) or generate a new UUID
    const userId = createUserDto.id || uuidv4();

    const user = {
      id: userId,
      ...cleanedDto,
      onboardingComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.firebaseService.create(this.collection, user, userId);
  }

  async findById(userId: string) {
    return await this.firebaseService.findById(this.collection, userId);
  }

  async findByEmail(email: string) {
    const users = await this.firebaseService.findMany(this.collection, {
      email,
    });
    return users[0] || null;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    // Filter out undefined values to avoid Firestore errors
    const cleanedDto = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value !== undefined),
    );

    const updateData = {
      ...cleanedDto,
      updatedAt: new Date(),
    };

    return await this.firebaseService.update(
      this.collection,
      userId,
      updateData,
    );
  }

  async getDashboardData(userId: string) {
    // This would typically aggregate data from multiple services
    const user = await this.findById(userId);
    if (!user) return null;

    // In a real implementation, you'd fetch data from TasksService, SessionsService, etc.
    return {
      user,
      stats: {
        tasksCompleted: 0,
        focusTime: 0,
        streak: 0,
      },
      recentActivity: [],
      upcomingTasks: [],
    };
  }

  async storeCheckin(userId: string, checkinDto: CreateCheckinDto) {
    const checkinId = uuidv4();
    const checkinData = {
      id: checkinId,
      userId,
      ...checkinDto,
      createdAt: new Date(),
    };

    // Store in a separate checkins collection
    await this.firebaseService.create("checkins", checkinData, checkinId);

    return {
      success: true,
      message: "Daily checkin stored successfully",
      id: checkinId,
    };
  }
}
