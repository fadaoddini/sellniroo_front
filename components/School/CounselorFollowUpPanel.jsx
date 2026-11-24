'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Filter, FolderOpen, HeartHandshake, Phone, Search, Users,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'high', label: 'بالا' },
  { key: 'medium', label: 'متوسط' },
  { key: 'low', label: 'کم' },
]

const RISK_LABEL = {
  high: 'نیاز به پیگیری',
  medium: 'متوسط',
  low: 'کم',
  none: 'عادی',
}

function mapFile(f, scope) {
  const risk = f.risk_level || 'none'
  return {
    id: f.id,
    scope,
    name: scope === 'teachers' ? f.teacher_name : f.student_name,
    meta: scope === 'teachers'
      ? (f.teacher_specialty || 'معلم')
      : (f.student_grade ? `پایه ${f.student_grade}` : 'دانش‌آموز'),
    mobile: scope === 'teachers' ? f.teacher_mobile : f.student_mobile,
    risk,
    risk_label: f.risk_label || RISK_LABEL[risk] || risk,
    summary: (f.summary_html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 160),
  }
}

export default function CounselorFollowUpPanel({ onNotify, onOpenFile }) {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [st, te] = await Promise.all([
      schoolService.listCounselingFiles(),
      schoolService.listTeacherCounselingFiles(),
    ])
    setLoading(false)
    if (!st.success && !te.success) {
      onNotify?.(st.error || te.error || 'خطا در دریافت پرونده‌ها', true)
      return
    }
    const rows = [
      ...(st.success ? (st.data || []).map((f) => mapFile(f, 'students')) : []),
      ...(te.success ? (te.data || []).map((f) => mapFile(f, 'teachers')) : []),
    ].filter((r) => r.risk === 'high' || r.risk === 'medium' || r.risk === 'low')
    rows.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return (order[a.risk] ?? 9) - (order[b.risk] ?? 9)
    })
    setCases(rows)
  }, [onNotify])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!cases.length) {
      setOpenId(null)
      return
    }
    if (!cases.some((c) => `${c.scope}-${c.id}` === openId)) {
      setOpenId(`${cases[0].scope}-${cases[0].id}`)
    }
  }, [cases, openId])

  const counts = useMemo(() => {
    const base = { all: cases.length, high: 0, medium: 0, low: 0 }
    cases.forEach((c) => {
      if (base[c.risk] != null) base[c.risk] += 1
    })
    return base
  }, [cases])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cases.filter((c) => {
      if (severity !== 'all' && c.risk !== severity) return false
      if (!q) return true
      return [c.name, c.meta, c.mobile, c.risk_label, c.summary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [cases, query, severity])

  const selected =
    filtered.find((c) => `${c.scope}-${c.id}` === openId) || filtered[0] || null

  return (
    <div className={styles.tsp} dir="rtl" lang="fa">
      <header className={styles.tspHead}>
        <div>
          <h2>
            <HeartHandshake size={18} strokeWidth={2.2} aria-hidden />
            نیاز به پیگیری
          </h2>
          <p>
            پرونده‌های دانش‌آموز و معلم با سطح ریسک — اولویت‌بندی و اقدام سریع مشاور
          </p>
        </div>
        <div className={styles.tspHeadStats}>
          <span>
            <strong>{faNum(counts.all)}</strong>
            مورد
          </span>
          <span className={styles.tspStatCrit}>
            <strong>{faNum(counts.high)}</strong>
            بالا
          </span>
          <span className={styles.tspStatHigh}>
            <strong>{faNum(counts.medium)}</strong>
            متوسط
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
            placeholder="جستجو نام، پایه، تخصص…"
            autoComplete="off"
          />
        </div>
        <div className={styles.tspFilters} role="group" aria-label="فیلتر ریسک">
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

      {loading ? (
        <p className={styles.tspEmpty}>در حال بارگذاری…</p>
      ) : !filtered.length ? (
        <div className={styles.tspEmpty}>
          <HeartHandshake size={28} strokeWidth={1.8} aria-hidden />
          <strong>موردی برای پیگیری نیست</strong>
          <p>با تعیین سطح ریسک در پرونده‌ها، صف پیگیری اینجا ساخته می‌شود</p>
        </div>
      ) : (
        <div className={styles.tspLayout}>
          <ul className={styles.tspList} role="listbox" aria-label="لیست پیگیری">
            {filtered.map((c) => {
              const key = `${c.scope}-${c.id}`
              const active = selected && `${selected.scope}-${selected.id}` === key
              const sev = c.risk === 'high' ? 'critical' : c.risk === 'medium' ? 'high' : 'medium'
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`${styles.tspItem} ${
                      active ? styles.tspItemOn : ''
                    } ${styles[`tspItem_${sev}`] || ''}`}
                    onClick={() => setOpenId(key)}
                  >
                    <span className={styles.tspAvatar} aria-hidden>
                      {(c.name || '؟').slice(0, 1)}
                    </span>
                    <span className={styles.tspItemBody}>
                      <strong>{c.name}</strong>
                      <em>
                        {c.scope === 'teachers' ? 'معلم' : 'دانش‌آموز'}
                        {c.meta ? ` · ${c.meta}` : ''}
                      </em>
                    </span>
                    <span className={`${styles.tspBadge} ${styles[`tspBadge_${sev}`] || ''}`}>
                      {c.risk_label}
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
                  <h3>{selected.name}</h3>
                  <p>
                    {selected.scope === 'teachers' ? 'پرونده معلم' : 'پرونده دانش‌آموز'}
                    {' · '}
                    {selected.meta}
                  </p>
                </div>
                <span
                  className={`${styles.tspBadge} ${
                    styles[`tspBadge_${selected.risk === 'high' ? 'critical' : selected.risk === 'medium' ? 'high' : 'medium'}`] || ''
                  }`}
                >
                  {selected.risk_label}
                </span>
              </div>

              <div className={styles.tspFocus}>
                <AlertTriangle size={16} strokeWidth={2.2} aria-hidden />
                <div>
                  <strong>وضعیت پیگیری</strong>
                  <p>
                    {selected.summary
                      || 'خلاصه پرونده هنوز تکمیل نشده — از بخش پرونده یادداشت و جمع‌بندی را ثبت کنید.'}
                  </p>
                </div>
              </div>

              <div className={styles.tspMetaRow}>
                {selected.mobile ? (
                  <span>
                    <Phone size={13} aria-hidden />
                    {selected.mobile}
                  </span>
                ) : null}
                <span>
                  {selected.scope === 'teachers'
                    ? <><Users size={13} aria-hidden /> معلم</>
                    : <><Users size={13} aria-hidden /> دانش‌آموز</>}
                </span>
              </div>

              <div className={styles.tspActions}>
                <button
                  type="button"
                  className={styles.tspActionPrimary}
                  onClick={() => onOpenFile?.(selected.scope, selected.id)}
                >
                  <FolderOpen size={14} />
                  باز کردن پرونده
                </button>
              </div>
            </article>
          ) : null}
        </div>
      )}
    </div>
  )
}
