'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import QuestionBankPanel from '@/components/School/QuestionBankPanel'
import ExamBuilderPanel from '@/components/School/ExamBuilderPanel'
import CurriculumWorkspace from '@/components/School/CurriculumWorkspace'
import HomeworkReviewPanel from '@/components/School/HomeworkReviewPanel'
import StudentsPanel from '@/components/School/StudentsPanel'
import ExamResultsPanel from '@/components/School/ExamResultsPanel'
import TeacherOverviewCharts from '@/components/School/TeacherOverviewCharts'
import TeacherSupportPanel from '@/components/School/TeacherSupportPanel'
import AttendancePanel from '@/components/School/AttendancePanel'
import MySchedulePanel from '@/components/School/MySchedulePanel'
import TeacherProfilePanel from '@/components/School/TeacherProfilePanel'
import TeacherReportCardPanel from '@/components/School/TeacherReportCardPanel'
import GuidedTour, { useGuidedTour } from '@/components/Admin/GuidedTour'
import {
  SCHOOL_TEACHER_TOUR,
  SCHOOL_TEACHER_TOUR_STORAGE_KEY,
} from '@/components/School/schoolTeacherTour'
import styles from './School.module.css'

/** پنل معلم — در پروفایل با embedded بدون هیرو صفحهٔ جدا */
export default function TeacherDashboard({
  embedded = false,
  previewTeacherId: previewTeacherIdProp,
  onPreviewTeacherIdChange,
} = {}) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [tree, setTree] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [lessonForm, setLessonForm] = useState(null)
  const [exercises, setExercises] = useState([])
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [saving, setSaving] = useState(false)

  const [studentMobile, setStudentMobile] = useState('')
  const [studentName, setStudentName] = useState('')
  const [previewTeacherIdLocal, setPreviewTeacherIdLocal] = useState('')
  const previewControlled = previewTeacherIdProp !== undefined
  const previewTeacherId = previewControlled
    ? String(previewTeacherIdProp || '')
    : previewTeacherIdLocal
  const setPreviewTeacherId = (id) => {
    if (previewControlled) onPreviewTeacherIdChange?.(String(id || ''))
    else setPreviewTeacherIdLocal(String(id || ''))
  }
  const tour = useGuidedTour(SCHOOL_TEACHER_TOUR)
  const tourAutoRef = useRef(false)

  const notifyPanel = useCallback((m, isErr) => {
    if (isErr) setErr(m)
    else {
      setMsg(m)
      setErr(null)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=' + encodeURIComponent('/profile?tab=teacher'))
    }
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setErr(null)
    const params = previewTeacherId ? { teacher: previewTeacherId } : {}
    const [dash, tr] = await Promise.all([
      schoolService.teacherDashboard(params),
      schoolService.tree(params),
    ])
    if (!dash.success) {
      setErr(dash.error || 'دسترسی معلم ندارید')
      return
    }
    setData(dash.data)
    if (!previewTeacherId && dash.data?.profile?.id) {
      setPreviewTeacherId(String(dash.data.profile.id))
    }
    if (tr.success) setTree(tr.data || [])
  }, [previewTeacherId])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  useEffect(() => {
    if (!tour.open) return
    const step = tour.steps[tour.stepIndex]
    if (step?.tab && step.tab !== tab) setTab(step.tab)
    const tabKey = step?.tab
    if (!tabKey || typeof document === 'undefined') return
    const btn = document.querySelector(`[data-tour="st-tab-${tabKey}"]`)
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [tour.open, tour.stepIndex, tour.steps, tab])

  const startTourFn = tour.start
  useEffect(() => {
    if (loading || !isAuthenticated || !data) return undefined
    if (tourAutoRef.current) return undefined
    if (typeof window === 'undefined') return undefined
    try {
      if (window.localStorage.getItem(SCHOOL_TEACHER_TOUR_STORAGE_KEY)) return undefined
    } catch {
      return undefined
    }
    const t = window.setTimeout(() => {
      if (tourAutoRef.current) return
      tourAutoRef.current = true
      setTab('info')
      startTourFn(SCHOOL_TEACHER_TOUR)
      try {
        window.localStorage.setItem(SCHOOL_TEACHER_TOUR_STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
    }, 650)
    return () => window.clearTimeout(t)
  }, [loading, isAuthenticated, data, startTourFn])

  const startTeacherTour = () => {
    setTab('info')
    window.setTimeout(() => startTourFn(SCHOOL_TEACHER_TOUR), 60)
  }

  const openLesson = async (lessonId) => {
    const res = await schoolService.getLesson(lessonId)
    if (!res.success) {
      setErr(res.error)
      return
    }
    setSelectedLesson(res.data)
    setLessonForm({
      title: res.data.title || '',
      importance: res.data.importance || 'medium',
      content_html: res.data.content_html || '',
      video_url: res.data.video_url || '',
      estimated_minutes: res.data.estimated_minutes || 30,
      is_active: res.data.is_active !== false,
      coverFile: null,
      videoFile: null,
      coverPreview: res.data.cover_url,
      videoPreview: res.data.video_file_url,
    })
    const ex = await schoolService.listExercises({ lesson: lessonId })
    if (ex.success) setExercises(ex.data || [])
    setTab('curriculum')
  }

  const clearLesson = () => {
    setSelectedLesson(null)
    setLessonForm(null)
    setExercises([])
  }

  const saveLesson = async () => {
    if (!selectedLesson || !lessonForm) return
    const COVER_MAX = 5 * 1024 * 1024
    const VIDEO_MAX = 80 * 1024 * 1024
    const url = (lessonForm.video_url || '').trim()
    if (url) {
      try {
        const host = new URL(url).hostname.toLowerCase()
        if (host !== 'aparat.com' && !host.endsWith('.aparat.com')) {
          setErr('لینک ویدیو باید از سایت آپارات باشد')
          return
        }
      } catch {
        setErr('لینک ویدیو نامعتبر است — از لینک آپارات استفاده کنید')
        return
      }
    }
    if (lessonForm.coverFile && lessonForm.coverFile.size > COVER_MAX) {
      setErr('حجم تصویر شاخص نباید بیشتر از ۵ مگابایت باشد')
      return
    }
    if (lessonForm.videoFile && lessonForm.videoFile.size > VIDEO_MAX) {
      setErr('حجم ویدیو نباید بیشتر از ۸۰ مگابایت باشد')
      return
    }
    setSaving(true)
    setMsg(null)
    setErr(null)
    const fd = new FormData()
    fd.append('title', lessonForm.title)
    fd.append('importance', lessonForm.importance)
    fd.append('content_html', lessonForm.content_html || '')
    fd.append('video_url', lessonForm.video_url || '')
    fd.append('estimated_minutes', String(lessonForm.estimated_minutes || 30))
    fd.append('is_active', lessonForm.is_active ? 'true' : 'false')
    if (lessonForm.coverFile) fd.append('cover_image', lessonForm.coverFile)
    if (lessonForm.videoFile) fd.append('video', lessonForm.videoFile)
    const res = await schoolService.updateLesson(selectedLesson.id, fd)
    setSaving(false)
    if (res.success) {
      setMsg('درس ذخیره شد')
      setSelectedLesson(res.data)
      load()
    } else setErr(res.error)
  }

  const activeTeacherId = previewTeacherId || data?.profile?.id

  const addAttachment = async (file) => {
    if (!selectedLesson || !file) return
    const fd = new FormData()
    fd.append('lesson', selectedLesson.id)
    fd.append('file', file)
    fd.append('title', file.name)
    const res = await schoolService.addAttachment(fd)
    if (res.success) {
      setMsg('فایل پیوست شد')
      openLesson(selectedLesson.id)
    } else setErr(res.error)
  }

  const addExercise = async () => {
    const title = window.prompt('عنوان تمرین')
    if (!title) return
    const description = window.prompt('شرح تمرین') || ''
    const res = await schoolService.createExercise({
      lesson: selectedLesson.id,
      title,
      description,
      order: (exercises.length + 1) * 10,
    })
    if (res.success) {
      setMsg('تمرین اضافه شد')
      openLesson(selectedLesson.id)
    } else setErr(res.error)
  }

  const addStudent = async () => {
    if (!studentMobile.trim()) return
    const digits = String(studentMobile).replace(/\D/g, '')
    const dup = (data?.students || []).find((s) => {
      const m = String(s.mobile || '').replace(/\D/g, '')
      return m && digits && m === digits
    })
    if (dup) {
      setErr('این شماره از قبل در این کلاس ثبت شده است')
      return
    }
    const payload = {
      mobile: studentMobile.trim(),
      display_name: studentName.trim(),
    }
    if (activeTeacherId) payload.teacher_ids = [Number(activeTeacherId)]
    setSaving(true)
    const res = await schoolService.createStudent(payload)
    setSaving(false)
    if (res.success) {
      setStudentMobile('')
      setStudentName('')
      setMsg(res.message || 'دانش‌آموز اضافه شد')
      setErr(null)
      load()
    } else setErr(res.error)
  }

  const pageClass = embedded
    ? `${styles.page} ${styles.pageInProfile}`
    : styles.page

  if (loading || !isAuthenticated) return null
  if (!data) {
    return (
      <div className={pageClass} dir="rtl">
        <div className={styles.wrap}>
          {err ? <div className={styles.err}>{err}</div> : <div className={styles.empty}>در حال بارگذاری…</div>}
        </div>
      </div>
    )
  }

  return (
    <div className={pageClass} dir="rtl">
      <div className={styles.wrap}>
        {!embedded ? (
          <header className={styles.hero}>
            <div className={styles.heroGlow} aria-hidden />
            <div className={styles.heroBrand}>
              <span className={styles.badge}>School teacher</span>
              <h1 className={styles.brand}>
                school<span className={styles.brandAccent}>teacher</span>
              </h1>
              <p className={styles.tagline}>
                مدیریت دروس، تمرین‌ها، آزمون و بررسی تکالیف
                {data.is_admin_preview ? ' · پیش‌نمایش مدیر' : ''}
              </p>
              <nav className={styles.heroNav} aria-label="میانبرها">
                <button type="button" onClick={load}>
                  <RefreshCw size={12} /> بروزرسانی
                </button>
              </nav>
            </div>
          </header>
        ) : null}

        {!embedded &&
        data.is_admin_preview &&
        (data.preview_teachers || []).length > 0 ? (
          <div className={styles.previewBar}>
            <div className={styles.field}>
              <label>پیش‌نمایش به‌عنوان معلم</label>
              <select
                value={previewTeacherId || data.profile?.id || ''}
                onChange={(e) => setPreviewTeacherId(e.target.value)}
              >
                {(data.preview_teachers || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.display_name} — {t.specialty || 'بدون تخصص'}
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
            data-tour="st-tour-btn"
            onClick={startTeacherTour}
          >
            <Sparkles size={14} />
            راهنمای تور
          </button>
          <p className={styles.smTourHint}>آشنایی مرحله‌به‌مرحله با پنل معلم</p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="بخش‌های معلم" data-tour="st-tabs">
          {[
            ['info', 'اطلاعات پایه'],
            ['overview', 'نمای کلی'],
            ['support', 'نیاز به حمایت'],
            ['profile', 'پروفایل معلم'],
            ['schedule', 'برنامه هفتگی'],
            ['attendance', 'حضور و غیاب'],
            ['curriculum', 'برنامه درسی'],
            ['bank', 'بانک سوال'],
            ['exams', 'ایجاد آزمون'],
            ['reviews', 'بررسی تکالیف'],
            ['students', 'دانش‌آموزان'],
            ['reportcard', 'کارنامه ماهانه'],
            ['results', 'نتایج آزمون'],
          ].map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`}
              data-tour={`st-tab-${k}`}
              onClick={() => setTab(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === 'info' ? (
          <div className={styles.infoPanel} data-tour="st-info">
            <section className={styles.infoIdentity} aria-label="پروفایل معلم">
              <div className={styles.infoAvatar} aria-hidden>
                <UserRound size={22} />
              </div>
              <div className={styles.infoIdentityBody}>
                <h2 className={styles.infoName}>
                  {data.profile?.display_name || 'معلم'}
                </h2>
                <p className={styles.infoMeta}>
                  {data.profile?.specialty || 'بدون تخصص'}
                  {data.is_admin_preview ? ' · پیش‌نمایش مدیر' : ''}
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
              <div className={styles.stat}>
                <p className={styles.statLabel}>دانش‌آموزان</p>
                <p className={styles.statValue}>{data.stats?.students ?? 0}</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>دروس</p>
                <p className={styles.statValue}>{data.stats?.lessons ?? 0}</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>بانک سوال</p>
                <p className={styles.statValue}>{data.stats?.bank_questions ?? 0}</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>آزمون‌ها</p>
                <p className={styles.statValue}>{data.stats?.exams ?? 0}</p>
              </div>
              <div className={`${styles.stat} ${styles.statOk}`}>
                <p className={styles.statLabel}>میانگین</p>
                <p className={styles.statValue}>{data.stats?.avg_percent ?? 0}٪</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>حضور ۳۰روز</p>
                <p className={styles.statValue}>{data.stats?.attendance_rate_30d ?? 0}٪</p>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'profile' ? (
          <div className={styles.panel} data-tour="st-profile">
            <TeacherProfilePanel
              mode="self"
              previewTeacherId={activeTeacherId || null}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'schedule' ? (
          <div className={styles.panel} data-tour="st-schedule">
            <MySchedulePanel
              role="teacher"
              params={activeTeacherId ? { teacher: activeTeacherId } : {}}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'bank' ? (
          <div data-tour="st-bank">
            <QuestionBankPanel
              tree={tree}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'exams' ? (
          <div data-tour="st-exams">
            <ExamBuilderPanel
              tree={tree}
              students={data.students || []}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'overview' ? (
          <div className={styles.teacherOverviewPage} data-tour="st-overview">
            <TeacherOverviewCharts
              charts={data.charts || {}}
              overview={data.overview || {}}
              stats={data.stats || {}}
              pendingSubmissions={data.pending_submissions || []}
              onNavigate={setTab}
              onDone={load}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'support' ? (
          <div data-tour="st-support">
            <TeacherSupportPanel
              cases={data.support_cases || data.overview?.support_cases || []}
              onNavigate={setTab}
            />
          </div>
        ) : null}

        {tab === 'attendance' ? (
          <div className={styles.panel} data-tour="st-attendance">
            <AttendancePanel
              teacherId={activeTeacherId || null}
              subjects={data.subjects || []}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'curriculum' ? (
          <div data-tour="st-curriculum">
            <CurriculumWorkspace
              tree={tree}
              teacherId={activeTeacherId}
              selectedLesson={selectedLesson}
              lessonForm={lessonForm}
              exercises={exercises}
              saving={saving}
              onOpenLesson={openLesson}
              onClearLesson={clearLesson}
              onLessonFormChange={(patch) => setLessonForm((prev) => ({ ...prev, ...patch }))}
              onSaveLesson={saveLesson}
              onReload={load}
              onNotify={notifyPanel}
              onAddAttachment={addAttachment}
              onAddExercise={addExercise}
              onDeleteExercise={async (id) => {
                await schoolService.deleteExercise(id)
                if (selectedLesson) openLesson(selectedLesson.id)
              }}
              onDeleteAttachment={async (id) => {
                await schoolService.deleteAttachment(id)
                if (selectedLesson) openLesson(selectedLesson.id)
              }}
            />
          </div>
        ) : null}

        {tab === 'reviews' ? (
          <div className={styles.panel} data-tour="st-reviews">
            <HomeworkReviewPanel
              submissions={data.pending_submissions || []}
              onDone={load}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'students' ? (
          <div data-tour="st-students">
            <StudentsPanel
              students={data.students || []}
              studentMobile={studentMobile}
              studentName={studentName}
              onMobileChange={setStudentMobile}
              onNameChange={setStudentName}
              onAdd={addStudent}
              onReload={load}
              busy={saving}
              onNotify={notifyPanel}
              teacherId={activeTeacherId || null}
            />
          </div>
        ) : null}

        {tab === 'reportcard' ? (
          <div className={styles.panel} data-tour="st-reportcard">
            <TeacherReportCardPanel
              teacherId={activeTeacherId || null}
              subjects={data.subjects || []}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'results' ? (
          <div data-tour="st-results">
            <ExamResultsPanel
              teacherId={previewTeacherId || data?.profile?.id || null}
              onNotify={notifyPanel}
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
