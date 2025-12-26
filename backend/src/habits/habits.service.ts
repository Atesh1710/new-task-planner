import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { ProgressLog, ProgressLogDocument } from '../progress/schemas/progress-log.schema';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
    @InjectModel(ProgressLog.name) private progressLogModel: Model<ProgressLogDocument>,
  ) {}

  async create(userId: string, createHabitDto: CreateHabitDto): Promise<Habit> {
    const habit = new this.habitModel({
      ...createHabitDto,
      userId: new Types.ObjectId(userId),
      startDate: new Date(createHabitDto.startDate),
    });
    return habit.save();
  }

  async findAll(userId: string): Promise<Habit[]> {
    return this.habitModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ priority: -1, category: 1, name: 1 })
      .exec();
  }

  async findActive(userId: string): Promise<Habit[]> {
    return this.habitModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    }).sort({ priority: -1, category: 1, name: 1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<Habit> {
    const habit = await this.habitModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    return habit;
  }

  async update(userId: string, id: string, updateHabitDto: UpdateHabitDto): Promise<Habit> {
    const updateData: any = { ...updateHabitDto };
    if (updateHabitDto.startDate) {
      updateData.startDate = new Date(updateHabitDto.startDate);
    }

    const habit = await this.habitModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateData,
        { new: true }
      )
      .exec();
    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    return habit;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.habitModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!result) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    // Also remove all progress logs for this habit
    await this.progressLogModel.deleteMany({
      habitId: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).exec();
  }

  async findByCategory(userId: string, category: string): Promise<Habit[]> {
    return this.habitModel.find({
      userId: new Types.ObjectId(userId),
      category,
      isActive: true,
    }).exec();
  }

  async toggleComplete(userId: string, id: string, date: string): Promise<{ habit: Habit; log: ProgressLog }> {
    const habit = await this.habitModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Check if there's an existing log for this date
    let log = await this.progressLogModel.findOne({
      habitId: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      date: targetDate,
    }).exec();

    if (log) {
      // Toggle completion
      log.completed = !log.completed;
      log.completedAt = log.completed ? new Date() : null;
      await log.save();
    } else {
      // Create new log
      log = new this.progressLogModel({
        habitId: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        date: targetDate,
        completed: true,
        completedAt: new Date(),
      });
      await log.save();
    }

    // Update streak
    await this.updateStreak(userId, id);

    // Refresh habit data
    const updatedHabit = await this.habitModel.findById(id).exec();
    return { habit: updatedHabit, log };
  }

  async updateStreak(userId: string, habitId: string): Promise<void> {
    const habit = await this.habitModel.findOne({
      _id: habitId,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!habit) return;

    // Get all completed logs sorted by date descending
    const logs = await this.progressLogModel
      .find({
        habitId: new Types.ObjectId(habitId),
        userId: new Types.ObjectId(userId),
        completed: true,
      })
      .sort({ date: -1 })
      .exec();

    if (logs.length === 0) {
      habit.currentStreak = 0;
      habit.longestStreak = 0;
      habit.totalCompletions = 0;
      await habit.save();
      return;
    }

    habit.totalCompletions = logs.length;
    habit.lastCompletedDate = logs[0].date;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      // Allow for yesterday if today isn't completed yet
      if (i === 0 && logDate.getTime() !== today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (logDate.getTime() !== yesterday.getTime()) {
          break;
        }
      } else if (i > 0) {
        const prevLogDate = new Date(logs[i - 1].date);
        prevLogDate.setHours(0, 0, 0, 0);
        const daysDiff = (prevLogDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1) {
          break;
        }
      }
      currentStreak++;
    }

    habit.currentStreak = currentStreak;

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < logs.length; i++) {
      const prevDate = new Date(logs[i - 1].date);
      const currDate = new Date(logs[i].date);
      const daysDiff = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

      if (Math.abs(daysDiff - 1) < 0.1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    habit.longestStreak = Math.max(habit.longestStreak, longestStreak, currentStreak);

    await habit.save();
  }

  async getHabitProgress(userId: string, id: string, startDate: string, endDate: string): Promise<ProgressLog[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.progressLogModel
      .find({
        habitId: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .sort({ date: 1 })
      .exec();
  }

  async getStats(userId: string, startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const habits = await this.habitModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    }).exec();

    const logs = await this.progressLogModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .exec();

    const totalPossible = habits.length * this.getDaysBetween(start, end);
    const completed = logs.filter((l) => l.completed).length;
    const completionRate = totalPossible > 0 ? (completed / totalPossible) * 100 : 0;

    const byHabit = await Promise.all(
      habits.map(async (habit) => {
        const habitLogs = logs.filter(
          (l) => l.habitId.toString() === habit._id.toString(),
        );
        const habitCompleted = habitLogs.filter((l) => l.completed).length;
        const days = this.getDaysBetween(start, end);

        return {
          id: habit._id,
          name: habit.name,
          category: habit.category,
          color: habit.color,
          priority: habit.priority,
          total: days,
          completed: habitCompleted,
          completionRate: days > 0 ? Math.round((habitCompleted / days) * 100) : 0,
          currentStreak: habit.currentStreak,
          longestStreak: habit.longestStreak,
        };
      }),
    );

    return {
      totalHabits: habits.length,
      totalPossible,
      completed,
      completionRate: Math.round(completionRate * 100) / 100,
      byHabit,
    };
  }

  private getDaysBetween(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;
  }
}
