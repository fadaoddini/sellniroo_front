// app/(admin)/adminmodule — مدیریت ماژول‌ها و درون‌ریزی قالب‌های اختصاصی
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Boxes, Calculator, Sparkles } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import AdminWebModules from '../adminweb/AdminWebModules'
import TemplateImportPanel from '../adminweb/TemplateImportPanel'
import styles from '../adminweb/AdminWeb.module.css'

const TABS = [
  { id: 'modules', label: 'ماژول‌ها', icon: Boxes },
  { id: 'templates', label: 'موتور و بسته‌ها', icon: Sparkles },
]

function resolveTab(raw) {
  return raw === 'templates' ? 'templates' : 'modules'
}

export default function AdminModuleClient() {
  const gate = useOwnerGate('/adminmodule')
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(() => resolveTab(searchParams?.get('tab')))
  const [moduleStats, setModuleStats] = useState({
    total: 0,
    active: 0,
    groups: 0,
  })
  const [selectedModuleKey, setSelectedModuleKey] = useState(null)

  useEffect(() => {
    setTab(resolveTab(searchParams?.get('tab')))
  }, [searchParams])

  const onStatsChange = useCallback((s) => {
    if (s && typeof s === 'object') setModuleStats(s)
  }, [])

  return (
    <OwnerPortalShell
      brand="module"
      brandAccent="admin"
      tagline="ماژول‌ها، موتور ربو و قیمت‌گذاری ویجت‌ها"
      wide
      {...gate}
    >
      <div className={styles.awTabs} role="tablist" aria-label="بخش‌های مدیریت ماژول">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              className={`${styles.awTab} ${on ? styles.awTabOn : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </button>
          )
        })}
        <Link
          href="/rebo-pricing"
          className={styles.awTab}
          style={{ textDecoration: 'none' }}
        >
          <Calculator size={14} strokeWidth={2} />
          قیمت‌گذاری ویجت‌ها
        </Link>
      </div>

      {tab === 'modules' ? (
        <>
          <div className={styles.statsStrip}>
            <div className={`${styles.statCard} ${styles.statOk}`}>
              <span className={styles.statValue}>{moduleStats.active}</span>
              <span className={styles.statLabel}>ماژول فعال</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{moduleStats.total}</span>
              <span className={styles.statLabel}>ماژول اصلی</span>
            </div>
          </div>

          {gate.allowed ? (
            <AdminWebModules
              onStatsChange={onStatsChange}
              selectedKey={selectedModuleKey}
              onSelect={setSelectedModuleKey}
            />
          ) : null}
        </>
      ) : gate.allowed ? (
        <TemplateImportPanel />
      ) : null}
    </OwnerPortalShell>
  )
}
