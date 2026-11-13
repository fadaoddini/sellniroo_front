'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Plus, RefreshCw, GraduationCap, HeartHandshake, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import AdminAttendancePanel from '@/components/School/AdminAttendancePanel'
import AdminSubjectsPanel from '@/components/School/AdminSubjectsPanel'
import AdminOverviewCharts from '@/components/School/AdminOverviewCharts'
import ClassesPanel from '@/components/School/ClassesPanel'
import TeacherProfilePanel from '@/components/School/TeacherProfilePanel'
import CounselorProfilePanel from '@/components/School/CounselorProfilePanel'
import styles from './School.module.css'

const RANK_FA = {
  bronze: 'برنزی', silver: 'نقره‌ای', gold: 'طلایی',
  platinum: 'پلاتینیوم', diamond: 'الماس',
}

export default function SchoolManage({ embedded = false } = {}) {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [settings, setSettings] = useState({})
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [teacherForm, setTeacherForm] = useState({ mobile: '', display_name: '', specialty: '' })
  const [counselorForm, setCounselorForm] = useState({ mobile: '', display_name: '', specialty: '' })
  const [counselors, setCounselors] = useState([])
  const [studentForm, setStudentForm] = useState({ mobile: '', display_name: '', grade: '', teacher_ids: [] })
  const [editTeacherId, setEditTeacherId] = useState(null)
  const [editCounselorId, setEditCounselorId] = useState(null)

  const notifyPanel = useCallback((m, isErr) => {
    if (isErr) setErr(m)
    else {
      setMsg(m)
      setErr(null)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login?next=/school-manage')
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setErr(null)
    const [ov, st, cs] = await Promise.all([
      schoolService.overview(),
      schoolService.settings(),
      schoolService.listCounselors(),
    ])
    if (!ov.success) {
      setErr(ov.error || 'دسترسی ندارید')
      return
    }
    setData(ov.data)
    if (st.success) setSettings(st.data || {})
    if (cs.success) setCounselors(cs.data || [])
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

  const addCounselor = async () => {
    const res = await schoolService.createCounselor(counselorForm)
    if (res.success) {
      setCounselorForm({ mobile: '', display_name: '', specialty: '' })
      setMsg('مشاور اضافه شد')
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

  const pageClass = embedded
    ? `${styles.page} ${styles.pageInProfile}`
    : styles.page

  if (loading) return null
  if (!isAuthenticated) return null
  if (!canManage) {
    return (
      <div className={pageClass} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.panel}><p className={styles.empty}>فقط مدیر مدرسه / staff</p></div>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}

  return (
    <div className={pageClass} dir="rtl">
      <div className={styles.wrap}>
        {!embedded ? (
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
        ) : null}

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        {tab !== 'overview' ? (
          <div className={styles.stats}>
            <div className={styles.stat}><p className={styles.statLabel}>معلمان</p><p className={styles.statValue}>{stats.teachers || 0}</p></div>
            <div className={styles.stat}><p className={styles.statLabel}>دانش‌آموزان</p><p className={styles.statValue}>{stats.students || 0}</p></div>
            <div className={styles.stat}><p className={styles.statLabel}>کلاس‌ها</p><p className={styles.statValue}>{stats.classes || 0}</p></div>
            <div className={styles.stat}><p className={styles.statLabel}>دروس</p><p className={styles.statValue}>{stats.lessons || 0}</p></div>
            <div className={styles.stat}><p className={styles.statLabel}>معدل کلی</p><p className={styles.statValue}>{stats.avg_percent || 0}٪</p></div>
            <div className={styles.stat}><p className={styles.statLabel}>تکلیف در انتظار</p><p className={styles.statValue}>{stats.homework_pending_review || 0}</p></div>
            <div className={styles.stat}><p className={styles.statLabel}>حضور امروز</p><p className={styles.statValue}>{stats.attendance_rate_today || 0}٪</p></div>
          </div>
        ) : null}

        <div className={styles.tabs}>
          {[
            ['overview', 'نمای کلی'],
            ['classes', 'کلاس‌ها و برنامه'],
            ['subjects', 'دروس معلمان'],
            ['attendance', 'حضور و غیاب'],
            ['teachers', 'معلمان'],
            ['counselors', 'مشاوران'],
            ['students', 'دانش‌آموزان'],
            ['activity', 'فعالیت‌ها'],
            ['settings', 'تنظیمات'],
          ].map(([k, l]) => (
            <button key={k} type="button" className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'classes' ? (
          <div className={styles.panel}>
            <ClassesPanel
              teachers={data?.teachers || []}
              students={data?.students || []}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'subjects' ? (
          <div className={styles.panel}>
            <AdminSubjectsPanel
              teachers={data?.teachers || []}
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'overview' && data ? (
          <div className={styles.teacherOverviewPage}>
            <AdminOverviewCharts
              charts={data.charts || {}}
              overview={data.overview || {}}
              stats={data.stats || {}}
              onNavigate={setTab}
            />
          </div>
        ) : null}

        {tab === 'attendance' ? (
          <div className={styles.panel}>
            <AdminAttendancePanel
              onNotify={notifyPanel}
            />
          </div>
        ) : null}

        {tab === 'counselors' ? (
          <div className={styles.panel}>
            {editCounselorId ? (
              <>
                <div className={styles.panelHead}>
                  <h2 className={styles.panelTitle}>ویرایش پروفایل مشاور</h2>
                  <button type="button" className={styles.btnGhost} onClick={() => setEditCounselorId(null)}>بازگشت</button>
                </div>
                <CounselorProfilePanel
                  mode="admin"
                  counselorId={editCounselorId}
                  onNotify={notifyPanel}
                />
              </>
            ) : (
              <>
                <div className={styles.panelHead}>
                  <h2 className={styles.panelTitle}><HeartHandshake size={16} /> مشاوران مدرسه</h2>
                  <Link href="/school/counselor" className={styles.btnGhost}>
                    <ExternalLink size={14} /> پنل مشاوره
                  </Link>
                </div>

                <div className={styles.cpManageForm}>
                  <h3 className={styles.panelTitle} style={{ marginBottom: 10 }}>افزودن مشاور</h3>
                  <div className={styles.formRow}>
                    <div className={styles.field}><label>موبایل</label><input dir="ltr" value={counselorForm.mobile} onChange={(e) => setCounselorForm((p) => ({ ...p, mobile: e.target.value }))} /></div>
                    <div className={styles.field}><label>نام</label><input value={counselorForm.display_name} onChange={(e) => setCounselorForm((p) => ({ ...p, display_name: e.target.value }))} /></div>
                  </div>
                  <div className={styles.field} style={{ marginTop: 8 }}>
                    <label>تخصص</label>
                    <input value={counselorForm.specialty} onChange={(e) => setCounselorForm((p) => ({ ...p, specialty: e.target.value }))} placeholder="مشاوره تحصیلی · روان‌شناختی" />
                  </div>
                  <button type="button" className={styles.btnAccent} style={{ marginTop: 12 }} onClick={addCounselor}>
                    <Plus size={14} /> افزودن مشاور
                  </button>
                </div>

                <div className={styles.cpManageGrid}>
                  {counselors.map((c) => (
                    <article key={c.id} className={styles.cpManageCard}>
                      <div className={styles.cpManageTop}>
                        <div className={styles.cpManageAvatar}>
                          {c.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.avatar_url} alt="" />
                          ) : (
                            <HeartHandshake size={22} />
                          )}
                        </div>
                        <div>
                          <p className={styles.cpManageName}>{c.display_name}</p>
                          <p className={styles.cpManageMeta}>{c.specialty || 'بدون تخصص'}</p>
                          <p className={styles.cpManageMeta} dir="ltr">{c.mobile}</p>
                        </div>
                      </div>
                      <div className={styles.cpManageActions}>
                        <button type="button" className={styles.btnAccent} onClick={() => setEditCounselorId(c.id)}>
                          پروفایل
                        </button>
                        {c.public_path ? (
                          <Link href={c.public_path} className={styles.btnGhost} target="_blank">
                            صفحه عمومی
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
                {!counselors.length ? <p className={styles.empty}>هنوز مشاوری ثبت نشده</p> : null}
              </>
            )}
          </div>
        ) : null}

        {tab === 'teachers' ? (
          <div className={styles.panel}>
            {editTeacherId ? (
              <>
                <div className={styles.panelHead}>
                  <h2 className={styles.panelTitle}>ویرایش پروفایل معلم</h2>
                  <button type="button" className={styles.btnGhost} onClick={() => setEditTeacherId(null)}>بازگشت به لیست</button>
                </div>
                <TeacherProfilePanel
                  mode="admin"
                  teacherId={editTeacherId}
                  onNotify={notifyPanel}
                />
              </>
            ) : (
              <>
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
                    <thead><tr><th>نام</th><th>موبایل</th><th>تخصص</th><th>دانش‌آموز</th><th>دسته</th><th /></tr></thead>
                    <tbody>
                      {(data?.teachers || []).map((t) => (
                        <tr key={t.id}>
                          <td>{t.display_name}</td>
                          <td dir="ltr">{t.mobile}</td>
                          <td>{t.specialty || '—'}</td>
                          <td>{t.student_count}</td>
                          <td>{t.subject_count}</td>
                          <td>
                            <button type="button" className={styles.btnGhost} onClick={() => setEditTeacherId(t.id)}>
                              پروفایل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
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
              <div className={styles.formRow}>
                <div className={styles.field}><label>امتیاز حضور</label><input type="number" value={settings.points_attendance_present ?? 2} onChange={(e) => setSettings((p) => ({ ...p, points_attendance_present: e.target.value }))} /></div>
                <div className={styles.field}><label>امتیاز تأخیر</label><input type="number" value={settings.points_attendance_late ?? 1} onChange={(e) => setSettings((p) => ({ ...p, points_attendance_late: e.target.value }))} /></div>
              </div>
              <button type="button" className={styles.btnAccent} onClick={saveSettings}>ذخیره</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
