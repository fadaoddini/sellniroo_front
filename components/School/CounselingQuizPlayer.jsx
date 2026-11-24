'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Brain, Heart, Compass, Sparkles, UserRound, Puzzle, Trophy, RefreshCw, X,
  Lightbulb, ChevronRight, ChevronLeft, Check,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const LETTERS = ['الف', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ی']

const KIND_META = {
  iq: { label: 'تست هوش (IQ)', icon: Brain, color: '#1d4ed8' },
  eq: { label: 'هوش هیجانی (EQ)', icon: Heart, color: '#be123c' },
  personality: { label: 'شخصیت', icon: UserRound, color: '#7c3aed' },
  career: { label: 'هدایت تحصیلی', icon: Compass, color: '#0f766e' },
  interest: { label: 'علاقه‌مندی', icon: Sparkles, color: '#b45309' },
  custom: { label: 'آزمون', icon: Puzzle, color: '#334155' },
}

function resolveSeconds(test) {
  if (!test?.timed_questions) return 0
  const sec = Number(test.seconds_per_question)
  if (sec > 0) return Math.min(300, Math.max(5, sec))
  const mins = Number(test.duration_minutes) || 10
  return Math.min(60, Math.max(15, Math.round((mins * 60) / Math.max(1, 10))))
}

/**
 * تجربه آزمون مشاوره با استایل ویجت /quiz
 * پشتیبانی: بانک تصادفی، جابه‌جایی گزینه، تایمر اختیاری، برگشت اختیاری
 */
export default function CounselingQuizPlayer({
  tests = [],
  onNotify,
  onFinished,
  onCancel,
  embedded = true,
  focusMode = false,
}) {
  const shellClass = [
    styles.cqExamShell,
    embedded ? styles.cqExamEmbedded : '',
    focusMode ? styles.cqExamShellFocus : '',
  ].filter(Boolean).join(' ')
  const [selectedId, setSelectedId] = useState(null)
  const [starting, setStarting] = useState(false)
  const [session, setSession] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [timePerQ, setTimePerQ] = useState(0)
  const [locking, setLocking] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const answeredRef = useRef(false)
  const answersRef = useRef({})
  const submittedRef = useRef(false)
  const advanceTimerRef = useRef(null)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }, [])

  const questions = session?.questions || []
  const test = session?.test
  const kind = KIND_META[test?.kind] || KIND_META.custom
  const KindIcon = kind.icon
  const timed = !!test?.timed_questions && timePerQ > 0
  const allowBack = !!test?.allow_back

  const questionProgressPct = questions.length
    ? Math.min(100, ((qIndex + 1) / questions.length) * 100)
    : 0
  const timeProgressPct = timed
    ? Math.min(100, Math.max(0, (timeLeft / Math.max(1, timePerQ)) * 100))
    : 100

  const timerStatus = useMemo(() => {
    if (!timed) return 'normal'
    if (timeLeft <= 3) return 'heartbeat'
    if (timeLeft <= 5) return 'danger'
    if (timeLeft <= 10) return 'warning'
    return 'normal'
  }, [timed, timeLeft])

  const finish = useCallback(async (finalAnswers) => {
    if (!session?.attempt?.id || submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    const res = await schoolService.submitCounselingTest({
      attempt_id: session.attempt.id,
      answers: finalAnswers,
    })
    setSubmitting(false)
    if (!res.success) {
      submittedRef.current = false
      setLocking(false)
      answeredRef.current = false
      onNotify?.(res.error, true)
      return
    }
    setResult(res.data)
    onFinished?.(res.data)
  }, [session, onNotify, onFinished])

  const goTo = useCallback((index, nextAnswers) => {
    answeredRef.current = false
    setLocking(false)
    const q = questions[index]
    const prevKey = q ? (nextAnswers?.[q.id] ?? answersRef.current[q.id] ?? null) : null
    setSelectedKey(prevKey != null && prevKey !== '' ? String(prevKey) : null)
    setQIndex(index)
    if (timed) setTimeLeft(timePerQ)
  }, [questions, timed, timePerQ])

  const goNext = useCallback((nextAnswers) => {
    if (qIndex >= questions.length - 1) {
      finish(nextAnswers)
      return
    }
    goTo(qIndex + 1, nextAnswers)
  }, [qIndex, questions.length, finish, goTo])

  const goPrev = useCallback(() => {
    if (!allowBack || qIndex <= 0 || locking) return
    goTo(qIndex - 1, answersRef.current)
  }, [allowBack, qIndex, locking, goTo])

  const pickOption = useCallback((key) => {
    if (locking || !questions[qIndex]) return
    // بدون برگشت: یک‌بار انتخاب و رفتن به بعد
    if (!allowBack && answeredRef.current) return

    setSelectedKey(key)
    const qid = questions[qIndex].id
    const next = { ...answersRef.current, [qid]: key }
    setAnswers(next)

    if (allowBack) {
      // فقط انتخاب؛ کاربر با «بعدی» جلو می‌رود
      return
    }

    answeredRef.current = true
    setLocking(true)
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    advanceTimerRef.current = setTimeout(() => goNext(next), 550)
  }, [locking, questions, qIndex, allowBack, goNext])

  const confirmNext = useCallback(() => {
    if (locking) return
    const q = questions[qIndex]
    if (!q) return
    const key = answersRef.current[q.id]
    if (key == null || key === '') {
      onNotify?.('لطفاً یک گزینه را انتخاب کنید', true)
      return
    }
    setLocking(true)
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    advanceTimerRef.current = setTimeout(() => {
      setLocking(false)
      goNext(answersRef.current)
    }, 200)
  }, [locking, questions, qIndex, goNext, onNotify])

  // تایمر هر سوال (فقط اگر فعال باشد)
  useEffect(() => {
    if (!session || result || submitting || !timed || submittedRef.current) return undefined
    if (timeLeft <= 0) {
      if (!answeredRef.current) {
        answeredRef.current = true
        setLocking(true)
        const qid = questions[qIndex]?.id
        const next = { ...answersRef.current }
        if (qid != null && next[qid] == null) next[qid] = ''
        setAnswers(next)
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
        advanceTimerRef.current = setTimeout(() => {
          setLocking(false)
          goNext(next)
        }, 400)
      }
      return undefined
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [session, result, submitting, timed, timeLeft, questions, qIndex, goNext])

  const start = async () => {
    if (!selectedId) return
    setStarting(true)
    const res = await schoolService.startCounselingTest({ test_id: selectedId })
    setStarting(false)
    if (!res.success) {
      onNotify?.(res.error, true)
      return
    }
    const qs = res.data?.questions || []
    const sec = resolveSeconds(res.data?.test)
    submittedRef.current = false
    setSession(res.data)
    setAnswers({})
    answersRef.current = {}
    setQIndex(0)
    setResult(null)
    setSelectedKey(null)
    setLocking(false)
    answeredRef.current = false
    setTimePerQ(sec)
    setTimeLeft(sec)
  }

  const resetToList = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    submittedRef.current = true
    setSession(null)
    setResult(null)
    setSelectedId(null)
    setAnswers({})
    setQIndex(0)
    setLocking(false)
    answeredRef.current = false
  }

  const formatTime = (seconds) =>
    Math.max(0, Math.floor(Number(seconds) || 0)).toString().padStart(2, '0')

  if (result) {
    const pct = result.max_score
      ? Math.round((Number(result.score) / Number(result.max_score)) * 100)
      : 0
    return (
      <div className={shellClass}>
        <div className={styles.cqExamResult}>
          <div className={styles.cqExamResultIcon} aria-hidden>
            <Trophy size={28} />
          </div>
          <h2 className={styles.cqExamResultTitle}>
            {result.result_label || 'نتیجه آزمون'}
          </h2>
          <p className={styles.cqExamResultSub}>{test?.title}</p>
          <div className={styles.cqExamResultStats}>
            <div>
              <span>نمره</span>
              <strong>{result.score} / {result.max_score}</strong>
            </div>
            <div>
              <span>درصد</span>
              <strong>{pct}٪</strong>
            </div>
          </div>
          {result.result_summary ? (
            <p className={styles.cqResultSummary}>{result.result_summary}</p>
          ) : null}
          <div className={styles.cqResultActions}>
            <button type="button" className={styles.cqNavBtnPrimaryWide} onClick={resetToList}>
              <RefreshCw size={16} /> آزمون‌های دیگر
            </button>
            {onCancel ? (
              <button type="button" className={styles.cqNavBtn} onClick={onCancel}>
                بستن
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (session) {
    const q = questions[qIndex]
    const opts = Array.isArray(q?.options) ? q.options : []
    const answeredCount = Object.keys(answers).filter((k) => answers[k] !== '' && answers[k] != null).length
    const timerTone =
      timerStatus === 'heartbeat' || timerStatus === 'danger'
        ? styles.cqExamTimerCritical
        : timerStatus === 'warning'
          ? styles.cqExamTimerWarn
          : ''

    return (
      <div className={shellClass}>
        <header className={styles.cqExamTop}>
          <div className={styles.cqExamTopMain}>
            <span
              className={styles.cqExamKind}
              style={{ '--cq-accent': kind.color }}
            >
              <KindIcon size={14} />
              {test?.kind_label || kind.label}
            </span>
            <div className={styles.cqExamTitles}>
              <strong>{test?.title || 'آزمون مشاوره'}</strong>
              <span>
                سوال {qIndex + 1} از {questions.length}
                {test?.bank_size && test.bank_size > questions.length
                  ? ` · بانک ${test.bank_size}`
                  : ''}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.cqAbort}
            onClick={resetToList}
            title="انصراف"
            aria-label="انصراف از آزمون"
          >
            <X size={16} />
          </button>
        </header>

        <div className={styles.cqExamProgress} aria-hidden>
          <div
            className={styles.cqExamProgressFill}
            style={{ width: `${questionProgressPct}%` }}
          />
        </div>

        {timed ? (
          <div
            className={`${styles.cqExamTimer} ${timerTone}`}
            role="timer"
            aria-live="polite"
          >
            <div className={styles.cqExamTimerMeta}>
              <span>زمان این سوال</span>
              <strong>{formatTime(timeLeft)}</strong>
              <em>از {formatTime(timePerQ)}</em>
            </div>
            <div className={styles.cqExamTimerTrack}>
              <div
                className={styles.cqExamTimerFill}
                style={{ width: `${timeProgressPct}%` }}
              />
            </div>
          </div>
        ) : (
          <p className={styles.cqExamHintLine}>بدون محدودیت زمان برای هر سوال</p>
        )}

        <article className={styles.cqExamCard}>
          {q?.text ? (
            <h2 className={styles.cqExamQuestion}>{q.text}</h2>
          ) : null}
          {q?.image_url ? (
            <div className={styles.cqQImage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.image_url} alt="" />
            </div>
          ) : null}

          {q?.hint ? (
            <details className={styles.cqHint}>
              <summary>
                <Lightbulb size={14} />
                راهنمای این سوال
              </summary>
              <p>{q.hint}</p>
            </details>
          ) : null}

          <div className={styles.cqExamOptions} role="listbox" aria-label="گزینه‌ها">
            {opts.map((o, index) => {
              const active = String(selectedKey) === String(o.key)
              return (
                <button
                  key={`${q.id}-${o.key}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={locking && !allowBack}
                  className={`${styles.cqExamOpt} ${active ? styles.cqExamOptOn : ''} ${o.image ? styles.cqOptWithImg : ''}`}
                  onClick={() => pickOption(o.key)}
                >
                  <span className={styles.cqExamOptMark}>
                    {LETTERS[index] || o.key}
                  </span>
                  <span className={styles.cqExamOptBody}>
                    {o.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.image} alt="" className={styles.cqOptImg} />
                    ) : null}
                    {o.text ? <span>{o.text}</span> : null}
                  </span>
                  {active ? <Check size={16} className={styles.cqExamOptCheck} /> : null}
                </button>
              )
            })}
          </div>

          {allowBack ? (
            <div className={styles.cqNavRow}>
              <button
                type="button"
                className={styles.cqNavBtn}
                disabled={qIndex <= 0 || locking}
                onClick={goPrev}
              >
                <ChevronRight size={16} /> قبلی
              </button>
              <span className={styles.cqNavMeta}>
                {answeredCount}/{questions.length} پاسخ
              </span>
              {qIndex >= questions.length - 1 ? (
                <button
                  type="button"
                  className={`${styles.cqNavBtn} ${styles.cqNavPrimary}`}
                  disabled={locking || submitting}
                  onClick={() => finish(answersRef.current)}
                >
                  <Check size={16} /> پایان
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.cqNavBtn} ${styles.cqNavPrimary}`}
                  disabled={locking}
                  onClick={confirmNext}
                >
                  بعدی <ChevronLeft size={16} />
                </button>
              )}
            </div>
          ) : (
            <p className={styles.cqExamFootNote}>
              {locking
                ? 'در حال رفتن به سوال بعد…'
                : 'با انتخاب گزینه، به سوال بعد می‌روید'}
            </p>
          )}
        </article>
      </div>
    )
  }

  return (
    <div className={shellClass}>
      <div className={styles.cqExamPicker}>
        <header className={styles.cqExamPickerHead}>
          <span className={styles.cqExamPickerEyebrow}>مشاوره مدرسه</span>
          <h2 className={styles.cqExamPickerTitle}>آزمون‌های هوش و مشاوره</h2>
          <p className={styles.cqExamPickerDesc}>
            یک آزمون را انتخاب کنید؛ سوالات از بانک به‌صورت تصادفی می‌آید.
          </p>
        </header>

        <div className={styles.cqTestGrid}>
          {tests.map((t) => {
            const meta = KIND_META[t.kind] || KIND_META.custom
            const Icon = meta.icon
            const active = String(selectedId) === String(t.id)
            const per = Number(t.questions_per_attempt) || 0
            const bank = t.question_count || 0
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.cqTestCard} ${active ? styles.cqTestCardOn : ''}`}
                style={{ '--cq-accent': meta.color }}
                onClick={() => setSelectedId(t.id)}
                aria-pressed={active}
              >
                <Icon size={22} style={{ color: meta.color }} />
                <span className={styles.cqTestCardKind}>{t.kind_label || meta.label}</span>
                <span className={styles.cqTestCardTitle}>{t.title}</span>
                <span className={styles.cqTestCardMeta}>
                  {per > 0 ? `${per} از ${bank}` : `${bank} سوال`}
                  {' · '}
                  {t.timed_questions ? `${t.seconds_per_question || 30}ث` : 'آزاد'}
                </span>
              </button>
            )
          })}
        </div>

        {!tests.length ? (
          <p className={styles.cqEmpty}>آزمون فعالی تعریف نشده است.</p>
        ) : null}

        <div className={styles.cqExamPickerActions}>
          <button
            type="button"
            className={styles.cqNavBtnPrimaryWide}
            disabled={starting || !selectedId}
            onClick={start}
          >
            {starting ? 'در حال شروع…' : 'شروع آزمون'}
          </button>
          {onCancel ? (
            <button type="button" className={styles.cqNavBtn} onClick={onCancel}>
              بازگشت
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
