'use client'

import React, { useState } from 'react'
import { FileText, Newspaper } from 'lucide-react'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'
import styles from '../adminweb/AdminWeb.module.css'

const SUBS = [
  { id: 'list', label: 'چیدمان /news', icon: Newspaper },
  { id: 'single', label: 'چیدمان سینگل خبر', icon: FileText },
]

export default function NewsDesignEmbed({ moduleMap = {} }) {
  const [sub, setSub] = useState('list')
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
        طراحی اخبار داخل همین صفحه است.
      </p>
      {sub === 'list' ? (
        <SiteSkeletonStudio
          moduleMap={moduleMap}
          standalone
          layoutMode="news_list"
        />
      ) : (
        <SiteSkeletonStudio
          moduleMap={moduleMap}
          standalone
          layoutMode="news_single"
        />
      )}
    </>
  )
}
