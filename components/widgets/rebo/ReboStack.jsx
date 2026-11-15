'use client'

import React from 'react'
import useReboNormalized from './useReboNormalized'
import { REBO_STACK } from './reboData'
import styles from './ReboStack.module.css'

export default function ReboStack({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_stack')
  if (!visible) return null

  const eyebrow = (s.eyebrow || 'استک فنی').trim()
  const title = (s.title || 'استک فنی ربو').trim()
  const subtitle = (
    s.subtitle ||
    'هر لایه با ابزار مناسب خودش — از هسته پایتون تا داشبورد مدیریت.'
  ).trim()

  const showEyebrow = s.show_eyebrow !== false && !!eyebrow
  const showTitle = s.show_title !== false && !!title
  const showSubtitle = s.show_subtitle !== false && !!subtitle
  const showHead = showEyebrow || showTitle || showSubtitle

  return (
    <section className={styles.stack} style={style} dir="rtl" lang="fa">
      <div className={styles.glow} aria-hidden />
      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        {showHead ? (
          <header className={styles.head}>
            {showEyebrow ? (
              <p className={styles.eyebrow}>
                <i />
                {eyebrow}
              </p>
            ) : null}
            {showTitle ? <h2 className={styles.title}>{title}</h2> : null}
            {showSubtitle ? (
              <p className={styles.subtitle}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}

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
