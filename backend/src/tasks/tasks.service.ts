import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel({
      ...createTaskDto,
      userId: new Types.ObjectId(userId),
      date: new Date(createTaskDto.date),
    });
    return task.save();
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.taskModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ date: 1, priority: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.taskModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updateData: any = { ...updateTaskDto };
    if (updateTaskDto.date) {
      updateData.date = new Date(updateTaskDto.date);
    }
    if (updateTaskDto.completed) {
      updateData.completedAt = new Date();
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateData,
        { new: true }
      )
      .exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.taskModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!result) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async findByDate(userId: string, date: string): Promise<Task[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.taskModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .sort({ priority: -1 })
      .exec();
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.taskModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .sort({ date: 1, priority: -1 })
      .exec();
  }

  async findByCategory(userId: string, category: string): Promise<Task[]> {
    return this.taskModel.find({
      userId: new Types.ObjectId(userId),
      category,
    }).sort({ date: 1 }).exec();
  }

  async toggleComplete(userId: string, id: string): Promise<Task> {
    const task = await this.taskModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    return task.save();
  }

  async getStats(userId: string, startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tasks = await this.taskModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .exec();

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const byCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { total: 0, completed: 0 };
      }
      acc[task.category].total++;
      if (task.completed) acc[task.category].completed++;
      return acc;
    }, {});

    return {
      total,
      completed,
      pending: total - completed,
      completionRate: Math.round(completionRate * 100) / 100,
      byCategory,
    };
  }
}
