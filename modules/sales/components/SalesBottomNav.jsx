'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  LayoutList,
  CalendarClock,
  CircleDot,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  CircleX,
  Clock,
  LayoutDashboard,
  Home,
  X,
  Search,
  BarChart3,
  FileText,
  Archive,
  Route,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from '../styles/SalesBottomNav.module.css'

const PRIMARY_TABS = [
  { id: 'all', icon: LayoutList, labelFa: 'همه', labelEn: 'All' },
  { id: 'today', icon: CalendarClock, labelFa: 'امروز', labelEn: 'Today' },
  { id: 'in_progress', icon: CircleDot, labelFa: 'پیگیری', labelEn: 'Follow' },
]

const MORE_TABS = [
  { id: 'near', icon: Clock, labelFa: 'نزدیک', labelEn: 'Soon' },
  { id: 'confirmed', icon: CheckCircle2, labelFa: 'قرارداد', labelEn: 'Deal' },
  { id: 'cancelled', icon: CircleX, labelFa: 'بسته', labelEn: 'Closed' },
  { id: 'new', icon: LayoutList, labelFa: 'جدید', labelEn: 'New' },
  { id: 'archived', icon: Archive, labelFa: 'آرشیو', labelEn: 'Archive' },
]

export default function SalesBottomNav({
  activeTab = 'all',
  onTabChange,
  onAdd,
  onSearchFocus,
  counts = {},
}) {
  const { language, dir } = useLanguage()
  const { user, hasPermission, isAuthenticated, employeeData } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const fa = language === 'fa'

  const accessLevel = Number(employeeData?.access_level ?? user?.access_level ?? 0)
  const isSaleManager = !!user?.is_superuser || accessLevel >= 3
  const canMarketing =
    hasPermission('marketing') ||
    !!employeeData?.is_marketing ||
    !!user?.is_superuser
  const canSales =
    canMarketing ||
    hasPermission('sales') ||
    !!employeeData?.is_sales ||
    isSaleManager ||
    !!user?.is_superuser
  const canCreateLead = canSales

  const primaryTabs = useMemo(() => {
    if (canCreateLead) return PRIMARY_TABS
    return PRIMARY_TABS.map((t) =>
      t.id === 'all'
        ? { ...t, labelFa: 'موارد من', labelEn: 'Mine' }
        : t
    )
  }, [canCreateLead])

  useEffect(() => {
    if (!sheetOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen])

  if (!isAuthenticated || (!canSales && !canMarketing && !user?.is_superuser)) {
    return null
  }

  const labelOf = (item) => (fa ? item.labelFa : item.labelEn)
  const moreActive = MORE_TABS.some((t) => t.id === activeTab)

  const left = primaryTabs.slice(0, 2)
  const rightTab = primaryTabs[2]
  const RightIcon = rightTab?.icon

  return (
    <>
      <nav className={styles.nav} dir={dir} aria-label="Sales app">
        <div className={styles.inner}>
          <div className={styles.side}>
            {left.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              const count = counts[tab.id]
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.item} ${active ? styles.itemActive : ''}`}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                  <span className={styles.label}>
                    {labelOf(tab)}
                    {typeof count === 'number' && count > 0 ? (
                      <em className={styles.badge}>{count > 99 ? '99+' : count}</em>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>

          <div className={styles.centerWrap}>
            {canCreateLead ? (
              <button
                type="button"
                className={styles.fab}
                onClick={() => onAdd?.()}
                aria-label={fa ? 'مورد جدید' : 'New lead'}
              >
                <Plus size={26} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.fab}
                onClick={() => onSearchFocus?.()}
                aria-label={fa ? 'جستجو' : 'Search'}
              >
                <Search size={24} />
              </button>
            )}
            <span className={styles.centerLabel}>
              {canCreateLead ? (fa ? 'جدید' : 'New') : fa ? 'جستجو' : 'Search'}
            </span>
          </div>

          <div className={styles.side}>
            {rightTab && RightIcon ? (
              <button
                type="button"
                className={`${styles.item} ${
                  activeTab === rightTab.id ? styles.itemActive : ''
                }`}
                onClick={() => onTabChange?.(rightTab.id)}
              >
                <RightIcon
                  size={22}
                  strokeWidth={activeTab === rightTab.id ? 2.4 : 2}
                />
                <span className={styles.label}>{labelOf(rightTab)}</span>
              </button>
            ) : (
              <div className={styles.slotEmpty} />
            )}

            <button
              type="button"
              className={`${styles.item} ${
                sheetOpen || moreActive ? styles.itemActive : ''
              }`}
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
              <strong>{fa ? 'منوی فروش' : 'Sales menu'}</strong>
              <button
                type="button"
                className={styles.close}
                onClick={() => setSheetOpen(false)}
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.sheetGrid}>
              {MORE_TABS.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.sheetBtn} ${
                      active ? styles.sheetBtnActive : ''
                    }`}
                    data-tour={tab.id === 'archived' ? 'sale-archive-tab' : undefined}
                    onClick={() => {
                      onTabChange?.(tab.id)
                      setSheetOpen(false)
                    }}
                  >
                    <Icon size={18} />
                    <span>{labelOf(tab)}</span>
                  </button>
                )
              })}
            </div>

            <div className={styles.sheetLinks}>
              <Link
                href="/sale/activity"
                className={styles.sheetLink}
                onClick={() => setSheetOpen(false)}
              >
                <BarChart3 size={18} />
                {fa ? 'گزارش فعالیت من' : 'My activity'}
              </Link>
              {isSaleManager ? (
                <>
                  <Link
                    href="/sale/analytics"
                    className={styles.sheetLink}
                    onClick={() => setSheetOpen(false)}
                  >
                    <BarChart3 size={18} />
                    {fa ? 'گزارش تیم' : 'Team analytics'}
                  </Link>
                  <Link
                    href="/sale/monitor"
                    className={styles.sheetLink}
                    onClick={() => setSheetOpen(false)}
                  >
                    <Route size={18} />
                    {fa ? 'رصد مسیر موارد' : 'Path monitor'}
                  </Link>
                  <Link
                    href="/sale/invoice"
                    className={styles.sheetLink}
                    onClick={() => setSheetOpen(false)}
                  >
                    <FileText size={18} />
                    {fa ? 'پیش‌فاکتور / فاکتور' : 'Invoice'}
                  </Link>
                </>
              ) : null}
              <Link
                href="/dashboard"
                className={styles.sheetLink}
                onClick={() => setSheetOpen(false)}
              >
                <LayoutDashboard size={18} />
                {fa ? 'داشبورد' : 'Dashboard'}
              </Link>
              <Link
                href="/"
                className={styles.sheetLink}
                onClick={() => setSheetOpen(false)}
              >
                <Home size={18} />
                {fa ? 'صفحه اصلی' : 'Home'}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
