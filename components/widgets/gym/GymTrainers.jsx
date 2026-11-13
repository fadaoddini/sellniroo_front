'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Award, Users } from 'lucide-react'
import {
  DEFAULT_GYM_TRAINERS,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import gymTrainersService from './gymTrainersService'
import styles from './GymTrainers.module.css'

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'م'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

function truncate(text, max = 110) {
  const t = String(text || '').trim()
  if (!t) return ''
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export default function GymTrainers({ settings: raw = {} }) {
  const s = normalizeGymSettings(raw, DEFAULT_GYM_TRAINERS)
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    gymTrainersService.list().then((res) => {
      if (cancelled) return
      const list = res.data?.trainers || []
      setTrainers(list)
      setActiveId(list[0]?.id ?? null)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const active = useMemo(
    () => trainers.find((t) => t.id === activeId) || trainers[0] || null,
    [trainers, activeId],
  )

  return (
    <section className={styles.section} dir="rtl" lang="fa" data-gym-trainers="1">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2>{s.title}</h2>
          <p className={styles.subtitle}>{s.subtitle}</p>
        </header>

        {loading ? (
          <div className={styles.state}>در حال بارگذاری مربیان…</div>
        ) : !trainers.length ? (
          <div className={styles.state}>
            هنوز مربی‌ای ثبت نشده. از داشبورد باشگاه مربی اضافه کنید.
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.rail} role="list">
              {trainers.map((t, idx) => {
                const on = (active?.id ?? null) === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="listitem"
                    className={`${styles.railItem} ${on ? styles.railOn : ''}`}
                    onClick={() => setActiveId(t.id)}
                    aria-pressed={on}
                  >
                    <span className={styles.railAvatar} aria-hidden>
                      {t.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatar_url} alt="" />
                      ) : (
                        <em>{initials(t.full_name)}</em>
                      )}
                    </span>
                    <span className={styles.railText}>
                      <strong>{t.full_name}</strong>
                      <small>{t.specialty || 'مربی باشگاه'}</small>
                    </span>
                    <span className={styles.railIndex} aria-hidden>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </button>
                )
              })}
            </div>

            {active ? (
              <article className={styles.spotlight}>
                <div className={styles.photoWrap}>
                  {active.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={active.avatar_url}
                      alt={active.full_name}
                      className={styles.photo}
                    />
                  ) : (
                    <div className={styles.photoFallback} aria-hidden>
                      {initials(active.full_name)}
                    </div>
                  )}
                  <div className={styles.photoGlow} aria-hidden />
                </div>

                <div className={styles.copy}>
                  <p className={styles.role}>
                    <Award size={14} strokeWidth={2.2} aria-hidden />
                    {active.specialty || 'مربی باشگاه'}
                  </p>
                  <h3 className={styles.name}>{active.full_name}</h3>
                  <p className={styles.bio}>
                    {truncate(
                      active.bio ||
                        `مربی ${active.specialty || 'باشگاه'} — کنارته تا مسیر تمرینت مشخص باشه.`,
                      160,
                    )}
                  </p>
                  <div className={styles.meta}>
                    <span>
                      <Users size={14} strokeWidth={2.1} aria-hidden />
                      {Number(active.clients_count) || 0} شاگرد فعال
                    </span>
                  </div>
                </div>
              </article>
            ) : null}

            <div className={styles.mobileGrid}>
              {trainers.map((t) => (
                <article key={`m-${t.id}`} className={styles.mCard}>
                  <div className={styles.mAvatar} aria-hidden>
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar_url} alt="" />
                    ) : (
                      <em>{initials(t.full_name)}</em>
                    )}
                  </div>
                  <h3>{t.full_name}</h3>
                  <p className={styles.mSpec}>{t.specialty || 'مربی باشگاه'}</p>
                  <p className={styles.mBio}>
                    {truncate(
                      t.bio ||
                        `مربی ${t.specialty || 'باشگاه'} — برنامه تمرین مخصوص خودت.`,
                      90,
                    )}
                  </p>
                  <span className={styles.mClients}>
                    <Users size={13} strokeWidth={2.1} aria-hidden />
                    {Number(t.clients_count) || 0} شاگرد
                  </span>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
