'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ClipboardList, HeartHandshake, Home, ArrowUpLeft,
  RefreshCw, UserRound, AlertTriangle, Users, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import CounselorProfilePanel from '@/components/School/CounselorProfilePanel'
import CounselingTestsPanel from '@/components/School/CounselingTestsPanel'
import CounselingFilesPanel from '@/components/School/CounselingFilesPanel'
import CounselorOverviewPanel from '@/components/School/CounselorOverviewPanel'
import CounselorFollowUpPanel from '@/components/School/CounselorFollowUpPanel'
import CounselingAttemptsPanel from '@/components/School/CounselingAttemptsPanel'
import CounselorPeoplePanel from '@/components/School/CounselorPeoplePanel'
import GuidedTour, { useGuidedTour } from '@/components/Admin/GuidedTour'
import {
  SCHOOL_COUNSELOR_TOUR,
  SCHOOL_COUNSELOR_TOUR_STORAGE_KEY,
} from '@/components/School/schoolCounselorTour'
import styles from './School.module.css'

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

const TABS = [
  ['info', 'اطلاعات پایه', null],
  ['overview', 'نمای کلی', null],
  ['followup', 'پیگیری', 'high_risk'],
  ['people', 'افراد', null],
  ['tests', 'آزمون‌ها', null],
  ['files', 'پرونده‌ها', null],
  ['attempts', 'نتایج', null],
  ['profile', 'معرفی مشاور', null],
]

export default function CounselorDashboard({
  embedded = false,
  previewCounselorId: previewCounselorIdProp,
  onPreviewCounselorIdChange,
  initialTab = 'overview',
} = {}) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [tab, setTab] = useState(initialTab || 'overview')
  const [data, setData] = useState(null)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [fileFocus, setFileFocus] = useState(null)
  const [previewIdLocal, setPreviewIdLocal] = useState('')
  const previewControlled = previewCounselorIdProp !== undefined
  const previewId = previewControlled
    ? String(previewCounselorIdProp || '')
    : previewIdLocal
  const setPreviewId = (id) => {
    if (previewControlled) onPreviewCounselorIdChange?.(String(id || ''))
    else setPreviewIdLocal(String(id || ''))
  }
  const tour = useGuidedTour(SCHOOL_COUNSELOR_TOUR)
  const tourAutoRef = useRef(false)

  const notify = useCallback((m, isErr) => {
    if (isErr) setErr(m)
    else {
      setMsg(m)
      setErr(null)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(
        '/login?next=' + encodeURIComponent('/profile?tab=counselor'),
      )
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tour.open) return
    const step = tour.steps[tour.stepIndex]
    if (step?.tab && step.tab !== tab) setTab(step.tab)
    const tabKey = step?.tab
    if (!tabKey || typeof document === 'undefined') return
    const btn = document.querySelector(`[data-tour="sc-tab-${tabKey}"]`)
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [tour.open, tour.stepIndex, tour.steps, tab])

  const startTourFn = tour.start
  useEffect(() => {
    if (loading || !isAuthenticated || !data) return undefined
    if (tourAutoRef.current) return undefined
    if (typeof window === 'undefined') return undefined
    try {
      if (window.localStorage.getItem(SCHOOL_COUNSELOR_TOUR_STORAGE_KEY)) return undefined
    } catch {
      return undefined
    }
    const t = window.setTimeout(() => {
      if (tourAutoRef.current) return
      tourAutoRef.current = true
      setTab('info')
      startTourFn(SCHOOL_COUNSELOR_TOUR)
      try {
        window.localStorage.setItem(SCHOOL_COUNSELOR_TOUR_STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
    }, 650)
    return () => window.clearTimeout(t)
  }, [loading, isAuthenticated, data, startTourFn])

  const startCounselorTour = () => {
    setTab('info')
    window.setTimeout(() => startTourFn(SCHOOL_COUNSELOR_TOUR), 60)
  }

  const load = useCallback(async () => {
    setErr(null)
    const params = previewId ? { counselor: previewId } : {}
    const [dash, st, te] = await Promise.all([
      schoolService.counselorDashboard(params),
      schoolService.listStudents(),
      schoolService.listTeachers(),
    ])
    if (!dash.success) {
      setErr(dash.error || 'دسترسی مشاور ندارید')
      return
    }
    setData(dash.data)
    if (!previewId && dash.data?.profile?.id) {
      setPreviewId(String(dash.data.profile.id))
    }
    if (st.success) setStudents(st.data || [])
    if (te.success) setTeachers(te.data || [])
  }, [previewId])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const openFile = useCallback((scope, fileId) => {
    if (!fileId) return
    setFileFocus({
      scope: scope === 'teachers' ? 'teachers' : 'students',
      fileId,
      nonce: Date.now(),
    })
    setTab('files')
  }, [])

  const openStudentAttemptFile = useCallback(async (attempt) => {
    if (attempt?.counseling_file_id) {
      openFile('students', attempt.counseling_file_id)
      return
    }
    if (!attempt?.student_id) {
      notify('شناسه پرونده این نتیجه مشخص نیست', true)
      return
    }
    const res = await schoolService.getCounselingFileByStudent(attempt.student_id)
    if (!res.success) {
      notify(res.error || 'پرونده دانش‌آموز یافت نشد', true)
      return
    }
    openFile('students', res.data?.id)
  }, [notify, openFile])

  const pageClass = embedded
    ? `${styles.page} ${styles.pageInProfile}`
    : styles.page

  if (loading || !isAuthenticated) return null
  if (!data) {
    return (
      <div className={pageClass} dir="rtl" lang="fa">
        <div className={styles.wrap}>
          {err ? <div className={styles.err}>{err}</div> : <p className={styles.empty}>در حال بارگذاری…</p>}
        </div>
      </div>
    )
  }

  const highRisk = Number(data.stats?.high_risk) || 0

  return (
    <div className={pageClass} dir="rtl" lang="fa">
      <div className={styles.wrap}>
        {!embedded ? (
          <header className={styles.hero}>
            <div className={styles.heroGlow} aria-hidden />
            <div className={styles.heroBrand}>
              <span className={styles.badge}>
                <HeartHandshake size={12} />
                پنل مشاور
              </span>
              <h1 className={styles.brand}>
                school<span className={styles.brandAccent}>counsel</span>
              </h1>
              <p className={styles.tagline}>
                میز کار مشاور: پیگیری ریسک، آزمون‌های هوش/شخصیت و پرونده دانش‌آموز و معلم
              </p>
              <nav className={styles.heroNav}>
                <Link href="/profile"><Home size={12} /> پروفایل مدرسه</Link>
                <Link href="/"><ArrowUpLeft size={12} /> سایت</Link>
                <button type="button" onClick={load}><RefreshCw size={12} /> بروزرسانی</button>
              </nav>
            </div>
            <div className={styles.heroIdentity}>
              <div className={styles.avatar}><HeartHandshake size={18} /></div>
              <div>
                <p className={styles.ownerName}>{data.profile?.display_name || 'مشاور'}</p>
                <p className={styles.ownerRole}>{data.profile?.specialty || 'مشاوره مدرسه'}</p>
              </div>
            </div>
          </header>
        ) : null}

        {!embedded && (data.preview_counselors || []).length > 0 ? (
          <div className={styles.previewBar}>
            <div className={styles.field}>
              <label>پیش‌نمایش به‌عنوان مشاور</label>
              <select
                value={previewId || data.profile?.id || ''}
                onChange={(e) => setPreviewId(e.target.value)}
              >
                {(data.preview_counselors || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name} — {c.specialty || 'بدون تخصص'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.smTourBar}>
          <button
            type="button"
            className={styles.smTourBtn}
            data-tour="sc-tour-btn"
            onClick={startCounselorTour}
          >
            <Sparkles size={14} />
            راهنمای تور
          </button>
          <p className={styles.smTourHint}>آشنایی مرحله‌به‌مرحله با پنل مشاور</p>
        </div>

        <div className={styles.tabs} data-tour="sc-tabs">
          {TABS.map(([k, l, badgeKey]) => {
            const badge = badgeKey === 'high_risk' && highRisk > 0 ? highRisk : null
            return (
              <button
                key={k}
                type="button"
                className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`}
                data-tour={`sc-tab-${k}`}
                onClick={() => setTab(k)}
              >
                {l}
                {badge ? <span className={styles.tabBadge}>{faNum(badge)}</span> : null}
              </button>
            )
          })}
        </div>

        {tab === 'info' ? (
          <div className={styles.infoPanel} data-tour="sc-info">
            <section className={styles.infoIdentity} aria-label="پروفایل مشاور">
              <div className={styles.infoAvatar} aria-hidden>
                <UserRound size={22} />
              </div>
              <div className={styles.infoIdentityBody}>
                <h2 className={styles.infoName}>
                  {data.profile?.display_name || 'مشاور'}
                </h2>
                <p className={styles.infoMeta}>
                  {data.profile?.specialty || 'مشاوره مدرسه'}
                </p>
              </div>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={load}
                aria-label="بروزرسانی"
              >
                <RefreshCw size={14} />
                بروزرسانی
              </button>
            </section>

            <div className={styles.stats}>
              <button type="button" className={styles.stat} onClick={() => setTab('files')}>
                <p className={styles.statLabel}>پرونده دانش‌آموز</p>
                <p className={styles.statValue}>{faNum(data.stats?.student_files ?? 0)}</p>
              </button>
              <button type="button" className={styles.stat} onClick={() => setTab('files')}>
                <p className={styles.statLabel}>پرونده معلم</p>
                <p className={styles.statValue}>{faNum(data.stats?.teacher_files ?? 0)}</p>
              </button>
              <button type="button" className={styles.stat} onClick={() => setTab('tests')}>
                <p className={styles.statLabel}>آزمون‌ها</p>
                <p className={styles.statValue}>{faNum(data.stats?.tests ?? 0)}</p>
              </button>
              <button
                type="button"
                className={`${styles.stat} ${styles.statOk}`}
                onClick={() => setTab('followup')}
              >
                <p className={styles.statLabel}>پیگیری بالا</p>
                <p className={styles.statValue}>{faNum(data.stats?.high_risk ?? 0)}</p>
              </button>
            </div>

            <div className={styles.copInfoActions}>
              <button type="button" className={styles.btnAccent} onClick={() => setTab('overview')}>
                <HeartHandshake size={14} /> میز کار مشاور
              </button>
              <button type="button" className={styles.btnGhost} onClick={() => setTab('followup')}>
                <AlertTriangle size={14} /> صف پیگیری
              </button>
              <button type="button" className={styles.btnGhost} onClick={() => setTab('people')}>
                <Users size={14} /> فهرست افراد
              </button>
              <button type="button" className={styles.btnGhost} onClick={() => setTab('attempts')}>
                <ClipboardList size={14} /> نتایج
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'overview' ? (
          <div data-tour="sc-overview">
            <CounselorOverviewPanel
              data={data}
              onNavigate={setTab}
              onOpenFile={openFile}
            />
          </div>
        ) : null}

        {tab === 'followup' ? (
          <div className={styles.panel} data-tour="sc-followup">
            <CounselorFollowUpPanel
              onNotify={notify}
              onOpenFile={openFile}
            />
          </div>
        ) : null}

        {tab === 'people' ? (
          <div className={styles.panel} data-tour="sc-people">
            <CounselorPeoplePanel
              students={students}
              teachers={teachers}
              onNotify={notify}
              onOpenFile={openFile}
            />
          </div>
        ) : null}

        {tab === 'profile' ? (
          <div className={styles.panel} data-tour="sc-profile">
            <CounselorProfilePanel
              mode="self"
              previewCounselorId={previewId || null}
              onNotify={notify}
            />
          </div>
        ) : null}

        {tab === 'tests' ? (
          <div className={styles.panel} data-tour="sc-tests">
            <CounselingTestsPanel onNotify={notify} />
          </div>
        ) : null}

        {tab === 'files' ? (
          <div className={styles.panel} data-tour="sc-files">
            <CounselingFilesPanel
              students={students}
              teachers={teachers}
              onNotify={notify}
              focusRequest={fileFocus}
              onFocusHandled={() => setFileFocus(null)}
            />
          </div>
        ) : null}

        {tab === 'attempts' ? (
          <div className={styles.panel} data-tour="sc-attempts">
            <CounselingAttemptsPanel
              onNotify={notify}
              onOpenStudentFile={openStudentAttemptFile}
            />
          </div>
        ) : null}
      </div>

      <GuidedTour
        open={tour.open}
        steps={tour.steps}
        stepIndex={tour.stepIndex}
        onStepChange={tour.setStepIndex}
        onClose={tour.close}
        theme="school"
      />
    </div>
  )
}
