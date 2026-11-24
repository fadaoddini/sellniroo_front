'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Brain, Filter, FolderOpen, RefreshCw, Search } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const KINDS = [
  { key: 'all', label: 'همه' },
  { key: 'iq', label: 'IQ' },
  { key: 'eq', label: 'EQ' },
  { key: 'personality', label: 'شخصیت' },
  { key: 'career', label: 'هدایت' },
  { key: 'interest', label: 'علاقه' },
  { key: 'custom', label: 'سایر' },
]

const KIND_COLORS = {
  iq: '#2563eb',
  eq: '#e11d48',
  personality: '#7c3aed',
  career: '#0d9488',
  interest: '#d97706',
  custom: '#64748b',
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

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

export default function CounselingAttemptsPanel({ onNotify, onOpenStudentFile }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await schoolService.listCounselingAttempts()
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت نتایج', true)
      return
    }
    setRows(res.data || [])
  }, [onNotify])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((a) => {
      if (kind !== 'all' && (a.test_kind || 'custom') !== kind) return false
      if (!q) return true
      return [
        a.student_name,
        a.test_title,
        a.test_kind_label,
        a.result_label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [rows, query, kind])

  const counts = useMemo(() => {
    const base = { all: rows.length }
    KINDS.forEach((k) => {
      if (k.key === 'all') return
      base[k.key] = rows.filter((a) => (a.test_kind || 'custom') === k.key).length
    })
    return base
  }, [rows])

  return (
    <div className={styles.cap} dir="rtl" lang="fa">
      <header className={styles.capHead}>
        <div>
          <h2>
            <Brain size={18} />
            نتایج آزمون‌های مشاوره
          </h2>
          <p>همه تلاش‌های ثبت‌شده دانش‌آموزان — فیلتر، جستجو و ورود به پرونده</p>
        </div>
        <button type="button" className={styles.btnGhost} onClick={load} disabled={loading}>
          <RefreshCw size={14} />
          بروزرسانی
        </button>
      </header>

      <div className={styles.capToolbar}>
        <div className={styles.capSearch}>
          <Search size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو نام یا عنوان آزمون…"
            autoComplete="off"
          />
        </div>
        <div className={styles.capFilters} role="group" aria-label="نوع آزمون">
          <Filter size={14} />
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              className={`${styles.capFilterBtn} ${kind === k.key ? styles.capFilterOn : ''}`}
              onClick={() => setKind(k.key)}
            >
              {k.label}
              <em>{faNum(counts[k.key] || 0)}</em>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={styles.capEmpty}>در حال بارگذاری…</p>
      ) : !filtered.length ? (
        <div className={styles.capEmptyBox}>
          <Brain size={26} />
          <strong>نتیجه‌ای یافت نشد</strong>
          <p>با برگزاری آزمون‌های مشاوره، نتایج اینجا جمع می‌شوند</p>
        </div>
      ) : (
        <div className={styles.capTableWrap}>
          <table className={styles.capTable}>
            <thead>
              <tr>
                <th>دانش‌آموز</th>
                <th>آزمون</th>
                <th>نوع</th>
                <th>نتیجه</th>
                <th>درصد</th>
                <th>تاریخ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const pct = pctOf(a.score, a.max_score)
                const color = KIND_COLORS[a.test_kind] || KIND_COLORS.custom
                return (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.student_name || '—'}</strong>
                    </td>
                    <td>{a.test_title || '—'}</td>
                    <td>
                      <span className={styles.capKind} style={{ '--cap-kind': color }}>
                        {a.test_kind_label || a.test_kind || '—'}
                      </span>
                    </td>
                    <td>{a.result_label || '—'}</td>
                    <td>
                      <strong style={{ color }}>{faNum(pct)}٪</strong>
                      <small className={styles.capScoreSub}>
                        {faNum(a.score)}/{faNum(a.max_score)}
                      </small>
                    </td>
                    <td>{formatDate(a.submitted_at || a.created_at)}</td>
                    <td>
                      {a.student_id || a.counseling_file_id ? (
                        <button
                          type="button"
                          className={styles.capOpenBtn}
                          onClick={() => onOpenStudentFile?.(a)}
                          title="باز کردن پرونده"
                        >
                          <FolderOpen size={14} />
                          پرونده
                        </button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
