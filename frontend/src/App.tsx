import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout/Layout';
import { AuthPage } from './components/Auth/AuthPage';
import { Calendar } from './components/Calendar/Calendar';
import { TaskList } from './components/Tasks/TaskList';
import { HabitList } from './components/Habits/HabitList';
import { HabitPerformance } from './components/Habits/HabitPerformance';
import { MonthlyChart } from './components/Statistics/MonthlyChart';
import { ProgressBar } from './components/ui/ProgressBar';
import { useApp } from './context/AppContext';
import styles from './App.module.css';

const DashboardContent: React.FC = () => {
  const { dailyProgress, isLoading } = useApp();

  if (isLoading && !dailyProgress) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Today's Progress Banner */}
      {dailyProgress && (
        <div className={styles.progressBanner}>
          <div className={styles.progressContent}>
            <div className={styles.progressText}>
              <h2>Today's Progress</h2>
              <p>
                {dailyProgress.overall.completed} of {dailyProgress.overall.total} items completed
              </p>
            </div>
            <div className={styles.progressBar}>
              <ProgressBar
                value={dailyProgress.overall.progress}
                size="lg"
                showLabel={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout - Calendar on top, then Tasks and Habits */}
      <div className={styles.mainContent}>
        <Calendar />
        <div className={styles.listsContainer}>
          <TaskList />
          <HabitList />
        </div>
        {/* Habit Performance below habits */}
        <HabitPerformance />
        {/* Monthly Progress Chart */}
        <MonthlyChart />
      </div>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  return (
    <AppProvider>
      <Layout>
        <DashboardContent />
      </Layout>
    </AppProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
