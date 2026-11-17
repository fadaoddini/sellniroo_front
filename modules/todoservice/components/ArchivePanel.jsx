'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Archive,
  CalendarRange,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import repairsService from '@/components/Repairs/services/repairsService'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import { formatJalaliDate, formatJalaliShort } from '@/utils/dateUtils'
import { useTodoService } from '../context/TodoServiceContext'
import JobCard from './JobCard'
import styles from '../styles/Board.module.css'

const fa = (n) => Number(n || 0).toLocaleString('fa-IR')

function shamsiDay(value) {
  if (!value) return '—'
  const day = String(value).slice(0, 10)
  return formatJalaliDate(day) || formatJalaliShort(day) || day
}

const emptyFilters = {
  q: '',
  status: '',
  technician: '',
  city: '',
  warranty: '',
  completed_from: '',
  completed_to: '',
  archived_from: '',
  archived_to: '',
}

function warrantyLabel(status) {
  if (status === 'active') return 'گارانتی فعال'
  if (status === 'expired') return 'گارانتی منقضی'
  return 'بدون گارانتی'
}

export default function ArchivePanel() {
  const { technicians, openJob, selectedJob } = useTodoService()
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (f = applied) => {
    setLoading(true)
    setError('')
    const params = {}
    Object.entries(f).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== '') params[k] = String(v).trim()
    })
    const res = await repairsService.archivedJobs(params)
    setLoading(false)
    if (!res.success) {
      setItems([])
      setError(res.error || 'خطا در بارگذاری آرشیو')
      return
    }
    setItems(Array.isArray(res.data) ? res.data : [])
  }, [applied])

  useEffect(() => {
    load(applied)
  }, [applied, load])

  const techOptions = useMemo(
    () =>
      (technicians || []).filter((t) => t && (t.is_active !== false || t.id)),
    [technicians],
  )

  const stats = useMemo(() => {
    const active = items.filter((j) => j.warranty_status === 'active').length
    const expired = items.filter((j) => j.warranty_status === 'expired').length
    const canceled = items.filter((j) => j.status === 'canceled').length
    return { total: items.length, active, expired, canceled }
  }, [items])

  const setField = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const apply = () => setApplied({ ...filters })
  const reset = () => {
    setFilters(emptyFilters)
    setApplied(emptyFilters)
  }

  return (
    <div className={styles.archivePanel} dir="rtl">
      <header className={styles.archiveHead}>
        <div>
          <p className={styles.archiveEyebrow}>
            <Archive size={14} /> آرشیو سرویس
          </p>
          <h2>پرونده‌های بایگانی‌شده</h2>
          <p className={styles.archiveLead}>
            جستجو با کد، مشتری، دستگاه، گارانتی و بازه تاریخ
          </p>
        </div>
        <button
          type="button"
          className={styles.intakeBtnGhost}
          disabled={loading}
          onClick={() => load(applied)}
        >
          <RefreshCw size={14} /> بروزرسانی
        </button>
      </header>

      <div className={styles.archiveStats}>
        <span>
          کل <strong>{fa(stats.total)}</strong>
        </span>
        <span>
          گارانتی فعال <strong>{fa(stats.active)}</strong>
        </span>
        <span>
          منقضی <strong>{fa(stats.expired)}</strong>
        </span>
        <span>
          لغو <strong>{fa(stats.canceled)}</strong>
        </span>
      </div>

      <section className={styles.archiveFilters}>
        <div className={styles.archiveFiltersHead}>
          <Filter size={14} />
          <strong>فیلترها</strong>
        </div>
        <div className={styles.archiveFilterGrid}>
          <label className={styles.archiveField}>
            <span>
              <Search size={12} /> جستجو
            </span>
            <input
              value={filters.q}
              onChange={(e) => setField('q', e.target.value)}
              placeholder="کد، نام، موبایل، دستگاه…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') apply()
              }}
            />
          </label>
          <label className={styles.archiveField}>
            <span>وضعیت</span>
            <select
              value={filters.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              <option value="">همه</option>
              <option value="completed">تکمیل‌شده</option>
              <option value="canceled">لغو‌شده</option>
            </select>
          </label>
          <label className={styles.archiveField}>
            <span>
              <UserCog size={12} /> سرویسکار
            </span>
            <select
              value={filters.technician}
              onChange={(e) => setField('technician', e.target.value)}
            >
              <option value="">همه</option>
              {techOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.archiveField}>
            <span>شهر</span>
            <input
              value={filters.city}
              onChange={(e) => setField('city', e.target.value)}
              placeholder="مثلاً تهران"
            />
          </label>
          <label className={styles.archiveField}>
            <span>
              <ShieldCheck size={12} /> گارانتی
            </span>
            <select
              value={filters.warranty}
              onChange={(e) => setField('warranty', e.target.value)}
            >
              <option value="">همه</option>
              <option value="active">فعال</option>
              <option value="expired">منقضی</option>
              <option value="any">دارای تاریخ</option>
              <option value="none">بدون گارانتی</option>
            </select>
          </label>
          <label className={styles.archiveField}>
            <span>
              <CalendarRange size={12} /> تکمیل از (شمسی)
            </span>
            <PersianDatePicker
              value={filters.completed_from}
              onChange={(d) => setField('completed_from', d || '')}
              placeholder="از تاریخ"
              zIndex={120000}
            />
          </label>
          <label className={styles.archiveField}>
            <span>تکمیل تا (شمسی)</span>
            <PersianDatePicker
              value={filters.completed_to}
              onChange={(d) => setField('completed_to', d || '')}
              placeholder="تا تاریخ"
              zIndex={120000}
            />
          </label>
          <label className={styles.archiveField}>
            <span>آرشیو از (شمسی)</span>
            <PersianDatePicker
              value={filters.archived_from}
              onChange={(d) => setField('archived_from', d || '')}
              placeholder="از تاریخ"
              zIndex={120000}
            />
          </label>
          <label className={styles.archiveField}>
            <span>آرشیو تا (شمسی)</span>
            <PersianDatePicker
              value={filters.archived_to}
              onChange={(d) => setField('archived_to', d || '')}
              placeholder="تا تاریخ"
              zIndex={120000}
            />
          </label>
        </div>
        <div className={styles.archiveFilterActions}>
          <button
            type="button"
            className={styles.intakeBtnPrimary}
            onClick={apply}
            disabled={loading}
          >
            اعمال فیلتر
          </button>
          <button
            type="button"
            className={styles.intakeBtnGhost}
            onClick={reset}
            disabled={loading}
          >
            پاک‌کردن
          </button>
        </div>
      </section>

      {error ? <p className={`${styles.msg} ${styles.msgErr}`}>{error}</p> : null}

      {loading ? (
        <p className={styles.archiveEmpty}>در حال بارگذاری آرشیو…</p>
      ) : items.length === 0 ? (
        <p className={styles.archiveEmpty}>موردی با این فیلترها پیدا نشد.</p>
      ) : (
        <div className={styles.archiveGrid}>
          {items.map((job) => (
            <div key={job.id} className={styles.archiveCardWrap}>
              <JobCard
                job={job}
                active={selectedJob?.id === job.id}
                onOpen={openJob}
              />
              <div className={styles.archiveCardMeta}>
                {job.warranty_until ? (
                  <span
                    className={
                      job.warranty_status === 'active'
                        ? styles.archiveWarrOk
                        : styles.archiveWarrBad
                    }
                  >
                    {warrantyLabel(job.warranty_status)} · تا{' '}
                    {shamsiDay(job.warranty_until)}
                  </span>
                ) : (
                  <span className={styles.archiveWarrNone}>بدون گارانتی</span>
                )}
                {job.archived_at ? (
                  <span className={styles.archiveDate}>
                    آرشیو: {shamsiDay(job.archived_at)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
