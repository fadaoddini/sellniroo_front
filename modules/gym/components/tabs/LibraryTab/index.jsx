// modules/gym/components/tabs/LibraryTab/index.jsx
'use client';

import React, { useState } from 'react';
import { BookOpen, Dumbbell, Apple } from 'lucide-react';
import styles from './LibraryTab.module.css';

import ExercisesLibraryPanel from './ExercisesLibraryPanel';
import FoodsLibraryPanel from './modals/FoodsLibraryPanel';

export default function LibraryTab({ api }) {
  const [activePanel, setActivePanel] = useState('exercises');

  return (
    <div className={styles.tabContent}>
      {/* هدر */}
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3 className={styles.tabTitle}>
            <BookOpen size={20} />
            کتابخانه مرکزی
          </h3>
          <span className={styles.tabSubtitle}>
            حرکات تمرینی و غذاهای استاندارد — یک بار تعریف کن، همه‌جا استفاده کن
          </span>
        </div>
      </div>

      {/* تب‌های داخلی */}
      <div className={styles.panelsNav}>
        <button
          className={`${styles.panelTab} ${activePanel === 'exercises' ? styles.panelTabActive : ''}`}
          onClick={() => setActivePanel('exercises')}
        >
          <Dumbbell size={16} />
          حرکات تمرینی
        </button>
        <button
          className={`${styles.panelTab} ${activePanel === 'foods' ? styles.panelTabActive : ''}`}
          onClick={() => setActivePanel('foods')}
        >
          <Apple size={16} />
          غذاها
        </button>
      </div>

      {/* محتوا */}
      <div className={styles.panelContent}>
        {activePanel === 'exercises' && <ExercisesLibraryPanel api={api} />}
        {activePanel === 'foods' && <FoodsLibraryPanel api={api} />}
      </div>
    </div>
  );
}