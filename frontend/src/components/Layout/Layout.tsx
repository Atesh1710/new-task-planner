import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Modal } from '../ui/Modal';
import { Statistics } from '../Statistics/Statistics';
import { Settings } from '../Settings/Settings';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Header 
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className={styles.main}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={styles.content}
        >
          {children}
        </motion.div>
      </main>

      <Modal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title="Statistics"
        size="lg"
      >
        <Statistics />
      </Modal>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <Settings onClose={() => setIsSettingsOpen(false)} />
      </Modal>

      <footer className={styles.footer}>
        <p>Habit Flow &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

