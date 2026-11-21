'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain, FolderOpen, HeartHandshake, Home, ArrowUpLeft, RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import CounselorProfilePanel from '@/components/School/CounselorProfilePanel'
import CounselingTestsPanel from '@/components/School/CounselingTestsPanel'
import CounselingFilesPanel from '@/components/School/CounselingFilesPanel'
import styles from './School.module.css'

export default function CounselorDashboard({
  embedded = false,
  previewCounselorId: previewCounselorIdProp,
  onPreviewCounselorIdChange,
} = {}) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [previewIdLocal, setPreviewIdLocal] = useState('')
  const previewControlled = previewCounselorIdProp !== undefined
  const previewId = previewControlled
    ? String(previewCounselorIdProp || '')
    : previewIdLocal
  const setPreviewId = (id) => {
    if (previewControlled) onPreviewCounselorIdChange?.(String(id || ''))
    else setPreviewIdLocal(String(id || ''))
  }

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

  const pageClass = embedded
    ? `${styles.page} ${styles.pageInProfile}`
    : styles.page

  if (loading || !isAuthenticated) return null
  if (!data) {
    return (
      <div className={pageClass} dir="rtl">
        <div className={styles.wrap}>
          {err ? <div className={styles.err}>{err}</div> : <p className={styles.empty}>در حال بارگذاری…</p>}
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
              <span className={styles.badge}>
                <HeartHandshake size={12} />
                School counselor
              </span>
              <h1 className={styles.brand}>
                school<span className={styles.brandAccent}>counsel</span>
              </h1>
              <p className={styles.tagline}>
                معرفی مشاور، آزمون‌های IQ/EQ و پرونده اختصاصی دانش‌آموزان و معلمان
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

        <div className={styles.stats}>
          <div className={styles.stat}><p className={styles.statLabel}>پرونده دانش‌آموز</p><p className={styles.statValue}>{data.stats?.student_files ?? 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>پرونده معلم</p><p className={styles.statValue}>{data.stats?.teacher_files ?? 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>آزمون‌ها</p><p className={styles.statValue}>{data.stats?.tests ?? 0}</p></div>
          <div className={`${styles.stat} ${styles.statOk}`}><p className={styles.statLabel}>پیگیری بالا</p><p className={styles.statValue}>{data.stats?.high_risk ?? 0}</p></div>
        </div>

        <div className={styles.tabs}>
          {[
            ['overview', 'نمای کلی'],
            ['profile', 'معرفی مشاور'],
            ['tests', 'آزمون IQ / EQ'],
            ['files', 'پرونده‌ها'],
          ].map(([k, l]) => (
            <button key={k} type="button" className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div className={styles.grid2}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}><FolderOpen size={16} /> پرونده‌های اخیر دانش‌آموز</h2>
              {(data.recent_files || []).map((f) => (
                <div key={`s-${f.id}`} className={styles.tip}>
                  <strong>{f.student_name}</strong>
                  <div>{f.risk_label || f.risk_level}</div>
                </div>
              ))}
              {!(data.recent_files || []).length ? <p className={styles.empty}>پرونده دانش‌آموزی نیست</p> : null}
              <h2 className={styles.panelTitle} style={{ marginTop: 16 }}><FolderOpen size={16} /> پرونده‌های اخیر معلم</h2>
              {(data.recent_teacher_files || []).map((f) => (
                <div key={`t-${f.id}`} className={styles.tip}>
                  <strong>{f.teacher_name}</strong>
                  <div>{f.risk_label || f.risk_level}{f.teacher_specialty ? ` · ${f.teacher_specialty}` : ''}</div>
                </div>
              ))}
              {!(data.recent_teacher_files || []).length ? <p className={styles.empty}>پرونده معلمی نیست</p> : null}
            </div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}><Brain size={16} /> نتایج اخیر</h2>
              {(data.recent_attempts || []).map((a) => (
                <div key={a.id} className={styles.tip}>
                  <strong>{a.student_name}</strong>
                  <div>{a.test_title} · {a.result_label} ({a.score}/{a.max_score})</div>
                </div>
              ))}
              {!(data.recent_attempts || []).length ? <p className={styles.empty}>نتیجه‌ای نیست</p> : null}
            </div>
          </div>
        ) : null}

        {tab === 'profile' ? (
          <div className={styles.panel}>
            <CounselorProfilePanel
              mode="self"
              previewCounselorId={previewId || null}
              onNotify={notify}
            />
          </div>
        ) : null}

        {tab === 'tests' ? (
          <div className={styles.panel}>
            <CounselingTestsPanel onNotify={notify} />
          </div>
        ) : null}

        {tab === 'files' ? (
          <div className={styles.panel}>
            <CounselingFilesPanel students={students} teachers={teachers} onNotify={notify} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
