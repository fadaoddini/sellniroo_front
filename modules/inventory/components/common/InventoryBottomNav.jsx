'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  MoreHorizontal,
  X,
  Building2,
  Box,
  FileText,
  Users,
  AlertTriangle,
  LayoutDashboard,
  ScrollText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './InventoryBottomNav.module.css'

const MORE_LINKS = [
  { href: '/inventory/vouchers', icon: ScrollText, labelFa: 'حواله‌ها', labelEn: 'Vouchers' },
  { href: '/inventory/warehouses', icon: Building2, labelFa: 'انبارها', labelEn: 'Warehouses' },
  { href: '/inventory/units', icon: Box, labelFa: 'واحدها', labelEn: 'Units' },
  { href: '/inventory/transactions', icon: FileText, labelFa: 'تراکنش‌ها', labelEn: 'Transactions' },
  { href: '/inventory/authorized-persons', icon: Users, labelFa: 'افراد مجاز', labelEn: 'Persons' },
  { href: '/inventory/alerts', icon: AlertTriangle, labelFa: 'هشدارها', labelEn: 'Alerts' },
]

export default function InventoryBottomNav() {
  const pathname = usePathname()
  const { language, dir } = useLanguage()
  const { user, isAuthenticated, hasPermission } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const fa = language === 'fa'

  const canAccess =
    hasPermission('warehouse') ||
    hasPermission('all') ||
    !!user?.is_superuser

  useEffect(() => {
    setSheetOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!sheetOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen])

  if (!isAuthenticated || !canAccess) return null

  const isActive = (href) => {
    if (href === '/inventory') return pathname === '/inventory'
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  const moreActive = MORE_LINKS.some((l) => isActive(l.href))

  return (
    <>
      <nav className={styles.nav} dir={dir} aria-label="Inventory app">
        <div className={styles.inner}>
          <div className={styles.side}>
            <Link
              href="/inventory"
              className={`${styles.item} ${pathname === '/inventory' ? styles.itemActive : ''}`}
            >
              <Home size={22} strokeWidth={pathname === '/inventory' ? 2.4 : 2} />
              <span className={styles.label}>{fa ? 'خانه' : 'Home'}</span>
            </Link>
            <Link
              href="/inventory/products"
              className={`${styles.item} ${isActive('/inventory/products') ? styles.itemActive : ''}`}
            >
              <Package size={22} strokeWidth={isActive('/inventory/products') ? 2.4 : 2} />
              <span className={styles.label}>{fa ? 'کالا' : 'Products'}</span>
            </Link>
          </div>

          <div className={styles.centerWrap}>
            <Link
              href="/inventory/in"
              className={`${styles.fab} ${isActive('/inventory/in') ? styles.fabActive : ''}`}
              aria-label={fa ? 'ورود کالا' : 'Stock in'}
            >
              <ArrowDownToLine size={24} strokeWidth={2.5} />
            </Link>
            <span className={styles.centerLabel}>{fa ? 'ورود' : 'In'}</span>
          </div>

          <div className={styles.side}>
            <Link
              href="/inventory/out"
              className={`${styles.item} ${isActive('/inventory/out') ? styles.itemActive : ''}`}
            >
              <ArrowUpFromLine size={22} strokeWidth={isActive('/inventory/out') ? 2.4 : 2} />
              <span className={styles.label}>{fa ? 'خروج' : 'Out'}</span>
            </Link>
            <button
              type="button"
              className={`${styles.item} ${sheetOpen || moreActive ? styles.itemActive : ''}`}
              onClick={() => setSheetOpen(true)}
            >
              <MoreHorizontal size={22} strokeWidth={sheetOpen || moreActive ? 2.4 : 2} />
              <span className={styles.label}>{fa ? 'بیشتر' : 'More'}</span>
            </button>
          </div>
        </div>
      </nav>

      {sheetOpen ? (
        <div className={styles.sheetRoot} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.backdrop}
            aria-label="close"
            onClick={() => setSheetOpen(false)}
          />
          <div className={styles.sheet}>
            <div className={styles.handle} />
            <div className={styles.sheetHead}>
              <strong>{fa ? 'منوی انبار' : 'Inventory menu'}</strong>
              <button
                type="button"
                className={styles.close}
                onClick={() => setSheetOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.sheetGrid}>
              {MORE_LINKS.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.sheetBtn} ${active ? styles.sheetBtnActive : ''}`}
                    onClick={() => setSheetOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{fa ? link.labelFa : link.labelEn}</span>
                  </Link>
                )
              })}
            </div>
            <div className={styles.sheetLinks}>
              <Link
                href="/dashboard"
                className={styles.sheetLink}
                onClick={() => setSheetOpen(false)}
              >
                <LayoutDashboard size={18} />
                {fa ? 'داشبورد' : 'Dashboard'}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
