'use client'

import React from 'react'
import { LayoutDashboard } from 'lucide-react'
import ReboDashboardSkeleton from '@/components/widgets/ReboDashboardSkeleton'
import useReboNormalized from './useReboNormalized'
import styles from './ReboDashboard.module.css'

export default function ReboDashboard({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(
    raw,
    'rebo_dashboard',
  )
  if (!visible) return null

  return (
    <section className={styles.section} style={style} dir="rtl" lang="fa">
      <div className={styles.glow} aria-hidden />
      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        <header className={styles.head}>
          {s.show_kicker !== false ? (
            <p className={styles.eyebrow}>
              <LayoutDashboard size={13} strokeWidth={2} />
              {s.kicker || 'پیش‌نمایش داشبورد'}
            </p>
          ) : null}
          {s.title ? <h2 className={styles.title}>{s.title}</h2> : null}
          {s.show_subtitle !== false && s.subtitle ? (
            <p className={styles.subtitle}>{s.subtitle}</p>
          ) : null}
        </header>

        <div className={styles.stage}>
          <ReboDashboardSkeleton theme="dark" />
        </div>

        <p className={styles.hint}>
          تب‌ها را عوض کنید تا اسکلت هر سیستم را ببینید.
        </p>
      </div>
    </section>
  )
}
