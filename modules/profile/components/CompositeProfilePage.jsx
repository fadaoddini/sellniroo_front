'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchSiteModules } from '@/services/siteModules'
import { fetchSiteSettings } from '@/services/siteSettings'
import {
  getVisibleProfileSections,
  normalizeProfileLayout,
} from '@/config/profileLayout'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  isSadraAppShell,
  SADRA_CSS_VARS,
} from '@/config/sadraTheme'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import SadraProfileHub from './SadraProfileHub'
import styles from '../styles/ProfilePage.module.css'
import domainStyles from '../styles/DomainProfilePage.module.css'

const ReboPackageOrdersPanel = lazy(() => import('./ReboPackageOrdersPanel'))
const ShopProfilePanel = lazy(() => import('./ShopProfilePanel'))
const QuizProfilePanel = lazy(() => import('./QuizProfilePanel'))
const RepairsProfilePanel = lazy(() => import('./RepairsProfilePanel'))
const BookingProfilePanel = lazy(() => import('./BookingProfilePanel'))
const SchoolProfilePanel = lazy(() =>
  import('@/components/School/SchoolProfilePanel'),
)

const SECTION_TAB = {
  account: { key: 'account', label: 'حساب', icon: 'user' },
  rebo: { key: 'rebo', label: 'سفارش ربو', icon: 'package' },
  cloud: { key: 'cloud', label: 'سرور ابری', icon: 'cloud' },
  shop: { key: 'shop', label: 'فروشگاه', icon: 'shopping' },
  job: { key: 'job', label: 'کاریابی', icon: 'briefcase' },
  booking: { key: 'booking', label: 'نوبت‌دهی', icon: 'calendar' },
  repairs: { key: 'repairs', label: 'تعمیرات', icon: 'wrench' },
  school: { key: 'school', label: 'مدرسه', icon: 'school' },
  quiz: { key: 'quiz', label: 'آزمون', icon: 'brain' },
}

function PanelFallback() {
  return (
    <div className={styles.panelFallback} role="status">
      <Loader2 className={styles.spinner} size={22} />
    </div>
  )
}

function DomainLinkCard({ title, desc, href, cta }) {
  return (
    <section className={domainStyles.hero}>
      <h2>{title}</h2>
      <p>{desc}</p>
      <Link href={href} className={domainStyles.cta}>
        {cta}
        <ArrowLeft size={14} />
      </Link>
    </section>
  )
}

function CompositeInner() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [layout, setLayout] = useState(() => normalizeProfileLayout({}))
  const [ready, setReady] = useState(false)
  const [sadraOn, setSadraOn] = useState(false)

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      try {
        const [settings, mods] = await Promise.all([
          fetchSiteSettings({ force: true }),
          fetchSiteModules({ force: true }),
        ])
        if (cancelled) return
        setLayout(normalizeProfileLayout(settings?.profile_layout))
        const map = mods?.map || {}
        setModuleMap(map)
        setSadraOn(
          !!map[SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE] ||
            isSadraAppShell(settings),
        )
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    refresh()
    const onLayout = () => refresh()
    const onMods = () => refresh()
    window.addEventListener('profile-layout-changed', onLayout)
    window.addEventListener('site-modules-changed', onMods)
    return () => {
      cancelled = true
      window.removeEventListener('profile-layout-changed', onLayout)
      window.removeEventListener('site-modules-changed', onMods)
    }
  }, [])

  const tabs = useMemo(() => {
    const visible = getVisibleProfileSections(layout, moduleMap)
    return visible.map((s) => SECTION_TAB[s.id]).filter(Boolean)
  }, [layout, moduleMap])

  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])
  const defaultTab = tabs[0]?.key || 'account'

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    return defaultTab
  }, [searchParams, tabKeys, defaultTab])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : '/profile'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (ready && !tabKeys.has(activeTab)) setActiveTab(defaultTab)
  }, [ready, tabKeys, activeTab, defaultTab])

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

  if (authLoading || !isAuthenticated || !ready) {
    return (
      <div
        className={`${styles.loadingContainer} ${sadraOn ? styles.loadingSadra : ''}`}
        role="status"
        style={sadraOn ? SADRA_CSS_VARS : undefined}
      >
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  return (
    <div
      className={`${styles.profilePage} ${
        sadraOn ? styles.profilePageSadra : styles.profilePageBasic
      }`}
      style={sadraOn ? SADRA_CSS_VARS : undefined}
    >
      <div className={`${styles.container} ${styles.containerBasic}`}>
        <ProfileHeader
          user={user}
          variant={sadraOn ? 'sadra' : 'basic'}
          showShortcuts={sadraOn}
          welcome={
            sadraOn
              ? 'مرکز صدرا — سفارش قطعه، نوبت سرویس و پیگیری تعمیر'
              : undefined
          }
        />

        {tabs.length > 1 ? (
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            tone={sadraOn ? 'sadra' : 'basic'}
          />
        ) : null}

        <div className={styles.tabContent} role="tabpanel">
          {activeTab === 'account' ? (
            sadraOn ? (
              <SadraProfileHub
                user={user}
                modules={moduleMap}
                onOpenTab={handleTabChange}
              />
            ) : (
              <section className={styles.basicCard}>
                <ul className={styles.basicInfoList}>
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
                      {[user?.first_name, user?.last_name]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </strong>
                  </li>
                </ul>
              </section>
            )
          ) : null}

          {activeTab === 'rebo' ? (
            <Suspense fallback={<PanelFallback />}>
              <ReboPackageOrdersPanel />
            </Suspense>
          ) : null}

          {activeTab === 'cloud' ? (
            <DomainLinkCard
              title="سرور ابری اشتراکی"
              desc="سفارش، شارژ اعتبار و مدیریت وضعیت سرور ابری ربو."
              href="/cloud-server"
              cta="مدیریت سرور ابری"
            />
          ) : null}

          {activeTab === 'shop' ? (
            <Suspense fallback={<PanelFallback />}>
              <ShopProfilePanel />
            </Suspense>
          ) : null}

          {activeTab === 'job' ? (
            <DomainLinkCard
              title="پروفایل کاریابی"
              desc="برای پنل کامل آگهی و رزومه، در چیدمان پروفایل سیستم اصلی را روی «کاریابی» بگذارید."
              href="/jobs"
              cta="مشاهده آگهی‌ها"
            />
          ) : null}

          {activeTab === 'booking' ? (
            <Suspense fallback={<PanelFallback />}>
              <BookingProfilePanel />
            </Suspense>
          ) : null}

          {activeTab === 'repairs' ? (
            <Suspense fallback={<PanelFallback />}>
              <RepairsProfilePanel />
            </Suspense>
          ) : null}

          {activeTab === 'school' ? (
            <Suspense fallback={<PanelFallback />}>
              <SchoolProfilePanel />
            </Suspense>
          ) : null}

          {activeTab === 'quiz' ? (
            <Suspense fallback={<PanelFallback />}>
              <QuizProfilePanel variant="standalone" />
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function CompositeProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <CompositeInner />
    </Suspense>
  )
}
