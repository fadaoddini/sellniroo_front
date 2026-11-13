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
  formatJalaliShort,
  currentJalaliMonth,
  jalaliMonthRange,
  buildJalaliMonthGrid,
  shiftJalaliMonth,
} from '@/components/School/schoolDate'
import styles from './School.module.css'

const STATUS_CLS = {
  present: 'attPresent',
  late: 'attLate',
  excused: 'attExcused',
  absent: 'attAbsent',
}

export default function StudentAttendancePanel({ studentParams = {}, onNotify }) {
  const initial = currentJalaliMonth()
  const [jy, setJy] = useState(initial.jy)
  const [jm, setJm] = useState(initial.jm)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const monthRange = useMemo(() => jalaliMonthRange(jy, jm), [jy, jm])
  const grid = useMemo(() => buildJalaliMonthGrid(jy, jm), [jy, jm])
  const studentKey = studentParams?.student ?? ''

  const load = useCallback(async () => {
    setLoading(true)
    const range = jalaliMonthRange(jy, jm)
    const res = await schoolService.attendanceStudent({
      ...(studentKey ? { student: studentKey } : {}),
      from: range.from,
      to: range.to,
      limit: 120,
    })
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت حضور و غیاب', true)
      return
    }
    setData(res.data)
    setSelected(null)
  }, [studentKey, onNotify, jy, jm])

  useEffect(() => {
    load()
  }, [load])

  const byDate = useMemo(() => {
    const map = {}
    ;(data?.records || []).forEach((r) => {
      if (!r.date) return
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r)
    })
    return map
  }, [data])

  const stats = data?.stats || {}
  const dayRecords = selected ? (byDate[selected] || []) : []

  const goMonth = (delta) => {
    const next = shiftJalaliMonth(jy, jm, delta)
    setJy(next.jy)
    setJm(next.jm)
  }

  if (loading && !data) {
    return <div className={styles.empty}>در حال بارگذاری حضور و غیاب…</div>
  }

  return (
    <div className={styles.attPanel}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>
          <CalendarCheck size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
          حضور و غیاب من
        </h2>
        <button type="button" className={styles.btnGhost} onClick={load}>
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
          <strong>{faNum(stats.attendance_rate)}٪</strong>
        </div>
        <div className={styles.attStat}>
          <span>حاضر</span>
          <strong>{faNum(stats.present)}</strong>
        </div>
        <div className={styles.attStat}>
          <span>غایب</span>
          <strong>{faNum(stats.absent)}</strong>
        </div>
        <div className={styles.attStat}>
          <span>تأخیر</span>
          <strong>{faNum(stats.late)}</strong>
        </div>
        <div className={styles.attStat}>
          <span>موجه</span>
          <strong>{faNum(stats.excused)}</strong>
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
            const rows = byDate[cell.gDate] || []
            const main = rows[0]
            const on = selected === cell.gDate
            let tone = ''
            if (main) {
              if (main.status === 'present') tone = styles.attCalGood
              else if (main.status === 'late' || main.status === 'excused') tone = styles.attCalMid
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
                  tone,
                ].filter(Boolean).join(' ')}
                onClick={() => setSelected(cell.gDate)}
              >
                <span className={styles.attCalNum}>{faNum(cell.jDay)}</span>
                <span className={styles.attCalRate}>
                  {main ? main.status_label : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {selected ? (
        <div className={styles.attSheet}>
          <div className={styles.attSheetHead}>
            <div>
              <strong>{formatJalali(selected, true)}</strong>
              <p>{dayRecords.length ? `${faNum(dayRecords.length)} رکورد` : 'ثبتی برای این روز نیست'}</p>
            </div>
          </div>
          {dayRecords.length ? (
            <div className={styles.attStudentList}>
              {dayRecords.map((r) => (
                <div key={r.id} className={styles.attStudentRow}>
                  <span className={`${styles.attBadge} ${styles[STATUS_CLS[r.status] || 'attPresent']}`}>
                    {r.status_label}
                  </span>
                  <div>
                    <strong>{r.subject}</strong>
                    <span>
                      {formatJalaliShort(r.date)}
                      {r.teacher ? ` · ${r.teacher}` : ''}
                      {r.period ? ` · ${r.period}` : ''}
                    </span>
                    {r.note ? <span>{r.note}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.attSheetBody}>
              <div className={styles.attEmpty} style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}>
                <p>برای این روز حضوری ثبت نشده.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.attEmpty}>
          <p>از تقویم بالا یک روز را انتخاب کنید.</p>
        </div>
      )}

      {(data?.records || []).length ? (
        <div className={styles.attLeader}>
          <h3 className={styles.attLeaderTitle}>جدول {monthRange.label}</h3>
          <div className={`${styles.attDataTable} ${styles.attDataScroll}`}>
            <div className={`${styles.attDataHead} ${styles.attDataCols4}`}>
              <span>تاریخ</span>
              <span>درس</span>
              <span>وضعیت</span>
              <span>معلم</span>
            </div>
            {[...(data.records || [])]
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`${styles.attDataRow} ${styles.attDataCols4} ${selected === r.date ? styles.attDataRowOn : ''}`}
                  onClick={() => setSelected(r.date)}
                >
                  <span>{formatJalaliShort(r.date)}</span>
                  <span>{r.subject || '—'}</span>
                  <span
                    className={
                      r.status === 'absent'
                        ? styles.attAbsentSoft
                        : r.status === 'late' || r.status === 'excused'
                          ? styles.attLateSoft
                          : styles.attPresentSoft
                    }
                  >
                    {r.status_label}
                  </span>
                  <span>{r.teacher || '—'}</span>
                </button>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
