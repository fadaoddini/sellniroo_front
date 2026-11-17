'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
  lazy,
} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import {
  ArrowLeft,
  Boxes,
  Calculator,
  Cloud,
  Headphones,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { fetchSiteSettings } from '@/services/siteSettings'
import { fetchSiteModules } from '@/services/siteModules'
import {
  isProfileSectionEnabled,
  normalizeProfileLayout,
} from '@/config/profileLayout'
import { normalizeReboPricing } from '@/config/reboPricing'
import { readReboPackageCart } from '@/utils/reboPackageCart'
import { readReboOrderHistory } from '@/utils/reboOrderHistory'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import ReboOverviewPanel from './rebo/ReboOverviewPanel'
import ReboPackageOrdersPanel from './ReboPackageOrdersPanel'
import ReboTrackPanel from './rebo/ReboTrackPanel'
import ReboSupportPanel from './rebo/ReboSupportPanel'
import styles from '../styles/ProfilePage.module.css'
import hubStyles from '../styles/ReboHub.module.css'

const ReboCloudPanel = lazy(() => import('./rebo/ReboCloudPanel'))
const SoftAppsProfilePanel = lazy(() => import('./SoftAppsProfilePanel'))

const BASE_TABS = [
  { key: 'overview', label: 'نمای کلی', icon: 'layout' },
  { key: 'rebo', label: 'سفارش بسته', icon: 'package' },
  { key: 'track', label: 'پیگیری', icon: 'search' },
  { key: 'cloud', label: 'سرور ابری', icon: 'cloud' },
  { key: 'support', label: 'مشاوره', icon: 'headphones' },
  { key: 'account', label: 'حساب', icon: 'user' },
]

const SOFTAPPS_TAB = {
  key: 'softapps',
  label: 'نرم‌افزارها',
  icon: 'appwindow',
}

const REBO_SHORTCUTS = [
  { href: '/#rebo-cost', label: 'بسته‌ها', icon: Calculator },
  { href: '/profile?tab=rebo', label: 'سفارش', icon: Boxes },
  { href: '/profile?tab=cloud', label: 'سرور', icon: Cloud },
  { href: '/profile?tab=support', label: 'مشاوره', icon: Headphones, primary: true },
]

function PanelFallback() {
  return (
    <div className={hubStyles.panelLoading} role="status">
      <Loader2 size={22} className={hubStyles.spin} />
    </div>
  )
}

function RoleBadge() {
  return (
    <div className={hubStyles.roleBadge}>
      <span>مشتری ربو</span>
    </div>
  )
}

function ReboProfileInner() {
  const { user, isAuthenticated, loading: authLoading, getAuthHeaders } =
    useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cart, setCart] = useState(() => readReboPackageCart())
  const [orders, setOrders] = useState(() => readReboOrderHistory())
  const [cloudSub, setCloudSub] = useState(null)
  const [cloudCfg, setCloudCfg] = useState(null)
  const [pricing, setPricing] = useState(null)
  const [site, setSite] = useState(null)
  const [softappsOn, setSoftappsOn] = useState(false)

  const tabs = useMemo(() => {
    const list = [...BASE_TABS]
    if (softappsOn) {
      const accountIdx = list.findIndex((t) => t.key === 'account')
      if (accountIdx >= 0) list.splice(accountIdx, 0, SOFTAPPS_TAB)
      else list.push(SOFTAPPS_TAB)
    }
    return list
  }, [softappsOn])

  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    const c = readReboPackageCart()
    const cartCount = (c.packages?.length || 0) + (c.items?.length || 0)
    return cartCount > 0 ? 'rebo' : 'overview'
  }, [searchParams, tabKeys])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : '/profile?tab=overview'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tabKeys.has(activeTab)) setActiveTab('overview')
  }, [tabKeys, activeTab])

  useEffect(() => {
    const refreshLocal = () => {
      setCart(readReboPackageCart())
      setOrders(readReboOrderHistory())
    }
    refreshLocal()
    window.addEventListener('rebo-package-cart-changed', refreshLocal)
    window.addEventListener('rebo-package-orders-changed', refreshLocal)
    window.addEventListener('storage', refreshLocal)
    return () => {
      window.removeEventListener('rebo-package-cart-changed', refreshLocal)
      window.removeEventListener('rebo-package-orders-changed', refreshLocal)
      window.removeEventListener('storage', refreshLocal)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      try {
        const [settings, mods] = await Promise.all([
          fetchSiteSettings({ force: true }),
          fetchSiteModules({ force: true }),
        ])
        if (cancelled) return
        setSite(settings || null)
        setPricing(normalizeReboPricing(settings?.rebo_pricing))
        const layout = normalizeProfileLayout(settings?.profile_layout)
        setSoftappsOn(
          isProfileSectionEnabled(layout, 'softapps', mods?.map || {}),
        )
      } catch {
        /* ignore */
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

  useEffect(() => {
    let cancelled = false
    axios
      .get(Config.endpoints.cloudServer.config())
      .then((res) => {
        if (!cancelled) setCloudCfg(res.data?.data || null)
      })
      .catch(() => {})

    if (!isAuthenticated) return undefined
    axios
      .get(Config.endpoints.cloudServer.my(), { headers: getAuthHeaders() })
      .then((res) => {
        if (!cancelled) setCloudSub(res.data?.data || null)
      })
      .catch(() => {
        if (!cancelled) setCloudSub(null)
      })
    return () => {
      cancelled = true
    }
  }, [getAuthHeaders, isAuthenticated])

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
      <div className={`${styles.loadingContainer} ${hubStyles.loading}`} role="status">
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  return (
    <div className={`${styles.profilePage} ${hubStyles.page}`}>
      <div className={`${styles.container} ${hubStyles.container}`}>
        <div className={hubStyles.headerChrome}>
          <ProfileHeader
            user={user}
            variant="rebo"
            showShortcuts
            shortcuts={REBO_SHORTCUTS}
            roleChip={<RoleBadge />}
            footer={
              <div className={hubStyles.headerTabs}>
                <ProfileTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={handleTabChange}
                  tone="rebo"
                />
              </div>
            }
          />
        </div>

        <div
          className={`${styles.tabContent} ${hubStyles.tabFlush}`}
          role="tabpanel"
          id={`panel-${activeTab}`}
        >
          {activeTab === 'overview' ? (
            <ReboOverviewPanel
              cart={cart}
              orders={orders}
              cloudSub={cloudSub}
              cloudCfg={cloudCfg}
              pricing={pricing}
              onNavigate={handleTabChange}
            />
          ) : null}

          {activeTab === 'rebo' ? <ReboPackageOrdersPanel /> : null}

          {activeTab === 'track' ? (
            <ReboTrackPanel
              initialNumber={searchParams.get('request') || ''}
            />
          ) : null}

          {activeTab === 'cloud' ? (
            <Suspense fallback={<PanelFallback />}>
              <ReboCloudPanel onSubscriptionChange={setCloudSub} />
            </Suspense>
          ) : null}

          {activeTab === 'support' ? (
            <ReboSupportPanel site={site} onNavigate={handleTabChange} />
          ) : null}

          {activeTab === 'softapps' && softappsOn ? (
            <Suspense fallback={<PanelFallback />}>
              <SoftAppsProfilePanel variant="standalone" />
            </Suspense>
          ) : null}

          {activeTab === 'account' ? (
            <section className={hubStyles.account} dir="rtl" lang="fa">
              <div className={hubStyles.accountGrid}>
                <article className={hubStyles.panelCard}>
                  <h3>اطلاعات حساب</h3>
                  <ul className={hubStyles.infoList}>
                    <li>
                      <span>نام</span>
                      <strong>
                        {[user?.first_name, user?.last_name]
                          .filter(Boolean)
                          .join(' ') ||
                          user?.full_name ||
                          '—'}
                      </strong>
                    </li>
                    <li>
                      <span>موبایل</span>
                      <strong dir="ltr">{user?.mobile || '—'}</strong>
                    </li>
                    <li>
                      <span>ایمیل</span>
                      <strong dir="ltr">{user?.email || '—'}</strong>
                    </li>
                  </ul>
                  <p className={hubStyles.accountHint}>
                    سفارش بسته‌ها با همین موبایل ثبت می‌شود تا تیم ربو بتواند
                    پیگیری کند.
                  </p>
                </article>
                <article className={hubStyles.panelCard}>
                  <h3>وضعیت خدمات ربو</h3>
                  <ul className={hubStyles.infoList}>
                    <li>
                      <span>سبد فعلی</span>
                      <strong>
                        {(
                          (cart?.packages?.length || 0) +
                          (cart?.items?.length || 0)
                        ).toLocaleString('fa-IR')}{' '}
                        مورد
                      </strong>
                    </li>
                    <li>
                      <span>سفارش‌های ذخیره‌شده</span>
                      <strong>{orders.length.toLocaleString('fa-IR')}</strong>
                    </li>
                    <li>
                      <span>سرور ابری</span>
                      <strong>
                        {cloudSub
                          ? cloudSub.status_display || cloudSub.status
                          : 'بدون اشتراک'}
                      </strong>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className={hubStyles.linkBtn}
                    onClick={() => handleTabChange('overview')}
                  >
                    بازگشت به نمای کلی
                    <ArrowLeft size={13} />
                  </button>
                </article>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function ReboProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={`${styles.loadingContainer} ${hubStyles.loading}`}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <ReboProfileInner />
    </Suspense>
  )
}
