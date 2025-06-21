import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
} from "class-validator";
import { TaskPriority, TaskStatus } from "../../types/index";

export class CreateTaskDto {
  @ApiProperty({ example: "task_123", required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: "Complete project proposal" })
  @IsString()
  title: string;

  @ApiProperty({
    example: "Write a comprehensive proposal for the new project",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 3600 })
  @IsNumber()
  @Min(300) // Minimum 5 minutes
  estimatedTime: number;

  @ApiProperty({ example: 1800, required: false })
  @IsOptional()
  @IsNumber()
  actualTime?: number;

  @ApiProperty({ example: "2024-12-31T23:59:59.000Z", required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ example: 75, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  progress?: number;

  @ApiProperty({ example: ["work", "urgent"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: "work", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: "2024-12-25T09:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiProperty({ example: "goal_123" })
  @IsString()
  goalId: string;

  @ApiProperty({ example: "user-123" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "2024-12-20T10:30:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @ApiProperty({ example: "2024-12-21T15:45:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
