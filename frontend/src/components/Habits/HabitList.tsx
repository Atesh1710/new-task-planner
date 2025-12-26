import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Check, Trash2, Edit2, Flame, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { HabitForm } from './HabitForm';
import styles from './HabitList.module.css';

export const HabitList: React.FC = () => {
  const { dailyProgress, toggleHabitComplete, deleteHabit, selectedDate } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const habits = dailyProgress?.habits.items || [];

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const handleToggle = (habit: Habit) => {
    toggleHabitComplete(habit._id, format(selectedDate, 'yyyy-MM-dd'));
  };

  const sortedHabits = [...habits].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.currentStreak - a.currentStreak;
  });

  return (
    <div className={styles.habitList}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Habits</h3>
          <p className={styles.subtitle}>
            {dailyProgress?.habits.completed || 0}/{dailyProgress?.habits.total || 0} completed today
          </p>
        </div>
        <Button size="sm" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Add Habit
        </Button>
      </div>

      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {sortedHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.empty}
            >
              <p>No habits yet</p>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                Create your first habit
              </Button>
            </motion.div>
          ) : (
            sortedHabits.map((habit, index) => (
              <motion.div
                key={habit._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`${styles.habitItem} ${habit.completed ? styles.completed : ''}`}
              >
                <button
                  className={styles.checkbox}
                  onClick={() => handleToggle(habit)}
                  style={{ 
                    borderColor: habit.color,
                    backgroundColor: habit.completed ? habit.color : 'transparent'
                  }}
                >
                  {habit.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check size={16} color="white" />
                    </motion.div>
                  )}
                </button>

                <div className={styles.habitContent}>
                  <div className={styles.habitHeader}>
                    <span className={styles.habitName}>{habit.name}</span>
                    <div className={styles.streakBadges}>
                      {habit.currentStreak > 0 && (
                        <span className={styles.streakBadge}>
                          <Flame size={14} />
                          {habit.currentStreak} day streak
                        </span>
                      )}
                      {habit.longestStreak > 0 && habit.longestStreak > habit.currentStreak && (
                        <span className={styles.recordBadge}>
                          <Trophy size={12} />
                          Best: {habit.longestStreak}
                        </span>
                      )}
                    </div>
                  </div>
                  {habit.description && (
                    <p className={styles.habitDescription}>{habit.description}</p>
                  )}
                  <div className={styles.habitMeta}>
                    <span
                      className={styles.category}
                      style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    >
                      {habit.category}
                    </span>
                    <span className={styles.frequency}>{habit.frequency}</span>
                    <span className={styles.completions}>
                      {habit.totalCompletions} total completions
                    </span>
                  </div>
                </div>

                <div className={styles.habitActions}>
                  <button className={styles.actionBtn} onClick={() => handleEdit(habit)}>
                    <Edit2 size={16} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => deleteHabit(habit._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingHabit ? 'Edit Habit' : 'Create Habit'}
      >
        <HabitForm habit={editingHabit} onClose={handleClose} />
      </Modal>
    </div>
  );
};

