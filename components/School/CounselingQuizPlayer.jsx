'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Brain, Heart, Compass, Sparkles, UserRound, Puzzle, Trophy, RefreshCw, X,
  Lightbulb, ChevronRight, ChevronLeft, Check,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import quizStyles from '@/components/Quiz/Quiz.module.css'
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
}) {
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

  const getCardClasses = () => {
    let classes = quizStyles.cardQuestion
    if (timed && timerStatus === 'warning') classes += ` ${quizStyles.warning}`
    if (timed && timerStatus === 'danger') classes += ` ${quizStyles.danger}`
    if (timed && timerStatus === 'heartbeat') classes += ` ${quizStyles.heartbeat}`
    return classes
  }

  const getTimerClass = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger') return quizStyles.timerDanger
    if (timerStatus === 'warning') return quizStyles.timerWarning
    return ''
  }

  const getTimerTextClass = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger') return quizStyles.timerTextRed
    if (timerStatus === 'warning') return quizStyles.timerTextOrange
    return quizStyles.timerTextGreen
  }

  if (result) {
    const pct = result.max_score
      ? Math.round((Number(result.score) / Number(result.max_score)) * 100)
      : 0
    return (
      <div className={`${quizStyles.container} ${styles.cqWrap} ${embedded ? styles.cqEmbedded : ''}`}>
        <div className={quizStyles.card}>
          <div className={quizStyles.resultHeader}>
            <div className={quizStyles.resultEmoji}><Trophy size={40} /></div>
            <h2 className={quizStyles.resultTitle}>{result.result_label || 'نتیجه آزمون'}</h2>
            <p className={quizStyles.resultSubtitle}>{test?.title}</p>
          </div>
          <div className={quizStyles.resultGrid}>
            <div className={quizStyles.details}>
              <div className={quizStyles.detailItem}>
                <span className={quizStyles.detailLabel}>نمره</span>
                <span className={quizStyles.detailValue}>{result.score} / {result.max_score}</span>
              </div>
              <div className={quizStyles.detailItem}>
                <span className={quizStyles.detailLabel}>درصد</span>
                <span className={`${quizStyles.detailValue} ${quizStyles.detailValueGreen}`}>{pct}٪</span>
              </div>
              <div className={quizStyles.detailItem}>
                <span className={quizStyles.detailLabel}>نتیجه</span>
                <span className={quizStyles.detailValue}>{result.result_label}</span>
              </div>
            </div>
          </div>
          {result.result_summary ? (
            <p className={styles.cqResultSummary}>{result.result_summary}</p>
          ) : null}
          <div className={styles.cqResultActions}>
            <button type="button" className={quizStyles.buttonPrimary} onClick={resetToList}>
              <RefreshCw size={16} /> آزمون‌های دیگر
            </button>
            {onCancel ? (
              <button type="button" className={quizStyles.buttonSecondary} onClick={onCancel}>
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

    return (
      <div className={`${quizStyles.container} ${styles.cqWrap} ${embedded ? styles.cqEmbedded : ''}`}>
        <div className={styles.cqSessionTop}>
          <span className={styles.cqSessionBadge} style={{ '--cq-accent': kind.color }}>
            <KindIcon size={14} />
            {test?.kind_label || kind.label}
          </span>
          <button type="button" className={styles.cqAbort} onClick={resetToList} title="انصراف">
            <X size={16} />
          </button>
        </div>

        <div className={getCardClasses()} style={timed ? { '--progress': `${timeProgressPct}%` } : undefined}>
          <div className={quizStyles.questionContent}>
            <div className={quizStyles.questionHeader}>
              <span className={quizStyles.questionCounter}>
                سوال {qIndex + 1} از {questions.length}
                {test?.bank_size && test.bank_size > questions.length
                  ? ` (از بانک ${test.bank_size})`
                  : ''}
              </span>
              {timed ? (
                <div className={`${quizStyles.timer} ${getTimerClass()}`}>
                  <span
                    className={quizStyles.timerRing}
                    style={{ '--progress': `${timeProgressPct}%` }}
                    aria-hidden
                  >
                    <span className={quizStyles.timerRingInner}>
                      <span className={`${quizStyles.timerText} ${getTimerTextClass()}`}>
                        {formatTime(timeLeft)}
                      </span>
                    </span>
                  </span>
                  <span className={quizStyles.timerTotal}>از {formatTime(timePerQ)}</span>
                </div>
              ) : (
                <span className={styles.cqNoTimer}>بدون محدودیت زمان سوال</span>
              )}
            </div>

            {timed ? (
              <div className={quizStyles.timeTrack} aria-hidden>
                <div
                  className={`${quizStyles.timeFill} ${
                    timerStatus === 'warning'
                      ? quizStyles.timeFillWarn
                      : timerStatus === 'danger' || timerStatus === 'heartbeat'
                        ? quizStyles.timeFillDanger
                        : quizStyles.timeFillOk
                  }`}
                  style={{ width: `${timeProgressPct}%` }}
                />
              </div>
            ) : null}

            <div className={quizStyles.progressBar}>
              <div className={quizStyles.progressFill} style={{ width: `${questionProgressPct}%` }} />
            </div>

            <div className={quizStyles.category}>{test?.title}</div>
            {q?.text ? (
              <h2 className={`${quizStyles.questionText} ${styles.cqQuestionText}`}>{q.text}</h2>
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

            <div className={quizStyles.options}>
              {opts.map((o, index) => {
                const active = String(selectedKey) === String(o.key)
                return (
                  <button
                    key={`${q.id}-${o.key}`}
                    type="button"
                    disabled={locking && !allowBack}
                    className={`${quizStyles.optionButton} ${active ? quizStyles.optionButtonSelected : ''} ${o.image ? styles.cqOptWithImg : ''}`}
                    onClick={() => pickOption(o.key)}
                  >
                    <span className={quizStyles.optionLetter}>{LETTERS[index] || o.key}</span>
                    <span className={`${quizStyles.optionText} ${styles.cqOptBody}`}>
                      {o.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.image} alt="" className={styles.cqOptImg} />
                      ) : null}
                      {o.text ? <span>{o.text}</span> : null}
                    </span>
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
                <span className={styles.cqNavMeta}>{answeredCount}/{questions.length} پاسخ</span>
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
            ) : null}

            <div className={quizStyles.questionFooter}>
              <span>{test?.kind_label || kind.label}</span>
              <span>
                {timed
                  ? `زمان: ${formatTime(timeLeft)} از ${formatTime(timePerQ)}`
                  : allowBack
                    ? 'می‌توانید بین سوالات جابه‌جا شوید'
                    : 'پس از انتخاب، سوال بعدی می‌آید'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${quizStyles.container} ${styles.cqWrap} ${embedded ? styles.cqEmbedded : ''}`}>
      <div className={`${quizStyles.card} ${quizStyles.cardWide}`}>
        <div className={quizStyles.header}>
          <div className={`${quizStyles.badge} ${styles.cqIntroBadge}`}>مشاوره مدرسه</div>
          <h1 className={quizStyles.title}>آزمون‌های هوش و مشاوره</h1>
          <p className={quizStyles.subtitle}>
            سوالات از بانک به‌صورت تصادفی برای شما انتخاب می‌شود
          </p>
        </div>

        <div className={`${quizStyles.specialtyGrid} ${styles.cqTestGrid}`}>
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
                className={`${quizStyles.specialtyButton} ${styles.cqTestCard} ${active ? quizStyles.specialtyButtonActive : ''}`}
                style={active ? { borderColor: meta.color } : undefined}
                onClick={() => setSelectedId(t.id)}
                aria-pressed={active}
              >
                <Icon size={26} className={quizStyles.specialtyIcon} style={{ color: meta.color }} />
                <span className={quizStyles.specialtyName}>{t.kind_label || meta.label}</span>
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

        <button
          type="button"
          className={quizStyles.buttonPrimary}
          disabled={starting || !selectedId}
          onClick={start}
        >
          {starting ? 'در حال شروع…' : 'شروع آزمون'}
        </button>
      </div>
    </div>
  )
}
