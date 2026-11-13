'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  Package,
  Ruler,
  ShieldCheck,
  UserRound,
  Warehouse,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import styles from '../styles/ProfilePage.module.css'
import hubStyles from '../styles/InventoryProfileHub.module.css'

const TABS = [
  { key: 'overview', label: 'نمای کلی', icon: 'layout' },
  { key: 'inventory', label: 'انبار', icon: 'package' },
  { key: 'products', label: 'کالا', icon: 'shopping' },
  { key: 'stock', label: 'ورود/خروج', icon: 'clipboard' },
  { key: 'vouchers', label: 'حواله', icon: 'file-text' },
  { key: 'alerts', label: 'هشدار', icon: 'bookmark' },
  { key: 'account', label: 'حساب', icon: 'user' },
]

const HUB_CARDS = [
  {
    key: 'dash',
    href: '/inventory',
    title: 'داشبورد انبار',
    desc: 'نمای کلی موجودی و عملیات',
    icon: LayoutDashboard,
    cta: 'ورود به انبار',
  },
  {
    key: 'warehouses',
    href: '/inventory/warehouses',
    title: 'انبارها',
    desc: 'تعریف و مدیریت انبارهای چندگانه',
    icon: Warehouse,
    cta: 'مدیریت انبار',
  },
  {
    key: 'products',
    href: '/inventory/products',
    title: 'کالا و دسته',
    desc: 'کاتالوگ کالا با کد و واحد اصلی',
    icon: Package,
    cta: 'کالاها',
  },
  {
    key: 'units',
    href: '/inventory/units',
    title: 'واحد سلسله‌مراتبی',
    desc: 'عدد، بسته، کارتن و سطوح تو در تو',
    icon: Ruler,
    cta: 'واحدها',
  },
  {
    key: 'in',
    href: '/inventory/in',
    title: 'ورود کالا',
    desc: 'ثبت موجودی ورودی به انبار',
    icon: ArrowDownToLine,
    cta: 'ورود',
  },
  {
    key: 'out',
    href: '/inventory/out',
    title: 'خروج کالا',
    desc: 'ثبت خروج و کنترل رزرو',
    icon: ArrowUpFromLine,
    cta: 'خروج',
  },
  {
    key: 'vouchers',
    href: '/inventory/vouchers',
    title: 'حواله',
    desc: 'صدور و پیگیری حواله‌ها',
    icon: ClipboardList,
    cta: 'حواله‌ها',
  },
  {
    key: 'alerts',
    href: '/inventory/alerts',
    title: 'هشدار کمبود',
    desc: 'هشدار موجودی زیر حد نصاب',
    icon: Bell,
    cta: 'هشدارها',
  },
  {
    key: 'auth',
    href: '/inventory/authorized-persons',
    title: 'افراد مجاز',
    desc: 'دسترسی نقش‌محور عملیات انبار',
    icon: ShieldCheck,
    cta: 'افراد مجاز',
  },
]

function OverviewHub({ user }) {
  return (
    <div className={hubStyles.hub}>
      <div className={hubStyles.intro}>
        <h2>مرکز انبارداری پیشرفته</h2>
        <p>
          همه امکانات موجودی، ورود/خروج، حواله و هشدار در یک پروفایل خاکستری
          حرفه‌ای.
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
        <Warehouse size={20} strokeWidth={2.2} />
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

function InventoryProfileInner() {
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
          variant="inventory"
          showShortcuts
          welcome="پروفایل جامع انبارداری پیشرفته"
        />

        <ProfileTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
          tone="basic"
        />

        <div className={styles.tabContent} role="tabpanel">
          {activeTab === 'overview' ? <OverviewHub user={user} /> : null}

          {activeTab === 'inventory' ? (
            <ToolRedirect
              href="/inventory"
              title="داشبورد انبارداری"
              desc="نمای کلی انبارها، موجودی و عملیات"
            />
          ) : null}

          {activeTab === 'products' ? (
            <ToolRedirect
              href="/inventory/products"
              title="کالا و دسته‌بندی"
              desc="مدیریت کاتالوگ کالا و واحد اصلی"
            />
          ) : null}

          {activeTab === 'stock' ? (
            <ToolRedirect
              href="/inventory/in"
              title="ورود و خروج کالا"
              desc="ثبت موجودی ورودی و خروجی با واحد سلسله‌مراتبی"
            />
          ) : null}

          {activeTab === 'vouchers' ? (
            <ToolRedirect
              href="/inventory/vouchers"
              title="حواله‌ها"
              desc="صدور، چاپ و پیگیری حواله انبار"
            />
          ) : null}

          {activeTab === 'alerts' ? (
            <ToolRedirect
              href="/inventory/alerts"
              title="هشدار کمبود"
              desc="هشدار موجودی زیر حد نصاب"
            />
          ) : null}

          {activeTab === 'account' ? <AccountPanel user={user} /> : null}
        </div>
      </div>
    </div>
  )
}

export default function InventoryProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <InventoryProfileInner />
    </Suspense>
  )
}
