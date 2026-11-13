'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import styles from '../styles/ProfilePage.module.css'
import domainStyles from '../styles/DomainProfilePage.module.css'

function PanelFallback() {
  return (
    <div className={styles.panelFallback} role="status">
      <Loader2 className={styles.spinner} size={22} />
    </div>
  )
}

/**
 * اسکلت مشترک پروفایل اختصاصی سیستم‌های غیرکاریابی/غیرفروشگاهی
 */
export default function DomainProfileShell({
  variant,
  tone,
  pageClass,
  defaultTab,
  tabs,
  accountExtra = null,
  panels = {},
  hero,
}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    return defaultTab
  }, [searchParams, tabKeys, defaultTab])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : `/profile?tab=${defaultTab}`
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams, defaultTab])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tabKeys.has(activeTab)) setActiveTab(defaultTab)
  }, [tabKeys, activeTab, defaultTab])

  const handleTabChange = useCallback(
    (key) => {
      if (!tabKeys.has(key)) return
      setActiveTab(key)
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', key)
      router.replace(`/profile?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, tabKeys],
  )

  if (authLoading || !isAuthenticated) {
    return (
      <div className={`${styles.loadingContainer} ${pageClass || ''}`} role="status">
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  const Panel = panels[activeTab]

  return (
    <div className={`${styles.profilePage} ${pageClass || ''} ${domainStyles.page}`}>
      <div className={`${styles.container} ${domainStyles.container}`}>
        <ProfileHeader user={user} variant={variant} showShortcuts />

        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          tone={tone}
        />

        <div className={styles.tabContent} role="tabpanel" id={`panel-${activeTab}`}>
          {activeTab === 'account' ? (
            <section className={domainStyles.accountCard}>
              <ul className={domainStyles.infoList}>
                <li>
                  <span>موبایل</span>
                  <strong dir="ltr">{user?.mobile || '—'}</strong>
                </li>
                <li>
                  <span>ایمیل</span>
                  <strong dir="ltr">{user?.email || '—'}</strong>
                </li>
                <li>
                  <span>نام</span>
                  <strong>
                    {[user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
                      '—'}
                  </strong>
                </li>
              </ul>
              {accountExtra}
            </section>
          ) : null}

          {activeTab !== 'account' && hero && activeTab === defaultTab && !Panel ? (
            <section className={domainStyles.hero}>
              <h2>{hero.title}</h2>
              <p>{hero.desc}</p>
              {hero.href ? (
                <Link href={hero.href} className={domainStyles.cta}>
                  {hero.cta}
                  <ArrowLeft size={14} />
                </Link>
              ) : null}
            </section>
          ) : null}

          {Panel ? (
            <Suspense fallback={<PanelFallback />}>
              <Panel />
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function DomainProfilePage(props) {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <DomainProfileShell {...props} />
    </Suspense>
  )
}
