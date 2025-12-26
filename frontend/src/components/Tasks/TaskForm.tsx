import React, { useState } from 'react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
}

const COLORS = [
  '#e63946', '#f59e0b', '#10b981', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
];

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { createTask, updateTask, categories, selectedDate } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    category: task?.category || categories[0]?.name || 'Work',
    color: task?.color || COLORS[0],
    date: task?.date ? format(new Date(task.date), 'yyyy-MM-dd') : format(selectedDate, 'yyyy-MM-dd'),
    priority: task?.priority || 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (task) {
        await updateTask(task._id, formData);
      } else {
        await createTask(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Task Name"
        placeholder="What do you need to do?"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Textarea
        label="Description (optional)"
        placeholder="Add some details..."
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

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Priority</label>
        <div className={styles.priorityOptions}>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.priorityBtn} ${formData.priority === p ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, priority: p })}
            >
              {p === 1 ? 'Low' : p === 2 ? 'Medium' : 'High'}
            </button>
          ))}
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
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

