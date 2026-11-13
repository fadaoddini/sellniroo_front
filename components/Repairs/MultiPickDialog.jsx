'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Search, X } from 'lucide-react'
import styles from '@/components/AllBoxItem/components/FilterDialog/FilterDialog.module.css'

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

  const content = (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden />
        <header className={styles.header}>
          <h4 className={styles.title}>{title}</h4>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </header>

        {showSearch ? (
          <div className={styles.search}>
            <Search size={16} className={styles.searchIcon} aria-hidden />
            <input
              ref={searchRef}
              type="search"
              placeholder="جستجو…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              autoComplete="off"
            />
          </div>
        ) : null}

        <div className={styles.body}>
          {loading ? (
            <div className={styles.state}>در حال بارگذاری…</div>
          ) : (
            <ul className={styles.list} role="listbox" aria-multiselectable="true">
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
                        }`}
                        onClick={() => toggle(id)}
                      >
                        <span className={styles.optionText}>
                          <span className={styles.optionLabel}>{label}</span>
                          {meta ? (
                            <span className={styles.optionMeta}>{meta}</span>
                          ) : null}
                        </span>
                        {selected ? (
                          <span className={styles.check}>
                            <Check size={16} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className={styles.radio} aria-hidden />
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => setLocal([])}
          >
            پاک کردن ({local.length})
          </button>
          <button type="button" className={styles.doneBtn} onClick={confirm}>
            {doneLabel}
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
