// components/newsAdmin/NewsStats.jsx
'use client'

import React from 'react'
import {
  Newspaper, CheckCircle, FileText, Clock, Archive,
  XCircle, Eye, Heart, TrendingUp, Send
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from '@/styles/modules/NewsManagement.module.css'

const NewsStats = ({ stats, loading }) => {
  const { language } = useLanguage()

  const texts = {
    fa: {
      total: 'کل اخبار',
      published: 'منتشر شده',
      draft: 'پیش‌نویس',
      pending: 'در انتظار',
      scheduled: 'زمان‌بندی',
      archived: 'بایگانی',
      rejected: 'رد شده',
      totalViews: 'بازدید کل',
      totalLikes: 'لایک کل',
    },
    en: {
      total: 'Total',
      published: 'Published',
      draft: 'Draft',
      pending: 'Pending',
      scheduled: 'Scheduled',
      archived: 'Archived',
      rejected: 'Rejected',
      totalViews: 'Total Views',
      totalLikes: 'Total Likes',
    }
  }

  const t = texts[language] || texts.fa

  if (loading || !stats) {
    return (
      <div className={styles.statsGrid}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className={`${styles.statCard} ${styles.skeleton}`} />
        ))}
      </div>
    )
  }

  const items = [
    { key: 'total',      value: stats.total      ?? 0, icon: <Newspaper size={22} />,   color: '#1976d2', bg: '#e3f2fd', label: t.total },
    { key: 'published',  value: stats.published  ?? 0, icon: <CheckCircle size={22} />, color: '#2e7d32', bg: '#e8f5e9', label: t.published },
    { key: 'draft',      value: stats.draft      ?? 0, icon: <FileText size={22} />,    color: '#6b7280', bg: '#f3f4f6', label: t.draft },
    { key: 'pending',    value: stats.pending    ?? 0, icon: <Clock size={22} />,       color: '#e65100', bg: '#fff3e0', label: t.pending },
    { key: 'scheduled',  value: stats.scheduled  ?? 0, icon: <Send size={22} />,        color: '#0277bd', bg: '#e1f5fe', label: t.scheduled },
    { key: 'archived',   value: stats.archived   ?? 0, icon: <Archive size={22} />,     color: '#6a1b9a', bg: '#f3e5f5', label: t.archived },
    { key: 'rejected',   value: stats.rejected   ?? 0, icon: <XCircle size={22} />,     color: '#c62828', bg: '#fce4ec', label: t.rejected },
    { key: 'views',      value: stats.total_views ?? 0, icon: <Eye size={22} />,        color: '#00695c', bg: '#e0f2f1', label: t.totalViews },
    { key: 'likes',      value: stats.total_likes ?? 0, icon: <Heart size={22} />,      color: '#ad1457', bg: '#fce4ec', label: t.totalLikes },
  ]

  return (
    <div className={styles.statsGrid}>
      {items.map((item) => (
        <div key={item.key} className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: item.bg, color: item.color }}>
            {item.icon}
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{item.value}</span>
            <span className={styles.statLabel}>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NewsStats