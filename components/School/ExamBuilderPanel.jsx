'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Minus,
  RefreshCw,
  Trash2,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  Timer,
  Shuffle,
  Copy,
  ArrowLeftRight,
  Lock,
  Unlock,
  FileQuestion,
  Sparkles,
  Check,
  BarChart3,
  CircleDot,
  Gauge,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const COUNT_TARGET = 5
const TIME_MIN = 10
const TIME_MAX = 180
const TIME_PRESETS = [20, 30, 60, 120, 180]
const TIME_EASY = 30
const TIME_MEDIUM = 60
const TIME_HARD = 120

const emptyForm = () => ({
  title: '',
  description: '',
  subject_ids: [],
  chapter_ids: [],
  all_students: true,
  student_ids: [],
  count_easy: 0,
  count_medium: 0,
  count_hard: 0,
  custom_timing: false,
  time_easy: TIME_EASY,
  time_medium: TIME_MEDIUM,
  time_hard: TIME_HARD,
  same_questions: false,
  shuffle_options: true,
  allow_back: true,
})

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '۰'
  return Number(n).toLocaleString('fa-IR')
}

/** چیدمان اولیه بر اساس موجودی بانک (حداکثر ۵ از هر سطح، بدون تجاوز از موجودی) */
function suggestCountsFromAvail(a = {}) {
  const easy = Math.max(0, Number(a.easy) || 0)
  const medium = Math.max(0, Number(a.medium) || 0)
  const hard = Math.max(0, Number(a.hard) || 0)
  return {
    count_easy: Math.min(COUNT_TARGET, easy),
    count_medium: Math.min(COUNT_TARGET, medium),
    count_hard: Math.min(COUNT_TARGET, hard),
  }
}

function clampCount(raw, max) {
  const n = Math.floor(Number(raw))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(n, Math.max(0, Number(max) || 0))
}

function clampTime(raw, fallback = TIME_EASY) {
  const n = Math.floor(Number(raw))
  if (!Number.isFinite(n)) return fallback
  return Math.min(TIME_MAX, Math.max(TIME_MIN, n))
}

function ToggleRow({ icon: Icon, label, hint, left, right, value, onLeft, onRight }) {
  return (
    <div className={styles.exbToggle}>
      <div className={styles.exbToggleHead}>
        <Icon size={14} strokeWidth={2.2} aria-hidden />
        <div>
          <strong>{label}</strong>
          {hint ? <em>{hint}</em> : null}
        </div>
      </div>
      <div className={styles.exbSeg}>
        <button
          type="button"
          className={!value ? styles.exbSegOn : ''}
          onClick={onLeft}
        >
          {left}
        </button>
        <button
          type="button"
          className={value ? styles.exbSegOn : ''}
          onClick={onRight}
        >
          {right}
        </button>
      </div>
    </div>
  )
}

function CountStepper({
  label,
  value,
  max,
  min = 0,
  step = 1,
  stockLabel,
  tone = 'blue',
  showBar = true,
  onChange,
}) {
  const n = Number(value) || 0
  const cap = Math.max(0, Number(max) || 0)
  const floor = Math.max(0, Number(min) || 0)
  const atMin = n <= floor
  const atMax = n >= cap
  const ratio = cap > 0 ? Math.min(1, n / cap) : 0

  return (
    <div
      className={`${styles.exbStepper} ${styles.exbStepperVert} ${
        styles[`exbStepper_${tone}`] || ''
      }`}
    >
      <div className={styles.exbStepperTop}>
        <strong>{label}</strong>
        {stockLabel != null ? <em>{stockLabel}</em> : null}
      </div>
      <div className={styles.exbStepperCtrlVert}>
        <button
          type="button"
          className={`${styles.exbStepBtn} ${styles.exbStepBtnPlus}`}
          disabled={atMax}
          aria-label={`افزایش ${label}`}
          onClick={() => onChange(Math.min(cap, n + step))}
        >
          <Plus size={16} strokeWidth={2.4} />
        </button>
        <div className={styles.exbStepValue} aria-live="polite">
          <b>{faNum(n)}</b>
        </div>
        <button
          type="button"
          className={styles.exbStepBtn}
          disabled={atMin}
          aria-label={`کاهش ${label}`}
          onClick={() => onChange(Math.max(floor, n - step))}
        >
          <Minus size={16} strokeWidth={2.4} />
        </button>
      </div>
      {showBar ? (
        <div className={styles.exbStepBar} aria-hidden>
          <i style={{ width: `${ratio * 100}%` }} />
        </div>
      ) : null}
    </div>
  )
}

function TimeLever({ label, value, fallback = TIME_EASY, tone = 'blue', onChange }) {
  const sec = clampTime(value, fallback)
  const ratio = (sec - TIME_MIN) / (TIME_MAX - TIME_MIN)

  return (
    <div
      className={`${styles.exbTimeLever} ${styles[`exbTimeLever_${tone}`] || ''}`}
    >
      <div className={styles.exbTimeLeverHead}>
        <span>
          <Timer size={13} strokeWidth={2.2} aria-hidden />
          {label}
        </span>
        <label className={styles.exbTimeInputWrap}>
          <input
            type="number"
            min={TIME_MIN}
            max={TIME_MAX}
            value={sec}
            onChange={(e) => onChange(clampTime(e.target.value, fallback))}
          />
          <em>ثانیه</em>
        </label>
      </div>

      <div className={styles.exbTimeTrackWrap}>
        <input
          type="range"
          className={styles.exbTimeRange}
          min={TIME_MIN}
          max={TIME_MAX}
          step={1}
          value={sec}
          aria-label={label}
          onChange={(e) => onChange(clampTime(e.target.value, fallback))}
          style={{ '--exb-time-pct': `${ratio * 100}%` }}
        />
        <div className={styles.exbTimeTicks} aria-hidden>
          {TIME_PRESETS.map((p) => (
            <i
              key={p}
              style={{
                insetInlineStart: `${((p - TIME_MIN) / (TIME_MAX - TIME_MIN)) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.exbTimePresets}>
        {TIME_PRESETS.map((p) => {
          const on = sec === p
          return (
            <button
              key={p}
              type="button"
              className={`${styles.exbTimePreset} ${on ? styles.exbTimePresetOn : ''}`}
              onClick={() => onChange(p)}
            >
              <b>{faNum(p)}</b>
              <em>ث</em>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ExamBuilderPanel({ tree = [], students = [], onNotify }) {
  const [exams, setExams] = useState([])
  const [busy, setBusy] = useState(false)
  const [avail, setAvail] = useState({ easy: 0, medium: 0, hard: 0, total: 0 })
  const [form, setForm] = useState(emptyForm)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [mode, setMode] = useState('create')
  const [studentQ, setStudentQ] = useState('')

  const loadExams = useCallback(async () => {
    const res = await schoolService.listExams()
    if (res.success) setExams(res.data || [])
    else onNotify?.(res.error, true)
  }, [onNotify])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  const chaptersForSubjects = useMemo(() => {
    const set = new Set(form.subject_ids.map(String))
    const list = []
    tree.forEach((s) => {
      if (!set.size || set.has(String(s.id))) {
        ;(s.chapters || []).forEach((c) => {
          list.push({ ...c, subject_title: s.title, subject_id: s.id })
        })
      }
    })
    return list
  }, [tree, form.subject_ids])

  const filteredStudents = useMemo(() => {
    const q = studentQ.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) =>
      `${s.display_name || ''} ${s.grade || ''}`.toLowerCase().includes(q),
    )
  }, [students, studentQ])

  const refreshAvail = useCallback(async () => {
    const params = {}
    if (form.subject_ids.length) params.subjects = form.subject_ids.join(',')
    if (form.chapter_ids.length) params.chapters = form.chapter_ids.join(',')
    const res = await schoolService.bankAvailability(params)
    if (!res.success) return
    const next = res.data || { easy: 0, medium: 0, hard: 0, total: 0 }
    setAvail(next)
    setForm((p) => ({
      ...p,
      ...suggestCountsFromAvail(next),
    }))
  }, [form.subject_ids, form.chapter_ids])

  useEffect(() => {
    refreshAvail()
  }, [refreshAvail])

  const setLevelCount = (key, maxKey, raw) => {
    setForm((p) => ({
      ...p,
      [key]: clampCount(raw, avail[maxKey]),
    }))
  }

  const setLevelTime = (key, raw, fallback) => {
    setForm((p) => ({ ...p, [key]: clampTime(raw, fallback) }))
  }

  const toggleId = (key, id) => {
    const sid = Number(id)
    setForm((p) => {
      const arr = p[key] || []
      const has = arr.map(Number).includes(sid)
      return {
        ...p,
        [key]: has ? arr.filter((x) => Number(x) !== sid) : [...arr, sid],
      }
    })
  }

  const startCreate = () => {
    setMode('create')
    setSelectedId(null)
    setDetail(null)
    setForm({
      ...emptyForm(),
      ...suggestCountsFromAvail(avail),
    })
  }

  const create = async () => {
    if (!form.title.trim()) {
      onNotify?.('عنوان آزمون را وارد کنید', true)
      return
    }
    if (!form.subject_ids.length && !form.chapter_ids.length) {
      onNotify?.('حداقل یک درس یا فصل انتخاب کنید', true)
      return
    }
    if (!form.all_students && !form.student_ids.length) {
      onNotify?.('دانش‌آموزان شرکت‌کننده را انتخاب کنید', true)
      return
    }
    const count_easy = clampCount(form.count_easy, avail.easy)
    const count_medium = clampCount(form.count_medium, avail.medium)
    const count_hard = clampCount(form.count_hard, avail.hard)
    const total = count_easy + count_medium + count_hard
    if (total <= 0) {
      onNotify?.('تعداد سوالات را مشخص کنید', true)
      return
    }
    setBusy(true)
    const res = await schoolService.createExam({
      title: form.title.trim(),
      description: form.description,
      subject_ids: form.subject_ids.map(Number),
      chapter_ids: form.chapter_ids.map(Number),
      all_students: form.all_students,
      student_ids: form.all_students ? [] : form.student_ids.map(Number),
      count_easy,
      count_medium,
      count_hard,
      custom_timing: !!form.custom_timing,
      time_easy: form.custom_timing
        ? clampTime(form.time_easy, TIME_EASY)
        : TIME_EASY,
      time_medium: form.custom_timing
        ? clampTime(form.time_medium, TIME_MEDIUM)
        : TIME_MEDIUM,
      time_hard: form.custom_timing
        ? clampTime(form.time_hard, TIME_HARD)
        : TIME_HARD,
      same_questions: !!form.same_questions,
      shuffle_options: !!form.shuffle_options,
      allow_back: !!form.allow_back,
    })
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'ایجاد آزمون ناموفق', true)
      return
    }
    const modeLabel = form.same_questions
      ? form.shuffle_options
        ? 'سوالات یکسان · گزینه‌های تصادفی'
        : 'سوالات و گزینه‌های یکسان'
      : form.shuffle_options
        ? 'سوالات تصادفی · گزینه‌های تصادفی'
        : 'سوالات تصادفی · گزینه‌های ثابت'
    onNotify?.(
      `آزمون ساخته شد · ${res.data?.papers_created || 0} برگه · ${modeLabel}`,
    )
    setForm((p) => ({ ...p, title: '', description: '' }))
    loadExams()
  }

  const openExam = async (id) => {
    setSelectedId(id)
    setMode('detail')
    const res = await schoolService.getExam(id)
    if (res.success) setDetail(res.data)
    else onNotify?.(res.error, true)
  }

  const removeExam = async (id, e) => {
    e?.stopPropagation?.()
    if (!window.confirm('حذف آزمون و همه برگه‌های دانش‌آموزان؟')) return
    const res = await schoolService.deleteExam(id)
    if (res.success) {
      onNotify?.('حذف شد')
      if (selectedId === id) startCreate()
      loadExams()
    } else onNotify?.(res.error, true)
  }

  const totalNeed =
    Number(form.count_easy) + Number(form.count_medium) + Number(form.count_hard)

  const isDetail = mode === 'detail' && detail
  const papers = detail?.papers || []
  const submittedCount = papers.filter((p) => p.status === 'submitted').length
  const pendingCount = papers.length - submittedCount
  const avgPercent = (() => {
    const done = papers.filter((p) => p.status === 'submitted')
    if (!done.length) return 0
    return Math.round(
      done.reduce((a, p) => a + (p.percentage || 0), 0) / done.length,
    )
  })()

  return (
    <div className={`${styles.exb} ${isDetail ? styles.exbDetail : styles.exbCreate}`}>
      {/* ستون باریک: لیست */}
      <aside className={`${styles.exbCol} ${styles.exbColList}`}>
        <div className={styles.exbColHead}>
          <div>
            <h3>
              <FileQuestion size={15} strokeWidth={2.2} aria-hidden />
              آزمون‌ها
            </h3>
            <p>{faNum(exams.length)} مورد</p>
          </div>
          <div className={styles.exbHeadActions}>
            <button
              type="button"
              className={styles.exbIconBtn}
              onClick={loadExams}
              title="بروزرسانی"
            >
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              className={styles.exbIconBtnAccent}
              onClick={startCreate}
              title="آزمون جدید"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className={styles.exbList}>
          {exams.map((ex) => {
            const on = selectedId === ex.id && mode === 'detail'
            return (
              <div
                key={ex.id}
                className={`${styles.exbExamItem} ${on ? styles.exbExamItemOn : ''}`}
              >
                <button
                  type="button"
                  className={styles.exbExamMain}
                  onClick={() => openExam(ex.id)}
                >
                  <span className={styles.exbExamIcon} aria-hidden>
                    <ClipboardIcon same={!!ex.same_questions} />
                  </span>
                  <span className={styles.exbExamBody}>
                    <strong>{ex.title}</strong>
                    <em>
                      {faNum(
                        (ex.count_easy || 0) +
                          (ex.count_medium || 0) +
                          (ex.count_hard || 0),
                      )}{' '}
                      سوال · {faNum(ex.paper_count || 0)} برگه
                    </em>
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.exbTrash}
                  onClick={(e) => removeExam(ex.id, e)}
                  title="حذف"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
          {!exams.length ? (
            <p className={styles.exbEmpty}>هنوز آزمونی نیست</p>
          ) : null}
        </div>
      </aside>

      {isDetail ? (
        <>
          <section className={`${styles.exbCol} ${styles.exbColMain}`}>
            <div className={styles.exbColHead}>
              <div>
                <h3>
                  <BarChart3 size={15} strokeWidth={2.2} aria-hidden />
                  نتایج · {detail.exam?.title}
                </h3>
                <p>
                  {faNum(papers.length)} برگه · ارسال {faNum(submittedCount)} ·
                  میانگین {faNum(avgPercent)}٪
                </p>
              </div>
              <div className={styles.exbHeadActions}>
                <button
                  type="button"
                  className={styles.exbIconBtn}
                  onClick={() => openExam(selectedId)}
                  title="بروزرسانی"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  className={styles.exbIconBtnAccent}
                  onClick={startCreate}
                  title="آزمون جدید"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className={styles.exbMiniStatsInline}>
              <div className={styles.exbMiniStat}>
                <Users size={14} aria-hidden />
                <strong>{faNum(papers.length)}</strong>
                <span>برگه</span>
              </div>
              <div className={styles.exbMiniStat}>
                <Check size={14} aria-hidden />
                <strong>{faNum(submittedCount)}</strong>
                <span>ارسال</span>
              </div>
              <div className={styles.exbMiniStat}>
                <Timer size={14} aria-hidden />
                <strong>{faNum(pendingCount)}</strong>
                <span>انتظار</span>
              </div>
              <div className={styles.exbMiniStat}>
                <Gauge size={14} aria-hidden />
                <strong>{faNum(avgPercent)}٪</strong>
                <span>میانگین</span>
              </div>
            </div>
            <div className={styles.exbBody}>
              <div className={styles.exbPaperTable}>
                <div className={styles.exbPaperHead}>
                  <span>#</span>
                  <span>دانش‌آموز</span>
                  <span>وضعیت</span>
                  <span>درصد</span>
                  <span>صحیح</span>
                </div>
                {papers.map((p, i) => (
                  <div key={p.id} className={styles.exbPaperRow}>
                    <span>{faNum(i + 1)}</span>
                    <strong>{p.student_name}</strong>
                    <span
                      className={
                        p.status === 'submitted'
                          ? styles.exbPillOk
                          : styles.exbPillWait
                      }
                    >
                      {p.status === 'submitted' ? 'ارسال‌شده' : 'در انتظار'}
                    </span>
                    <span>
                      {p.status === 'submitted' ? `${faNum(p.percentage)}٪` : '—'}
                    </span>
                    <span>
                      {p.status === 'submitted'
                        ? `${faNum(p.correct_count)}/${faNum(p.total_questions)}`
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
              {!papers.length ? (
                <p className={styles.exbEmpty}>برگه‌ای ثبت نشده</p>
              ) : null}
            </div>
          </section>

          <aside className={`${styles.exbCol} ${styles.exbColSide}`}>
            <div className={styles.exbColHead}>
              <div>
                <h3>
                  <CircleDot size={15} strokeWidth={2.2} aria-hidden />
                  تنظیمات آزمون
                </h3>
                <p>خلاصه ذخیره‌شده</p>
              </div>
            </div>
            <div className={styles.exbSummary}>
              <div className={styles.exbSumRow}>
                <BookOpen size={14} aria-hidden />
                <span>
                  {(detail.exam?.subject_titles || []).join(' · ') || 'بدون درس'}
                </span>
              </div>
              <div className={styles.exbSumRow}>
                <Gauge size={14} aria-hidden />
                <span>
                  آسان {faNum(detail.exam?.count_easy)} · متوسط{' '}
                  {faNum(detail.exam?.count_medium)} · سخت{' '}
                  {faNum(detail.exam?.count_hard)}
                </span>
              </div>
              <div className={styles.exbSumRow}>
                <Timer size={14} aria-hidden />
                <span>
                  {detail.exam?.custom_timing
                    ? `سفارشی · آسان ${faNum(detail.exam?.time_easy || 30)}ث · متوسط ${faNum(detail.exam?.time_medium || 60)}ث · سخت ${faNum(detail.exam?.time_hard || 120)}ث`
                    : 'زمان هر سوال از بانک سوال'}
                </span>
              </div>
              <div className={styles.exbSumRow}>
                {detail.exam?.same_questions ? (
                  <Copy size={14} aria-hidden />
                ) : (
                  <Shuffle size={14} aria-hidden />
                )}
                <span>
                  {detail.exam?.same_questions ? 'سوالات یکسان' : 'سوالات تصادفی'}
                  {' · '}
                  {detail.exam?.shuffle_options
                    ? 'گزینه تصادفی'
                    : 'گزینه ثابت'}
                </span>
              </div>
              <div className={styles.exbSumRow}>
                {detail.exam?.allow_back === false ? (
                  <Lock size={14} aria-hidden />
                ) : (
                  <Unlock size={14} aria-hidden />
                )}
                <span>
                  {detail.exam?.allow_back === false
                    ? 'بدون برگشت به سوال قبل'
                    : 'برگشت مجاز است'}
                </span>
              </div>
            </div>
          </aside>
        </>
      ) : (
        <>
          <section className={`${styles.exbCol} ${styles.exbColMain}`}>
            <div className={styles.exbColHead}>
              <div>
                <h3>
                  <Sparkles size={15} strokeWidth={2.2} aria-hidden />
                  ساخت آزمون
                </h3>
                <p>محدوده درسی و شرکت‌کنندگان</p>
              </div>
            </div>
            <div className={styles.exbBody}>
              <label className={styles.exbField}>
                <span>
                  <FileQuestion size={13} aria-hidden /> عنوان آزمون
                </span>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="مثلاً آزمون فصل ۱ ریاضی"
                />
              </label>

              <div className={styles.exbMainGrid}>
                <div className={styles.exbBlock}>
                  <div className={styles.exbBlockTitle}>
                    <BookOpen size={13} aria-hidden />
                    درس‌ها
                    <em>{faNum(form.subject_ids.length)}</em>
                  </div>
                  <div className={styles.exbChips}>
                    {tree.map((s) => {
                      const on = form.subject_ids
                        .map(Number)
                        .includes(Number(s.id))
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`${styles.exbChip} ${
                            on ? styles.exbChipOn : ''
                          }`}
                          onClick={() => toggleId('subject_ids', s.id)}
                        >
                          {on ? <Check size={11} /> : null}
                          {s.title}
                        </button>
                      )
                    })}
                    {!tree.length ? (
                      <span className={styles.exbHint}>ابتدا دسته درسی بسازید</span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.exbBlock}>
                  <div className={styles.exbBlockTitle}>
                    <Layers size={13} aria-hidden />
                    فصل‌ها
                    <em>{faNum(form.chapter_ids.length)}</em>
                  </div>
                  <div className={styles.exbChips}>
                    {chaptersForSubjects.map((c) => {
                      const on = form.chapter_ids
                        .map(Number)
                        .includes(Number(c.id))
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`${styles.exbChip} ${
                            on ? styles.exbChipOn : ''
                          }`}
                          onClick={() => toggleId('chapter_ids', c.id)}
                        >
                          {on ? <Check size={11} /> : null}
                          {c.title}
                        </button>
                      )
                    })}
                    {!chaptersForSubjects.length ? (
                      <span className={styles.exbHint}>فصلی نیست</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={styles.exbBlock}>
                <div className={styles.exbBlockTitle}>
                  <Users size={13} aria-hidden />
                  شرکت‌کنندگان
                  <em>
                    {form.all_students
                      ? `${faNum(students.length)} نفر`
                      : `${faNum(form.student_ids.length)} انتخابی`}
                  </em>
                </div>
                <div className={styles.exbSeg}>
                  <button
                    type="button"
                    className={form.all_students ? styles.exbSegOn : ''}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        all_students: true,
                        student_ids: [],
                      }))
                    }
                  >
                    <Users size={13} /> کل کلاس ({faNum(students.length)})
                  </button>
                  <button
                    type="button"
                    className={!form.all_students ? styles.exbSegOn : ''}
                    onClick={() =>
                      setForm((p) => ({ ...p, all_students: false }))
                    }
                  >
                    <UserCheck size={13} /> انتخابی
                  </button>
                </div>
                {!form.all_students ? (
                  <>
                    <input
                      className={styles.exbSearch}
                      type="search"
                      value={studentQ}
                      onChange={(e) => setStudentQ(e.target.value)}
                      placeholder="جستجوی دانش‌آموز…"
                    />
                    <div className={styles.exbStudentGrid}>
                      {filteredStudents.map((s) => {
                        const on = form.student_ids
                          .map(Number)
                          .includes(Number(s.id))
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className={`${styles.exbStudent} ${
                              on ? styles.exbStudentOn : ''
                            }`}
                            onClick={() => toggleId('student_ids', s.id)}
                          >
                            <span>{on ? <Check size={12} /> : null}</span>
                            <strong>{s.display_name}</strong>
                            {s.grade ? <em>{s.grade}</em> : null}
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className={styles.exbAllClassCard}>
                    <Users size={20} strokeWidth={1.8} aria-hidden />
                    <strong>{faNum(students.length)} دانش‌آموز فعال</strong>
                    <p>برگه برای همه دانش‌آموزان این معلم ساخته می‌شود</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className={`${styles.exbCol} ${styles.exbColSide}`}>
            <div className={styles.exbColHead}>
              <div>
                <h3>
                  <Gauge size={15} strokeWidth={2.2} aria-hidden />
                  ترکیب و تنظیمات
                </h3>
                <p>
                  بانک {faNum(avail.total)} · نیاز {faNum(totalNeed)}
                </p>
              </div>
            </div>
            <div className={styles.exbBody}>
              <div className={styles.exbCountsRow}>
                <CountStepper
                  label="آسان"
                  tone="green"
                  value={form.count_easy}
                  max={avail.easy}
                  stockLabel={`موجود ${faNum(avail.easy)}`}
                  onChange={(v) => setLevelCount('count_easy', 'easy', v)}
                />
                <CountStepper
                  label="متوسط"
                  tone="blue"
                  value={form.count_medium}
                  max={avail.medium}
                  stockLabel={`موجود ${faNum(avail.medium)}`}
                  onChange={(v) => setLevelCount('count_medium', 'medium', v)}
                />
                <CountStepper
                  label="سخت"
                  tone="orange"
                  value={form.count_hard}
                  max={avail.hard}
                  stockLabel={`موجود ${faNum(avail.hard)}`}
                  onChange={(v) => setLevelCount('count_hard', 'hard', v)}
                />
              </div>
              <div className={styles.exbTimingBox}>
                {!form.custom_timing ? (
                  <>
                    <div className={styles.exbTimingBank}>
                      <Timer size={16} strokeWidth={2.2} aria-hidden />
                      <div>
                        <strong>زمان‌بندی بر اساس تنظیمات بانک سوال</strong>
                        <p>
                          زمان هر سوال همان است که مؤلف در بانک تعیین کرده؛ اگر
                          تعیین نشده باشد پیش‌فرض آسان {faNum(TIME_EASY)}ث · متوسط{' '}
                          {faNum(TIME_MEDIUM)}ث · سخت {faNum(TIME_HARD)}ث است
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.exbTimingEnable}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          custom_timing: true,
                          time_easy: p.time_easy || TIME_EASY,
                          time_medium: p.time_medium || TIME_MEDIUM,
                          time_hard: p.time_hard || TIME_HARD,
                        }))
                      }
                    >
                      فعال‌سازی زمان‌بندی سفارشی
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.exbTimingActiveHead}>
                      <strong>زمان‌بندی سفارشی فعال است</strong>
                      <button
                        type="button"
                        className={styles.exbTimingDisable}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            custom_timing: false,
                            time_easy: TIME_EASY,
                            time_medium: TIME_MEDIUM,
                            time_hard: TIME_HARD,
                          }))
                        }
                      >
                        بازگشت به بانک سوال
                      </button>
                    </div>
                    <div className={styles.exbTimeLevers}>
                      <TimeLever
                        label="زمان سوال آسان"
                        tone="green"
                        value={form.time_easy}
                        fallback={TIME_EASY}
                        onChange={(v) =>
                          setLevelTime('time_easy', v, TIME_EASY)
                        }
                      />
                      <TimeLever
                        label="زمان سوال متوسط"
                        tone="blue"
                        value={form.time_medium}
                        fallback={TIME_MEDIUM}
                        onChange={(v) =>
                          setLevelTime('time_medium', v, TIME_MEDIUM)
                        }
                      />
                      <TimeLever
                        label="زمان سوال سخت"
                        tone="orange"
                        value={form.time_hard}
                        fallback={TIME_HARD}
                        onChange={(v) =>
                          setLevelTime('time_hard', v, TIME_HARD)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              {avail.total <= 0 ? (
                <p className={styles.exbWarn}>
                  در این محدوده سوالی در بانک نیست؛ درس یا فصل دیگری انتخاب کنید
                </p>
              ) : null}
              <ToggleRow
                icon={Shuffle}
                label="سوالات"
                hint={
                  form.same_questions
                    ? 'یکسان برای همه'
                    : 'تصادفی برای هر نفر'
                }
                left={
                  <>
                    <Shuffle size={12} /> تصادفی
                  </>
                }
                right={
                  <>
                    <Copy size={12} /> یکسان
                  </>
                }
                value={form.same_questions}
                onLeft={() =>
                  setForm((p) => ({ ...p, same_questions: false }))
                }
                onRight={() =>
                  setForm((p) => ({ ...p, same_questions: true }))
                }
              />
              <ToggleRow
                icon={ArrowLeftRight}
                label="گزینه‌ها"
                hint={
                  form.shuffle_options ? 'جابه‌جایی تصادفی' : 'ترتیب ثابت'
                }
                left={
                  <>
                    <Copy size={12} /> ثابت
                  </>
                }
                right={
                  <>
                    <ArrowLeftRight size={12} /> تصادفی
                  </>
                }
                value={form.shuffle_options}
                onLeft={() =>
                  setForm((p) => ({ ...p, shuffle_options: false }))
                }
                onRight={() =>
                  setForm((p) => ({ ...p, shuffle_options: true }))
                }
              />
              <ToggleRow
                icon={Unlock}
                label="برگشت به قبل"
                hint={form.allow_back ? 'مجاز' : 'غیرمجاز'}
                left={
                  <>
                    <Lock size={12} /> غیرمجاز
                  </>
                }
                right={
                  <>
                    <Unlock size={12} /> مجاز
                  </>
                }
                value={form.allow_back}
                onLeft={() => setForm((p) => ({ ...p, allow_back: false }))}
                onRight={() => setForm((p) => ({ ...p, allow_back: true }))}
              />
              <button
                type="button"
                className={styles.exbCreateBtn}
                disabled={busy}
                onClick={create}
              >
                <Plus size={16} strokeWidth={2.3} />
                {busy ? 'در حال ساخت…' : 'ایجاد آزمون و برگه‌ها'}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function ClipboardIcon({ same }) {
  return same ? <Copy size={14} /> : <Shuffle size={14} />
}
