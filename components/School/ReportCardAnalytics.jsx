'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Crown,
  Gauge,
  GraduationCap,
  Hash,
  Medal,
  Minus,
  School,
  Sigma,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { MONTHS_FA, faNum, toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
)

const AVG_TAB = 'avg'

function fmtScore(v) {
  if (v == null || Number.isNaN(Number(v))) return '—'
  return faNum(Math.round(Number(v) * 100) / 100)
}

function mean(arr) {
  if (!arr.length) return null
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function median(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function stdev(arr) {
  if (arr.length < 2) return null
  const m = mean(arr)
  const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(v)
}

function linearRegression(points) {
  const n = points.length
  if (n < 2) return null
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let syy = 0
  points.forEach(([x, y]) => {
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    syy += y * y
  })
  const den = n * sxx - sx * sx
  if (!den) return null
  const slope = (n * sxy - sx * sy) / den
  const intercept = (sy - slope * sx) / n
  const ssTot = syy - (sy * sy) / n
  const ssRes = points.reduce((s, [x, y]) => {
    const pred = intercept + slope * x
    return s + (y - pred) ** 2
  }, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : null
  return { slope, intercept, r2, n }
}

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      rtl: true,
      labels: {
        font: { family: 'inherit', size: 10 },
        boxWidth: 8,
        padding: 8,
        color: '#64748b',
      },
    },
    tooltip: {
      rtl: true,
      textDirection: 'rtl',
      callbacks: {
        label(ctx) {
          const label = ctx.dataset?.label || ''
          const v = ctx.parsed?.y ?? ctx.raw
          return `${label ? `${label}: ` : ''}${faNum(v)}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { font: { family: 'inherit', size: 9 }, color: '#94a3b8', maxRotation: 0 },
      grid: { display: false },
    },
    y: {
      min: 0,
      max: 20,
      ticks: {
        font: { family: 'inherit', size: 9 },
        color: '#94a3b8',
        callback: (v) => faNum(v),
      },
      grid: { color: 'rgba(15,23,42,0.05)' },
    },
  },
}

function MetricChip({ Icon, label, value, tone }) {
  return (
    <div className={`${styles.rcAnChip} ${tone ? styles[`rcAnChip_${tone}`] || '' : ''}`}>
      <span className={styles.rcAnChipIcon}><Icon size={12} strokeWidth={2.2} /></span>
      <div>
        <em>{label}</em>
        <b>{value}</b>
      </div>
    </div>
  )
}

function StandingCard({
  Icon, title, subtitle, rank, total, metrics, accent,
}) {
  return (
    <article className={`${styles.rcAnStand} ${accent === 'grade' ? styles.rcAnStandGrade : ''}`}>
      <div className={styles.rcAnStandTop}>
        <span className={styles.rcAnStandIcon}><Icon size={15} strokeWidth={2.2} /></span>
        <div className={styles.rcAnStandTitles}>
          <strong>{title}</strong>
          <em>{subtitle || '—'}</em>
        </div>
        <div className={styles.rcAnStandRankBox}>
          {rank != null && total ? (
            <>
              <b>{toFaDigits(rank)}</b>
              <em>از {toFaDigits(total)}</em>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
      <div className={styles.rcAnChipRow}>
        {metrics.map((m) => (
          <MetricChip key={m.label} Icon={m.Icon} label={m.label} value={m.value} tone={m.tone} />
        ))}
      </div>
    </article>
  )
}

function SectionHead({ Icon, title, hint, color }) {
  return (
    <div className={styles.rcAnSecHead}>
      <span
        className={styles.rcAnSecIcon}
        style={color ? { background: `${color}22`, color } : undefined}
      >
        <Icon size={14} strokeWidth={2.2} />
      </span>
      <div>
        <strong>{title}</strong>
        {hint ? <em>{hint}</em> : null}
      </div>
    </div>
  )
}

function parentTrendCopy({ slope, r2, n }) {
  if (slope == null) return null

  const abs = Math.abs(slope)
  const step = faNum(Math.round(abs * 100) / 100)
  const months = n != null ? toFaDigits(n) : null

  let title
  let whatHappened
  if (slope > 0.15) {
    title = 'نمرات داره بهتر می‌شه'
    whatHappened = abs >= 1
      ? `تقریباً هر ماه حدود ${step} نمره جلو افتاده.`
      : `هر ماه کمی بهتر شده؛ حدود ${step} نمره در ماه.`
  } else if (slope < -0.15) {
    title = 'نمرات داره ضعیف‌تر می‌شه'
    whatHappened = abs >= 1
      ? `تقریباً هر ماه حدود ${step} نمره افت کرده.`
      : `هر ماه کمی افت داشته؛ حدود ${step} نمره در ماه.`
  } else {
    title = 'وضعیت تقریباً ثابت بوده'
    whatHappened = abs < 0.05
      ? 'از ماهی به ماه دیگه تغییر چشمگیری ندیده.'
      : `نوسان خیلی کم بوده (حدود ${step} نمره در ماه).`
  }

  let confidence = ''
  if (r2 != null) {
    if (r2 >= 0.85) {
      confidence = 'این الگو خیلی واضح و قابل‌اعتماد به نظر می‌رسه.'
    } else if (r2 >= 0.6) {
      confidence = 'تا حد خوبی این روند دیده می‌شه، ولی هنوز کمی نوسان داره.'
    } else if (r2 >= 0.35) {
      confidence = 'یک تمایل کلی دیده می‌شه، ولی نمرات کمی بالا و پایین بوده.'
    } else {
      confidence = 'هنوز الگو خیلی ثابت نیست؛ بهتره ماه‌های بعدی هم نگاه کنید.'
    }
  }

  let dataNote = ''
  if (months) {
    if (n < 3) {
      dataNote = `فعلاً فقط از ${months} ماه نمره داریم؛ با ماه‌های بیشتر تصویر دقیق‌تر می‌شه.`
    } else if (n <= 4) {
      dataNote = `این جمع‌بندی بر اساس ${months} ماه ثبت‌شده است.`
    } else {
      dataNote = `از روی ${months} ماه نمره به این نتیجه رسیدیم.`
    }
  }

  let tip = ''
  if (slope > 0.15) {
    tip = 'اگر همین روال ادامه پیدا کنه، ادامه تمرین و تشویق کمک می‌کنه.'
  } else if (slope < -0.15) {
    tip = 'بد نیست علت افت رو با معلم یا خود دانش‌آموز بررسی کنید.'
  } else {
    tip = 'برای جهش بهتر، یک هدف کوچک ماهانه باهاش بگذارید.'
  }

  return {
    title,
    body: [whatHappened, confidence, dataNote, tip].filter(Boolean).join(' '),
  }
}

function InsightBox({ slope, r2, intercept, n }) {
  const copy = parentTrendCopy({ slope, r2, intercept, n })
  if (!copy) return null
  return (
    <div className={styles.rcAnInsight}>
      <span className={styles.rcAnInsightIcon}>
        {slope > 0.15
          ? <TrendingUp size={14} />
          : slope < -0.15
            ? <TrendingDown size={14} />
            : <Minus size={14} />}
      </span>
      <div>
        <strong>{copy.title}</strong>
        <p>{copy.body}</p>
      </div>
    </div>
  )
}

function buildSubjectSeries(row) {
  const cells = row?.cells || []
  const filled = []
  cells.forEach((c) => {
    if (c?.score != null) {
      filled.push({ jm: c.jm, score: Number(c.score), prev: c.prev_score, trend: c.trend, delta: c.delta })
    }
  })
  const points = filled.map((m) => [m.jm, m.score])
  const regression = linearRegression(points)
  const scores = filled.map((m) => m.score)
  return {
    filled,
    regression,
    scores,
    stats: {
      count: scores.length,
      mean: mean(scores),
      median: median(scores),
      stdev: stdev(scores),
      min: scores.length ? Math.min(...scores) : null,
      max: scores.length ? Math.max(...scores) : null,
      up: filled.filter((c) => c.trend === 'up').length,
      down: filled.filter((c) => c.trend === 'down').length,
      stable: filled.filter((c) => c.trend === 'stable').length,
    },
  }
}

export default function ReportCardAnalytics({
  year,
  rows = [],
  monthAvgs = [],
  highlightJm = 1,
  standing = null,
}) {
  const subjectTabs = useMemo(
    () => rows.map((r) => ({
      id: String(r.subject_id),
      label: r.subject_title,
      color: r.color || '#2d5a45',
      row: r,
    })),
    [rows],
  )

  const [tab, setTab] = useState(AVG_TAB)

  useEffect(() => {
    if (tab !== AVG_TAB && !subjectTabs.some((t) => t.id === tab)) {
      setTab(AVG_TAB)
    }
  }, [tab, subjectTabs])

  const classSt = standing?.class || null
  const gradeSt = standing?.grade || null
  const subjectStandingMap = useMemo(() => {
    const map = {}
    ;(standing?.subjects || []).forEach((s) => {
      map[String(s.subject_id)] = s
    })
    return map
  }, [standing])

  const avgAnalytics = useMemo(() => {
    const subjectAvgs = rows
      .filter((r) => r.avg != null)
      .map((r) => ({
        title: r.subject_title,
        color: r.color || '#2d5a45',
        avg: r.avg,
      }))

    const monthSeries = monthAvgs
      .filter((m) => m.avg != null)
      .map((m) => ({ jm: m.jm, avg: Number(m.avg) }))

    const regression = linearRegression(monthSeries.map((m) => [m.jm, m.avg]))

    const allScores = rows.flatMap((r) => (r.cells || [])
      .filter((c) => c.score != null)
      .map((c) => Number(c.score)))

    const curCells = rows
      .map((r) => {
        const cur = r.cells?.[highlightJm - 1]
        if (cur?.score == null) return null
        const prev = highlightJm > 1 ? r.cells?.[highlightJm - 2] : null
        return {
          title: r.subject_title,
          color: r.color || '#2d5a45',
          score: Number(cur.score),
          prev: prev?.score != null ? Number(prev.score) : null,
          trend: cur.trend,
          delta: cur.delta,
        }
      })
      .filter(Boolean)

    return {
      subjectAvgs,
      monthSeries,
      regression,
      curCells,
      stats: {
        count: allScores.length,
        mean: mean(allScores),
        median: median(allScores),
        stdev: stdev(allScores),
        min: allScores.length ? Math.min(...allScores) : null,
        max: allScores.length ? Math.max(...allScores) : null,
        up: curCells.filter((c) => c.trend === 'up').length,
        down: curCells.filter((c) => c.trend === 'down').length,
        stable: curCells.filter((c) => c.trend === 'stable').length,
        subjects: rows.length,
      },
    }
  }, [rows, monthAvgs, highlightJm])

  const avgBarData = useMemo(() => ({
    labels: avgAnalytics.subjectAvgs.map((s) => s.title),
    datasets: [{
      label: 'میانگین سال',
      data: avgAnalytics.subjectAvgs.map((s) => s.avg),
      backgroundColor: avgAnalytics.subjectAvgs.map((s) => s.color),
      borderRadius: 5,
      maxBarThickness: 22,
    }],
  }), [avgAnalytics.subjectAvgs])

  const avgSeriesData = useMemo(() => {
    const avgByJm = Object.fromEntries(monthAvgs.map((m) => [m.jm, m.avg]))
    const avgData = MONTHS_FA.map((_, i) => {
      const v = avgByJm[i + 1]
      return v == null ? null : Number(v)
    })
    const datasets = [{
      label: 'معدل ماهانه',
      data: avgData,
      borderColor: '#2d5a45',
      backgroundColor: 'rgba(45, 90, 69, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 2.5,
      pointBackgroundColor: '#2d5a45',
      borderWidth: 2,
      spanGaps: true,
    }]

    if (avgAnalytics.regression && avgAnalytics.monthSeries.length >= 2) {
      const { slope, intercept } = avgAnalytics.regression
      const filledJms = new Set(avgAnalytics.monthSeries.map((m) => m.jm))
      datasets.push({
        label: 'رگرسیون',
        data: MONTHS_FA.map((_, i) => {
          const jm = i + 1
          return filledJms.has(jm) ? intercept + slope * jm : null
        }),
        borderColor: '#b45309',
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1.4,
        fill: false,
        tension: 0,
        spanGaps: true,
      })
    }
    return { labels: MONTHS_FA, datasets }
  }, [monthAvgs, avgAnalytics.regression, avgAnalytics.monthSeries])

  const activeSubject = subjectTabs.find((t) => t.id === tab) || null
  const subjectView = useMemo(() => {
    if (!activeSubject) return null
    const row = activeSubject.row
    const series = buildSubjectSeries(row)
    const color = activeSubject.color
    const stand = subjectStandingMap[activeSubject.id] || null

    const barData = {
      labels: MONTHS_FA,
      datasets: [{
        label: row.subject_title,
        data: (row.cells || []).map((c) => (c.score == null ? null : Number(c.score))),
        backgroundColor: color,
        borderRadius: 5,
        maxBarThickness: 18,
      }],
    }

    const lineData = {
      labels: MONTHS_FA,
      datasets: [{
        label: row.subject_title,
        data: (row.cells || []).map((c) => (c.score == null ? null : Number(c.score))),
        borderColor: color,
        backgroundColor: `${color}22`,
        fill: true,
        tension: 0.35,
        pointRadius: 2.5,
        pointBackgroundColor: color,
        borderWidth: 2,
        spanGaps: true,
      }],
    }

    if (series.regression && series.filled.length >= 2) {
      const { slope, intercept } = series.regression
      const filledJms = new Set(series.filled.map((m) => m.jm))
      lineData.datasets.push({
        label: 'رگرسیون',
        data: MONTHS_FA.map((_, i) => {
          const jm = i + 1
          return filledJms.has(jm) ? intercept + slope * jm : null
        }),
        borderColor: '#b45309',
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1.4,
        fill: false,
        tension: 0,
        spanGaps: true,
      })
    }

    const cur = row.cells?.[highlightJm - 1]
    const prev = highlightJm > 1 ? row.cells?.[highlightJm - 2] : null

    return {
      row,
      color,
      stand,
      series,
      barData,
      lineData,
      cur,
      prev,
    }
  }, [activeSubject, subjectStandingMap, highlightJm])

  const monthLabel = MONTHS_FA[highlightJm - 1]
  const st = avgAnalytics.stats

  const classMetrics = [
    { Icon: Gauge, label: 'معدل شما', value: fmtScore(classSt?.my_avg) },
    { Icon: Users, label: 'معدل کلاس', value: fmtScore(classSt?.avg) },
    { Icon: Crown, label: 'بالاترین معدل', value: fmtScore(classSt?.top_student_avg), tone: 'gold' },
    { Icon: Target, label: 'بالاترین نمره', value: fmtScore(classSt?.highest_score), tone: 'gold' },
  ]

  const gradeMetrics = [
    { Icon: Gauge, label: 'معدل شما', value: fmtScore(gradeSt?.my_avg) },
    { Icon: GraduationCap, label: 'معدل پایه', value: fmtScore(gradeSt?.avg) },
    { Icon: Crown, label: 'بالاترین معدل', value: fmtScore(gradeSt?.top_student_avg), tone: 'gold' },
    { Icon: Target, label: 'بالاترین نمره', value: fmtScore(gradeSt?.highest_score), tone: 'gold' },
  ]

  return (
    <div className={styles.rcAnalyticsPanel}>
      <nav className={styles.rcAnSubjectTabs} aria-label="انتخاب درس یا معدل">
        <button
          type="button"
          className={`${styles.rcAnSubjectTab} ${tab === AVG_TAB ? styles.rcAnSubjectTabOn : ''}`}
          onClick={() => setTab(AVG_TAB)}
        >
          <span className={styles.rcAnSubjectDot} style={{ background: '#2d5a45' }} />
          <Gauge size={13} strokeWidth={2.2} />
          <span>معدل</span>
        </button>
        {subjectTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.rcAnSubjectTab} ${tab === t.id ? styles.rcAnSubjectTabOn : ''}`}
            onClick={() => setTab(t.id)}
            style={tab === t.id ? { '--rc-tab-accent': t.color } : undefined}
          >
            <span className={styles.rcAnSubjectDot} style={{ background: t.color }} />
            <BookOpen size={13} strokeWidth={2.2} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.rcAnalyticsBody}>
        {tab === AVG_TAB ? (
          <section className={styles.rcAnBlock}>
            <SectionHead
              Icon={Medal}
              title="جایگاه معدلی"
              hint={
                gradeSt?.label
                  ? `پایه ${gradeSt.label}${gradeSt.class_count > 1 ? ` · ${toFaDigits(gradeSt.class_count)} شعبه` : ''}`
                  : `سال ${toFaDigits(year)}`
              }
            />
            <div className={styles.rcAnStandGrid}>
              <StandingCard
                Icon={School}
                title="کلاس"
                subtitle={classSt?.title}
                rank={classSt?.my_rank}
                total={classSt?.total_ranked}
                metrics={classMetrics}
              />
              <StandingCard
                Icon={Award}
                title={gradeSt?.label ? `پایه ${gradeSt.label}` : 'کل پایه'}
                subtitle={
                  gradeSt?.sections?.length
                    ? gradeSt.sections.map((s) => s.section || s.title).filter(Boolean).join(' · ')
                    : (gradeSt?.class_count ? `${toFaDigits(gradeSt.class_count)} کلاس` : '')
                }
                rank={gradeSt?.my_rank}
                total={gradeSt?.total_ranked}
                metrics={gradeMetrics}
                accent="grade"
              />
            </div>

            <SectionHead Icon={Sparkles} title="میانگین هر درس" hint={`سال ${toFaDigits(year)}`} />
            <div className={styles.rcAnChart}>
              {avgAnalytics.subjectAvgs.length ? (
                <Bar data={avgBarData} options={chartOpts} />
              ) : (
                <p className={styles.rcWidgetEmpty}>داده‌ای نیست</p>
              )}
            </div>

            <SectionHead Icon={Activity} title="روند معدل ماهانه" hint="با خط رگرسیون" />
            <div className={styles.rcAnChartTall}>
              {avgAnalytics.monthSeries.length ? (
                <Line
                  data={avgSeriesData}
                  options={{
                    ...chartOpts,
                    scales: {
                      ...chartOpts.scales,
                      x: {
                        ...chartOpts.scales.x,
                        ticks: { ...chartOpts.scales.x.ticks, maxRotation: 40 },
                      },
                    },
                  }}
                />
              ) : (
                <p className={styles.rcWidgetEmpty}>سری زمانی کافی نیست</p>
              )}
            </div>
            <InsightBox
              slope={avgAnalytics.regression?.slope}
              r2={avgAnalytics.regression?.r2}
              intercept={avgAnalytics.regression?.intercept}
              n={avgAnalytics.regression?.n}
            />

            <SectionHead Icon={Sigma} title="آمار کلی" hint={monthLabel} />
            <div className={styles.rcAnStatGrid}>
              <MetricChip Icon={Hash} label="تعداد نمره" value={faNum(st.count)} />
              <MetricChip Icon={BookOpen} label="تعداد درس" value={faNum(st.subjects)} />
              <MetricChip Icon={Gauge} label="میانگین" value={st.mean == null ? '—' : fmtScore(st.mean)} />
              <MetricChip Icon={Target} label="میانه" value={st.median == null ? '—' : fmtScore(st.median)} />
              <MetricChip Icon={Activity} label="انحراف معیار" value={st.stdev == null ? '—' : fmtScore(st.stdev)} />
              <MetricChip
                Icon={Sparkles}
                label="کمینه / بیشینه"
                value={st.min == null ? '—' : `${faNum(st.min)} / ${faNum(st.max)}`}
              />
              <MetricChip Icon={TrendingUp} label={`پیشرفت ${monthLabel}`} value={faNum(st.up)} tone="up" />
              <MetricChip Icon={TrendingDown} label={`پسرفت ${monthLabel}`} value={faNum(st.down)} tone="down" />
              <MetricChip Icon={Minus} label={`ثابت ${monthLabel}`} value={faNum(st.stable)} />
            </div>
          </section>
        ) : null}

        {tab !== AVG_TAB && subjectView ? (
          <section className={`${styles.rcAnBlock} ${styles.rcAnSubjectBlock}`}>
            <SectionHead
              Icon={BookOpen}
              title={subjectView.row.subject_title}
              hint={
                [
                  subjectView.row.teacher_name ? `معلم ${subjectView.row.teacher_name}` : '',
                  `سال ${toFaDigits(year)}`,
                ].filter(Boolean).join(' · ')
              }
              color={subjectView.color}
            />

            <div className={styles.rcAnSubjectCols}>
              <div className={styles.rcAnSubjectCol}>
                <div className={styles.rcAnSubjectColHead}>
                  <Medal size={12} />
                  <span>خلاصه و رتبه</span>
                </div>
                <div className={styles.rcAnSubjectMetrics}>
                  <MetricChip Icon={Gauge} label="معدل" value={fmtScore(subjectView.row.avg)} />
                  <MetricChip
                    Icon={School}
                    label="رتبه کلاس"
                    value={
                      subjectView.stand?.class_rank != null
                        ? `${toFaDigits(subjectView.stand.class_rank)}/${toFaDigits(subjectView.stand.class_total)}`
                        : '—'
                    }
                  />
                  <MetricChip
                    Icon={GraduationCap}
                    label="رتبه پایه"
                    value={
                      subjectView.stand?.grade_rank != null
                        ? `${toFaDigits(subjectView.stand.grade_rank)}/${toFaDigits(subjectView.stand.grade_total)}`
                        : '—'
                    }
                  />
                  <MetricChip Icon={Users} label="معدل کلاس" value={fmtScore(subjectView.stand?.class_avg)} />
                  <MetricChip Icon={Award} label="معدل پایه" value={fmtScore(subjectView.stand?.grade_avg)} />
                  <MetricChip
                    Icon={Crown}
                    label="بالاترین"
                    value={fmtScore(subjectView.stand?.grade_highest ?? subjectView.stand?.class_highest)}
                    tone="gold"
                  />
                  <MetricChip
                    Icon={Target}
                    label={monthLabel}
                    value={subjectView.cur?.score == null ? '—' : faNum(subjectView.cur.score)}
                  />
                  <MetricChip
                    Icon={
                      subjectView.cur?.trend === 'up' ? ArrowUpRight
                        : subjectView.cur?.trend === 'down' ? ArrowDownRight
                          : Minus
                    }
                    label="تغییر"
                    value={
                      subjectView.cur?.delta == null
                        ? '—'
                        : `${subjectView.cur.delta > 0 ? '+' : ''}${faNum(subjectView.cur.delta)}`
                    }
                    tone={
                      subjectView.cur?.trend === 'up' ? 'up'
                        : subjectView.cur?.trend === 'down' ? 'down' : undefined
                    }
                  />
                  <MetricChip
                    Icon={Sparkles}
                    label="کم/بیش"
                    value={
                      subjectView.series.stats.min == null
                        ? '—'
                        : `${faNum(subjectView.series.stats.min)}/${faNum(subjectView.series.stats.max)}`
                    }
                  />
                  <MetricChip Icon={TrendingUp} label="پیشرفت" value={faNum(subjectView.series.stats.up)} tone="up" />
                  <MetricChip Icon={TrendingDown} label="پسرفت" value={faNum(subjectView.series.stats.down)} tone="down" />
                  <MetricChip Icon={Activity} label="انحراف" value={fmtScore(subjectView.series.stats.stdev)} />
                </div>
                <InsightBox
                  slope={subjectView.series.regression?.slope}
                  r2={subjectView.series.regression?.r2}
                  intercept={subjectView.series.regression?.intercept}
                  n={subjectView.series.regression?.n}
                />
              </div>

              <div className={styles.rcAnSubjectCol}>
                <div className={styles.rcAnSubjectColHead}>
                  <Sparkles size={12} />
                  <span>میله‌ای ماهانه</span>
                </div>
                <div className={styles.rcAnChartSm}>
                  {subjectView.series.filled.length ? (
                    <Bar
                      data={subjectView.barData}
                      options={{
                        ...chartOpts,
                        plugins: {
                          ...chartOpts.plugins,
                          legend: { display: false },
                        },
                      }}
                    />
                  ) : (
                    <p className={styles.rcWidgetEmpty}>نمره‌ای نیست</p>
                  )}
                </div>
              </div>

              <div className={styles.rcAnSubjectCol}>
                <div className={styles.rcAnSubjectColHead}>
                  <Activity size={12} />
                  <span>روند و رگرسیون</span>
                </div>
                <div className={styles.rcAnChartSm}>
                  {subjectView.series.filled.length ? (
                    <Line
                      data={subjectView.lineData}
                      options={{
                        ...chartOpts,
                        plugins: {
                          ...chartOpts.plugins,
                          legend: {
                            ...chartOpts.plugins.legend,
                            labels: { ...chartOpts.plugins.legend.labels, padding: 6, boxWidth: 6, font: { family: 'inherit', size: 9 } },
                          },
                        },
                        scales: {
                          ...chartOpts.scales,
                          x: {
                            ...chartOpts.scales.x,
                            ticks: { ...chartOpts.scales.x.ticks, maxRotation: 40, font: { family: 'inherit', size: 8 } },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className={styles.rcWidgetEmpty}>روند کافی نیست</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
