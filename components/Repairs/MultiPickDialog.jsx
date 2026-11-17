'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Search, X } from 'lucide-react'
import styles from '@/components/AllBoxItem/components/FilterDialog/FilterDialog.module.css'
import compactStyles from './MultiPickDialog.module.css'

/**
 * دیالوگ چندانتخابی با همان تم طلایی FilterDialog
 */
export default function MultiPickDialog({
  isOpen,
  title,
  options = [],
  values = [],
  loading = false,
  onChange,
  onClose,
  searchable = true,
  doneLabel = 'تأیید انتخاب',
  /** برای باز شدن روی مودال‌های با z-index خیلی بالا (مثل todoservice) */
  zIndex = null,
  /** آیتم‌ها در یک خط، شیت باریک‌تر */
  compact = false,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [local, setLocal] = useState(() => values.map(String))
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) setLocal(values.map(String))
  }, [isOpen, values])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      return undefined
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => {
      if (searchable && searchRef.current) searchRef.current.focus()
    }, 80)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [isOpen, onClose, searchable])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => {
      const hay = [opt.name, opt.title, opt.label, opt.description, opt.meta]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [options, searchTerm])

  const toggle = (id) => {
    const sid = String(id)
    setLocal((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    )
  }

  const confirm = () => {
    onChange?.(local)
    onClose?.()
  }

  if (!mounted || !isOpen) return null

  const showSearch = searchable && (options.length > 6 || searchTerm.length > 0)
  const c = compact

  const content = (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
      style={zIndex != null ? { zIndex } : undefined}
    >
      <div
        className={`${styles.sheet} ${c ? compactStyles.compactSheet : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden />
        <header
          className={`${styles.header} ${c ? compactStyles.compactHeader : ''}`}
        >
          <h4
            className={`${styles.title} ${c ? compactStyles.compactTitle : ''}`}
          >
            {title}
          </h4>
          <button
            type="button"
            className={`${styles.closeBtn} ${c ? compactStyles.compactClose : ''}`}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={c ? 15 : 18} />
          </button>
        </header>

        {showSearch ? (
          <div
            className={`${styles.search} ${c ? compactStyles.compactSearch : ''}`}
          >
            <Search
              size={c ? 14 : 16}
              className={styles.searchIcon}
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="جستجو…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${styles.searchInput} ${
                c ? compactStyles.compactSearchInput : ''
              }`}
              autoComplete="off"
            />
          </div>
        ) : null}

        <div className={`${styles.body} ${c ? compactStyles.compactBody : ''}`}>
          {loading ? (
            <div className={styles.state}>در حال بارگذاری…</div>
          ) : (
            <ul
              className={`${styles.list} ${c ? compactStyles.compactList : ''}`}
              role="listbox"
              aria-multiselectable="true"
            >
              {filtered.length === 0 ? (
                <li className={styles.state}>گزینه‌ای یافت نشد</li>
              ) : (
                filtered.map((opt) => {
                  const id = String(opt.id)
                  const label = opt.name || opt.title || opt.label || id
                  const meta = opt.description || opt.meta || ''
                  const selected = local.includes(id)
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`${styles.option} ${
                          selected ? styles.optionSelected : ''
                        } ${c ? compactStyles.compactOption : ''}`}
                        onClick={() => toggle(id)}
                      >
                        <span
                          className={`${styles.optionText} ${
                            c ? compactStyles.compactOptionText : ''
                          }`}
                        >
                          <span
                            className={`${styles.optionLabel} ${
                              c ? compactStyles.compactOptionLabel : ''
                            }`}
                          >
                            {label}
                          </span>
                          {meta ? (
                            <span
                              className={`${styles.optionMeta} ${
                                c ? compactStyles.compactOptionMeta : ''
                              }`}
                            >
                              {meta}
                            </span>
                          ) : null}
                        </span>
                        {selected ? (
                          <span
                            className={`${styles.check} ${
                              c ? compactStyles.compactCheck : ''
                            }`}
                          >
                            <Check size={c ? 12 : 16} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span
                            className={`${styles.radio} ${
                              c ? compactStyles.compactRadio : ''
                            }`}
                            aria-hidden
                          />
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          )}
        </div>

        <footer
          className={`${styles.footer} ${c ? compactStyles.compactFooter : ''}`}
        >
          <button
            type="button"
            className={`${styles.clearBtn} ${c ? compactStyles.compactClear : ''}`}
            onClick={() => setLocal([])}
          >
            پاک کردن ({local.length})
          </button>
          <button
            type="button"
            className={`${styles.doneBtn} ${c ? compactStyles.compactDone : ''}`}
            onClick={confirm}
          >
            {doneLabel}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
