'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../../styles/ReboHub.module.css'

function splitSeconds(total) {
  const s = Math.max(0, Math.floor(total || 0))
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
    total: s,
  }
}

function toFaParts(left) {
  const parts = []
  if (left.days > 0) parts.push(`${left.days.toLocaleString('fa-IR')} روز`)
  if (left.hours > 0 || left.days > 0)
    parts.push(`${left.hours.toLocaleString('fa-IR')} ساعت`)
  if (left.mins > 0 || left.hours > 0 || left.days > 0)
    parts.push(`${left.mins.toLocaleString('fa-IR')} دقیقه`)
  parts.push(`${left.secs.toLocaleString('fa-IR')} ثانیه`)
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return parts.join(' و ')
  return `${parts.slice(0, -1).join(' و ')} و ${parts[parts.length - 1]}`
}

/**
 * شمارنده فارسی باقی‌مانده شارژ — مناسب گوشه کارت اشتراک
 */
export default function CloudRemainTimer({
  balance = 0,
  dailyPrice = 0,
  daysRemaining = 0,
  status = '',
  wipeInDays = 0,
  compact = true,
}) {
  const baseSeconds = useMemo(() => {
    if (status === 'grace') {
      return Math.max(0, Number(wipeInDays || 0)) * 86400
    }
    if (status === 'wiped') return 0
    const rate = Math.max(0, Number(dailyPrice || 0))
    const bal = Math.max(0, Number(balance || 0))
    if (rate > 0 && bal > 0) return (bal / rate) * 86400
    return Math.max(0, Number(daysRemaining || 0)) * 86400
  }, [balance, dailyPrice, daysRemaining, status, wipeInDays])

  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const left = splitSeconds(baseSeconds - Math.max(0, (now - startedAt) / 1000))
  const warning = left.total > 0 && left.total < 5 * 86400
  const critical = left.total < 86400
  const text =
    status === 'wiped' || left.total <= 0
      ? 'شارژ تمام شده'
      : toFaParts(left)

  return (
    <div
      className={`${styles.cloudTimerChip} ${
        critical
          ? styles.cloudTimerChipCrit
          : warning
            ? styles.cloudTimerChipWarn
            : ''
      } ${compact ? styles.cloudTimerChipCompact : ''}`}
      role="timer"
      aria-live="polite"
      title="شارژ باقی‌مانده"
    >
      <span className={styles.cloudTimerChipLabel}>باقی‌مانده</span>
      <strong>{text}</strong>
    </div>
  )
}
