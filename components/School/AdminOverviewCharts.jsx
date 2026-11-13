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
  GraduationCap,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Activity,
  Trophy,
  Layers,
  School,
  UserRound,
} from 'lucide-react'
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
const FONT_IRAN = 'iran, Tahoma, sans-serif'
const FONT_IRAN_BOLD = 'iran_bold, iran, Tahoma, sans-serif'

ChartJS.defaults.font.family = FONT_IRAN
ChartJS.defaults.font.weight = '400'

const CLASS_PALETTE = [
  'rgba(43, 106, 77, 0.78)',
  'rgba(14, 116, 144, 0.72)',
  'rgba(67, 56, 202, 0.65)',
  'rgba(180, 83, 9, 0.7)',
  'rgba(15, 118, 110, 0.7)',
  'rgba(190, 18, 60, 0.65)',
  'rgba(161, 98, 7, 0.7)',
  'rgba(30, 64, 175, 0.65)',
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
  { key: 'classes', label: 'کلاس‌ها و برنامه', icon: School },
  { key: 'teachers', label: 'معلمان', icon: UserRound },
  { key: 'students', label: 'دانش‌آموزان', icon: Users },
  { key: 'subjects', label: 'دروس معلمان', icon: BookOpen },
  { key: 'attendance', label: 'حضور و غیاب', icon: CalendarCheck2 },
  { key: 'activity', label: 'فعالیت‌ها', icon: Activity },
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

export default function AdminOverviewCharts({
  charts,
  overview,
  stats,
  onNavigate,
}) {
  const classStats = charts?.class_averages || overview?.class_stats || []
  const teacherStats = charts?.teacher_averages || overview?.teacher_stats || []
  const students = charts?.student_averages || overview?.student_averages || []
  const ov = overview || {}
  const distribution = ov.distribution || []
  const weeklyTrend = ov.weekly_trend || []
  const alerts = ov.alerts || []
  const topStudents = ov.top_students || []
  const needsAttention = ov.needs_attention || []
  const activity = ov.activity || []

  const classBar = useMemo(() => {
    const rows = [...classStats].slice(0, 10)
    return {
      labels: rows.map((c) => c.title),
      datasets: [
        {
          label: 'میانگین کلاس',
          data: rows.map((c) => c.avg),
          backgroundColor: rows.map(
            (c, i) => c.color || CLASS_PALETTE[i % CLASS_PALETTE.length],
          ),
          borderRadius: 8,
          maxBarThickness: 28,
        },
      ],
    }
  }, [classStats])

  const teacherBar = useMemo(() => {
    const rows = [...teacherStats].slice(0, 10).reverse()
    return {
      labels: rows.map((t) => t.display_name),
      datasets: [
        {
          label: 'میانگین معلم',
          data: rows.map((t) => t.avg),
          backgroundColor: rows.map((t) =>
            t.avg >= 70 ? OK : t.avg >= 50 ? GOLD : WARN,
          ),
          borderRadius: 7,
          maxBarThickness: 18,
        },
      ],
    }
  }, [teacherStats])

  const trendLine = useMemo(() => {
    const labels = weeklyTrend.map((d) => d.label)
    const data = weeklyTrend.map((d) => (d.avg == null ? null : d.avg))
    return {
      labels,
      datasets: [
        {
          label: 'میانگین روزانه مدرسه',
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
          icon={School}
          label="کلاس‌ها"
          value={faTick(stats?.classes ?? classStats.length)}
          hint="فعال"
          onClick={() => onNavigate?.('classes')}
        />
        <KpiCard
          icon={UserRound}
          label="معلمان"
          value={faTick(stats?.teachers)}
          hint={`${faTick(teacherStats.length)} با داده`}
          onClick={() => onNavigate?.('teachers')}
        />
        <KpiCard
          icon={Users}
          label="دانش‌آموزان"
          value={faTick(stats?.students)}
          hint={`${faTick(stats?.scored_students || 0)} با نمره`}
          onClick={() => onNavigate?.('students')}
        />
        <KpiCard
          icon={ClipboardCheck}
          label="تکالیف در انتظار"
          value={faTick(stats?.homework_pending_review)}
          hint="نیاز به بررسی معلمان"
          tone={(stats?.homework_pending_review || 0) > 0 ? 'warn' : 'ok'}
          onClick={() => onNavigate?.('activity')}
        />
        <KpiCard
          icon={TrendingUp}
          label="معدل مدرسه"
          value={`${faTick(stats?.avg_percent)}٪`}
          hint="آزمون و کوییز"
          tone="ok"
        />
        <KpiCard
          icon={CalendarCheck2}
          label="حضور امروز"
          value={`${faTick(stats?.attendance_rate_today)}٪`}
          hint={`${faTick(stats?.attendance_sessions_today || 0)} جلسه`}
          onClick={() => onNavigate?.('attendance')}
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
            subtitle="میانگین نمرات کل مدرسه در هر روز"
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
              title="میانگین کلاس‌ها"
              subtitle="مقایسه عملکرد هر کلاس"
              action={
                <button
                  type="button"
                  className={styles.tovLinkBtn}
                  onClick={() => onNavigate?.('classes')}
                >
                  کلاس‌ها
                </button>
              }
            >
              <div className={styles.tovChartMid}>
                {classStats.length ? (
                  <Bar
                    data={classBar}
                    options={{
                      ...baseOpts,
                      plugins: { ...baseOpts.plugins, legend: { display: false } },
                      scales: { y: scaleY, x: scaleX },
                    }}
                  />
                ) : (
                  <p className={styles.tovEmpty}>کلاسی تعریف نشده</p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="میانگین معلمان"
              subtitle="عملکرد دانش‌آموزان هر معلم"
              action={
                <button
                  type="button"
                  className={styles.tovLinkBtn}
                  onClick={() => onNavigate?.('teachers')}
                >
                  معلمان
                </button>
              }
            >
              <div className={styles.tovChartMid}>
                {teacherStats.length ? (
                  <Bar
                    data={teacherBar}
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
                  <p className={styles.tovEmpty}>معلمی ثبت نشده</p>
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="آمار کلاس‌ها"
            subtitle="تعداد، معدل، تکلیف و حضور"
            action={
              <button
                type="button"
                className={styles.tovLinkBtn}
                onClick={() => onNavigate?.('classes')}
              >
                مدیریت
              </button>
            }
          >
            {!classStats.length ? (
              <p className={styles.tovEmptySm}>کلاسی نیست</p>
            ) : (
              <div className={styles.aovEntityGrid}>
                {classStats.map((c) => (
                  <article key={c.id} className={styles.aovEntityCard}>
                    <span
                      className={styles.aovEntityAccent}
                      style={{ background: c.color || EMERALD }}
                      aria-hidden
                    />
                    <div className={styles.aovEntityBody}>
                      <strong>{c.title}</strong>
                      <em>
                        {c.homeroom_teacher
                          ? `راهنما: ${c.homeroom_teacher}`
                          : 'بدون معلم راهنما'}
                        {c.room ? ` · ${c.room}` : ''}
                      </em>
                      <div className={styles.aovEntityStats}>
                        <span>
                          <Users size={11} /> {faTick(c.student_count)}
                        </span>
                        <span>
                          <TrendingUp size={11} /> {faTick(c.avg)}٪
                        </span>
                        <span>
                          <ClipboardCheck size={11} /> {faTick(c.pending_homework)}
                        </span>
                        <span>
                          <CalendarCheck2 size={11} />{' '}
                          {c.attendance_rate_today == null
                            ? '—'
                            : `${faTick(c.attendance_rate_today)}٪`}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="آمار معلمان"
            subtitle="دانش‌آموز، درس، معدل و صف بررسی"
            action={
              <button
                type="button"
                className={styles.tovLinkBtn}
                onClick={() => onNavigate?.('teachers')}
              >
                مدیریت
              </button>
            }
          >
            {!teacherStats.length ? (
              <p className={styles.tovEmptySm}>معلمی نیست</p>
            ) : (
              <div className={styles.aovEntityGrid}>
                {teacherStats.map((t) => (
                  <article key={t.id} className={styles.aovEntityCard}>
                    <span
                      className={styles.aovEntityAccent}
                      style={{
                        background:
                          t.avg >= 70 ? OK : t.avg >= 50 ? GOLD : WARN,
                      }}
                      aria-hidden
                    />
                    <div className={styles.aovEntityBody}>
                      <strong>{t.display_name}</strong>
                      <em>{t.specialty || 'بدون تخصص ثبت‌شده'}</em>
                      <div className={styles.aovEntityStats}>
                        <span>
                          <Users size={11} /> {faTick(t.student_count)}
                        </span>
                        <span>
                          <BookOpen size={11} /> {faTick(t.subject_count)}
                        </span>
                        <span>
                          <GraduationCap size={11} /> {faTick(t.lesson_count)}
                        </span>
                        <span>
                          <TrendingUp size={11} /> {faTick(t.avg)}٪
                        </span>
                        <span>
                          <ClipboardCheck size={11} /> {faTick(t.pending_homework)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className={styles.tovMainSide}>
          <SectionCard title="برترین دانش‌آموزان" subtitle="بالاترین میانگین‌ها">
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

          <SectionCard title="نیاز به حمایت" subtitle="میانگین زیر ۵۰٪">
            {!needsAttention.length ? (
              <p className={styles.tovEmptySm}>وضعیت خوبی در مدرسه هست</p>
            ) : (
              <ul className={styles.tovPeople}>
                {needsAttention.map((row) => (
                  <li key={row.student_id}>
                    <span className={`${styles.tovAvatar} ${styles.tovAvatarWarn}`}>
                      {(row.student_name || '؟').slice(0, 1)}
                    </span>
                    <div>
                      <strong>{row.student_name}</strong>
                      <em>{faTick(row.avg)}٪ · {faTick(row.count)} ارزیابی</em>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="توزیع سطح مدرسه">
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

          <SectionCard
            title="دروس و محتوا"
            subtitle="حجم برنامه درسی"
            action={
              <button
                type="button"
                className={styles.tovLinkBtn}
                onClick={() => onNavigate?.('subjects')}
              >
                دروس
              </button>
            }
          >
            <div className={styles.aovMiniStats}>
              <div>
                <Layers size={14} />
                <strong>{faTick(stats?.subjects)}</strong>
                <em>دسته درسی</em>
              </div>
              <div>
                <GraduationCap size={14} />
                <strong>{faTick(stats?.lessons)}</strong>
                <em>درس</em>
              </div>
              <div>
                <BookOpen size={14} />
                <strong>{faTick(stats?.exam_papers)}</strong>
                <em>برگه آزمون</em>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      <SectionCard title="فعالیت اخیر" subtitle="آزمون و کوییز در سطح مدرسه">
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
                  {row.kind === 'exam' ? 'آزمون' : 'کوییز'}
                </span>
                <div>
                  <strong>{row.title}</strong>
                  <em>
                    {row.student_name}
                    {row.teacher_name ? ` · ${row.teacher_name}` : ''}
                    {row.score != null ? ` · ${faTick(row.score)}٪` : ''}
                    {row.at ? ` · ${relativeFa(row.at)}` : ''}
                  </em>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <p className={styles.tovFoot}>
        <Activity size={13} strokeWidth={2.2} aria-hidden />
        آمار کلاس‌ها و معلمان از آزمون‌ها، کوییزها، تکالیف و حضور امروز به‌روز می‌شود
      </p>
    </div>
  )
}
