'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Eye, Search, X } from 'lucide-react'
import hubStyles from '../styles/GymBodybuildingProfileHub.module.css'

function previewInitials(name, fallback = '؟') {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return fallback
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

export default function GymPreviewPicker({
  items = [],
  value,
  onChange,
  label = 'پیش‌نمایش',
  title = 'انتخاب',
  countNoun = 'مورد',
  triggerPlaceholder = 'انتخاب کنید',
  searchPlaceholder = 'جستجو…',
  emptyLabel = 'موردی یافت نشد',
  fallbackName = (item) => `مورد ${item.id}`,
  getSecondary = () => '',
  getSearchText = (item) =>
    `${item.display_name || item.full_name || ''} ${item.phone || ''}`,
  initialFallback = '؟',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef(null)
  const titleId = 'gym-preview-picker-title'

  const selected = useMemo(
    () => items.find((item) => String(item.id) === String(value)),
    [items, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      String(getSearchText(item) || '')
        .toLowerCase()
        .includes(q),
    )
  }, [items, query, getSearchText])

  const selectedName =
    selected?.display_name || selected?.full_name || triggerPlaceholder
  const selectedSecondary = selected ? getSecondary(selected) : ''

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return undefined
    }
    const t = setTimeout(() => searchRef.current?.focus(), 50)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const dialog =
    open && mounted
      ? createPortal(
          <div
            className={hubStyles.previewOverlay}
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <div
              className={hubStyles.previewDialog}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <div className={hubStyles.previewDialogHead}>
                <div className={hubStyles.previewDialogTitle}>
                  <span className={hubStyles.previewDialogIcon} aria-hidden>
                    <Eye size={15} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h4 id={titleId}>{title}</h4>
                    <p>
                      {items.length} {countNoun} در دسترس
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={hubStyles.previewDialogClose}
                  onClick={() => setOpen(false)}
                  aria-label="بستن"
                >
                  <X size={15} strokeWidth={2.2} />
                </button>
              </div>

              <div className={hubStyles.previewSearch}>
                <Search size={15} strokeWidth={2.2} aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                />
                {query ? (
                  <button
                    type="button"
                    className={hubStyles.previewSearchClear}
                    onClick={() => {
                      setQuery('')
                      searchRef.current?.focus()
                    }}
                    aria-label="پاک کردن جستجو"
                  >
                    <X size={13} strokeWidth={2.4} />
                  </button>
                ) : null}
              </div>

              <div className={hubStyles.previewList} role="listbox">
                {filtered.length === 0 ? (
                  <p className={hubStyles.previewEmpty}>{emptyLabel}</p>
                ) : (
                  filtered.map((item) => {
                    const active = String(item.id) === String(value)
                    const name =
                      item.display_name || item.full_name || fallbackName(item)
                    const secondary = getSecondary(item)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`${hubStyles.previewOption} ${
                          active ? hubStyles.previewOptionActive : ''
                        }`}
                        onClick={() => {
                          onChange(String(item.id))
                          setOpen(false)
                        }}
                      >
                        <span className={hubStyles.previewAvatar} aria-hidden>
                          {previewInitials(name, initialFallback)}
                        </span>
                        <span className={hubStyles.previewOptionMeta}>
                          <strong>{name}</strong>
                          <em>{secondary || '—'}</em>
                        </span>
                        {active ? (
                          <Check
                            size={15}
                            strokeWidth={2.6}
                            className={hubStyles.previewCheck}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div className={hubStyles.previewSelect}>
        <span className={hubStyles.previewSelectLabel}>{label}</span>
        <button
          type="button"
          className={hubStyles.previewTrigger}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={hubStyles.previewTriggerText}>
            <strong>{selectedName}</strong>
            {selectedSecondary ? <em>{selectedSecondary}</em> : null}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={hubStyles.previewSelectIcon}
            aria-hidden
          />
        </button>
      </div>
      {dialog}
    </>
  )
}
