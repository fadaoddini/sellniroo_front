'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  CalendarCheck2,
  FileQuestion,
  GraduationCap,
  AlertTriangle,
  ArrowLeft,
  Clock3,
  BookOpen,
  Activity,
  Trophy,
  HeartHandshake,
  Layers,
} from 'lucide-react'
import HomeworkReviewPanel from '@/components/School/HomeworkReviewPanel'
import styles from './School.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
)

const LINE = 'rgba(0, 71, 51, 0.08)'
const FOREST = '#004733'
const EMERALD = '#2b6a4d'
const SEA = '#568d66'
const GOLD = 'rgba(43, 106, 77, 0.78)'
const WARN = 'rgba(180, 83, 9, 0.75)'
const OK = 'rgba(22, 163, 74, 0.78)'
const DANGER = 'rgba(185, 28, 28, 0.72)'
const FONT_IRAN = 'iran, Tahoma, sans-serif'
const FONT_IRAN_BOLD = 'iran_bold, iran, Tahoma, sans-serif'

ChartJS.defaults.font.family = FONT_IRAN
ChartJS.defaults.font.weight = '400'

const SUBJECT_PALETTE = [
  'rgba(43, 106, 77, 0.78)',
  'rgba(14, 116, 144, 0.72)',
  'rgba(124, 58, 237, 0.65)',
  'rgba(180, 83, 9, 0.7)',
  'rgba(190, 18, 60, 0.65)',
  'rgba(15, 118, 110, 0.7)',
  'rgba(67, 56, 202, 0.65)',
  'rgba(161, 98, 7, 0.7)',
]

function faTick(v) {
  if (v == null || Number.isNaN(Number(v))) return '—'
  return Number(v).toLocaleString('fa-IR')
}

function relativeFa(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'همین حالا'
  if (m < 60) return `${faTick(m)} دقیقه پیش`
  const h = Math.floor(m / 60)
  if (h < 24) return `${faTick(h)} ساعت پیش`
  const d = Math.floor(h / 24)
  return `${faTick(d)} روز پیش`
}

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      rtl: true,
      labels: {
        font: { family: FONT_IRAN_BOLD, size: 10, weight: '400' },
        boxWidth: 10,
        padding: 10,
        color: SEA,
        textAlign: 'right',
      },
    },
    tooltip: {
      rtl: true,
      textDirection: 'rtl',
      titleFont: { family: FONT_IRAN_BOLD, size: 12, weight: '400' },
      bodyFont: { family: FONT_IRAN, size: 11, weight: '400' },
      callbacks: {
        label(ctx) {
          const name = ctx.dataset?.label || ctx.label || ''
          const raw =
            typeof ctx.parsed === 'object' && ctx.parsed
              ? (ctx.parsed.y ?? ctx.parsed.x ?? ctx.raw)
              : (ctx.parsed ?? ctx.raw)
          if (raw == null) return `${name ? `${name}: ` : ''}—`
          return `${name ? `${name}: ` : ''}${faTick(raw)}٪`
        },
      },
    },
  },
}

const QUICK_ACTIONS = [
  { key: 'support', label: 'نیاز به حمایت', icon: HeartHandshake },
  { key: 'reviews', label: 'بررسی تکالیف', icon: ClipboardCheck },
  { key: 'attendance', label: 'حضور و غیاب', icon: CalendarCheck2 },
  { key: 'exams', label: 'ایجاد آزمون', icon: FileQuestion },
  { key: 'curriculum', label: 'برنامه درسی', icon: BookOpen },
  { key: 'students', label: 'دانش‌آموزان', icon: Users },
  { key: 'schedule', label: 'برنامه هفتگی', icon: Clock3 },
]

function KpiCard({ icon: Icon, label, value, hint, tone = 'default', onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`${styles.tovKpi} ${styles[`tovKpi_${tone}`] || ''} ${
        onClick ? styles.tovKpiClick : ''
      }`}
      onClick={onClick}
    >
      <span className={styles.tovKpiIcon} aria-hidden>
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <div className={styles.tovKpiBody}>
        <span className={styles.tovKpiLabel}>{label}</span>
        <strong>{value}</strong>
        {hint ? <em>{hint}</em> : null}
      </div>
    </Tag>
  )
}

function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`${styles.tovCard} ${className}`}>
      <div className={styles.tovCardHead}>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action || null}
      </div>
      {children}
    </section>
  )
}

export default function TeacherOverviewCharts({
  charts,
  overview,
  stats,
  pendingSubmissions = [],
  onNavigate,
  onDone,
  onNotify,
}) {
  const students = charts?.student_averages || []
  const subjects = charts?.subject_averages || []
  const matrix = charts?.student_subject_matrix || []
  const strengths = charts?.strengths || []
  const weaknesses = charts?.weaknesses || []
  const ov = overview || {}
  const distribution = ov.distribution || []
  const weeklyTrend = ov.weekly_trend || []
  const alerts = ov.alerts || []
  const topStudents = ov.top_students || []
  const needsAttention = ov.needs_attention || []
  const todaySchedule = ov.today_schedule || []
  const subjectsSnapshot = ov.subjects_snapshot || []
  const activity = ov.activity || []

  const studentBar = useMemo(() => {
    const rows = [...students].slice(0, 10).reverse()
    return {
      labels: rows.map((s) => s.student_name),
      datasets: [
        {
          label: 'میانگین',
          data: rows.map((s) => s.avg),
          backgroundColor: rows.map((s) =>
            s.avg >= 70 ? OK : s.avg >= 50 ? GOLD : WARN,
          ),
          borderRadius: 7,
          maxBarThickness: 20,
        },
      ],
    }
  }, [students])

  const subjectBar = useMemo(
    () => ({
      labels: subjects.map((s) => s.subject),
      datasets: [
        {
          label: 'میانگین کلاس',
          data: subjects.map((s) => s.avg),
          backgroundColor: subjects.map(
            (s, i) => s.color || SUBJECT_PALETTE[i % SUBJECT_PALETTE.length],
          ),
          borderRadius: 8,
          maxBarThickness: 34,
        },
      ],
    }),
    [subjects],
  )

  const trendLine = useMemo(() => {
    const labels = weeklyTrend.map((d) => d.label)
    const data = weeklyTrend.map((d) => (d.avg == null ? null : d.avg))
    return {
      labels,
      datasets: [
        {
          label: 'میانگین روزانه',
          data,
          borderColor: EMERALD,
          backgroundColor: 'rgba(43, 106, 77, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: FOREST,
          spanGaps: true,
        },
      ],
    }
  }, [weeklyTrend])

  const matrixBar = useMemo(() => {
    const rows = matrix.slice(0, 8)
    const subjectNames = []
    const seen = new Set()
    rows.forEach((r) => {
      ;(r.subjects || []).forEach((s) => {
        if (!seen.has(s.subject)) {
          seen.add(s.subject)
          subjectNames.push(s.subject)
        }
      })
    })
    const limitedSubjects = subjectNames.slice(0, 5)
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
        maxBarThickness: 16,
      })),
    }
  }, [matrix])

  const distTotal = distribution.reduce((a, b) => a + (b.count || 0), 0) || 1

  const scaleY = {
    min: 0,
    max: 100,
    grid: { color: LINE },
    ticks: {
      font: { family: FONT_IRAN, size: 10, weight: '400' },
      color: SEA,
      callback: (v) => faTick(v),
    },
  }
  const scaleX = {
    grid: { display: false },
    ticks: {
      font: { family: FONT_IRAN_BOLD, size: 10, weight: '400' },
      color: SEA,
    },
  }

  return (
    <div className={styles.tov}>
      <div className={styles.tovKpiGrid}>
        <KpiCard
          icon={Users}
          label="دانش‌آموزان"
          value={faTick(stats?.students)}
          hint={`${faTick(stats?.scored_students || 0)} با نمره ثبت‌شده`}
          onClick={() => onNavigate?.('students')}
        />
        <KpiCard
          icon={ClipboardCheck}
          label="تکالیف در انتظار"
          value={faTick(stats?.pending_reviews)}
          hint="نیاز به بررسی"
          tone={(stats?.pending_reviews || 0) > 0 ? 'warn' : 'ok'}
          onClick={() => onNavigate?.('reviews')}
        />
        <KpiCard
          icon={TrendingUp}
          label="میانگین کلاس"
          value={`${faTick(stats?.class_avg ?? stats?.avg_percent)}٪`}
          hint="آزمون‌ها و کوییزها"
          tone="ok"
        />
        <KpiCard
          icon={CalendarCheck2}
          label="حضور ۳۰ روز"
          value={`${faTick(stats?.attendance_rate_30d)}٪`}
          hint={`${faTick(stats?.attendance_today || 0)} جلسه امروز`}
          onClick={() => onNavigate?.('attendance')}
        />
        <KpiCard
          icon={FileQuestion}
          label="آزمون / بانک"
          value={faTick(stats?.exams)}
          hint={`${faTick(stats?.bank_questions)} سوال فعال`}
          onClick={() => onNavigate?.('exams')}
        />
        <KpiCard
          icon={GraduationCap}
          label="دروس"
          value={faTick(stats?.lessons)}
          hint={`${faTick(stats?.subjects)} دسته درسی`}
          onClick={() => onNavigate?.('curriculum')}
        />
      </div>

      {alerts.length ? (
        <div className={styles.tovAlerts}>
          {alerts.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`${styles.tovAlert} ${styles[`tovAlert_${a.tone}`] || ''}`}
              onClick={() => a.action && onNavigate?.(a.action)}
            >
              <AlertTriangle size={15} strokeWidth={2.2} aria-hidden />
              <span>
                <strong>{a.title}</strong>
                <em>{a.desc}</em>
              </span>
              <ArrowLeft size={14} strokeWidth={2.2} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.tovQuick}>
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              className={styles.tovQuickBtn}
              onClick={() => onNavigate?.(item.key)}
            >
              <Icon size={14} strokeWidth={2.2} aria-hidden />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className={styles.tovMain}>
        <div className={styles.tovMainPrimary}>
          <SectionCard
            title="روند ۱۴ روز اخیر"
            subtitle="میانگین نمرات آزمون و کوییز در هر روز"
          >
            <div className={styles.tovChartTall}>
              {weeklyTrend.some((d) => d.count > 0) ? (
                <Line
                  data={trendLine}
                  options={{
                    ...baseOpts,
                    plugins: { ...baseOpts.plugins, legend: { display: false } },
                    scales: { y: scaleY, x: scaleX },
                  }}
                />
              ) : (
                <p className={styles.tovEmpty}>هنوز نمره‌ای در این بازه ثبت نشده</p>
              )}
            </div>
          </SectionCard>

          <div className={styles.tovChartsRow}>
            <SectionCard
              title="رتبه‌بندی دانش‌آموزان"
              subtitle="میانگین کل"
            >
              <div className={styles.tovChartMid}>
                {students.length ? (
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
                ) : (
                  <p className={styles.tovEmpty}>بعد از ثبت آزمون پر می‌شود</p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="میانگین دروس"
              subtitle="وضعیت کلاس در هر درس"
            >
              <div className={styles.tovChartMid}>
                {subjects.length ? (
                  <Bar
                    data={subjectBar}
                    options={{
                      ...baseOpts,
                      plugins: { ...baseOpts.plugins, legend: { display: false } },
                      scales: { y: scaleY, x: scaleX },
                    }}
                  />
                ) : (
                  <p className={styles.tovEmpty}>هنوز تفکیک درسی نیست</p>
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="دانش‌آموز × درس"
            subtitle="مقایسه عملکرد فردی در دروس مختلف"
          >
            <div className={styles.tovChartTall}>
              {matrix.length && (matrixBar.datasets || []).length ? (
                <Bar
                  data={matrixBar}
                  options={{
                    ...baseOpts,
                    scales: { y: scaleY, x: scaleX },
                  }}
                />
              ) : (
                <p className={styles.tovEmpty}>با چند آزمون موضوعی این نمودار کامل می‌شود</p>
              )}
            </div>
          </SectionCard>
        </div>

        <aside className={styles.tovMainSide}>
          <SectionCard
            title="برنامه امروز"
            subtitle={ov.today_weekday_label || 'جلسات امروز'}
            action={
              <button
                type="button"
                className={styles.tovLinkBtn}
                onClick={() => onNavigate?.('schedule')}
              >
                کامل
              </button>
            }
          >
            {!todaySchedule.length ? (
              <p className={styles.tovEmptySm}>جلسه‌ای برای امروز نیست</p>
            ) : (
              <ul className={styles.tovSchedule}>
                {todaySchedule.map((slot) => (
                  <li key={slot.id}>
                    <span
                      className={styles.tovScheduleDot}
                      style={{ background: slot.color || EMERALD }}
                      aria-hidden
                    />
                    <div>
                      <strong>{slot.subject}</strong>
                      <em>
                        {slot.period}
                        {slot.time_label ? ` · ${slot.time_label}` : ''}
                        {slot.class_name ? ` · ${slot.class_name}` : ''}
                        {slot.room ? ` · ${slot.room}` : ''}
                      </em>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="نیاز به حمایت"
            subtitle="دانش‌آموزان با میانگین پایین‌تر"
            action={
              <button
                type="button"
                className={styles.tovLinkBtn}
                onClick={() => onNavigate?.('support')}
              >
                تب کامل
              </button>
            }
          >
            {!needsAttention.length ? (
              <p className={styles.tovEmptySm}>وضعیت خوبی دارید</p>
            ) : (
              <ul className={styles.tovPeople}>
                {needsAttention.map((row) => (
                  <li key={row.student_id}>
                    <button
                      type="button"
                      className={styles.tovPeopleBtn}
                      onClick={() => onNavigate?.('support')}
                    >
                      <span className={`${styles.tovAvatar} ${styles.tovAvatarWarn}`}>
                        {(row.student_name || '؟').slice(0, 1)}
                      </span>
                      <div>
                        <strong>{row.student_name}</strong>
                        <em>
                          {faTick(row.avg)}٪
                          {row.weak_subject ? ` · ضعف: ${row.weak_subject}` : ''}
                        </em>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="برترین‌ها" subtitle="بالاترین میانگین‌ها">
            {!topStudents.length ? (
              <p className={styles.tovEmptySm}>هنوز رتبه‌بندی نیست</p>
            ) : (
              <ul className={styles.tovPeople}>
                {topStudents.map((row, i) => (
                  <li key={row.student_id}>
                    <span className={`${styles.tovAvatar} ${styles.tovAvatarOk}`}>
                      {i === 0 ? <Trophy size={12} /> : (row.student_name || '؟').slice(0, 1)}
                    </span>
                    <div>
                      <strong>{row.student_name}</strong>
                      <em>
                        {faTick(row.avg)}٪ · {faTick(row.count)} ارزیابی
                      </em>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="توزیع سطح کلاس">
            <ul className={styles.tovDist}>
              {distribution.map((row) => (
                <li key={row.key}>
                  <div className={styles.tovDistMeta}>
                    <span>{row.label}</span>
                    <strong>{faTick(row.count)}</strong>
                  </div>
                  <div className={styles.tovDistTrack}>
                    <i
                      style={{
                        width: `${Math.round(((row.count || 0) / distTotal) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </aside>
      </div>

      {subjectsSnapshot.length ? (
        <SectionCard
          title="دروس من"
          subtitle="میانگین و حجم محتوا"
          action={
            <button
              type="button"
              className={styles.tovLinkBtn}
              onClick={() => onNavigate?.('curriculum')}
            >
              مدیریت
            </button>
          }
        >
          <div className={styles.tovSubjects}>
            {subjectsSnapshot.map((s) => (
              <article key={s.id} className={styles.tovSubject}>
                <span
                  className={styles.tovSubjectAccent}
                  style={{ background: s.color || EMERALD }}
                  aria-hidden
                />
                <div>
                  <strong>{s.title}</strong>
                  <em>
                    {faTick(s.chapters)} فصل · {faTick(s.lessons)} درس
                    {s.avg != null ? ` · میانگین ${faTick(s.avg)}٪` : ''}
                  </em>
                </div>
                <Layers size={14} strokeWidth={2} aria-hidden />
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div className={styles.tovBottom}>
        <SectionCard
          title="فعالیت اخیر"
          subtitle="آزمون، کوییز و تکالیف"
        >
          {!activity.length ? (
            <p className={styles.tovEmptySm}>فعلاً رویدادی نیست</p>
          ) : (
            <ul className={styles.tovActivity}>
              {activity.map((row) => (
                <li key={row.id}>
                  <span
                    className={`${styles.tovActKind} ${
                      styles[`tovActKind_${row.kind}`] || ''
                    }`}
                  >
                    {row.kind === 'exam'
                      ? 'آزمون'
                      : row.kind === 'quiz'
                        ? 'کوییز'
                        : 'تکلیف'}
                  </span>
                  <div>
                    <strong>{row.title}</strong>
                    <em>
                      {row.student_name}
                      {row.score != null ? ` · ${faTick(row.score)}٪` : ' · در انتظار بررسی'}
                      {row.at ? ` · ${relativeFa(row.at)}` : ''}
                    </em>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="تکالیف در انتظار بررسی"
          subtitle={`${faTick(pendingSubmissions.length)} مورد`}
          action={
            <button
              type="button"
              className={styles.tovLinkBtn}
              onClick={() => onNavigate?.('reviews')}
            >
              همه
            </button>
          }
          className={styles.tovHwCard}
        >
          <HomeworkReviewPanel
            compact
            submissions={pendingSubmissions.slice(0, 6)}
            onDone={onDone}
            onNotify={onNotify}
          />
        </SectionCard>
      </div>

      <div className={styles.tovInsightGrid}>
        <SectionCard title="قوی‌ترین در هر درس">
          {!strengths.length ? (
            <p className={styles.tovEmptySm}>داده‌ای نیست</p>
          ) : (
            <ul className={styles.tovInsightList}>
              {strengths.map((row) => (
                <li key={`s-${row.subject}-${row.student_name}`}>
                  <span
                    className={styles.tovInsightDot}
                    style={{ background: row.color || EMERALD }}
                    aria-hidden
                  />
                  <div>
                    <strong>{row.subject}</strong>
                    <em>
                      {row.student_name} · {faTick(row.avg)}٪
                    </em>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="ضعیف‌ترین در هر درس">
          {!weaknesses.length ? (
            <p className={styles.tovEmptySm}>داده‌ای نیست</p>
          ) : (
            <ul className={styles.tovInsightList}>
              {weaknesses.map((row) => (
                <li key={`w-${row.subject}-${row.student_name}`}>
                  <span
                    className={styles.tovInsightDot}
                    style={{ background: row.color || WARN }}
                    aria-hidden
                  />
                  <div>
                    <strong>{row.subject}</strong>
                    <em>
                      {row.student_name} · {faTick(row.avg)}٪
                    </em>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="خلاصه فردی">
          {!matrix.length ? (
            <p className={styles.tovEmptySm}>بعد از چند آزمون پر می‌شود</p>
          ) : (
            <ul className={styles.tovInsightList}>
              {matrix.slice(0, 8).map((row) => (
                <li key={row.student_id}>
                  <span className={styles.tovInsightDot} style={{ background: GOLD }} aria-hidden />
                  <div>
                    <strong>{row.student_name}</strong>
                    <em>
                      قوی: {row.best_subject} ({faTick(row.best_avg)}٪) · ضعیف:{' '}
                      {row.weak_subject} ({faTick(row.weak_avg)}٪)
                    </em>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <p className={styles.tovFoot}>
        <HeartHandshake size={13} strokeWidth={2.2} aria-hidden />
        <Activity size={13} strokeWidth={2.2} aria-hidden />
        داده‌ها از آزمون‌ها، کوییزها، تکالیف و برنامه هفتگی به‌روز می‌شوند
      </p>
    </div>
  )
}
