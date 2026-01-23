import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Target, Flame, Award, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { progressApi, habitsApi } from '../../services/api';
import { CircularProgress, ProgressBar } from '../ui/ProgressBar';
import styles from './Statistics.module.css';

interface StatsData {
  weekly: any;
  monthly: any;
  yearly: any;
  habitStats: any;
}

export const Statistics: React.FC = () => {
  const { selectedDate, dailyProgress, habits } = useApp();
  const [statsData, setStatsData] = useState<StatsData>({
    weekly: null,
    monthly: null,
    yearly: null,
    habitStats: null,
  });
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['daily']));

  // Delay chart rendering to allow modal animation to complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 100); // Reduced delay since we're only in modal now
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch data only for the active tab (lazy loading)
  const fetchTabData = useCallback(async (tab: string) => {
    if (loadedTabs.has(tab) && statsData[tab as keyof StatsData]) {
      return; // Already loaded
    }

    setIsLoading(true);
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      let data: any = null;

      switch (tab) {
        case 'weekly':
          const weeklyRes = await progressApi.getWeekly(format(weekStart, 'yyyy-MM-dd'));
          data = weeklyRes.data;
          setStatsData(prev => ({ ...prev, weekly: data }));
          break;
        case 'monthly':
          const monthlyRes = await progressApi.getMonthly(year, month);
          data = monthlyRes.data;
          setStatsData(prev => ({ ...prev, monthly: data }));
          break;
        case 'yearly':
          const yearlyRes = await progressApi.getYearly(year);
          data = yearlyRes.data;
          setStatsData(prev => ({ ...prev, yearly: data }));
          break;
      }

      // Fetch habit stats if not already loaded (shared across tabs)
      if (!statsData.habitStats) {
        const habitStatsRes = await habitsApi.getStats(
          format(subDays(new Date(), 30), 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd')
        );
        setStatsData(prev => ({ ...prev, habitStats: habitStatsRes.data }));
      }

      setLoadedTabs(prev => new Set(Array.from(prev).concat(tab)));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, loadedTabs, statsData]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab !== 'daily') {
      fetchTabData(activeTab);
    }
  }, [activeTab, fetchTabData]);

  // Reset loaded tabs when date changes
  useEffect(() => {
    setLoadedTabs(new Set(['daily']));
    setStatsData({
      weekly: null,
      monthly: null,
      yearly: null,
      habitStats: null,
    });
  }, [selectedDate]);

  const CHART_COLORS = ['#e63946', '#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const formatWeeklyData = () => {
    if (!statsData?.weekly?.dailyData) return [];
    return statsData.weekly.dailyData.map((d: any) => ({
      date: format(new Date(d.date), 'EEE'),
      fullDate: format(new Date(d.date), 'MMM d'),
      tasks: d.tasksCompleted,
      habits: d.habitsCompleted,
      total: d.tasksCompleted + d.habitsCompleted,
    }));
  };

  const formatMonthlyData = () => {
    if (!statsData?.monthly?.dailyData) return [];
    // Show actual daily data with dates 1, 2, 3... up to month end
    return statsData.monthly.dailyData.map((d: any) => {
      const dateObj = new Date(d.date);
      return {
        day: dateObj.getDate(), // Day number: 1, 2, 3... 28/29/30/31
        fullDate: format(dateObj, 'MMM d'),
        tasks: d.tasksCompleted,
        habits: d.habitsCompleted,
        total: d.tasksCompleted + d.habitsCompleted,
      };
    });
  };

  const formatYearlyData = () => {
    if (!statsData?.yearly?.dailyData) return [];
    // Group by month for yearly view
    const monthlyData: { [key: string]: { tasks: number; habits: number; count: number } } = {};
    
    statsData.yearly.dailyData.forEach((d: any) => {
      const monthLabel = format(new Date(d.date), 'MMM');
      
      if (!monthlyData[monthLabel]) {
        monthlyData[monthLabel] = { tasks: 0, habits: 0, count: 0 };
      }
      monthlyData[monthLabel].tasks += d.tasksCompleted;
      monthlyData[monthLabel].habits += d.habitsCompleted;
      monthlyData[monthLabel].count++;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      tasks: data.tasks,
      habits: data.habits,
      total: data.tasks + data.habits,
    }));
  };

  const formatCategoryData = () => {
    if (!statsData?.monthly?.categoryBreakdown) return [];
    return statsData.monthly.categoryBreakdown.map((c: any) => ({
      name: c.category,
      value: c.completed,
      total: c.total,
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading only on initial load when no data exists
  const showTabLoading = isLoading && activeTab !== 'daily' && !statsData[activeTab as keyof StatsData];

  return (
    <div className={styles.statistics}>
      <div className={styles.header}>
        <h3 className={styles.title}>Progress Overview</h3>
        <div className={styles.tabs}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Today's Progress */}
      {activeTab === 'daily' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.todayProgress}
        >
          <div className={styles.progressCard}>
            <div className={styles.progressCircle}>
              <CircularProgress
                value={dailyProgress?.overall.progress || 0}
                size={120}
                strokeWidth={10}
              />
            </div>
            <div className={styles.progressInfo}>
              <h4>Today's Progress</h4>
              <p>{dailyProgress?.overall.completed || 0} of {dailyProgress?.overall.total || 0} completed</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(230, 57, 70, 0.1)' }}>
                <Target size={20} color="var(--primary-500)" />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{dailyProgress?.tasks.completed || 0}</span>
                <span className={styles.statLabel}>Tasks Done</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                <TrendingUp size={20} color="var(--accent-500)" />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{dailyProgress?.habits.completed || 0}</span>
                <span className={styles.statLabel}>Habits Done</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <Flame size={20} color="var(--warning)" />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {Math.max(...habits.map((h) => h.currentStreak), 0)}
                </span>
                <span className={styles.statLabel}>Best Streak</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <Award size={20} color="#8b5cf6" />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {statsData?.habitStats?.completed || 0}
                </span>
                <span className={styles.statLabel}>Monthly Total</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading indicator for non-daily tabs */}
      {showTabLoading && (
        <div className={styles.tabLoading}>
          <div className={styles.loadingSpinner} />
          <p>Loading {activeTab} data...</p>
        </div>
      )}

      {/* Weekly Line Chart */}
      {activeTab === 'weekly' && statsData.weekly && !showTabLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.chartSection}
        >
          <h4 className={styles.sectionTitle}>
            <Calendar size={18} />
            Weekly Progress
          </h4>
          <div className={styles.chartContainer}>
            {isChartReady ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatWeeklyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#e63946"
                  strokeWidth={3}
                  dot={{ fill: '#e63946', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="habits"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Habits"
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className={styles.chartLoading}>Loading chart...</div>
            )}
          </div>

          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Tasks Completed</span>
              <span className={styles.summaryValue}>{statsData.weekly?.tasks?.completed || 0}</span>
              <span className={styles.summaryRate}>{statsData.weekly?.tasks?.completionRate || 0}% rate</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Habits Completed</span>
              <span className={styles.summaryValue}>{statsData.weekly?.habits?.completed || 0}</span>
              <span className={styles.summaryRate}>{statsData.weekly?.habits?.completionRate || 0}% rate</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monthly Line Chart */}
      {activeTab === 'monthly' && statsData.monthly && !showTabLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.chartSection}
        >
          <h4 className={styles.sectionTitle}>
            <Calendar size={18} />
            Monthly Progress - {format(selectedDate, 'MMMM yyyy')}
          </h4>
          <div className={styles.chartContainer}>
            {isChartReady ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                  interval={2}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#e63946"
                  strokeWidth={2}
                  dot={{ fill: '#e63946', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 6 }}
                  name="Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="habits"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 6 }}
                  name="Habits"
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className={styles.chartLoading}>Loading chart...</div>
            )}
          </div>

          {/* Category Breakdown */}
          {formatCategoryData().length > 0 && (
            <div className={styles.categorySection}>
              <h4 className={styles.sectionTitle}>Category Breakdown</h4>
              <div className={styles.categoryGrid}>
                <div className={styles.pieContainer}>
                  {isChartReady ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={formatCategoryData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {formatCategoryData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className={styles.chartLoading}>Loading...</div>
                  )}
                </div>
                <div className={styles.categoryList}>
                  {formatCategoryData().map((cat: any, index: number) => (
                    <div key={cat.name} className={styles.categoryItem}>
                      <div className={styles.categoryHeader}>
                        <span
                          className={styles.categoryDot}
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className={styles.categoryName}>{cat.name}</span>
                        <span className={styles.categoryValue}>{cat.value}/{cat.total}</span>
                      </div>
                      <ProgressBar
                        value={cat.value}
                        max={cat.total}
                        size="sm"
                        color={CHART_COLORS[index % CHART_COLORS.length]}
                        showLabel={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Yearly Bar Chart */}
      {activeTab === 'yearly' && statsData.yearly && !showTabLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.chartSection}
        >
          <h4 className={styles.sectionTitle}>
            <Calendar size={18} />
            Yearly Progress - {selectedDate.getFullYear()}
          </h4>
          <div className={styles.chartContainer}>
            {isChartReady ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatYearlyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="tasks" fill="#e63946" name="Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="habits" fill="#14b8a6" name="Habits" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className={styles.chartLoading}>Loading chart...</div>
            )}
          </div>

          <div className={styles.yearSummary}>
            <div className={styles.yearStat}>
              <span className={styles.yearValue}>{statsData.yearly?.tasks?.completed || 0}</span>
              <span className={styles.yearLabel}>Total Tasks Completed</span>
            </div>
            <div className={styles.yearStat}>
              <span className={styles.yearValue}>{statsData.yearly?.habits?.completed || 0}</span>
              <span className={styles.yearLabel}>Total Habits Completed</span>
            </div>
            <div className={styles.yearStat}>
              <span className={styles.yearValue}>
                {Math.round((statsData.yearly?.tasks?.completionRate + statsData.yearly?.habits?.completionRate) / 2) || 0}%
              </span>
              <span className={styles.yearLabel}>Average Completion</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Habit Stats */}
      {statsData?.habitStats?.byHabit && statsData.habitStats.byHabit.length > 0 && activeTab !== 'daily' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.chartSection}
        >
          <h4 className={styles.sectionTitle}>Habit Performance (Last 30 Days)</h4>
          <div className={styles.habitStats}>
            {statsData.habitStats.byHabit.map((habit: any) => (
              <div key={habit.id} className={styles.habitStatCard}>
                <div className={styles.habitStatHeader}>
                  <span
                    className={styles.habitDot}
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className={styles.habitName}>{habit.name}</span>
                  {habit.priority === 3 && <span className={styles.priorityBadge}>High</span>}
                </div>
                <div className={styles.habitStatContent}>
                  <div className={styles.habitMetric}>
                    <span className={styles.metricValue}>{habit.completionRate}%</span>
                    <span className={styles.metricLabel}>Completion</span>
                  </div>
                  <div className={styles.habitMetric}>
                    <span className={styles.metricValue}>{habit.currentStreak}</span>
                    <span className={styles.metricLabel}>Streak</span>
                  </div>
                  <div className={styles.habitMetric}>
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
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
