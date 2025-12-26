import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import styles from './Settings.module.css';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { categories, createCategory, updateCategory, deleteCategory, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<'categories' | 'appearance'>('categories');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');

  const COLORS = [
    '#e63946', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
  ];

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory({ name: newCategoryName, color: newCategoryColor });
    setNewCategoryName('');
    setNewCategoryColor('#6366f1');
  };

  const handleEditCategory = async (id: string) => {
    if (!editingName.trim()) return;
    await updateCategory(id, { name: editingName, color: editingColor });
    setEditingId(null);
  };

  const startEditing = (cat: any) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
    setEditingColor(cat.color);
  };

  return (
    <div className={styles.settings}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'appearance' ? styles.active : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
      </div>

      {activeTab === 'categories' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.section}
        >
          <h4 className={styles.sectionTitle}>Manage Categories</h4>
          <p className={styles.sectionDesc}>Add, edit, or remove categories for your tasks and habits.</p>

          <div className={styles.addCategory}>
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className={styles.colorPicker}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`${styles.colorBtn} ${newCategoryColor === color ? styles.active : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategoryColor(color)}
                />
              ))}
            </div>
            <Button size="sm" onClick={handleAddCategory} icon={<Plus size={16} />}>
              Add
            </Button>
          </div>

          <div className={styles.categoryList}>
            {categories.map((cat) => (
              <div key={cat._id} className={styles.categoryItem}>
                {editingId === cat._id ? (
                  <div className={styles.editingRow}>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    <div className={styles.colorPicker}>
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          className={`${styles.colorBtn} ${styles.small} ${
                            editingColor === color ? styles.active : ''
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditingColor(color)}
                        />
                      ))}
                    </div>
                    <Button size="sm" onClick={() => handleEditCategory(cat._id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className={styles.categoryInfo}>
                      <span
                        className={styles.categoryDot}
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className={styles.categoryName}>{cat.name}</span>
                    </div>
                    <div className={styles.categoryActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => startEditing(cat)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => deleteCategory(cat._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.section}
        >
          <h4 className={styles.sectionTitle}>Theme</h4>
          <p className={styles.sectionDesc}>Choose your preferred color scheme.</p>

          <div className={styles.themeOptions}>
            <button
              className={`${styles.themeBtn} ${!theme.isDarkMode ? styles.active : ''}`}
              onClick={() => theme.isDarkMode && toggleTheme()}
            >
              <div className={styles.themePreview} data-theme="light">
                <div className={styles.previewHeader} />
                <div className={styles.previewContent}>
                  <div className={styles.previewCard} />
                  <div className={styles.previewCard} />
                </div>
              </div>
              <span>Light</span>
            </button>

            <button
              className={`${styles.themeBtn} ${theme.isDarkMode ? styles.active : ''}`}
              onClick={() => !theme.isDarkMode && toggleTheme()}
            >
              <div className={styles.themePreview} data-theme="dark">
                <div className={styles.previewHeader} />
                <div className={styles.previewContent}>
                  <div className={styles.previewCard} />
                  <div className={styles.previewCard} />
                </div>
              </div>
              <span>Dark</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

