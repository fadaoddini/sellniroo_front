'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Award, BookOpen, CalendarDays, ChevronDown, ClipboardList, Loader2,
  MessageSquare, Minus, Sparkles, TrendingDown, TrendingUp, UserRound, X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  MONTHS_FA, faNum, toFaDigits, currentJalaliMonth,
} from '@/components/School/schoolDate'
import styles from './School.module.css'

function cellClass(trend) {
  if (trend === 'up') return styles.rcMtxUp
  if (trend === 'down') return styles.rcMtxDown
  if (trend === 'stable') return styles.rcMtxFlat
  return ''
}

/** رنگ‌بندی فصلی ماه‌های شمسی */
function seasonOfMonth(jm) {
  if (jm >= 1 && jm <= 3) return 'spring' // بهار
  if (jm >= 4 && jm <= 6) return 'summer' // تابستان
  if (jm >= 7 && jm <= 9) return 'autumn' // پاییز
  return 'winter' // زمستان
}

function seasonClass(jm) {
  const key = seasonOfMonth(jm)
  const base = {
    spring: styles.rcSeasonSpring,
    summer: styles.rcSeasonSummer,
    autumn: styles.rcSeasonAutumn,
    winter: styles.rcSeasonWinter,
  }[key] || ''
  // پایان هر فصل: خرداد، شهریور، آذر (و اسفند قبل از میانگین)
  const end = (jm === 3 || jm === 6 || jm === 9 || jm === 12)
    ? ` ${styles.rcSeasonEnd}`
    : ''
  return `${base}${end}`
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp size={10} />
  if (trend === 'down') return <TrendingDown size={10} />
  if (trend === 'stable') return <Minus size={10} />
  return null
}

function YearPickerDialog({ open, year, onPick, onClose }) {
  if (!open) return null
  const years = [year - 2, year - 1, year, year + 1]
  return (
    <div className={styles.rcDlgBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.rcDlg}
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب سال"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.rcDlgHead}>
          <div className={styles.rcDlgTitle}>
            <CalendarDays size={15} />
            <h3>سال کارنامه</h3>
          </div>
          <button type="button" className={styles.rcDlgClose} onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </div>
        <div className={styles.rcDlgBody}>
          <div className={styles.rcMonthGrid}>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={`${styles.rcMonthCell} ${y === year ? styles.rcMonthCellOn : ''}`}
                onClick={() => { onPick(y); onClose() }}
              >
                {toFaDigits(y)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentReportCardPanel({
  studentParams = {},
  onNotify,
}) {
  const initial = currentJalaliMonth()
  const [year, setYear] = useState(initial.jy)
  const [jm] = useState(initial.jm)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [picker, setPicker] = useState(null)
  const [tip, setTip] = useState(null) // { title, score, comment, month }

  const studentKey = studentParams?.student ?? ''
  const loadSeq = useRef(0)

  const load = useCallback(async () => {
    const seq = ++loadSeq.current
    setLoading(true)
    setData(null)
    const res = await schoolService.reportCardMine({
      ...(studentKey ? { student: studentKey } : {}),
      year,
      jy: year,
      jm,
    })
    if (seq !== loadSeq.current) return
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بارگذاری کارنامه', true)
      return
    }
    setData(res.data)
  }, [studentKey, year, jm, onNotify])

  useEffect(() => { load() }, [load])

  const matrix = data?.matrix
  const rows = matrix?.rows || []
  const months = matrix?.months || MONTHS_FA.map((label, i) => ({
    jm: i + 1, label, short: label.slice(0, 2),
  }))
  const monthAvgs = matrix?.month_avgs || []
  const summary = data?.summary || {}

  const highlightJm = useMemo(() => {
    // آخرین ماهی که حداقل یک نمره دارد
    for (let m = 12; m >= 1; m -= 1) {
      if (rows.some((r) => r.cells?.[m - 1]?.score != null)) return m
    }
    return jm
  }, [rows, jm])

  const widgets = useMemo(() => {
    const upList = []
    const downList = []
    const stableList = []
    let scored = 0
    let bestScore = null
    let lowScore = null
    let filledMonths = 0

    monthAvgs.forEach((m) => {
      if (m.avg != null) filledMonths += 1
    })

    rows.forEach((row) => {
      const cell = row.cells?.[highlightJm - 1]
      if (!cell || cell.score == null) return
      scored += 1
      const item = {
        title: row.subject_title,
        color: row.color,
        score: cell.score,
        delta: cell.delta,
        avg: row.avg,
      }
      if (cell.trend === 'up') upList.push(item)
      else if (cell.trend === 'down') downList.push(item)
      else stableList.push(item)

      if (!bestScore || cell.score > bestScore.score) bestScore = item
      if (!lowScore || cell.score < lowScore.score) lowScore = item
    })

    upList.sort((a, b) => (b.delta || 0) - (a.delta || 0))
    downList.sort((a, b) => (a.delta || 0) - (b.delta || 0))

    const monthAvg = monthAvgs.find((m) => m.jm === highlightJm)?.avg ?? null
    const prevAvg = highlightJm > 1
      ? (monthAvgs.find((m) => m.jm === highlightJm - 1)?.avg ?? null)
      : null
    let monthDelta = null
    let monthTrend = 'none'
    if (monthAvg != null && prevAvg != null) {
      monthDelta = Math.round((monthAvg - prevAvg) * 100) / 100
      if (monthDelta >= 0.5) monthTrend = 'up'
      else if (monthDelta <= -0.5) monthTrend = 'down'
      else monthTrend = 'stable'
    }

    return {
      yearAvg: summary.year_avg,
      monthAvg,
      prevAvg,
      monthDelta,
      monthTrend,
      monthLabel: MONTHS_FA[highlightJm - 1] || '',
      prevLabel: highlightJm > 1 ? MONTHS_FA[highlightJm - 2] : '',
      subjectCount: rows.length,
      scored,
      filledMonths,
      upList,
      downList,
      stableCount: stableList.length,
      bestScore,
      lowScore,
    }
  }, [rows, highlightJm, monthAvgs, summary])

  return (
    <div className={styles.rcShell}>
      <header className={styles.rcTopBar}>
        <div className={styles.rcTopTitle}>
          <span className={styles.rcTopIcon}><ClipboardList size={14} /></span>
          <div>
            <h2>کارنامه سالانه</h2>
            <p>
              {data?.student?.display_name || 'دانش‌آموز'}
              {data?.student?.class_title ? ` · ${data.student.class_title}` : ''}
              {' · '}ریز نمرات ماهانه
            </p>
          </div>
        </div>
        <button type="button" className={styles.rcPickBtnSm} onClick={() => setPicker('year')}>
          <CalendarDays size={13} />
          <span>سال {toFaDigits(year)}</span>
          <ChevronDown size={13} />
        </button>
      </header>

      {loading && !data ? (
        <div className={styles.rcEmpty}>
          <Loader2 size={20} className={styles.rcSpin} />
          <p>بارگذاری…</p>
        </div>
      ) : !rows.length ? (
        <div className={styles.rcEmpty}>
          <BookOpen size={22} />
          <p>برای سال {toFaDigits(year)} نمره‌ای ثبت نشده</p>
        </div>
      ) : (
        <>
      <div className={styles.rcWidgetRow}>
        <article className={`${styles.rcWidget} ${styles.rcWidgetAvg}`}>
          <div className={styles.rcWidgetHead}>
            <span className={styles.rcWidgetIcon}><Sparkles size={14} /></span>
            <div className={styles.rcWidgetHeadText}>
              <em>وضعیت کلی</em>
              <strong>{widgets.yearAvg == null ? '—' : faNum(widgets.yearAvg)}</strong>
            </div>
            <span className={styles.rcWidgetBadge}>از ۲۰</span>
          </div>
          <div className={styles.rcWidgetStats}>
            <div>
              <em>میانگین {widgets.monthLabel || 'ماه'}</em>
              <b>{widgets.monthAvg == null ? '—' : faNum(widgets.monthAvg)}</b>
            </div>
            <div>
              <em>نسبت به قبل</em>
              <b className={
                widgets.monthTrend === 'up' ? styles.rcTrendUp
                  : widgets.monthTrend === 'down' ? styles.rcTrendDown : ''
              }>
                {widgets.monthDelta == null
                  ? '—'
                  : `${widgets.monthDelta > 0 ? '+' : ''}${faNum(widgets.monthDelta)}`}
              </b>
            </div>
            <div>
              <em>دروس / ماه‌ها</em>
              <b>{faNum(widgets.subjectCount)} · {faNum(widgets.filledMonths)}</b>
            </div>
          </div>
          <div className={styles.rcWidgetFoot}>
            <Award size={11} />
            {widgets.bestScore
              ? `بالاترین: ${widgets.bestScore.title} (${faNum(widgets.bestScore.score)})`
              : 'هنوز نمره‌ای برای ماه جاری نیست'}
          </div>
        </article>

        <article className={`${styles.rcWidget} ${styles.rcWidgetUp}`}>
          <div className={styles.rcWidgetHead}>
            <span className={styles.rcWidgetIcon}><TrendingUp size={14} /></span>
            <div className={styles.rcWidgetHeadText}>
              <em>پیشرفت · {widgets.monthLabel}</em>
              <strong>{faNum(widgets.upList.length)}</strong>
            </div>
            <span className={styles.rcWidgetBadge}>
              {widgets.scored ? `${faNum(Math.round((widgets.upList.length / widgets.scored) * 100))}٪` : '۰٪'}
            </span>
          </div>
          {widgets.upList[0] ? (
            <div className={styles.rcWidgetHighlight}>
              <span className={styles.rcWidgetDot} style={{ background: widgets.upList[0].color || '#15803d' }} />
              <div>
                <b>{widgets.upList[0].title}</b>
                <em>
                  {faNum(widgets.upList[0].score)}
                  {widgets.upList[0].delta != null ? ` · +${faNum(widgets.upList[0].delta)}` : ''}
                </em>
              </div>
            </div>
          ) : (
            <p className={styles.rcWidgetEmpty}>در این ماه پیشرفتی ثبت نشده</p>
          )}
          <div className={styles.rcWidgetChips}>
            {widgets.upList.slice(0, 4).map((s) => (
              <span key={s.title} className={styles.rcWidgetChipUp}>
                {s.title}
                {s.delta != null ? ` +${faNum(s.delta)}` : ''}
              </span>
            ))}
            {!widgets.upList.length ? (
              <span className={styles.rcWidgetChipMuted}>ثابت: {faNum(widgets.stableCount)}</span>
            ) : null}
          </div>
        </article>

        <article className={`${styles.rcWidget} ${styles.rcWidgetDown}`}>
          <div className={styles.rcWidgetHead}>
            <span className={styles.rcWidgetIcon}><TrendingDown size={14} /></span>
            <div className={styles.rcWidgetHeadText}>
              <em>نیاز به توجه · {widgets.monthLabel}</em>
              <strong>{faNum(widgets.downList.length)}</strong>
            </div>
            <span className={styles.rcWidgetBadge}>
              {widgets.scored ? `${faNum(Math.round((widgets.downList.length / widgets.scored) * 100))}٪` : '۰٪'}
            </span>
          </div>
          {widgets.downList[0] || widgets.lowScore ? (
            <div className={styles.rcWidgetHighlight}>
              <span
                className={styles.rcWidgetDot}
                style={{ background: (widgets.downList[0] || widgets.lowScore).color || '#b91c1c' }}
              />
              <div>
                <b>{(widgets.downList[0] || widgets.lowScore).title}</b>
                <em>
                  {faNum((widgets.downList[0] || widgets.lowScore).score)}
                  {(widgets.downList[0]?.delta != null)
                    ? ` · ${faNum(widgets.downList[0].delta)}`
                    : ''}
                </em>
              </div>
            </div>
          ) : (
            <p className={styles.rcWidgetEmpty}>پسرفتی در این ماه نیست</p>
          )}
          <div className={styles.rcWidgetChips}>
            {widgets.downList.slice(0, 4).map((s) => (
              <span key={s.title} className={styles.rcWidgetChipDown}>
                {s.title}
                {s.delta != null ? ` ${faNum(s.delta)}` : ''}
              </span>
            ))}
            {!widgets.downList.length && widgets.lowScore ? (
              <span className={styles.rcWidgetChipMuted}>
                کمترین: {widgets.lowScore.title} ({faNum(widgets.lowScore.score)})
              </span>
            ) : null}
          </div>
        </article>
      </div>

        <div className={styles.rcMtxWrap}>
          <table className={styles.rcMtx}>
            <thead>
              <tr>
                <th className={styles.rcMtxSticky}>درس</th>
                {months.map((m) => (
                  <th
                    key={m.jm}
                    className={`${seasonClass(m.jm)} ${m.jm === highlightJm ? styles.rcMtxColOn : ''}`}
                    title={m.label}
                  >
                    <span className={styles.rcMtxMonthFull}>{m.label}</span>
                    <span className={styles.rcMtxMonthShort}>{m.short || m.label?.slice(0, 2)}</span>
                  </th>
                ))}
                <th className={styles.rcMtxAvgCol}>
                  <span className={styles.rcMtxMonthFull}>میانگین</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.subject_id}>
                  <th className={styles.rcMtxSticky} scope="row">
                    <span className={styles.rcMtxSubWrap}>
                      <span
                        className={styles.rcMtxDot}
                        style={{ background: row.color || '#2d5a45' }}
                      />
                      <span className={styles.rcMtxSubName}>
                        <strong>{row.subject_title}</strong>
                        {row.teacher_name ? <em>{row.teacher_name}</em> : null}
                      </span>
                    </span>
                  </th>
                  {(row.cells || []).map((cell) => {
                    const empty = cell.score == null
                    return (
                      <td
                        key={cell.jm}
                        className={`${styles.rcMtxCell} ${seasonClass(cell.jm)} ${cellClass(cell.trend)} ${cell.jm === highlightJm ? styles.rcMtxColOn : ''}`}
                      >
                        {empty ? (
                          <span className={styles.rcMtxDash}>—</span>
                        ) : (
                          <button
                            type="button"
                            className={styles.rcMtxScoreBtn}
                            title={cell.comment || MONTHS_FA[cell.jm - 1]}
                            onClick={() => setTip({
                              subject: row.subject_title,
                              color: row.color || '#2d5a45',
                              teacher: row.teacher_name || '',
                              subjectAvg: row.avg,
                              month: MONTHS_FA[cell.jm - 1],
                              jm: cell.jm,
                              year,
                              score: cell.score,
                              maxScore: cell.max_score || 20,
                              percent: cell.percent,
                              prevScore: cell.prev_score,
                              comment: cell.comment || '',
                              trend: cell.trend,
                              delta: cell.delta,
                              season: seasonOfMonth(cell.jm),
                            })}
                          >
                            <span className={styles.rcMtxScore}>{faNum(cell.score)}</span>
                            <TrendIcon trend={cell.trend} />
                          </button>
                        )}
                      </td>
                    )
                  })}
                  <td className={styles.rcMtxAvgCell}>
                    {row.avg == null ? '—' : faNum(row.avg)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th className={styles.rcMtxSticky} scope="row">میانگین ماه</th>
                {monthAvgs.map((m) => (
                  <td
                    key={m.jm}
                    className={`${styles.rcMtxFootCell} ${seasonClass(m.jm)} ${m.jm === highlightJm ? styles.rcMtxColOn : ''}`}
                  >
                    {m.avg == null ? '—' : faNum(m.avg)}
                  </td>
                ))}
                <td className={styles.rcMtxAvgCell}>
                  {summary.year_avg == null ? '—' : faNum(summary.year_avg)}
                </td>
              </tr>
            </tfoot>
          </table>
          <p className={styles.rcMtxLegend}>
            <span className={styles.rcSeasonSpring}><i className={styles.rcSeasonSwatch} />بهار</span>
            <span className={styles.rcSeasonSummer}><i className={styles.rcSeasonSwatch} />تابستان</span>
            <span className={styles.rcSeasonAutumn}><i className={styles.rcSeasonSwatch} />پاییز</span>
            <span className={styles.rcSeasonWinter}><i className={styles.rcSeasonSwatch} />زمستان</span>
            <span className={styles.rcMtxUp}><TrendingUp size={11} /> پیشرفت</span>
            <span className={styles.rcMtxDown}><TrendingDown size={11} /> پسرفت</span>
          </p>
        </div>
        </>
      )}

      {tip ? (
        <div className={styles.rcDlgBackdrop} role="presentation" onClick={() => setTip(null)}>
          <div
            className={styles.rcGradeDlg}
            role="dialog"
            aria-modal="true"
            aria-label={`جزئیات نمره ${tip.subject}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.rcGradeDlgHero}
              style={{ '--grade-accent': tip.color || '#2d5a45' }}
            >
              <button type="button" className={styles.rcGradeDlgClose} onClick={() => setTip(null)} aria-label="بستن">
                <X size={15} />
              </button>
              <div className={styles.rcGradeDlgHeroTop}>
                <span className={styles.rcGradeDlgSubjectIcon} style={{ background: tip.color || '#2d5a45' }}>
                  <BookOpen size={16} />
                </span>
                <div className={styles.rcGradeDlgHeroText}>
                  <h3>{tip.subject}</h3>
                  <p>
                    <CalendarDays size={12} />
                    {tip.month} {toFaDigits(tip.year)}
                    {tip.season === 'spring' ? ' · بهار'
                      : tip.season === 'summer' ? ' · تابستان'
                        : tip.season === 'autumn' ? ' · پاییز' : ' · زمستان'}
                  </p>
                </div>
              </div>
              <div className={styles.rcGradeDlgScoreRow}>
                <div className={styles.rcGradeDlgScoreMain}>
                  <em>نمره این ماه</em>
                  <strong>{faNum(tip.score)}</strong>
                  <span>از {faNum(tip.maxScore || 20)}</span>
                </div>
                {tip.percent != null ? (
                  <div className={styles.rcGradeDlgPercent}>
                    <em>درصد</em>
                    <b>{faNum(tip.percent)}٪</b>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.rcGradeDlgBody}>
              {tip.teacher ? (
                <div className={styles.rcGradeDlgTeacher}>
                  <span className={styles.rcGradeDlgTeacherAvatar}>
                    <UserRound size={16} />
                  </span>
                  <div>
                    <em>معلم درس</em>
                    <strong>{tip.teacher}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.rcGradeDlgTeacher}>
                  <span className={styles.rcGradeDlgTeacherAvatar}>
                    <UserRound size={16} />
                  </span>
                  <div>
                    <em>معلم درس</em>
                    <strong>ثبت نشده</strong>
                  </div>
                </div>
              )}

              <div className={styles.rcGradeDlgStats}>
                <div>
                  <em>ماه قبل</em>
                  <b>{tip.prevScore == null ? '—' : faNum(tip.prevScore)}</b>
                </div>
                <div>
                  <em>تغییر</em>
                  <b className={
                    tip.trend === 'up' ? styles.rcTrendUp
                      : tip.trend === 'down' ? styles.rcTrendDown : ''
                  }>
                    {tip.delta == null
                      ? '—'
                      : `${tip.delta > 0 ? '+' : ''}${faNum(tip.delta)}`}
                  </b>
                </div>
                <div>
                  <em>میانگین درس</em>
                  <b>{tip.subjectAvg == null ? '—' : faNum(tip.subjectAvg)}</b>
                </div>
              </div>

              {tip.trend && tip.trend !== 'none' && tip.trend !== 'empty' ? (
                <div className={`${styles.rcGradeDlgTrend} ${
                  tip.trend === 'up' ? styles.rcGradeDlgTrendUp
                    : tip.trend === 'down' ? styles.rcGradeDlgTrendDown
                      : styles.rcGradeDlgTrendFlat
                }`}
                >
                  <TrendIcon trend={tip.trend} />
                  <span>
                    {tip.trend === 'up' ? 'پیشرفت نسبت به ماه قبل'
                      : tip.trend === 'down' ? 'پسرفت نسبت به ماه قبل'
                        : 'وضعیت ثابت نسبت به ماه قبل'}
                  </span>
                </div>
              ) : (
                <div className={`${styles.rcGradeDlgTrend} ${styles.rcGradeDlgTrendFlat}`}>
                  <Sparkles size={12} />
                  <span>اولین نمره ثبت‌شده در این بازه</span>
                </div>
              )}

              <div className={styles.rcGradeDlgNote}>
                <div className={styles.rcGradeDlgNoteHead}>
                  <MessageSquare size={13} />
                  <span>توضیح معلم</span>
                </div>
                {tip.comment ? (
                  <p>{tip.comment}</p>
                ) : (
                  <p className={styles.rcGradeDlgNoteEmpty}>برای این ماه توضیحی ثبت نشده است.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <YearPickerDialog
        open={picker === 'year'}
        year={year}
        onPick={setYear}
        onClose={() => setPicker(null)}
      />
    </div>
  )
}
