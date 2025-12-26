import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  completedAt: Date;

  @Prop({ default: 1 })
  priority: number; // 1: Low, 2: Medium, 3: High

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly', null], default: null })
  recurringPattern: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Indexes for better query performance
TaskSchema.index({ userId: 1, date: 1 });
TaskSchema.index({ userId: 1, category: 1 });
TaskSchema.index({ userId: 1, completed: 1 });
