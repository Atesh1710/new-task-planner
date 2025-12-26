import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressLogDocument = ProgressLog & Document;

@Schema({ timestamps: true })
export class ProgressLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  completedAt: Date;

  @Prop()
  notes: string;

  @Prop({ default: 0 })
  streakAtCompletion: number;
}

export const ProgressLogSchema = SchemaFactory.createForClass(ProgressLog);

// Compound index for efficient lookups
ProgressLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
ProgressLogSchema.index({ userId: 1, date: 1 });
