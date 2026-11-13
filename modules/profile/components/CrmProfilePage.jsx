'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  FileText,
  HandCoins,
  LayoutDashboard,
  Loader2,
  Monitor,
  Target,
  UserRound,
  Radar,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import styles from '../styles/ProfilePage.module.css'
import hubStyles from '../styles/CrmProfileHub.module.css'

const TABS = [
  { key: 'overview', label: 'نمای کلی', icon: 'layout' },
  { key: 'sale', label: 'فروش', icon: 'briefcase' },
  { key: 'analytics', label: 'آنالیتیکس', icon: 'clipboard' },
  { key: 'monitor', label: 'مانیتور', icon: 'search' },
  { key: 'invoice', label: 'فاکتور', icon: 'file-text' },
  { key: 'activity', label: 'فعالیت', icon: 'send' },
  { key: 'account', label: 'حساب', icon: 'user' },
]

const HUB_CARDS = [
  {
    key: 'leads',
    href: '/sale',
    title: 'لید و پیگیری',
    desc: 'ثبت لید، پیگیری، واگذاری و آرشیو',
    icon: Target,
    cta: 'ورود به فروش',
  },
  {
    key: 'analytics',
    href: '/sale/analytics',
    title: 'آنالیتیکس تیم',
    desc: 'عملکرد فروشندگان و نرخ تبدیل',
    icon: BarChart3,
    cta: 'مشاهده گزارش',
  },
  {
    key: 'monitor',
    href: '/sale/monitor',
    title: 'مانیتور مسیر',
    desc: 'وضعیت لحظه‌ای لیدها و یادآورها',
    icon: Monitor,
    cta: 'باز کردن مانیتور',
  },
  {
    key: 'rasad',
    href: '/rasad',
    title: 'رصد استانی',
    desc: 'رتبه‌بندی علاقه جستجو در استان‌ها با کلمه کلیدی',
    icon: Radar,
    cta: 'باز کردن رصد',
  },
  {
    key: 'invoice',
    href: '/sale/invoice',
    title: 'پیش‌فاکتور',
    desc: 'طراحی و صدور فاکتور فروش',
    icon: FileText,
    cta: 'ساخت فاکتور',
  },
  {
    key: 'activity',
    href: '/sale/activity',
    title: 'گزارش فعالیت',
    desc: 'تاریخچه پیگیری‌ها و اقدامات تیم',
    icon: Activity,
    cta: 'مشاهده فعالیت',
  },
  {
    key: 'dashboard',
    href: '/dashboard',
    title: 'داشبورد',
    desc: 'دسترسی نقش‌محور و آمار کلی',
    icon: LayoutDashboard,
    cta: 'رفتن به داشبورد',
  },
]

function PanelFallback() {
  return (
    <div className={hubStyles.panelLoading} role="status">
      <Loader2 size={22} className={hubStyles.spin} />
    </div>
  )
}

function OverviewHub({ user }) {
  return (
    <div className={hubStyles.hub}>
      <div className={hubStyles.intro}>
        <h2>مرکز CRM فروش</h2>
        <p>
          همه امکانات بازاریابی و فروش در یک پروفایل — از لید تا قرارداد و
          گزارش تیم.
        </p>
      </div>

      <div className={hubStyles.grid}>
        {HUB_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.key} href={card.href} className={hubStyles.card}>
              <span className={hubStyles.iconWrap} aria-hidden>
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <strong>{card.title}</strong>
              <span>{card.desc}</span>
              <span className={hubStyles.cardCta}>
                {card.cta}
                <ArrowLeft size={13} />
              </span>
            </Link>
          )
        })}
      </div>

      <section className={hubStyles.accountBlock}>
        <h3>اطلاعات حساب</h3>
        <ul className={hubStyles.infoList}>
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
    </div>
  )
}

function ToolRedirect({ href, title, desc }) {
  return (
    <section className={hubStyles.redirect}>
      <span className={hubStyles.iconWrap} aria-hidden>
        <HandCoins size={20} strokeWidth={2.2} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <Link href={href} className={hubStyles.redirectCta}>
        ادامه
        <ArrowLeft size={14} />
      </Link>
    </section>
  )
}

function AccountPanel({ user }) {
  return (
    <section className={hubStyles.accountBlock}>
      <h3>
        <UserRound size={16} aria-hidden /> حساب کاربری
      </h3>
      <ul className={hubStyles.infoList}>
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
  )
}

function CrmProfileInner() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabKeys = useMemo(() => new Set(TABS.map((t) => t.key)), [])

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    return 'overview'
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
      <div className={styles.loadingContainer} role="status">
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  return (
    <div className={`${styles.profilePage} ${hubStyles.page}`}>
      <div className={`${styles.container} ${styles.containerBasic}`}>
        <ProfileHeader
          user={user}
          variant="crm"
          showShortcuts
          welcome="پروفایل جامع CRM — فروش و بازاریابی"
        />

        <ProfileTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
          tone="basic"
        />

        <div className={styles.tabContent} role="tabpanel">
          {activeTab === 'overview' ? <OverviewHub user={user} /> : null}

          {activeTab === 'sale' ? (
            <ToolRedirect
              href="/sale"
              title="ماژول فروش و بازاریابی"
              desc="مدیریت لید، پیگیری، واگذاری و آرشیو مشتریان"
            />
          ) : null}

          {activeTab === 'analytics' ? (
            <ToolRedirect
              href="/sale/analytics"
              title="آنالیتیکس فروش"
              desc="گزارش عملکرد تیم و نرخ تبدیل"
            />
          ) : null}

          {activeTab === 'monitor' ? (
            <ToolRedirect
              href="/sale/monitor"
              title="مانیتور فروش"
              desc="نمای لحظه‌ای مسیر لیدها و یادآور پیگیری"
            />
          ) : null}

          {activeTab === 'invoice' ? (
            <ToolRedirect
              href="/sale/invoice"
              title="طراح پیش‌فاکتور"
              desc="صدور و مدیریت اسناد فروش"
            />
          ) : null}

          {activeTab === 'activity' ? (
            <ToolRedirect
              href="/sale/activity"
              title="گزارش فعالیت"
              desc="تاریخچه پیگیری‌ها و اقدامات"
            />
          ) : null}

          {activeTab === 'account' ? <AccountPanel user={user} /> : null}
        </div>
      </div>
    </div>
  )
}

export default function CrmProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <CrmProfileInner />
    </Suspense>
  )
}
