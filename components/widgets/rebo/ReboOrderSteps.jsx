'use client'

import React, { useMemo } from 'react'
import {
  CheckCircle2,
  Cloud,
  FileSignature,
  Globe2,
  Headphones,
  MessageSquareText,
  Rocket,
  Route,
} from 'lucide-react'
import useReboNormalized from './useReboNormalized'
import styles from './ReboOrderSteps.module.css'

const STEP_ICONS = [
  Globe2,
  Cloud,
  MessageSquareText,
  Headphones,
  FileSignature,
  Rocket,
  CheckCircle2,
]

const ACCENTS = [
  '#26a680',
  '#0d9488',
  '#3b82f6',
  '#0f766e',
  '#059669',
  '#1d4ed8',
  '#16a34a',
]

function StepLinks({ links }) {
  if (!Array.isArray(links) || !links.length) return null
  return (
    <div className={styles.links}>
      {links.map((link) => {
        const href = String(link?.href || '').trim()
        const label = String(link?.label || '').trim()
        if (!href || !label) return null
        const external = /^https?:\/\//i.test(href)
        return (
          <a
            key={`${label}-${href}`}
            href={href}
            className={styles.linkChip}
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {label}
          </a>
        )
      })}
    </div>
  )
}

export default function ReboOrderSteps({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(
    raw,
    'rebo_order_steps',
  )

  const steps = useMemo(() => {
    const list = Array.isArray(s.order_steps) ? s.order_steps : []
    return list.filter((row) => row && (row.title || row.text))
  }, [s.order_steps])

  if (!visible || !steps.length) return null

  return (
    <section
      className={styles.section}
      id="rebo-order-steps"
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
                <Route size={13} strokeWidth={2.2} />
                {s.kicker || 'مسیر سفارش'}
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

        <ol className={styles.timeline}>
          {steps.map((step, idx) => {
            const Icon = STEP_ICONS[idx % STEP_ICONS.length]
            const accent = ACCENTS[idx % ACCENTS.length]
            const isLast = idx === steps.length - 1
            const sideClass = idx % 2 === 0 ? styles.stepRight : styles.stepLeft
            return (
              <li
                key={step.id || `step-${idx}`}
                className={`${styles.step} ${sideClass}${
                  isLast ? ` ${styles.stepFinal}` : ''
                }`}
                style={{
                  '--accent': accent,
                  '--i': idx,
                }}
              >
                <div className={styles.rail} aria-hidden>
                  <span className={styles.num}>
                    <span className={styles.numFa}>
                      {(idx + 1).toLocaleString('fa-IR')}
                    </span>
                    <Icon size={16} strokeWidth={2} className={styles.numIcon} />
                  </span>
                  {!isLast ? <span className={styles.line} /> : null}
                </div>

                <article className={styles.body}>
                  <div className={styles.bodyTop}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    {isLast ? (
                      <span className={styles.doneBadge}>شروع کار</span>
                    ) : null}
                  </div>
                  {step.text ? (
                    <p className={styles.stepText}>{step.text}</p>
                  ) : null}
                  <StepLinks links={step.links} />
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
