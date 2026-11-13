'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarCheck, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  WEEKDAYS_FA,
  MONTHS_FA,
  faNum,
  toFaDigits,
  formatJalali,
  todayGregorian,
  currentJalaliMonth,
  jalaliMonthRange,
  buildJalaliMonthGrid,
  shiftJalaliMonth,
} from '@/components/School/schoolDate'
import styles from './School.module.css'

export default function AdminAttendancePanel({ onNotify }) {
  const initial = currentJalaliMonth()
  const [jy, setJy] = useState(initial.jy)
  const [jm, setJm] = useState(initial.jm)
  const [date, setDate] = useState(todayGregorian())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const monthRange = useMemo(() => jalaliMonthRange(jy, jm), [jy, jm])
  const grid = useMemo(() => buildJalaliMonthGrid(jy, jm), [jy, jm])

  const dayMap = useMemo(() => {
    const map = {}
    ;(data?.daily || []).forEach((d) => {
      if (d?.date) map[d.date] = d
    })
    return map
  }, [data])

  const loadMonth = useCallback(async (focusDate) => {
    setLoading(true)
    const range = jalaliMonthRange(jy, jm)
    const focus = focusDate || (() => {
      const today = todayGregorian()
      if (today >= range.from && today <= range.to) return today
      return range.from
    })()
    const res = await schoolService.attendanceOverview({
      from: range.from,
      to: range.to,
      date: focus,
    })
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت حضور و غیاب', true)
      return
    }
    setData(res.data)
    setDate(res.data?.date || focus)
  }, [jy, jm, onNotify])

  useEffect(() => {
    loadMonth()
  }, [loadMonth])

  const selectDay = async (gDate) => {
    setDate(gDate)
    setLoading(true)
    const range = jalaliMonthRange(jy, jm)
    const res = await schoolService.attendanceOverview({
      from: range.from,
      to: range.to,
      date: gDate,
    })
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا', true)
      return
    }
    setData(res.data)
  }

  const goMonth = (delta) => {
    const next = shiftJalaliMonth(jy, jm, delta)
    setJy(next.jy)
    setJm(next.jm)
  }

  const monthStats = data?.month_stats || {}
  const dayStats = data?.stats || {}
  const dayInfo = dayMap[date]
  const dailySorted = useMemo(
    () => [...(data?.daily || [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data],
  )

  return (
    <div className={styles.attPanel}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>
          <CalendarCheck size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
          رصد حضور و غیاب ماهانه
        </h2>
        <button type="button" className={styles.btnGhost} onClick={() => loadMonth(date)} disabled={loading}>
          <RefreshCw size={13} /> بروزرسانی
        </button>
      </div>

      <div className={styles.attMonthNav}>
        <button type="button" className={styles.btnGhost} onClick={() => goMonth(-1)}>
          <ChevronRight size={16} />
        </button>
        <strong className={styles.attMonthLabel}>
          {MONTHS_FA[jm - 1]} {toFaDigits(jy)}
        </strong>
        <button type="button" className={styles.btnGhost} onClick={() => goMonth(1)}>
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className={styles.attStatsRow}>
        <div className={styles.attStat}>
          <span>نرخ {monthRange.label}</span>
          <strong>{faNum(monthStats.attendance_rate)}٪</strong>
        </div>
        <div className={styles.attStat}>
          <span>جلسات ماه</span>
          <strong>{faNum(monthStats.sessions)}</strong>
        </div>
        <div className={styles.attStat}>
          <span>حاضر</span>
          <strong>{faNum(monthStats.present)}</strong>
        </div>
        <div className={styles.attStat}>
          <span>غایب</span>
          <strong>{faNum(monthStats.absent)}</strong>
        </div>
        <div className={styles.attStat}>
          <span>تأخیر</span>
          <strong>{faNum(monthStats.late)}</strong>
        </div>
      </div>

      <div className={styles.attCal}>
        <div className={styles.attCalHead}>
          {WEEKDAYS_FA.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className={styles.attCalGrid}>
          {grid.map((cell) => {
            if (cell.empty) return <div key={cell.key} className={styles.attCalPad} />
            const info = dayMap[cell.gDate]
            const on = cell.gDate === date
            const rate = info?.attendance_rate ?? info?.rate
            let tone = ''
            if (info && info.total > 0) {
              if (rate >= 85) tone = styles.attCalGood
              else if (rate >= 60) tone = styles.attCalMid
              else tone = styles.attCalBad
            }
            return (
              <button
                key={cell.key}
                type="button"
                className={[
                  styles.attCalDay,
                  on ? styles.attCalDayOn : '',
                  cell.isToday ? styles.attCalToday : '',
                  cell.isFriday ? styles.attCalFri : '',
                  tone,
                ].filter(Boolean).join(' ')}
                onClick={() => selectDay(cell.gDate)}
              >
                <span className={styles.attCalNum}>{faNum(cell.jDay)}</span>
                <span className={info ? styles.attCalRate : styles.attCalRateMuted}>
                  {info && info.total > 0 ? `${faNum(rate)}٪` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.attDayBar}>
        <div>
          <strong>{formatJalali(date, true)}</strong>
          <p>
            {dayInfo && dayInfo.total > 0
              ? `نرخ روز: ${faNum(dayInfo.attendance_rate ?? dayInfo.rate)}٪ · ${faNum(dayInfo.sessions)} جلسه · غایب ${faNum(dayInfo.absent)}`
              : 'جلسه‌ای در این روز ثبت نشده'}
          </p>
        </div>
        <div className={styles.attSummaryPills}>
          <span className={styles.attPresent}>حاضر {faNum(dayStats.present)}</span>
          <span className={styles.attLate}>تأخیر {faNum(dayStats.late)}</span>
          <span className={styles.attExcused}>موجه {faNum(dayStats.excused)}</span>
          <span className={styles.attAbsent}>غایب {faNum(dayStats.absent)}</span>
        </div>
      </div>

      {(data?.sessions || []).length ? (
        <div className={styles.attLeader}>
          <h3 className={styles.attLeaderTitle}>جلسات {formatJalali(date)}</h3>
          <div className={styles.attDataTable}>
            <div className={styles.attDataHead}>
              <span>درس / معلم</span>
              <span>حاضر</span>
              <span>غایب</span>
              <span>تأخیر</span>
              <span>نرخ</span>
            </div>
            {data.sessions.map((s) => {
              const total = (s.present_count || 0) + (s.absent_count || 0) + (s.late_count || 0) + (s.excused_count || 0)
              const pish = (s.present_count || 0) + (s.late_count || 0) + (s.excused_count || 0)
              const rate = total ? Math.round((pish / total) * 100) : 0
              return (
                <div key={s.id} className={styles.attDataRow}>
                  <span>
                    {s.subject_title || s.title || 'عمومی'}
                    {s.teacher_name ? ` · ${s.teacher_name}` : ''}
                  </span>
                  <span className={styles.attPresentSoft}>{faNum(s.present_count)}</span>
                  <span className={styles.attAbsentSoft}>{faNum(s.absent_count)}</span>
                  <span className={styles.attLateSoft}>{faNum(s.late_count)}</span>
                  <span>{faNum(rate)}٪</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {dailySorted.length ? (
        <div className={styles.attLeader}>
          <h3 className={styles.attLeaderTitle}>جدول روزهای {monthRange.label}</h3>
          <div className={`${styles.attDataTable} ${styles.attDataScroll}`}>
            <div className={styles.attDataHead}>
              <span>تاریخ</span>
              <span>جلسه</span>
              <span>حاضر</span>
              <span>غایب</span>
              <span>نرخ</span>
            </div>
            {dailySorted.map((d) => (
              <button
                key={d.date}
                type="button"
                className={`${styles.attDataRow} ${d.date === date ? styles.attDataRowOn : ''}`}
                onClick={() => selectDay(d.date)}
              >
                <span>{formatJalali(d.date)}</span>
                <span>{faNum(d.sessions)}</span>
                <span className={styles.attPresentSoft}>{faNum(d.present)}</span>
                <span className={styles.attAbsentSoft}>{faNum(d.absent)}</span>
                <span>{faNum(d.attendance_rate ?? d.rate)}٪</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.attEmpty}>
          <p>در {monthRange.label} هنوز جلسه‌ای ثبت نشده است.</p>
        </div>
      )}

      {(data?.by_teacher || []).length ? (
        <div className={styles.attLeader}>
          <h3 className={styles.attLeaderTitle}>معلمان · {monthRange.label}</h3>
          <div className={`${styles.attDataTable} ${styles.attDataScroll}`}>
            <div className={`${styles.attDataHead} ${styles.attDataCols3}`}>
              <span>معلم</span>
              <span>جلسه</span>
              <span>نرخ</span>
              <span>غایب</span>
            </div>
            {data.by_teacher.map((t) => (
              <div key={t.teacher_id} className={`${styles.attDataRow} ${styles.attDataCols3}`}>
                <span>{t.display_name}</span>
                <span>{faNum(t.sessions)}</span>
                <span>{faNum(t.rate)}٪</span>
                <span className={styles.attAbsentSoft}>{faNum(t.absent)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
