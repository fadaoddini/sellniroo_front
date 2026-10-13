'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, RefreshCw, CheckSquare, Play, ClipboardList,
  Sparkles, ChevronLeft, Timer, ImagePlus, CircleCheck,
  GraduationCap, Home, ArrowUpLeft, X, Paperclip, ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import DropZone from '@/components/School/DropZone'
import StudentCharts from '@/components/School/StudentCharts'
import ExamResultsPanel from '@/components/School/ExamResultsPanel'
import LessonVideoPlayer, { LessonShareBar } from '@/components/School/LessonVideoPlayer'
import styles from './School.module.css'

const RANK_FA = {
  bronze: 'برنزی',
  silver: 'نقره‌ای',
  gold: 'طلایی',
  platinum: 'پلاتینیوم',
  diamond: 'الماس',
}

const DIFF_FA = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' }

const OPT_FA = {
  a: 'الف', b: 'ب', c: 'ج', d: 'د',
  A: 'الف', B: 'ب', C: 'ج', D: 'د',
}

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

function formatCountdown(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  const raw = h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
  return raw.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

function buildExamDeadline(resData, questionCount) {
  const tpq = Number(
    resData?.time_per_question
    ?? resData?.quiz?.time_per_question
    ?? resData?.paper?.time_per_question
    ?? 30,
  ) || 30
  const totalFromApi = Number(resData?.total_seconds)
  const totalSeconds = Number.isFinite(totalFromApi) && totalFromApi > 0
    ? totalFromApi
    : Math.max(1, tpq * Math.max(1, questionCount || 1))
  const remainingFromApi = Number(resData?.remaining_seconds)
  const remainingSeconds = Number.isFinite(remainingFromApi) && remainingFromApi > 0
    ? remainingFromApi
    : totalSeconds
  // زمان‌سنج را از همین لحظه کلاینت می‌بندیم تا اختلاف timezone باعث بستن فوری نشود
  const now = Date.now()
  return {
    time_per_question: tpq,
    total_seconds: totalSeconds,
    remaining_seconds: remainingSeconds,
    started_at: resData?.started_at || resData?.paper?.started_at || new Date(now).toISOString(),
    ends_at: now + remainingSeconds * 1000,
  }
}

function optLetter(id) {
  if (id == null || id === '') return '—'
  const key = String(id)
  return OPT_FA[key] || OPT_FA[key.toLowerCase()] || key
}

function aparatEmbedSrc(url) {
  const raw = (url || '').trim()
  if (!raw) return null
  try {
    const u = new URL(raw)
    const host = u.hostname.toLowerCase()
    if (host !== 'aparat.com' && !host.endsWith('.aparat.com')) return null
    const hash = u.pathname.match(/\/v\/([^/?#]+)/)?.[1]
      || u.pathname.match(/videohash\/([^/?#]+)/)?.[1]
    if (!hash) return null
    return `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame`
  } catch {
    return null
  }
}

function hasLessonText(html) {
  if (!html) return false
  const text = String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0
}

export default function StudentDashboard() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [tab, setTab] = useState('home')
  const [data, setData] = useState(null)
  const [tree, setTree] = useState([])
  const [lesson, setLesson] = useState(null)
  const [exercises, setExercises] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [quizSession, setQuizSession] = useState(null)
  const [answers, setAnswers] = useState({})
  const [qIndex, setQIndex] = useState(0)
  const [confirmNext, setConfirmNext] = useState(null) // 'next' | 'submit' | null
  const [hwProofEx, setHwProofEx] = useState(null)
  const [hwConfirmEx, setHwConfirmEx] = useState(null)
  const [hwBusy, setHwBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [previewStudentId, setPreviewStudentId] = useState('')
  const [examTimeLeft, setExamTimeLeft] = useState(null)
  const [examTimerAlert, setExamTimerAlert] = useState(null) // 'half' | 'twoMin' | 'ended' | null
  const [examSubmitting, setExamSubmitting] = useState(false)
  const answersRef = useRef({})
  const quizSessionRef = useRef(null)
  const examWarnedHalfRef = useRef(false)
  const examWarnedTwoMinRef = useRef(false)
  const examAutoSubmittedRef = useRef(false)
  const examTimerStartedAtRef = useRef(0)

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login?next=/school/student')
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setErr(null)
    const params = previewStudentId ? { student: previewStudentId } : {}
    const [dash, tr] = await Promise.all([
      schoolService.studentDashboard(params),
      schoolService.tree(),
    ])
    if (!dash.success) {
      setErr(dash.error || 'دسترسی دانش‌آموز ندارید')
      return
    }
    setData(dash.data)
    if (!previewStudentId && dash.data?.profile?.id) {
      setPreviewStudentId(String(dash.data.profile.id))
    }
    if (tr.success) setTree(tr.data || [])
  }, [previewStudentId])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const openLesson = async (id) => {
    const res = await schoolService.getLesson(id)
    if (!res.success) return setErr(res.error)
    setLesson(res.data)
    const [ex, qz] = await Promise.all([
      schoolService.listExercises({ lesson: id }),
      schoolService.listQuizzes({ lesson: id }),
    ])
    if (ex.success) setExercises(ex.data || [])
    if (qz.success) setQuizzes(qz.data || [])
    setTab('lesson')
  }

  const submitExercise = async (exerciseId, file) => {
    setHwBusy(true)
    setErr(null)
    setMsg(null)
    let res
    if (file) {
      const fd = new FormData()
      fd.append('is_done', 'true')
      fd.append('proof_image', file)
      res = await schoolService.submitExercise(exerciseId, fd)
    } else {
      res = await schoolService.submitExercise(exerciseId, { is_done: true })
    }
    setHwBusy(false)
    if (res.success) {
      setMsg(file ? 'مدرک تکلیف ارسال شد' : 'تکلیف به‌عنوان انجام‌شده ثبت شد')
      setHwProofEx(null)
      setHwConfirmEx(null)
      if (lesson) await openLesson(lesson.id)
      await load()
    } else {
      setErr(res.error || 'ثبت تکلیف ناموفق بود')
    }
  }

  const resetExamTimerState = () => {
    setExamTimeLeft(null)
    setExamTimerAlert(null)
    setExamSubmitting(false)
    examWarnedHalfRef.current = false
    examWarnedTwoMinRef.current = false
    examAutoSubmittedRef.current = false
    examTimerStartedAtRef.current = 0
  }

  const studentScope = () => (
    previewStudentId ? { student: previewStudentId } : {}
  )

  const startExamPaper = async (paperId) => {
    if (paperId == null || paperId === '') {
      return setErr('شناسه آزمون نامعتبر است')
    }
    const res = await schoolService.startExamPaper(paperId, studentScope())
    if (!res.success) return setErr(res.error)
    const allowBack = res.data?.allow_back ?? res.data?.quiz?.allow_back ?? res.data?.paper?.allow_back
    const questions = res.data.questions || res.data.paper?.questions || []
    const deadline = buildExamDeadline(res.data, questions.length)
    if (!questions.length) {
      return setErr('برای این آزمون سوالی تعریف نشده است')
    }
    resetExamTimerState()
    examTimerStartedAtRef.current = Date.now()
    setExamTimeLeft(deadline.remaining_seconds)
    setQuizSession({
      ...res.data,
      ...deadline,
      mode: 'exam',
      allow_back: allowBack !== false,
      questions,
    })
    setAnswers({})
    setQIndex(0)
    setConfirmNext(null)
    setTab('quiz')
    setMsg(null)
  }

  const startQuiz = async (quizId) => {
    if (quizId == null || quizId === '') {
      return setErr('شناسه آزمون نامعتبر است')
    }
    const res = await schoolService.startQuiz(quizId, studentScope())
    if (!res.success) return setErr(res.error)
    const questions = res.data.questions || []
    const deadline = buildExamDeadline(res.data, questions.length)
    if (!questions.length) {
      return setErr('برای این آزمون سوالی تعریف نشده است')
    }
    resetExamTimerState()
    examTimerStartedAtRef.current = Date.now()
    setExamTimeLeft(deadline.remaining_seconds)
    setQuizSession({
      ...res.data,
      ...deadline,
      mode: 'legacy',
      allow_back: true,
      questions,
    })
    setAnswers({})
    setQIndex(0)
    setConfirmNext(null)
    setTab('quiz')
    setMsg(null)
  }

  const submitQuiz = useCallback(async ({ timedOut = false } = {}) => {
    const session = quizSessionRef.current
    if (!session || examAutoSubmittedRef.current) return
    if (timedOut) examAutoSubmittedRef.current = true
    setExamSubmitting(true)
    setConfirmNext(null)
    setErr(null)

    const currentAnswers = answersRef.current || {}
    const startedMs = session.started_at ? new Date(session.started_at).getTime() : null
    const durationSeconds = Number.isFinite(startedMs)
      ? Math.max(0, Math.round((Date.now() - startedMs) / 1000))
      : undefined

    let res
    const scope = previewStudentId ? { student: previewStudentId } : {}
    if (session.mode === 'exam') {
      const payload = {
        paper_id: session.paper?.id || session.quiz?.id,
        answers: Object.entries(currentAnswers).map(([question_id, answer]) => ({
          question_id,
          answer,
        })),
        duration_seconds: durationSeconds,
        ...scope,
      }
      res = await schoolService.submitExamPaper(payload)
    } else {
      const payload = {
        quiz_id: session.quiz.id,
        answers: Object.entries(currentAnswers).map(([question_id, answer]) => ({
          question_id: Number(question_id),
          answer,
        })),
        duration_seconds: durationSeconds,
        ...scope,
      }
      res = await schoolService.submitQuiz(payload)
    }

    setExamSubmitting(false)
    if (res.success) {
      setMsg(
        timedOut
          ? `زمان آزمون تمام شد · نتیجه: ${faNum(res.data.percentage)}٪`
          : `نتیجه آزمون: ${faNum(res.data.percentage)}٪`,
      )
      setQuizSession(null)
      resetExamTimerState()
      setTab('results')
      load()
    } else {
      if (timedOut) examAutoSubmittedRef.current = false
      setErr(res.error || 'ثبت آزمون ناموفق بود')
    }
  }, [load, previewStudentId])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    quizSessionRef.current = quizSession
  }, [quizSession])

  useEffect(() => {
    if (!quizSession?.ends_at) {
      setExamTimeLeft(null)
      return undefined
    }

    const totalSeconds = Number(quizSession.total_seconds) || 0
    const halfMark = Math.floor(totalSeconds / 2)

    const tick = () => {
      const left = Math.max(0, Math.ceil((quizSession.ends_at - Date.now()) / 1000))
      setExamTimeLeft(left)

      if (halfMark > 120 && left <= halfMark && !examWarnedHalfRef.current) {
        examWarnedHalfRef.current = true
        setExamTimerAlert('half')
      }

      if (
        totalSeconds > 120
        && left <= 120
        && left > 0
        && !examWarnedTwoMinRef.current
      ) {
        examWarnedTwoMinRef.current = true
        setExamTimerAlert('twoMin')
      }

      // جلوگیری از بستن فوری به‌خاطر اختلاف ساعت/timezone در لحظه ورود
      const elapsedSinceOpen = Date.now() - (examTimerStartedAtRef.current || 0)
      if (left <= 0 && !examAutoSubmittedRef.current && elapsedSinceOpen > 1500) {
        setExamTimerAlert('ended')
        submitQuiz({ timedOut: true })
      }
    }

    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [quizSession?.ends_at, quizSession?.total_seconds, submitQuiz])

  const pendingExams = data?.pending_exams || []
  const pendingQuizzes = data?.pending_quizzes || []
  const pendingHw = data?.pending_exercises || []
  const charts = data?.charts || {}
  const hwBySubject = useMemo(() => {
    const map = new Map()
    pendingHw.forEach((ex) => {
      const id = ex.subject_id ?? 'other'
      const title = ex.subject_title || 'سایر'
      const color = ex.subject_color || '#e8b800'
      if (!map.has(id)) {
        map.set(id, { id, title, color, items: [] })
      }
      map.get(id).items.push(ex)
    })
    return Array.from(map.values())
  }, [pendingHw])

  const quizBySubject = useMemo(() => {
    const map = new Map()
    const ensure = (id, title, color) => {
      if (!map.has(id)) {
        map.set(id, { id, title, color: color || '#e8b800', items: [] })
      }
      return map.get(id)
    }

    pendingExams.forEach((p) => {
      const ids = p.subject_ids || []
      const titles = p.subject_titles || []
      const colors = p.subject_colors || []
      const isSingle = ids.length === 1 || (ids.length === 0 && titles.length === 1)
      if (isSingle) {
        const sid = ids[0] ?? titles[0]
        const stitle = titles[0] || 'سایر'
        ensure(sid, stitle, colors[0]).items.push({ ...p, kind: 'exam' })
      } else {
        ensure('comprehensive', 'جامع', '#e8b800').items.push({ ...p, kind: 'exam' })
      }
    })

    pendingQuizzes.forEach((q) => {
      const sid = q.subject_id ?? 'other'
      ensure(sid, q.subject_title || 'سایر', q.subject_color).items.push({
        ...q,
        kind: 'quiz',
      })
    })

    const sections = Array.from(map.values())
    sections.sort((a, b) => {
      if (a.id === 'comprehensive') return 1
      if (b.id === 'comprehensive') return -1
      return String(a.title).localeCompare(String(b.title), 'fa')
    })
    return sections
  }, [pendingExams, pendingQuizzes])
  const tabs = useMemo(() => {
    const quizBadge = (pendingExams.length || pendingQuizzes.length) || null
    const list = [
      ['home', 'خانه', null],
      ['lessons', 'دروس', null],
      ['homework', 'تکالیف', pendingHw.length || null],
      ['quiz', 'آزمون', quizBadge],
      ['results', 'نتایج', null],
      ['tips', 'پیشنهادها', null],
    ]
    if (lesson) list.push(['lesson', 'درس جاری', null])
    return list
  }, [pendingHw.length, pendingExams.length, pendingQuizzes.length, lesson])

  if (loading || !isAuthenticated) return null
  if (!data) {
    return (
      <div className={`${styles.page} ${styles.studentPage}`} dir="rtl" lang="fa">
        <div className={styles.wrap}>
          {err ? <div className={styles.err}>{err}</div> : <div className={styles.empty}>در حال بارگذاری…</div>}
        </div>
      </div>
    )
  }

  const rank = data.rank || {}
  const profile = data.profile || {}
  const quizQs = quizSession?.questions || []
  const currentQ = quizQs[qIndex]
  const allowBack = quizSession?.allow_back !== false
  const isLastQuestion = qIndex >= quizQs.length - 1

  const requestNextStep = () => {
    if (!currentQ || !answers[currentQ.id]) return
    if (quizSession?.mode === 'exam' && !allowBack) {
      setConfirmNext(isLastQuestion ? 'submit' : 'next')
      return
    }
    if (isLastQuestion) submitQuiz()
    else setQIndex((i) => i + 1)
  }

  const confirmNextStep = () => {
    const action = confirmNext
    setConfirmNext(null)
    if (action === 'submit') submitQuiz()
    else if (action === 'next') setQIndex((i) => i + 1)
  }

  return (
    <div className={`${styles.page} ${styles.studentPage}`} dir="rtl" lang="fa">
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroBrand}>
            <span className={styles.badge}>
              <GraduationCap size={12} />
              پنل دانش‌آموز
            </span>
            <h1 className={styles.brand}>
              مدرسه<span className={styles.brandAccent}> من</span>
            </h1>
            <p className={styles.tagline}>
              دروس، تکالیف، آزمون و پیشرفت تحصیلی
              {data.is_admin_preview ? ' · پیش‌نمایش مدیر' : ''}
            </p>
            <nav className={styles.heroNav} aria-label="میانبرها">
              <Link href="/school"><Home size={12} /> هاب مدرسه</Link>
              <Link href="/"><ArrowUpLeft size={12} /> سایت</Link>
              <button type="button" onClick={load}><RefreshCw size={12} /> بروزرسانی</button>
              {(charts.quiz_summary?.pending || 0) > 0 ? (
                <button type="button" onClick={() => setTab('quiz')}>
                  <Play size={12} /> {faNum(charts.quiz_summary.pending)} آزمون باز
                </button>
              ) : null}
            </nav>
          </div>
          <div className={styles.heroIdentity}>
            <div className={styles.avatar}>
              <BookOpen size={18} />
            </div>
            <div>
              <p className={styles.ownerName}>{profile.display_name || 'دانش‌آموز'}</p>
              <p className={styles.ownerRole}>
                {profile.grade ? `پایه ${faNum(profile.grade)}` : 'داشبورد دانش‌آموز'}
                {' · '}رتبه {RANK_FA[rank.current] || rank.current}
              </p>
            </div>
          </div>
        </header>

        {data.is_admin_preview && (data.preview_students || []).length > 0 ? (
          <div className={styles.previewBar}>
            <div className={styles.field}>
              <label>پیش‌نمایش به‌عنوان دانش‌آموز</label>
              <select
                value={previewStudentId || profile.id || ''}
                onChange={(e) => setPreviewStudentId(e.target.value)}
              >
                {(data.preview_students || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.display_name} — {s.grade || 'بدون پایه'}</option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>امتیاز</p>
            <p className={styles.statValue}>{faNum(profile.activity_points || 0)}</p>
          </div>
          <div className={`${styles.stat} ${styles.statOk}`}>
            <p className={styles.statLabel}>معدل</p>
            <p className={styles.statValue}>{faNum(data.average_percent || 0)}٪</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>تکالیف باز</p>
            <p className={styles.statValue}>{faNum(pendingHw.length)}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>آزمون باز</p>
            <p className={styles.statValue}>{faNum(pendingExams.length + pendingQuizzes.length)}</p>
          </div>
        </div>

        <div className={styles.rankCard}>
          <div className={styles.rankRow}>
            <div>
              <strong>رتبه {RANK_FA[rank.current] || rank.current}</strong>
              <span className={styles.rankMeta}>
                پیشرفت تا رتبه بعدی
              </span>
            </div>
          </div>
          {rank.next ? (
            <p className={styles.rankHint}>
              تا {RANK_FA[rank.next]} به {faNum(rank.points_needed)} امتیاز دیگر نیاز دارید.
            </p>
          ) : (
            <p className={styles.rankHint}>شما در بالاترین رتبه هستید.</p>
          )}
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${rank.progress_percent || 0}%` }} />
          </div>
        </div>

        <div className={styles.tabs}>
          {tabs.map(([k, l, badge]) => (
            <button
              key={k}
              type="button"
              className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`}
              onClick={() => setTab(k)}
            >
              {l}
              {badge ? <span className={styles.tabBadge}>{faNum(badge)}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'home' ? (
          <div className={styles.homeLayout}>
            <section className={styles.homeCol}>
              <div className={styles.homeColHead}>
                <h2 className={styles.homeColTitle}>اقدامات سریع</h2>
              </div>
              <div className={styles.homeQuickStack}>
                {pendingExams.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.quickCard}
                    onClick={() => startExamPaper(p.id)}
                  >
                    <span className={styles.quickIcon}><Play size={16} /></span>
                    <span>
                      <strong>{p.exam_title}</strong>
                      <small>
                        {faNum(p.total_questions)} سوال
                        {p.allow_back === false ? ' · بدون برگشت' : ' اختصاصی'}
                      </small>
                    </span>
                    <ChevronLeft size={16} />
                  </button>
                ))}
                {pendingQuizzes.slice(0, 2).map((q) => (
                  <button
                    key={`q-${q.id}`}
                    type="button"
                    className={styles.quickCard}
                    onClick={() => startQuiz(q.id)}
                  >
                    <span className={styles.quickIcon}><Play size={16} /></span>
                    <span>
                      <strong>{q.title}</strong>
                      <small>
                        {[q.subject_title, q.lesson_title].filter(Boolean).join(' · ') || 'کوییز'}
                      </small>
                    </span>
                    <ChevronLeft size={16} />
                  </button>
                ))}
                {pendingHw.slice(0, 3).map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    className={styles.quickCard}
                    onClick={() => setTab('homework')}
                  >
                    <span className={styles.quickIcon}><ClipboardList size={16} /></span>
                    <span>
                      <strong>{ex.title}</strong>
                      <small>{ex.lesson_title || ex.subject_title || 'تکلیف'}</small>
                    </span>
                    <ChevronLeft size={16} />
                  </button>
                ))}
                {!pendingExams.length && !pendingQuizzes.length && !pendingHw.length ? (
                  <p className={styles.homeColEmpty}>فعلاً کار بازی ندارید.</p>
                ) : null}
              </div>
            </section>

            <section className={styles.homeCol}>
              <div className={styles.homeColHead}>
                <h2 className={styles.homeColTitle}>نمودار پیشرفت</h2>
              </div>
              <StudentCharts charts={charts} mode="stack" />
            </section>

            <section className={styles.homeCol}>
              <div className={styles.homeColHead}>
                <h2 className={styles.homeColTitle}>دروس اخیر</h2>
                <button type="button" className={styles.btnGhost} onClick={() => setTab('lessons')}>
                  همه
                </button>
              </div>
              <div className={styles.homeLessonStack}>
                {(data.recent_lessons || []).slice(0, 6).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={styles.homeLessonCard}
                    onClick={() => openLesson(l.id)}
                  >
                    {l.cover_url ? (
                      <img src={l.cover_url} alt="" className={styles.homeLessonThumb} />
                    ) : (
                      <span className={styles.homeLessonThumbPh}>
                        <BookOpen size={18} />
                      </span>
                    )}
                    <span className={styles.homeLessonBody}>
                      <small>{l.subject_title}</small>
                      <strong>{l.title}</strong>
                      {l.estimated_minutes ? (
                        <em><Timer size={11} /> {faNum(l.estimated_minutes)} دقیقه</em>
                      ) : null}
                    </span>
                  </button>
                ))}
                {!(data.recent_lessons || []).length ? (
                  <p className={styles.homeColEmpty}>درسی برای نمایش نیست</p>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}

        {tab === 'lessons' ? (
          <div className={styles.hwPanel}>
            <div className={styles.hwBar}>
              <div>
                <h2 className={styles.hwBarTitle}>دروس</h2>
                <p className={styles.hwBarSub}>
                  {tree.length
                    ? `${faNum(tree.length)} بخش · هر فصل در یک کارت`
                    : 'درسی برای نمایش نیست'}
                </p>
              </div>
            </div>

            {tree.length ? (
              <div className={styles.hwSections}>
                {tree.map((s) => {
                  const chapters = s.chapters || []
                  const color = s.color || '#e8b800'
                  const lessonTotal = chapters.reduce(
                    (n, c) => n + ((c.lessons || []).length),
                    0,
                  )
                  return (
                    <section key={s.id} className={styles.hwSection}>
                      <header className={styles.hwSectionHead}>
                        <span
                          className={styles.hwSectionDot}
                          style={{ background: color }}
                          aria-hidden
                        />
                        <div className={styles.hwSectionTitles}>
                          <h3 className={styles.hwSectionTitle}>{s.title}</h3>
                          <p className={styles.hwSectionMeta}>
                            {faNum(chapters.length)} فصل · {faNum(lessonTotal)} درس
                          </p>
                        </div>
                      </header>

                      {chapters.length ? (
                        <div className={styles.chapterGrid}>
                          {chapters.map((c) => {
                            const lessons = c.lessons || []
                            return (
                              <article key={c.id} className={styles.chapterCard}>
                                <div
                                  className={styles.chapterCardAccent}
                                  style={{ background: color }}
                                  aria-hidden
                                />
                                <div className={styles.chapterCardInner}>
                                  <div className={styles.chapterCardHead}>
                                    <strong className={styles.chapterCardTitle}>
                                      {c.title}
                                    </strong>
                                    <span className={styles.chapterCardCount}>
                                      {faNum(lessons.length)} درس
                                    </span>
                                  </div>
                                  {lessons.length ? (
                                    <ul className={styles.chapterLessonList}>
                                      {lessons.map((l) => (
                                        <li key={l.id}>
                                          <button
                                            type="button"
                                            className={`${styles.chapterLessonBtn} ${
                                              lesson?.id === l.id ? styles.chapterLessonOn : ''
                                            }`}
                                            onClick={() => openLesson(l.id)}
                                          >
                                            <span className={styles.chapterLessonDot} aria-hidden />
                                            <span className={styles.chapterLessonText}>
                                              {l.title}
                                            </span>
                                            {l.estimated_minutes ? (
                                              <em>
                                                <Timer size={11} />
                                                {faNum(l.estimated_minutes)}د
                                              </em>
                                            ) : (
                                              <ChevronLeft size={14} />
                                            )}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className={styles.chapterEmpty}>درسی در این فصل نیست</p>
                                  )}
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      ) : (
                        <p className={styles.chapterEmpty}>فصلی برای این بخش ثبت نشده</p>
                      )}
                    </section>
                  )
                })}
              </div>
            ) : (
              <div className={styles.hwEmpty}>
                <span className={styles.hwEmptyIcon}><BookOpen size={26} /></span>
                <strong>درسی برای نمایش نیست</strong>
                <p>هنوز برنامه درسی برای شما تعریف نشده است.</p>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'homework' ? (
          <div className={styles.hwPanel}>
            <div className={styles.hwBar}>
              <div>
                <h2 className={styles.hwBarTitle}>تکالیف</h2>
                <p className={styles.hwBarSub}>
                  {pendingHw.length
                    ? `${faNum(pendingHw.length)} تکلیف در ${faNum(hwBySubject.length)} بخش`
                    : 'تکلیف بازی ندارید'}
                </p>
              </div>
            </div>

            {hwBySubject.length ? (
              <div className={styles.hwSections}>
                {hwBySubject.map((section) => (
                  <section key={section.id} className={styles.hwSection}>
                    <header className={styles.hwSectionHead}>
                      <span
                        className={styles.hwSectionDot}
                        style={{ background: section.color }}
                        aria-hidden
                      />
                      <div className={styles.hwSectionTitles}>
                        <h3 className={styles.hwSectionTitle}>{section.title}</h3>
                        <p className={styles.hwSectionMeta}>
                          {faNum(section.items.length)} تکلیف
                        </p>
                      </div>
                    </header>
                    <div className={styles.hwGrid}>
                      {section.items.map((ex) => (
                        <article key={ex.id} className={styles.hwCard}>
                          <div
                            className={styles.hwCardAccent}
                            style={{ background: section.color }}
                            aria-hidden
                          />
                          <div className={styles.hwCardInner}>
                            <div className={styles.hwCardTop}>
                              <strong className={styles.hwCardTitle}>{ex.title}</strong>
                              {ex.lesson_title ? (
                                <button
                                  type="button"
                                  className={styles.hwCardLesson}
                                  onClick={() => ex.lesson && openLesson(ex.lesson)}
                                >
                                  <BookOpen size={12} />
                                  {ex.lesson_title}
                                </button>
                              ) : null}
                            </div>
                            {ex.description ? (
                              <p className={styles.hwCardDesc}>{ex.description}</p>
                            ) : (
                              <p className={styles.hwCardDescMuted}>بدون توضیح</p>
                            )}
                            <div className={styles.hwCardActions}>
                              <button
                                type="button"
                                className={styles.hwProofBtn}
                                onClick={() => setHwProofEx(ex)}
                              >
                                <ImagePlus size={15} />
                                ارسال مدرک
                              </button>
                              <button
                                type="button"
                                className={styles.hwDoneBtn}
                                onClick={() => setHwConfirmEx(ex)}
                              >
                                <CheckSquare size={15} />
                                انجام دادم
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.hwEmpty}>
                <span className={styles.hwEmptyIcon}><CircleCheck size={26} /></span>
                <strong>همه تکالیف انجام شده‌اند</strong>
                <p>فعلاً تکلیف بازی باقی نمانده.</p>
                <div className={styles.hwEmptyActions}>
                  <button type="button" className={styles.btnGhost} onClick={() => setTab('lessons')}>
                    دروس
                  </button>
                  <button type="button" className={styles.btnAccent} onClick={() => setTab('quiz')}>
                    آزمون‌ها
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'quiz' ? (
          <div>
            {quizSession && currentQ ? (
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2 className={styles.panelTitle}>{quizSession.quiz?.title}</h2>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={examSubmitting}
                    onClick={() => {
                      setQuizSession(null)
                      setAnswers({})
                      setQIndex(0)
                      setConfirmNext(null)
                      resetExamTimerState()
                    }}
                  >
                    انصراف
                  </button>
                </div>

                {examTimeLeft != null && quizSession.ends_at ? (
                  <div
                    className={`${styles.examTimerBar} ${
                      examTimeLeft <= 120
                        ? styles.examTimerBarCritical
                        : examTimeLeft <= Math.floor((quizSession.total_seconds || 0) / 2)
                          ? styles.examTimerBarWarn
                          : ''
                    }`}
                    role="timer"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className={styles.examTimerMeta}>
                      <Timer size={16} aria-hidden />
                      <span>زمان باقی‌مانده</span>
                    </div>
                    <strong className={styles.examTimerValue}>
                      {formatCountdown(examTimeLeft)}
                    </strong>
                    <div className={styles.examTimerTrack} aria-hidden>
                      <div
                        className={styles.examTimerFill}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              (examTimeLeft / Math.max(1, quizSession.total_seconds || 1)) * 100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {examTimerAlert === 'half' ? (
                  <div className={styles.examTimerAlert} role="alert">
                    <div>
                      <strong>هشدار زمان</strong>
                      <p>دانش‌آموز عزیز، نیمی از زمان آزمون گذشته است.</p>
                    </div>
                    <button
                      type="button"
                      className={styles.examTimerAlertClose}
                      aria-label="بستن"
                      onClick={() => setExamTimerAlert(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}

                {examTimerAlert === 'twoMin' ? (
                  <div className={`${styles.examTimerAlert} ${styles.examTimerAlertCritical}`} role="alert">
                    <div>
                      <strong>هشدار زمان</strong>
                      <p>دانش‌آموز عزیز، فقط دو دقیقه زمان باقی مانده است.</p>
                    </div>
                    <button
                      type="button"
                      className={styles.examTimerAlertClose}
                      aria-label="بستن"
                      onClick={() => setExamTimerAlert(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}

                {examTimerAlert === 'ended' || examSubmitting ? (
                  <div className={`${styles.examTimerAlert} ${styles.examTimerAlertCritical}`} role="status">
                    <div>
                      <strong>پایان زمان</strong>
                      <p>زمان آزمون تمام شد. در حال ثبت پاسخ‌ها…</p>
                    </div>
                  </div>
                ) : null}

                {quizSession.mode === 'exam' && !allowBack ? (
                  <div className={styles.quizNoBackWarn} role="alert">
                    <strong>توجه:</strong>
                    {' '}
                    در این آزمون امکان برگشت به سوال قبلی وجود ندارد.
                    بعد از تأیید رفتن به سوال بعد، دیگر نمی‌توانید به این سوال برگردید.
                  </div>
                ) : null}

                <div className={styles.quizProgressBar}>
                  <div
                    className={styles.quizProgressFill}
                    style={{ width: `${((qIndex + 1) / Math.max(1, quizQs.length)) * 100}%` }}
                  />
                </div>
                <p className={styles.quizProgress}>
                  سوال {faNum(qIndex + 1)} از {faNum(quizQs.length)}
                  {currentQ.difficulty ? ` · ${DIFF_FA[currentQ.difficulty] || currentQ.difficulty}` : ''}
                </p>
                {currentQ.question_image_url ? (
                  <img src={currentQ.question_image_url} alt="" className={styles.cover} />
                ) : null}
                {currentQ.question_text ? (
                  <p className={styles.quizQuestion}>{currentQ.question_text}</p>
                ) : null}
                {(currentQ.hint_text || currentQ.hint_image_url) ? (
                  <details className={styles.quizHint}>
                    <summary>راهنمای سوال</summary>
                    {currentQ.hint_text ? <p>{currentQ.hint_text}</p> : null}
                    {currentQ.hint_image_url ? (
                      <img src={currentQ.hint_image_url} alt="" className={styles.cover} />
                    ) : null}
                  </details>
                ) : null}
                {(currentQ.options || []).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={examSubmitting}
                    className={`${styles.quizOpt} ${answers[currentQ.id] === opt.id ? styles.quizOptOn : ''}`}
                    onClick={() => setAnswers((p) => ({ ...p, [currentQ.id]: opt.id }))}
                  >
                    <span className={styles.quizOptMark}>{optLetter(opt.id)}</span>
                    {opt.image ? <img src={opt.image} alt="" /> : null}
                    <span className={styles.quizOptText}>
                      {opt.text || (opt.image ? 'گزینه تصویری' : '—')}
                    </span>
                  </button>
                ))}
                <div className={styles.rowActions} style={{ marginTop: 12 }}>
                  {allowBack ? (
                    <button
                      type="button"
                      className={styles.btnGhost}
                      disabled={qIndex === 0 || examSubmitting}
                      onClick={() => setQIndex((i) => i - 1)}
                    >
                      قبلی
                    </button>
                  ) : (
                    <span className={styles.metaMuted}>برگشت غیرفعال است</span>
                  )}
                  {isLastQuestion ? (
                    <button
                      type="button"
                      className={styles.btnAccent}
                      disabled={!answers[currentQ.id] || examSubmitting}
                      onClick={requestNextStep}
                    >
                      {examSubmitting ? 'در حال ثبت…' : 'ثبت آزمون'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.btn}
                      disabled={!answers[currentQ.id] || examSubmitting}
                      onClick={requestNextStep}
                    >
                      بعدی
                    </button>
                  )}
                </div>

                {confirmNext ? (
                  <div
                    className={styles.hwModalBackdrop}
                    role="presentation"
                    onClick={() => setConfirmNext(null)}
                  >
                    <div
                      className={styles.quizConfirmModal}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="quiz-confirm-title"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 id="quiz-confirm-title">آیا مطمئن هستید؟</h3>
                      <p>
                        {confirmNext === 'submit'
                          ? 'با ثبت آزمون، پاسخ این سوال نهایی می‌شود و امکان برگشت به سوالات قبلی وجود ندارد.'
                          : 'برای رفتن به سوال بعد مطمئن هستید؟ برگشت به این سوال غیرممکن است.'}
                      </p>
                      <div className={styles.formActions}>
                        <button type="button" className={styles.btnAccent} onClick={confirmNextStep}>
                          {confirmNext === 'submit' ? 'بله، ثبت آزمون' : 'بله، سوال بعد'}
                        </button>
                        <button type="button" className={styles.btnGhost} onClick={() => setConfirmNext(null)}>
                          انصراف
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className={styles.hwPanel}>
                <div className={styles.hwBar}>
                  <div>
                    <h2 className={styles.hwBarTitle}>آزمون‌ها</h2>
                    <p className={styles.hwBarSub}>
                      {pendingExams.length + pendingQuizzes.length
                        ? `${faNum(pendingExams.length + pendingQuizzes.length)} آزمون در ${faNum(quizBySubject.length)} بخش`
                        : 'آزمون بازی ندارید'}
                    </p>
                  </div>
                </div>

                {quizBySubject.length ? (
                  <div className={styles.hwSections}>
                    {quizBySubject.map((section) => (
                      <section key={section.id} className={styles.hwSection}>
                        <header className={styles.hwSectionHead}>
                          <span
                            className={styles.hwSectionDot}
                            style={{ background: section.color }}
                            aria-hidden
                          />
                          <div className={styles.hwSectionTitles}>
                            <h3 className={styles.hwSectionTitle}>{section.title}</h3>
                            <p className={styles.hwSectionMeta}>
                              {faNum(section.items.length)} آزمون
                              {section.id === 'comprehensive' ? ' · چندبخشی' : ''}
                            </p>
                          </div>
                        </header>
                        <div className={styles.examGrid}>
                          {section.items.map((item) => {
                            const isExam = item.kind === 'exam'
                            const title = isExam ? item.exam_title : item.title
                            const meta = isExam
                              ? ((item.subject_titles || []).length > 1
                                ? (item.subject_titles || []).join(' · ')
                                : null)
                              : (item.lesson_title || null)
                            const qCount = isExam
                              ? item.total_questions
                              : (item.question_count || 0)
                            const noBack = isExam && item.allow_back === false

                            return (
                              <article key={`${item.kind}-${item.id}`} className={styles.examCard}>
                                <div
                                  className={styles.examCardAccent}
                                  style={{ background: section.color }}
                                  aria-hidden
                                />
                                <div className={styles.examCardInner}>
                                  <div className={styles.examCardTop}>
                                    <span className={styles.examCardKind}>
                                      {isExam ? 'آزمون' : 'کوییز'}
                                    </span>
                                    {noBack ? (
                                      <span className={styles.examCardWarn}>بدون برگشت</span>
                                    ) : null}
                                  </div>
                                  <strong className={styles.examCardTitle}>{title}</strong>
                                  {meta ? (
                                    <p className={styles.examCardMeta}>{meta}</p>
                                  ) : null}
                                  <div className={styles.examCardStats}>
                                    <span>
                                      <ClipboardList size={12} />
                                      {faNum(qCount)} سوال
                                    </span>
                                    {isExam && item.time_per_question ? (
                                      <span>
                                        <Timer size={12} />
                                        {faNum(item.time_per_question)} ث
                                      </span>
                                    ) : null}
                                  </div>
                                  <button
                                    type="button"
                                    className={styles.examStartBtn}
                                    onClick={() => (
                                      isExam
                                        ? startExamPaper(item.id)
                                        : startQuiz(item.id)
                                    )}
                                  >
                                    <Play size={14} />
                                    شروع
                                  </button>
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className={styles.hwEmpty}>
                    <span className={styles.hwEmptyIcon}><CircleCheck size={26} /></span>
                    <strong>آزمون بازی باقی نمانده</strong>
                    <p>همه آزمون‌ها را داده‌اید.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {tab === 'results' ? (
          <div>
            {(charts.score_trend || []).length || (charts.subject_averages || []).length ? (
              <div className={styles.panel} style={{ marginBottom: 12 }}>
                <h2 className={styles.panelTitle}>نمودار پیشرفت</h2>
                <StudentCharts charts={charts} mode="results" />
              </div>
            ) : null}
            <ExamResultsPanel
              studentMode
              studentId={previewStudentId || profile?.id || null}
              onNotify={(m, isErr) => {
                if (isErr) setErr(m)
                else { setMsg(m); setErr(null) }
              }}
            />
          </div>
        ) : null}

        {tab === 'tips' ? (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>پیشنهادهای رشد</h2>
            {(data.recommendations || []).map((t, i) => (
              <div key={i} className={styles.tip}>
                <Sparkles size={14} style={{ marginInlineEnd: 6, verticalAlign: 'middle' }} />
                {t.message}
              </div>
            ))}
            {!(data.recommendations || []).length ? (
              <p className={styles.empty}>پیشنهادی نیست — عملکرد خوبی دارید.</p>
            ) : null}
          </div>
        ) : null}

        {tab === 'lesson' && lesson ? (() => {
          const subjectColor = tree.find((s) => s.id === lesson.subject_id)?.color || '#e8b800'
          const hasFileVideo = Boolean(lesson.video_file_url)
          const aparatSrc = !hasFileVideo ? aparatEmbedSrc(lesson.video_url) : null
          const hasVideo = hasFileVideo || Boolean(aparatSrc)
          const showText = hasLessonText(lesson.content_html)
          const pendingLessonHw = exercises.filter(
            (ex) => !ex.my_submission?.is_done || ex.my_submission?.status === 'rejected',
          )

          return (
            <div className={styles.lessonView}>
              <header className={styles.lessonHero}>
                <div className={styles.lessonHeroMain}>
                  <div className={styles.lessonHeroActions}>
                    <button
                      type="button"
                      className={styles.lessonBackBtn}
                      onClick={() => setTab('lessons')}
                    >
                      <ChevronLeft size={14} />
                      بازگشت به دروس
                    </button>
                  </div>
                  <div className={styles.lessonBreadcrumb}>
                    <span
                      className={styles.lessonSubjectChip}
                      style={{
                        color: subjectColor,
                        background: `${subjectColor}22`,
                        borderColor: `${subjectColor}44`,
                      }}
                    >
                      {lesson.subject_title || 'بخش'}
                    </span>
                    {lesson.chapter_title ? (
                      <span className={styles.lessonChapterChip}>{lesson.chapter_title}</span>
                    ) : null}
                  </div>
                  <h2 className={styles.lessonHeroTitle}>{lesson.title}</h2>
                  <div className={styles.lessonHeroMeta}>
                    {lesson.estimated_minutes ? (
                      <span><Timer size={13} /> {faNum(lesson.estimated_minutes)} دقیقه</span>
                    ) : null}
                    {exercises.length ? (
                      <span><ClipboardList size={13} /> {faNum(exercises.length)} تمرین</span>
                    ) : null}
                    {quizzes.length ? (
                      <span><Play size={13} /> {faNum(quizzes.length)} آزمون</span>
                    ) : null}
                  </div>
                </div>
              </header>

              {!hasVideo && lesson.cover_url ? (
                <div className={styles.lessonBanner}>
                  <img src={lesson.cover_url} alt="" />
                </div>
              ) : null}

              {(() => {
                const renderExercises = (compact) => (
                  <section className={`${styles.lessonBlock} ${compact ? styles.lessonExercisesSide : ''}`}>
                    <div className={styles.lessonBlockHead}>
                      <h3 className={styles.lessonBlockTitle}>
                        تمرین‌ها
                        <em>{faNum(exercises.length)}</em>
                      </h3>
                      {pendingLessonHw.length ? (
                        <span className={styles.lessonBlockHint}>
                          {faNum(pendingLessonHw.length)} مورد باز
                        </span>
                      ) : null}
                    </div>
                    <div className={compact ? styles.lessonSideHwList : styles.hwGrid}>
                      {exercises.map((ex) => {
                        const done = !!ex.my_submission?.is_done
                        const status = ex.my_submission?.status
                        const needsAction = !done || status === 'rejected'
                        const statusLabel = !done
                          ? 'در انتظار'
                          : status === 'approved'
                            ? 'تأیید شده'
                            : status === 'rejected'
                              ? 'رد شده'
                              : 'در انتظار بررسی'
                        return (
                          <article
                            key={ex.id}
                            className={`${styles.hwCard} ${done && status === 'approved' ? styles.lessonHwDone : ''}`}
                          >
                            <div
                              className={styles.hwCardAccent}
                              style={{
                                background: status === 'rejected'
                                  ? '#c84646'
                                  : status === 'approved'
                                    ? '#1a9a52'
                                    : subjectColor,
                              }}
                              aria-hidden
                            />
                            <div className={styles.hwCardInner}>
                              <div className={styles.lessonHwTop}>
                                <strong className={styles.hwCardTitle}>{ex.title}</strong>
                                <span className={`${styles.taskStatus} ${
                                  status === 'approved'
                                    ? styles.pillOk
                                    : styles.taskStatusWait
                                }`}>
                                  {statusLabel}
                                </span>
                              </div>
                              {ex.description ? (
                                <p className={styles.hwCardDesc}>{ex.description}</p>
                              ) : null}
                              {ex.my_submission?.teacher_note ? (
                                <p className={`${styles.teacherFeedback} ${
                                  status === 'rejected' ? styles.teacherFeedbackReject : ''
                                }`}>
                                  پیام معلم: {ex.my_submission.teacher_note}
                                </p>
                              ) : null}
                              {needsAction ? (
                                <div className={styles.hwCardActions}>
                                  <button
                                    type="button"
                                    className={styles.hwProofBtn}
                                    onClick={() => setHwProofEx({
                                      ...ex,
                                      subject_title: lesson.subject_title,
                                    })}
                                  >
                                    <ImagePlus size={15} />
                                    ارسال مدرک
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.hwDoneBtn}
                                    onClick={() => setHwConfirmEx({
                                      ...ex,
                                      subject_title: lesson.subject_title,
                                    })}
                                  >
                                    <CheckSquare size={15} />
                                    انجام دادم
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </section>
                )

                return (
                  <>
                    {hasVideo ? (
                      <div
                        className={`${styles.lessonStage} ${
                          exercises.length ? styles.lessonStageSplit : ''
                        }`}
                      >
                        <section className={styles.lessonStageMedia}>
                          {hasFileVideo ? (
                            <div className={styles.lessonMedia}>
                              <LessonVideoPlayer
                                src={lesson.video_file_url}
                                poster={lesson.cover_url || undefined}
                                title={lesson.title}
                                allowDownload
                              />
                            </div>
                          ) : (
                            <div className={styles.lessonMedia}>
                              <div className={styles.lessonAparat}>
                                <iframe
                                  src={aparatSrc}
                                  title={lesson.title}
                                  allowFullScreen
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                              </div>
                              <LessonShareBar title={lesson.title} />
                            </div>
                          )}
                        </section>
                        {exercises.length ? (
                          <aside className={styles.lessonStageSide}>
                            {renderExercises(true)}
                          </aside>
                        ) : null}
                      </div>
                    ) : null}

                    {showText ? (
                      <section className={`${styles.lessonBlock} ${styles.lessonTextBlock} ${styles.lessonTextFull}`}>
                        <h3 className={styles.lessonBlockTitle}>متن درس</h3>
                        <article
                          className={`${styles.contentHtml} ${styles.lessonContent}`}
                          dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                        />
                      </section>
                    ) : null}

                    {(lesson.attachments || []).length ? (
                      <section className={styles.lessonBlock}>
                        <h3 className={styles.lessonBlockTitle}>
                          فایل‌های پیوست
                          <em>{faNum(lesson.attachments.length)}</em>
                        </h3>
                        <div className={styles.lessonAttachGrid}>
                          {lesson.attachments.map((a) => (
                            <a
                              key={a.id}
                              href={a.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.lessonAttachCard}
                            >
                              <span className={styles.lessonAttachIcon}><Paperclip size={15} /></span>
                              <span className={styles.lessonAttachText}>{a.title || 'دانلود فایل'}</span>
                              <ExternalLink size={14} />
                            </a>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {!hasVideo && exercises.length ? renderExercises(false) : null}
                  </>
                )
              })()}

              {(quizzes || []).length ? (
                <section className={styles.lessonBlock}>
                  <h3 className={styles.lessonBlockTitle}>
                    آزمون‌های این درس
                    <em>{faNum(quizzes.length)}</em>
                  </h3>
                  <div className={styles.examGrid}>
                    {quizzes.map((q) => {
                      const pending = pendingQuizzes.some((p) => p.id === q.id)
                      return (
                        <article key={q.id} className={styles.examCard}>
                          <div
                            className={styles.examCardAccent}
                            style={{ background: subjectColor }}
                            aria-hidden
                          />
                          <div className={styles.examCardInner}>
                            <div className={styles.examCardTop}>
                              <span className={styles.examCardKind}>کوییز</span>
                              {!pending ? (
                                <span className={styles.pillOk}>داده‌شده</span>
                              ) : null}
                            </div>
                            <strong className={styles.examCardTitle}>{q.title}</strong>
                            <div className={styles.examCardStats}>
                              <span>
                                <ClipboardList size={12} />
                                {faNum(q.question_count || 0)} سوال
                              </span>
                            </div>
                            {pending ? (
                              <button
                                type="button"
                                className={styles.examStartBtn}
                                onClick={() => startQuiz(q.id)}
                              >
                                <Play size={14} />
                                شروع
                              </button>
                            ) : null}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          )
        })() : null}

        {hwProofEx ? (
          <div
            className={styles.hwModalBackdrop}
            role="presentation"
            onClick={() => !hwBusy && setHwProofEx(null)}
          >
            <div
              className={styles.hwStudentModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="hw-proof-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.hwStudentModalHead}>
                <div>
                  <h3 id="hw-proof-title">ارسال مدرک</h3>
                  <p>
                    {[hwProofEx.subject_title, hwProofEx.title].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.hwModalClose}
                  disabled={hwBusy}
                  onClick={() => setHwProofEx(null)}
                  aria-label="بستن"
                >
                  <X size={16} />
                </button>
              </div>
              <p className={styles.hwStudentModalHint}>
                تصویر تکلیف را انتخاب یا رها کنید تا برای معلم ارسال شود.
              </p>
              <DropZone
                accept="image/*"
                label="تصویر را اینجا رها کنید یا انتخاب کنید"
                onFile={(f) => {
                  if (!hwBusy) submitExercise(hwProofEx.id, f)
                }}
              />
              <button
                type="button"
                className={styles.btnGhost}
                disabled={hwBusy}
                onClick={() => setHwProofEx(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        ) : null}

        {hwConfirmEx ? (
          <div
            className={styles.hwModalBackdrop}
            role="presentation"
            onClick={() => !hwBusy && setHwConfirmEx(null)}
          >
            <div
              className={styles.hwStudentModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="hw-confirm-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.hwStudentModalHead}>
                <div>
                  <h3 id="hw-confirm-title">ثبت انجام تکلیف</h3>
                  <p>
                    {[hwConfirmEx.subject_title, hwConfirmEx.title].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.hwModalClose}
                  disabled={hwBusy}
                  onClick={() => setHwConfirmEx(null)}
                  aria-label="بستن"
                >
                  <X size={16} />
                </button>
              </div>
              <p className={styles.hwStudentModalHint}>
                آیا از ثبت انجام این تکلیف اطمینان دارید؟
              </p>
              {err ? <div className={styles.err}>{err}</div> : null}
              <div className={styles.hwStudentModalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={hwBusy}
                  onClick={() => setHwConfirmEx(null)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className={styles.btnAccent}
                  disabled={hwBusy}
                  onClick={() => submitExercise(hwConfirmEx.id)}
                >
                  {hwBusy ? 'در حال ثبت…' : 'بله، انجام دادم'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
