import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color,
  showLabel = true,
  label,
  animate = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getColorClass = () => {
    if (color) return '';
    if (percentage >= 80) return styles.success;
    if (percentage >= 50) return styles.warning;
    return styles.default;
  };

  return (
    <div className={styles.wrapper}>
      {(showLabel || label) && (
        <div className={styles.labelRow}>
          {label && <span className={styles.label}>{label}</span>}
          {showLabel && <span className={styles.percentage}>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`${styles.track} ${styles[size]}`}>
        <motion.div
          className={`${styles.fill} ${getColorClass()}`}
          style={{ backgroundColor: color }}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color,
  showLabel = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (percentage >= 80) return 'var(--success)';
    if (percentage >= 50) return 'var(--warning)';
    return 'var(--primary-500)';
  };

  return (
    <div className={styles.circularWrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.circularSvg}>
        <circle
          className={styles.circularTrack}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className={styles.circularFill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor()}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      {showLabel && (
        <div className={styles.circularLabel}>
          <span className={styles.circularValue}>{Math.round(percentage)}</span>
          <span className={styles.circularPercent}>%</span>
        </div>
      )}
    </div>
  );
};

