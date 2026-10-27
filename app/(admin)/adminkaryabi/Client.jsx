// app/(admin)/adminkaryabi — چیدمان و دادهٔ سیستم کاریابی
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Briefcase,
  LayoutTemplate,
  FileText,
  Database,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import JobBoardDataPanel from '../adminweb/JobBoardDataPanel'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const TABS = [
  { id: 'single', label: 'چیدمان سینگل آگهی', icon: LayoutTemplate },
  { id: 'data', label: 'داده‌های کاریابی', icon: Database },
]

const JOB_LINKS = [
  { href: '/jobs-manage', label: 'مدیریت آگهی‌ها', desc: 'لیست', icon: Briefcase },
  { href: '/job-single', label: 'تنظیمات سینگل', desc: 'اجزای آگهی', icon: FileText },
  { href: '/post-job', label: 'ثبت آگهی', desc: 'فرم', icon: Briefcase },
]

export default function AdminKaryabiPage() {
  const gate = useOwnerGate('/adminkaryabi')
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [modulesReady, setModulesReady] = useState(false)
  const initialTab =
    searchParams?.get('tab') === 'data' ? 'data' : 'single'
  const [tab, setTab] = useState(initialTab)
  const jobsKey = SITE_MODULE_KEYS.JOB_BOARD
  const jobsKnown = Object.prototype.hasOwnProperty.call(moduleMap, jobsKey)
  const jobsOn = !modulesReady || !jobsKnown || !!moduleMap[jobsKey]

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { map } = await fetchSiteModules({ force: true })
        if (!cancelled) {
          setModuleMap(map || {})
          setModulesReady(true)
        }
      } catch {
        if (!cancelled) {
          setModuleMap({})
          setModulesReady(true)
        }
      }
    })()
    const onChange = () => {
      clearSiteModulesCache()
      fetchSiteModules({ force: true })
        .then(({ map }) => {
          setModuleMap(map || {})
          setModulesReady(true)
        })
        .catch(() => {})
    }
    window.addEventListener('site-modules-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onChange)
    }
  }, [gate.allowed])

  return (
    <OwnerPortalShell
      brand="karyabi"
      brandAccent="admin"
      tagline="چیدمان سینگل آگهی و داده‌های کاریابی"
      wide
      {...gate}
    >
      {gate.allowed && modulesReady && !jobsOn ? (
        <div className={styles.section}>
          <p className={styles.moduleIntro}>
            ماژول سیستم کاریابی خاموش است — چیدمان را می‌توانید بسازید؛ برای نمایش از{' '}
            <Link href="/adminmodule">adminmodule</Link> روشن کنید.
          </p>
        </div>
      ) : null}

      {gate.allowed ? (
        <>
          <div className={portalStyles.tabsRow}>
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${portalStyles.tabBtn} ${
                    tab === t.id ? portalStyles.tabBtnOn : ''
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>

          {tab === 'single' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="job_single"
            />
          ) : null}
          {tab === 'data' ? <JobBoardDataPanel /> : null}
        </>
      ) : null}

      <section className={portalStyles.sectionBlock} style={{ marginTop: '1.25rem' }}>
        <h2 className={portalStyles.sectionTitle}>ابزارهای کاریابی</h2>
        <div className={styles.linkGrid}>
          {JOB_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={styles.linkCard}>
                <span className={styles.linkIcon}>
                  <Icon size={20} />
                </span>
                <span className={styles.linkText}>
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </OwnerPortalShell>
  )
}
