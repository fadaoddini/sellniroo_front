'use client'

import React from 'react'
import { ClipboardList, Clock, PlayCircle, CheckCircle, Users, TrendingUp } from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import styles from '../../../styles/modules/TodoStats.module.css'

const StatsCards = () => {
  const { stats, employees } = useTodo()

  const cards = [
    { 
      title: 'کل وظایف', 
      value: stats.total, 
      icon: ClipboardList, 
      color: '#8b9aff',
      bgColor: 'rgba(139, 154, 255, 0.15)'
    },
    { 
      title: 'در انتظار', 
      value: stats.todo, 
      icon: Clock, 
      color: '#ff9500',
      bgColor: 'rgba(255, 149, 0, 0.15)'
    },
    { 
      title: 'در حال انجام', 
      value: stats.inProgress, 
      icon: PlayCircle, 
      color: '#ffcc00',
      bgColor: 'rgba(255, 204, 0, 0.15)'
    },
    { 
      title: 'در بررسی', 
      value: stats.review, 
      icon: TrendingUp, 
      color: '#af52de',
      bgColor: 'rgba(175, 82, 222, 0.15)'
    },
    { 
      title: 'انجام شده', 
      value: stats.done, 
      icon: CheckCircle, 
      color: '#34c759',
      bgColor: 'rgba(52, 199, 89, 0.15)'
    },
    { 
      title: 'کارمندان', 
      value: employees.length, 
      icon: Users, 
      color: '#8b9aff',
      bgColor: 'rgba(139, 154, 255, 0.15)'
    },
  ]

  return (
    <div className={styles.statsGrid}>
      {cards.map((card, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statHeader}>
            <div 
              className={styles.statIcon}
              style={{ backgroundColor: card.bgColor, color: card.color }}
            >
              <card.icon size={20} />
            </div>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{card.value}</span>
            <span className={styles.statLabel}>{card.title}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards