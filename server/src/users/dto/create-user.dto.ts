import {
  IsString,
  IsEmail,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "clerk_user_123", required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    example: {
      name: "John Doe",
      email: "john@example.com",
      timezone: "America/New_York",
      workingHours: { start: "09:00", end: "17:00" },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  personalInfo?: any;

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "john@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: {
      tasksCompleted: 0,
      totalFocusTime: 0,
      averageFocusScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      streakRecord: 0,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  productivity?: any;

  @ApiProperty({
    example: { energyPeaks: ["morning"], motivationStyle: "encouraging" },
    required: false,
  })
  @IsOptional()
  @IsObject()
  workStyle?: any;

  @ApiProperty({
    example: {
      plannerEnabled: true,
      motivatorEnabled: true,
      blockerEnabled: true,
      observerEnabled: true,
      plannerSettings: {
        autoSchedule: true,
        adaptivePlanning: true,
        timeBuffers: true,
      },
      motivatorSettings: {
        frequency: "medium",
        sessionReminders: true,
        achievementCelebration: true,
      },
      blockerSettings: {
        strictMode: false,
        allowBreakOverride: true,
        socialMediaBlocking: true,
      },
      observerSettings: {
        dailyInsights: true,
        weeklyReports: true,
        performanceTracking: true,
      },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  agentSettings?: any;

  @ApiProperty({ example: [{ title: "Complete project", category: "work" }] })
  @IsArray()
  goals: any[];

  @ApiProperty({
    example: {
      theme: "light",
      notifications: true,
      motivationalReminders: true,
      dailyInsights: true,
      breakReminders: true,
      agentPersonalities: {
        motivator: "encouraging",
        planner: "detailed",
        observer: "supportive",
      },
      blockedSites: [],
    },
  })
  @IsObject()
  preferences: any;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  onboardingComplete?: boolean;
}
