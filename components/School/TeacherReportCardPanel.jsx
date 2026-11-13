'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BookOpen, CalendarDays, Check, ChevronDown, ClipboardList,
  Loader2, MessageSquare, Save, School, TrendingDown, TrendingUp,
  Minus, UserRound, Users, X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  MONTHS_FA, faNum, toFaDigits, currentJalaliMonth, shiftJalaliMonth,
} from '@/components/School/schoolDate'
import styles from './School.module.css'

function liveTrend(score, prev) {
  if (score == null || Number.isNaN(score) || prev == null) return 'none'
  const d = score - Number(prev)
  if (d >= 0.5) return 'up'
  if (d <= -0.5) return 'down'
  return 'stable'
}

function TrendMini({ trend }) {
  if (trend === 'up') return <TrendingUp size={12} className={styles.rcTrendUp} />
  if (trend === 'down') return <TrendingDown size={12} className={styles.rcTrendDown} />
  if (trend === 'stable') return <Minus size={12} className={styles.rcTrendFlat} />
  return null
}

function PickerDialog({ open, title, icon: Icon, onClose, children }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !mounted || typeof document === 'undefined') return null

  return createPortal(
    <div className={styles.rcDlgBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.rcDlg}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.rcDlgHead}>
          <div className={styles.rcDlgTitle}>
            {Icon ? <Icon size={15} /> : null}
            <h3>{title}</h3>
          </div>
          <button type="button" className={styles.rcDlgClose} onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </div>
        <div className={styles.rcDlgBody}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default function TeacherReportCardPanel({
  teacherId = null,
  subjects = [],
  onNotify,
}) {
  const initial = currentJalaliMonth()
  const [jy, setJy] = useState(initial.jy)
  const [jm, setJm] = useState(initial.jm)
  const [subjectId, setSubjectId] = useState('')
  const [sheet, setSheet] = useState(null)
  const [draft, setDraft] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [picker, setPicker] = useState(null) // 'subject' | 'month'
  const [slotSubjectIds, setSlotSubjectIds] = useState(null) // null=loading

  const teacherParams = useMemo(
    () => (teacherId ? { teacher: teacherId } : {}),
    [teacherId],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await schoolService.myTimetable({ role: 'teacher', ...teacherParams })
      if (cancelled) return
      if (!res.success) {
        setSlotSubjectIds(new Set())
        return
      }
      const ids = new Set()
      ;(res.data?.slots || []).forEach((s) => {
        if (s.subject != null) ids.add(String(s.subject))
      })
      setSlotSubjectIds(ids)
    })()
    return () => { cancelled = true }
  }, [teacherParams])

  const subjectsInTimetable = useMemo(() => {
    if (!slotSubjectIds) return subjects
    const linked = subjects.filter((s) => slotSubjectIds.has(String(s.id)))
    return linked.length ? linked : subjects
  }, [subjects, slotSubjectIds])

  const subjectsWithoutSlot = useMemo(() => {
    if (!slotSubjectIds) return []
    return subjects.filter((s) => !slotSubjectIds.has(String(s.id)))
  }, [subjects, slotSubjectIds])

  useEffect(() => {
    if (!subjectId && subjectsInTimetable[0]?.id) {
      setSubjectId(String(subjectsInTimetable[0].id))
      return
    }
    if (
      subjectId
      && subjectsInTimetable.length
      && !subjectsInTimetable.some((s) => String(s.id) === String(subjectId))
    ) {
      setSubjectId(String(subjectsInTimetable[0].id))
    }
  }, [subjectsInTimetable, subjectId])

  const subject = useMemo(
    () => subjects.find((s) => String(s.id) === String(subjectId))
      || subjectsInTimetable.find((s) => String(s.id) === String(subjectId)),
    [subjects, subjectsInTimetable, subjectId],
  )

  const loadSeq = useRef(0)
  const subjectIdRef = useRef(subjectId)
  const jyRef = useRef(jy)
  const jmRef = useRef(jm)
  useEffect(() => { subjectIdRef.current = subjectId }, [subjectId])
  useEffect(() => { jyRef.current = jy }, [jy])
  useEffect(() => { jmRef.current = jm }, [jm])

  const load = useCallback(async () => {
    if (!subjectId) {
      setSheet(null)
      setDraft({})
      return
    }
    const seq = ++loadSeq.current
    setLoading(true)
    setSheet(null)
    setDraft({})
    const res = await schoolService.reportCardSheet({
      ...teacherParams,
      subject: subjectId,
      jy,
      jm,
    })
    if (seq !== loadSeq.current) return
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بارگذاری کارنامه', true)
      return
    }
    setSheet(res.data)
    const next = {}
    ;(res.data.rows || []).forEach((r) => {
      next[r.student_id] = {
        score: r.score == null ? '' : String(r.score),
        comment: r.comment || '',
      }
    })
    setDraft(next)
  }, [teacherParams, subjectId, jy, jm, onNotify])

  useEffect(() => { load() }, [load])

  const patchRow = (studentId, patch) => {
    setDraft((p) => ({
      ...p,
      [studentId]: { ...(p[studentId] || { score: '', comment: '' }), ...patch },
    }))
  }

  const save = async () => {
    if (!subjectId || !sheet) return
    const snapSubject = subjectId
    const snapJy = jy
    const snapJm = jm
    const entries = (sheet.rows || []).map((r) => {
      const d = draft[r.student_id] || {}
      return {
        student_id: r.student_id,
        score: d.score === '' || d.score == null ? '' : d.score,
        comment: d.comment || '',
      }
    })
    setSaving(true)
    const res = await schoolService.reportCardBulk(
      {
        subject_id: Number(snapSubject),
        jalali_year: snapJy,
        jalali_month: snapJm,
        max_score: sheet.max_score || 20,
        entries,
      },
      teacherParams,
    )
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره ناموفق', true)
      return
    }
    const errCount = (res.data?.errors || []).length
    onNotify?.(
      errCount
        ? `ذخیره با ${faNum(errCount)} خطا`
        : `نمرات ${MONTHS_FA[snapJm - 1]} ذخیره شد`,
      !!errCount,
    )
    // فقط اگر هنوز همان درس/ماه باز است، دوباره load کن
    if (
      subjectIdRef.current === snapSubject
      && jyRef.current === snapJy
      && jmRef.current === snapJm
    ) {
      load()
    }
  }

  const filled = Object.values(draft).filter((d) => d.score !== '' && d.score != null).length
  const rows = sheet?.rows || []
  const maxScore = sheet?.max_score || 20

  return (
    <div className={styles.rcShell}>
      <header className={styles.rcTopBar}>
        <div className={styles.rcTopTitle}>
          <span className={styles.rcTopIcon}><ClipboardList size={14} /></span>
          <div>
            <h2>کارنامه ماهانه</h2>
            <p>ثبت نمره هر درس · مقایسه با ماه قبل</p>
          </div>
        </div>
        <button
          type="button"
          className={styles.rcSaveBtn}
          disabled={saving || !subjectId || loading}
          onClick={save}
        >
          {saving ? <Loader2 size={13} className={styles.rcSpin} /> : <Save size={13} />}
          {saving ? '…' : 'ذخیره'}
        </button>
      </header>

      <div className={styles.rcTwoCol}>
        <aside className={styles.rcSide}>
          <button type="button" className={styles.rcPickBtn} onClick={() => setPicker('subject')}>
            <span className={styles.rcPickIcon} style={{ background: subject?.color || '#2d5a45' }}>
              <BookOpen size={13} />
            </span>
            <span className={styles.rcPickText}>
              <em>درس</em>
              <strong>{subject?.title || 'انتخاب درس'}</strong>
            </span>
            <ChevronDown size={14} />
          </button>

          <button type="button" className={styles.rcPickBtn} onClick={() => setPicker('month')}>
            <span className={`${styles.rcPickIcon} ${styles.rcPickIconCal}`}>
              <CalendarDays size={13} />
            </span>
            <span className={styles.rcPickText}>
              <em>ماه</em>
              <strong>{MONTHS_FA[jm - 1]} {toFaDigits(jy)}</strong>
            </span>
            <ChevronDown size={14} />
          </button>

          <div className={styles.rcSideStats}>
            <div className={styles.rcSideStat}>
              <Users size={12} />
              <span>{loading ? '…' : faNum(rows.length)}</span>
              <em>دانش‌آموز</em>
            </div>
            <div className={styles.rcSideStat}>
              <Check size={12} />
              <span>{faNum(filled)}</span>
              <em>ثبت‌شده</em>
            </div>
            <div className={styles.rcSideStat}>
              <School size={12} />
              <span>{faNum(maxScore)}</span>
              <em>سقف</em>
            </div>
          </div>

          {sheet?.prev_month_label ? (
            <p className={styles.rcSideHint}>
              <TrendingUp size={11} />
              مقایسه با {sheet.prev_month_label}
            </p>
          ) : null}
        </aside>

        <section className={styles.rcListPanel}>
          {!subjectId ? (
            <div className={styles.rcEmpty}>
              <BookOpen size={22} />
              <p>یک درس انتخاب کنید</p>
              <button type="button" className={styles.rcEmptyBtn} onClick={() => setPicker('subject')}>
                انتخاب درس
              </button>
            </div>
          ) : loading && !rows.length ? (
            <div className={styles.rcEmpty}>
              <Loader2 size={20} className={styles.rcSpin} />
              <p>بارگذاری…</p>
            </div>
          ) : !rows.length ? (
            <div className={styles.rcEmpty}>
              <Users size={22} />
              <p>{sheet?.hint || 'در برنامه هفتگی کلاسی برای این درس ندارید'}</p>
            </div>
          ) : (
            <div className={styles.rcGradeList} role="list">
              {rows.map((r) => {
                const d = draft[r.student_id] || { score: '', comment: '' }
                const scoreNum = d.score === '' ? null : Number(d.score)
                const trend = liveTrend(scoreNum, r.prev_score)
              const meta = [
                r.student_grade || null,
                r.class_title || null,
                r.prev_score != null ? `قبل ${faNum(r.prev_score)}` : null,
              ].filter(Boolean).join(' · ')
                return (
                  <article key={r.student_id} className={styles.rcGradeRow} role="listitem">
                    <span className={styles.rcAvatar} aria-hidden>
                      <UserRound size={11} />
                    </span>
                    <strong className={styles.rcGradeName}>{r.student_name}</strong>
                    <span className={styles.rcGradeMeta}>
                      {meta || '—'}
                      <TrendMini trend={trend} />
                    </span>
                    <label className={styles.rcScoreCompact}>
                      <span className={styles.srOnly}>نمره</span>
                      <input
                        type="number"
                        min={0}
                        max={maxScore}
                        step={0.25}
                        value={d.score}
                        placeholder="نمره"
                        onChange={(e) => patchRow(r.student_id, { score: e.target.value })}
                      />
                    </label>
                    <label className={styles.rcNoteCompact}>
                      <MessageSquare size={11} aria-hidden />
                      <input
                        value={d.comment}
                        placeholder="توضیح کوتاه…"
                        onChange={(e) => patchRow(r.student_id, { comment: e.target.value })}
                      />
                    </label>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <PickerDialog
        open={picker === 'subject'}
        title="انتخاب درس"
        icon={BookOpen}
        onClose={() => setPicker(null)}
      >
        <div className={styles.rcOptList}>
          {subjectsInTimetable.map((s) => {
            const on = String(s.id) === String(subjectId)
            return (
              <button
                key={s.id}
                type="button"
                className={`${styles.rcOpt} ${on ? styles.rcOptOn : ''}`}
                onClick={() => {
                  setSubjectId(String(s.id))
                  setPicker(null)
                }}
              >
                <span className={styles.rcOptDot} style={{ background: s.color || '#2d5a45' }} />
                <span className={styles.rcOptLabel}>{s.title}</span>
                {on ? <Check size={14} /> : null}
              </button>
            )
          })}
          {subjectsWithoutSlot.length ? (
            <p className={styles.rcDlgEmpty}>
              {toFaDigits(subjectsWithoutSlot.length)} درس بدون زنگ در برنامه (مخفی)
            </p>
          ) : null}
          {!subjectsInTimetable.length ? <p className={styles.rcDlgEmpty}>درسی در برنامه نیست</p> : null}
        </div>
      </PickerDialog>

      <PickerDialog
        open={picker === 'month'}
        title="انتخاب ماه"
        icon={CalendarDays}
        onClose={() => setPicker(null)}
      >
        <div className={styles.rcYearRow}>
          <button
            type="button"
            className={styles.rcYearBtn}
            onClick={() => {
              const n = shiftJalaliMonth(jy, jm, -12)
              setJy(n.jy)
            }}
          >
            {toFaDigits(jy - 1)}
          </button>
          <strong>{toFaDigits(jy)}</strong>
          <button
            type="button"
            className={styles.rcYearBtn}
            onClick={() => {
              const n = shiftJalaliMonth(jy, jm, 12)
              setJy(n.jy)
            }}
          >
            {toFaDigits(jy + 1)}
          </button>
        </div>
        <div className={styles.rcMonthGrid}>
          {MONTHS_FA.map((name, i) => {
            const month = i + 1
            const on = month === jm
            return (
              <button
                key={name}
                type="button"
                className={`${styles.rcMonthCell} ${on ? styles.rcMonthCellOn : ''}`}
                onClick={() => {
                  setJm(month)
                  setPicker(null)
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      </PickerDialog>
    </div>
  )
}
