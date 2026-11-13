'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3, Brain, Compass, FolderOpen, Lightbulb, MessageSquareText,
  NotebookPen, Sparkles, Target, UserRound,
} from 'lucide-react'
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
import { Bar, Doughnut, Radar } from 'react-chartjs-2'
import schoolService from '@/components/School/services/schoolService'
import CounselingQuizPlayer from '@/components/School/CounselingQuizPlayer'
import { buildCounselingInsights, explainAttempt } from '@/components/School/counselingInsights'
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

const KIND_COLORS = {
  iq: '#2563eb',
  eq: '#e11d48',
  personality: '#7c3aed',
  career: '#0d9488',
  interest: '#d97706',
  custom: '#64748b',
}

const RISK_TONE = {
  none: styles.cfRiskNone,
  low: styles.cfRiskLow,
  medium: styles.cfRiskMed,
  high: styles.cfRiskHigh,
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

const chartFont = {
  family: "iran, 'iran', Tahoma, sans-serif",
  size: 9,
}

const basePlugins = {
  legend: {
    position: 'bottom',
    rtl: true,
    labels: {
      font: chartFont,
      boxWidth: 8,
      padding: 8,
      color: '#64748b',
    },
  },
  tooltip: {
    rtl: true,
    titleFont: { ...chartFont, family: "iran_bold, iran, Tahoma, sans-serif", size: 10 },
    bodyFont: chartFont,
  },
}

export default function StudentCounselingPanel({ studentId, onNotify }) {
  const [tests, setTests] = useState([])
  const [file, setFile] = useState(null)
  const [quizMode, setQuizMode] = useState(false)
  const [fileTab, setFileTab] = useState('insights')

  const load = useCallback(async () => {
    const [t, f] = await Promise.all([
      schoolService.counselingAvailableTests(),
      studentId ? schoolService.getCounselingFileByStudent(studentId) : Promise.resolve({ success: false }),
    ])
    if (t.success) setTests(t.data || [])
    else onNotify?.(t.error || 'خطا در دریافت آزمون‌های مشاوره', true)
    if (f.success) setFile(f.data)
    else if (studentId) onNotify?.(f.error || 'خطا در دریافت پرونده مشاوره', true)
  }, [studentId, onNotify])

  useEffect(() => { load() }, [load])

  const attempts = useMemo(() => file?.attempts || [], [file])
  const notes = useMemo(() => file?.notes || [], [file])
  const insights = useMemo(() => buildCounselingInsights(attempts), [attempts])

  const stats = useMemo(() => {
    if (!attempts.length) {
      return { avg: 0, best: 0, count: 0, byKind: {} }
    }
    const pcts = attempts.map((a) => pctOf(a.score, a.max_score))
    const byKind = {}
    attempts.forEach((a) => {
      const k = a.test_kind || 'custom'
      if (!byKind[k]) byKind[k] = { label: a.test_kind_label || k, sum: 0, n: 0 }
      byKind[k].sum += pctOf(a.score, a.max_score)
      byKind[k].n += 1
    })
    Object.keys(byKind).forEach((k) => {
      byKind[k].avg = Math.round(byKind[k].sum / byKind[k].n)
    })
    return {
      avg: Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length),
      best: Math.max(...pcts),
      count: attempts.length,
      byKind,
    }
  }, [attempts])

  const barData = useMemo(() => {
    const rows = [...attempts].reverse().slice(-6)
    return {
      labels: rows.map((a) => (a.test_title || 'آزمون').slice(0, 10)),
      datasets: [{
        label: 'درصد',
        data: rows.map((a) => pctOf(a.score, a.max_score)),
        backgroundColor: rows.map((a) => KIND_COLORS[a.test_kind] || KIND_COLORS.custom),
        borderRadius: 6,
        maxBarThickness: 22,
      }],
    }
  }, [attempts])

  const doughnutData = useMemo(() => {
    const kinds = Object.entries(stats.byKind)
    if (!kinds.length) {
      return {
        labels: ['بدون داده'],
        datasets: [{ data: [1], backgroundColor: ['#e2e8f0'] }],
      }
    }
    return {
      labels: kinds.map(([, v]) => v.label),
      datasets: [{
        data: kinds.map(([, v]) => v.avg),
        backgroundColor: kinds.map(([k]) => KIND_COLORS[k] || KIND_COLORS.custom),
        borderWidth: 0,
        hoverOffset: 4,
      }],
    }
  }, [stats])

  const radarData = useMemo(() => {
    const order = ['iq', 'eq', 'personality', 'career', 'interest', 'custom']
    const present = order.filter((k) => stats.byKind[k])
    const keys = present.length ? present : order.slice(0, 3)
    return {
      labels: keys.map((k) => (stats.byKind[k]?.label || k).slice(0, 8)),
      datasets: [{
        label: 'میانگین٪',
        data: keys.map((k) => stats.byKind[k]?.avg ?? 0),
        backgroundColor: 'rgba(37, 99, 235, 0.16)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#1d4ed8',
        borderWidth: 1.5,
        pointRadius: 2.5,
      }],
    }
  }, [stats])

  if (quizMode) {
    return (
      <CounselingQuizPlayer
        tests={tests}
        embedded
        onNotify={onNotify}
        onFinished={() => load()}
        onCancel={() => {
          setQuizMode(false)
          load()
        }}
      />
    )
  }

  const fileTabs = [
    ['insights', 'پیشنهادات', Lightbulb],
    ['charts', 'نمودارها', BarChart3],
    ['results', 'نتایج', Brain],
    ['notes', 'یادداشت‌ها', MessageSquareText],
    ['summary', 'خلاصه', NotebookPen],
  ]

  const kindChips = Object.entries(stats.byKind).slice(0, 3)
  const maturityCls = {
    seed: styles.cfMaturitySeed,
    growing: styles.cfMaturityGrowing,
    rich: styles.cfMaturityRich,
  }[insights.maturity] || styles.cfMaturitySeed

  return (
    <div className={styles.cqPanelHome}>
      <div className={`${styles.cqHomeHero} ${styles.cqHomeHeroCompact}`}>
        <div className={styles.cqHomeHeroRow}>
          <div>
            <p className={styles.cqHomeEyebrow}>مشاوره مدرسه</p>
            <h2 className={styles.cqHomeTitle}>آزمون‌های هوش و پرونده من</h2>
          </div>
          <button
            type="button"
            className={`${styles.btnAccent} ${styles.cqHomeCta}`}
            disabled={!tests.length}
            onClick={() => setQuizMode(true)}
          >
            ورود به آزمون‌ها
            {tests.length ? ` (${faNum(tests.length)})` : ''}
          </button>
        </div>
      </div>

      <section className={styles.cfDossier}>
        <header className={styles.cfDossierHead}>
          <div className={styles.cfDossierTitle}>
            <span className={styles.cfDossierIcon}><FolderOpen size={14} /></span>
            <div>
              <h3>پرونده مشاوره من</h3>
              <p>
                {file
                  ? `${faNum(stats.count)} نتیجه · پیشنهادها با هر آزمون دقیق‌تر می‌شود`
                  : 'هنوز پرونده‌ای نیست'}
              </p>
            </div>
          </div>
          {file ? (
            <span className={`${styles.cfRisk} ${RISK_TONE[file.risk_level] || styles.cfRiskNone}`}>
              {file.risk_label || file.risk_level || 'عادی'}
            </span>
          ) : null}
        </header>

        {!file ? (
          <div className={styles.cfEmpty}>
            <Sparkles size={16} />
            <p>با اولین آزمون، پرونده و پیشنهادهای شخصی شما ساخته می‌شود.</p>
          </div>
        ) : (
          <>
            <div className={styles.cfStats}>
              <div className={styles.cfStat}>
                <span>میانگین</span>
                <strong>{faNum(stats.avg)}٪</strong>
              </div>
              <div className={styles.cfStat}>
                <span>بهترین</span>
                <strong>{faNum(stats.best)}٪</strong>
              </div>
              <div className={styles.cfStat}>
                <span>آزمون‌ها</span>
                <strong>{faNum(stats.count)}</strong>
              </div>
            </div>

            <div className={styles.cfTabs} role="tablist">
              {fileTabs.map(([k, label, Icon]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={fileTab === k}
                  className={`${styles.cfTab} ${fileTab === k ? styles.cfTabOn : ''}`}
                  onClick={() => setFileTab(k)}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <div className={styles.cfTabBody}>
              {fileTab === 'insights' ? (
                insights.empty ? (
                  <p className={styles.empty}>با تکمیل آزمون، پیشنهاد استعداد و مسیر شغلی اینجا می‌آید</p>
                ) : (
                  <div className={styles.cfInsights}>
                    <div className={`${styles.cfInsightBanner} ${maturityCls}`}>
                      <div>
                        <span className={styles.cfInsightMaturity}>
                          {insights.maturityInfo.title}
                        </span>
                        <p className={styles.cfInsightHeadline}>{insights.headline}</p>
                        <p className={styles.cfInsightSub}>{insights.maturityInfo.text}</p>
                      </div>
                      <div className={styles.cfInsightProgress}>
                        <strong>{faNum(insights.kindsCovered)}</strong>
                        <span>حوزه پوشش</span>
                      </div>
                    </div>

                    <div className={styles.cfGrid3}>
                      <article className={`${styles.cfInsightCard} ${styles.cfInsightTalent}`}>
                        <h4><Sparkles size={12} /> استعدادها</h4>
                        {insights.talents.length ? insights.talents.map((t) => (
                          <div key={t.kind} className={styles.cfInsightItem}>
                            <div className={styles.cfInsightItemTop}>
                              <strong>{t.label}</strong>
                              <em style={{ color: KIND_COLORS[t.kind] || KIND_COLORS.custom }}>
                                {faNum(t.pct)}٪
                              </em>
                            </div>
                            <p>{t.title}</p>
                            {t.hint ? <span className={styles.cfInsightHint}>{t.hint}</span> : null}
                          </div>
                        )) : (
                          <p className={styles.cfMuted}>هنوز نقطه قوت برجسته‌ای ثبت نشده</p>
                        )}
                      </article>

                      <article className={`${styles.cfInsightCard} ${styles.cfInsightCareer}`}>
                        <h4><Compass size={12} /> مسیر شغلی و زندگی</h4>
                        {insights.careers.length ? (
                          <ul className={styles.cfInsightList}>
                            {insights.careers.map((c) => (
                              <li key={c}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className={styles.cfMuted}>با تقویت نتایج، مسیرها پیشنهاد می‌شوند</p>
                        )}
                        {insights.lifePaths.length ? (
                          <>
                            <h5 className={styles.cfInsightSubhead}>سبک زندگی / رشد</h5>
                            <ul className={styles.cfInsightListSoft}>
                              {insights.lifePaths.map((c) => (
                                <li key={c}>{c}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </article>

                      <article className={`${styles.cfInsightCard} ${styles.cfInsightWeak}`}>
                        <h4><Target size={12} /> نقاط ضعف و پوشش</h4>
                        {insights.weaknesses.length ? insights.weaknesses.map((w) => (
                          <div key={w.kind} className={styles.cfWeakBlock}>
                            <div className={styles.cfInsightItemTop}>
                              <strong>{w.label}</strong>
                              <em style={{ color: KIND_COLORS[w.kind] || '#be123c' }}>
                                {faNum(w.pct)}٪
                              </em>
                            </div>
                            <p className={styles.cfWeakWhy}>{w.why}</p>
                            <ul className={styles.cfCoverList}>
                              {w.actions.map((a) => (
                                <li key={a}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )) : (
                          <p className={styles.cfMuted}>ضعف جدی دیده نشد — روی تثبیت نقاط قوت تمرکز کنید</p>
                        )}
                      </article>
                    </div>

                    {insights.nextSteps.length ? (
                      <div className={styles.cfNextSteps}>
                        <h4><Lightbulb size={12} /> گام بعدی پیشنهادی</h4>
                        <ol>
                          {insights.nextSteps.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>
                )
              ) : null}

              {fileTab === 'charts' ? (
                !attempts.length ? (
                  <p className={styles.empty}>هنوز نتیجه‌ای برای نمودار نیست</p>
                ) : (
                  <div className={styles.cfGrid3}>
                    <div className={styles.cfChartCard}>
                      <h4>روند درصد</h4>
                      <div className={styles.cfChartBody}>
                        <Bar
                          data={barData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { ...basePlugins, legend: { display: false } },
                            scales: {
                              x: {
                                ticks: { font: chartFont, color: '#94a3b8', maxRotation: 0 },
                                grid: { display: false },
                              },
                              y: {
                                min: 0,
                                max: 100,
                                ticks: { font: chartFont, color: '#94a3b8', stepSize: 25 },
                                grid: { color: 'rgba(15,23,42,0.05)' },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.cfChartCard}>
                      <h4>میانگین نوع</h4>
                      <div className={styles.cfChartBody}>
                        <Doughnut
                          data={doughnutData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '58%',
                            plugins: {
                              ...basePlugins,
                              legend: {
                                ...basePlugins.legend,
                                labels: { ...basePlugins.legend.labels, padding: 6, boxWidth: 7 },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.cfChartCard}>
                      <h4>رادار مهارت</h4>
                      <div className={styles.cfChartBody}>
                        <Radar
                          data={radarData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { ...basePlugins, legend: { display: false } },
                            scales: {
                              r: {
                                min: 0,
                                max: 100,
                                ticks: { display: false },
                                pointLabels: {
                                  font: { ...chartFont, family: "iran_bold, iran, Tahoma, sans-serif", size: 9 },
                                  color: '#64748b',
                                },
                                grid: { color: 'rgba(15,23,42,0.07)' },
                                angleLines: { color: 'rgba(15,23,42,0.07)' },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              ) : null}

              {fileTab === 'results' ? (
                !attempts.length ? (
                  <p className={styles.empty}>هنوز نتیجه‌ای ثبت نشده</p>
                ) : (
                  <div className={styles.cfGrid3}>
                    {attempts.map((a) => {
                      const pct = pctOf(a.score, a.max_score)
                      const color = KIND_COLORS[a.test_kind] || KIND_COLORS.custom
                      const explained = explainAttempt(a, {
                        personName: file?.student_name || 'شما',
                      })
                      return (
                        <article key={a.id} className={styles.cfResultCard}>
                          <div className={styles.cfResultTop}>
                            <span className={styles.cfResultKind} style={{ '--cf-kind': color }}>
                              {a.test_kind_label || a.test_kind}
                            </span>
                            <strong title={a.test_title}>{a.test_title}</strong>
                          </div>
                          <div className={styles.cfResultScore} style={{ color }}>
                            {faNum(pct)}
                            <small>٪</small>
                          </div>
                          <div className={styles.cfResultBar}>
                            <div style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <div className={styles.cfResultMeta}>
                            <span>{a.result_label || explained?.toneLabel || '—'}</span>
                            <span>{faNum(a.score)}/{faNum(a.max_score)}</span>
                          </div>
                          {explained?.plainMeaning ? (
                            <p className={styles.cfResultPlain}>{explained.plainMeaning}</p>
                          ) : null}
                          {explained?.personTip?.length ? (
                            <ul className={styles.cfResultTips}>
                              {explained.personTip.slice(0, 2).map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                )
              ) : null}

              {fileTab === 'notes' ? (
                !notes.length ? (
                  <p className={styles.empty}>یادداشت مشترکی از مشاور نیست</p>
                ) : (
                  <div className={styles.cfGrid3}>
                    {notes.map((n) => (
                      <article key={n.id} className={styles.cfNoteCard}>
                        <header>
                          <strong>{n.title || 'یادداشت'}</strong>
                          <time>{n.created_at?.slice?.(0, 10) || ''}</time>
                        </header>
                        <p>{n.body}</p>
                      </article>
                    ))}
                  </div>
                )
              ) : null}

              {fileTab === 'summary' ? (
                <div className={styles.cfGrid3}>
                  <div className={styles.cfSummaryCard}>
                    <h4><NotebookPen size={12} /> خلاصه مشاور</h4>
                    {file.summary_html ? (
                      <p className={styles.cfSummaryText}>{file.summary_html}</p>
                    ) : (
                      <p className={styles.cfMuted}>خلاصه‌ای ثبت نشده</p>
                    )}
                  </div>
                  <div className={styles.cfSummaryCard}>
                    <h4><UserRound size={12} /> مشاور مسئول</h4>
                    <p className={styles.cfCounselorName}>
                      {file.primary_counselor_name || 'هنوز تعیین نشده'}
                    </p>
                    <span className={`${styles.cfRisk} ${RISK_TONE[file.risk_level] || styles.cfRiskNone}`}>
                      {file.risk_label || file.risk_level || 'عادی'}
                    </span>
                  </div>
                  <div className={styles.cfSummaryCard}>
                    <h4><BarChart3 size={12} /> نمای سریع</h4>
                    {kindChips.length ? (
                      <ul className={styles.cfKindList}>
                        {kindChips.map(([k, v]) => (
                          <li key={k}>
                            <span
                              className={styles.cfKindDot}
                              style={{ background: KIND_COLORS[k] || KIND_COLORS.custom }}
                            />
                            <em>{v.label}</em>
                            <strong>{faNum(v.avg)}٪</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.cfMuted}>داده‌ای نیست</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
