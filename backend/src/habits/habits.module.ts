import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { Habit, HabitSchema } from './schemas/habit.schema';
import { ProgressLog, ProgressLogSchema } from '../progress/schemas/progress-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: ProgressLog.name, schema: ProgressLogSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService, MongooseModule],
})
export class HabitsModule {}
