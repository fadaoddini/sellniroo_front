'use client'

import React from 'react'
import useReboNormalized from './useReboNormalized'
import { REBO_STACK } from './reboData'
import styles from './ReboStack.module.css'

export default function ReboStack({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_stack')
  if (!visible) return null

  const title = s.title || 'استک فنی ربو'
  const subtitle =
    s.subtitle ||
    'هر لایه با ابزار مناسب خودش — از هسته پایتون تا داشبورد مدیریت.'

  return (
    <section className={styles.stack} style={style} dir="rtl" lang="fa">
      <div className={styles.glow} aria-hidden />
      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        {(s.show_headline !== false || s.show_subtitle !== false) && (
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              <i />
              استک فنی
            </p>
            {s.show_headline !== false ? (
              <h2 className={styles.title}>{title}</h2>
            ) : null}
            {s.show_subtitle !== false ? (
              <p className={styles.subtitle}>{subtitle}</p>
            ) : null}
          </header>
        )}

        <ul className={styles.grid}>
          {REBO_STACK.map(({ id, icon: Icon, label, value, hint, accent }) => (
            <li
              key={id}
              className={styles.card}
              style={{ '--accent': accent }}
            >
              <span className={styles.iconWrap} aria-hidden>
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <div className={styles.meta}>
                <p className={styles.label}>{label}</p>
                <p className={styles.value}>{value}</p>
                {hint ? <p className={styles.hint}>{hint}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
