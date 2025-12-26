import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import styles from './Calendar.module.css';

export const Calendar: React.FC = () => {
  const { selectedDate, setSelectedDate, viewMode, setViewMode, tasks, dailyProgress } = useApp();

  const days = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [selectedDate]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const navigate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'prev' ? -1 : 1;
    switch (viewMode) {
      case 'week':
        setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
        break;
      case 'year':
        setSelectedDate(direction === 'prev' ? subYears(selectedDate, 1) : addYears(selectedDate, 1));
        break;
      default:
        setSelectedDate(new Date(selectedDate.getTime() + modifier * 24 * 60 * 60 * 1000));
    }
  };

  const goToToday = () => setSelectedDate(new Date());

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.date), date));
  };

  const getDayProgress = (date: Date) => {
    const dayTasks = getTasksForDay(date);
    if (dayTasks.length === 0) return null;
    const completed = dayTasks.filter((t) => t.completed).length;
    return Math.round((completed / dayTasks.length) * 100);
  };

  const formatHeader = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'year':
        return format(selectedDate, 'yyyy');
      default:
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <Button variant="ghost" size="sm" onClick={() => navigate('prev')}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className={styles.title}>{formatHeader()}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('next')}>
            <ChevronRight size={20} />
          </Button>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={goToToday} icon={<CalendarIcon size={16} />}>
            Today
          </Button>
          <div className={styles.viewToggle}>
            {(['day', 'week', 'month', 'year'] as const).map((mode) => (
              <button
                key={mode}
                className={`${styles.viewBtn} ${viewMode === mode ? styles.active : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'month' && (
          <motion.div
            key="month"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.monthView}
          >
            <div className={styles.weekDays}>
              {weekDays.map((day) => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>
            <div className={styles.daysGrid}>
              {days.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const progress = getDayProgress(day);
                const isCurrentMonth = isSameMonth(day, selectedDate);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${
                      isSelected ? styles.selected : ''
                    } ${isCurrentDay ? styles.today : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={styles.dayNumber}>{format(day, 'd')}</span>
                    {dayTasks.length > 0 && (
                      <div className={styles.dayIndicators}>
                        {dayTasks.slice(0, 3).map((task) => (
                          <span
                            key={task._id}
                            className={`${styles.taskDot} ${task.completed ? styles.completed : ''}`}
                            style={{ backgroundColor: task.color }}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className={styles.moreTasks}>+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                    {progress !== null && (
                      <div className={styles.dayProgress}>
                        <div
                          className={styles.dayProgressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === 'day' && (
          <motion.div
            key="day"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.dayView}
          >
            <div className={styles.dayViewContent}>
              <div className={styles.todayCard}>
                <div className={styles.todayDate}>
                  <span className={styles.todayDay}>{format(selectedDate, 'd')}</span>
                  <div>
                    <span className={styles.todayWeekday}>{format(selectedDate, 'EEEE')}</span>
                    <span className={styles.todayMonth}>{format(selectedDate, 'MMMM yyyy')}</span>
                  </div>
                </div>
                {dailyProgress && (
                  <div className={styles.todayStats}>
                    <div className={styles.todayStat}>
                      <span className={styles.statValue}>{dailyProgress.tasks.completed}</span>
                      <span className={styles.statLabel}>/ {dailyProgress.tasks.total} Tasks</span>
                    </div>
                    <div className={styles.todayStat}>
                      <span className={styles.statValue}>{dailyProgress.habits.completed}</span>
                      <span className={styles.statLabel}>/ {dailyProgress.habits.total} Habits</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.weekView}
          >
            <div className={styles.weekDaysHorizontal}>
              {eachDayOfInterval({
                start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
                end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
              }).map((day) => {
                const dayTasks = getTasksForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    className={`${styles.weekDayCard} ${isSelected ? styles.selected : ''} ${
                      isCurrentDay ? styles.today : ''
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={styles.weekDayName}>{format(day, 'EEE')}</span>
                    <span className={styles.weekDayNumber}>{format(day, 'd')}</span>
                    <span className={styles.weekDayTasks}>{dayTasks.length} tasks</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === 'year' && (
          <motion.div
            key="year"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.yearView}
          >
            <div className={styles.monthsGrid}>
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(selectedDate.getFullYear(), i, 1);
                const isCurrentMonth = isSameMonth(monthDate, new Date());
                const isSelectedMonth = isSameMonth(monthDate, selectedDate);

                return (
                  <button
                    key={i}
                    className={`${styles.monthCard} ${isCurrentMonth ? styles.current : ''} ${
                      isSelectedMonth ? styles.selected : ''
                    }`}
                    onClick={() => {
                      setSelectedDate(monthDate);
                      setViewMode('month');
                    }}
                  >
                    <span className={styles.monthName}>{format(monthDate, 'MMM')}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

