'use client'

import React from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/StatsSection.module.css'

const StatsSection = () => {
  const { t } = useLanguage()
  const homeData = t?.home || {}
  const statsData = homeData?.stats || {}

  const stats = [
    { value: '۵۰۰+', label: statsData.projects || 'پروژه موفق' },
    { value: '۱۰۰۰+', label: statsData.clients || 'مشتری راضی' },
    { value: '۹۸%', label: statsData.satisfaction || 'رضایت مشتری' },
    { value: '۲۴/۷', label: statsData.support || 'پشتیبانی فنی' },
  ]

  return (
    <section className={styles.stats}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <span className={styles.statNumber}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
