'use client'

import React, { useState } from 'react'
import { Database, LayoutTemplate } from 'lucide-react'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import JobBoardDataPanel from '../adminweb/JobBoardDataPanel'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'
import styles from '../adminweb/AdminWeb.module.css'

const SUBS = [
  { id: 'single', label: 'چیدمان سینگل آگهی', icon: LayoutTemplate },
  { id: 'data', label: 'داده‌های کاریابی', icon: Database },
]

export default function JobDesignEmbed({ moduleMap = {} }) {
  const [sub, setSub] = useState('single')
  return (
    <>
      <div className={portalStyles.tabsRow}>
        {SUBS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              className={`${portalStyles.tabBtn} ${
                sub === t.id ? portalStyles.tabBtnOn : ''
              }`}
              onClick={() => setSub(t.id)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>
      <p className={styles.moduleIntro} style={{ marginTop: '0.75rem' }}>
        طراحی کاریابی داخل همین صفحه است.
      </p>
      {sub === 'single' ? (
        <SiteSkeletonStudio
          moduleMap={moduleMap}
          standalone
          layoutMode="job_single"
        />
      ) : (
        <JobBoardDataPanel />
      )}
    </>
  )
}
