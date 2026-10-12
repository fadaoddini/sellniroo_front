// components/common/MobileBottomNav.jsx — منوی پایین اپ‌مانند (فقط موبایل)
// ماژول سایت: job_mobile_nav — از /adminweb فعال/غیرفعال می‌شود
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  PlusCircle,
  Newspaper,
  Phone,
} from 'lucide-react'
import { fetchSiteModules } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './MobileBottomNav.module.css'

const ITEM_MODULE = {
  // پروفایل همیشه در دسترس است (کاریابی یا پروفایل عادی)
  post: SITE_MODULE_KEYS.JOB_BOARD,
  news: SITE_MODULE_KEYS.NEWS,
  contact: SITE_MODULE_KEYS.CTA_SECTION,
}

/**
 * چیدمان RTL:
 * دو منو راست | خانه (وسط، برجسته) | دو منو چپ
 * + تماس با ما به‌عنوان آیتم کمکی در گروه چپ با لیبل کوتاه‌تر در عرض کم
 *
 * آیتم‌ها: پروفایل، ثبت آگهی، خانه، اخبار، تماس با ما
 */
const RIGHT_ITEMS = [
  {
    id: 'profile',
    href: '/profile',
    label: 'پروفایل',
    shortLabel: 'پروفایل',
    icon: User,
    match: (p) => p.startsWith('/profile'),
  },
  {
    id: 'post',
    href: '/post-job',
    label: 'ثبت آگهی',
    shortLabel: 'آگهی',
    icon: PlusCircle,
    match: (p) => p.startsWith('/post-job'),
  },
]

const HOME_ITEM = {
  id: 'home',
  href: '/',
  label: 'خانه',
  shortLabel: 'خانه',
  icon: Home,
  center: true,
  match: (p) => p === '/',
}

const LEFT_ITEMS = [
  {
    id: 'news',
    href: '/news',
    label: 'اخبار',
    shortLabel: 'اخبار',
    icon: Newspaper,
    match: (p) => p.startsWith('/news'),
  },
  {
    id: 'contact',
    href: '/#consulting',
    label: 'تماس با ما',
    shortLabel: 'تماس',
    icon: Phone,
    match: () => false,
  },
]

function NavLink({ item, active }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={`${styles.link} ${item.center ? styles.centerLink : ''} ${active ? styles.active : ''}`}
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
    >
      <span className={item.center ? styles.centerIconWrap : styles.iconWrap}>
        <Icon
          size={item.center ? 22 : 18}
          strokeWidth={active || item.center ? 2.25 : 1.85}
        />
      </span>
      <span className={styles.label}>
        <span className={styles.labelFull}>{item.label}</span>
        <span className={styles.labelShort}>{item.shortLabel || item.label}</span>
      </span>
    </Link>
  )
}

export default function MobileBottomNav() {
  const pathname = usePathname() || '/'
  const [moduleMap, setModuleMap] = useState({})

  useEffect(() => {
    let cancelled = false
    fetchSiteModules({ force: true })
      .then(({ map }) => {
        if (!cancelled) setModuleMap(map || {})
      })
      .catch(() => {})
    const onChange = () => {
      fetchSiteModules({ force: true })
        .then(({ map }) => setModuleMap(map || {}))
        .catch(() => {})
    }
    window.addEventListener('site-modules-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onChange)
    }
  }, [])

  const isItemOn = (item) => {
    const key = ITEM_MODULE[item.id]
    if (!key) return true
    if (!Object.prototype.hasOwnProperty.call(moduleMap, key)) return true
    return !!moduleMap[key]
  }

  const rightItems = useMemo(
    () => RIGHT_ITEMS.filter(isItemOn),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moduleMap]
  )
  const leftItems = useMemo(
    () => LEFT_ITEMS.filter(isItemOn),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moduleMap]
  )

  const activeId = useMemo(() => {
    const all = [...rightItems, HOME_ITEM, ...leftItems]
    return all.find((item) => item.match(pathname))?.id || null
  }, [pathname, rightItems, leftItems])

  return (
    <nav className={styles.bar} aria-label="منوی پایین">
      <div className={styles.inner}>
        <div className={styles.side}>
          {rightItems.map((item) => (
            <NavLink key={item.id} item={item} active={activeId === item.id} />
          ))}
        </div>

        <div className={styles.center}>
          <NavLink item={HOME_ITEM} active={activeId === HOME_ITEM.id} />
        </div>

        <div className={`${styles.side} ${styles.sideLeft}`}>
          {leftItems.map((item) => (
            <NavLink key={item.id} item={item} active={activeId === item.id} />
          ))}
        </div>
      </div>
    </nav>
  )
}
