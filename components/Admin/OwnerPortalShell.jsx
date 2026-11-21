'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
  Cloud,
  CreditCard,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Settings2,
  Store,
  Rocket,
} from 'lucide-react'
import {
  normalizeIranMobile,
  OWNER_PHONES,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'
import { REBO_SYSTEM_LINKS } from '@/components/Admin/reboSystemNav'
import { SERVER_SYSTEM_LINKS } from '@/components/Admin/serverSystemNav'
import { TEMPLATE_SYSTEM_LINKS } from '@/components/Admin/templateSystemNav'
import { SHOP_DESIGN_LINKS } from '@/components/Admin/shopDesignNav'
import { DEPLOY_SYSTEM_LINKS } from '@/components/Admin/deploySystemNav'
import styles from '@/app/(admin)/adminweb/AdminWeb.module.css'
import portalStyles from './OwnerPortal.module.css'

const NAV_SECTIONS = [
  {
    id: 'core',
    items: [
      { href: '/adminweb', label: 'داشبورد', icon: LayoutDashboard },
      { href: '/adminmodule', label: 'ماژول‌ها', icon: Boxes },
    ],
  },
  {
    id: 'templatesystem',
    label: 'طراحی قالب',
    href: '/templatesystem',
    icon: LayoutTemplate,
    children: TEMPLATE_SYSTEM_LINKS.map(({ href, label, icon }) => ({
      href,
      label,
      icon,
    })),
  },
  {
    id: 'shopdesign',
    label: 'طراحی فروشگاه',
    href: '/shopdesign',
    icon: Store,
    children: SHOP_DESIGN_LINKS.map(({ href, label, icon }) => ({
      href,
      label,
      icon,
    })),
  },
  {
    id: 'deploysystem',
    label: 'دیپلوی',
    href: '/deploysystem',
    icon: Rocket,
    children: DEPLOY_SYSTEM_LINKS.map(({ href, label, icon }) => ({
      href,
      label,
      icon,
    })),
  },
  {
    id: 'rebosystem',
    label: 'سیستم ربو',
    href: '/rebosystem',
    icon: Layers,
    children: REBO_SYSTEM_LINKS.map(({ href, label, icon }) => ({
      href,
      label,
      icon,
    })),
  },
  {
    id: 'paymentsystem',
    label: 'تنظیمات پرداخت',
    href: '/paymentsystem',
    icon: CreditCard,
    children: [
      { href: '/payment-manage', label: 'ماژول پرداخت', icon: Settings2 },
    ],
  },
  {
    id: 'serversystem',
    label: 'سرور',
    href: '/serversystem',
    icon: Cloud,
    children: SERVER_SYSTEM_LINKS.map(({ href, label, icon }) => ({
      href,
      label,
      icon,
    })),
  },
]

function splitHref(href) {
  const raw = String(href || '')
  const q = raw.indexOf('?')
  if (q < 0) return { path: raw, query: '' }
  return { path: raw.slice(0, q), query: raw.slice(q + 1) }
}

function pathMatches(pathname, href) {
  if (!pathname || !href) return false
  const { path } = splitHref(href)
  if (pathname === path) return true
  if (path === '/adminweb') return false
  return pathname.startsWith(path)
}

function hrefIsActive(pathname, searchParams, href) {
  if (!pathname || !href) return false
  const { path, query } = splitHref(href)
  if (pathname !== path) return false
  if (!query) {
    if (path === '/adminmodule') {
      const tab = searchParams?.get('tab') || 'modules'
      return tab !== 'sites' && tab !== 'git'
    }
    if (path === '/cloud-manage') {
      const tab = searchParams?.get('tab') || 'settings'
      return tab === 'settings'
    }
    if (path === '/rebo-pricing') {
      const tab = searchParams?.get('tab') || 'packages'
      return tab !== 'ops'
    }
    if (path === '/adminsettings') {
      const tab = searchParams?.get('tab') || 'home'
      return tab === 'home'
    }
    return true
  }
  const needed = new URLSearchParams(query)
  for (const [key, value] of needed.entries()) {
    if ((searchParams?.get(key) || '') !== value) return false
  }
  return true
}

function isSectionPath(pathname, searchParams, section) {
  if (!pathname || !section) return false
  if (section.href && hrefIsActive(pathname, searchParams, section.href)) {
    return true
  }
  return (section.children || []).some((item) =>
    hrefIsActive(pathname, searchParams, item.href),
  )
}

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
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const sections = NAV_SECTIONS

  const flatNav = useMemo(() => {
    const rows = []
    sections.forEach((section) => {
      if (section.href) {
        rows.push({ href: section.href, label: section.label })
      }
      ;(section.items || []).forEach((item) => rows.push(item))
      ;(section.children || []).forEach((item) => rows.push(item))
    })
    return rows
  }, [sections])

  const pageTitle =
    title ||
    flatNav.find((item) => hrefIsActive(pathname, searchParams, item.href))
      ?.label ||
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

  const closeSidebar = () => setSidebarOpen(false)

  const navItems = (
    <>
      {sections.map((section) => {
        if (section.children?.length) {
          const SectionIcon = section.icon || Layers
          const sectionOn = isSectionPath(pathname, searchParams, section)
          const hubOn = hrefIsActive(pathname, searchParams, section.href)
          return (
            <div key={section.id} className={portalStyles.sideGroup}>
              {!sidebarCollapsed ? (
                <p className={portalStyles.sideGroupLabel}>{section.label}</p>
              ) : null}
              <Link
                href={section.href}
                className={`${portalStyles.sideItem} ${portalStyles.sideItemParent} ${
                  hubOn ? portalStyles.sideItemOn : sectionOn ? portalStyles.sideItemSoft : ''
                }`}
                onClick={closeSidebar}
                title={section.label}
              >
                <SectionIcon size={18} strokeWidth={1.9} />
                {!sidebarCollapsed ? <span>{section.label}</span> : null}
              </Link>
              {!sidebarCollapsed ? (
                <div className={portalStyles.sideChildren}>
                  {section.children.map((item) => {
                    const Icon = item.icon
                    const on = hrefIsActive(pathname, searchParams, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${portalStyles.sideItem} ${portalStyles.sideChild} ${
                          on ? portalStyles.sideItemOn : ''
                        }`}
                        onClick={closeSidebar}
                        title={item.label}
                      >
                        <Icon size={16} strokeWidth={1.9} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        }

        return (
          <div key={section.id} className={portalStyles.sideGroup}>
            {(section.items || []).map((item) => {
              const Icon = item.icon
              const on = hrefIsActive(pathname, searchParams, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${portalStyles.sideItem} ${
                    on ? portalStyles.sideItemOn : ''
                  }`}
                  onClick={closeSidebar}
                  title={item.label}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </Link>
              )
            })}
          </div>
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
