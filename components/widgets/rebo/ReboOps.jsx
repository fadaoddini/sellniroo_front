'use client'

import React from 'react'
import { Headphones } from 'lucide-react'
import ReboOpsPricing from '@/components/widgets/ReboOpsPricing'
import useReboNormalized from './useReboNormalized'
import useReboPricingState from './useReboPricingState'
import styles from './ReboOps.module.css'

export default function ReboOps({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_ops')
  const { pricing } = useReboPricingState()
  if (!visible) return null

  return (
    <section className={styles.ops} id="rebo-ops" style={style} dir="rtl" lang="fa">
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
                <Headphones size={13} strokeWidth={2} />
                {s.kicker || 'زیرساخت'}
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
        <ReboOpsPricing pricing={pricing} styles={styles} />
      </div>
    </section>
  )
}
