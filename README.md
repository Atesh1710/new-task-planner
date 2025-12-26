# Habit Flow - Task and Habit Planner

A modern, full-stack Task and Habit Planner Web Application with real-time calendar views, progress tracking, streak counters, and beautiful data visualizations.

## Features

### Frontend (React)
- **Real-Time Calendar**: Navigate between day, week, month, and year views
- **Task Management**: Create, edit, delete tasks with categories and colors
- **Habit Tracking**: Track daily habits with streak counters
- **Progress Visualization**: 
  - Daily progress bar
  - Weekly/monthly charts (area charts, pie charts)
  - Habit performance statistics
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Theme**: Toggle between themes
- **Category Management**: Customize categories with colors

### Backend (NestJS)
- **RESTful API**: Full CRUD operations for tasks, habits, and categories
- **MongoDB Integration**: Scalable document database
- **Streak Calculation**: Automatic streak tracking
- **Progress Statistics**: Daily, weekly, monthly, yearly aggregations
- **Database Indexing**: Optimized queries for performance

## Tech Stack

### Frontend
- React 18 with TypeScript
- Framer Motion (animations)
- Recharts (data visualization)
- date-fns (date manipulation)
- Lucide React (icons)
- Axios (API calls)
- CSS Modules

### Backend
- NestJS with TypeScript
- MongoDB with Mongoose ODM
- class-validator (DTO validation)
- @nestjs/config (environment configuration)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `env.config` to `.env`
   - Update MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/habitTracker
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/api`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/date/:date` - Get tasks by date
- `GET /api/tasks/range?startDate=&endDate=` - Get tasks in date range
- `GET /api/tasks/stats?startDate=&endDate=` - Get task statistics
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete task

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/active` - Get active habits
- `GET /api/habits/:id` - Get habit by ID
- `GET /api/habits/stats?startDate=&endDate=` - Get habit statistics
- `POST /api/habits` - Create habit
- `PATCH /api/habits/:id` - Update habit
- `PATCH /api/habits/:id/toggle/:date` - Toggle habit completion for date
- `DELETE /api/habits/:id` - Delete habit

### Progress
- `GET /api/progress/daily/:date` - Get daily progress
- `GET /api/progress/weekly?startDate=` - Get weekly progress
- `GET /api/progress/monthly?year=&month=` - Get monthly progress
- `GET /api/progress/yearly?year=` - Get yearly progress

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `POST /api/categories/seed` - Seed default categories
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Database Schema

### Task
```javascript
{
  name: String,
  description: String,
  category: String,
  color: String,
  date: Date,
  completed: Boolean,
  completedAt: Date,
  priority: Number, // 1: Low, 2: Medium, 3: High
  isRecurring: Boolean,
  recurringPattern: String // 'daily', 'weekly', 'monthly'
}
```

### Habit
```javascript
{
  name: String,
  description: String,
  category: String,
  color: String,
  isActive: Boolean,
  frequency: String, // 'daily', 'weekly', 'monthly'
  daysOfWeek: [Number],
  currentStreak: Number,
  longestStreak: Number,
  totalCompletions: Number,
  lastCompletedDate: Date,
  startDate: Date,
  targetCompletions: Number,
  reminderTime: String
}
```

### ProgressLog
```javascript
{
  habitId: ObjectId,
  date: Date,
  completed: Boolean,
  completedAt: Date,
  notes: String,
  streakAtCompletion: Number
}
```

### Category
```javascript
{
  name: String,
  color: String,
  icon: String,
  order: Number
}
```

## Environment Variables

### Backend (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/habitTracker
DB_POOL_SIZE=10

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## License

MIT

