import { GoalCategory, GoalPriority } from "../../types/index";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
} from "class-validator";

export class CreateGoalDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(GoalCategory)
  category: GoalCategory;

  @IsEnum(GoalPriority)
  priority: GoalPriority;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  targetDate?: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taskIds?: string[];

  @IsOptional()
  @IsString()
  createdAt?: string;
}

// export class UpdateGoalDto {
//   @IsOptional()
//   @IsString()
//   title?: string

//   @IsOptional()
//   @IsString()
//   description?: string

//   @IsOptional()
//   @IsEnum(GoalCategory)
//   category?: GoalCategory

//   @IsOptional()
//   @IsEnum(GoalPriority)
//   priority?: GoalPriority

//   @IsOptional()
//   @IsString()
//   targetDate?: string

//   @IsOptional()
//   @IsArray()
//   tags?: string[]

//   @IsOptional()
//   @IsNumber()
//   estimatedHours?: number

//   @IsOptional()
//   @IsNumber()
//   progress?: number

//   @IsOptional()
//   @IsBoolean()
//   completed?: boolean

//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   taskIds?: string[]
// }

// export class AddTaskToGoalDto {
//   @IsString()
//   title: string;

//   @IsOptional()
//   @IsString()
//   description?: string;

//   @IsEnum(GoalPriority)
//   priority: GoalPriority;

//   @IsOptional()
//   @IsNumber()
//   estimatedMinutes?: number;

//   @IsOptional()
//   @IsArray()
//   tags?: string[];
// }

// export class UpdateGoalTaskDto {
//   @IsOptional()
//   @IsString()
//   title?: string;

//   @IsOptional()
//   @IsString()
//   description?: string;

//   @IsOptional()
//   @IsEnum(GoalPriority)
//   priority?: GoalPriority;

//   @IsOptional()
//   @IsNumber()
//   estimatedMinutes?: number;

//   @IsOptional()
//   @IsBoolean()
//   completed?: boolean;

//   @IsOptional()
//   @IsArray()
//   tags?: string[];
// }
