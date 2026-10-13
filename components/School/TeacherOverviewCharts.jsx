'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styles from './School.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const LINE = 'rgba(20, 24, 31, 0.08)'
const GOLD = 'rgba(232, 184, 0, 0.72)'
const WARN = 'rgba(196, 122, 46, 0.7)'
const OK = 'rgba(26, 154, 82, 0.7)'

const SUBJECT_PALETTE = [
  'rgba(232, 184, 0, 0.75)',
  'rgba(184, 106, 42, 0.7)',
  'rgba(46, 125, 140, 0.7)',
  'rgba(120, 90, 180, 0.65)',
  'rgba(70, 130, 90, 0.7)',
  'rgba(180, 70, 90, 0.65)',
  'rgba(90, 110, 160, 0.7)',
  'rgba(150, 120, 60, 0.7)',
]

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
        font: { family: 'inherit', size: 10 },
        boxWidth: 10,
        padding: 10,
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
          const name = ctx.dataset?.label || ctx.label || ''
          const raw = typeof ctx.parsed === 'object' && ctx.parsed
            ? (ctx.parsed.y ?? ctx.parsed.x ?? ctx.raw)
            : (ctx.parsed ?? ctx.raw)
          return `${name ? `${name}: ` : ''}${faTick(raw)}٪`
        },
      },
    },
  },
}

function ChartCard({ title, subtitle, children, empty }) {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {subtitle ? <p className={styles.teacherChartSub}>{subtitle}</p> : null}
      {empty ? (
        <p className={styles.chartEmpty}>هنوز داده‌ای برای نمایش نیست</p>
      ) : (
        <div className={styles.chartBodyTall}>{children}</div>
      )}
    </div>
  )
}

function InsightList({ title, items, tone = 'ok' }) {
  return (
    <div className={`${styles.teacherInsightBox} ${tone === 'warn' ? styles.teacherInsightWarn : ''}`}>
      <strong>{title}</strong>
      {!items.length ? (
        <p className={styles.metaMuted}>داده‌ای نیست</p>
      ) : (
        <ul className={styles.teacherInsightList}>
          {items.map((row) => (
            <li key={`${row.subject}-${row.student_name}`}>
              <span
                className={styles.teacherInsightDot}
                style={{ background: row.color || '#e8b800' }}
                aria-hidden
              />
              <div>
                <em>{row.subject}</em>
                <span>
                  {row.student_name}
                  {' · '}
                  {faTick(row.avg)}٪
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TeacherOverviewCharts({ charts }) {
  const students = charts?.student_averages || []
  const subjects = charts?.subject_averages || []
  const matrix = charts?.student_subject_matrix || []
  const strengths = charts?.strengths || []
  const weaknesses = charts?.weaknesses || []

  const studentBar = useMemo(() => {
    const rows = [...students].slice(0, 12).reverse()
    return {
      labels: rows.map((s) => s.student_name),
      datasets: [{
        label: 'میانگین',
        data: rows.map((s) => s.avg),
        backgroundColor: rows.map((s) => (
          s.avg >= 70 ? OK : s.avg >= 50 ? GOLD : WARN
        )),
        borderRadius: 6,
        maxBarThickness: 22,
      }],
    }
  }, [students])

  const subjectBar = useMemo(() => ({
    labels: subjects.map((s) => s.subject),
    datasets: [{
      label: 'میانگین کلاس',
      data: subjects.map((s) => s.avg),
      backgroundColor: subjects.map((s, i) => s.color || SUBJECT_PALETTE[i % SUBJECT_PALETTE.length]),
      borderRadius: 8,
      maxBarThickness: 36,
    }],
  }), [subjects])

  const matrixBar = useMemo(() => {
    const rows = matrix.slice(0, 8)
    const subjectNames = []
    const seen = new Set()
    rows.forEach((r) => {
      (r.subjects || []).forEach((s) => {
        if (!seen.has(s.subject)) {
          seen.add(s.subject)
          subjectNames.push(s.subject)
        }
      })
    })
    const limitedSubjects = subjectNames.slice(0, 6)
    return {
      labels: rows.map((r) => r.student_name),
      datasets: limitedSubjects.map((subj, i) => ({
        label: subj,
        data: rows.map((r) => {
          const hit = (r.subjects || []).find((s) => s.subject === subj)
          return hit ? hit.avg : null
        }),
        backgroundColor: SUBJECT_PALETTE[i % SUBJECT_PALETTE.length],
        borderRadius: 4,
        maxBarThickness: 18,
      })),
    }
  }, [matrix])

  const scaleY = {
    min: 0,
    max: 100,
    grid: { color: LINE },
    ticks: {
      font: { family: 'inherit', size: 10 },
      color: '#5e6f6c',
      callback: (v) => faTick(v),
    },
  }
  const scaleX = {
    grid: { display: false },
    ticks: { font: { family: 'inherit', size: 10 }, color: '#5e6f6c' },
  }

  return (
    <div className={styles.teacherOverview}>
      <div className={styles.homeColHead}>
        <h2 className={styles.homeColTitle}>نمودار عملکرد دانش‌آموزان</h2>
      </div>
      <p className={styles.teacherOverviewLead}>
        ببینید هر دانش‌آموز در کدام درس قوی‌تر و در کدام درس ضعیف‌تر است.
      </p>

      <div className={styles.teacherChartsGrid}>
        <section className={styles.homeCol}>
          <ChartCard
            title="میانگین کل دانش‌آموزان"
            subtitle="رتبه‌بندی بر اساس میانگین همه آزمون‌ها"
            empty={!students.length}
          >
            <Bar
              data={studentBar}
              options={{
                ...baseOpts,
                indexAxis: 'y',
                plugins: { ...baseOpts.plugins, legend: { display: false } },
                scales: {
                  x: scaleY,
                  y: { ...scaleX, grid: { display: false } },
                },
              }}
            />
          </ChartCard>
        </section>

        <section className={styles.homeCol}>
          <ChartCard
            title="میانگین به تفکیک درس"
            subtitle="وضعیت کلاس در هر درس"
            empty={!subjects.length}
          >
            <Bar
              data={subjectBar}
              options={{
                ...baseOpts,
                plugins: { ...baseOpts.plugins, legend: { display: false } },
                scales: { y: scaleY, x: scaleX },
              }}
            />
          </ChartCard>
        </section>

        <section className={styles.homeCol}>
          <ChartCard
            title="دانش‌آموز × درس"
            subtitle="مقایسه عملکرد هر نفر در دروس مختلف"
            empty={!matrix.length || !(matrixBar.datasets || []).length}
          >
            <Bar
              data={matrixBar}
              options={{
                ...baseOpts,
                scales: { y: scaleY, x: scaleX },
              }}
            />
          </ChartCard>
        </section>
      </div>

      <div className={styles.teacherInsightGrid}>
        <InsightList title="قوی‌ترین در هر درس" items={strengths} tone="ok" />
        <InsightList title="ضعیف‌ترین در هر درس" items={weaknesses} tone="warn" />
        <div className={styles.teacherInsightBox}>
          <strong>خلاصه فردی</strong>
          {!matrix.length ? (
            <p className={styles.metaMuted}>بعد از ثبت چند آزمون اینجا پر می‌شود</p>
          ) : (
            <ul className={styles.teacherInsightList}>
              {matrix.slice(0, 8).map((row) => (
                <li key={row.student_id}>
                  <span className={styles.teacherInsightDot} style={{ background: GOLD }} aria-hidden />
                  <div>
                    <em>{row.student_name}</em>
                    <span>
                      قوی:
                      {' '}
                      {row.best_subject}
                      {' '}
                      (
                      {faTick(row.best_avg)}
                      ٪) · ضعیف:
                      {' '}
                      {row.weak_subject}
                      {' '}
                      (
                      {faTick(row.weak_avg)}
                      ٪)
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
