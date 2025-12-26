import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { ProgressLog, ProgressLogSchema } from './schemas/progress-log.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProgressLog.name, schema: ProgressLogSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Habit.name, schema: HabitSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
