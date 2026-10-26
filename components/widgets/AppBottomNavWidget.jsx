// components/widgets/AppBottomNavWidget.jsx — منوی پایین اپ
// ظاهر و لینک‌ها فقط از /header-menu (داشبورد) — بدون تنظیمات ویجت
'use client'

import React, { useEffect, useMemo, useState, memo } from 'react'
import Link from 'next/link'
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
  Calculator,
  Target,
  Zap,
  Award,
  Shield,
  User as UserIcon,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  fetchHeaderMenu,
  DEFAULT_HEADER_MENU,
  filterHeaderMenuByModules,
  sortHeaderMenuItems,
  arrangeMobileNavItems,
  findMobileNavCenterIndex,
} from '@/services/headerMenu'
import { fetchSiteModules } from '@/services/siteModules'
import {
  fetchCorporateAppearance,
  DEFAULT_CORPORATE_APPEARANCE,
  corporateMobileStyle,
} from '@/services/corporateAppearance'
import styles from './AppBottomNavWidget.module.css'

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
  Calculator,
  Target,
  Zap,
  Award,
  Shield,
  User: UserIcon,
  UserIcon,
}

function resolveIcon(name) {
  return ICON_MAP[name] || Home
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

const AppBottomNavWidget = memo(function AppBottomNavWidget() {
  const pathname = usePathname() || '/'
  const { language } = useLanguage()
  const [items, setItems] = useState(DEFAULT_HEADER_MENU)
  const [moduleMap, setModuleMap] = useState({})
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)

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

  const styleKey = appearance.mobile_style || 'classic'

  useEffect(() => {
    document.body.classList.add('has-app-bottom-nav')
    document.body.dataset.appNavStyle = styleKey
    return () => {
      document.body.classList.remove('has-app-bottom-nav')
      delete document.body.dataset.appNavStyle
    }
  }, [styleKey])

  const navItems = useMemo(() => {
    const filtered = sortHeaderMenuItems(
      filterHeaderMenuByModules(items || [], moduleMap),
      'mobile'
    )
    return arrangeMobileNavItems(filtered, {
      centerItemId:
        styleKey === 'center_circle' ? appearance.mobile_center_item_id : null,
      maxItems: 5,
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
    appearance.mobile_center_item_id,
  ])

  const centerIndex = useMemo(() => {
    if (styleKey !== 'center_circle' || !navItems.length) return -1
    return findMobileNavCenterIndex(
      navItems,
      appearance.mobile_center_item_id
    )
  }, [navItems, styleKey, appearance.mobile_center_item_id])

  const activeHref = useMemo(() => {
    const hit = navItems.find((item) => matchPath(pathname, item.href))
    return hit?.href || null
  }, [navItems, pathname])

  if (!navItems.length) return null

  const styleClass = styles[styleKey] || styles.classic

  return (
    <nav
      className={`${styles.bar} ${styles.barFixed} ${styleClass}`}
      aria-label="منوی پایین"
      style={corporateMobileStyle(appearance)}
      data-style={styleKey}
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
})

export default AppBottomNavWidget
