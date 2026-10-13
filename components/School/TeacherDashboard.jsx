'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  RefreshCw,
  GraduationCap, Home, ArrowUpLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import QuestionBankPanel from '@/components/School/QuestionBankPanel'
import ExamBuilderPanel from '@/components/School/ExamBuilderPanel'
import CurriculumWorkspace from '@/components/School/CurriculumWorkspace'
import HomeworkReviewPanel from '@/components/School/HomeworkReviewPanel'
import StudentsPanel from '@/components/School/StudentsPanel'
import ExamResultsPanel from '@/components/School/ExamResultsPanel'
import TeacherOverviewCharts from '@/components/School/TeacherOverviewCharts'
import styles from './School.module.css'

export default function TeacherDashboard() {
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
  const [previewTeacherId, setPreviewTeacherId] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login?next=/school/teacher')
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
    const payload = {
      mobile: studentMobile.trim(),
      display_name: studentName.trim(),
    }
    if (activeTeacherId) payload.teacher_ids = [Number(activeTeacherId)]
    const res = await schoolService.createStudent(payload)
    if (res.success) {
      setStudentMobile('')
      setStudentName('')
      setMsg('دانش‌آموز اضافه شد')
      load()
    } else setErr(res.error)
  }

  if (loading || !isAuthenticated) return null
  if (!data) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          {err ? <div className={styles.err}>{err}</div> : <div className={styles.empty}>در حال بارگذاری…</div>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroBrand}>
            <span className={styles.badge}>
              <GraduationCap size={12} />
              School teacher
            </span>
            <h1 className={styles.brand}>
              school<span className={styles.brandAccent}>teacher</span>
            </h1>
            <p className={styles.tagline}>
              مدیریت دروس، تمرین‌ها، آزمون و بررسی تکالیف
              {data.is_admin_preview ? ' · پیش‌نمایش مدیر' : ''}
            </p>
            <nav className={styles.heroNav} aria-label="میانبرها">
              <Link href="/school"><Home size={12} /> هاب مدرسه</Link>
              <Link href="/"><ArrowUpLeft size={12} /> سایت</Link>
              <button type="button" onClick={load}><RefreshCw size={12} /> بروزرسانی</button>
            </nav>
          </div>
          <div className={styles.heroIdentity}>
            <div className={styles.avatar}>
              <GraduationCap size={18} />
            </div>
            <div>
              <p className={styles.ownerName}>{data.profile?.display_name || 'معلم'}</p>
              <p className={styles.ownerRole}>{data.profile?.specialty || 'داشبورد معلم'}</p>
            </div>
          </div>
        </header>

        {data.is_admin_preview && (data.preview_teachers || []).length > 0 ? (
          <div className={styles.previewBar}>
            <div className={styles.field}>
              <label>پیش‌نمایش به‌عنوان معلم</label>
              <select
                value={previewTeacherId || data.profile?.id || ''}
                onChange={(e) => setPreviewTeacherId(e.target.value)}
              >
                {(data.preview_teachers || []).map((t) => (
                  <option key={t.id} value={t.id}>{t.display_name} — {t.specialty || 'بدون تخصص'}</option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.stats}>
          <div className={styles.stat}><p className={styles.statLabel}>دانش‌آموزان</p><p className={styles.statValue}>{data.stats?.students ?? 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>دروس</p><p className={styles.statValue}>{data.stats?.lessons ?? 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>بانک سوال</p><p className={styles.statValue}>{data.stats?.bank_questions ?? 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>آزمون‌ها</p><p className={styles.statValue}>{data.stats?.exams ?? 0}</p></div>
          <div className={`${styles.stat} ${styles.statOk}`}><p className={styles.statLabel}>میانگین</p><p className={styles.statValue}>{data.stats?.avg_percent ?? 0}٪</p></div>
        </div>

        <div className={styles.tabs}>
          {[
            ['overview', 'نمای کلی'],
            ['curriculum', 'برنامه درسی'],
            ['bank', 'بانک سوال'],
            ['exams', 'ایجاد آزمون'],
            ['reviews', 'بررسی تکالیف'],
            ['students', 'دانش‌آموزان'],
            ['results', 'نتایج آزمون'],
          ].map(([k, l]) => (
            <button key={k} type="button" className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'bank' ? (
          <QuestionBankPanel
            tree={tree}
            onNotify={(m, isErr) => {
              if (isErr) setErr(m)
              else { setMsg(m); setErr(null) }
            }}
          />
        ) : null}

        {tab === 'exams' ? (
          <ExamBuilderPanel
            tree={tree}
            students={data.students || []}
            onNotify={(m, isErr) => {
              if (isErr) setErr(m)
              else { setMsg(m); setErr(null) }
            }}
          />
        ) : null}

        {tab === 'overview' ? (
          <div className={styles.teacherOverviewPage}>
            <TeacherOverviewCharts charts={data.charts || {}} />
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>تکالیف در انتظار بررسی</h2>
              </div>
              <HomeworkReviewPanel
                compact
                submissions={data.pending_submissions || []}
                onDone={load}
                onNotify={(m, isErr) => {
                  if (isErr) setErr(m)
                  else { setMsg(m); setErr(null) }
                }}
              />
            </div>
          </div>
        ) : null}

        {tab === 'curriculum' ? (
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
            onNotify={(m, isErr) => {
              if (isErr) setErr(m)
              else { setMsg(m); setErr(null) }
            }}
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
        ) : null}

        {tab === 'reviews' ? (
          <div className={styles.panel}>
            <HomeworkReviewPanel
              submissions={data.pending_submissions || []}
              onDone={load}
              onNotify={(m, isErr) => {
                if (isErr) setErr(m)
                else { setMsg(m); setErr(null) }
              }}
            />
          </div>
        ) : null}

        {tab === 'students' ? (
          <StudentsPanel
            students={data.students || []}
            studentMobile={studentMobile}
            studentName={studentName}
            onMobileChange={setStudentMobile}
            onNameChange={setStudentName}
            onAdd={addStudent}
            onReload={load}
          />
        ) : null}

        {tab === 'results' ? (
          <ExamResultsPanel
            teacherId={previewTeacherId || data?.profile?.id || null}
            onNotify={(m, isErr) => {
              if (isErr) setErr(m)
              else { setMsg(m); setErr(null) }
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
