'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3, BookOpen, CalendarDays, ChevronDown, Loader2,
  Medal, School, Sparkles, X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import ReportCardAnalytics from '@/components/School/ReportCardAnalytics'
import { toFaDigits, currentJalaliMonth } from '@/components/School/schoolDate'
import styles from './School.module.css'

function YearPickerDialog({ open, year, onPick, onClose }) {
  if (!open) return null
  const years = [year - 2, year - 1, year, year + 1]
  return (
    <div className={styles.rcDlgBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.rcDlg}
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب سال"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.rcDlgHead}>
          <div className={styles.rcDlgTitle}>
            <CalendarDays size={15} />
            <h3>سال کارنامه</h3>
          </div>
          <button type="button" className={styles.rcDlgClose} onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </div>
        <div className={styles.rcDlgBody}>
          <div className={styles.rcMonthGrid}>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={`${styles.rcMonthCell} ${y === year ? styles.rcMonthCellOn : ''}`}
                onClick={() => { onPick(y); onClose() }}
              >
                {toFaDigits(y)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentReportChartsPanel({
  studentParams = {},
  onNotify,
}) {
  const initial = currentJalaliMonth()
  const [year, setYear] = useState(initial.jy)
  const [jm] = useState(initial.jm)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [picker, setPicker] = useState(null)

  const studentKey = studentParams?.student ?? ''
  const loadSeq = useRef(0)

  const load = useCallback(async () => {
    const seq = ++loadSeq.current
    setLoading(true)
    setData(null)
    const res = await schoolService.reportCardMine({
      ...(studentKey ? { student: studentKey } : {}),
      year,
      jy: year,
      jm,
    })
    if (seq !== loadSeq.current) return
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بارگذاری نمودار', true)
      return
    }
    setData(res.data)
  }, [studentKey, year, jm, onNotify])

  useEffect(() => { load() }, [load])

  const matrix = data?.matrix
  const rows = matrix?.rows || []
  const monthAvgs = matrix?.month_avgs || []
  const standing = data?.standing || null
  const classRank = standing?.class?.my_rank
  const classTotal = standing?.class?.total_ranked
  const gradeRank = standing?.grade?.my_rank
  const gradeTotal = standing?.grade?.total_ranked

  const highlightJm = useMemo(() => {
    for (let m = 12; m >= 1; m -= 1) {
      if (rows.some((r) => r.cells?.[m - 1]?.score != null)) return m
    }
    return jm
  }, [rows, jm])

  return (
    <div className={`${styles.rcShell} ${styles.rcChartsShell}`}>
      <header className={styles.rcChartsHero}>
        <div className={styles.rcChartsHeroMain}>
          <span className={styles.rcChartsMark} aria-hidden>
            <BarChart3 size={18} strokeWidth={2.2} />
            <Sparkles size={10} className={styles.rcChartsMarkSpark} />
          </span>
          <div>
            <h2>نمودار</h2>
            <p>
              {data?.student?.display_name || 'دانش‌آموز'}
              {data?.student?.class_title ? ` · ${data.student.class_title}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.rcChartsHeroSide}>
          {rows.length ? (
            <div className={styles.rcChartsQuick}>
              <span className={styles.rcChartsQuickPill} title="رتبه کلاس">
                <School size={12} />
                {classRank != null && classTotal
                  ? `${toFaDigits(classRank)}/${toFaDigits(classTotal)}`
                  : '—'}
              </span>
              <span className={styles.rcChartsQuickPill} title="رتبه پایه">
                <Medal size={12} />
                {gradeRank != null && gradeTotal
                  ? `${toFaDigits(gradeRank)}/${toFaDigits(gradeTotal)}`
                  : '—'}
              </span>
            </div>
          ) : null}
          <button type="button" className={styles.rcPickBtnSm} onClick={() => setPicker('year')}>
            <CalendarDays size={13} />
            <span>{toFaDigits(year)}</span>
            <ChevronDown size={13} />
          </button>
        </div>
      </header>

      {loading && !data ? (
        <div className={styles.rcEmpty}>
          <Loader2 size={20} className={styles.rcSpin} />
          <p>بارگذاری…</p>
        </div>
      ) : !rows.length ? (
        <div className={styles.rcEmpty}>
          <BookOpen size={22} />
          <p>برای سال {toFaDigits(year)} نمره‌ای ثبت نشده</p>
        </div>
      ) : (
        <ReportCardAnalytics
          year={year}
          rows={rows}
          monthAvgs={monthAvgs}
          highlightJm={highlightJm}
          standing={standing}
        />
      )}

      <YearPickerDialog
        open={picker === 'year'}
        year={year}
        onPick={setYear}
        onClose={() => setPicker(null)}
      />
    </div>
  )
}
