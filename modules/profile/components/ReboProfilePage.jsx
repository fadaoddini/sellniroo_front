'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
  lazy,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { fetchSiteSettings } from '@/services/siteSettings'
import { readReboPackageCart } from '@/utils/reboPackageCart'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import ReboOrdersDeskPanel from './rebo/ReboOrdersDeskPanel'
import ReboPackageOrdersPanel from './ReboPackageOrdersPanel'
import ReboSupportPanel from './rebo/ReboSupportPanel'
import styles from '../styles/ProfilePage.module.css'
import hubStyles from '../styles/ReboHub.module.css'

const ReboCloudPanel = lazy(() => import('./rebo/ReboCloudPanel'))

const BASE_TABS = [
  { key: 'desk', label: 'میزکار', icon: 'layout' },
  { key: 'cart', label: 'سبد', icon: 'package' },
  { key: 'cloud', label: 'سرور', icon: 'cloud' },
  { key: 'support', label: 'پشتیبانی', icon: 'headphones' },
  { key: 'account', label: 'حساب', icon: 'user' },
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
  const [cloudSub, setCloudSub] = useState(null)
  const [site, setSite] = useState(null)

  const tabs = BASE_TABS
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    const legacy = {
      overview: 'desk',
      rebo: 'cart',
      track: 'desk',
      orders: 'desk',
      softapps: 'desk',
    }
    const mapped = legacy[q] || q
    if (mapped && tabKeys.has(mapped)) return mapped
    const c = readReboPackageCart()
    const cartCount = (c.packages?.length || 0) + (c.items?.length || 0)
    return cartCount > 0 ? 'cart' : 'desk'
  }, [searchParams, tabKeys])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : '/profile?tab=desk'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tabKeys.has(activeTab)) setActiveTab('desk')
  }, [tabKeys, activeTab])

  useEffect(() => {
    const refreshLocal = () => setCart(readReboPackageCart())
    refreshLocal()
    window.addEventListener('rebo-package-cart-changed', refreshLocal)
    window.addEventListener('storage', refreshLocal)
    return () => {
      window.removeEventListener('rebo-package-cart-changed', refreshLocal)
      window.removeEventListener('storage', refreshLocal)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadSite = () => {
      fetchSiteSettings({ force: true })
        .then((settings) => {
          if (!cancelled) setSite(settings || null)
        })
        .catch(() => {})
    }
    loadSite()
    const onPricing = () => loadSite()
    window.addEventListener('rebo-pricing-changed', onPricing)
    return () => {
      cancelled = true
      window.removeEventListener('rebo-pricing-changed', onPricing)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let cancelled = false
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

  const cartCount =
    (cart?.packages?.length || 0) + (cart?.items?.length || 0)

  return (
    <div className={`${styles.profilePage} ${hubStyles.page} ${hubStyles.pageCompact}`}>
      <div className={`${styles.container} ${hubStyles.container}`}>
        <div className={hubStyles.headerChrome}>
          <ProfileHeader
            user={user}
            variant="rebo"
            showShortcuts={false}
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
          {activeTab === 'desk' ? (
            <ReboOrdersDeskPanel onNavigate={handleTabChange} />
          ) : null}

          {activeTab === 'cart' ? <ReboPackageOrdersPanel /> : null}

          {activeTab === 'cloud' ? (
            <Suspense fallback={<PanelFallback />}>
              <ReboCloudPanel onSubscriptionChange={setCloudSub} />
            </Suspense>
          ) : null}

          {activeTab === 'support' ? (
            <ReboSupportPanel site={site} onNavigate={handleTabChange} />
          ) : null}

          {activeTab === 'account' ? (
            <section className={`${hubStyles.account} ${hubStyles.compactPanel}`} dir="rtl" lang="fa">
              <header className={hubStyles.deskHeroCompact}>
                <div>
                  <p className={hubStyles.eyebrow}>حساب کاربری</p>
                  <h2>مشخصات و دسترسی سریع</h2>
                </div>
              </header>
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
                    قراردادها و اقساط با همین موبایل به حساب شما وصل می‌شود.
                  </p>
                </article>
                <article className={hubStyles.panelCard}>
                  <h3>دسترسی سریع</h3>
                  <ul className={hubStyles.infoList}>
                    <li>
                      <span>سبد فعلی</span>
                      <strong>
                        {cartCount.toLocaleString('fa-IR')} مورد
                      </strong>
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
                    onClick={() => handleTabChange('desk')}
                  >
                    رفتن به میزکار سفارش‌ها
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
