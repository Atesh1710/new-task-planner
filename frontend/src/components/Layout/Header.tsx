import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Settings, BarChart3, LogOut, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenStats, onOpenSettings }) => {
  const { theme, toggleTheme, dailyProgress } = useApp();
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <motion.div 
          className={styles.brand}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
              <path
                d="M9 16L13 20L23 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#e63946" />
                  <stop offset="1" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Habit Flow</h1>
            <p className={styles.tagline}>Track, build, achieve</p>
          </div>
        </motion.div>

        <motion.div 
          className={styles.quickStats}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {dailyProgress && (
            <>
              <div className={styles.quickStat}>
                <span className={styles.quickValue}>{dailyProgress.overall.progress}%</span>
                <span className={styles.quickLabel}>Today</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.quickStat}>
                <span className={styles.quickValue}>
                  {dailyProgress.tasks.completed}/{dailyProgress.tasks.total}
                </span>
                <span className={styles.quickLabel}>Tasks</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.quickStat}>
                <span className={styles.quickValue}>
                  {dailyProgress.habits.completed}/{dailyProgress.habits.total}
                </span>
                <span className={styles.quickLabel}>Habits</span>
              </div>
            </>
          )}
        </motion.div>

        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <User size={16} />
              </div>
              <span className={styles.userName}>{user.name}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onOpenStats}>
            <BarChart3 size={20} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings size={20} />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={20} />
          </Button>
        </motion.div>
      </div>
    </header>
  );
};
