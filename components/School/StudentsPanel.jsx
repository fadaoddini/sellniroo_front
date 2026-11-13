'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
  BookCheck,
  BookOpenCheck,
  CalendarX2,
  Loader2,
  Medal,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const RANK_ORDER = {
  diamond: 5,
  platinum: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
}

const RANK_LABEL = {
  diamond: 'الماس',
  platinum: 'پلاتین',
  gold: 'طلایی',
  silver: 'نقره‌ای',
  bronze: 'برنزی',
}

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

function RankMedal({ tier, size = 16, className = '' }) {
  const t = (tier || 'bronze').toLowerCase()
  return (
    <span
      className={`${styles.rankMedal} ${styles[`rankMedal_${t}`] || styles.rankMedal_bronze} ${className}`}
      title={RANK_LABEL[t] || tier || 'رتبه'}
      aria-label={RANK_LABEL[t] || tier || 'رتبه'}
    >
      <Medal size={size} strokeWidth={2.2} />
    </span>
  )
}

function PlaceBadge({ place, highlight = false }) {
  if (!place) return null
  const top = place <= 3
  return (
    <span
      className={[
        styles.placeBadge,
        top ? styles[`placeBadge_${place}`] : styles.placeBadgeMuted,
        highlight && top ? styles.placeBadgeGlow : '',
      ].filter(Boolean).join(' ')}
      title={`نفر ${faNum(place)} کلاس`}
      aria-label={`نفر ${faNum(place)} کلاس`}
    >
      {faNum(place)}
    </span>
  )
}

function onlyDigits(raw) {
  const map = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  }
  return String(raw || '')
    .split('')
    .map((c) => map[c] || c)
    .join('')
    .replace(/\D/g, '')
}

function GradesBar({ grades = [] }) {
  const data = useMemo(() => ({
    labels: grades.map((g) => g.subject),
    datasets: [{
      label: 'میانگین نمره ٪',
      data: grades.map((g) => g.avg),
      backgroundColor: grades.map((g) => g.color || 'rgba(14, 165, 233, 0.7)'),
      borderRadius: 8,
      maxBarThickness: 28,
    }],
  }), [grades])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        textDirection: 'rtl',
        callbacks: {
          label(ctx) {
            const row = grades[ctx.dataIndex]
            const avg = faNum(ctx.parsed.y)
            const count = row?.count ? ` · ${faNum(row.count)} نمره` : ''
            return `${avg}٪${count}`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { family: 'inherit', size: 10 },
          maxRotation: 45,
          minRotation: 0,
          color: '#64748b',
        },
        grid: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          font: { family: 'inherit', size: 10 },
          color: '#64748b',
          callback: (v) => faNum(v),
        },
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
      },
    },
  }), [grades])

  if (!grades.length) {
    return <p className={styles.studentsChartEmpty}>هنوز نمره‌ای برای این دانش‌آموز ثبت نشده</p>
  }

  return (
    <div className={styles.studentsChartBody}>
      <Bar data={data} options={options} />
    </div>
  )
}

export default function StudentsPanel({
  students = [],
  studentMobile,
  studentName,
  onMobileChange,
  onNameChange,
  onAdd,
  onReload,
  busy = false,
  onNotify,
  teacherId = null,
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [lookupBusy, setLookupBusy] = useState(false)
  const [lookupHint, setLookupHint] = useState('')
  const [snapshot, setSnapshot] = useState(null)
  const [snapBusy, setSnapBusy] = useState(false)
  const lookupSeq = useRef(0)
  const snapSeq = useRef(0)

  const rankedStudents = useMemo(() => {
    const list = [...(students || [])]
    list.sort((a, b) => {
      const pa = Number(a.activity_points) || 0
      const pb = Number(b.activity_points) || 0
      if (pb !== pa) return pb - pa
      const ra = RANK_ORDER[(a.rank_tier || 'bronze').toLowerCase()] || 0
      const rb = RANK_ORDER[(b.rank_tier || 'bronze').toLowerCase()] || 0
      if (rb !== ra) return rb - ra
      return String(a.display_name || '').localeCompare(String(b.display_name || ''), 'fa')
    })
    return list.map((s, i) => ({ ...s, classPlace: i + 1 }))
  }, [students])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rankedStudents
    return rankedStudents.filter((s) => {
      const name = (s.display_name || '').toLowerCase()
      const mobile = (s.mobile || '').toLowerCase()
      return name.includes(q) || mobile.includes(q)
    })
  }, [rankedStudents, query])

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) || null,
    [students, selectedId],
  )

  const mobileDigits = onlyDigits(studentMobile)

  const alreadyInClass = useMemo(() => {
    if (mobileDigits.length < 6) return null
    return (
      students.find((s) => onlyDigits(s.mobile) === mobileDigits)
      || matches.find((m) => m.already_in_class && onlyDigits(m.mobile) === mobileDigits)
      || null
    )
  }, [students, matches, mobileDigits])

  useEffect(() => {
    if (!selectedId) {
      setSnapshot(null)
      return undefined
    }
    const seq = ++snapSeq.current
    setSnapBusy(true)
    setSnapshot(null)
    const params = teacherId ? { teacher: teacherId } : {}
    schoolService.studentSnapshot(selectedId, params).then((res) => {
      if (seq !== snapSeq.current) return
      setSnapBusy(false)
      if (!res.success) {
        onNotify?.(res.error || 'بارگذاری جزئیات ناموفق بود', true)
        setSnapshot(null)
        return
      }
      setSnapshot(res.data || null)
    })
    return () => {
      snapSeq.current += 1
    }
  }, [selectedId, teacherId, onNotify])

  useEffect(() => {
    if (mobileDigits.length < 6) {
      setMatches([])
      setLookupHint(mobileDigits.length ? 'حداقل ۶ رقم وارد کنید…' : '')
      setLookupBusy(false)
      return undefined
    }

    const seq = ++lookupSeq.current
    setLookupBusy(true)
    setLookupHint('در حال جستجوی مشابه…')
    const t = window.setTimeout(async () => {
      const res = await schoolService.lookupStudents({ mobile: mobileDigits })
      if (seq !== lookupSeq.current) return
      setLookupBusy(false)
      if (!res.success) {
        setMatches([])
        setLookupHint(res.error || 'جستجو ناموفق بود')
        return
      }
      const rows = res.data?.matches || []
      setMatches(rows)
      setLookupHint(
        rows.length
          ? `${faNum(rows.length)} مورد مشابه پیدا شد`
          : 'مشابهی در دیتابیس نیست — می‌توانید جدید بسازید',
      )
    }, 280)

    return () => window.clearTimeout(t)
  }, [mobileDigits])

  const pickMatch = (m) => {
    onMobileChange?.(m.mobile || '')
    if (m.display_name) onNameChange?.(m.display_name)
    setLookupHint(
      m.already_in_class
        ? 'این دانش‌آموز از قبل در کلاس شماست'
        : 'انتخاب شد — برای افزودن دکمه را بزنید',
    )
  }

  return (
    <div className={styles.studentsLayout3}>
      <aside className={styles.studentsCol}>
        <div className={styles.studentsColHead}>
          <div>
            <h2 className={styles.panelTitle}>لیست کلاس</h2>
            <p className={styles.metaMuted}>{faNum(students.length)} دانش‌آموز</p>
          </div>
          <button
            type="button"
            className={styles.hwBoardRefresh}
            onClick={onReload}
            title="بروزرسانی"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <label className={styles.studentsSearch}>
          <Search size={14} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو نام یا موبایل…"
          />
        </label>

        <div className={styles.studentsList} role="list">
          {filtered.map((s) => {
            const on = selectedId === s.id
            const top = s.classPlace <= 3
            return (
              <button
                key={s.id}
                type="button"
                className={[
                  styles.studentsRow,
                  on ? styles.studentsRowOn : '',
                  top ? styles[`studentsRowTop${s.classPlace}`] : '',
                ].filter(Boolean).join(' ')}
                role="listitem"
                onClick={() => setSelectedId(s.id)}
              >
                <PlaceBadge place={s.classPlace} highlight={top} />
                <span className={styles.studentAvatar} aria-hidden>
                  {(s.display_name || s.mobile || '?').slice(0, 1)}
                </span>
                <span className={styles.studentsRowMain}>
                  <strong>{s.display_name || 'بدون نام'}</strong>
                  <em>{faNum(s.activity_points ?? 0)} امتیاز</em>
                </span>
                <RankMedal tier={s.rank_tier} />
              </button>
            )
          })}
          {!filtered.length ? (
            <p className={styles.empty}>
              {students.length ? 'نتیجه‌ای نیست' : 'هنوز دانش‌آموزی نیست'}
            </p>
          ) : null}
        </div>
      </aside>

      <section className={styles.studentsCol}>
        <div className={styles.studentsColHead}>
          <div>
            <h2 className={styles.panelTitle}>جزئیات</h2>
            <p className={styles.metaMuted}>
              {selected ? 'پروفایل انتخاب‌شده' : 'یک نفر را از لیست انتخاب کنید'}
            </p>
          </div>
        </div>

        <div className={styles.studentsColBody}>
          {selected ? (
            <>
              <div className={styles.studentDetailHero}>
                <div className={styles.studentAvatarLg} aria-hidden>
                  {(selected.display_name || selected.mobile || '?').slice(0, 1)}
                </div>
                <div>
                  <strong className={styles.studentsDetailName}>
                    {selected.display_name || 'بدون نام'}
                    <RankMedal tier={selected.rank_tier} size={18} />
                    <PlaceBadge
                      place={rankedStudents.find((s) => s.id === selected.id)?.classPlace}
                      highlight
                    />
                  </strong>
                  <p dir="ltr">{selected.mobile}</p>
                  {selected.grade ? (
                    <em className={styles.studentsGradeTag}>پایه {selected.grade}</em>
                  ) : null}
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>امتیاز</p>
                  <p className={styles.statValue}>{faNum(selected.activity_points ?? 0)}</p>
                </div>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>رتبه مدال</p>
                  <p className={styles.statValueMedal}>
                    <RankMedal tier={selected.rank_tier} size={22} />
                  </p>
                </div>
                <div className={`${styles.stat} ${styles.statOk}`}>
                  <p className={styles.statLabel}>معدل</p>
                  <p className={styles.statValue}>
                    {faNum(snapshot?.average_percent ?? selected.average_percent ?? 0)}٪
                  </p>
                </div>
              </div>

              <div className={styles.studentsInsightRow3}>
                <div className={`${styles.studentsInsight} ${styles.studentsInsightHwDone}`}>
                  <BookCheck size={16} />
                  <div>
                    <strong>
                      {snapBusy ? '…' : faNum(snapshot?.completed_homework ?? 0)}
                    </strong>
                    <span>تکلیف انجام‌شده</span>
                  </div>
                </div>
                <div className={`${styles.studentsInsight} ${styles.studentsInsightHw}`}>
                  <BookOpenCheck size={16} />
                  <div>
                    <strong>
                      {snapBusy ? '…' : faNum(snapshot?.unfinished_homework ?? 0)}
                    </strong>
                    <span>تکلیف انجام‌نشده</span>
                  </div>
                </div>
                <div className={`${styles.studentsInsight} ${styles.studentsInsightAbs}`}>
                  <CalendarX2 size={16} />
                  <div>
                    <strong>
                      {snapBusy ? '…' : faNum(snapshot?.absent_days ?? 0)}
                    </strong>
                    <span>روز غیبت</span>
                  </div>
                </div>
              </div>

              <div className={styles.studentsChartCard}>
                <div className={styles.studentsChartHead}>
                  <strong>نمرات همه دروس</strong>
                  <em>کارنامه + آزمون و کوییز</em>
                </div>
                {snapBusy ? (
                  <p className={styles.studentsChartEmpty}>
                    <Loader2 size={14} className={styles.hwSpin} /> در حال بارگذاری…
                  </p>
                ) : (
                  <GradesBar grades={snapshot?.subject_grades || []} />
                )}
              </div>
            </>
          ) : (
            <div className={styles.studentsEmptyDetail}>
              <Users size={28} strokeWidth={1.6} />
              <strong>هنوز کسی انتخاب نشده</strong>
              <p>از ستون راست یک دانش‌آموز را بزنید تا جزئیاتش اینجا بیاید.</p>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.studentsCol} ${styles.studentsAddCol}`}>
        <div className={styles.studentsColHead}>
          <div>
            <h2 className={styles.panelTitle}>افزودن</h2>
            <p className={styles.metaMuted}>با ۶ رقم اول، مشابه‌ها پیدا می‌شوند</p>
          </div>
        </div>

        <div className={styles.studentsColBody}>
          <div className={styles.hintBox}>
            <UserPlus size={14} />
            اگر کاربر از قبل باشد، همان حساب به کلاس شما وصل می‌شود.
          </div>

          <div className={styles.field}>
            <label>موبایل</label>
            <input
              dir="ltr"
              inputMode="numeric"
              autoComplete="tel"
              value={studentMobile}
              onChange={(e) => onMobileChange?.(e.target.value)}
              placeholder="09xxxxxxxx"
            />
            <p className={styles.studentsLookupHint}>
              {lookupBusy ? <Loader2 size={12} className={styles.hwSpin} /> : null}
              {lookupHint || 'شماره را وارد کنید'}
            </p>
          </div>

          {matches.length ? (
            <div className={styles.studentsMatches} role="list">
              <em className={styles.studentsMatchesLabel}>مشابه‌های دیتابیس</em>
              {matches.map((m) => (
                <button
                  key={`${m.user_id}-${m.mobile}`}
                  type="button"
                  className={`${styles.studentsMatch} ${
                    m.already_in_class ? styles.studentsMatchIn : ''
                  }`}
                  role="listitem"
                  onClick={() => pickMatch(m)}
                  disabled={m.already_in_class}
                  title={
                    m.already_in_class
                      ? 'از قبل در کلاس شماست'
                      : 'انتخاب این شماره'
                  }
                >
                  <span className={styles.studentAvatar} aria-hidden>
                    {(m.display_name || m.mobile || '?').slice(0, 1)}
                  </span>
                  <span className={styles.studentsRowMain}>
                    <strong>{m.display_name || 'بدون نام'}</strong>
                    <em dir="ltr">{m.mobile}</em>
                  </span>
                  <span className={styles.pill}>
                    {m.already_in_class
                      ? 'در کلاس'
                      : m.student_id
                        ? 'دانش‌آموز'
                        : 'کاربر'}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.field}>
            <label>نام نمایشی</label>
            <input
              value={studentName}
              onChange={(e) => onNameChange?.(e.target.value)}
              placeholder="مثلاً سارا محمدی"
            />
          </div>

          {alreadyInClass ? (
            <p className={styles.studentsDupWarn}>
              این شماره از قبل در کلاس است
              {alreadyInClass.display_name ? ` (${alreadyInClass.display_name})` : ''}
              — افزودن مجدد ممکن نیست.
            </p>
          ) : null}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnAccent}
              disabled={busy || mobileDigits.length < 6 || Boolean(alreadyInClass)}
              onClick={() => {
                if (mobileDigits.length < 6) {
                  onNotify?.('حداقل ۶ رقم موبایل لازم است', true)
                  return
                }
                if (alreadyInClass) {
                  onNotify?.('این شماره از قبل در این کلاس ثبت شده است', true)
                  return
                }
                onAdd?.()
              }}
            >
              {busy ? <Loader2 size={14} className={styles.hwSpin} /> : <Plus size={14} />}
              افزودن به کلاس
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
