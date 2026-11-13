'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Unlock,
  Save,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Timer,
  Percent,
  Layers,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  WEEKDAYS_FA,
  MONTHS_FA,
  faNum,
  toFaDigits,
  formatJalali,
  formatJalaliShort,
  todayGregorian,
  currentJalaliMonth,
  jalaliMonthRange,
  buildJalaliMonthGrid,
  shiftJalaliMonth,
} from '@/components/School/schoolDate'
import styles from './School.module.css'

const STATUS = [
  { id: 'present', label: 'حاضر', short: 'ح', cls: 'attPresent' },
  { id: 'late', label: 'تأخیر', short: 'ت', cls: 'attLate' },
  { id: 'excused', label: 'موجه', short: 'م', cls: 'attExcused' },
  { id: 'absent', label: 'غایب', short: 'غ', cls: 'attAbsent' },
]

export default function AttendancePanel({
  teacherId = null,
  subjects = [],
  onNotify,
}) {
  const initial = currentJalaliMonth()
  const [jy, setJy] = useState(initial.jy)
  const [jm, setJm] = useState(initial.jm)
  const [date, setDate] = useState(todayGregorian())
  const [subjectId, setSubjectId] = useState('')
  const [session, setSession] = useState(null)
  const [draft, setDraft] = useState({})
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentQuery, setStudentQuery] = useState('')

  const teacherParams = useMemo(
    () => (teacherId ? { teacher: teacherId } : {}),
    [teacherId],
  )

  const monthRange = useMemo(() => jalaliMonthRange(jy, jm), [jy, jm])
  const grid = useMemo(() => buildJalaliMonthGrid(jy, jm), [jy, jm])

  const dayMap = useMemo(() => {
    const map = {}
    ;(stats?.daily || []).forEach((d) => {
      if (d?.date) map[d.date] = d
    })
    if (!Object.keys(map).length) {
      ;(sessions || []).forEach((s) => {
        if (!s?.date) return
        const sum = s.summary || {}
        const prev = map[s.date] || {
          date: s.date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          rate: 0,
          sessions: 0,
        }
        prev.total += sum.total || 0
        prev.present += sum.present || 0
        prev.absent += sum.absent || 0
        prev.late += sum.late || 0
        prev.excused += sum.excused || 0
        prev.sessions = (prev.sessions || 0) + 1
        const presentish = prev.present + prev.late + prev.excused
        prev.rate = prev.total ? Math.round((presentish / prev.total) * 100) : 0
        map[s.date] = prev
      })
    }
    return map
  }, [stats, sessions])

  const studentRows = useMemo(() => {
    const rows = stats?.students || []
    const q = studentQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((s) => {
      const hay = `${s.display_name || ''} ${s.grade || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [stats, studentQuery])

  const loadMonth = useCallback(async () => {
    const range = jalaliMonthRange(jy, jm)
    const [list, st] = await Promise.all([
      schoolService.attendanceSessions({
        ...teacherParams,
        from: range.from,
        to: range.to,
        limit: 100,
      }),
      schoolService.attendanceStats({
        ...teacherParams,
        from: range.from,
        to: range.to,
      }),
    ])
    if (list.success) setSessions(list.data || [])
    if (st.success) setStats(st.data)
  }, [teacherParams, jy, jm])

  useEffect(() => {
    loadMonth()
  }, [loadMonth])

  useEffect(() => {
    const inMonth = grid.some((c) => !c.empty && c.gDate === date)
    if (!inMonth) {
      const today = todayGregorian()
      const todayIn = grid.some((c) => !c.empty && c.gDate === today)
      setDate(todayIn ? today : monthRange.from)
      setSession(null)
    }
  }, [jy, jm]) // eslint-disable-line react-hooks/exhaustive-deps

  const openSession = async (id) => {
    setBusy(true)
    const res = await schoolService.getAttendanceSession(id, teacherParams)
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بارگذاری جلسه', true)
      return
    }
    setSession(res.data)
    if (res.data?.date) setDate(res.data.date)
    const next = {}
    ;(res.data.records || []).forEach((r) => {
      next[r.student] = { status: r.status, note: r.note || '' }
    })
    setDraft(next)
  }

  const startSession = async (gDate = date) => {
    setBusy(true)
    const res = await schoolService.createAttendanceSession(
      {
        date: gDate,
        subject_id: subjectId || null,
        title: 'حضور و غیاب',
        default_status: 'present',
      },
      teacherParams,
    )
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'ساخت جلسه ناموفق بود', true)
      return
    }
    setDate(gDate)
    setSession(res.data)
    const next = {}
    ;(res.data.records || []).forEach((r) => {
      next[r.student] = { status: r.status, note: r.note || '' }
    })
    setDraft(next)
    onNotify?.(res.message || 'جلسه آماده است')
    loadMonth()
  }

  const selectDay = async (gDate) => {
    setDate(gDate)
    const existing = (sessions || []).find((s) => s.date === gDate)
    if (existing) {
      await openSession(existing.id)
      return
    }
    setSession(null)
    setDraft({})
  }

  const setStatus = (studentId, status) => {
    setDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status,
        note: prev[studentId]?.note || '',
      },
    }))
  }

  const setNote = (studentId, note) => {
    setDraft((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'present',
        note,
      },
    }))
  }

  const markAll = async (status) => {
    if (!session) return
    setSaving(true)
    const res = await schoolService.markAttendance(
      session.id,
      { mark_all: status },
      teacherParams,
    )
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا', true)
      return
    }
    setSession(res.data)
    const next = {}
    ;(res.data.records || []).forEach((r) => {
      next[r.student] = { status: r.status, note: r.note || '' }
    })
    setDraft(next)
    onNotify?.(`همه «${STATUS.find((s) => s.id === status)?.label}» شدند`)
    loadMonth()
  }

  const save = async () => {
    if (!session) return
    const records = Object.entries(draft).map(([student_id, row]) => ({
      student_id: Number(student_id),
      status: row.status,
      note: row.note || '',
    }))
    setSaving(true)
    const res = await schoolService.markAttendance(
      session.id,
      { records },
      teacherParams,
    )
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره ناموفق بود', true)
      return
    }
    setSession(res.data)
    onNotify?.('حضور و غیاب ذخیره شد')
    loadMonth()
  }

  const toggleLock = async () => {
    if (!session) return
    const res = await schoolService.updateAttendanceSession(
      session.id,
      { is_locked: !session.is_locked },
      teacherParams,
    )
    if (!res.success) {
      onNotify?.(res.error || 'خطا', true)
      return
    }
    setSession(res.data)
    onNotify?.(res.data.is_locked ? 'جلسه قفل شد' : 'قفل برداشته شد')
  }

  const goMonth = (delta) => {
    const next = shiftJalaliMonth(jy, jm, delta)
    setJy(next.jy)
    setJm(next.jm)
  }

  const summary = session?.summary || {}
  const locked = !!session?.is_locked
  const dayInfo = dayMap[date]
  const subjectOptions = subjects || []
  const studentTotal = (stats?.students || []).length
  const kpi = [
    {
      key: 'rate',
      label: 'نرخ حضور ماه',
      value: `${faNum(stats?.attendance_rate ?? 0)}٪`,
      hint: monthRange.label,
      icon: Percent,
      tone: 'ok',
    },
    {
      key: 'students',
      label: 'تعداد دانش‌آموزان',
      value: faNum(studentTotal),
      hint: studentQuery ? `${faNum(studentRows.length)} در فیلتر` : 'در این ماه',
      icon: Users,
      tone: 'default',
    },
    {
      key: 'present',
      label: 'حاضر',
      value: faNum(stats?.present ?? 0),
      hint: 'ثبت‌های حاضر',
      icon: UserCheck,
      tone: 'ok',
    },
    {
      key: 'absent',
      label: 'غایب',
      value: faNum(stats?.absent ?? 0),
      hint: 'ثبت‌های غیبت',
      icon: UserX,
      tone: 'danger',
    },
    {
      key: 'late',
      label: 'تأخیر',
      value: faNum(stats?.late ?? 0),
      hint: 'با تأخیر',
      icon: Timer,
      tone: 'warn',
    },
    {
      key: 'sessions',
      label: 'جلسات',
      value: faNum(stats?.sessions_count ?? sessions.length ?? 0),
      hint: 'در ماه جاری',
      icon: Layers,
      tone: 'info',
    },
  ]

  return (
    <div className={styles.attPanel}>
      <div className={styles.attTopBar}>
        <div>
          <h2 className={styles.attTitle}>
            <CalendarCheck size={17} strokeWidth={2.2} aria-hidden />
            حضور و غیاب
          </h2>
          <p className={styles.attLead}>
            تقویم ماهانه و وضعیت دانش‌آموزان در یک نگاه
          </p>
        </div>
        <div className={styles.attMonthNav}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => goMonth(-1)}
            aria-label="ماه قبل"
          >
            <ChevronRight size={16} />
          </button>
          <strong className={styles.attMonthLabel}>
            {MONTHS_FA[jm - 1]} {toFaDigits(jy)}
          </strong>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => goMonth(1)}
            aria-label="ماه بعد"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={loadMonth}
            disabled={busy}
          >
            <RefreshCw size={13} /> بروزرسانی
          </button>
        </div>
      </div>

      <div className={styles.attKpiGrid}>
        {kpi.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.key}
              className={`${styles.attKpi} ${styles[`attKpi_${card.tone}`] || ''}`}
            >
              <span className={styles.attKpiIcon} aria-hidden>
                <Icon size={15} strokeWidth={2.2} />
              </span>
              <div>
                <span className={styles.attKpiLabel}>{card.label}</span>
                <strong>{card.value}</strong>
                <em>{card.hint}</em>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.attSplit}>
        <section className={styles.attMainCol}>
          <div className={styles.attCard}>
            <div className={styles.attCardHead}>
              <h3>جدول روزهای هفته</h3>
              <p>
                {dayInfo
                  ? `انتخاب‌شده: ${formatJalali(date, true)} · نرخ ${faNum(dayInfo.rate)}٪`
                  : `انتخاب‌شده: ${formatJalali(date, true)}`}
              </p>
            </div>

            <div className={styles.attCal}>
              <div className={styles.attCalHead}>
                {WEEKDAYS_FA.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className={styles.attCalGrid}>
                {grid.map((cell) => {
                  if (cell.empty) {
                    return <div key={cell.key} className={styles.attCalPad} />
                  }
                  const info = dayMap[cell.gDate]
                  const on = cell.gDate === date
                  const rate = info?.rate
                  let tone = ''
                  if (info) {
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
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => selectDay(cell.gDate)}
                    >
                      <span className={styles.attCalNum}>{faNum(cell.jDay)}</span>
                      {info ? (
                        <span className={styles.attCalRate}>{faNum(rate)}٪</span>
                      ) : (
                        <span className={styles.attCalRateMuted}>—</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.attDayBar}>
              <div>
                <strong>{formatJalali(date, true)}</strong>
                <p>
                  {dayInfo
                    ? `نرخ روز: ${faNum(dayInfo.rate)}٪ · غایب ${faNum(dayInfo.absent)} · تأخیر ${faNum(dayInfo.late)}`
                    : 'برای این روز هنوز جلسه‌ای ثبت نشده'}
                </p>
              </div>
              <div className={styles.attToolbar}>
                <label className={styles.field}>
                  <span>درس</span>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                  >
                    <option value="">عمومی / همه</option>
                    {subjectOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.btnAccent}
                  onClick={() => startSession(date)}
                  disabled={busy}
                >
                  <Users size={14} />
                  {busy ? '…' : session ? 'باز کردن مجدد' : 'ثبت حضور این روز'}
                </button>
              </div>
            </div>
          </div>

          {session ? (
            <div className={styles.attSheet}>
              <div className={styles.attSheetHead}>
                <div>
                  <strong>{session.title}</strong>
                  <p>
                    {formatJalaliShort(session.date)}
                    {session.subject_title
                      ? ` · ${session.subject_title}`
                      : ' · عمومی'}
                    {locked ? ' · قفل‌شده' : ''}
                    {' · '}
                    {faNum((session.records || []).length)} دانش‌آموز
                  </p>
                </div>
                <div className={styles.attSummaryPills}>
                  <span className={styles.attPresent}>
                    حاضر {faNum(summary.present)}
                  </span>
                  <span className={styles.attLate}>
                    تأخیر {faNum(summary.late)}
                  </span>
                  <span className={styles.attExcused}>
                    موجه {faNum(summary.excused)}
                  </span>
                  <span className={styles.attAbsent}>
                    غایب {faNum(summary.absent)}
                  </span>
                  <span>{faNum(summary.attendance_rate)}٪</span>
                </div>
              </div>

              <div className={styles.attSheetBody}>
                <div className={styles.attQuickRow} style={{ padding: 0 }}>
                  {STATUS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={styles.btnGhost}
                      disabled={locked || saving}
                      onClick={() => markAll(s.id)}
                    >
                      همه {s.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={toggleLock}
                  >
                    {locked ? <Unlock size={13} /> : <Lock size={13} />}
                    {locked ? 'باز کردن قفل' : 'قفل جلسه'}
                  </button>
                  <button
                    type="button"
                    className={styles.btnAccent}
                    disabled={locked || saving}
                    onClick={save}
                  >
                    {saving ? <Clock size={13} /> : <Save size={13} />}
                    ذخیره
                  </button>
                </div>
              </div>

              <div className={styles.attTable}>
                <div className={`${styles.attRow} ${styles.attRowHead}`}>
                  <span>#</span>
                  <span>دانش‌آموز</span>
                  <span>وضعیت</span>
                  <span>یادداشت</span>
                </div>
                {(session.records || []).map((r, idx) => {
                  const d = draft[r.student] || {
                    status: r.status,
                    note: r.note || '',
                  }
                  return (
                    <div key={r.id} className={`${styles.attRow} ${styles.attRowSheet}`}>
                      <span className={styles.attRowIndex}>{faNum(idx + 1)}</span>
                      <div className={styles.attName}>
                        <strong>{r.student_name}</strong>
                        {r.student_grade ? <em>{r.student_grade}</em> : null}
                      </div>
                      <div className={styles.attStatusBtns}>
                        {STATUS.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            disabled={locked}
                            className={`${styles.attStatusBtn} ${styles[s.cls]} ${
                              d.status === s.id ? styles.attStatusBtnOn : ''
                            }`}
                            onClick={() => setStatus(r.student, s.id)}
                            title={s.label}
                          >
                            {d.status === s.id ? <Check size={12} /> : s.short}
                          </button>
                        ))}
                      </div>
                      <input
                        className={styles.attNote}
                        disabled={locked}
                        value={d.note || ''}
                        placeholder="یادداشت…"
                        onChange={(e) => setNote(r.student, e.target.value)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className={styles.attEmpty}>
              <p>روز {formatJalali(date)} را از تقویم انتخاب کنید.</p>
              <p>
                سپس «ثبت حضور این روز» را بزنید تا لیست دانش‌آموزان باز شود.
              </p>
            </div>
          )}

          {Object.keys(dayMap).length ? (
            <div className={styles.attCard}>
              <div className={styles.attCardHead}>
                <h3>خلاصه روزهای {monthRange.label}</h3>
                <p>{faNum(Object.keys(dayMap).length)} روز دارای ثبت</p>
              </div>
              <div className={`${styles.attDataTable} ${styles.attDataScroll}`}>
                <div className={styles.attDataHead}>
                  <span>تاریخ</span>
                  <span>جلسه</span>
                  <span>حاضر</span>
                  <span>غایب</span>
                  <span>نرخ</span>
                </div>
                {Object.values(dayMap)
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      className={`${styles.attDataRow} ${
                        d.date === date ? styles.attDataRowOn : ''
                      }`}
                      onClick={() => selectDay(d.date)}
                    >
                      <span>{formatJalali(d.date)}</span>
                      <span>{faNum(d.sessions || 1)}</span>
                      <span className={styles.attPresentSoft}>
                        {faNum(d.present)}
                      </span>
                      <span className={styles.attAbsentSoft}>
                        {faNum(d.absent)}
                      </span>
                      <span>{faNum(d.rate)}٪</span>
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </section>

        <aside className={styles.attSideCol}>
          <div className={styles.attCard}>
            <div className={styles.attCardHead}>
              <h3>لیست دانش‌آموزان</h3>
              <p>
                <strong className={styles.attCountBadge}>
                  {faNum(studentTotal)}
                </strong>{' '}
                نفر در این ماه
              </p>
            </div>

            <div className={styles.attSideSearch}>
              <input
                type="search"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="جستجوی نام…"
                autoComplete="off"
              />
            </div>

            {!studentRows.length ? (
              <p className={styles.attSideEmpty}>
                {studentTotal
                  ? 'موردی با این جستجو نیست'
                  : 'هنوز آماری برای دانش‌آموزان ثبت نشده'}
              </p>
            ) : (
              <div className={styles.attSideTable}>
                <div className={styles.attSideHead}>
                  <span>#</span>
                  <span>نام</span>
                  <span>نرخ</span>
                </div>
                <div className={styles.attSideScroll}>
                  {studentRows.map((s, idx) => (
                    <div key={s.student_id} className={styles.attSideRow}>
                      <span className={styles.attRowIndex}>{faNum(idx + 1)}</span>
                      <div className={styles.attSideName}>
                        <strong>{s.display_name}</strong>
                        <em>
                          {s.grade ? `${s.grade} · ` : ''}
                          غایب {faNum(s.absent)} · تأخیر {faNum(s.late)}
                        </em>
                      </div>
                      <span
                        className={`${styles.attSideRate} ${
                          (s.attendance_rate || 0) >= 85
                            ? styles.attSideRateOk
                            : (s.attendance_rate || 0) >= 60
                              ? styles.attSideRateMid
                              : styles.attSideRateBad
                        }`}
                      >
                        {faNum(s.attendance_rate)}٪
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.attSideFoot}>
                  نمایش {faNum(studentRows.length)} از {faNum(studentTotal)} دانش‌آموز
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
