import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export interface Session {
  id: string;
  startTime: Date | string;
  userId: string;
  taskId: string;
  status: string;
  focusScore?: number;
  interruptions?: number;
  agentInteractions?: any[];
  notes?: string;
  endTime?: Date | string;
  duration?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class StartSessionDto {
  @ApiProperty({ example: "task-123" })
  @IsString()
  taskId: string;

  @ApiProperty({ example: "user-123" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "Complete project proposal" })
  @IsString()
  taskTitle: string;
}

export class EndSessionDto {
  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  focusScore: number;

  @ApiProperty({
    example: "Good focus session, completed main objectives",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interruptions?: number;
}

export class SessionFeedbackDto {
  @ApiProperty({ example: "great" })
  @IsString()
  feeling: "great" | "okay" | "struggled";

  @ApiProperty({ example: ["Time pressure", "Clear focus"] })
  @IsArray()
  @IsString({ each: true })
  helpfulFactors: string[];

  @ApiProperty({
    example: "Found the pomodoro technique very effective",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
