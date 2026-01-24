import axios from 'axios';
import { Task, Habit, Category, DailyProgress, PeriodProgress, ProgressLog, AuthResponse } from '../types';

// In production (Vercel), frontend and backend are on same domain, so use relative /api
// In development, use localhost:3001
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: { name?: string; password?: string; preferences?: any }) =>
    api.patch('/auth/profile', data),
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get<Task[]>('/tasks'),
  
  getById: (id: string) => api.get<Task>(`/tasks/${id}`),
  
  getByDate: (date: string) => api.get<Task[]>(`/tasks/date/${date}`),
  
  getByDateRange: (startDate: string, endDate: string) => 
    api.get<Task[]>('/tasks/range', { params: { startDate, endDate } }),
  
  getByCategory: (category: string) => api.get<Task[]>(`/tasks/category/${category}`),
  
  getStats: (startDate: string, endDate: string) => 
    api.get('/tasks/stats', { params: { startDate, endDate } }),
  
  create: (task: Partial<Task>) => api.post<Task>('/tasks', task),
  
  update: (id: string, task: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, task),
  
  toggleComplete: (id: string) => api.patch<Task>(`/tasks/${id}/toggle`),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Habits API
export const habitsApi = {
  getAll: () => api.get<Habit[]>('/habits'),
  
  getActive: () => api.get<Habit[]>('/habits/active'),
  
  getById: (id: string) => api.get<Habit>(`/habits/${id}`),
  
  getByCategory: (category: string) => api.get<Habit[]>(`/habits/category/${category}`),
  
  getStats: (startDate: string, endDate: string) => 
    api.get('/habits/stats', { params: { startDate, endDate } }),
  
  getProgress: (id: string, startDate: string, endDate: string) => 
    api.get<ProgressLog[]>(`/habits/${id}/progress`, { params: { startDate, endDate } }),
  
  create: (habit: Partial<Habit>) => api.post<Habit>('/habits', habit),
  
  update: (id: string, habit: Partial<Habit>) => api.patch<Habit>(`/habits/${id}`, habit),
  
  toggleComplete: (id: string, date: string) => 
    api.patch<{ habit: Habit; log: ProgressLog }>(`/habits/${id}/toggle/${date}`),
  
  delete: (id: string) => api.delete(`/habits/${id}`),
};

// Progress API
export const progressApi = {
  getDaily: (date: string) => api.get<DailyProgress>(`/progress/daily/${date}`),
  
  getWeekly: (startDate: string) => 
    api.get<PeriodProgress>('/progress/weekly', { params: { startDate } }),
  
  getMonthly: (year: number, month: number) => 
    api.get<PeriodProgress>('/progress/monthly', { params: { year, month } }),
  
  getYearly: (year: number) => 
    api.get<PeriodProgress>('/progress/yearly', { params: { year } }),
  
  getHabitLogs: (habitId: string, startDate: string, endDate: string) => 
    api.get<ProgressLog[]>(`/progress/habit/${habitId}/logs`, { params: { startDate, endDate } }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  
  getByName: (name: string) => api.get<Category>(`/categories/name/${name}`),
  
  create: (category: Partial<Category>) => api.post<Category>('/categories', category),
  
  update: (id: string, category: Partial<Category>) => 
    api.patch<Category>(`/categories/${id}`, category),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
  
  seedDefaults: () => api.post<Category[]>('/categories/seed'),
};

export default api;
