'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  ShieldOff,
  Home,
  Lock,
  RefreshCw,
  ArrowUpLeft,
  Code2,
  LayoutDashboard,
  LayoutTemplate,
  Boxes,
  Newspaper,
  Briefcase,
  Store,
  Package,
  FolderTree,
} from 'lucide-react'
import {
  normalizeIranMobile,
  OWNER_PHONES,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'
import useShopMode from '@/hooks/useShopMode'
import styles from '@/app/(admin)/adminweb/AdminWeb.module.css'
import portalStyles from './OwnerPortal.module.css'

const NAV_BASE = [
  { href: '/adminweb', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/adminsettings', label: 'صفحه اصلی', icon: LayoutTemplate },
  { href: '/adminmodule', label: 'ماژول‌ها', icon: Boxes },
  { href: '/adminnews', label: 'اخبار', icon: Newspaper },
  { href: '/adminkaryabi', label: 'کاریابی', icon: Briefcase },
  { href: '/adminshop', label: 'طراحی فروشگاه', icon: Store },
  { href: '/adminshops', label: 'فروشگاه‌ها و تسویه', icon: Store },
  { href: '/adminproducts', label: 'محصولات فروشگاه‌ها', icon: Package },
  { href: '/admincategories', label: 'دسته‌بندی محصولات', icon: FolderTree },
]

/**
 * پوستهٔ مشترک پورتال مالک (adminweb / adminnews / …)
 */
export default function OwnerPortalShell({
  brand = 'web',
  brandAccent = 'admin',
  tagline = '',
  wide = false,
  loading = false,
  allowed = false,
  isAuthenticated = false,
  user = null,
  displayName = '',
  deniedTitle = 'دسترسی مجاز نیست',
  deniedMessage = 'این بخش فقط برای مالک و طراح پلتفرم است.\nشمارهٔ حساب فعلی شما در لیست دسترسی قرار ندارد.',
  deniedHomeHref = '/dashboard',
  children,
}) {
  const pathname = usePathname()
  const { multiVendor } = useShopMode()

  const NAV = useMemo(
    () =>
      NAV_BASE.map((item) => {
        if (item.href === '/adminshops') {
          return {
            ...item,
            label: multiVendor ? 'فروشگاه‌ها و تسویه' : 'فروشگاه',
          }
        }
        if (item.href === '/adminproducts') {
          return {
            ...item,
            label: multiVendor ? 'محصولات فروشگاه‌ها' : 'محصولات',
          }
        }
        return item
      }),
    [multiVendor],
  )

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <RefreshCw size={28} className={styles.spin} />
          <p>در حال بررسی دسترسی...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!allowed) {
    return (
      <div className={styles.page}>
        <div className={styles.denied}>
          <div className={styles.deniedIcon}>
            <ShieldOff size={36} />
          </div>
          <h1>{deniedTitle}</h1>
          <p style={{ whiteSpace: 'pre-line' }}>{deniedMessage}</p>
          <div className={styles.deniedMeta}>
            <Lock size={14} />
            <span dir="ltr">{user?.mobile || '—'}</span>
          </div>
          <Link href={deniedHomeHref} className={styles.primaryBtn}>
            <Home size={16} />
            {deniedHomeHref === '/dashboard' ? 'بازگشت به داشبورد' : 'بازگشت به سایت'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={`${styles.shell} ${wide ? styles.shellWide : ''}`}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroBrand}>
            <span className={styles.badge}>
              <Shield size={13} />
              Owner control
            </span>
            <h1 className={styles.brand}>
              {brandAccent}
              <span className={styles.brandAccent}>{brand}</span>
            </h1>
            {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
          </div>
          <div className={styles.heroIdentity}>
            <div className={styles.avatar}>
              <Code2 size={26} />
            </div>
            <div>
              <p className={styles.ownerName}>{OWNER_PROFILE.name}</p>
              <p className={styles.ownerRole}>{displayName}</p>
              <p className={styles.sessionMobile} dir="ltr">
                {user?.mobile}
              </p>
            </div>
            <Link
              href="/"
              className={styles.extBtnGhost}
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <ArrowUpLeft size={14} />
              سایت
            </Link>
          </div>
        </header>

        <nav className={portalStyles.portalNav} aria-label="پورتال ادمین">
          {NAV.map((item) => {
            const Icon = item.icon
            const on =
              pathname === item.href ||
              (item.href !== '/adminweb' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${portalStyles.portalNavItem} ${
                  on ? portalStyles.portalNavOn : ''
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className={portalStyles.portalBody}>{children}</div>

        <p className={styles.pageFoot}>
          طراحی و توسعه ·{' '}
          <a
            href={OWNER_PROFILE.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {OWNER_PROFILE.site}
          </a>
          {normalizeIranMobile(user?.mobile) &&
          OWNER_PHONES.includes(normalizeIranMobile(user?.mobile))
            ? ' · مالک پلتفرم'
            : ''}
        </p>
      </div>
    </div>
  )
}
