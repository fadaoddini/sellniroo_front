// components/common/CorporateMobileNav/CorporateMobileNav.jsx
// ماژول: corporate_mobile_nav ⊂ corporate_system
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Info, Briefcase, Newspaper, PlusCircle, HelpCircle,
  Building2, Users, Phone, Search, LayoutDashboard,
  Calculator, Target, Zap, Award, Shield, User as UserIcon,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  fetchHeaderMenu,
  DEFAULT_HEADER_MENU,
  filterHeaderMenuByModules,
} from '@/services/headerMenu'
import { fetchSiteModules } from '@/services/siteModules'
import {
  fetchCorporateAppearance,
  DEFAULT_CORPORATE_APPEARANCE,
  corporateMobileStyle,
} from '@/services/corporateAppearance'
import styles from './CorporateMobileNav.module.css'

const ICON_MAP = {
  Home,
  Info,
  Briefcase,
  Newspaper,
  PlusCircle,
  HelpCircle,
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
  const path = String(href).split('?')[0].split('#')[0] || '/'
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}

export default function CorporateMobileNav() {
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
    fetchSiteModules({ force: true }).then(({ map }) => {
      if (!cancelled) setModuleMap(map || {})
    }).catch(() => {})
    fetchCorporateAppearance({ force: true }).then((data) => {
      if (!cancelled) setAppearance(data)
    })
    const onModules = () => {
      fetchSiteModules({ force: true })
        .then(({ map }) => setModuleMap(map || {}))
        .catch(() => {})
    }
    window.addEventListener('site-modules-changed', onModules)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onModules)
    }
  }, [])

  const styleKey = appearance.mobile_style || 'classic'

  useEffect(() => {
    document.body.classList.add('has-corporate-mobile-nav')
    document.body.dataset.corpNavStyle = styleKey
    return () => {
      document.body.classList.remove('has-corporate-mobile-nav')
      delete document.body.dataset.corpNavStyle
    }
  }, [styleKey])

  const navItems = useMemo(() => {
    // حداکثر ۵ آیتم برای خوانایی بهتر در موبایل
    return filterHeaderMenuByModules(items || [], moduleMap)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        label: language === 'en'
          ? (item.label_en || item.label_fa || item.href)
          : (item.label_fa || item.label_en || item.href),
        Icon: resolveIcon(item.icon),
      }))
  }, [items, language, moduleMap])

  const centerIndex = useMemo(() => {
    if (styleKey !== 'center_circle' || !navItems.length) return -1
    return Math.floor(navItems.length / 2)
  }, [navItems.length, styleKey])

  const activeHref = useMemo(() => {
    const hit = navItems.find((item) => matchPath(pathname, item.href))
    return hit?.href || null
  }, [navItems, pathname])

  if (!navItems.length) return null

  const styleClass = styles[styleKey] || styles.classic

  return (
    <nav
      className={`${styles.bar} ${styleClass}`}
      aria-label="منوی موبایل شرکتی"
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
              className={`${styles.link} ${active ? styles.active : ''} ${isCenter ? styles.centerLink : ''}`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className={`${styles.iconWrap} ${isCenter ? styles.centerIcon : ''}`}>
                <item.Icon size={iconSize} strokeWidth={active || isCenter ? 2.3 : 1.9} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
