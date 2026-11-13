'use client'

import React from 'react'
import useReboNormalized from './useReboNormalized'
import { REBO_PILLARS } from './reboData'
import styles from './ReboPillars.module.css'

export default function ReboPillars({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_pillars')
  if (!visible) return null

  return (
    <section className={styles.pillars} style={style} dir="rtl" lang="fa">
      <div className={styles.glow} aria-hidden />
      <div
        className={styles.inner}
        style={{
          maxWidth: s.max_width ? `${s.max_width}px` : undefined,
        }}
      >
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            <i />
            ارکان موتور
          </p>
          {s.title ? <h2 className={styles.title}>{s.title}</h2> : null}
          {s.show_subtitle !== false && s.subtitle ? (
            <p className={styles.subtitle}>{s.subtitle}</p>
          ) : null}
        </header>

        <div
          className={styles.grid}
          style={{ gap: s.gap ? `${s.gap}px` : undefined }}
        >
          {REBO_PILLARS.map(({ id, icon: Icon, title: t, text, accent }) => (
            <article
              key={id}
              className={styles.card}
              style={{ '--accent': accent }}
            >
              <span className={styles.iconWrap} aria-hidden>
                <span className={styles.iconRing} />
                <Icon size={24} strokeWidth={1.7} />
              </span>
              <h3 className={styles.cardTitle}>{t}</h3>
              <p className={styles.cardText}>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
