'use client'

import React, { useMemo, useState } from 'react'
import { ArrowDownWideNarrow, ChevronDown } from 'lucide-react'
import FilterDialog from '../FilterDialog/FilterDialog'
import {
  DEFAULT_JOB_SORT,
  JOB_SORT_OPTIONS,
} from '../../constants/sortOptions'
import styles from './SortControl.module.css'

/**
 * مرتب‌سازی کنار سوییچ نمای صفحه
 */
export default function SortControl({
  sortBy = DEFAULT_JOB_SORT,
  onSortChange,
}) {
  const [open, setOpen] = useState(false)

  const current = useMemo(() => {
    const id = sortBy || DEFAULT_JOB_SORT
    return (
      JOB_SORT_OPTIONS.find((o) => o.id === id) || JOB_SORT_OPTIONS[0]
    )
  }, [sortBy])

  return (
    <>
      <button
        type="button"
        className={styles.sortBtn}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`مرتب‌سازی: ${current.name}`}
      >
        <span className={styles.iconWrap} aria-hidden>
          <ArrowDownWideNarrow size={15} strokeWidth={2.35} />
        </span>
        <span className={styles.textCol}>
          <span className={styles.eyebrow}>مرتب‌سازی</span>
          <span className={styles.value}>{current.name}</span>
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.4}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          aria-hidden
        />
      </button>

      <FilterDialog
        isOpen={open}
        title="مرتب‌سازی"
        options={JOB_SORT_OPTIONS}
        value={sortBy || DEFAULT_JOB_SORT}
        showEmpty={false}
        onChange={(v) => onSortChange?.(v || DEFAULT_JOB_SORT)}
        onClose={() => setOpen(false)}
        searchable={false}
        themeStyle={{
          '--ink': '#2A1A0E',
          '--muted': 'rgba(42, 26, 14, 0.58)',
          '--line': 'rgba(42, 26, 14, 0.12)',
          '--gold': '#F4AE52',
          '--gold-deep': '#D4621A',
          '--gold-soft': 'rgba(212, 98, 26, 0.14)',
          '--surface': '#FEF3E2',
        }}
      />
    </>
  )
}
