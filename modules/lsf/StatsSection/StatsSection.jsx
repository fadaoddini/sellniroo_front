// modules/lsf/StatsSection/StatsSection.jsx
'use client';

import styles from './StatsSection.module.css';
import { useLsf } from '../context/LsfContext';

export default function StatsSection() {
  const { stats } = useLsf();

  return (
    <section className={styles.stats}>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statsItem}>
            <div className={styles.statsValue}>{stat.value}</div>
            <div className={styles.statsLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}