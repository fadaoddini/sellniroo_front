'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import orderApi from '@/services/orderApi'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import ShopProfilePanel from './ShopProfilePanel'
import styles from '../styles/ProfilePage.module.css'
import shopStyles from '../styles/ShopProfilePage.module.css'

const QuizProfilePanel = lazy(() => import('./QuizProfilePanel'))
const SchoolProfilePanel = lazy(() => import('@/components/School/SchoolProfilePanel'))
const ReboPackageOrdersPanel = lazy(() => import('./ReboPackageOrdersPanel'))

const BASE_TABS = [
  { key: 'orders', label: 'سفارش‌ها', icon: 'package' },
  { key: 'addresses', label: 'آدرس‌ها', icon: 'pin' },
  { key: 'account', label: 'حساب', icon: 'user' },
]
const QUIZ_TAB = { key: 'quiz', label: 'آزمون', icon: 'brain' }
const SCHOOL_TAB = { key: 'school', label: 'مدرسه', icon: 'school' }
const REBO_TAB = { key: 'rebo', label: 'سفارش ربو', icon: 'package' }

function PanelFallback() {
  return (
    <div className={styles.panelFallback} role="status">
      <Loader2 className={styles.spinner} size={22} />
    </div>
  )
}

function ShopProfileInner() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quizOn, setQuizOn] = useState(false)
  const [schoolOn, setSchoolOn] = useState(false)
  const [reboOn, setReboOn] = useState(false)
  const [wallet, setWallet] = useState(null)

  const tabs = useMemo(() => {
    const list = [...BASE_TABS]
    if (quizOn) list.push(QUIZ_TAB)
    if (schoolOn) list.push(SCHOOL_TAB)
    if (reboOn) list.push(REBO_TAB)
    return list
  }, [quizOn, schoolOn, reboOn])
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q === 'shop') return 'orders'
    if (q && tabKeys.has(q)) return q
    return 'orders'
  }, [searchParams, tabKeys])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : '/profile?tab=orders'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      Promise.all([
        isSiteModuleActive(SITE_MODULE_KEYS.QUIZ, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.SCHOOL, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE, {
          force: true,
        }),
      ]).then(([quiz, school, rebo]) => {
        if (cancelled) return
        setQuizOn(!!quiz)
        setSchoolOn(!!school)
        setReboOn(!!rebo)
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
    if (!tabKeys.has(activeTab)) setActiveTab('orders')
  }, [tabKeys, activeTab])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let cancelled = false
    orderApi
      .getWalletBalance()
      .then((data) => {
        if (!cancelled) setWallet(data)
      })
      .catch(() => {
        if (!cancelled) setWallet(null)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

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

  const walletLabel = useMemo(() => {
    const bal = Number(wallet?.balance ?? wallet?.amount ?? NaN)
    if (!Number.isFinite(bal)) return null
    return `${bal.toLocaleString('fa-IR')} تومان`
  }, [wallet])

  if (authLoading || !isAuthenticated) {
    return (
      <div className={`${styles.loadingContainer} ${shopStyles.loading}`} role="status">
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  return (
    <div className={`${styles.profilePage} ${shopStyles.page}`}>
      <div className={`${styles.container} ${shopStyles.container}`}>
        <ProfileHeader user={user} variant="shop" showShortcuts />

        {walletLabel ? (
          <div className={shopStyles.walletBar}>
            <span>موجودی کیف پول</span>
            <strong>{walletLabel}</strong>
          </div>
        ) : null}

        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          tone="shop"
        />

        <div className={styles.tabContent} role="tabpanel" id={`panel-${activeTab}`}>
          {activeTab === 'orders' || activeTab === 'addresses' ? (
            <ShopProfilePanel
              section={activeTab}
              showOwnerLinks={activeTab === 'orders'}
            />
          ) : null}

          {activeTab === 'account' ? (
            <section className={shopStyles.accountCard}>
              <ul className={shopStyles.infoList}>
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
            </section>
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

          {activeTab === 'rebo' && reboOn ? (
            <Suspense fallback={<PanelFallback />}>
              <ReboPackageOrdersPanel />
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function ShopProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={`${styles.loadingContainer} ${shopStyles.loading}`}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <ShopProfileInner />
    </Suspense>
  )
}
