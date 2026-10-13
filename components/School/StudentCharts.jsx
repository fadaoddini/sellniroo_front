'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import styles from './School.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
)

const TEAL = '#b89200'
const TEAL_SOFT = 'rgba(232, 184, 0, 0.65)'
const TEAL_FILL = 'rgba(232, 184, 0, 0.16)'
const MUTED = '#9aa1ab'
const OK = '#1a9a52'
const WARN = '#c47a2e'
const LINE = 'rgba(20, 24, 31, 0.08)'

function faTick(v) {
  if (v == null || Number.isNaN(Number(v))) return ''
  return Number(v).toLocaleString('fa-IR')
}

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      rtl: true,
      labels: {
        font: { family: 'inherit', size: 11 },
        boxWidth: 10,
        padding: 14,
        color: '#5e6f6c',
        textAlign: 'right',
      },
    },
    tooltip: {
      rtl: true,
      textDirection: 'rtl',
      titleFont: { family: 'inherit' },
      bodyFont: { family: 'inherit' },
      callbacks: {
        label(ctx) {
          const name = ctx.label || ctx.dataset?.label || ''
          const raw = typeof ctx.parsed === 'object' && ctx.parsed
            ? (ctx.parsed.y ?? ctx.parsed.r ?? ctx.raw)
            : (ctx.parsed ?? ctx.raw)
          return `${name ? `${name}: ` : ''}${faTick(raw)}`
        },
      },
    },
  },
}

function ChartCard({ title, children, empty, bodyClassName, className }) {
  return (
    <div className={`${styles.chartCard}${className ? ` ${className}` : ''}`}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {empty ? (
        <p className={styles.chartEmpty}>هنوز داده‌ای برای نمایش نیست</p>
      ) : (
        <div className={bodyClassName || styles.chartBody}>{children}</div>
      )}
    </div>
  )
}

export default function StudentCharts({ charts, mode = 'full' }) {
  const trend = charts?.score_trend || []
  const subjects = charts?.subject_averages || []
  const hw = charts?.homework || {}
  const quiz = charts?.quiz_summary || {}
  const compact = mode === 'results'
  const stack = mode === 'stack'

  const lineData = useMemo(() => ({
    labels: trend.map((r) => r.label || 'آزمون'),
    datasets: [{
      label: 'درصد آزمون',
      data: trend.map((r) => r.percentage),
      borderColor: TEAL,
      backgroundColor: TEAL_FILL,
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: TEAL,
      borderWidth: 2.5,
    }],
  }), [trend])

  const barData = useMemo(() => ({
    labels: subjects.map((s) => s.subject),
    datasets: [{
      label: 'میانگین درصد',
      data: subjects.map((s) => s.avg),
      backgroundColor: subjects.map((_, i) => (i % 2 === 0 ? TEAL_SOFT : 'rgba(184, 106, 42, 0.55)')),
      borderRadius: 8,
      maxBarThickness: 36,
    }],
  }), [subjects])

  const doughnutData = useMemo(() => {
    const approved = hw.approved || 0
    const submitted = hw.submitted || 0
    const pending = hw.pending || 0
    return {
      labels: ['تأییدشده', 'ارسال‌شده', 'باقی‌مانده'],
      datasets: [{
        data: [approved, submitted, pending],
        backgroundColor: [OK, WARN, MUTED],
        borderWidth: 0,
        hoverOffset: 4,
      }],
    }
  }, [hw])

  const quizDonut = useMemo(() => ({
    labels: ['داده‌شده', 'باقی‌مانده'],
    datasets: [{
      data: [quiz.taken || 0, quiz.pending || 0],
      backgroundColor: [TEAL, 'rgba(15, 92, 92, 0.18)'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }), [quiz])

  const radarData = useMemo(() => {
    const labels = subjects.length
      ? subjects.slice(0, 6).map((s) => s.subject)
      : ['معدل', 'تکالیف', 'آزمون', 'فعالیت']
    const values = subjects.length
      ? subjects.slice(0, 6).map((s) => s.avg)
      : [
        quiz.avg_percent || 0,
        hw.total ? Math.round(((hw.approved || 0) / hw.total) * 100) : 0,
        quiz.taken ? Math.min(100, (quiz.taken / Math.max(1, (quiz.taken || 0) + (quiz.pending || 0))) * 100) : 0,
        Math.min(100, (quiz.avg_percent || 0)),
      ]
    return {
      labels,
      datasets: [{
        label: 'عملکرد',
        data: values,
        backgroundColor: TEAL_FILL,
        borderColor: TEAL,
        pointBackgroundColor: TEAL,
        borderWidth: 2,
      }],
    }
  }, [subjects, quiz, hw])

  const hasHw = (hw.total || 0) > 0 || (hw.approved || 0) + (hw.submitted || 0) + (hw.pending || 0) > 0
  const hasQuizPie = (quiz.taken || 0) + (quiz.pending || 0) > 0

  const statusBodyClass = stack ? styles.chartBodySm : undefined
  const mainBodyClass = stack ? styles.chartBodyStackMain : undefined

  const statusCards = !compact ? (
    <>
      <ChartCard title="وضعیت تکالیف" empty={!hasHw} bodyClassName={statusBodyClass}>
        <Doughnut data={doughnutData} options={{ ...baseOpts, cutout: '62%' }} />
      </ChartCard>

      <ChartCard title="وضعیت آزمون‌ها" empty={!hasQuizPie} bodyClassName={statusBodyClass}>
        <Doughnut data={quizDonut} options={{ ...baseOpts, cutout: '62%' }} />
      </ChartCard>
    </>
  ) : null

  return (
    <div
      className={`${styles.chartGrid} ${compact ? styles.chartGridCompact : ''} ${stack ? styles.chartGridStack : ''}`}
    >
      {stack ? statusCards : null}

      <ChartCard
        title="روند نمرات آزمون"
        empty={!trend.length}
        bodyClassName={mainBodyClass}
        className={stack ? styles.chartCardStackMain : undefined}
      >
        <Line
          data={lineData}
          options={{
            ...baseOpts,
            scales: {
              y: {
                min: 0,
                max: 100,
                grid: { color: LINE },
                ticks: {
                  font: { family: 'inherit', size: 11 },
                  color: '#5e6f6c',
                  callback: (v) => faTick(v),
                },
              },
              x: {
                grid: { display: false },
                ticks: { font: { family: 'inherit', size: 10 }, color: '#5e6f6c', maxRotation: 0 },
              },
            },
          }}
        />
      </ChartCard>

      <ChartCard
        title="میانگین به تفکیک درس"
        empty={!subjects.length}
        bodyClassName={mainBodyClass}
        className={stack ? styles.chartCardStackMain : undefined}
      >
        <Bar
          data={barData}
          options={{
            ...baseOpts,
            plugins: { ...baseOpts.plugins, legend: { display: false } },
            scales: {
              y: {
                min: 0,
                max: 100,
                grid: { color: LINE },
                ticks: {
                  font: { family: 'inherit', size: 11 },
                  color: '#5e6f6c',
                  callback: (v) => faTick(v),
                },
              },
              x: {
                grid: { display: false },
                ticks: { font: { family: 'inherit', size: 10 }, color: '#5e6f6c' },
              },
            },
          }}
        />
      </ChartCard>

      {!stack ? statusCards : null}

      {!compact && !stack ? (
        <ChartCard title="نمای راداری عملکرد" empty={false}>
          <Radar
            data={radarData}
            options={{
              ...baseOpts,
              scales: {
                r: {
                  min: 0,
                  max: 100,
                  ticks: { display: false, stepSize: 25 },
                  grid: { color: LINE },
                  pointLabels: {
                    font: { family: 'inherit', size: 11 },
                    color: '#5e6f6c',
                  },
                  angleLines: { color: LINE },
                },
              },
            }}
          />
        </ChartCard>
      ) : null}
    </div>
  )
}
