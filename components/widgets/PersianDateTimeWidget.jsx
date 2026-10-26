'use client'

import React, { useEffect, useState } from 'react'
import moment from 'moment-jalaali'
import styles from './PersianDateTimeWidget.module.css'

const WEEK_DAYS = {
  Saturday: 'شنبه',
  Sunday: 'یکشنبه',
  Monday: 'دوشنبه',
  Tuesday: 'سه‌شنبه',
  Wednesday: 'چهارشنبه',
  Thursday: 'پنجشنبه',
  Friday: 'جمعه',
}

const MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

function formatDate() {
  const m = moment()
  const day = WEEK_DAYS[m.format('dddd')] || m.format('dddd')
  return `${day} ${m.jDate()} ${MONTH_NAMES[m.jMonth()]} ${m.jYear()}`
}

function formatTime() {
  return moment().format('HH:mm')
}

/**
 * ویجت تاریخ و ساعت شمسی برای صفحه‌ساز
 */
export default function PersianDateTimeWidget() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setDate(formatDate())
      setTime(formatTime())
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  if (!date) return null

  return (
    <div className={styles.wrap} dir="rtl">
      <time className={styles.date} dateTime={moment().format('YYYY-MM-DD')}>
        {date}
      </time>
      <span className={styles.time} dir="ltr">
        {time}
      </span>
    </div>
  )
}
