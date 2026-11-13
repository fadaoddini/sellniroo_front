'use client'

import React, { useEffect, useState } from 'react'
import moment from 'moment-jalaali'
import { splitRemaining } from '@/config/reboPricing'
import styles from './ReboDiscountCountdown.module.css'

moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' })

function padFa(n) {
  return String(n)
    .padStart(2, '0')
    .replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

export default function ReboDiscountCountdown({
  endsAt,
  percent = 0,
  label = '',
  accent,
}) {
  const endMs = endsAt instanceof Date ? endsAt.getTime() : Date.parse(endsAt)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!Number.isFinite(endMs)) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [endMs])

  if (!Number.isFinite(endMs) || endMs <= now) return null

  const { days, hours, minutes, seconds } = splitRemaining(endMs - now)
  const endLabel = moment(endMs).format('jD jMMMM jYYYY · HH:mm')
  const badge =
    label ||
    (percent > 0
      ? `${percent.toLocaleString('fa-IR')}٪ تخفیف`
      : 'تخفیف ویژه')

  return (
    <div
      className={styles.banner}
      dir="rtl"
      style={accent ? { '--disc-accent': accent } : undefined}
    >
      <div className={styles.top}>
        <span className={styles.badge}>
          <i className={styles.badgeDot} aria-hidden />
          {badge}
        </span>
        <span className={styles.until}>تا {endLabel}</span>
      </div>
      <div className={styles.countdown} aria-label="زمان باقی‌مانده تخفیف">
        <div className={styles.unit}>
          <strong>{padFa(days)}</strong>
          <span>روز</span>
        </div>
        <div className={styles.unit}>
          <strong>{padFa(hours)}</strong>
          <span>ساعت</span>
        </div>
        <div className={styles.unit}>
          <strong>{padFa(minutes)}</strong>
          <span>دقیقه</span>
        </div>
        <div className={styles.unit}>
          <strong>{padFa(seconds)}</strong>
          <span>ثانیه</span>
        </div>
      </div>
    </div>
  )
}
