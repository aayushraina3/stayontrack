import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MotivationRequestDto {
  @ApiProperty({ example: "Complete project proposal" })
  @IsString()
  task: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  energy: number;

  @ApiProperty({ example: 0.7 })
  @IsNumber()
  progress: number;

  @ApiProperty({ example: "encouraging", required: false })
  @IsOptional()
  @IsString()
  tone?: "encouraging" | "direct" | "supportive" | "energetic";

  @ApiProperty({ example: "user123" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "day", required: false })
  @IsOptional()
  @IsString()
  timeframe?: "day" | "week" | "month";
}

export class PlanRequestDto {
  @ApiProperty({
    type: [Object],
    example: [
      { title: "Complete project", deadline: "2024-01-15", priority: "high" },
    ],
  })
  @IsArray()
  goals: any[];

  @ApiProperty({ example: 7200, description: "Available time in seconds" })
  @IsNumber()
  availableTime: number;

  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  energy: number;

  @ApiProperty({ example: "work", required: false })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiProperty({ example: "user123" })
  @IsString()
  userId: string;
}

export class BlockerRequestDto {
  @ApiProperty({ example: "user123" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "coding" })
  @IsString()
  taskType: string;

  @ApiProperty({ example: 3600 })
  @IsNumber()
  sessionDuration: number;

  @ApiProperty({ example: "medium" })
  @IsString()
  distractionLevel: "low" | "medium" | "high";
}

export class InsightRequestDto {
  @ApiProperty({
    description: "User ID requesting insights",
    example: "user_123",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Time frame for insights analysis",
    enum: ["day", "week", "month"],
    example: "week",
  })
  @IsEnum(["day", "week", "month"])
  timeframe: "day" | "week" | "month";

  @ApiProperty({
    description: "Specific metrics to analyze",
    type: [String],
    example: ["productivity", "focus", "goal-progress"],
    required: false,
  })
  @IsOptional()
  metrics?: string[];

  @ApiProperty({
    description: "Include recommendations in insights",
    example: true,
    required: false,
  })
  @IsOptional()
  includeRecommendations?: boolean;
}

export class FeedbackDto {
  @ApiProperty({ example: "user123" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "session123" })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: true })
  completed: boolean;

  @ApiProperty({ example: 8, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  focusScore: number;

  @ApiProperty({ example: ["social media", "phone notifications"] })
  @IsArray()
  distractions: string[];

  @ApiProperty({ example: 7, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  motivationEffectiveness: number;

  @ApiProperty({ example: ["Take more breaks", "Use blocking apps"] })
  @IsArray()
  recommendations: string[];

  @ApiProperty({ example: "moderate" })
  @IsString()
  taskComplexity: "simple" | "moderate" | "complex";

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  energyAfter: number;
}

// Remove the old ObserverRequestDto or keep it as an alias if needed
// export { InsightRequestDto as ObserverRequestDto }
