'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  AlertTriangle, ArrowLeft, Brain, FolderOpen, HeartHandshake,
  Sparkles, Users, ClipboardList, Activity,
} from 'lucide-react'
import styles from './School.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const FONT = { family: "iran, Tahoma, sans-serif", size: 10 }
const FONT_B = { family: "iran_bold, iran, Tahoma, sans-serif", size: 10, weight: '400' }

const KIND_META = {
  iq: { label: 'IQ', color: '#2563eb' },
  eq: { label: 'EQ', color: '#e11d48' },
  personality: { label: 'شخصیت', color: '#7c3aed' },
  career: { label: 'هدایت', color: '#0d9488' },
  interest: { label: 'علاقه', color: '#d97706' },
  custom: { label: 'سایر', color: '#64748b' },
}

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

function pctOf(score, max) {
  const m = Number(max) || 0
  if (!m) return 0
  return Math.round((Number(score) / m) * 100)
}

function relativeFa(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'همین حالا'
  if (m < 60) return `${faNum(m)} دقیقه پیش`
  const h = Math.floor(m / 60)
  if (h < 24) return `${faNum(h)} ساعت پیش`
  const d = Math.floor(h / 24)
  return `${faNum(d)} روز پیش`
}

const chartPlugins = {
  legend: {
    position: 'bottom',
    rtl: true,
    labels: { font: FONT_B, boxWidth: 8, padding: 8, color: '#568d66' },
  },
  tooltip: {
    rtl: true,
    titleFont: FONT_B,
    bodyFont: FONT,
  },
}

export default function CounselorOverviewPanel({
  data,
  onNavigate,
  onOpenFile,
}) {
  const stats = data?.stats || {}
  const recentFiles = data?.recent_files || []
  const recentTeacherFiles = data?.recent_teacher_files || []
  const recentAttempts = data?.recent_attempts || []

  const highRiskFiles = useMemo(() => {
    const rows = [
      ...recentFiles.map((f) => ({ ...f, scope: 'students', name: f.student_name })),
      ...recentTeacherFiles.map((f) => ({ ...f, scope: 'teachers', name: f.teacher_name })),
    ].filter((f) => f.risk_level === 'high' || f.risk_level === 'medium')
    return rows.slice(0, 8)
  }, [recentFiles, recentTeacherFiles])

  const kindStats = useMemo(() => {
    const map = {}
    recentAttempts.forEach((a) => {
      const k = a.test_kind || 'custom'
      if (!map[k]) map[k] = { n: 0, sum: 0, label: a.test_kind_label || KIND_META[k]?.label || k }
      map[k].n += 1
      map[k].sum += pctOf(a.score, a.max_score)
    })
    return Object.entries(map).map(([key, v]) => ({
      key,
      label: v.label,
      count: v.n,
      avg: v.n ? Math.round(v.sum / v.n) : 0,
      color: KIND_META[key]?.color || KIND_META.custom.color,
    }))
  }, [recentAttempts])

  const barData = useMemo(() => ({
    labels: kindStats.map((k) => k.label),
    datasets: [{
      label: 'میانگین٪',
      data: kindStats.map((k) => k.avg),
      backgroundColor: kindStats.map((k) => k.color),
      borderRadius: 8,
      maxBarThickness: 28,
    }],
  }), [kindStats])

  const doughnutData = useMemo(() => {
    if (!kindStats.length) {
      return {
        labels: ['بدون داده'],
        datasets: [{ data: [1], backgroundColor: ['#e2e8f0'], borderWidth: 0 }],
      }
    }
    return {
      labels: kindStats.map((k) => k.label),
      datasets: [{
        data: kindStats.map((k) => k.count),
        backgroundColor: kindStats.map((k) => k.color),
        borderWidth: 0,
        hoverOffset: 4,
      }],
    }
  }, [kindStats])

  const kpis = [
    {
      key: 'students',
      label: 'پرونده دانش‌آموز',
      value: stats.student_files ?? 0,
      icon: Users,
      tab: 'files',
      tone: '',
    },
    {
      key: 'teachers',
      label: 'پرونده معلم',
      value: stats.teacher_files ?? 0,
      icon: HeartHandshake,
      tab: 'files',
      tone: '',
    },
    {
      key: 'tests',
      label: 'آزمون فعال',
      value: stats.tests ?? 0,
      icon: Brain,
      tab: 'tests',
      tone: '',
    },
    {
      key: 'risk',
      label: 'نیاز به پیگیری',
      value: stats.high_risk ?? 0,
      icon: AlertTriangle,
      tab: 'followup',
      tone: styles.copKpiWarn,
    },
  ]

  return (
    <div className={styles.cop} dir="rtl" lang="fa">
      <header className={styles.copHead}>
        <div>
          <p className={styles.copEyebrow}>میز کار مشاور</p>
          <h2 className={styles.copTitle}>نمای کلی مشاوره مدرسه</h2>
          <p className={styles.copDesc}>
            وضعیت پرونده‌ها، آزمون‌ها و موارد پیگیری — برای اقدام سریع
          </p>
        </div>
        <div className={styles.copHeadActions}>
          <button type="button" className={styles.btnAccent} onClick={() => onNavigate?.('followup')}>
            <AlertTriangle size={14} /> صف پیگیری
          </button>
          <button type="button" className={styles.btnGhost} onClick={() => onNavigate?.('tests')}>
            <Brain size={14} /> آزمون‌ها
          </button>
        </div>
      </header>

      <div className={styles.copKpiGrid}>
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <button
              key={k.key}
              type="button"
              className={`${styles.copKpi} ${k.tone || ''}`}
              onClick={() => onNavigate?.(k.tab)}
            >
              <span className={styles.copKpiIcon} aria-hidden><Icon size={16} /></span>
              <span className={styles.copKpiLabel}>{k.label}</span>
              <strong className={styles.copKpiValue}>{faNum(k.value)}</strong>
              <em className={styles.copKpiGo}>مشاهده <ArrowLeft size={12} /></em>
            </button>
          )
        })}
      </div>

      <div className={styles.copQuick}>
        <button type="button" className={styles.copQuickBtn} onClick={() => onNavigate?.('files')}>
          <FolderOpen size={15} /> باز کردن پرونده‌ها
        </button>
        <button type="button" className={styles.copQuickBtn} onClick={() => onNavigate?.('attempts')}>
          <ClipboardList size={15} /> نتایج آزمون‌ها
        </button>
        <button type="button" className={styles.copQuickBtn} onClick={() => onNavigate?.('people')}>
          <Users size={15} /> فهرست افراد
        </button>
        <button type="button" className={styles.copQuickBtn} onClick={() => onNavigate?.('profile')}>
          <Sparkles size={15} /> معرفی مشاور
        </button>
      </div>

      <div className={styles.copGrid}>
        <section className={styles.copCard}>
          <header className={styles.copCardHead}>
            <h3><AlertTriangle size={15} /> صف پیگیری فوری</h3>
            <button type="button" className={styles.btnGhost} onClick={() => onNavigate?.('followup')}>
              همه
            </button>
          </header>
          {!highRiskFiles.length ? (
            <p className={styles.copEmpty}>مورد پرریسکی در فهرست اخیر نیست</p>
          ) : (
            <ul className={styles.copList}>
              {highRiskFiles.map((f) => (
                <li key={`${f.scope}-${f.id}`}>
                  <button
                    type="button"
                    className={styles.copListBtn}
                    onClick={() => onOpenFile?.(f.scope, f.id)}
                  >
                    <span className={`${styles.copRisk} ${styles[`copRisk_${f.risk_level}`] || ''}`}>
                      {f.risk_label || f.risk_level}
                    </span>
                    <strong>{f.name}</strong>
                    <em>{f.scope === 'teachers' ? 'معلم' : 'دانش‌آموز'}</em>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.copCard}>
          <header className={styles.copCardHead}>
            <h3><Activity size={15} /> پوشش انواع آزمون</h3>
          </header>
          <div className={styles.copChartBox}>
            {kindStats.length ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: chartPlugins,
                  cutout: '62%',
                }}
              />
            ) : (
              <p className={styles.copEmpty}>هنوز نتیجه‌ای ثبت نشده</p>
            )}
          </div>
        </section>

        <section className={`${styles.copCard} ${styles.copCardWide}`}>
          <header className={styles.copCardHead}>
            <h3><Brain size={15} /> میانگین نتیجه بر اساس نوع</h3>
          </header>
          <div className={styles.copChartBoxTall}>
            {kindStats.length ? (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { ...chartPlugins, legend: { display: false } },
                  scales: {
                    x: {
                      ticks: { font: FONT, color: '#568d66' },
                      grid: { display: false },
                    },
                    y: {
                      min: 0,
                      max: 100,
                      ticks: { font: FONT, color: '#568d66' },
                      grid: { color: 'rgba(0,71,51,0.08)' },
                    },
                  },
                }}
              />
            ) : (
              <p className={styles.copEmpty}>برای نمودار، چند آزمون باید ثبت شود</p>
            )}
          </div>
        </section>

        <section className={styles.copCard}>
          <header className={styles.copCardHead}>
            <h3><FolderOpen size={15} /> پرونده‌های اخیر</h3>
            <button type="button" className={styles.btnGhost} onClick={() => onNavigate?.('files')}>
              پرونده‌ها
            </button>
          </header>
          <ul className={styles.copList}>
            {recentFiles.slice(0, 5).map((f) => (
              <li key={`s-${f.id}`}>
                <button
                  type="button"
                  className={styles.copListBtn}
                  onClick={() => onOpenFile?.('students', f.id)}
                >
                  <strong>{f.student_name}</strong>
                  <em>{f.risk_label || 'عادی'}</em>
                </button>
              </li>
            ))}
            {recentTeacherFiles.slice(0, 3).map((f) => (
              <li key={`t-${f.id}`}>
                <button
                  type="button"
                  className={styles.copListBtn}
                  onClick={() => onOpenFile?.('teachers', f.id)}
                >
                  <strong>{f.teacher_name}</strong>
                  <em>معلم · {f.risk_label || 'عادی'}</em>
                </button>
              </li>
            ))}
            {!recentFiles.length && !recentTeacherFiles.length ? (
              <li><p className={styles.copEmpty}>پرونده‌ای نیست</p></li>
            ) : null}
          </ul>
        </section>

        <section className={styles.copCard}>
          <header className={styles.copCardHead}>
            <h3><ClipboardList size={15} /> نتایج اخیر</h3>
            <button type="button" className={styles.btnGhost} onClick={() => onNavigate?.('attempts')}>
              همه نتایج
            </button>
          </header>
          <ul className={styles.copList}>
            {recentAttempts.slice(0, 8).map((a) => {
              const pct = pctOf(a.score, a.max_score)
              const color = KIND_META[a.test_kind]?.color || KIND_META.custom.color
              return (
                <li key={a.id}>
                  <div className={styles.copAttempt}>
                    <span className={styles.copAttemptKind} style={{ '--cop-kind': color }}>
                      {a.test_kind_label || KIND_META[a.test_kind]?.label || 'آزمون'}
                    </span>
                    <strong>{a.student_name}</strong>
                    <em>{a.test_title}</em>
                    <span className={styles.copAttemptScore} style={{ color }}>
                      {faNum(pct)}٪
                    </span>
                    <small>{relativeFa(a.submitted_at || a.created_at)}</small>
                  </div>
                </li>
              )
            })}
            {!recentAttempts.length ? (
              <li><p className={styles.copEmpty}>نتیجه‌ای نیست</p></li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  )
}
