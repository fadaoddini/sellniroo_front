// src/components/Admin/StatsCards/StatsCards.jsx
'use client'

import React from 'react'
import { Users, Newspaper, FolderTree, Eye } from 'lucide-react'
import styles from './StatsCards.module.css'

const iconMap = {
  Users,
  Newspaper,
  FolderTree,
  Eye
}

const StatsCards = ({ stats }) => {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon]
        const isPositive = stat.change.startsWith('+')
        const isZero = stat.change === '۰'
        
        return (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Icon size={20} className={styles.statIcon} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statTitle}>{stat.title}</span>
              <div className={styles.statValueRow}>
                <span className={styles.statValue}>{stat.value}</span>
                {!isZero && (
                  <span className={`${styles.statChange} ${isPositive ? styles.positive : styles.negative}`}>
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards