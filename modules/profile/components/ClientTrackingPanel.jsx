'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  Dumbbell,
  Flame,
  Heart,
  Loader2,
  Timer,
  Plus,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut, Line, Radar } from 'react-chartjs-2'
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi'
import {
  formatJalaliDate,
  getDaysInJalaliMonth,
  jalaliToApiDate,
  MONTH_NAMES_FA,
  toApiDate,
  toFaDigits,
  toJalaliParts,
} from '@/modules/gym/utils/jalaliCalendar'
import styles from '../styles/ClientTrackingPanel.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
)

const faNum = (n) => {
  if (n == null || n === '') return '—'
  const num = Number(n)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('fa-IR')
}

const BODY_TYPES = [
  { value: 'ecto', label: 'اکتومورف', hint: 'لاغر و استخوانی' },
  { value: 'meso', label: 'مزومورف', hint: 'عضلانی و متعادل' },
  { value: 'endo', label: 'اندومورف', hint: 'پهن و ذخیره‌کننده' },
  { value: 'mixed', label: 'ترکیبی', hint: 'بین دو فرم' },
]

const GOALS = [
  { value: 'hypertrophy', label: 'حجم', hint: 'عضله‌سازی', Icon: Dumbbell },
  { value: 'cut', label: 'خشکی', hint: 'تفکیک', Icon: Flame },
  { value: 'strength', label: 'قدرت', hint: 'سنگین', Icon: Trophy },
  { value: 'endurance', label: 'استقامت', hint: 'هوازی', Icon: Timer },
  { value: 'fitness', label: 'فیتنس', hint: 'عمومی', Icon: Activity },
  { value: 'weight_loss', label: 'کاهش وزن', hint: 'چربی‌سوزی', Icon: TrendingDown },
  { value: 'weight_gain', label: 'افزایش وزن', hint: 'بالک', Icon: TrendingUp },
  { value: 'rehab', label: 'بازتوانی', hint: 'ترمیم', Icon: Heart },
]

const VERDICTS = [
  { value: 'improving', label: 'پیشرفت' },
  { value: 'stalled', label: 'راکد' },
  { value: 'declining', label: 'پسرفت' },
  { value: 'mixed', label: 'ترکیبی' },
]

function BodyFigure({ kind }) {
  return (
    <span className={`${styles.figure} ${styles[`figure_${kind}`]}`} aria-hidden>
      <i />
      <b />
      <em />
    </span>
  )
}

function ChoiceGrid({ items, value, onChange, kind = 'chip' }) {
  return (
    <div className={kind === 'body' ? styles.bodyGrid : styles.choiceGrid} role="listbox">
      {items.map((item) => {
        const Icon = item.Icon
        const on = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            role="option"
            aria-selected={on}
            className={clsx(
              kind === 'body' ? styles.bodyCard : styles.choiceCard,
              on && (kind === 'body' ? styles.bodyCardOn : styles.choiceCardOn),
            )}
            onClick={() => onChange(item.value)}
          >
            {kind === 'body' ? <BodyFigure kind={item.value} /> : null}
            {Icon ? <Icon size={14} /> : null}
            <strong>{item.label}</strong>
            {item.hint ? <span>{item.hint}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function JalaliDateField({ value, onChange }) {
  const parts = toJalaliParts(value || new Date())
  const year = parts.year || 1403
  const month = parts.month || 1
  const day = parts.day || 1
  const daysInMonth = getDaysInJalaliMonth(year, month) || 31
  const years = Array.from({ length: 12 }, (_, i) => year - 6 + i)

  const commit = (nextYear, nextMonth, nextDay) => {
    const max = getDaysInJalaliMonth(nextYear, nextMonth) || 31
    const safeDay = Math.min(nextDay, max)
    const api = jalaliToApiDate(nextYear, nextMonth, safeDay)
    if (api) onChange(api)
  }

  return (
    <div className={styles.jalaliField}>
      <div className={styles.jalaliSelects}>
        <select
          aria-label="روز"
          value={Math.min(day, daysInMonth)}
          onChange={(e) => commit(year, month, Number(e.target.value))}
        >
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{toFaDigits(d)}</option>
          ))}
        </select>
        <select
          aria-label="ماه"
          value={month}
          onChange={(e) => commit(year, Number(e.target.value), day)}
        >
          {MONTH_NAMES_FA.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          aria-label="سال"
          value={year}
          onChange={(e) => commit(Number(e.target.value), month, day)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{toFaDigits(y)}</option>
          ))}
        </select>
      </div>
      <em>{formatJalaliDate(value, { withWeekday: true })}</em>
    </div>
  )
}

function ScorePick({ label, value, onChange, tone = 'energy' }) {
  return (
    <div className={clsx(styles.scorePick, styles[`score_${tone}`])}>
      <span>{label}</span>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={clsx(styles.scoreDot, Number(value) === n && styles.scoreDotOn)}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

const emptyProfile = () => ({
  height_cm: '',
  start_weight_kg: '',
  target_weight_kg: '',
  start_body_fat: '',
  body_type: 'meso',
  posture_notes: '',
  training_goal: 'hypertrophy',
  sport_goal: '',
  strengths: '',
  weaknesses: '',
  focus_areas: '',
  start_date: toApiDate(new Date()),
  notes: '',
})

const emptyLog = () => ({
  recorded_at: toApiDate(new Date()),
  weight_kg: '',
  body_fat: '',
  chest_cm: '',
  waist_cm: '',
  hip_cm: '',
  arm_cm: '',
  thigh_cm: '',
  neck_cm: '',
  shoulders_cm: '',
  energy_score: 4,
  sleep_score: 4,
  adherence_score: 4,
  trainer_verdict: 'improving',
  strengths_now: '',
  problems: '',
  notes: '',
})

const numOrNull = (v) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      rtl: true,
      labels: { font: { family: 'inherit', size: 11 }, color: '#4d6a5c', boxWidth: 10 },
    },
    tooltip: { rtl: true, titleFont: { family: 'inherit' }, bodyFont: { family: 'inherit' } },
  },
  scales: {
    x: {
      ticks: { font: { family: 'inherit', size: 10 }, color: '#4d6a5c', maxRotation: 0 },
      grid: { color: 'rgba(2,60,44,0.06)' },
    },
    y: {
      ticks: {
        font: { family: 'inherit', size: 10 },
        color: '#4d6a5c',
        callback: (v) => Number(v).toLocaleString('fa-IR'),
      },
      grid: { color: 'rgba(2,60,44,0.06)' },
    },
  },
}

export default function ClientTrackingPanel({
  businessSlug,
  member,
  onClose,
}) {
  const api = useBodybuildingApi(businessSlug)
  const [tab, setTab] = useState('trend')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(emptyProfile)
  const [logForm, setLogForm] = useState(emptyLog)
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)

  const load = useCallback(async () => {
    if (!member?.id) return
    setLoading(true)
    setError('')
    try {
      const [p, s] = await Promise.all([
        api.members.bodyProfile(member.id),
        api.members.trackingSummary(member.id),
      ])
      setProfile({
        ...emptyProfile(),
        ...p,
        height_cm: p.height_cm ?? '',
        start_weight_kg: p.start_weight_kg ?? '',
        target_weight_kg: p.target_weight_kg ?? '',
        start_body_fat: p.start_body_fat ?? '',
        start_date: p.start_date || toApiDate(new Date()),
      })
      setLogs(s.logs || [])
      setSummary(s)
      if (!(s.logs || []).length && !p.height_cm && !p.start_weight_kg) {
        setTab('baseline')
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'بارگذاری رصد ممکن نشد.')
    } finally {
      setLoading(false)
    }
  }, [api, member?.id])

  useEffect(() => {
    load()
  }, [load])

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    try {
      await api.members.saveBodyProfile(member.id, {
        ...profile,
        height_cm: numOrNull(profile.height_cm),
        start_weight_kg: numOrNull(profile.start_weight_kg),
        target_weight_kg: numOrNull(profile.target_weight_kg),
        start_body_fat: numOrNull(profile.start_body_fat),
      })
      await load()
    } catch (e) {
      setError(e?.response?.data?.detail || 'ذخیره معیار پایه ممکن نشد.')
    } finally {
      setSaving(false)
    }
  }

  const saveLog = async () => {
    setSaving(true)
    setError('')
    try {
      await api.members.addProgressLog(member.id, {
        ...logForm,
        weight_kg: numOrNull(logForm.weight_kg),
        body_fat: numOrNull(logForm.body_fat),
        chest_cm: numOrNull(logForm.chest_cm),
        waist_cm: numOrNull(logForm.waist_cm),
        hip_cm: numOrNull(logForm.hip_cm),
        arm_cm: numOrNull(logForm.arm_cm),
        thigh_cm: numOrNull(logForm.thigh_cm),
        neck_cm: numOrNull(logForm.neck_cm),
        shoulders_cm: numOrNull(logForm.shoulders_cm),
        energy_score: Number(logForm.energy_score) || null,
        sleep_score: Number(logForm.sleep_score) || null,
        adherence_score: Number(logForm.adherence_score) || null,
      })
      setLogForm(emptyLog())
      setTab('trend')
      await load()
    } catch (e) {
      setError(e?.response?.data?.detail || 'ثبت دوره ممکن نشد.')
    } finally {
      setSaving(false)
    }
  }

  const removeLog = async (id) => {
    setSaving(true)
    try {
      await api.members.deleteProgressLog(member.id, id)
      await load()
    } catch (e) {
      setError('حذف ثبت ممکن نشد.')
    } finally {
      setSaving(false)
    }
  }

  const kpis = summary?.kpis || {}
  const chartLogs = logs

  const lineData = useMemo(() => {
    const labels = chartLogs.map((l) =>
      formatJalaliDate(l.recorded_at, { withWeekday: false }),
    )
    return {
      labels,
      datasets: [
        {
          label: 'وزن',
          data: chartLogs.map((l) => numOrNull(l.weight_kg)),
          borderColor: '#046c4e',
          backgroundColor: 'rgba(4,108,78,0.12)',
          tension: 0.35,
          fill: true,
          spanGaps: true,
        },
        {
          label: 'کمر',
          data: chartLogs.map((l) => numOrNull(l.waist_cm)),
          borderColor: '#d97706',
          backgroundColor: 'transparent',
          tension: 0.35,
          spanGaps: true,
        },
        {
          label: 'چربی ٪',
          data: chartLogs.map((l) => numOrNull(l.body_fat)),
          borderColor: '#4f46e5',
          backgroundColor: 'transparent',
          tension: 0.35,
          spanGaps: true,
        },
      ],
    }
  }, [chartLogs])

  const radarData = useMemo(() => {
    const last = chartLogs[chartLogs.length - 1]
    const prev = chartLogs[chartLogs.length - 2]
    return {
      labels: ['انرژی', 'خواب', 'پایبندی'],
      datasets: [
        prev
          ? {
              label: 'دوره قبل',
              data: [prev.energy_score || 0, prev.sleep_score || 0, prev.adherence_score || 0],
              borderColor: '#94a3b8',
              backgroundColor: 'rgba(148,163,184,0.2)',
            }
          : null,
        last
          ? {
              label: 'آخرین دوره',
              data: [last.energy_score || 0, last.sleep_score || 0, last.adherence_score || 0],
              borderColor: '#046c4e',
              backgroundColor: 'rgba(16,185,129,0.22)',
            }
          : null,
      ].filter(Boolean),
    }
  }, [chartLogs])

  const doughnutData = useMemo(() => {
    const v = summary?.verdicts || {}
    return {
      labels: ['پیشرفت', 'راکد', 'پسرفت', 'ترکیبی'],
      datasets: [
        {
          data: [v.improving || 0, v.stalled || 0, v.declining || 0, v.mixed || 0],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
          borderWidth: 0,
        },
      ],
    }
  }, [summary])

  return (
    <div className={styles.wrap} dir="rtl">
      <header className={styles.top}>
        <button type="button" className={styles.back} onClick={onClose}>
          <ArrowLeft size={16} />
          بازگشت
        </button>
        <div>
          <h2>
            <Activity size={18} />
            رصد {member?.full_name || 'شاگرد'}
          </h2>
          <p>معیار پایه، ثبت دوره‌ای و نمودار پیشرفت</p>
        </div>
      </header>

      <nav className={styles.tabs}>
        {[
          { id: 'trend', label: 'روند و نمودار' },
          { id: 'log', label: 'ثبت دوره' },
          { id: 'baseline', label: 'معیار پایه' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={clsx(styles.tab, tab === t.id && styles.tabOn)}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error ? <p className={styles.error}>{error}</p> : null}

      {loading ? (
        <div className={styles.loading}>
          <Loader2 className={styles.spin} size={22} />
        </div>
      ) : null}

      {!loading && tab === 'baseline' ? (
        <section className={styles.card}>
          <h3>شروع پرونده</h3>
          <p className={styles.hint}>قد، وزن، فرم بدن و هدف را سریع انتخاب کنید.</p>
          <div className={styles.grid4}>
            <label>
              قد (سانتی‌متر)
              <input
                type="number"
                value={profile.height_cm}
                onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
              />
            </label>
            <label>
              وزن شروع
              <input
                type="number"
                step="0.1"
                value={profile.start_weight_kg}
                onChange={(e) => setProfile({ ...profile, start_weight_kg: e.target.value })}
              />
            </label>
            <label>
              وزن هدف
              <input
                type="number"
                step="0.1"
                value={profile.target_weight_kg}
                onChange={(e) => setProfile({ ...profile, target_weight_kg: e.target.value })}
              />
            </label>
            <label>
              چربی شروع (٪)
              <input
                type="number"
                step="0.1"
                value={profile.start_body_fat}
                onChange={(e) => setProfile({ ...profile, start_body_fat: e.target.value })}
              />
            </label>
          </div>

          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>فرم بدن</span>
            <ChoiceGrid
              kind="body"
              items={BODY_TYPES}
              value={profile.body_type}
              onChange={(body_type) => setProfile({ ...profile, body_type })}
            />
          </div>

          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>هدف تمرین</span>
            <ChoiceGrid
              items={GOALS}
              value={profile.training_goal}
              onChange={(training_goal) => setProfile({ ...profile, training_goal })}
            />
          </div>

          <div className={styles.grid2}>
            <label>
              هدف ورزش
              <input
                value={profile.sport_goal}
                onChange={(e) => setProfile({ ...profile, sport_goal: e.target.value })}
                placeholder="مثلاً فرم تابستان"
              />
            </label>
            <label>
              نواحی تمرکز
              <input
                value={profile.focus_areas}
                onChange={(e) => setProfile({ ...profile, focus_areas: e.target.value })}
                placeholder="سینه، کمر، پشت"
              />
            </label>
          </div>
          <label>
            فرم ایستادن / ناهنجاری
            <textarea
              rows={2}
              value={profile.posture_notes}
              onChange={(e) => setProfile({ ...profile, posture_notes: e.target.value })}
            />
          </label>
          <div className={styles.grid2}>
            <label>
              محاسن
              <textarea
                rows={2}
                value={profile.strengths}
                onChange={(e) => setProfile({ ...profile, strengths: e.target.value })}
              />
            </label>
            <label>
              معایب
              <textarea
                rows={2}
                value={profile.weaknesses}
                onChange={(e) => setProfile({ ...profile, weaknesses: e.target.value })}
              />
            </label>
          </div>
          <button type="button" className={styles.primary} onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 size={15} className={styles.spin} /> : <Check size={15} />}
            ذخیره معیار پایه
          </button>
        </section>
      ) : null}

      {!loading && tab === 'log' ? (
        <div className={styles.logLayout}>
          <section className={styles.logPanel}>
            <header className={styles.logPanelHead}>
              <h3>ثبت دوره جدید</h3>
              <p>هر بخش جداگانه پر شود؛ تاریخ شمسی است.</p>
            </header>

            <div className={styles.logSection}>
              <div className={styles.logSectionHead}>
                <span>۱</span>
                تاریخ و وزن
              </div>
              <div className={styles.grid3}>
                <label>
                  تاریخ شمسی
                  <JalaliDateField
                    value={logForm.recorded_at}
                    onChange={(recorded_at) => setLogForm({ ...logForm, recorded_at })}
                  />
                </label>
                <label>
                  وزن (کیلو)
                  <input
                    type="number"
                    step="0.1"
                    value={logForm.weight_kg}
                    onChange={(e) => setLogForm({ ...logForm, weight_kg: e.target.value })}
                  />
                </label>
                <label>
                  چربی بدن (٪)
                  <input
                    type="number"
                    step="0.1"
                    value={logForm.body_fat}
                    onChange={(e) => setLogForm({ ...logForm, body_fat: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className={styles.logSection}>
              <div className={styles.logSectionHead}>
                <span>۲</span>
                اندازه‌های بدن (سانتی‌متر)
              </div>
              <div className={styles.grid4}>
                {[
                  ['chest_cm', 'سینه'],
                  ['waist_cm', 'کمر'],
                  ['hip_cm', 'باسن'],
                  ['arm_cm', 'بازو'],
                  ['thigh_cm', 'ران'],
                  ['shoulders_cm', 'شانه'],
                  ['neck_cm', 'گردن'],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      step="0.1"
                      value={logForm[key]}
                      onChange={(e) => setLogForm({ ...logForm, [key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.logSection}>
              <div className={styles.logSectionHead}>
                <span>۳</span>
                حال شاگرد
              </div>
              <div className={styles.scoreRow}>
                <ScorePick
                  tone="energy"
                  label="انرژی"
                  value={logForm.energy_score}
                  onChange={(energy_score) => setLogForm({ ...logForm, energy_score })}
                />
                <ScorePick
                  tone="sleep"
                  label="خواب"
                  value={logForm.sleep_score}
                  onChange={(sleep_score) => setLogForm({ ...logForm, sleep_score })}
                />
                <ScorePick
                  tone="adhere"
                  label="پایبندی به برنامه"
                  value={logForm.adherence_score}
                  onChange={(adherence_score) => setLogForm({ ...logForm, adherence_score })}
                />
              </div>
            </div>

            <div className={styles.logSection}>
              <div className={styles.logSectionHead}>
                <span>۴</span>
                جمع‌بندی مربی
              </div>
              <ChoiceGrid
                items={VERDICTS}
                value={logForm.trainer_verdict}
                onChange={(trainer_verdict) => setLogForm({ ...logForm, trainer_verdict })}
              />
              <div className={styles.grid2}>
                <label>
                  محاسن این دوره
                  <textarea
                    rows={2}
                    value={logForm.strengths_now}
                    onChange={(e) => setLogForm({ ...logForm, strengths_now: e.target.value })}
                  />
                </label>
                <label>
                  معایب / مشکل
                  <textarea
                    rows={2}
                    value={logForm.problems}
                    onChange={(e) => setLogForm({ ...logForm, problems: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <button type="button" className={styles.primary} onClick={saveLog} disabled={saving}>
              {saving ? <Loader2 size={15} className={styles.spin} /> : <Plus size={15} />}
              ثبت این دوره
            </button>
          </section>

          <section className={styles.logHistory}>
            <header className={styles.logPanelHead}>
              <h3>ثبت‌های قبلی</h3>
              <p>{faNum(logs.length)} دوره</p>
            </header>
            {logs.length ? (
              <div className={styles.logList}>
                {logs.slice().reverse().map((log) => (
                  <div key={log.id} className={styles.logRow}>
                    <strong>{formatJalaliDate(log.recorded_at, { withWeekday: false })}</strong>
                    <span>{log.weight_kg ? `${faNum(log.weight_kg)} کیلو` : '—'}</span>
                    <span>{log.trainer_verdict_display}</span>
                    <button type="button" onClick={() => removeLog(log.id)} aria-label="حذف">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>هنوز دوره‌ای ثبت نشده است.</p>
            )}
          </section>
        </div>
      ) : null}

      {!loading && tab === 'trend' ? (
        <div className={styles.trend}>
          <div className={styles.kpis}>
            <article>
              <span>BMI</span>
              <strong>{faNum(kpis.bmi)}</strong>
              <em>{kpis.bmi_label || 'قد و وزن لازم است'}</em>
            </article>
            <article>
              <span>وزن فعلی</span>
              <strong>{faNum(kpis.latest_weight)}</strong>
              <em>
                شروع {faNum(kpis.start_weight)}
                {kpis.weight_delta != null
                  ? ` · تغییر ${kpis.weight_delta > 0 ? '+' : ''}${faNum(kpis.weight_delta)}`
                  : ''}
              </em>
            </article>
            <article>
              <span>وضعیت مسیر</span>
              <strong className={kpis.on_track === false ? styles.bad : styles.good}>
                {kpis.on_track_label || '—'}
              </strong>
              <em>{kpis.latest_verdict_label || 'هنوز جمع‌بندی نشده'}</em>
            </article>
            <article>
              <span>تعداد ثبت</span>
              <strong>{faNum(kpis.logs_count)}</strong>
              <em>هدف {profile.training_goal_display || GOALS.find((g) => g.value === profile.training_goal)?.label}</em>
            </article>
          </div>

          <div className={styles.charts}>
            <section className={styles.chartCard}>
              <h3>
                <TrendingUp size={14} />
                روند وزن، کمر و چربی
              </h3>
              <div className={styles.chartBox}>
                {chartLogs.length ? (
                  <Line data={lineData} options={chartOpts} />
                ) : (
                  <p className={styles.empty}>هنوز ثبت دوره‌ای ندارید.</p>
                )}
              </div>
            </section>
            <section className={styles.chartCard}>
              <h3>
                <Flame size={14} />
                انرژی، خواب، پایبندی
              </h3>
              <div className={styles.chartBox}>
                {radarData.datasets.length ? (
                  <Radar
                    data={radarData}
                    options={{
                      ...chartOpts,
                      scales: {
                        r: {
                          min: 0,
                          max: 5,
                          ticks: { stepSize: 1, font: { family: 'inherit' } },
                          pointLabels: { font: { family: 'inherit', size: 11 } },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className={styles.empty}>بعد از اولین ثبت دیده می‌شود.</p>
                )}
              </div>
            </section>
            <section className={styles.chartCard}>
              <h3>
                <Sparkles size={14} />
                جمع‌بندی دوره‌ها
              </h3>
              <div className={styles.chartBox}>
                {(kpis.logs_count || 0) > 0 ? (
                  <Doughnut data={doughnutData} options={{ ...chartOpts, scales: undefined }} />
                ) : (
                  <p className={styles.empty}>بعد از ثبت دوره‌ها پر می‌شود.</p>
                )}
              </div>
            </section>
          </div>

          <div className={styles.split}>
            <section className={styles.listCard}>
              <h3>
                <Sparkles size={14} />
                محاسن
              </h3>
              {(summary?.strengths || []).length ? (
                (summary.strengths || []).map((item, i) => (
                  <div key={`s-${i}`} className={styles.goodItem}>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                ))
              ) : (
                <p className={styles.empty}>هنوز نقطه قوتی ثبت نشده.</p>
              )}
            </section>
            <section className={styles.listCard}>
              <h3>
                <AlertTriangle size={14} />
                معایب و محل مشکل
              </h3>
              {(summary?.issues || []).length ? (
                (summary.issues || []).map((item, i) => (
                  <div key={`i-${i}`} className={styles.badItem}>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                ))
              ) : (
                <p className={styles.empty}>مشکل مشخصی دیده نشد.</p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}
