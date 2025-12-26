import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Check, Trash2, Edit2, Flag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import styles from './TaskList.module.css';

export const TaskList: React.FC = () => {
  const { dailyProgress, toggleTaskComplete, deleteTask, selectedDate } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasks = dailyProgress?.tasks.items || [];

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getPriorityIcon = (priority: number) => {
    const colors = ['var(--neutral-400)', 'var(--warning)', 'var(--error)'];
    return <Flag size={14} fill={colors[priority - 1]} color={colors[priority - 1]} />;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.priority - a.priority;
  });

  return (
    <div className={styles.taskList}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Tasks</h3>
          <p className={styles.subtitle}>
            {format(selectedDate, 'MMMM d, yyyy')} • {dailyProgress?.tasks.completed || 0}/{dailyProgress?.tasks.total || 0} completed
          </p>
        </div>
        <Button size="sm" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Add Task
        </Button>
      </div>

      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.empty}
            >
              <p>No tasks for this day</p>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                Create your first task
              </Button>
            </motion.div>
          ) : (
            sortedTasks.map((task, index) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
              >
                <button
                  className={styles.checkbox}
                  onClick={() => toggleTaskComplete(task._id)}
                  style={{ borderColor: task.color }}
                >
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={styles.checkmark}
                      style={{ backgroundColor: task.color }}
                    >
                      <Check size={12} color="white" />
                    </motion.div>
                  )}
                </button>

                <div className={styles.taskContent}>
                  <div className={styles.taskHeader}>
                    <span className={styles.taskName}>{task.name}</span>
                    {task.priority > 1 && getPriorityIcon(task.priority)}
                  </div>
                  {task.description && (
                    <p className={styles.taskDescription}>{task.description}</p>
                  )}
                  <div className={styles.taskMeta}>
                    <span
                      className={styles.category}
                      style={{ backgroundColor: `${task.color}20`, color: task.color }}
                    >
                      {task.category}
                    </span>
                  </div>
                </div>

                <div className={styles.taskActions}>
                  <button className={styles.actionBtn} onClick={() => handleEdit(task)}>
                    <Edit2 size={16} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => deleteTask(task._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <TaskForm task={editingTask} onClose={handleClose} />
      </Modal>
    </div>
  );
};

