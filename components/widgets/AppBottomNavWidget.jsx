// components/widgets/AppBottomNavWidget.jsx — منوی پایین اپ
// ظاهر از /header-menu؛ آیتم‌ها از داشبورد یا انتخاب ویجت منو
'use client'

import React, { useEffect, useMemo, useState, memo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  fetchHeaderMenu,
  DEFAULT_HEADER_MENU,
  filterHeaderMenuByModules,
  sortHeaderMenuItems,
  arrangeMobileNavItems,
  findMobileNavCenterIndex,
  pickHeaderMenuByIds,
} from '@/services/headerMenu'
import { fetchSiteModules } from '@/services/siteModules'
import {
  fetchCorporateAppearance,
  DEFAULT_CORPORATE_APPEARANCE,
  corporateMobileStyle,
} from '@/services/corporateAppearance'
import {
  normalizeMobileCenterItemId,
  normalizeMobileNavItemIds,
  normalizeMobileNavStyle,
  normalizeSiteTopNavSettings,
} from '@/config/siteTopNavWidgetSettings'
import { resolveHeaderMenuIcon } from '@/config/headerMenuIcons'
import styles from './AppBottomNavWidget.module.css'

function resolveIcon(name) {
  return resolveHeaderMenuIcon(name)
}

function matchPath(pathname, href) {
  if (!href) return false
  const raw = String(href).trim()
  const hashIdx = raw.indexOf('#')
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

const AppBottomNavWidget = memo(function AppBottomNavWidget({
  settings: rawSettings = null,
} = {}) {
  const pathname = usePathname() || '/'
  const { language } = useLanguage()
  const [items, setItems] = useState(DEFAULT_HEADER_MENU)
  const [moduleMap, setModuleMap] = useState({})
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)
  const [mounted, setMounted] = useState(false)
  const widgetSettings = useMemo(
    () =>
      rawSettings
        ? normalizeSiteTopNavSettings(rawSettings, { viewport: 'mobile' })
        : null,
    [rawSettings]
  )
  const selectedIds = useMemo(
    () =>
      normalizeMobileNavItemIds(
        rawSettings?.mobile_nav_item_ids ?? widgetSettings?.mobile_nav_item_ids
      ),
    [rawSettings, widgetSettings]
  )
  const styleOverride = useMemo(
    () =>
      normalizeMobileNavStyle(
        rawSettings?.mobile_nav_style ?? widgetSettings?.mobile_nav_style
      ),
    [rawSettings, widgetSettings]
  )
  const centerOverride = useMemo(
    () =>
      normalizeMobileCenterItemId(
        rawSettings?.mobile_center_item_id ??
          widgetSettings?.mobile_center_item_id
      ),
    [rawSettings, widgetSettings]
  )
  const filterByModules = widgetSettings
    ? widgetSettings.filter_by_modules !== false
    : true

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
    setMounted(true)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onModules)
      window.removeEventListener('corporate-appearance-changed', onAppear)
    }
  }, [])

  const styleKey = styleOverride || appearance.mobile_style || 'classic'
  const centerItemId =
    styleKey === 'center_circle'
      ? centerOverride ?? appearance.mobile_center_item_id
      : null

  useEffect(() => {
    document.body.classList.add('has-app-bottom-nav')
    document.body.dataset.appNavStyle = styleKey
    return () => {
      document.body.classList.remove('has-app-bottom-nav')
      delete document.body.dataset.appNavStyle
    }
  }, [styleKey])

  const navItems = useMemo(() => {
    let pool = filterByModules
      ? filterHeaderMenuByModules(items || [], moduleMap)
      : items || []
    const picked = pickHeaderMenuByIds(pool, selectedIds)
    if (picked !== null) {
      pool = picked
    } else {
      pool = sortHeaderMenuItems(pool, 'mobile')
    }
    if (!pool.length) return []
    const maxItems = selectedIds?.length
      ? Math.max(1, Math.min(7, selectedIds.length || pool.length))
      : 5
    return arrangeMobileNavItems(pool, {
      centerItemId,
      maxItems,
    }).map((item) => ({
      ...item,
      label:
        language === 'en'
          ? item.label_en || item.label_fa || item.href
          : item.label_fa || item.label_en || item.href,
      Icon: resolveIcon(item.icon),
    }))
  }, [
    items,
    language,
    moduleMap,
    styleKey,
    centerItemId,
    selectedIds,
    filterByModules,
  ])

  const centerIndex = useMemo(() => {
    if (styleKey !== 'center_circle' || !navItems.length) return -1
    return findMobileNavCenterIndex(navItems, centerItemId)
  }, [navItems, styleKey, centerItemId])

  const activeHref = useMemo(() => {
    const hit = navItems.find((item) => matchPath(pathname, item.href))
    return hit?.href || null
  }, [navItems, pathname])

  /* اگر رنگ از ویجت منو/هیرو آمده، بر ظاهر شرکتی (اغلب نارنجی) اولویت دارد */
  const mobilePaint = useMemo(() => {
    const base = corporateMobileStyle(appearance)
    const bg = String(widgetSettings?.color_bg || '').trim()
    const text = String(widgetSettings?.color_text || '').trim()
    const icon = String(widgetSettings?.color_icon || '').trim()
    const accent = String(
      widgetSettings?.color_hover || widgetSettings?.color_accent || '',
    ).trim()
    const gymLive =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-gym-app-mobile') === '1'
    if (!gymLive && (!bg || bg === 'transparent')) return base
    return {
      ...base,
      ...(bg && bg !== 'transparent' ? { '--corp-mobile-bg': bg } : null),
      ...(text ? { '--corp-mobile-text': text } : null),
      ...(icon ? { '--corp-mobile-icon': icon } : null),
      ...(accent ? { '--corp-mobile-active': accent } : null),
    }
  }, [appearance, widgetSettings])

  if (!navItems.length || !mounted || typeof document === 'undefined') {
    return null
  }

  const STYLE_CLASS = {
    classic: styles.classic,
    center_circle: styles.center_circle,
    rounded_square: styles.rounded_square,
    glow_dock: styles.glow_dock,
  }
  const styleClass = STYLE_CLASS[styleKey] || styles.classic

  const nav = (
    <nav
      className={`${styles.bar} ${styles.barFixed} ${styleClass}`}
      aria-label="منوی پایین"
      style={mobilePaint}
      data-style={styleKey}
      data-app-bottom-nav="1"
    >
      <div className={styles.inner}>
        {navItems.map((item, index) => {
          const active = activeHref === item.href
          const isCenter = index === centerIndex
          const iconSize = isCenter ? 24 : 19
          return (
            <Link
              key={`${item.id || item.href}-${item.label}`}
              href={item.href || '/'}
              className={`${styles.link} ${active ? styles.active : ''} ${
                isCenter ? styles.centerLink : ''
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
            >
              <span
                className={`${styles.iconWrap} ${
                  isCenter ? styles.centerIcon : ''
                }`}
              >
                <item.Icon
                  size={iconSize}
                  strokeWidth={active || isCenter ? 2.3 : 1.9}
                />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )

  /* portal به body تا دایره وسط زیر overflow/transform والد clip نشود */
  return createPortal(nav, document.body)
})

export default AppBottomNavWidget
