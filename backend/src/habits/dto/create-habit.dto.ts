import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsIn, IsArray } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  frequency?: string;

  @IsOptional()
  @IsArray()
  daysOfWeek?: number[];

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsNumber()
  targetCompletions?: number;

  @IsOptional()
  @IsString()
  reminderTime?: string;

  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;
}

