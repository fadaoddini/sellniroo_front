'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Plus, RefreshCw, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const RANK_FA = {
  bronze: 'برنزی', silver: 'نقره‌ای', gold: 'طلایی',
  platinum: 'پلاتینیوم', diamond: 'الماس',
}

export default function SchoolManage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [settings, setSettings] = useState({})
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [teacherForm, setTeacherForm] = useState({ mobile: '', display_name: '', specialty: '' })
  const [studentForm, setStudentForm] = useState({ mobile: '', display_name: '', grade: '', teacher_ids: [] })

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login?next=/school-manage')
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setErr(null)
    const [ov, st] = await Promise.all([
      schoolService.overview(),
      schoolService.settings(),
    ])
    if (!ov.success) {
      setErr(ov.error || 'دسترسی ندارید')
      return
    }
    setData(ov.data)
    if (st.success) setSettings(st.data || {})
  }, [])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
  }, [isAuthenticated, canManage, load])

  const saveSettings = async () => {
    const res = await schoolService.updateSettings(settings)
    if (res.success) {
      setSettings(res.data)
      setMsg('تنظیمات ذخیره شد')
    } else setErr(res.error)
  }

  const addTeacher = async () => {
    const res = await schoolService.createTeacher(teacherForm)
    if (res.success) {
      setTeacherForm({ mobile: '', display_name: '', specialty: '' })
      setMsg('معلم اضافه شد')
      load()
    } else setErr(res.error)
  }

  const addStudent = async () => {
    const res = await schoolService.createStudent(studentForm)
    if (res.success) {
      setStudentForm({ mobile: '', display_name: '', grade: '', teacher_ids: [] })
      setMsg('دانش‌آموز اضافه شد')
      load()
    } else setErr(res.error)
  }

  if (loading) return null
  if (!isAuthenticated) return null
  if (!canManage) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.panel}><p className={styles.empty}>فقط مدیر مدرسه / staff</p></div>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroBrand}>
            <span className={styles.badge}>
              <LayoutDashboard size={12} />
              School manage
            </span>
            <h1 className={styles.brand}>
              school<span className={styles.brandAccent}>manage</span>
            </h1>
            <p className={styles.tagline}>نمای کلی معلمان، دانش‌آموزان، معدل و فعالیت‌ها</p>
            <nav className={styles.heroNav}>
              <Link href="/dashboard"><LayoutDashboard size={12} /> داشبورد</Link>
              <Link href="/school"><GraduationCap size={12} /> هاب</Link>
              <button type="button" onClick={load}><RefreshCw size={12} /> بروزرسانی</button>
            </nav>
          </div>
          <div className={styles.heroIdentity}>
            <div className={styles.avatar}><LayoutDashboard size={18} /></div>
            <div>
              <p className={styles.ownerName}>مدیریت مدرسه</p>
              <p className={styles.ownerRole}>رصد و تنظیمات</p>
            </div>
          </div>
        </header>

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.stats}>
          <div className={styles.stat}><p className={styles.statLabel}>معلمان</p><p className={styles.statValue}>{stats.teachers || 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>دانش‌آموزان</p><p className={styles.statValue}>{stats.students || 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>دروس</p><p className={styles.statValue}>{stats.lessons || 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>معدل کلی</p><p className={styles.statValue}>{stats.avg_percent || 0}٪</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>تکلیف در انتظار</p><p className={styles.statValue}>{stats.homework_pending_review || 0}</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>آزمون‌ها</p><p className={styles.statValue}>{stats.quiz_attempts || 0}</p></div>
        </div>

        <div className={styles.tabs}>
          {[
            ['overview', 'نمای کلی'],
            ['teachers', 'معلمان'],
            ['students', 'دانش‌آموزان'],
            ['activity', 'فعالیت‌ها'],
            ['settings', 'تنظیمات'],
          ].map(([k, l]) => (
            <button key={k} type="button" className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'overview' && data ? (
          <div className={styles.grid2}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>معلمان</h2>
              {(data.teachers || []).slice(0, 8).map((t) => (
                <div key={t.id} className={styles.tip}>
                  <strong>{t.display_name}</strong> · {t.specialty || '—'}
                  <div>دانش‌آموز: {t.student_count} · دسته: {t.subject_count}</div>
                </div>
              ))}
            </div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>برترین دانش‌آموزان</h2>
              {(data.students || []).slice(0, 8).map((s) => (
                <div key={s.id} className={styles.tip}>
                  <strong>{s.display_name}</strong> · {RANK_FA[s.rank_tier] || s.rank_tier}
                  <div>امتیاز {s.activity_points} · معدل {s.average_percent}٪</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === 'teachers' ? (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>افزودن معلم</h2>
            <div className={styles.formRow}>
              <div className={styles.field}><label>موبایل</label><input dir="ltr" value={teacherForm.mobile} onChange={(e) => setTeacherForm((p) => ({ ...p, mobile: e.target.value }))} /></div>
              <div className={styles.field}><label>نام</label><input value={teacherForm.display_name} onChange={(e) => setTeacherForm((p) => ({ ...p, display_name: e.target.value }))} /></div>
            </div>
            <div className={styles.field} style={{ marginTop: 8 }}>
              <label>تخصص</label>
              <input value={teacherForm.specialty} onChange={(e) => setTeacherForm((p) => ({ ...p, specialty: e.target.value }))} />
            </div>
            <button type="button" className={styles.btnAccent} style={{ marginTop: 10 }} onClick={addTeacher}><Plus size={14} /> افزودن</button>
            <div className={styles.tableWrap} style={{ marginTop: 16 }}>
              <table className={styles.table}>
                <thead><tr><th>نام</th><th>موبایل</th><th>تخصص</th><th>دانش‌آموز</th><th>دسته</th></tr></thead>
                <tbody>
                  {(data?.teachers || []).map((t) => (
                    <tr key={t.id}>
                      <td>{t.display_name}</td>
                      <td dir="ltr">{t.mobile}</td>
                      <td>{t.specialty || '—'}</td>
                      <td>{t.student_count}</td>
                      <td>{t.subject_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'students' ? (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>افزودن دانش‌آموز</h2>
            <div className={styles.formRow}>
              <div className={styles.field}><label>موبایل</label><input dir="ltr" value={studentForm.mobile} onChange={(e) => setStudentForm((p) => ({ ...p, mobile: e.target.value }))} /></div>
              <div className={styles.field}><label>نام</label><input value={studentForm.display_name} onChange={(e) => setStudentForm((p) => ({ ...p, display_name: e.target.value }))} /></div>
            </div>
            <div className={styles.formRow} style={{ marginTop: 8 }}>
              <div className={styles.field}><label>پایه</label><input value={studentForm.grade} onChange={(e) => setStudentForm((p) => ({ ...p, grade: e.target.value }))} /></div>
              <div className={styles.field}>
                <label>معلم</label>
                <select
                  value={studentForm.teacher_ids[0] || ''}
                  onChange={(e) => setStudentForm((p) => ({
                    ...p,
                    teacher_ids: e.target.value ? [Number(e.target.value)] : [],
                  }))}
                >
                  <option value="">انتخاب</option>
                  {(data?.teachers || []).map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}
                </select>
              </div>
            </div>
            <button type="button" className={styles.btnAccent} style={{ marginTop: 10 }} onClick={addStudent}><Plus size={14} /> افزودن</button>
            <div className={styles.tableWrap} style={{ marginTop: 16 }}>
              <table className={styles.table}>
                <thead><tr><th>نام</th><th>موبایل</th><th>امتیاز</th><th>رتبه</th><th>معدل</th></tr></thead>
                <tbody>
                  {(data?.students || []).map((s) => (
                    <tr key={s.id}>
                      <td>{s.display_name}</td>
                      <td dir="ltr">{s.mobile}</td>
                      <td>{s.activity_points}</td>
                      <td><span className={styles.pill}>{RANK_FA[s.rank_tier] || s.rank_tier}</span></td>
                      <td>{s.average_percent}٪</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'activity' && data ? (
          <div className={styles.grid2}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>آزمون‌های اخیر</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>دانش‌آموز</th><th>آزمون</th><th>%</th></tr></thead>
                  <tbody>
                    {(data.recent_attempts || []).map((a) => (
                      <tr key={a.id}>
                        <td>{a.student_name}</td>
                        <td>{a.quiz_title}</td>
                        <td><span className={styles.pill}>{a.percentage}٪</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!(data.recent_attempts || []).length ? <p className={styles.empty}>آزمونی ثبت نشده</p> : null}
            </div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>تکالیف در انتظار</h2>
              {(data.pending_submissions || []).map((s) => (
                <div key={s.id} className={styles.tip}>
                  <strong>{s.student_name}</strong>
                  <div>{s.exercise_title}</div>
                  {s.proof_url ? (
                    <a href={s.proof_url} target="_blank" rel="noreferrer">مشاهده تصویر</a>
                  ) : (
                    <span className={styles.pillWarn}>بدون تصویر</span>
                  )}
                </div>
              ))}
              {!(data.pending_submissions || []).length ? <p className={styles.empty}>تکلیف معلقی نیست</p> : null}
            </div>
          </div>
        ) : null}

        {tab === 'settings' ? (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>تنظیمات مدرسه</h2>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.field}><label>عنوان</label><input value={settings.title_fa || ''} onChange={(e) => setSettings((p) => ({ ...p, title_fa: e.target.value }))} /></div>
                <div className={styles.field}><label>عنوان EN</label><input dir="ltr" value={settings.title_en || ''} onChange={(e) => setSettings((p) => ({ ...p, title_en: e.target.value }))} /></div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}><label>امتیاز هر تکلیف</label><input type="number" value={settings.points_homework || 10} onChange={(e) => setSettings((p) => ({ ...p, points_homework: e.target.value }))} /></div>
                <div className={styles.field}><label>ساعت مطالعه پیشنهادی روزانه</label><input type="number" value={settings.study_hours_hint || 1} onChange={(e) => setSettings((p) => ({ ...p, study_hours_hint: e.target.value }))} /></div>
              </div>
              <button type="button" className={styles.btnAccent} onClick={saveSettings}>ذخیره</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
