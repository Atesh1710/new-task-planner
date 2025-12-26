import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProgressLog, ProgressLogDocument } from './schemas/progress-log.schema';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { Habit, HabitDocument } from '../habits/schemas/habit.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ProgressLog.name) private progressLogModel: Model<ProgressLogDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
  ) {}

  async getDailyProgress(userId: string, date: string): Promise<any> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get tasks for the day
    const tasks = await this.taskModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: targetDate, $lte: endOfDay },
      })
      .exec();

    const completedTasks = tasks.filter((t) => t.completed).length;
    const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // Get habits for the day
    const activeHabits = await this.habitModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    }).exec();

    const habitLogs = await this.progressLogModel
      .find({
        userId: new Types.ObjectId(userId),
        date: targetDate,
      })
      .exec();

    const completedHabits = habitLogs.filter((l) => l.completed).length;
    const habitProgress = activeHabits.length > 0 
      ? (completedHabits / activeHabits.length) * 100 
      : 0;

    // Overall progress
    const totalItems = tasks.length + activeHabits.length;
    const completedItems = completedTasks + completedHabits;
    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      date: targetDate,
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        progress: Math.round(taskProgress),
        items: tasks,
      },
      habits: {
        total: activeHabits.length,
        completed: completedHabits,
        progress: Math.round(habitProgress),
        items: await this.getHabitsWithStatus(userId, activeHabits, targetDate),
      },
      overall: {
        total: totalItems,
        completed: completedItems,
        progress: Math.round(overallProgress),
      },
    };
  }

  private async getHabitsWithStatus(userId: string, habits: HabitDocument[], date: Date): Promise<any[]> {
    const logs = await this.progressLogModel
      .find({
        userId: new Types.ObjectId(userId),
        date: date,
        habitId: { $in: habits.map((h) => h._id) },
      })
      .exec();

    return habits.map((habit) => {
      const log = logs.find((l) => l.habitId.toString() === habit._id.toString());
      return {
        ...habit.toObject(),
        completed: log?.completed || false,
        logId: log?._id || null,
      };
    });
  }

  async getWeeklyProgress(userId: string, startDate: string): Promise<any> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return this.getProgressForRange(userId, start, end, 'weekly');
  }

  async getMonthlyProgress(userId: string, year: number, month: number): Promise<any> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    end.setHours(23, 59, 59, 999);

    return this.getProgressForRange(userId, start, end, 'monthly');
  }

  async getYearlyProgress(userId: string, year: number): Promise<any> {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    end.setHours(23, 59, 59, 999);

    return this.getProgressForRange(userId, start, end, 'yearly');
  }

  private async getProgressForRange(userId: string, start: Date, end: Date, period: string): Promise<any> {
    // Get tasks for the range
    const tasks = await this.taskModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .exec();

    const completedTasks = tasks.filter((t) => t.completed).length;

    // Get habit logs for the range
    const habitLogs = await this.progressLogModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .exec();

    const completedHabits = habitLogs.filter((l) => l.completed).length;

    // Get active habits
    const activeHabits = await this.habitModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    }).exec();
    
    const days = this.getDaysBetween(start, end);
    const totalPossibleHabits = activeHabits.length * days;

    // Generate daily breakdown
    const dailyData = await this.generateDailyBreakdown(userId, start, end);

    // Category breakdown
    const categoryBreakdown = await this.getCategoryBreakdown(userId, start, end);

    return {
      period,
      startDate: start,
      endDate: end,
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        completionRate: tasks.length > 0 
          ? Math.round((completedTasks / tasks.length) * 100) 
          : 0,
      },
      habits: {
        totalPossible: totalPossibleHabits,
        completed: completedHabits,
        completionRate: totalPossibleHabits > 0 
          ? Math.round((completedHabits / totalPossibleHabits) * 100) 
          : 0,
      },
      dailyData,
      categoryBreakdown,
    };
  }

  private async generateDailyBreakdown(userId: string, start: Date, end: Date): Promise<any[]> {
    const dailyData = [];
    const current = new Date(start);

    while (current <= end) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const tasks = await this.taskModel
        .find({
          userId: new Types.ObjectId(userId),
          date: { $gte: dayStart, $lte: dayEnd },
        })
        .exec();

      const completedTasks = tasks.filter((t) => t.completed).length;

      const habitLogs = await this.progressLogModel
        .find({
          userId: new Types.ObjectId(userId),
          date: dayStart,
          completed: true,
        })
        .exec();

      dailyData.push({
        date: new Date(current),
        tasksTotal: tasks.length,
        tasksCompleted: completedTasks,
        habitsCompleted: habitLogs.length,
      });

      current.setDate(current.getDate() + 1);
    }

    return dailyData;
  }

  private async getCategoryBreakdown(userId: string, start: Date, end: Date): Promise<any> {
    const tasks = await this.taskModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .exec();

    const habits = await this.habitModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    }).exec();

    const categoryData: { [key: string]: { total: number; completed: number } } = {};

    // Aggregate task data by category
    tasks.forEach((task) => {
      if (!categoryData[task.category]) {
        categoryData[task.category] = { total: 0, completed: 0 };
      }
      categoryData[task.category].total++;
      if (task.completed) {
        categoryData[task.category].completed++;
      }
    });

    // Aggregate habit data by category
    for (const habit of habits) {
      const logs = await this.progressLogModel
        .find({
          userId: new Types.ObjectId(userId),
          habitId: habit._id,
          date: { $gte: start, $lte: end },
          completed: true,
        })
        .exec();

      if (!categoryData[habit.category]) {
        categoryData[habit.category] = { total: 0, completed: 0 };
      }
      categoryData[habit.category].total += this.getDaysBetween(start, end);
      categoryData[habit.category].completed += logs.length;
    }

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      total: data.total,
      completed: data.completed,
      completionRate: data.total > 0 
        ? Math.round((data.completed / data.total) * 100) 
        : 0,
    }));
  }

  private getDaysBetween(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;
  }

  async getHabitLogs(userId: string, habitId: string, startDate: string, endDate: string): Promise<ProgressLog[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.progressLogModel
      .find({
        userId: new Types.ObjectId(userId),
        habitId: new Types.ObjectId(habitId),
        date: { $gte: start, $lte: end },
      })
      .sort({ date: 1 })
      .exec();
  }
}
