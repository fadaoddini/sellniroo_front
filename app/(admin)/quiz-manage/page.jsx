'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain,
  LayoutDashboard,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Pencil,
  Trophy,
  Users,
  Target,
  Award,
  Medal,
  Search,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import quizService from '@/components/Quiz/services/quizService'
import styles from './QuizManage.module.css'

function SwitchField({ label, checked, onChange }) {
  return (
    <label className={styles.switchRow}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

function rankBadgeClass(rank) {
  if (rank === 1) return styles.badgeGold
  if (rank === 2) return styles.badgeSilver
  if (rank === 3) return styles.badgeBronze
  return styles.badgeDefault
}

const emptyQuestion = {
  specialty: '',
  category: '',
  text: '',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 2,
  is_active: true,
}

export default function QuizManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('overview')
  const [settings, setSettings] = useState({})
  const [specialties, setSpecialties] = useState([])
  const [questions, setQuestions] = useState([])
  const [attempts, setAttempts] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState(null)
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [scoreSpecialty, setScoreSpecialty] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [editingQ, setEditingQ] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingScores, setLoadingScores] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/quiz-manage')
    }
  }, [loading, isAuthenticated, router])

  const loadScores = useCallback(async () => {
    setLoadingScores(true)
    const params = {
      limit: 200,
      include_stats: '1',
    }
    if (scoreSpecialty) params.specialty = scoreSpecialty
    if (searchQ.trim()) params.q = searchQ.trim()

    const [att, board] = await Promise.all([
      quizService.getScores({ ...params, mode: 'attempts' }),
      quizService.getScores({ ...params, mode: 'leaderboard', limit: 50 }),
    ])
    if (att.success) {
      setAttempts(att.data.items || [])
      if (att.data.stats) setStats(att.data.stats)
    }
    if (board.success) {
      setLeaderboard(board.data.items || [])
      if (board.data.stats) setStats(board.data.stats)
    }
    setLoadingScores(false)
  }, [scoreSpecialty, searchQ])

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    const [s, sp] = await Promise.all([
      quizService.getSettings(),
      quizService.getSpecialties(true),
    ])
    if (s.success) setSettings(s.data || {})
    if (sp.success) setSpecialties(sp.data || [])
    setLoadingData(false)
  }, [])

  const loadQuestions = useCallback(async (specialtyKey) => {
    const params = { include_inactive: '1' }
    if (specialtyKey) params.specialty = specialtyKey
    const res = await quizService.getQuestions(params)
    if (res.success) setQuestions(res.data || [])
  }, [])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
  }, [isAuthenticated, canManage, load])

  useEffect(() => {
    if (!isAuthenticated || !canManage) return
    if (['overview', 'participants', 'leaderboard'].includes(tab)) {
      loadScores()
    }
  }, [tab, isAuthenticated, canManage, loadScores])

  useEffect(() => {
    if (tab === 'questions' && canManage) {
      loadQuestions(filterSpecialty)
    }
  }, [tab, filterSpecialty, canManage, loadQuestions])

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    const res = await quizService.updateSettings(settings)
    setSaving(false)
    if (res.success) {
      setSettings(res.data || settings)
      setMsg('تنظیمات ذخیره شد')
    } else setErr(res.error)
  }

  const saveQuestion = async () => {
    if (!editingQ) return
    const options = (editingQ.options || []).map((x) => String(x).trim()).filter(Boolean)
    if (options.length < 2) {
      setErr('حداقل دو گزینه لازم است')
      return
    }
    if (!options.includes(editingQ.correct_answer)) {
      setErr('پاسخ صحیح باید یکی از گزینه‌ها باشد')
      return
    }
    setSaving(true)
    setErr(null)
    const payload = {
      specialty: Number(editingQ.specialty),
      category: editingQ.category || '',
      text: editingQ.text,
      options,
      correct_answer: editingQ.correct_answer,
      points: Number(editingQ.points) || 1,
      is_active: editingQ.is_active !== false,
    }
    const res = editingQ.id
      ? await quizService.updateQuestion(editingQ.id, payload)
      : await quizService.createQuestion(payload)
    setSaving(false)
    if (!res.success) {
      setErr(res.error)
      return
    }
    setMsg(editingQ.id ? 'سوال ذخیره شد' : 'سوال ایجاد شد')
    setEditingQ(null)
    loadQuestions(filterSpecialty)
  }

  const deleteQuestion = async (id) => {
    if (!window.confirm('حذف این سوال؟')) return
    const res = await quizService.deleteQuestion(id)
    if (res.success) {
      setMsg('حذف شد')
      loadQuestions(filterSpecialty)
    } else setErr(res.error)
  }

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.muted}>در حال بررسی دسترسی...</p>
        </div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>دسترسی ندارید</h1>
          <p className={styles.muted}>فقط مدیر و staff می‌توانند آزمون را مدیریت کنند.</p>
          <Link href="/dashboard" className={styles.btnGhost}>
            بازگشت
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    ['overview', 'خلاصه'],
    ['leaderboard', 'نفرات برتر'],
    ['participants', 'شرکت‌کنندگان'],
    ['questions', 'سوالات'],
    ['settings', 'تنظیمات'],
  ]

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Brain size={22} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 8 }} />
              مدیریت آزمون
            </h1>
            <p className={styles.subtitle}>
              سوالات، شرکت‌کنندگان، امتیازها و رتبه‌های برتر
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.btnGhost}>
              <LayoutDashboard size={15} />
              داشبورد
            </Link>
            <Link href="/quiz" className={styles.btnGhost} target="_blank">
              مشاهده آزمون
            </Link>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => {
                load()
                loadScores()
              }}
            >
              <RefreshCw size={15} />
              بروزرسانی
            </button>
          </div>
        </header>

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.tabs}>
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? styles.tabActive : styles.tab}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {(tab === 'overview' || tab === 'participants' || tab === 'leaderboard') && (
          <div className={styles.filters}>
            <select
              value={scoreSpecialty}
              onChange={(e) => setScoreSpecialty(e.target.value)}
              className={styles.select}
            >
              <option value="">همه حوزه‌ها</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.key}>
                  {s.name_fa}
                </option>
              ))}
            </select>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="جستجوی نام یا موبایل..."
              />
            </div>
            <button type="button" className={styles.btnGhost} onClick={loadScores}>
              اعمال فیلتر
            </button>
          </div>
        )}

        {loadingData || loadingScores ? (
          <p className={styles.muted}>در حال بارگذاری...</p>
        ) : null}

        {tab === 'overview' && !loadingScores ? (
          <section className={styles.panel}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Target size={18} />
                <strong>{stats?.total_attempts ?? 0}</strong>
                <span>کل شرکت‌ها</span>
              </div>
              <div className={styles.statCard}>
                <Users size={18} />
                <strong>{stats?.unique_participants ?? 0}</strong>
                <span>نفر یکتا</span>
              </div>
              <div className={styles.statCard}>
                <Award size={18} />
                <strong>{stats?.average_percentage ?? 0}%</strong>
                <span>میانگین درصد</span>
              </div>
              <div className={styles.statCard}>
                <Brain size={18} />
                <strong>{stats?.questions_count ?? 0}</strong>
                <span>سوال فعال</span>
              </div>
            </div>

            {stats?.top_player ? (
              <div className={styles.topPlayer}>
                <Trophy size={20} />
                <div>
                  <p className={styles.rowTitle}>برترین نتیجه فعلی</p>
                  <p className={styles.rowMeta}>
                    {stats.top_player.display_name}
                    {stats.top_player.user_mobile
                      ? ` · ${stats.top_player.user_mobile}`
                      : ' · مهمان'}
                    {' · '}
                    {stats.top_player.specialty_name} · {stats.top_player.percentage}% ·{' '}
                    {stats.top_player.score} امتیاز
                  </p>
                </div>
              </div>
            ) : null}

            <h3 className={styles.sectionTitle}>۵ نفر برتر</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>رتبه</th>
                    <th>نام</th>
                    <th>حوزه</th>
                    <th>درصد</th>
                    <th>امتیاز</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 5).map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className={`${styles.badge} ${rankBadgeClass(row.rank)}`}>
                          #{row.rank}
                        </span>
                      </td>
                      <td>
                        <strong>{row.display_name}</strong>
                        <div className={styles.rowMeta}>
                          {row.is_guest
                            ? 'مهمان'
                            : row.user_mobile || `کاربر #${row.user_id}`}
                        </div>
                      </td>
                      <td>{row.specialty_name}</td>
                      <td>{row.percentage}%</td>
                      <td>
                        {row.score}/{row.max_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!leaderboard.length ? (
                <p className={styles.muted}>هنوز رتبه‌ای ثبت نشده</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {tab === 'leaderboard' && !loadingScores ? (
          <section className={styles.panel}>
            <h3 className={styles.sectionTitle}>
              <Trophy size={16} />
              جدول نفرات برتر
            </h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>رتبه</th>
                    <th>نام</th>
                    <th>موبایل / نوع</th>
                    <th>حوزه</th>
                    <th>درصد</th>
                    <th>امتیاز</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className={`${styles.badge} ${rankBadgeClass(row.rank)}`}>
                          {row.rank === 1 ? <Medal size={12} /> : null}
                          #{row.rank}
                        </span>
                      </td>
                      <td>
                        <strong>{row.display_name}</strong>
                      </td>
                      <td dir="ltr">
                        {row.is_guest ? 'مهمان' : row.user_mobile || '—'}
                      </td>
                      <td>{row.specialty_name}</td>
                      <td>{row.percentage}%</td>
                      <td>
                        {row.score}/{row.max_score}
                      </td>
                      <td>
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString('fa-IR')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!leaderboard.length ? (
                <p className={styles.muted}>هنوز رتبه‌ای ثبت نشده</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {tab === 'participants' && !loadingScores ? (
          <section className={styles.panel}>
            <h3 className={styles.sectionTitle}>
              <Users size={16} />
              همه شرکت‌ها ({attempts.length})
            </h3>
            <p className={styles.muted} style={{ marginBottom: '0.85rem' }}>
              هر ردیف یک بار شرکت در آزمون است. رتبه نسبت به همان حوزه محاسبه شده.
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>موبایل</th>
                    <th>حوزه</th>
                    <th>صحیح</th>
                    <th>درصد</th>
                    <th>امتیاز</th>
                    <th>رتبه حوزه</th>
                    <th>زمان</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.display_name}</strong>
                        <div className={styles.rowMeta}>
                          {row.is_guest ? 'مهمان' : 'کاربر ثبت‌نام‌شده'}
                        </div>
                      </td>
                      <td dir="ltr">{row.user_mobile || '—'}</td>
                      <td>{row.specialty_name}</td>
                      <td>
                        {row.correct_count}/{row.total_questions}
                      </td>
                      <td>{row.percentage}%</td>
                      <td>
                        {row.score}/{row.max_score}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${rankBadgeClass(row.rank)}`}>
                          #{row.rank}
                        </span>
                      </td>
                      <td>
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString('fa-IR')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!attempts.length ? (
                <p className={styles.muted}>هنوز کسی در آزمون شرکت نکرده</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {tab === 'settings' && !loadingData ? (
          <section className={styles.panel}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>تعداد سوال هر آزمون (رندم)</label>
                <input
                  type="number"
                  min={1}
                  value={settings.questions_per_session ?? 10}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      questions_per_session: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>زمان هر سوال (ثانیه)</label>
                <input
                  type="number"
                  min={5}
                  value={settings.time_per_question ?? 20}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      time_per_question: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>تعداد نفرات برتر (نمایش عمومی)</label>
                <input
                  type="number"
                  min={1}
                  value={settings.leaderboard_size ?? 20}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      leaderboard_size: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <SwitchField
              label="نمایش جدول نفرات برتر در سایت"
              checked={settings.show_leaderboard !== false}
              onChange={(v) => setSettings((s) => ({ ...s, show_leaderboard: v }))}
            />
            <SwitchField
              label="اجازه شرکت مهمان (بدون لاگین)"
              checked={settings.allow_guest !== false}
              onChange={(v) => setSettings((s) => ({ ...s, allow_guest: v }))}
            />
            <div className={styles.grid2} style={{ marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label>عنوان فارسی</label>
                <input
                  value={settings.title_fa || ''}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, title_fa: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>عنوان انگلیسی</label>
                <input
                  value={settings.title_en || ''}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, title_en: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>زیرعنوان فارسی</label>
                <input
                  value={settings.subtitle_fa || ''}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, subtitle_fa: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>زیرعنوان انگلیسی</label>
                <input
                  value={settings.subtitle_en || ''}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, subtitle_en: e.target.value }))
                  }
                />
              </div>
            </div>
            <button type="button" className={styles.btn} onClick={saveSettings} disabled={saving}>
              <Save size={15} />
              {saving ? '...' : 'ذخیره تنظیمات'}
            </button>
          </section>
        ) : null}

        {tab === 'questions' && !loadingData ? (
          <section className={styles.panel}>
            <div className={styles.actions} style={{ marginBottom: '1rem' }}>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className={styles.select}
              >
                <option value="">همه حوزه‌ها</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.key}>
                    {s.name_fa} ({s.question_count || 0})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.btn}
                onClick={() =>
                  setEditingQ({
                    ...emptyQuestion,
                    specialty: specialties[0]?.id || '',
                  })
                }
              >
                <Plus size={15} />
                سوال جدید
              </button>
            </div>

            {editingQ ? (
              <div className={styles.panel} style={{ marginBottom: '1rem', background: '#faf9f7' }}>
                <div className={styles.formGroup}>
                  <label>حوزه</label>
                  <select
                    value={editingQ.specialty}
                    onChange={(e) =>
                      setEditingQ((q) => ({ ...q, specialty: e.target.value }))
                    }
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_fa}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>متن سوال</label>
                  <textarea
                    rows={3}
                    value={editingQ.text}
                    onChange={(e) =>
                      setEditingQ((q) => ({ ...q, text: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>دسته‌بندی</label>
                  <input
                    value={editingQ.category || ''}
                    onChange={(e) =>
                      setEditingQ((q) => ({ ...q, category: e.target.value }))
                    }
                  />
                </div>
                {(editingQ.options || ['', '', '', '']).map((opt, i) => (
                  <div className={styles.formGroup} key={i}>
                    <label>گزینه {i + 1}</label>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...(editingQ.options || [])]
                        next[i] = e.target.value
                        setEditingQ((q) => ({ ...q, options: next }))
                      }}
                    />
                  </div>
                ))}
                <div className={styles.formGroup}>
                  <label>پاسخ صحیح</label>
                  <select
                    value={editingQ.correct_answer}
                    onChange={(e) =>
                      setEditingQ((q) => ({
                        ...q,
                        correct_answer: e.target.value,
                      }))
                    }
                  >
                    <option value="">انتخاب کنید</option>
                    {(editingQ.options || [])
                      .filter((x) => String(x).trim())
                      .map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>امتیاز</label>
                  <input
                    type="number"
                    min={1}
                    value={editingQ.points || 1}
                    onChange={(e) =>
                      setEditingQ((q) => ({
                        ...q,
                        points: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <SwitchField
                  label="فعال"
                  checked={editingQ.is_active !== false}
                  onChange={(v) => setEditingQ((q) => ({ ...q, is_active: v }))}
                />
                <div className={styles.actions}>
                  <button type="button" className={styles.btn} onClick={saveQuestion} disabled={saving}>
                    <Save size={15} />
                    ذخیره سوال
                  </button>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => setEditingQ(null)}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : null}

            <div className={styles.list}>
              {questions.map((q) => (
                <div key={q.id} className={styles.row}>
                  <div>
                    <p className={styles.rowTitle}>{q.text}</p>
                    <p className={styles.rowMeta}>
                      {q.specialty_key} · {q.points} امتیاز ·{' '}
                      {q.is_active ? 'فعال' : 'غیرفعال'}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={() =>
                        setEditingQ({
                          ...q,
                          options: [...(q.options || []), '', '', '', ''].slice(0, 4),
                        })
                      }
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => deleteQuestion(q.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!questions.length ? (
                <p className={styles.muted}>سوالی یافت نشد</p>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
