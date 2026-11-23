'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import styles from './BreakingNews.module.css'

function buildSearchUrl(href, query) {
  const base = String(href || '/search').trim() || '/search'
  const q = String(query || '').trim()
  if (!q) return base
  // صفحه اختصاصی جستجو و آگهی‌ها: q — لیست اخبار: search
  const param =
    base.startsWith('/search') || base.startsWith('/jobs') ? 'q' : 'search'
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}${param}=${encodeURIComponent(q)}`
}

/**
 * جستجوی نوار خبر فوری
 * mode=bar: فیلد + دکمه + placeholder
 * mode=icon: آیکن کنار پروفایل که با انیمیشن باز می‌شود
 */
export default function NavBarSearch({ settings = {} }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const mode = settings.search_mode === 'bar' ? 'bar' : 'icon'
  const placeholder =
    String(settings.search_placeholder || '').trim() || 'جستجو در سایت…'
  const buttonLabel =
    String(settings.search_button_label || '').trim() || 'جستجو'
  const href = String(settings.search_href || '/search').trim() || '/search'

  const submit = useCallback(
    (e) => {
      e?.preventDefault?.()
      const next = buildSearchUrl(href, query)
      router.push(next)
      setOpen(false)
    },
    [href, query, router],
  )

  useEffect(() => {
    if (!open || mode !== 'icon') return undefined
    const t = window.setTimeout(() => inputRef.current?.focus(), 180)
    return () => window.clearTimeout(t)
  }, [open, mode])

  useEffect(() => {
    if (!open || mode !== 'icon') return undefined
    const onDoc = (ev) => {
      if (wrapRef.current && !wrapRef.current.contains(ev.target)) {
        setOpen(false)
      }
    }
    const onKey = (ev) => {
      if (ev.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, mode])

  if (mode === 'bar') {
    return (
      <form
        className={styles.navSearchBar}
        role="search"
        onSubmit={submit}
        aria-label="جستجو در سایت"
      >
        <Search size={14} className={styles.navSearchGlyph} aria-hidden />
        <input
          type="search"
          className={styles.navSearchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
        />
        <button type="submit" className={styles.navSearchSubmit}>
          {buttonLabel}
        </button>
      </form>
    )
  }

  return (
    <div
      ref={wrapRef}
      className={`${styles.navSearchIconWrap} ${open ? styles.navSearchIconOpen : ''}`}
    >
      {!open ? (
        <button
          type="button"
          className={styles.navSearchIconBtn}
          aria-label="باز کردن جستجو"
          onClick={() => setOpen(true)}
        >
          <Search size={16} strokeWidth={2.2} />
        </button>
      ) : (
        <form
          className={styles.navSearchExpand}
          role="search"
          onSubmit={submit}
          aria-label="جستجو در سایت"
        >
          <Search size={14} className={styles.navSearchGlyph} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            className={styles.navSearchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            enterKeyHint="search"
          />
          <button type="submit" className={styles.navSearchSubmitIcon} aria-label="جستجو">
            <Search size={14} />
          </button>
          <button
            type="button"
            className={styles.navSearchClose}
            aria-label="بستن"
            onClick={() => setOpen(false)}
          >
            <X size={14} />
          </button>
        </form>
      )}
    </div>
  )
}
