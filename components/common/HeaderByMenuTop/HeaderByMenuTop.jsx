// components/common/HeaderByMenuTop/HeaderByMenuTop.jsx
// ماژول: header_by_menu_top ⊂ advanced_menu
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Home, Info, Briefcase, Newspaper, PlusCircle, HelpCircle, GraduationCap,
  Building2, Users, Phone, Search, LayoutDashboard,
  Calculator, Container, LibraryBig, Mountain, Layers,
  DollarSign, CheckSquare, Palette, User as UserIcon, Target, Zap, Award, Shield,
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
  corporateHeaderStyle,
} from '@/services/corporateAppearance'
import styles from './HeaderByMenuTop.module.css'

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
  Container,
  LibraryBig,
  Mountain,
  Layers,
  DollarSign,
  CheckSquare,
  Palette,
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

export default function HeaderByMenuTop() {
  const { language, dir } = useLanguage()
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

  const navItems = useMemo(() => {
    return sortHeaderMenuItems(
      filterHeaderMenuByModules(items || [], moduleMap),
      'desktop'
    ).map((item) => ({
      ...item,
      label: language === 'en'
        ? (item.label_en || item.label_fa || item.href)
        : (item.label_fa || item.label_en || item.href),
      Icon: resolveIcon(item.icon),
    }))
  }, [items, language, moduleMap])

  const logoSrc = appearance.logo_display || appearance.logo_url || '/images/logo.png'
  const siteName = language === 'en' ? 'Sellniroo' : 'سلنیرو'
  const styleVars = corporateHeaderStyle(appearance)

  return (
    <header className={styles.header} dir={dir} style={styleVars}>
      <div className={`container ${styles.headerContainer}`}>
        <div className={styles.logo}>
          <Link href="/" title={siteName} aria-label={siteName}>
            {typeof logoSrc === 'string' && logoSrc.startsWith('/images/') ? (
              <Image
                src={logoSrc}
                alt={siteName}
                width={180}
                height={50}
                priority
                className={styles.logoImage}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt={siteName}
                width={180}
                height={50}
                className={styles.logoImage}
              />
            )}
          </Link>
        </div>

        <nav className={styles.desktopNav} aria-label="main">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={`${item.id || item.href}-${item.label}`}>
                <Link href={item.href || '/'} className={styles.navLink}>
                  <item.Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.headerRight} />
      </div>
    </header>
  )
}
