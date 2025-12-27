import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { TrendingUp, Flame, Award } from 'lucide-react';
import { habitsApi } from '../../services/api';
import { ProgressBar } from '../ui/ProgressBar';
import styles from './HabitPerformance.module.css';

interface HabitStat {
  id: string;
  name: string;
  category: string;
  color: string;
  priority: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

interface HabitStats {
  totalHabits: number;
  completed: number;
  completionRate: number;
  byHabit: HabitStat[];
}

export const HabitPerformance: React.FC = () => {
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await habitsApi.getStats(
          format(subDays(new Date(), 30), 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd')
        );
        setHabitStats(res.data);
      } catch (error) {
        console.error('Error fetching habit stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.performance}>
        <div className={styles.loading}>Loading performance data...</div>
      </div>
    );
  }

  if (!habitStats || !habitStats.byHabit || habitStats.byHabit.length === 0) {
    return null; // Don't render if no habits
  }

  // Calculate best streak across all habits
  const bestStreak = Math.max(...habitStats.byHabit.map(h => h.currentStreak), 0);
  const longestEver = Math.max(...habitStats.byHabit.map(h => h.longestStreak), 0);

  return (
    <motion.div
      className={styles.performance}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>
          <TrendingUp size={20} />
          Habit Performance
        </h3>
        <span className={styles.subtitle}>Last 30 days</span>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <div className={styles.quickIcon} style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
            <TrendingUp size={18} color="var(--accent-500)" />
          </div>
          <div className={styles.quickContent}>
            <span className={styles.quickValue}>{habitStats.completionRate}%</span>
            <span className={styles.quickLabel}>Completion</span>
          </div>
        </div>
        <div className={styles.quickStat}>
          <div className={styles.quickIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Flame size={18} color="var(--warning)" />
          </div>
          <div className={styles.quickContent}>
            <span className={styles.quickValue}>{bestStreak}</span>
            <span className={styles.quickLabel}>Current Streak</span>
          </div>
        </div>
        <div className={styles.quickStat}>
          <div className={styles.quickIcon} style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <Award size={18} color="#8b5cf6" />
          </div>
          <div className={styles.quickContent}>
            <span className={styles.quickValue}>{longestEver}</span>
            <span className={styles.quickLabel}>Best Streak</span>
          </div>
        </div>
      </div>

      {/* Habit List */}
      <div className={styles.habitList}>
        {habitStats.byHabit.map((habit, index) => (
          <motion.div
            key={habit.id}
            className={styles.habitCard}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className={styles.habitHeader}>
              <span
                className={styles.habitDot}
                style={{ backgroundColor: habit.color }}
              />
              <span className={styles.habitName}>{habit.name}</span>
              {habit.priority >= 2 && (
                <span className={styles.priorityBadge}>
                  {habit.priority === 3 ? 'High' : 'Med'}
                </span>
              )}
            </div>
            <div className={styles.habitMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{habit.completionRate}%</span>
                <span className={styles.metricLabel}>Done</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{habit.currentStreak}</span>
                <span className={styles.metricLabel}>Streak</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>{habit.longestStreak}</span>
                <span className={styles.metricLabel}>Best</span>
              </div>
            </div>
            <ProgressBar
              value={habit.completionRate}
              size="sm"
              color={habit.color}
              showLabel={false}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

