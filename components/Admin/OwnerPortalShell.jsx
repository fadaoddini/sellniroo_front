'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  ShieldOff,
  Home,
  Lock,
  RefreshCw,
  ArrowUpLeft,
  LayoutDashboard,
  LayoutTemplate,
  Boxes,
  Calculator,
  Cloud,
  Store,
  Package,
  FolderTree,
  BookOpen,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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
  { href: '/adminsettings', label: 'طراحی قالب', icon: LayoutTemplate },
  { href: '/adminmodule', label: 'ماژول‌ها', icon: Boxes },
  { href: '/rebolearn', label: 'آموزش‌های ربو', icon: BookOpen },
  { href: '/rebo-pricing', label: 'قیمت ربو', icon: Calculator },
  { href: '/rebo-manage', label: 'مدیریت ربو', icon: Boxes },
  { href: '/cloud-manage', label: 'سرور ابری', icon: Cloud },
  { href: '/adminshops', label: 'فروشگاه‌ها و تسویه', icon: Store },
  { href: '/adminproducts', label: 'محصولات فروشگاه‌ها', icon: Package },
  { href: '/admincategories', label: 'دسته‌بندی محصولات', icon: FolderTree },
]

/**
 * پوستهٔ مشترک پورتال مالک
 * — هدر تمام‌عرض + سایدبار + نوار افقی اختیاری هر صفحه
 *
 * pageNav?: [{ id, label, icon?, href?, onClick?, active? }]
 */
export default function OwnerPortalShell({
  brand = 'web',
  brandAccent = 'admin',
  tagline = '',
  title = '',
  wide = false,
  pageNav = null,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  const pageTitle =
    title ||
    NAV.find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/adminweb' && pathname?.startsWith(item.href)),
    )?.label ||
    `${brandAccent}${brand}`

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

  const navItems = (
    <>
      {NAV.map((item) => {
        const Icon = item.icon
        const on =
          pathname === item.href ||
          (item.href !== '/adminweb' && pathname?.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${portalStyles.sideItem} ${
              on ? portalStyles.sideItemOn : ''
            }`}
            onClick={() => setSidebarOpen(false)}
            title={item.label}
          >
            <Icon size={18} strokeWidth={1.9} />
            {!sidebarCollapsed ? <span>{item.label}</span> : null}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className={portalStyles.app} dir="rtl">
      <header className={portalStyles.topBar}>
        <div className={portalStyles.topBarInner}>
          <div className={portalStyles.topBarStart}>
            <button
              type="button"
              className={portalStyles.iconBtn}
              aria-label="منو"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              type="button"
              className={`${portalStyles.iconBtn} ${portalStyles.collapseBtn}`}
              aria-label={sidebarCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
            <Link href="/adminweb" className={portalStyles.brandLink}>
              <span className={portalStyles.brandMark}>
                <Shield size={14} />
              </span>
              <span className={portalStyles.brandText}>
                <strong>
                  {brandAccent}
                  <em>{brand}</em>
                </strong>
                {tagline ? <small>{tagline}</small> : null}
              </span>
            </Link>
          </div>

          <div className={portalStyles.topBarCenter}>
            <h1 className={portalStyles.pageHeading}>{pageTitle}</h1>
          </div>

          <div className={portalStyles.topBarEnd}>
            <div className={portalStyles.userChip}>
              <span className={portalStyles.userAvatar} aria-hidden>
                {(OWNER_PROFILE.name || 'R').slice(0, 1)}
              </span>
              <span className={portalStyles.userMeta}>
                <strong>{OWNER_PROFILE.name}</strong>
                <small dir="ltr">{user?.mobile || displayName || '—'}</small>
              </span>
            </div>
            <Link href="/" className={portalStyles.siteBtn}>
              <ArrowUpLeft size={14} />
              سایت
            </Link>
          </div>
        </div>
      </header>

      <div
        className={`${portalStyles.frame} ${
          sidebarCollapsed ? portalStyles.frameCollapsed : ''
        } ${wide ? portalStyles.frameWide : ''}`}
      >
        <aside
          className={`${portalStyles.sidebar} ${
            sidebarOpen ? portalStyles.sidebarOpen : ''
          }`}
          aria-label="منوی اصلی ادمین"
        >
          <div className={portalStyles.sideScroll}>{navItems}</div>
          <div className={portalStyles.sideFoot}>
            <span>مالک سیستم</span>
            {!sidebarCollapsed ? (
              <small>{OWNER_PROFILE.brandFa || 'Rebo'}</small>
            ) : null}
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            className={portalStyles.backdrop}
            aria-label="بستن منو"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className={portalStyles.main}>
          {Array.isArray(pageNav) && pageNav.length ? (
            <nav className={portalStyles.pageNav} aria-label="منوی این صفحه">
              {pageNav.map((item) => {
                const Icon = item.icon
                const key = item.id || item.href || item.label
                const active = !!item.active
                const cls = `${portalStyles.pageNavItem} ${
                  active ? portalStyles.pageNavItemOn : ''
                }`
                if (item.href) {
                  return (
                    <Link key={key} href={item.href} className={cls}>
                      {Icon ? <Icon size={15} strokeWidth={2} /> : null}
                      {item.label}
                    </Link>
                  )
                }
                return (
                  <button
                    key={key}
                    type="button"
                    className={cls}
                    onClick={item.onClick}
                  >
                    {Icon ? <Icon size={15} strokeWidth={2} /> : null}
                    {item.label}
                  </button>
                )
              })}
            </nav>
          ) : null}

          <div className={portalStyles.content}>{children}</div>

          <p className={portalStyles.foot}>
            طراح {OWNER_PROFILE.name} ·{' '}
            <a
              href={OWNER_PROFILE.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {OWNER_PROFILE.site}
            </a>
            {' · '}
            {OWNER_PROFILE.engineLine}
            {normalizeIranMobile(user?.mobile) &&
            OWNER_PHONES.includes(normalizeIranMobile(user?.mobile))
              ? ' · مالک پلتفرم'
              : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
