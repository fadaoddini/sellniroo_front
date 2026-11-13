'use client'

import React, { useMemo } from 'react'
import { Clock3 } from 'lucide-react'
import { faNum, toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

function parseTimeToMinutes(val) {
  if (!val) return null
  const s = String(val).slice(0, 5)
  const m = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

function periodMinutes(period, fallback = 45) {
  const start = parseTimeToMinutes(period?.start_time)
  const end = parseTimeToMinutes(period?.end_time)
  if (start != null && end != null && end > start) return end - start
  return fallback
}

function formatDuration(totalMinutes) {
  if (!totalMinutes) return '۰ دقیقه'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h && m) return `${faNum(h)} ساعت و ${faNum(m)} دقیقه`
  if (h) return `${faNum(h)} ساعت`
  return `${faNum(m)} دقیقه`
}

/** جمع ساعات هر درس در هفته — لحظه‌ای از grid + periods */
export function computeWeeklySubjectHours(periods = [], grid = {}) {
  const periodMap = new Map((periods || []).map((p) => [String(p.id), p]))
  const bySubject = new Map()

  Object.values(grid || {}).forEach((slot) => {
    if (!slot || slot.kind === 'holiday') return
    const period = periodMap.get(String(slot.period))
    if (!period || period.is_break) return
    const title = (slot.display_subject || slot.subject_title || '').trim()
    if (!title) return
    const mins = periodMinutes(period)
    const color = slot.display_color || slot.color || '#2d5a45'
    const prev = bySubject.get(title) || {
      title,
      color,
      sessions: 0,
      minutes: 0,
    }
    prev.sessions += 1
    prev.minutes += mins
    if (!prev.color && color) prev.color = color
    bySubject.set(title, prev)
  })

  return Array.from(bySubject.values()).sort((a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title, 'fa'))
}

export default function TimetableHoursSummary({ periods = [], grid = {} }) {
  const rows = useMemo(
    () => computeWeeklySubjectHours(periods, grid),
    [periods, grid],
  )

  const totalMinutes = useMemo(
    () => rows.reduce((sum, r) => sum + r.minutes, 0),
    [rows],
  )
  const totalSessions = useMemo(
    () => rows.reduce((sum, r) => sum + r.sessions, 0),
    [rows],
  )

  if (!rows.length) {
    return (
      <div className={styles.ttHoursEmpty}>
        <Clock3 size={13} strokeWidth={2} />
        هنوز درسی در هفته ثبت نشده
      </div>
    )
  }

  return (
    <div className={styles.ttHours}>
      <div className={styles.ttHoursHead}>
        <strong>
          <Clock3 size={13} strokeWidth={2} />
          ساعات هفتگی دروس
        </strong>
        <span>
          {faNum(totalSessions)} جلسه · {formatDuration(totalMinutes)}
        </span>
      </div>
      <div className={styles.ttHoursList}>
        {rows.map((r) => {
          const pct = totalMinutes ? Math.round((r.minutes / totalMinutes) * 100) : 0
          return (
            <div
              key={r.title}
              className={styles.ttHoursRow}
              style={{ '--sub-color': r.color || '#2d5a45' }}
            >
              <div className={styles.ttHoursMeta}>
                <i className={styles.ttHoursDot} aria-hidden />
                <em>{r.title}</em>
                <span>{faNum(r.sessions)} جلسه</span>
                <strong>{formatDuration(r.minutes)}</strong>
              </div>
              <div className={styles.ttHoursBarTrack} aria-hidden>
                <div
                  className={styles.ttHoursBarFill}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={styles.ttHoursPct}>{toFaDigits(`${pct}٪`)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
