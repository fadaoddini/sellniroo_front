'use client'

import React from 'react'
import Link from 'next/link'
import { notFound, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  RefreshCw,
  ShieldOff,
  Store,
  Wallet,
} from 'lucide-react'
import styles from './MultiVendorShell.module.css'

const NAV = [
  { href: '/shops-manage', label: 'مرکز مدیریت', icon: Store },
  { href: '/shops-accounting', label: 'فروشگاه‌ها و تسویه', icon: Wallet },
  { href: '/shops-products', label: 'محصولات', icon: Package },
]

/**
 * پوستهٔ داشبوردی چندفروشندگی — بدون adminweb / پورتال مالک
 */
export default function MultiVendorShell({
  title = 'مدیریت فروشگاه‌ها',
  subtitle = '',
  loading = false,
  allowed = false,
  isAuthenticated = false,
  moduleOn = true,
  children,
}) {
  const pathname = usePathname()

  if (loading) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.stateBox}>
          <RefreshCw size={26} className={styles.spin} />
          <p>در حال بررسی دسترسی…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // فروشگاه / چندفروشندگی خاموش → ۴۰۴
  if (!moduleOn) {
    notFound()
  }

  if (!allowed) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.denied}>
          <ShieldOff size={34} />
          <h1>دسترسی مجاز نیست</h1>
          <p>
            این بخش فقط برای کارمندان دارای دسترسی «مدیریت فروشگاه‌ها» است.
          </p>
          <Link href="/dashboard" className={styles.primaryBtn}>
            <LayoutDashboard size={15} />
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>چندفروشندگی · داشبورد</p>
            <h1>{title}</h1>
            {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
          </div>
          <Link href="/dashboard" className={styles.dashBtn}>
            <LayoutDashboard size={15} />
            داشبورد
          </Link>
        </header>

        <nav className={styles.nav} aria-label="مدیریت فروشگاه‌ها">
          {NAV.map((item) => {
            const Icon = item.icon
            const on =
              pathname === item.href || pathname?.startsWith(`${item.href}?`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${on ? styles.navOn : ''}`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
