// FilterDialog — دیالوگ انتخاب فیلتر (تم طلایی سلنیرو)
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Search, ChevronDown } from 'lucide-react'
import styles from './FilterDialog.module.css'

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {string} props.title
 * @param {Array<{id:string|number, name?:string, title?:string, label?:string}>} props.options
 * @param {string|number} props.value
 * @param {string} [props.emptyLabel] — گزینه «همه»
 * @param {boolean} [props.loading]
 * @param {(value: string) => void} props.onChange
 * @param {() => void} props.onClose
 * @param {boolean} [props.searchable]
 */
export default function FilterDialog({
  isOpen,
  title,
  options = [],
  value = '',
  emptyLabel = 'همه',
  showEmpty = true,
  loading = false,
  onChange,
  onClose,
  searchable = true,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      const label = String(opt.name || opt.title || opt.label || '')
      return label.toLowerCase().includes(q)
    })
  }, [options, searchTerm])

  const showSearch = searchable && (options.length > 6 || searchTerm.length > 0)

  const pick = (next) => {
    onChange?.(String(next ?? ''))
    onClose?.()
  }

  if (!mounted || !isOpen) return null

  const content = (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden />

        <header className={styles.header}>
          <h4 id="filter-picker-title" className={styles.title}>
            {title}
          </h4>
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
              enterKeyHint="search"
              autoComplete="off"
            />
            {searchTerm ? (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchTerm('')}
                aria-label="پاک کردن جستجو"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={styles.body} ref={listRef}>
          {loading ? (
            <div className={styles.state}>در حال بارگذاری…</div>
          ) : (
            <ul className={styles.list} role="listbox" aria-label={title}>
              {showEmpty ? (
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!value}
                    className={`${styles.option} ${!value ? styles.optionSelected : ''}`}
                    onClick={() => pick('')}
                  >
                    <span className={styles.optionLabel}>{emptyLabel}</span>
                    {!value ? (
                      <span className={styles.check}>
                        <Check size={16} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className={styles.radio} aria-hidden />
                    )}
                  </button>
                </li>
              ) : null}
              {filtered.length === 0 ? (
                <li className={styles.state}>گزینه‌ای یافت نشد</li>
              ) : (
                filtered.map((opt) => {
                  const id = String(opt.id)
                  const label = opt.name || opt.title || opt.label || id
                  const selected = String(value) === id
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                        onClick={() => pick(id)}
                      >
                        <span className={styles.optionLabel}>{label}</span>
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
          {value ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => pick('')}
            >
              پاک کردن انتخاب
            </button>
          ) : (
            <span className={styles.footerHint}>یک گزینه را لمس کنید</span>
          )}
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            بستن
          </button>
        </footer>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

/**
 * دکمهٔ تریگر شبیه select — بازکننده دیالوگ
 */
export function FilterSelectTrigger({
  label,
  displayValue,
  placeholder,
  disabled = false,
  onClick,
  icon: Icon,
}) {
  return (
    <div className={styles.triggerGroup}>
      {label ? (
        <span className={styles.triggerLabel}>
          {Icon ? <Icon size={12} /> : null}
          {label}
        </span>
      ) : null}
      <button
        type="button"
        className={`${styles.trigger} ${displayValue ? styles.triggerFilled : ''} ${disabled ? styles.triggerDisabled : ''}`}
        onClick={onClick}
        disabled={disabled}
        aria-haspopup="dialog"
      >
        <span className={styles.triggerText}>
          {displayValue || placeholder}
        </span>
        <ChevronDown size={16} className={styles.triggerChevron} aria-hidden />
      </button>
    </div>
  )
}
