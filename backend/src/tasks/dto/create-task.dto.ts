import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateTaskDto {
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

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', null])
  recurringPattern?: string | null;
}

