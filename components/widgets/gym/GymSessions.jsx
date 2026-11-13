'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Clock3, Users, UserRound, Heart } from 'lucide-react'
import {
  DEFAULT_GYM_SESSIONS,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import gymSessionsService from './gymSessionsService'
import styles from './GymSessions.module.css'

const FILTERS = [
  { id: 'all', label: 'همه' },
  { id: 'male', label: 'آقایان' },
  { id: 'female', label: 'بانوان' },
]

function formatTime(value) {
  const raw = String(value || '').trim()
  if (!raw) return '—'
  /* API معمولاً HH:MM:SS برمی‌گرداند */
  const parts = raw.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return raw
}

function capacityPct(current, capacity) {
  const cap = Math.max(1, Number(capacity) || 1)
  const cur = Math.max(0, Number(current) || 0)
  return Math.min(100, Math.round((cur / cap) * 100))
}

function capacityTone(pct) {
  if (pct >= 90) return 'full'
  if (pct >= 65) return 'busy'
  return 'open'
}

export default function GymSessions({ settings: raw = {} }) {
  const s = normalizeGymSettings(raw, DEFAULT_GYM_SESSIONS)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    gymSessionsService.list().then((res) => {
      if (cancelled) return
      setSessions(res.data?.sessions || [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const visible = useMemo(() => {
    if (filter === 'all') return sessions
    return sessions.filter((row) => row.gender === filter)
  }, [sessions, filter])

  const maleCount = sessions.filter((r) => r.gender === 'male').length
  const femaleCount = sessions.filter((r) => r.gender === 'female').length

  return (
    <section className={styles.section} dir="rtl" lang="fa" data-gym-sessions="1">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2>{s.title}</h2>
          <p className={styles.subtitle}>{s.subtitle}</p>
        </header>

        <div className={styles.filters} role="tablist" aria-label="فیلتر سانس">
          {FILTERS.map((f) => {
            const on = filter === f.id
            const count =
              f.id === 'all'
                ? sessions.length
                : f.id === 'male'
                  ? maleCount
                  : femaleCount
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={`${styles.filterBtn} ${on ? styles.filterOn : ''}`}
                onClick={() => setFilter(f.id)}
              >
                <span>{f.label}</span>
                <em>{count}</em>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className={styles.state}>در حال بارگذاری سانس‌ها…</div>
        ) : !visible.length ? (
          <div className={styles.state}>
            هنوز سانسی ثبت نشده. از داشبورد باشگاه سانس اضافه کنید.
          </div>
        ) : (
          <div className={styles.grid}>
            {visible.map((row) => {
              const pct = capacityPct(row.current_count, row.capacity)
              const tone = capacityTone(pct)
              const isFemale = row.gender === 'female'
              const GenderIcon = isFemale ? Heart : UserRound
              return (
                <article
                  key={row.id}
                  className={`${styles.card} ${isFemale ? styles.cardFemale : styles.cardMale}`}
                >
                  <div className={styles.cardTop}>
                    <span
                      className={`${styles.badge} ${isFemale ? styles.badgeFemale : styles.badgeMale}`}
                    >
                      <GenderIcon size={13} strokeWidth={2.2} aria-hidden />
                      {row.gender_display || (isFemale ? 'بانوان' : 'آقایان')}
                    </span>
                    <span className={`${styles.tone} ${styles[`tone_${tone}`]}`}>
                      {tone === 'full'
                        ? 'پر'
                        : tone === 'busy'
                          ? 'نیمه‌پر'
                          : 'جا هست'}
                    </span>
                  </div>

                  <h3 className={styles.name}>{row.name}</h3>

                  <div className={styles.timeRow}>
                    <Clock3 size={15} strokeWidth={2.1} aria-hidden />
                    <span>
                      {formatTime(row.start_time)}
                      <i aria-hidden> — </i>
                      {formatTime(row.end_time)}
                    </span>
                  </div>

                  <div className={styles.capBlock}>
                    <div className={styles.capMeta}>
                      <Users size={14} strokeWidth={2.1} aria-hidden />
                      <span>
                        {Number(row.current_count) || 0} از {Number(row.capacity) || 0}
                      </span>
                      <em>{pct}٪</em>
                    </div>
                    <div
                      className={styles.capTrack}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="ظرفیت سانس"
                    >
                      <i
                        className={`${styles.capFill} ${styles[`fill_${tone}`]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
