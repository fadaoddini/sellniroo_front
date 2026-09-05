// src/components/AllBoxItem/components/AdTypeTabs/AdTypeTabs.jsx

'use client'

import React from 'react'
import { Briefcase, Users, LayoutGrid } from 'lucide-react'
import styles from './AdTypeTabs.module.css'

const AdTypeTabs = ({ activeTab, onTabChange, hiringCount, seekingCount }) => {
  const tabs = [
    {
      id: 'all',
      label: 'همه',
      icon: LayoutGrid,
      count: hiringCount + seekingCount
    },
    {
      id: 'hiring',
      label: 'استخدام',
      icon: Briefcase,
      count: hiringCount
    },
    {
      id: 'seeking',
      label: 'کارجو',
      icon: Users,
      count: seekingCount
    }
  ]

  return (
    <div className={styles.tabsContainer} role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-label={`نمایش ${tab.label}`}
          >
            <Icon size={16} className={styles.tabIcon} />
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default AdTypeTabs