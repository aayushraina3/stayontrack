import { IsArray, IsString, IsOptional, IsDateString } from "class-validator";

export class CreateCheckinDto {
  @IsArray()
  energy: number[];

  @IsArray()
  mood: number[];

  @IsArray()
  focus: number[];

  @IsString()
  @IsOptional() // Allow empty priorities for skip functionality
  priorities: string;

  @IsString()
  @IsOptional() // Allow empty challenges
  challenges: string;

  @IsString()
  @IsOptional() // Allow empty motivation
  motivation: string;

  @IsDateString()
  date: string;
}
