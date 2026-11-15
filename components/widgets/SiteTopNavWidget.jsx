// components/widgets/SiteTopNavWidget.jsx — ویجت منو (بالا + نوار پایین موبایل)
'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Menu, X, LayoutDashboard, PlusCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchHeaderMenu,
  DEFAULT_HEADER_MENU,
  filterHeaderMenuByModules,
  sortHeaderMenuItems,
} from '@/services/headerMenu'
import { fetchSiteModules } from '@/services/siteModules'
import {
  fetchCorporateAppearance,
  DEFAULT_CORPORATE_APPEARANCE,
} from '@/services/corporateAppearance'
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'
import {
  DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS,
  getSiteTopNavVisibilityFlags,
  normalizeSiteTopNavSettings,
  siteTopNavCssVars,
} from '@/config/siteTopNavWidgetSettings'
import { resolveHeaderMenuIcon } from '@/config/headerMenuIcons'
import AppBottomNavWidget from '@/components/widgets/AppBottomNavWidget'
import BreakingNews from '@/components/common/breakingnews/BreakingNews'
import styles from './SiteTopNavWidget.module.css'

const PROFILE_LEGACY_COLORS = new Set(
  [
    '#fdba74',
    '#ea580c',
    '#f4ae52',
    '#d4621a',
    '#fb923c',
    '#fb9700',
    '#0b3a5c',
    '#135a87',
    '#006bcf',
  ].map((c) => c.toLowerCase()),
)

function scrubProfileColor(value, fallback) {
  const v = String(value ?? '').trim()
  if (!v || PROFILE_LEGACY_COLORS.has(v.toLowerCase())) return fallback
  return v
}

function resolveSiteTopNavProfileChrome(raw = {}) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const hasProfileConfig =
    r.profile_mode != null ||
    r.show_date != null ||
    r.guest_visible != null ||
    r.guest_label != null ||
    r.color_date != null ||
    r.color_profile_text != null
  if (!hasProfileConfig) return null
  const mode = String(r.profile_mode || 'avatar')
  const showDate = r.show_date !== false
  const showGuest = r.guest_visible !== false
  if (!showDate && mode === 'hidden' && !showGuest) return null
  const text = scrubProfileColor(
    r.color_profile_text || r.color_text,
    '#ffffff',
  )
  const icon = scrubProfileColor(r.color_icon || r.color_hover, '#ffffff')
  const accent = scrubProfileColor(r.color_accent, '#10b981')
  return {
    show_ticker: false,
    show_menu_items: false,
    show_hamburger: false,
    show_menu_icons: false,
    show_cart: false,
    sticky: false,
    shadow: false,
    bar_full_bleed: false,
    border_width: 0,
    height: 40,
    padding_top: 0,
    padding_bottom: 0,
    padding_left: 0,
    padding_right: 0,
    margin_top: 0,
    margin_bottom: 0,
    margin_left: 0,
    margin_right: 0,
    color_bg: 'transparent',
    color_border: 'transparent',
    color_text: text,
    color_link: icon,
    color_accent: accent,
    color_menu_hover_bg: scrubProfileColor(r.color_menu_hover_bg, '#046c4e'),
    color_menu_hover_text: scrubProfileColor(r.color_menu_hover_text, '#a7f3d0'),
    color_menu_icon: icon,
    color_drawer_bg: scrubProfileColor(r.color_drawer_bg, '#023c2c'),
    show_date: showDate,
    date_font_size: r.date_font_size || 11,
    date_font_weight: r.date_font_weight || 400,
    profile_mode: mode || 'avatar',
    avatar_shape: r.avatar_shape === 'rounded' ? 'rounded' : 'circle',
    guest_visible: showGuest,
    guest_label: r.guest_label || 'ورود',
    guest_icon: r.guest_icon || 'LogIn',
    guest_href: r.guest_href || '/login',
    color_date: scrubProfileColor(r.color_date || r.color_icon, '#a7f3d0'),
    color_profile_bg: r.color_profile_bg || 'transparent',
    color_profile_text: text,
    color_avatar_border: scrubProfileColor(
      r.color_avatar_border || r.color_accent,
      '#10b981',
    ),
    color_btn_bg: scrubProfileColor(r.color_btn_bg || r.color_accent, '#046c4e'),
    color_btn_text: scrubProfileColor(r.color_btn_text, '#ffffff'),
    show_on_mobile: true,
    show_on_desktop: true,
  }
}

function resolveIcon(name) {
  return resolveHeaderMenuIcon(name)
}

/** هم‌تراز با نوار پایین شرکتی (max-width: 1023px) */
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  })
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return isMobile
}

function matchPath(pathname, href) {
  if (!href) return false
  const raw = String(href).trim()
  const hashIdx = raw.indexOf('#')
  // لینک‌هایی مثل /#contact نباید هم‌زمان با «خانه» فعال شوند
  if (hashIdx >= 0) {
    const before = raw.slice(0, hashIdx) || '/'
    const hash = raw.slice(hashIdx)
    if (before === '/' || before === '') {
      if (typeof window === 'undefined') return false
      return pathname === '/' && window.location.hash === hash
    }
  }
  const path = raw.split('?')[0].split('#')[0] || '/'
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}

/** لینک ورود — بعد از لاگین نباید CTA دیده شود */
function isLoginCtaHref(href) {
  const path = String(href || '').trim().split('?')[0].split('#')[0]
  return path === '/login' || path.endsWith('/login')
}

function LogoMark({ src, name, height }) {
  if (!src) {
    return <span className={styles.logoFallback}>{name}</span>
  }
  if (typeof src === 'string' && src.startsWith('/images/')) {
    return (
      <Image
        src={src}
        alt={name}
        width={Math.round(height * 3.6)}
        height={height}
        priority
        className={styles.logoImg}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      height={height}
      className={styles.logoImg}
    />
  )
}

const SiteTopNavWidget = memo(function SiteTopNavWidget({
  settings: rawSettings,
}) {
  const raw = rawSettings || DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS
  const isMobile = useIsMobile(768)
  const viewport = isMobile ? 'mobile' : 'desktop'
  const settings = normalizeSiteTopNavSettings(raw, { viewport })
  const visibility = getSiteTopNavVisibilityFlags(raw)
  const baseCssVars = siteTopNavCssVars(raw, { viewport })

  const { language, dir } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname() || '/'
  const [items, setItems] = useState(DEFAULT_HEADER_MENU)
  const [moduleMap, setModuleMap] = useState({})
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const showAdminDashboard =
    !!isAuthenticated && (!!user?.is_superuser || !!user?.is_staff)
  const showCta =
    !!settings.show_cta &&
    !!settings.cta_label &&
    !(!!isAuthenticated && isLoginCtaHref(settings.cta_href))

  /* رنگ‌ها فقط از تنظیمات ویجت؛ ظاهر شرکتی داشبورد دیگر override نمی‌کند */
  const cssVars = useMemo(() => {
    const next = { ...baseCssVars }
    if (!next['--stn-icon-hover']) {
      next['--stn-icon-hover'] = next['--stn-hover'] || next['--stn-icon']
    }
    return next
  }, [baseCssVars])

  useEffect(() => {
    let cancelled = false
    fetchHeaderMenu({ force: true, activeOnly: true }).then((list) => {
      if (!cancelled && Array.isArray(list)) setItems(list)
    })
    fetchSiteModules({ force: true })
      .then(({ map }) => {
        if (!cancelled) setModuleMap(map || {})
      })
      .catch(() => {})
    const loadLogos = () => {
      fetchSiteSettings({ force: true }).then((data) => {
        if (!cancelled && data) setSiteSettings(data)
      })
      fetchCorporateAppearance({ force: true }).then((data) => {
        if (!cancelled) setAppearance(data)
      })
    }
    loadLogos()
    const onModules = () => {
      fetchSiteModules({ force: true })
        .then(({ map }) => setModuleMap(map || {}))
        .catch(() => {})
    }
    const onAppear = () => {
      fetchCorporateAppearance({ force: true }).then((data) => {
        if (!cancelled) setAppearance(data)
      })
    }
    const onSiteSettings = (ev) => {
      if (ev?.detail) setSiteSettings(ev.detail)
      else loadLogos()
    }
    window.addEventListener('site-modules-changed', onModules)
    window.addEventListener('corporate-appearance-changed', onAppear)
    window.addEventListener('site-settings-changed', onSiteSettings)
    window.addEventListener('site-data-bust', loadLogos)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onModules)
      window.removeEventListener('corporate-appearance-changed', onAppear)
      window.removeEventListener('site-settings-changed', onSiteSettings)
      window.removeEventListener('site-data-bust', loadLogos)
    }
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname, isMobile])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  const navItems = useMemo(() => {
    const filtered = settings.filter_by_modules
      ? filterHeaderMenuByModules(items || [], moduleMap)
      : items || []
    return sortHeaderMenuItems(filtered, 'desktop').map((item) => ({
      ...item,
      label:
        language === 'en'
          ? item.label_en || item.label_fa || item.href
          : item.label_fa || item.label_en || item.href,
      Icon: resolveIcon(item.icon),
      active: matchPath(pathname, item.href),
    }))
  }, [items, language, moduleMap, pathname, settings.filter_by_modules])

  const siteName =
    language === 'en'
      ? settings.site_name_en || 'Sellniroo'
      : settings.site_name_fa || 'سلنیرو'

  /* اولویت: لوگوی /site-settings — بعد ظاهر شرکتی */
  const logoSrc = settings.use_site_logo
    ? siteSettings.logo_display ||
      siteSettings.logo_url ||
      appearance.logo_display ||
      appearance.logo_url ||
      '/images/logo.png'
    : '/images/logo.png'

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])

  const fullBleed = settings.full_bleed !== false
  const showBottomNav = isMobile && !!settings.mobile_bottom_nav
  const showTopBar = !isMobile || !!settings.mobile_show_top
  const profileChrome = useMemo(
    () => resolveSiteTopNavProfileChrome(raw),
    [raw],
  )
  const useDrawer =
    isMobile && showTopBar && settings.mobile_mode === 'drawer'
  const useInlineMobile =
    isMobile &&
    showTopBar &&
    (settings.mobile_mode === 'inline' || settings.mobile_mode === 'icons')
  const iconsOnly = isMobile && settings.mobile_mode === 'icons'

  const shellClass = [
    styles.shell,
    fullBleed ? styles.shellFullBleed : styles.shellInset,
    visibility.show_on_mobile === false ? styles.hideOnMobile : '',
    visibility.show_on_desktop === false ? styles.hideOnDesktop : '',
  ]
    .filter(Boolean)
    .join(' ')

  const navAlignClass =
    settings.nav_align === 'start'
      ? styles.navStart
      : settings.nav_align === 'center'
        ? styles.navCenter
        : styles.navEnd

  const renderNavLinks = (opts = {}) => {
    const { drawer = false, forceIcons = false, forceLabels = false } = opts
    return navItems.map((item) => {
      const showIcon = forceIcons || settings.show_icons
      const showLabel =
        forceLabels || (!iconsOnly && settings.show_labels) || drawer
      const className = drawer
        ? `${styles.drawerLink} ${item.active ? styles.drawerLinkActive : ''}`
        : [
            styles.navLink,
            item.active ? styles.navLinkActive : '',
            settings.underline && !drawer ? styles.navUnderline : '',
          ]
            .filter(Boolean)
            .join(' ')
      return (
        <li key={`${item.id || item.href}-${item.label}`}>
          <Link
            href={item.href || '/'}
            className={className}
            onClick={drawer ? closeDrawer : undefined}
            aria-current={item.active ? 'page' : undefined}
            aria-label={!showLabel ? item.label : undefined}
            title={!showLabel ? item.label : undefined}
          >
            {showIcon ? <item.Icon size={drawer ? 20 : 16} aria-hidden /> : null}
            {showLabel ? <span>{item.label}</span> : null}
          </Link>
        </li>
      )
    })
  }

  const stickyEnabled = !!settings.sticky
  const stickyOffset = Math.max(0, Number(settings.sticky_offset) || 0)
  const stickySentinelRef = useRef(null)
  const shellRef = useRef(null)
  const reservedHeightRef = useRef(0)
  const [pinned, setPinned] = useState(false)
  const [pinHeight, setPinHeight] = useState(0)

  useEffect(() => {
    if (!stickyEnabled || !showTopBar || isMobile) {
      setPinned(false)
      return undefined
    }
    const sentinel = stickySentinelRef.current
    const shell = shellRef.current
    if (!sentinel || !shell) return undefined

    const readBnStack = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--pb-bn-sticky-h')
        .trim()
      const n = parseFloat(raw)
      return Number.isFinite(n) ? n : 0
    }

    const measureReserve = () => {
      const cs = window.getComputedStyle(shell)
      const mt = parseFloat(cs.marginTop) || 0
      const mb = parseFloat(cs.marginBottom) || 0
      const h = (shell.offsetHeight || 0) + mt + mb
      reservedHeightRef.current = h
      setPinHeight(h)
    }

    const sync = () => {
      const bnH = readBnStack()
      const pinTop = stickyOffset + bnH
      const top = sentinel.getBoundingClientRect().top
      const shouldPin = top <= pinTop
      if (!shouldPin) measureReserve()
      else if (!reservedHeightRef.current) measureReserve()
      setPinned(shouldPin)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    })
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      mo.disconnect()
    }
  }, [stickyEnabled, showTopBar, isMobile, stickyOffset])

  return (
    <>
      {showTopBar ? (
        <>
          {stickyEnabled && !isMobile ? (
            <div
              ref={stickySentinelRef}
              className={styles.stickySentinel}
              aria-hidden
            />
          ) : null}
          {pinned ? (
            <div
              className={styles.stickySpacer}
              style={{ height: pinHeight }}
              aria-hidden
            />
          ) : null}
        <div
          ref={shellRef}
          className={[shellClass, pinned ? styles.shellPinned : '']
            .filter(Boolean)
            .join(' ')}
          style={{
            ...cssVars,
            ...(pinned
              ? {
                  '--stn-pin-top': `${stickyOffset}px`,
                  marginTop: 0,
                  marginBottom: 0,
                }
              : {}),
          }}
          data-stn-sticky-bar={stickyEnabled ? '1' : undefined}
        >
          <header
            className={[
              styles.header,
              stickyEnabled ? styles.headerSticky : '',
              pinned ? styles.headerPinned : '',
            ]
              .filter(Boolean)
              .join(' ')}
            dir={dir}
            role="banner"
          >
            <div className={styles.inner}>
              {settings.show_logo ? (
                <Link
                  href={settings.logo_href || '/'}
                  className={styles.logo}
                  title={siteName}
                  aria-label={siteName}
                >
                  <LogoMark
                    src={logoSrc}
                    name={siteName}
                    height={settings.logo_height}
                  />
                </Link>
              ) : null}

              {settings.show_nav && !useDrawer ? (
                <nav
                  className={[
                    styles.nav,
                    navAlignClass,
                    useInlineMobile ? styles.navInline : styles.desktopOnly,
                    useDrawer ? styles.navDrawerMode : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label="منوی سایت"
                >
                  <ul className={styles.navList}>{renderNavLinks()}</ul>
                </nav>
              ) : (
                <div className={styles.nav} aria-hidden />
              )}

              <div className={styles.actions}>
                {showAdminDashboard ? (
                  <Link
                    href="/dashboard"
                    className={`${styles.dashboardBtn}${
                      useDrawer ? ` ${styles.ctaMobileHide}` : ''
                    }`}
                    title="داشبورد"
                  >
                    <LayoutDashboard size={14} aria-hidden />
                    <span>داشبورد</span>
                  </Link>
                ) : null}

                {showCta ? (
                  <Link
                    href={settings.cta_href || '/'}
                    className={`${styles.cta}${
                      useDrawer ? ` ${styles.ctaMobileHide}` : ''
                    }`}
                  >
                    <PlusCircle size={14} aria-hidden />
                    <span>{settings.cta_label}</span>
                  </Link>
                ) : null}

                {profileChrome ? (
                  <div className={styles.profileChrome} data-stn-profile="1">
                    <BreakingNews settings={profileChrome} />
                  </div>
                ) : null}

                {useDrawer ? (
                  <button
                    type="button"
                    className={`${styles.burger} ${styles.mobileOnly}`}
                    aria-label="باز کردن منو"
                    aria-expanded={drawerOpen}
                    onClick={openDrawer}
                  >
                    <Menu size={20} />
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          {useDrawer ? (
            <>
              <div
                className={`${styles.backdrop} ${
                  drawerOpen ? styles.backdropOpen : ''
                }`}
                onClick={closeDrawer}
                aria-hidden={!drawerOpen}
              />
              <aside
                className={`${styles.drawer} ${
                  drawerOpen ? styles.drawerOpen : ''
                }`}
                aria-hidden={!drawerOpen}
                aria-label="منوی موبایل"
              >
                <div className={styles.drawerHead}>
                  {settings.show_logo ? (
                    <Link
                      href={settings.logo_href || '/'}
                      className={styles.logo}
                      onClick={closeDrawer}
                    >
                      <LogoMark
                        src={logoSrc}
                        name={siteName}
                        height={Math.max(28, settings.logo_height - 4)}
                      />
                    </Link>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className={styles.drawerClose}
                    aria-label="بستن منو"
                    onClick={closeDrawer}
                  >
                    <X size={18} />
                  </button>
                </div>
                <ul className={styles.drawerNav}>
                  {renderNavLinks({
                    drawer: true,
                    forceIcons: true,
                    forceLabels: true,
                  })}
                </ul>
                {showAdminDashboard ? (
                  <Link
                    href="/dashboard"
                    className={styles.drawerDashboard}
                    onClick={closeDrawer}
                  >
                    <LayoutDashboard size={16} aria-hidden />
                    داشبورد
                  </Link>
                ) : null}
                {showCta ? (
                  <Link
                    href={settings.cta_href || '/'}
                    className={styles.drawerCta}
                    onClick={closeDrawer}
                  >
                    <PlusCircle size={16} aria-hidden />
                    {settings.cta_label}
                  </Link>
                ) : null}
              </aside>
            </>
          ) : null}
        </div>
        </>
      ) : null}

      {showBottomNav ? <AppBottomNavWidget settings={raw} /> : null}
    </>
  )
})

export default SiteTopNavWidget
