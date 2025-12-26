import React, { useState } from 'react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import styles from './HabitForm.module.css';

interface HabitFormProps {
  habit?: Habit | null;
  onClose: () => void;
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#e63946',
  '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'
];

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const HabitForm: React.FC<HabitFormProps> = ({ habit, onClose }) => {
  const { createHabit, updateHabit, categories } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: string;
    color: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek: number[];
    priority: number;
    startDate: string;
    reminderTime: string;
    reminderEnabled: boolean;
  }>({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || categories[0]?.name || 'Health',
    color: habit?.color || COLORS[0],
    frequency: habit?.frequency || 'daily',
    daysOfWeek: habit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    priority: habit?.priority || 2,
    startDate: habit?.startDate 
      ? format(new Date(habit.startDate), 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd'),
    reminderTime: habit?.reminderTime || '09:00',
    reminderEnabled: habit?.reminderEnabled || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        reminderTime: formData.reminderEnabled ? formData.reminderTime : undefined,
      };
      
      if (habit) {
        await updateHabit(habit._id, submitData);
      } else {
        await createHabit(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Habit Name"
        placeholder="e.g., Morning meditation, Read 20 pages"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Textarea
        label="Description (optional)"
        placeholder="Why is this habit important to you?"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <div className={styles.row}>
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={categories.map((cat) => ({ value: cat.name, label: cat.name }))}
        />

        <Select
          label="Frequency"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
      </div>

      {formData.frequency === 'weekly' && (
        <div className={styles.field}>
          <label className={styles.label}>Days of the Week</label>
          <div className={styles.daysGrid}>
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                className={`${styles.dayBtn} ${
                  formData.daysOfWeek.includes(day.value) ? styles.active : ''
                }`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Priority</label>
        <div className={styles.priorityOptions}>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.priorityBtn} ${formData.priority === p ? styles.active : ''} ${styles[`priority${p}`]}`}
              onClick={() => setFormData({ ...formData, priority: p })}
            >
              {p === 1 ? '🟢 Low' : p === 2 ? '🟡 Medium' : '🔴 High'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />

        <div className={styles.field}>
          <label className={styles.label}>Reminder</label>
          <div className={styles.reminderRow}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
            <input
              type="time"
              className={styles.timeInput}
              value={formData.reminderTime}
              onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
              disabled={!formData.reminderEnabled}
            />
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div className={styles.colorOptions}>
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`${styles.colorBtn} ${formData.color === color ? styles.active : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {habit ? 'Update Habit' : 'Create Habit'}
        </Button>
      </div>
    </form>
  );
};
