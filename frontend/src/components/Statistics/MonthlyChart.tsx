import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
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
import { TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { progressApi } from '../../services/api';
import styles from './MonthlyChart.module.css';

interface DailyData {
  date: string;
  tasksCompleted: number;
  habitsCompleted: number;
}

export const MonthlyChart: React.FC = () => {
  const { selectedDate } = useApp();
  const [monthlyData, setMonthlyData] = useState<DailyData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonthlyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const res = await progressApi.getMonthly(year, month);
      setMonthlyData(res.data.dailyData || []);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  const formatChartData = () => {
    if (!monthlyData) return [];
    return monthlyData.map((d: DailyData) => {
      const dateObj = new Date(d.date);
      return {
        day: dateObj.getDate(),
        fullDate: format(dateObj, 'MMM d'),
        tasks: d.tasksCompleted,
        habits: d.habitsCompleted,
      };
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = formatChartData().find(d => d.day === label);
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipDate}>{data?.fullDate || `Day ${label}`}</p>
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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <TrendingUp size={20} />
          <h3>Monthly Progress</h3>
        </div>
        <div className={styles.loading}>Loading chart...</div>
      </div>
    );
  }

  const chartData = formatChartData();
  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TrendingUp size={20} />
        <h3>Monthly Progress - {format(selectedDate, 'MMMM yyyy')}</h3>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
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
              dot={{ fill: '#e63946', strokeWidth: 1, r: 2 }}
              activeDot={{ r: 5 }}
              name="Tasks"
            />
            <Line
              type="monotone"
              dataKey="habits"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', strokeWidth: 1, r: 2 }}
              activeDot={{ r: 5 }}
              name="Habits"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

