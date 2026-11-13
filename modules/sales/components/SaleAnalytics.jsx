'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Loader2,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
  Route,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import karmandanService from '../services/karmandanService'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../styles/SaleAnalytics.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
)

const RANGES = [
  { days: 30, label: '۳۰ روز' },
  { days: 90, label: '۹۰ روز' },
  { days: 180, label: '۱۸۰ روز' },
]

const verdictClass = {
  excellent: styles.badgeExcellent,
  on_track: styles.badgeOnTrack,
  needs_improvement: styles.badgeNeeds,
  slacking: styles.badgeSlacking,
  inactive: styles.badgeInactive,
}

const insightClass = {
  ok: styles.insightOk,
  warning: styles.insightWarning,
  danger: styles.insightDanger,
}

const trendIcon = (trend) => {
  if (trend === 'up') return <TrendingUp size={13} />
  if (trend === 'down') return <TrendingDown size={13} />
  return <Minus size={13} />
}

const trendClass = (trend) => {
  if (trend === 'up') return styles.trendUp
  if (trend === 'down') return styles.trendDown
  return styles.trendStable
}

const trendLabel = (trend) => {
  if (trend === 'up') return 'صعودی'
  if (trend === 'down') return 'نزولی'
  return 'پایدار'
}

const CHART_FONT = 'iran'

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: CHART_FONT, size: 10 },
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        padding: 12,
      },
    },
    tooltip: {
      titleFont: { family: CHART_FONT },
      bodyFont: { family: CHART_FONT },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: CHART_FONT, size: 10 }, color: '#94a3b8' },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(15,23,42,0.05)' },
      ticks: { font: { family: CHART_FONT, size: 10 }, color: '#94a3b8', precision: 0 },
      border: { display: false },
    },
  },
}

export default function SaleAnalytics() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkingEmployee,
    employeeData,
  } = useAuth()

  const accessLevel = Number(employeeData?.access_level ?? user?.access_level ?? 0)
  const isSaleManager = !!user?.is_superuser || accessLevel >= 3

  const [days, setDays] = useState(90)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading || checkingEmployee) return
    if (!isAuthenticated) {
      router.replace('/login?next=/sale/analytics')
      return
    }
    if (!isSaleManager) {
      router.replace('/sale')
    }
  }, [authLoading, checkingEmployee, isAuthenticated, isSaleManager, router])

  useEffect(() => {
    if (!isSaleManager) return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await karmandanService.getTeamAnalytics({ days })
        if (!cancelled) setData(res?.data || null)
      } catch (err) {
        if (!cancelled) {
          const detail = err?.detail
          const detailText = Array.isArray(detail)
            ? detail.join('، ')
            : typeof detail === 'string'
              ? detail
              : ''
          setError(
            err?.message || err?.error || detailText || 'بارگذاری گزارش ناموفق بود'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isSaleManager, days, reloadKey])

  const overview = data?.overview
  const employees = data?.employees || []
  const weekly = data?.weekly || []
  const funnel = data?.funnel || []
  const regression = data?.regression || {}
  const insights = data?.insights || []

  const lineData = useMemo(() => {
    const labels = weekly.map((w) => w.label)
    return {
      labels,
      datasets: [
        {
          label: 'ورود',
          data: weekly.map((w) => w.leads),
          borderColor: '#0f172a',
          backgroundColor: 'rgba(15,23,42,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'قرارداد',
          data: weekly.map((w) => w.confirmed),
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15,118,110,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'پیگیری',
          data: weekly.map((w) => w.followups),
          borderColor: '#b45309',
          backgroundColor: 'transparent',
          borderDash: [5, 4],
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
        },
      ],
    }
  }, [weekly])

  const funnelData = useMemo(
    () => ({
      labels: funnel.map((f) => f.label),
      datasets: [
        {
          data: funnel.map((f) => f.count),
          backgroundColor: ['#93c5fd', '#fcd34d', '#5eead4', '#fda4af'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }),
    [funnel]
  )

  if (authLoading || checkingEmployee || loading) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.loading}>
          <Loader2 size={22} className={styles.spin} />
          <p>در حال آماده‌سازی گزارش...</p>
        </div>
      </div>
    )
  }

  if (!isSaleManager) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.gate}>
          <h2>دسترسی محدود</h2>
          <p>فقط مدیر می‌تواند گزارش کارمندان را ببیند.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/sale')}>
            <ArrowRight size={14} />
            فروش
          </button>
          <div className={styles.titleBlock}>
            <h1>گزارش فروش</h1>
            <p>
              {overview?.from && overview?.to
                ? `${new Date(overview.from).toLocaleDateString('fa-IR')} تا ${new Date(overview.to).toLocaleDateString('fa-IR')}`
                : 'نمای کلی تیم و مسیر موارد'}
            </p>
          </div>
        </div>
        <div className={styles.topRight}>
          <div className={styles.rangeToggle}>
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                className={days === r.days ? styles.rangeActive : ''}
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => setReloadKey((k) => k + 1)}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error ? <div className={styles.err}>{error}</div> : null}

      <div className={styles.kpiWidgets}>
        <div className={`${styles.kpiWidget} ${styles.kpiInk}`}>
          <span className={styles.kpiLabel}>ورود لید</span>
          <strong className={styles.kpiValue}>
            {(overview?.total_leads || 0).toLocaleString('fa-IR')}
          </strong>
          <em className={styles.kpiHint}>
            فعال{' '}
            {(
              (overview?.new || 0) + (overview?.in_progress || 0)
            ).toLocaleString('fa-IR')}
          </em>
        </div>
        <div className={`${styles.kpiWidget} ${styles.kpiOk}`}>
          <span className={styles.kpiLabel}>موفقیت</span>
          <strong className={styles.kpiValue}>
            {(overview?.success_rate || 0).toLocaleString('fa-IR')}٪
          </strong>
          <em className={styles.kpiHint}>
            {(overview?.confirmed || 0).toLocaleString('fa-IR')} قرارداد
          </em>
        </div>
        <div className={`${styles.kpiWidget} ${styles.kpiInfo}`}>
          <span className={styles.kpiLabel}>تبدیل</span>
          <strong className={styles.kpiValue}>
            {(overview?.conversion_rate || 0).toLocaleString('fa-IR')}٪
          </strong>
          <em className={styles.kpiHint}>
            لغو {(overview?.cancel_rate || 0).toLocaleString('fa-IR')}٪
          </em>
        </div>
        <div className={`${styles.kpiWidget} ${styles.kpiWarn}`}>
          <span className={styles.kpiLabel}>فعالیت</span>
          <strong className={styles.kpiValue}>
            {(overview?.followups || 0).toLocaleString('fa-IR')}
          </strong>
          <em className={styles.kpiHint}>
            {(overview?.active_staff || 0).toLocaleString('fa-IR')} نفر فعال
          </em>
        </div>
      </div>

      <div className={styles.triGrid}>
        {/* ستون ۱ — روند و نکته‌ها */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>روند</h2>
              <span className={styles.panelSub}>شیب هفتگی</span>
            </div>
            <div className={styles.trendList}>
              {[
                { key: 'leads', title: 'ورود', reg: regression.leads },
                { key: 'confirmed', title: 'قرارداد', reg: regression.confirmed },
                { key: 'followups', title: 'پیگیری', reg: regression.followups },
              ].map((item) => (
                <div key={item.key} className={styles.trendItem}>
                  <span>{item.title}</span>
                  <strong className={trendClass(item.reg?.trend)}>
                    {trendIcon(item.reg?.trend)}
                    {trendLabel(item.reg?.trend)}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>نکته‌ها</h2>
            </div>
            <div className={styles.insights}>
              {insights.length === 0 ? (
                <div className={styles.insight}>
                  <strong>داده کافی نیست</strong>
                  <p>با ثبت بیشتر، تحلیل دقیق‌تر می‌شود.</p>
                </div>
              ) : (
                insights.slice(0, 4).map((ins, idx) => (
                  <div
                    key={`${ins.title}-${idx}`}
                    className={`${styles.insight} ${insightClass[ins.type] || ''}`}
                  >
                    <strong>{ins.title}</strong>
                    <p>{ins.text}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ستون ۲ — نمودارها */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>سری زمانی</h2>
              <span className={styles.panelSub}>هفتگی</span>
            </div>
            <div className={`${styles.chartBox} ${styles.chartBoxTall}`}>
              <Line data={lineData} options={chartDefaults} />
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>قیف وضعیت</h2>
            </div>
            <div className={`${styles.chartBox} ${styles.chartBoxShort}`}>
              <Doughnut
                data={funnelData}
                options={{
                  ...chartDefaults,
                  cutout: '68%',
                  scales: undefined,
                  plugins: {
                    ...chartDefaults.plugins,
                    legend: { display: false },
                  },
                }}
              />
            </div>
            <div className={styles.funnelStrip}>
              {funnel.map((f) => (
                <div key={f.key || f.label} className={styles.funnelCell}>
                  <b>{(f.count || 0).toLocaleString('fa-IR')}</b>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ستون ۳ — تیم */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>تیم فروش</h2>
              <span className={styles.panelSub}>
                میانگین موفقیت {(overview?.team_success_avg || 0).toLocaleString('fa-IR')}٪
              </span>
            </div>
            <div className={styles.empList}>
              {employees.length === 0 ? (
                <div className={styles.insight}>
                  <strong>کارمند فعالی نیست</strong>
                  <p>دسترسی فروش را برای کارمندان فعال کنید.</p>
                </div>
              ) : (
                employees.map((emp) => (
                  <article
                    key={emp.id}
                    className={styles.empCard}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/sale/activity?employee_id=${emp.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/sale/activity?employee_id=${emp.id}`)
                      }
                    }}
                  >
                    <div className={styles.empTop}>
                      <div>
                        <h3 className={styles.empName}>{emp.full_name}</h3>
                        {emp.employee_code ? (
                          <div className={styles.empCode}>کد {emp.employee_code}</div>
                        ) : null}
                      </div>
                      <span className={`${styles.badge} ${verdictClass[emp.verdict] || ''}`}>
                        {emp.verdict_label}
                      </span>
                    </div>
                    <p className={styles.empText}>{emp.verdict_text}</p>
                    <div className={styles.metricRow}>
                      <div className={styles.metric}>
                        <b>{(emp.total_leads || 0).toLocaleString('fa-IR')}</b>
                        <span>لید</span>
                      </div>
                      <div className={styles.metric}>
                        <b>{(emp.confirmed || 0).toLocaleString('fa-IR')}</b>
                        <span>موفق</span>
                      </div>
                      <div className={styles.metric}>
                        <b>{(emp.success_rate || 0).toLocaleString('fa-IR')}٪</b>
                        <span>موفقیت</span>
                      </div>
                    </div>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreFill}
                        style={{ width: `${Math.max(4, emp.score || 0)}%` }}
                      />
                    </div>
                    <div className={styles.scoreMeta}>
                      امتیاز {(emp.score || 0).toLocaleString('fa-IR')} · روند{' '}
                      {trendLabel(emp.regression?.trend)} · جزئیات ←
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <button
        type="button"
        className={styles.monitorCta}
        onClick={() => router.push('/sale/monitor')}
      >
        <span>
          <Route size={16} />
          رصد مسیر موارد
        </span>
        <em>جستجو و مشاهده مرحله و گزارش هر مورد — تمام‌صفحه</em>
      </button>
    </div>
  )
}
