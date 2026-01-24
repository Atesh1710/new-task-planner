import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { progressApi, habitsApi } from '../../services/api';
import { ProgressBar } from '../ui/ProgressBar';
import styles from './ProgressCharts.module.css';

type TabType = 'weekly' | 'monthly' | 'yearly';

interface DailyData {
  date: string;
  tasksCompleted: number;
  habitsCompleted: number;
}

export const ProgressCharts: React.FC = () => {
  const { selectedDate } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [weeklyData, setWeeklyData] = useState<DailyData[] | null>(null);
  const [monthlyData, setMonthlyData] = useState<DailyData[] | null>(null);
  const [yearlyData, setYearlyData] = useState<DailyData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());
  
  // Habit performance state
  const [showHabitPerformance, setShowHabitPerformance] = useState(false);
  const [habitStats, setHabitStats] = useState<any>(null);
  const [habitLoading, setHabitLoading] = useState(false);

  const today = new Date();

  const fetchTabData = useCallback(async (tab: TabType) => {
    if (loadedTabs.has(tab)) return;
    
    setIsLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      
      switch (tab) {
        case 'weekly':
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
          const weeklyRes = await progressApi.getWeekly(format(weekStart, 'yyyy-MM-dd'));
          setWeeklyData(weeklyRes.data.dailyData || []);
          break;
        case 'monthly':
          const monthlyRes = await progressApi.getMonthly(year, month);
          setMonthlyData(monthlyRes.data.dailyData || []);
          break;
        case 'yearly':
          const yearlyRes = await progressApi.getYearly(year);
          setYearlyData(yearlyRes.data.dailyData || []);
          break;
      }
      setLoadedTabs(prev => new Set(Array.from(prev).concat(tab)));
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, loadedTabs]);

  // Fetch habit performance when toggle is clicked
  const fetchHabitPerformance = useCallback(async () => {
    if (habitStats) return; // Already loaded
    
    setHabitLoading(true);
    try {
      const res = await habitsApi.getStats(
        format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        format(new Date(), 'yyyy-MM-dd')
      );
      setHabitStats(res.data);
    } catch (error) {
      console.error('Error fetching habit stats:', error);
    } finally {
      setHabitLoading(false);
    }
  }, [habitStats]);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, fetchTabData]);

  // Reset data when date changes
  useEffect(() => {
    setLoadedTabs(new Set());
    setWeeklyData(null);
    setMonthlyData(null);
    setYearlyData(null);
    setHabitStats(null);
  }, [selectedDate]);

  const handleToggleHabitPerformance = () => {
    const newState = !showHabitPerformance;
    setShowHabitPerformance(newState);
    if (newState && !habitStats) {
      fetchHabitPerformance();
    }
  };

  // Filter out future dates
  const filterFutureDates = (data: DailyData[] | null) => {
    if (!data) return [];
    return data.filter(d => new Date(d.date) <= today);
  };

  const formatWeeklyData = () => {
    const filtered = filterFutureDates(weeklyData);
    return filtered.map((d: DailyData) => ({
      label: format(new Date(d.date), 'EEE'),
      fullDate: format(new Date(d.date), 'MMM d'),
      habits: d.habitsCompleted,
    }));
  };

  const formatMonthlyData = () => {
    const filtered = filterFutureDates(monthlyData);
    return filtered.map((d: DailyData) => ({
      label: String(new Date(d.date).getDate()),
      fullDate: format(new Date(d.date), 'MMM d'),
      habits: d.habitsCompleted,
    }));
  };

  const formatYearlyData = () => {
    const filtered = filterFutureDates(yearlyData);
    // Group by month
    const monthlyGroups: { [key: string]: number } = {};
    filtered.forEach((d: DailyData) => {
      const monthLabel = format(new Date(d.date), 'MMM');
      if (!monthlyGroups[monthLabel]) {
        monthlyGroups[monthLabel] = 0;
      }
      monthlyGroups[monthLabel] += d.habitsCompleted;
    });
    return Object.entries(monthlyGroups).map(([month, habits]) => ({
      label: month,
      fullDate: month,
      habits,
    }));
  };

  const getChartData = () => {
    switch (activeTab) {
      case 'weekly': return formatWeeklyData();
      case 'monthly': return formatMonthlyData();
      case 'yearly': return formatYearlyData();
      default: return [];
    }
  };

  const getXAxisLabel = () => {
    switch (activeTab) {
      case 'weekly': return 'Days';
      case 'monthly': return 'Date';
      case 'yearly': return 'Month';
      default: return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = getChartData().find((d: any) => d.label === label);
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipDate}>{data?.fullDate || label}</p>
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

  const chartData = getChartData();

  return (
    <div className={styles.container}>
      {/* Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <TrendingUp size={20} />
            <h3>Progress Overview</h3>
          </div>
          <div className={styles.tabs}>
            {(['weekly', 'monthly', 'yearly'] as const).map((tab) => (
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

        {isLoading ? (
          <div className={styles.loading}>Loading chart...</div>
        ) : chartData.length === 0 ? (
          <div className={styles.noData}>No data available</div>
        ) : (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ bottom: 25, left: 15, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                  interval={activeTab === 'monthly' ? 2 : 0}
                  label={{ value: getXAxisLabel(), position: 'insideBottom', offset: -15, fill: '#e63946', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                  allowDecimals={false}
                  label={{ value: 'Completed', angle: -90, position: 'insideLeft', fill: '#e63946', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '15px' }} />
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
          </div>
        )}
      </div>

      {/* Habit Performance Toggle */}
      <div className={styles.habitToggleSection}>
        <button 
          className={styles.habitToggleBtn}
          onClick={handleToggleHabitPerformance}
        >
          <span>Habit Performance (Last 30 Days)</span>
          {showHabitPerformance ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showHabitPerformance && (
          <div className={styles.habitContent}>
            {habitLoading ? (
              <div className={styles.loading}>Loading habit stats...</div>
            ) : habitStats?.byHabit && habitStats.byHabit.length > 0 ? (
              <div className={styles.habitStats}>
                {habitStats.byHabit.map((habit: any) => (
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
            ) : (
              <div className={styles.noData}>No habit data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

