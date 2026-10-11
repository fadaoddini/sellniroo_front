// components/common/MobileBottomNav.jsx — منوی پایین اپ‌مانند (فقط موبایل)
'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  PlusCircle,
  Newspaper,
  Phone,
} from 'lucide-react'
import styles from './MobileBottomNav.module.css'

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

  const activeId = useMemo(() => {
    const all = [...RIGHT_ITEMS, HOME_ITEM, ...LEFT_ITEMS]
    return all.find((item) => item.match(pathname))?.id || null
  }, [pathname])

  return (
    <nav className={styles.bar} aria-label="منوی پایین">
      <div className={styles.inner}>
        <div className={styles.side}>
          {RIGHT_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} active={activeId === item.id} />
          ))}
        </div>

        <div className={styles.center}>
          <NavLink item={HOME_ITEM} active={activeId === HOME_ITEM.id} />
        </div>

        <div className={`${styles.side} ${styles.sideLeft}`}>
          {LEFT_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} active={activeId === item.id} />
          ))}
        </div>
      </div>
    </nav>
  )
}
