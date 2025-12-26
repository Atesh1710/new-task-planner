import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Task, Habit, Category, DailyProgress, ViewMode, ThemeSettings } from '../types';
import { tasksApi, habitsApi, progressApi, categoriesApi } from '../services/api';

interface AppContextType {
  // State
  selectedDate: Date;
  viewMode: ViewMode;
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
  dailyProgress: DailyProgress | null;
  isLoading: boolean;
  theme: ThemeSettings;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  refreshData: () => Promise<void>;
  
  // Task Actions
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  
  // Habit Actions
  createHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitComplete: (id: string, date: string) => Promise<void>;
  
  // Category Actions
  createCategory: (category: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Theme Actions
  toggleTheme: () => void;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#e63946',
  accentColor: '#14b8a6',
  backgroundColor: '#fdfcfb',
  surfaceColor: '#ffffff',
  textColor: '#1a1a1a',
  isDarkMode: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Fetch daily progress
      const progressRes = await progressApi.getDaily(dateStr);
      setDailyProgress(progressRes.data);
      
      // Fetch tasks for current view
      let startDate: Date, endDate: Date;
      switch (viewMode) {
        case 'week':
          startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
          endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
          break;
        case 'year':
          startDate = startOfYear(selectedDate);
          endDate = endOfYear(selectedDate);
          break;
        default:
          startDate = selectedDate;
          endDate = selectedDate;
      }
      
      const [tasksRes, habitsRes, categoriesRes] = await Promise.all([
        tasksApi.getByDateRange(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
        habitsApi.getActive(),
        categoriesApi.getAll(),
      ]);
      
      setTasks(tasksRes.data);
      setHabits(habitsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Seed default categories on first load
  useEffect(() => {
    const seedCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.data.length === 0) {
          await categoriesApi.seedDefaults();
          refreshData();
        }
      } catch (error) {
        console.error('Error seeding categories:', error);
      }
    };
    seedCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Task Actions
  const createTask = async (task: Partial<Task>) => {
    await tasksApi.create(task);
    refreshData();
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    await tasksApi.update(id, task);
    refreshData();
  };

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id);
    refreshData();
  };

  const toggleTaskComplete = async (id: string) => {
    await tasksApi.toggleComplete(id);
    refreshData();
  };

  // Habit Actions
  const createHabit = async (habit: Partial<Habit>) => {
    await habitsApi.create(habit);
    refreshData();
  };

  const updateHabit = async (id: string, habit: Partial<Habit>) => {
    await habitsApi.update(id, habit);
    refreshData();
  };

  const deleteHabit = async (id: string) => {
    await habitsApi.delete(id);
    refreshData();
  };

  const toggleHabitComplete = async (id: string, date: string) => {
    await habitsApi.toggleComplete(id, date);
    refreshData();
  };

  // Category Actions
  const createCategory = async (category: Partial<Category>) => {
    await categoriesApi.create(category);
    refreshData();
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    await categoriesApi.update(id, category);
    refreshData();
  };

  const deleteCategory = async (id: string) => {
    await categoriesApi.delete(id);
    refreshData();
  };

  // Theme Actions
  const toggleTheme = () => {
    setTheme(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const updateTheme = (settings: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...settings }));
  };

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        viewMode,
        tasks,
        habits,
        categories,
        dailyProgress,
        isLoading,
        theme,
        setSelectedDate,
        setViewMode,
        refreshData,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabitComplete,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleTheme,
        updateTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

