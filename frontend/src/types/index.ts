export interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Task {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  priority: number;
  isRecurring: boolean;
  recurringPattern?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  isActive: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek: number[];
  priority: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompletedDate?: string;
  startDate: string;
  targetCompletions?: number;
  reminderTime?: string;
  reminderEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  completed?: boolean;
  logId?: string;
}

export interface ProgressLog {
  _id: string;
  userId: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  streakAtCompletion: number;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
}

export interface DailyProgress {
  date: string;
  tasks: {
    total: number;
    completed: number;
    progress: number;
    items: Task[];
  };
  habits: {
    total: number;
    completed: number;
    progress: number;
    items: Habit[];
  };
  overall: {
    total: number;
    completed: number;
    progress: number;
  };
}

export interface PeriodProgress {
  period: string;
  startDate: string;
  endDate: string;
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  habits: {
    totalPossible: number;
    completed: number;
    completionRate: number;
  };
  dailyData: {
    date: string;
    tasksTotal: number;
    tasksCompleted: number;
    habitsCompleted: number;
  }[];
  categoryBreakdown: {
    category: string;
    total: number;
    completed: number;
    completionRate: number;
  }[];
}

export interface HabitStats {
  id: string;
  name: string;
  category: string;
  color: string;
  priority: number;
  total: number;
  completed: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

export type ViewMode = 'day' | 'week' | 'month' | 'year';

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  isDarkMode: boolean;
}
