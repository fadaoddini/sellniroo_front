// modules/gym/components/tabs/SessionsTab/index.jsx
'use client';

import React from 'react';
import { Clock, Plus, Edit, Trash2, Users as UsersIcon, Sun, Moon } from 'lucide-react';
import styles from './SessionsTab.module.css';

export default function SessionsTab({ sessions, onAdd, onDelete }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3 className={styles.tabTitle}>
            <Clock size={20} />
            مدیریت سانس‌ها
          </h3>
          <span className={styles.tabCount}>{sessions.length} سانس</span>
        </div>
        <button className={styles.addButton} onClick={onAdd}>
          <Plus size={16} />
          سانس جدید
        </button>
      </div>

      <div className={styles.sessionsGrid}>
        {sessions.map((session) => {
          const currentCount = session.current_count || 0;
          const capacity = session.capacity || 1;
          const percent = Math.min((currentCount / capacity) * 100, 100);

          return (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionCardHeader}>
                <div className={styles.sessionCardTitle}>
                  <Clock size={18} />
                  <span>{session.name}</span>
                </div>
                <div className={styles.sessionCardGender}>
                  {session.gender === 'male' ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{session.gender === 'male' ? 'آقایان' : 'بانوان'}</span>
                </div>
              </div>

              <div className={styles.sessionCardBody}>
                <div className={styles.sessionCardTime}>
                  <span>{session.start_time}</span>
                  <span>تا</span>
                  <span>{session.end_time}</span>
                </div>
                <div className={styles.sessionCardCapacity}>
                  <UsersIcon size={14} />
                  <span>{currentCount} از {session.capacity} نفر</span>
                </div>
                <div className={styles.sessionCardProgress}>
                  <div
                    className={styles.sessionCardProgressBar}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className={styles.sessionCardActions}>
                <button
                  className={`${styles.sessionActionBtn} ${styles.sessionActionBtnDelete}`}
                  onClick={() => onDelete(session.id)}
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}