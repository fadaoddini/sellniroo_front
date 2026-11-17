'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Cloud,
  Headphones,
  MessageSquareText,
  Package,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react'
import useReboNormalized from './useReboNormalized'
import styles from './ReboSetupCosts.module.css'

const ICONS = {
  package: Package,
  server: Cloud,
  support: Headphones,
  sms: MessageSquareText,
  ssl: ShieldCheck,
}

const ACCENTS = [
  '#26a680',
  '#0d9488',
  '#3b82f6',
  '#059669',
  '#1d4ed8',
]

function usePortalLock(open, onClose) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return ready
}

function CostDialog({ open, onClose, item, accent, Icon }) {
  const ready = usePortalLock(open, onClose)
  if (!open || !ready || !item) return null

  return createPortal(
    <div className={styles.dialogRoot} role="presentation">
      <button
        type="button"
        className={styles.dialogBackdrop}
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        style={{ '--accent': accent }}
        dir="rtl"
        lang="fa"
      >
        <header className={styles.dialogHead}>
          <div className={styles.dialogBrand}>
            <span className={styles.dialogIcon} aria-hidden>
              <Icon size={18} strokeWidth={1.85} />
            </span>
            <div>
              <p className={styles.dialogKicker}>جزئیات هزینه</p>
              <h3 className={styles.dialogTitle}>{item.title}</h3>
            </div>
          </div>
          <button
            type="button"
            className={styles.dialogClose}
            aria-label="بستن"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>
        <div className={styles.dialogBody}>
          {item.amount_label ? (
            <p className={styles.dialogAmount}>{item.amount_label}</p>
          ) : null}
          {item.text ? <p className={styles.dialogText}>{item.text}</p> : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function ReboSetupCosts({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(
    raw,
    'rebo_setup_costs',
  )
  const [active, setActive] = useState(null)

  const items = useMemo(() => {
    const list = Array.isArray(s.setup_cost_items) ? s.setup_cost_items : []
    return list.filter((row) => row && (row.title || row.text)).slice(0, 5)
  }, [s.setup_cost_items])

  const footer = String(s.setup_cost_footer || '').trim()

  if (!visible || !items.length) return null

  const activeItem = active != null ? items[active] : null
  const ActiveIcon = ICONS[activeItem?.icon] || Package
  const activeAccent =
    active != null ? ACCENTS[active % ACCENTS.length] : ACCENTS[0]

  return (
    <section
      className={styles.section}
      id="rebo-setup-costs"
      style={style}
      dir="rtl"
      lang="fa"
    >
      <div className={styles.glow} aria-hidden />
      <div className={styles.mesh} aria-hidden />
      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        {s.show_kicker !== false ||
        (s.show_title !== false && s.title) ||
        (s.show_subtitle !== false && s.subtitle) ? (
          <header className={styles.head}>
            {s.show_kicker !== false ? (
              <p className={styles.eyebrow}>
                <Wallet size={12} strokeWidth={2.2} />
                {s.kicker || 'هزینه‌های راه‌اندازی'}
              </p>
            ) : null}
            {s.show_title !== false && s.title ? (
              <h2 className={styles.title}>{s.title}</h2>
            ) : null}
            {s.show_subtitle !== false && s.subtitle ? (
              <p className={styles.subtitle}>{s.subtitle}</p>
            ) : null}
          </header>
        ) : null}

        <ul className={styles.grid}>
          {items.map((item, idx) => {
            const Icon = ICONS[item.icon] || Package
            const accent = ACCENTS[idx % ACCENTS.length]
            return (
              <li key={item.id || `cost-${idx}`} className={styles.cell}>
                <button
                  type="button"
                  className={styles.card}
                  style={{ '--accent': accent, '--i': idx }}
                  onClick={() => setActive(idx)}
                  aria-haspopup="dialog"
                >
                  <span className={styles.icon} aria-hidden>
                    <Icon size={16} strokeWidth={1.85} />
                  </span>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  {item.amount_label ? (
                    <p className={styles.amount}>{item.amount_label}</p>
                  ) : null}
                  <span className={styles.hint}>جزئیات</span>
                </button>
              </li>
            )
          })}
        </ul>

        {footer ? (
          <aside className={styles.footer} role="note">
            <p>{footer}</p>
          </aside>
        ) : null}
      </div>

      <CostDialog
        open={active != null}
        onClose={() => setActive(null)}
        item={activeItem}
        accent={activeAccent}
        Icon={ActiveIcon}
      />
    </section>
  )
}
