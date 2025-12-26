import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: '#10b981' })
  color: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' })
  frequency: string;

  @Prop({ type: [Number], default: [0, 1, 2, 3, 4, 5, 6] })
  daysOfWeek: number[];

  @Prop({ default: 1 })
  priority: number; // 1: Low, 2: Medium, 3: High

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: 0 })
  totalCompletions: number;

  @Prop()
  lastCompletedDate: Date;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  targetCompletions: number;

  @Prop()
  reminderTime: string; // HH:mm format

  @Prop({ default: false })
  reminderEnabled: boolean;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);

// Indexes for better query performance
HabitSchema.index({ userId: 1, category: 1 });
HabitSchema.index({ userId: 1, isActive: 1 });
