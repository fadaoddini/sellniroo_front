'use client'

import React from 'react'
import Link from 'next/link'
import styles from '../ReboShowcaseWidget.module.css'
import useReboNormalized from './useReboNormalized'

export default function ReboClosing({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_closing')
  if (!visible) return null

  return (
    <section
      className={`${styles.shell} ${styles.closing}`}
      style={style}
      dir="rtl"
    >
      <div
        className={styles.closingInner}
        style={{ maxWidth: s.max_width ? `${Math.min(s.max_width, 640)}px` : undefined }}
      >
        {s.show_brand !== false ? (
          <p className={styles.closingBrand}>{s.brand}</p>
        ) : null}
        {s.title ? <h2>{s.title}</h2> : null}
        {s.show_subtitle !== false && s.subtitle ? <p>{s.subtitle}</p> : null}
        {s.show_cta !== false ? (
          <Link href={s.cta_href || '/contact'} className={styles.ctaPrimary}>
            {s.cta_label || 'شروع همکاری'}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
