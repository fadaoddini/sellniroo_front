'use client'

import React, { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { searchLucideIcons, resolveLucideIcon } from '@/utils/lucideIcons'
import styles from './LucideIconPicker.module.css'

/**
 * انتخابگر آیکون Lucide با جستجو
 * @param {{ value: string, onChange: (name: string) => void }} props
 */
export default function LucideIconPicker({ value = 'Home', onChange }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const list = useMemo(() => searchLucideIcons(q), [q])
  const Selected = resolveLucideIcon(value)

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.triggerIcon}>
          <Selected size={16} />
        </span>
        <span className={styles.triggerMeta}>
          <strong>{value || 'Home'}</strong>
          <small>انتخاب آیکون Lucide</small>
        </span>
      </button>

      {open ? (
        <div className={styles.panel}>
          <div className={styles.search}>
            <Search size={14} />
            <input
              type="search"
              placeholder="جستجو در Lucide… (Home، User، Briefcase)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.grid}>
            {list.map((item) => {
              const on = item.name === value
              const Icon = item.Icon
              return (
                <button
                  key={item.name}
                  type="button"
                  className={`${styles.item} ${on ? styles.itemOn : ''}`}
                  title={`${item.label} (${item.name})`}
                  onClick={() => {
                    onChange(item.name)
                    setOpen(false)
                    setQ('')
                  }}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </button>
              )
            })}
            {list.length === 0 ? (
              <p className={styles.empty}>آیکونی پیدا نشد</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
