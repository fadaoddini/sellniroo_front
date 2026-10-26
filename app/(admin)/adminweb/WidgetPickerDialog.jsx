'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  X,
  Search,
  Menu,
  User,
  Zap,
  Image,
  PanelTop,
  Images,
  Megaphone,
  Newspaper,
  Circle,
  Film,
  BookOpen,
  Briefcase,
  Phone,
  Calendar,
  Building2,
  MoveVertical,
  Type,
  Puzzle,
  FolderOpen,
  Star,
  GalleryHorizontal,
  MessageCircle,
  Share2,
  Trophy,
  HelpCircle,
  GraduationCap,
  Award,
  Package,
  LogIn,
  PlusCircle,
  ShoppingBag,
  Store,
  Tags,
  BadgePercent,
  LayoutGrid,
} from 'lucide-react'
import {
  availableBuilderWidgets,
  groupWidgetsByCategory,
  WIDGET_CATEGORIES,
  widgetStatusLabel,
} from '@/config/pageBuilderWidgets'
import styles from './AdminWeb.module.css'

const ICONS = {
  Menu,
  User,
  Zap,
  Image,
  PanelTop,
  Images,
  Megaphone,
  Newspaper,
  Circle,
  Film,
  BookOpen,
  Briefcase,
  Phone,
  Calendar,
  Building2,
  MoveVertical,
  Type,
  FolderOpen,
  Star,
  GalleryHorizontal,
  Search,
  MessageCircle,
  Share2,
  Trophy,
  HelpCircle,
  GraduationCap,
  Award,
  Package,
  LogIn,
  PlusCircle,
  ShoppingBag,
  Store,
  Tags,
  BadgePercent,
  LayoutGrid,
}

/**
 * @param {{
 *   open: boolean,
 *   moduleMap?: Record<string, boolean>,
 *   layoutMode?: 'home' | 'news_single' | 'news_list' | 'job_single',
 *   onClose: () => void,
 *   onPick: (type: string) => void,
 * }} props
 */
export default function WidgetPickerDialog({
  open,
  moduleMap = {},
  layoutMode = 'home',
  onClose,
  onPick,
}) {
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const widgets = useMemo(() => {
    let list = availableBuilderWidgets(moduleMap, { layoutMode })
    /* ویجت محتوای کامل صفحه را اول لیست بیاور */
    const pinType =
      layoutMode === 'news_single'
        ? 'news_article'
        : layoutMode === 'news_list'
          ? 'news_page'
          : layoutMode === 'job_single'
            ? 'job_article'
            : layoutMode === 'product_single'
              ? 'product_article'
              : layoutMode === 'shop_list'
                ? 'shop_page'
                : null
    if (pinType) {
      list = [...list].sort((a, b) => {
        if (a.type === pinType) return -1
        if (b.type === pinType) return 1
        return 0
      })
    }
    const query = q.trim().toLowerCase()
    if (!query) return list
    return list.filter(
      (w) =>
        w.label.toLowerCase().includes(query) ||
        (w.desc || '').toLowerCase().includes(query) ||
        w.type.toLowerCase().includes(query)
    )
  }, [moduleMap, layoutMode, q])

  const grouped = useMemo(() => groupWidgetsByCategory(widgets), [widgets])

  if (!open) return null

  return (
    <div className={styles.wpOverlay} role="dialog" aria-modal="true" aria-label="انتخاب ویجت">
      <button type="button" className={styles.wpBackdrop} aria-label="بستن" onClick={onClose} />
      <div className={styles.wpDialog}>
        <header className={styles.wpHead}>
          <div>
            <h3>
              <Puzzle size={16} />
              افزودن ویجت
            </h3>
            <p>ویجت‌های پیشنهادی بر اساس ماژول‌های فعال</p>
          </div>
          <button type="button" className={styles.wpClose} onClick={onClose} aria-label="بستن">
            <X size={18} />
          </button>
        </header>

        <div className={styles.wpSearch}>
          <Search size={15} />
          <input
            type="search"
            placeholder="جستجوی ویجت…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.wpBody}>
          {widgets.length === 0 ? (
            <p className={styles.wpEmpty}>
              ویجتی پیدا نشد. ماژول‌های مرتبط را از تب «ماژول‌ها» روشن کنید.
            </p>
          ) : (
            WIDGET_CATEGORIES.map((cat) => {
              const list = grouped[cat.id] || []
              if (!list.length) return null
              return (
                <div key={cat.id} className={styles.wpCat}>
                  <div className={styles.wpCatLabel}>{cat.label}</div>
                  <div className={styles.wpGrid}>
                    {list.map((w) => {
                      const Icon = ICONS[w.icon] || Puzzle
                      const status = w.status || 'planned'
                      return (
                        <button
                          key={w.type}
                          type="button"
                          className={`${styles.wpCard} ${
                            status !== 'ready' ? styles.wpCardPlanned : ''
                          }`}
                          onClick={() => {
                            onPick(w.type)
                            onClose()
                          }}
                        >
                          <span className={styles.wpCardTop}>
                            <span className={styles.wpCardIcon}>
                              <Icon size={18} />
                            </span>
                            {status !== 'ready' ? (
                              <span
                                className={`${styles.wpStatus} ${
                                  status === 'skeleton'
                                    ? styles.wpStatusSkeleton
                                    : styles.wpStatusPlanned
                                }`}
                              >
                                {widgetStatusLabel(status)}
                              </span>
                            ) : null}
                          </span>
                          <strong>{w.label}</strong>
                          <small>{w.desc}</small>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
