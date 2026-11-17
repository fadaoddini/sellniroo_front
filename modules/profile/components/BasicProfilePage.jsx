'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import moment from 'moment-jalaali'
import { useAuth } from '@/contexts/AuthContext'
import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import styles from '../styles/ProfilePage.module.css'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

const QuizProfilePanel = lazy(() => import('./QuizProfilePanel'))
const SoftAppsProfilePanel = lazy(() => import('./SoftAppsProfilePanel'))
const SchoolProfilePanel = lazy(() => import('@/components/School/SchoolProfilePanel'))
const ShopProfilePanel = lazy(() => import('./ShopProfilePanel'))
const ReboPackageOrdersPanel = lazy(() => import('./ReboPackageOrdersPanel'))
const NewsContributionsPanel = lazy(() => import('./NewsContributionsPanel'))

const BASE_TABS = [{ key: 'account', label: 'حساب', icon: 'user' }]
const NEWS_TAB = { key: 'news', label: 'مطالب من', icon: 'newspaper' }
const REBO_TAB = { key: 'rebo', label: 'سفارش ربو', icon: 'package' }
const SHOP_TAB = { key: 'shop', label: 'فروشگاه', icon: 'shopping' }
const QUIZ_TAB = { key: 'quiz', label: 'آزمون', icon: 'brain' }
const SCHOOL_TAB = { key: 'school', label: 'مدرسه', icon: 'school' }
const SOFTAPPS_TAB = { key: 'softapps', label: 'نرم‌افزارها', icon: 'appwindow' }

function PanelFallback() {
  return (
    <div className={styles.panelFallback} role="status">
      <Loader2 className={styles.spinner} size={22} />
    </div>
  )
}

function BasicProfileInner() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quizOn, setQuizOn] = useState(false)
  const [schoolOn, setSchoolOn] = useState(false)
  const [shopOn, setShopOn] = useState(false)
  const [reboOn, setReboOn] = useState(false)
  const [newsOn, setNewsOn] = useState(false)
  const [softappsOn, setSoftappsOn] = useState(false)

  const tabs = useMemo(() => {
    const list = [...BASE_TABS]
    if (newsOn) list.push(NEWS_TAB)
    if (reboOn) list.push(REBO_TAB)
    if (shopOn) list.push(SHOP_TAB)
    if (quizOn) list.push(QUIZ_TAB)
    if (schoolOn) list.push(SCHOOL_TAB)
    if (softappsOn) list.push(SOFTAPPS_TAB)
    return list
  }, [quizOn, schoolOn, shopOn, reboOn, newsOn, softappsOn])
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    return 'account'
  }, [searchParams, tabKeys])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : '/profile'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      Promise.all([
        isSiteModuleActive(SITE_MODULE_KEYS.QUIZ, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.SCHOOL, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.SHOP, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE, {
          force: true,
        }),
        isSiteModuleActive(SITE_MODULE_KEYS.NEWS, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.SOFTAPPS, { force: true }),
      ]).then(([quiz, school, shop, rebo, news, softapps]) => {
        if (cancelled) return
        setQuizOn(!!quiz)
        setSchoolOn(!!school)
        setShopOn(!!shop)
        setReboOn(!!rebo)
        setNewsOn(!!news)
        setSoftappsOn(!!softapps)
      })
    }
    refresh()
    window.addEventListener('site-modules-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', refresh)
    }
  }, [])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tabKeys.has(activeTab)) setActiveTab('account')
  }, [tabKeys, activeTab])

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

  const joinDate = user?.date_joined
    ? moment(user.date_joined).format('jYYYY/jMM/jDD')
    : '—'

  if (authLoading || !isAuthenticated) {
    return (
      <div className={`${styles.loadingContainer} ${styles.loadingBasic}`} role="status">
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  return (
    <div className={`${styles.profilePage} ${styles.profilePageBasic}`}>
      <div className={`${styles.container} ${styles.containerBasic}`}>
        <ProfileHeader user={user} variant="basic" showJobShortcuts={false} />

        {tabs.length > 1 ? (
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            tone="basic"
          />
        ) : null}

        <div className={styles.tabContent} role="tabpanel" id={`panel-${activeTab}`}>
          {activeTab === 'account' ? (
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
                  <span>عضویت</span>
                  <strong>{joinDate}</strong>
                </li>
              </ul>
            </section>
          ) : null}

          {activeTab === 'rebo' && reboOn ? (
            <Suspense fallback={<PanelFallback />}>
              <ReboPackageOrdersPanel />
            </Suspense>
          ) : null}

          {activeTab === 'shop' && shopOn ? (
            <Suspense fallback={<PanelFallback />}>
              <ShopProfilePanel />
            </Suspense>
          ) : null}

          {activeTab === 'quiz' && quizOn ? (
            <Suspense fallback={<PanelFallback />}>
              <QuizProfilePanel variant="standalone" />
            </Suspense>
          ) : null}

          {activeTab === 'school' && schoolOn ? (
            <Suspense fallback={<PanelFallback />}>
              <SchoolProfilePanel />
            </Suspense>
          ) : null}

          {activeTab === 'news' && newsOn ? (
            <Suspense fallback={<PanelFallback />}>
              <NewsContributionsPanel />
            </Suspense>
          ) : null}

          {activeTab === 'softapps' && softappsOn ? (
            <Suspense fallback={<PanelFallback />}>
              <SoftAppsProfilePanel variant="standalone" />
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function BasicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={`${styles.loadingContainer} ${styles.loadingBasic}`}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <BasicProfileInner />
    </Suspense>
  )
}
