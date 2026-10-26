// NavBarWidget — ویجت منو / همبرگری / پروفایل برای صفحه اصلی
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  LogIn,
  User as UserIcon,
  Home,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchMenuListBySlug } from '@/services/menuLists'
import {
  normalizeNavWidgetSettings,
} from '@/config/navWidgetSettings'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import styles from './NavBarWidget.module.css'

function resolveIcon(name) {
  return resolveLucideIcon(name, Home)
}

/**
 * @param {{
 *   type?: string,
 *   settings?: Record<string, any>,
 * }} props
 */
export default function NavBarWidget({ type = 'nav_bar', settings: rawSettings }) {
  const settings = normalizeNavWidgetSettings(rawSettings)
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])

  const showMenu =
    type === 'hamburger_menu' ||
    type === 'header_menu' ||
    type === 'nav_bar'
  const showProfile = type === 'profile' || type === 'nav_bar'
  const asInlineLinks = type === 'header_menu' || settings.show_menu_items

  useEffect(() => {
    if (!showMenu || !settings.menu_slug) return undefined
    let cancelled = false
    fetchMenuListBySlug(settings.menu_slug, { force: true }).then((menu) => {
      if (cancelled) return
      const list = (menu?.items || []).filter((i) => i.is_active !== false)
      setItems(list)
    })
    return () => {
      cancelled = true
    }
  }, [showMenu, settings.menu_slug])

  const displayName = useMemo(() => {
    if (!user) return ''
    return (
      user.display_name ||
      [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      user.mobile ||
      'کاربر'
    )
  }, [user])

  const avatarUrl =
    user?.avatar_url || user?.profile_image || user?.image || null

  const GuestIcon = resolveIcon(settings.guest_icon)

  return (
    <div
      className={`${styles.bar} ${settings.show_on_mobile === false ? styles.barHideMobile : ''}`}
      dir="rtl"
    >
      {showMenu && settings.show_hamburger && !asInlineLinks ? (
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="منو"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      ) : null}

      {showMenu && asInlineLinks ? (
        <nav className={styles.inlineNav} aria-label="منو">
          {items.map((item) => {
            const Icon = resolveIcon(item.icon)
            return (
              <Link key={item.id} href={item.href || '#'} className={styles.inlineLink}>
                <Icon size={15} />
                <span>{item.label_fa || item.label_en}</span>
              </Link>
            )
          })}
        </nav>
      ) : null}

      <div className={styles.spacer} />

      {showProfile ? (
        isAuthenticated ? (
          settings.profile_mode === 'hidden' ? null : (
            <Link href="/profile" className={styles.profile} title={displayName}>
              <span className={styles.avatar}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" />
                ) : (
                  <UserIcon size={16} />
                )}
              </span>
              {settings.profile_mode === 'avatar_name' ? (
                <span className={styles.profileName}>{displayName}</span>
              ) : null}
            </Link>
          )
        ) : settings.guest_visible ? (
          <Link href={settings.guest_href || '/login'} className={styles.guestBtn}>
            <GuestIcon size={16} />
            <span>{settings.guest_label}</span>
          </Link>
        ) : null
      ) : null}

      {open && showMenu && settings.show_hamburger && !asInlineLinks ? (
        <>
          <button
            type="button"
            className={styles.drawerBackdrop}
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
          />
          <aside className={styles.drawer} aria-label="فهرست منو">
            <div className={styles.drawerHead}>
              <strong>منو</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن">
                <X size={18} />
              </button>
            </div>
            <ul className={styles.drawerList}>
              {items.length === 0 ? (
                <li className={styles.drawerEmpty}>آیتمی در این فهرست نیست</li>
              ) : (
                items.map((item) => {
                  const Icon = resolveIcon(item.icon)
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href || '#'}
                        onClick={() => setOpen(false)}
                        className={styles.drawerLink}
                      >
                        <Icon size={16} />
                        <span>{item.label_fa || item.label_en}</span>
                      </Link>
                    </li>
                  )
                })
              )}
            </ul>
          </aside>
        </>
      ) : null}
    </div>
  )
}
