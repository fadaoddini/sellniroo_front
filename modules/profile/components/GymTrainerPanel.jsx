'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Dumbbell,
  Loader2,
  Salad,
  Search,
  UserCog,
  Users,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import WorkoutManager from '@/modules/gym/components/WorkoutManager'
import DietManager from '@/modules/gym/components/DietManager'
import ClientTrackingPanel from './ClientTrackingPanel'
import dashStyles from '@/modules/gym/components/BodybuildingDashboard.module.css'
import profileStyles from '../styles/ProfilePage.module.css'
import styles from '../styles/GymTrainerPanel.module.css'

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'و'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

function clientTone(c) {
  if (c?.is_expired) return 'danger'
  const days = Number(c?.days_remaining ?? 0)
  if (c?.is_expiring_soon || (days >= 0 && days <= 7)) return 'warn'
  return 'ok'
}

export default function GymTrainerPanel({ me = null, previewTrainerId = '' }) {
  const { getAuthHeaders } = useAuth() || {}
  const [clients, setClients] = useState([])
  const [trainers, setTrainers] = useState(me?.trainers || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [workoutFor, setWorkoutFor] = useState(null)
  const [dietFor, setDietFor] = useState(null)
  const [trackFor, setTrackFor] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const fallbackSlug =
    me?.trainers?.[0]?.business_slug || me?.site_business_slug || 'site-bodybuilding'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
      const res = await axios.get(Config.endpoints.bodybuilding.myTrainerClients(), {
        headers,
        params: previewTrainerId ? { trainer: previewTrainerId } : {},
      })
      setClients(res.data?.clients || [])
      if (Array.isArray(res.data?.trainers)) setTrainers(res.data.trainers)
    } catch (e) {
      setError(
        e?.response?.data?.detail || e.message || 'دسترسی مربی در دسترس نیست',
      )
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, previewTrainerId])

  useEffect(() => {
    load()
  }, [load])

  const metrics = useMemo(() => {
    let active = 0
    let expiring = 0
    let expired = 0
    clients.forEach((c) => {
      const tone = clientTone(c)
      if (tone === 'danger') expired += 1
      else if (tone === 'warn') expiring += 1
      else active += 1
    })
    return {
      total: clients.length,
      active,
      expiring,
      expired,
    }
  }, [clients])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter((c) => {
      const tone = clientTone(c)
      if (filter === 'active' && tone !== 'ok') return false
      if (filter === 'expiring' && tone !== 'warn') return false
      if (filter === 'expired' && tone !== 'danger') return false
      if (!q) return true
      const hay = `${c.full_name || ''} ${c.phone || ''} ${c.package_title || ''} ${c.session_name || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [clients, query, filter])

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={profileStyles.spinner} size={22} />
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.intro}>
        <h2>
          <UserCog size={16} />
          پنل مربی
        </h2>
        <p>ورزشکاران متصل — فیلتر، جستجو و ساخت سریع برنامه تمرین و غذا.</p>
      </div>

      {trainers?.length ? (
        <div className={styles.trainerContext} aria-label="مربی فعال">
          {trainers.map((t) => (
            <div key={t.id} className={styles.trainerPill}>
              <em>{t.business_name || 'باشگاه'}</em>
              <strong>{t.full_name}</strong>
              <span>
                {t.specialty || 'مربی'} · {faNum(t.clients_count || clients.length)} شاگرد
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.metrics} aria-label="خلاصه شاگردان">
        <div className={styles.metric}>
          <span>کل شاگردان</span>
          <strong>{faNum(metrics.total)}</strong>
        </div>
        <div className={styles.metric}>
          <span>فعال</span>
          <strong>{faNum(metrics.active)}</strong>
        </div>
        <div className={`${styles.metric} ${styles.metricWarn}`}>
          <span>نزدیک انقضا</span>
          <strong>{faNum(metrics.expiring)}</strong>
        </div>
        <div className={`${styles.metric} ${styles.metricDanger}`}>
          <span>منقضی</span>
          <strong>{faNum(metrics.expired)}</strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters} role="tablist" aria-label="فیلتر وضعیت">
          {[
            { id: 'all', label: 'همه', icon: Users },
            { id: 'active', label: 'فعال', icon: CalendarClock },
            { id: 'expiring', label: 'نزدیک انقضا', icon: AlertTriangle },
            { id: 'expired', label: 'منقضی', icon: AlertTriangle },
          ].map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`${styles.chip} ${filter === f.id ? styles.chipOn : ''}`}
                onClick={() => setFilter(f.id)}
              >
                <Icon size={12} />
                {f.label}
              </button>
            )
          })}
        </div>
        <div className={styles.searchBox}>
          <Search size={14} />
          <input
            type="search"
            placeholder="جستجو نام، بسته، موبایل…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? <p className={styles.empty}>{error}</p> : null}

      {!error && !clients.length ? (
        <p className={styles.empty}>
          هنوز ورزشکاری به این مربی وصل نشده است.
        </p>
      ) : null}

      {!error && clients.length && !filtered.length ? (
        <p className={styles.empty}>موردی با این فیلتر پیدا نشد.</p>
      ) : null}

      {filtered.length ? (
        <section className={styles.people} aria-label="شاگردان">
          <div className={styles.peopleHead}>
            <h3>
              <Users size={14} />
              شاگردان
            </h3>
            <span>{faNum(filtered.length)} نفر</span>
          </div>
          <div className={styles.grid}>
            {filtered.map((c) => {
              const tone = clientTone(c)
              const days = Number(c.days_remaining ?? 0)
              const daysLabel = c.is_expired ? 'منقضی' : `${faNum(days)} روز`
              return (
                <article
                  key={c.id}
                  className={`${styles.card} ${
                    tone === 'danger'
                      ? styles.cardExpired
                      : tone === 'warn'
                        ? styles.cardWarn
                        : styles.cardOk
                  }`}
                >
                  <div className={styles.cardAccent} aria-hidden />
                  <div className={styles.cardHead}>
                    <div className={styles.avatar} aria-hidden>
                      {c.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar_url} alt="" />
                      ) : (
                        initials(c.full_name)
                      )}
                    </div>
                    <div className={styles.identity}>
                      <strong>{c.full_name}</strong>
                      <span>{c.phone || '—'}</span>
                    </div>
                    <span
                      className={`${styles.daysBadge} ${
                        tone === 'danger'
                          ? styles.daysDanger
                          : tone === 'warn'
                            ? styles.daysWarn
                            : ''
                      }`}
                    >
                      {daysLabel}
                    </span>
                  </div>

                  <div className={styles.meta}>
                    <span>{c.package_title || 'بدون بسته'}</span>
                    <span>{c.session_name || 'بدون سانس'}</span>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.trackBtn}
                      onClick={() => setTrackFor(c)}
                    >
                      <Activity size={13} />
                      رصد
                    </button>
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={() => setWorkoutFor(c)}
                    >
                      <Dumbbell size={13} />
                      تمرین
                    </button>
                    <button type="button" onClick={() => setDietFor(c)}>
                      <Salad size={13} />
                      غذا
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {workoutFor ? (
        <div className={dashStyles.workoutManagerOverlay}>
          <WorkoutManager
            businessSlug={workoutFor.business_slug || fallbackSlug}
            userId={workoutFor.id}
            userName={workoutFor.full_name}
            onClose={() => setWorkoutFor(null)}
            onSave={() => setWorkoutFor(null)}
          />
        </div>
      ) : null}

      {dietFor ? (
        <div className={dashStyles.workoutManagerOverlay}>
          <DietManager
            businessSlug={dietFor.business_slug || fallbackSlug}
            userId={dietFor.id}
            userName={dietFor.full_name}
            onClose={() => setDietFor(null)}
            onSave={() => setDietFor(null)}
          />
        </div>
      ) : null}

      {trackFor ? (
        <div className={dashStyles.workoutManagerOverlay}>
          <ClientTrackingPanel
            businessSlug={trackFor.business_slug || fallbackSlug}
            member={trackFor}
            onClose={() => setTrackFor(null)}
          />
        </div>
      ) : null}
    </div>
  )
}
