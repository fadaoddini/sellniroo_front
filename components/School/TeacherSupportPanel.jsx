'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  HeartHandshake,
  Search,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  TrendingDown,
  ClipboardCheck,
  Phone,
  Filter,
} from 'lucide-react'
import styles from './School.module.css'

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
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

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'critical', label: 'بحرانی' },
  { key: 'high', label: 'بالا' },
  { key: 'medium', label: 'متوسط' },
]

export default function TeacherSupportPanel({
  cases = [],
  onNavigate,
}) {
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const [openId, setOpenId] = useState(cases[0]?.student_id ?? null)

  useEffect(() => {
    if (!cases.length) {
      setOpenId(null)
      return
    }
    if (!cases.some((c) => String(c.student_id) === String(openId))) {
      setOpenId(cases[0].student_id)
    }
  }, [cases, openId])

  const counts = useMemo(() => {
    const base = { all: cases.length, critical: 0, high: 0, medium: 0 }
    cases.forEach((c) => {
      if (base[c.severity] != null) base[c.severity] += 1
    })
    return base
  }, [cases])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cases.filter((c) => {
      if (severity !== 'all' && c.severity !== severity) return false
      if (!q) return true
      const hay = [
        c.student_name,
        c.grade,
        c.mobile,
        c.primary_weak_subject,
        c.focus_summary,
        ...(c.weak_subjects || []).map((s) => s.subject),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [cases, query, severity])

  const selected =
    filtered.find((c) => String(c.student_id) === String(openId)) ||
    filtered[0] ||
    null

  return (
    <div className={styles.tsp}>
      <header className={styles.tspHead}>
        <div>
          <h2>
            <HeartHandshake size={18} strokeWidth={2.2} aria-hidden />
            نیاز به حمایت
          </h2>
          <p>
            دانش‌آموزانی که ضعف درسی دارند — ببینید کجا ضعیف‌اند و چه کمکی مؤثر است
          </p>
        </div>
        <div className={styles.tspHeadStats}>
          <span>
            <strong>{faNum(counts.all)}</strong>
            نفر
          </span>
          <span className={styles.tspStatCrit}>
            <strong>{faNum(counts.critical)}</strong>
            بحرانی
          </span>
          <span className={styles.tspStatHigh}>
            <strong>{faNum(counts.high)}</strong>
            بالا
          </span>
        </div>
      </header>

      <div className={styles.tspToolbar}>
        <div className={styles.tspSearch}>
          <Search size={15} strokeWidth={2.2} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو نام، درس ضعیف، پایه…"
            autoComplete="off"
          />
        </div>
        <div className={styles.tspFilters} role="group" aria-label="فیلتر شدت">
          <Filter size={14} strokeWidth={2.2} aria-hidden />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.tspFilterBtn} ${
                severity === f.key ? styles.tspFilterOn : ''
              }`}
              onClick={() => setSeverity(f.key)}
            >
              {f.label}
              <em>{faNum(counts[f.key] || 0)}</em>
            </button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <div className={styles.tspEmpty}>
          <HeartHandshake size={28} strokeWidth={1.8} aria-hidden />
          <strong>فعلاً موردی برای نمایش نیست</strong>
          <p>
            با ثبت آزمون و کوییز، دانش‌آموزان نیازمند حمایت اینجا ظاهر می‌شوند
          </p>
        </div>
      ) : (
        <div className={styles.tspLayout}>
          <ul className={styles.tspList} role="listbox" aria-label="لیست حمایت">
            {filtered.map((c) => {
              const active = selected && String(selected.student_id) === String(c.student_id)
              return (
                <li key={c.student_id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`${styles.tspItem} ${
                      active ? styles.tspItemOn : ''
                    } ${styles[`tspItem_${c.severity}`] || ''}`}
                    onClick={() => setOpenId(c.student_id)}
                  >
                    <span className={styles.tspAvatar} aria-hidden>
                      {(c.student_name || '؟').slice(0, 1)}
                    </span>
                    <span className={styles.tspItemBody}>
                      <strong>{c.student_name}</strong>
                      <em>
                        {c.grade ? `پایه ${c.grade} · ` : ''}
                        میانگین {faNum(c.overall_avg)}٪
                        {c.primary_weak_subject
                          ? ` · ضعف: ${c.primary_weak_subject}`
                          : ''}
                      </em>
                    </span>
                    <span className={`${styles.tspBadge} ${styles[`tspBadge_${c.severity}`] || ''}`}>
                      {c.severity_label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {selected ? (
            <article className={styles.tspDetail}>
              <div className={styles.tspDetailHead}>
                <div>
                  <h3>{selected.student_name}</h3>
                  <p>
                    {selected.grade ? `پایه ${selected.grade}` : 'بدون پایه'}
                    {' · '}
                    میانگین کل {faNum(selected.overall_avg)}٪
                    {' · '}
                    {faNum(selected.assessment_count)} ارزیابی
                  </p>
                </div>
                <span
                  className={`${styles.tspBadge} ${styles[`tspBadge_${selected.severity}`] || ''}`}
                >
                  اولویت {selected.severity_label}
                </span>
              </div>

              <div className={styles.tspFocus}>
                <AlertTriangle size={16} strokeWidth={2.2} aria-hidden />
                <div>
                  <strong>تمرکز کمک</strong>
                  <p>{selected.focus_summary}</p>
                </div>
              </div>

              <div className={styles.tspMetaRow}>
                {selected.mobile ? (
                  <span>
                    <Phone size={13} aria-hidden />
                    {selected.mobile}
                  </span>
                ) : null}
                {selected.pending_homework > 0 ? (
                  <button
                    type="button"
                    className={styles.tspMetaBtn}
                    onClick={() => onNavigate?.('reviews')}
                  >
                    <ClipboardCheck size={13} aria-hidden />
                    {faNum(selected.pending_homework)} تکلیف در انتظار
                  </button>
                ) : null}
                {selected.best_subject ? (
                  <span>
                    <BookOpen size={13} aria-hidden />
                    نقطه قوت: {selected.best_subject} ({faNum(selected.best_avg)}٪)
                  </span>
                ) : null}
              </div>

              <section className={styles.tspSection}>
                <h4>
                  <TrendingDown size={15} strokeWidth={2.2} aria-hidden />
                  دروس نیازمند تقویت
                </h4>
                {!(selected.weak_subjects || []).length ? (
                  <p className={styles.tspMuted}>
                    تفکیک درسی کافی نیست — میانگین کلی پایین است
                  </p>
                ) : (
                  <ul className={styles.tspSubjects}>
                    {selected.weak_subjects.map((s) => (
                      <li key={`${s.subject_id || s.subject}`}>
                        <span
                          className={styles.tspSubDot}
                          style={{ background: s.color || '#b45309' }}
                          aria-hidden
                        />
                        <div>
                          <strong>{s.subject}</strong>
                          <em>
                            میانگین دانش‌آموز {faNum(s.avg)}٪
                            {s.class_avg != null
                              ? ` · میانگین کلاس ${faNum(s.class_avg)}٪`
                              : ''}
                            {s.gap_from_class != null && s.gap_from_class > 0
                              ? ` · فاصله ${faNum(s.gap_from_class)}٪`
                              : ''}
                            {' · '}
                            {faNum(s.count)} نمره
                          </em>
                        </div>
                        <div className={styles.tspSubBar}>
                          <i style={{ width: `${Math.max(4, Math.min(100, s.avg))}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className={styles.tspSection}>
                <h4>
                  <Lightbulb size={15} strokeWidth={2.2} aria-hidden />
                  پیشنهاد کمک معلم
                </h4>
                <ol className={styles.tspTips}>
                  {(selected.suggestions || []).map((tip, i) => (
                    <li key={`${selected.student_id}-tip-${i}`}>{tip}</li>
                  ))}
                </ol>
              </section>

              {(selected.recent_low_scores || []).length ? (
                <section className={styles.tspSection}>
                  <h4>نمرات اخیر پایین</h4>
                  <ul className={styles.tspLows}>
                    {selected.recent_low_scores.map((row, i) => (
                      <li key={`${selected.student_id}-low-${i}`}>
                        <span>
                          {row.kind === 'exam' ? 'آزمون' : 'کوییز'}
                        </span>
                        <div>
                          <strong>{row.title}</strong>
                          <em>
                            {faNum(row.score)}٪
                            {row.at ? ` · ${relativeFa(row.at)}` : ''}
                          </em>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className={styles.tspActions}>
                <button
                  type="button"
                  className={styles.tspActionPrimary}
                  onClick={() => onNavigate?.('exams')}
                >
                  ساخت آزمون تشخیصی
                </button>
                <button
                  type="button"
                  className={styles.tspActionGhost}
                  onClick={() => onNavigate?.('curriculum')}
                >
                  رفتن به برنامه درسی
                </button>
                <button
                  type="button"
                  className={styles.tspActionGhost}
                  onClick={() => onNavigate?.('bank')}
                >
                  بانک سوال
                </button>
              </div>
            </article>
          ) : null}
        </div>
      )}
    </div>
  )
}
