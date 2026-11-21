// app/(admin)/adminmodule — مدیریت ماژول‌ها و درون‌ریزی قالب‌های اختصاصی
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Boxes, Calculator, GitBranch, Server, Sparkles } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getServerSystemPageNav } from '@/components/Admin/serverSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import AdminWebModules from '../adminweb/AdminWebModules'
import GitManagerPanel from '../adminweb/GitManagerPanel'
import InstalledSitesPanel from '../adminweb/InstalledSitesPanel'
import TemplateImportPanel from '../adminweb/TemplateImportPanel'
import styles from '../adminweb/AdminWeb.module.css'

const TABS = [
  { id: 'modules', label: 'ماژول‌ها', icon: Boxes },
  { id: 'templates', label: 'موتور و بسته‌ها', icon: Sparkles },
  { id: 'sites', label: 'سایت‌های سرور', icon: Server },
  { id: 'git', label: 'گیت', icon: GitBranch },
  { id: 'pricing', label: 'قیمت‌گذاری ویجت‌ها', icon: Calculator, href: '/rebo-pricing' },
]

const SERVER_TABS = new Set(['sites', 'git'])

function resolveTab(raw) {
  if (raw === 'templates') return 'templates'
  if (raw === 'sites') return 'sites'
  if (raw === 'git') return 'git'
  return 'modules'
}

export default function AdminModuleClient() {
  const gate = useOwnerGate('/adminmodule')
  const router = useRouter()
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

  const pageNav = useMemo(() => {
    if (SERVER_TABS.has(tab)) {
      return getServerSystemPageNav(`/adminmodule?tab=${tab}`)
    }
    return TABS.filter((t) => !SERVER_TABS.has(t.id)).map((t) => ({
      id: t.id,
      label: t.label,
      icon: t.icon,
      href: t.href,
      active: !t.href && tab === t.id,
      onClick: t.href
        ? undefined
        : () => {
            setTab(t.id)
            router.replace(`/adminmodule?tab=${t.id}`)
          },
    }))
  }, [tab, router])

  const shellTitle = SERVER_TABS.has(tab)
    ? tab === 'git'
      ? 'گیت'
      : 'سایت‌های سرور'
    : 'مدیریت ماژول‌ها'

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline={
        SERVER_TABS.has(tab)
          ? 'مدیریت زیرساخت سرور'
          : 'ماژول‌ها، موتور ربو و بسته‌ها'
      }
      title={shellTitle}
      wide
      pageNav={pageNav}
      {...gate}
    >
      {tab === 'modules' ? (
        <>
          <div className={`${styles.statsStrip} ${styles.statsStripPair}`}>
            <div className={`${styles.statCard} ${styles.statForest}`}>
              <span className={styles.statValue}>{moduleStats.active}</span>
              <span className={styles.statLabel}>ماژول فعال</span>
            </div>
            <div className={`${styles.statCard} ${styles.statOlive}`}>
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
      ) : tab === 'templates' && gate.allowed ? (
        <TemplateImportPanel />
      ) : tab === 'sites' && gate.allowed ? (
        <InstalledSitesPanel />
      ) : tab === 'git' && gate.allowed ? (
        <GitManagerPanel />
      ) : null}
    </OwnerPortalShell>
  )
}
