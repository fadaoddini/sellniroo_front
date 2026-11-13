'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Loader2,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
  UserRound,
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
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import karmandanService from '../services/karmandanService'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../styles/SaleAnalytics.module.css'
import actStyles from '../styles/SaleActivityReport.module.css'

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

export default function SaleActivityReport() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkingEmployee,
    employeeData,
    hasPermission,
  } = useAuth()

  const accessLevel = Number(employeeData?.access_level ?? user?.access_level ?? 0)
  const isSaleManager = !!user?.is_superuser || accessLevel >= 3
  const hasSaleAccess =
    isSaleManager ||
    !!employeeData?.is_marketing ||
    !!employeeData?.is_sales ||
    hasPermission?.('marketing') ||
    hasPermission?.('sales') ||
    !!user?.is_superuser

  const queryEmployeeId = searchParams.get('employee_id') || ''

  const [days, setDays] = useState(90)
  const [employeeId, setEmployeeId] = useState(queryEmployeeId)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setEmployeeId(queryEmployeeId)
  }, [queryEmployeeId])

  useEffect(() => {
    if (authLoading || checkingEmployee) return
    if (!isAuthenticated) {
      router.replace('/login?next=/sale/activity')
      return
    }
    if (!hasSaleAccess) {
      router.replace('/sale')
    }
  }, [authLoading, checkingEmployee, isAuthenticated, hasSaleAccess, router])

  useEffect(() => {
    if (!hasSaleAccess) return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = { days }
        if (isSaleManager && employeeId) params.employee_id = employeeId
        const res = await karmandanService.getEmployeeActivity(params)
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
            err?.message || err?.error || detailText || 'بارگذاری گزارش فعالیت ناموفق بود'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hasSaleAccess, isSaleManager, days, employeeId, reloadKey])

  const overview = data?.overview
  const employee = data?.employee
  const weekly = data?.weekly || []
  const funnel = data?.funnel || []
  const regression = data?.regression || {}
  const insights = data?.insights || []
  const actionBreakdown = data?.action_breakdown || []
  const recentActivity = data?.recent_activity || []
  const staffOptions = data?.staff_options || []

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

  const actionData = useMemo(
    () => ({
      labels: actionBreakdown.map((a) => a.label),
      datasets: [
        {
          label: 'تعداد',
          data: actionBreakdown.map((a) => a.count),
          backgroundColor: '#0f766e',
          borderRadius: 8,
          barThickness: 18,
        },
      ],
    }),
    [actionBreakdown]
  )

  const onSelectEmployee = (id) => {
    setEmployeeId(id)
    const qs = new URLSearchParams()
    if (id) qs.set('employee_id', id)
    const next = qs.toString()
    router.replace(next ? `/sale/activity?${next}` : '/sale/activity')
  }

  if (authLoading || checkingEmployee || loading) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.loading}>
          <Loader2 size={22} className={styles.spin} />
          <p>در حال آماده‌سازی گزارش فعالیت...</p>
        </div>
      </div>
    )
  }

  if (!hasSaleAccess) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.gate}>
          <h2>دسترسی محدود</h2>
          <p>برای دیدن گزارش فعالیت باید دسترسی فروش داشته باشید.</p>
        </div>
      </div>
    )
  }

  const titleName = employee?.full_name || 'گزارش فعالیت'
  const isSelf = data?.is_self

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/sale')}>
            <ArrowRight size={14} />
            فروش
          </button>
          <div className={styles.titleBlock}>
            <h1>{isSelf ? 'گزارش فعالیت من' : `گزارش ${titleName}`}</h1>
            <p>
              {overview?.from && overview?.to
                ? `${new Date(overview.from).toLocaleDateString('fa-IR')} تا ${new Date(overview.to).toLocaleDateString('fa-IR')}`
                : 'تحلیل کامل لید، پیگیری و روند'}
            </p>
          </div>
        </div>
        <div className={styles.topRight}>
          {isSaleManager && staffOptions.length > 0 ? (
            <label className={actStyles.staffSelect}>
              <UserRound size={14} />
              <select
                value={employeeId || String(employee?.id || '')}
                onChange={(e) => onSelectEmployee(e.target.value)}
              >
                {staffOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                    {emp.employee_code ? ` · ${emp.employee_code}` : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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

      {employee ? (
        <section className={actStyles.heroCard}>
          <div className={actStyles.heroMain}>
            <div className={actStyles.heroAvatar}>
              {(employee.full_name || '?').slice(0, 1)}
            </div>
            <div>
              <h2>{employee.full_name}</h2>
              <p>
                {employee.employee_code ? `کد ${employee.employee_code}` : 'کارمند فروش'}
                {employee.mobile ? ` · ${employee.mobile}` : ''}
              </p>
            </div>
          </div>
          <div className={actStyles.heroMeta}>
            <span className={`${styles.badge} ${verdictClass[employee.verdict] || ''}`}>
              {employee.verdict_label}
            </span>
            <div className={actStyles.scoreBlock}>
              <strong>{(employee.score || 0).toLocaleString('fa-IR')}</strong>
              <span>امتیاز عملکرد</span>
            </div>
          </div>
          <p className={actStyles.heroText}>{employee.verdict_text}</p>
          <div className={actStyles.vsTeam}>
            <div>
              <b>
                {(employee.vs_team?.success_delta || 0) > 0 ? '+' : ''}
                {(employee.vs_team?.success_delta || 0).toLocaleString('fa-IR')}٪
              </b>
              <span>نسبت به میانگین موفقیت تیم</span>
            </div>
            <div>
              <b>
                {(employee.vs_team?.conversion_delta || 0) > 0 ? '+' : ''}
                {(employee.vs_team?.conversion_delta || 0).toLocaleString('fa-IR')}٪
              </b>
              <span>نسبت به میانگین تبدیل تیم</span>
            </div>
            <div>
              <b>
                {(employee.vs_team?.activity_delta || 0) > 0 ? '+' : ''}
                {(employee.vs_team?.activity_delta || 0).toLocaleString('fa-IR')}
              </b>
              <span>نسبت به میانگین فعالیت ۳۰روزه</span>
            </div>
          </div>
        </section>
      ) : null}

      <div className={styles.kpiWidgets}>
        <div className={`${styles.kpiWidget} ${styles.kpiInk}`}>
          <span className={styles.kpiLabel}>لید</span>
          <strong className={styles.kpiValue}>
            {(overview?.total_leads || 0).toLocaleString('fa-IR')}
          </strong>
          <em className={styles.kpiHint}>
            فعال {(overview?.active || 0).toLocaleString('fa-IR')}
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
          <span className={styles.kpiLabel}>پیگیری</span>
          <strong className={styles.kpiValue}>
            {(overview?.followups || 0).toLocaleString('fa-IR')}
          </strong>
          <em className={styles.kpiHint}>
            معوق {(overview?.overdue_followups || 0).toLocaleString('fa-IR')} · پیوست{' '}
            {(overview?.attachments || 0).toLocaleString('fa-IR')}
          </em>
        </div>
      </div>

      <div className={styles.triGrid}>
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
              {insights.slice(0, 5).map((ins, idx) => (
                <div
                  key={`${ins.title}-${idx}`}
                  className={`${styles.insight} ${insightClass[ins.type] || ''}`}
                >
                  <strong>{ins.title}</strong>
                  <p>{ins.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

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

        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>نوع فعالیت</h2>
              <span className={styles.panelSub}>تفکیک اقدام‌ها</span>
            </div>
            {actionBreakdown.length === 0 ? (
              <div className={styles.insight}>
                <strong>فعالیتي ثبت نشده</strong>
                <p>با ثبت پیگیری، نمودار نوع فعالیت پر می‌شود.</p>
              </div>
            ) : (
              <div className={`${styles.chartBox} ${styles.chartBoxTall}`}>
                <Bar
                  data={actionData}
                  options={{
                    ...chartDefaults,
                    indexAxis: 'y',
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>آخرین فعالیت‌ها</h2>
            </div>
            <div className={actStyles.activityList}>
              {recentActivity.length === 0 ? (
                <div className={styles.insight}>
                  <strong>موردی نیست</strong>
                  <p>هنوز پیگیری در این بازه ثبت نشده است.</p>
                </div>
              ) : (
                recentActivity.map((item) => (
                  <article key={item.id} className={actStyles.activityItem}>
                    <div className={actStyles.activityTop}>
                      <strong>{item.action_label}</strong>
                      <span>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('fa-IR')
                          : ''}
                      </span>
                    </div>
                    <div className={actStyles.activityLead}>{item.lead_title || 'بدون عنوان'}</div>
                    {item.description ? (
                      <p className={actStyles.activityDesc}>{item.description}</p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
