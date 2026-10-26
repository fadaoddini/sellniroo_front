// components/widgets/SiteTopNavWidget.jsx — ویجت منو (بالا + نوار پایین موبایل)
'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  Info,
  Briefcase,
  Newspaper,
  PlusCircle,
  HelpCircle,
  GraduationCap,
  Building2,
  Users,
  Phone,
  Search,
  LayoutDashboard,
  Menu,
  X,
  User as UserIcon,
  Target,
  Zap,
  Award,
  Shield,
  Package,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
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
  DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS,
  getSiteTopNavVisibilityFlags,
  normalizeSiteTopNavSettings,
  siteTopNavCssVars,
} from '@/config/siteTopNavWidgetSettings'
import AppBottomNavWidget from '@/components/widgets/AppBottomNavWidget'
import styles from './SiteTopNavWidget.module.css'

const ICON_MAP = {
  Home,
  Info,
  Briefcase,
  Newspaper,
  PlusCircle,
  HelpCircle,
  GraduationCap,
  Building2,
  Users,
  Phone,
  Search,
  LayoutDashboard,
  User: UserIcon,
  UserIcon,
  Target,
  Zap,
  Award,
  Shield,
  Package,
}

function resolveIcon(name) {
  if (!name) return Home
  return ICON_MAP[name] || Home
}

function useIsMobile(breakpoint = 768) {
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
  const pathname = usePathname() || '/'
  const [items, setItems] = useState(DEFAULT_HEADER_MENU)
  const [moduleMap, setModuleMap] = useState({})
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const cssVars = useMemo(() => {
    const next = { ...baseCssVars }
    if (!isMobile) {
      if (appearance.header_bg) next['--stn-bg'] = appearance.header_bg
      if (appearance.header_text) next['--stn-text'] = appearance.header_text
      if (appearance.header_icon) next['--stn-icon'] = appearance.header_icon
      if (appearance.header_icon_hover || appearance.header_hover) {
        next['--stn-icon-hover'] =
          appearance.header_icon_hover || appearance.header_hover
      }
      if (appearance.header_hover) next['--stn-hover'] = appearance.header_hover
    } else {
      next['--stn-icon-hover'] = next['--stn-hover']
    }
    return next
  }, [baseCssVars, appearance, isMobile])

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
    fetchCorporateAppearance({ force: true }).then((data) => {
      if (!cancelled) setAppearance(data)
    })
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
    window.addEventListener('site-modules-changed', onModules)
    window.addEventListener('corporate-appearance-changed', onAppear)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onModules)
      window.removeEventListener('corporate-appearance-changed', onAppear)
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

  const logoSrc = settings.use_site_logo
    ? appearance.logo_display || appearance.logo_url || '/images/logo.png'
    : '/images/logo.png'

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])

  const fullBleed = settings.full_bleed !== false
  const showBottomNav = isMobile && !!settings.mobile_bottom_nav
  const showTopBar = !isMobile || !!settings.mobile_show_top
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

  return (
    <>
      {showTopBar ? (
        <div className={shellClass} style={cssVars}>
          <header
            className={[
              styles.header,
              settings.sticky ? styles.headerSticky : '',
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
                {settings.show_cta && settings.cta_label ? (
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
                {settings.show_cta && settings.cta_label ? (
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
      ) : null}

      {showBottomNav ? <AppBottomNavWidget /> : null}
    </>
  )
})

export default SiteTopNavWidget
