'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Phone,
  Search,
  User,
  Calendar,
  RotateCcw,
  Hash,
} from 'lucide-react'
import karmandanService from '../services/karmandanService'
import styles from '../styles/SaleArchive.module.css'

const STATUS_LABEL = {
  new: 'جدید',
  in_progress: 'پیگیری',
  confirmed: 'قرارداد',
  cancelled: 'بسته',
}

const STATUS_COLOR = {
  new: { bg: '#eff6ff', color: '#1d4ed8' },
  in_progress: { bg: '#fff7ed', color: '#c2410c' },
  confirmed: { bg: '#f0fdf4', color: '#15803d' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c' },
}

export default function SaleArchive({ onViewDetail, onChanged }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 12,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  })
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 320)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, status])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await karmandanService.getArchivedLeads({
        q: debouncedQuery || undefined,
        status: status || undefined,
        page,
        per_page: 12,
      })
      setItems(Array.isArray(res?.data) ? res.data : [])
      setPagination(
        res?.pagination || {
          total: 0,
          page: 1,
          per_page: 12,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        }
      )
    } catch (err) {
      setError(err?.message || err?.error || err?.detail || 'بارگذاری آرشیو ناموفق بود')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, status, page])

  useEffect(() => {
    load()
  }, [load])

  const handleUnarchive = async (item) => {
    if (!item?.id || busyId) return
    try {
      setBusyId(item.id)
      await karmandanService.unarchiveLead(item.id)
      await load()
      onChanged?.()
    } catch (err) {
      alert(err?.message || err?.error || 'بازگردانی ناموفق بود')
    } finally {
      setBusyId(null)
    }
  }

  const formatItem = (lead) => ({
    id: lead.id,
    title: lead.title,
    phone: lead.phone,
    status: lead.status,
    status_display: lead.status_display,
    tracking_code: lead.tracking_code || '',
    description: lead.description || '',
    customer_name: lead.customer_name || '',
    createdAt: lead.created_at,
    nextFollowUp: lead.next_follow_up,
    nextFollowUpTime: lead.next_follow_up_time,
    assigned_to: lead.assigned_to,
    assigned_to_name: lead.assigned_to_name,
    created_by: lead.created_by,
    created_by_name: lead.created_by_name,
    is_archived: true,
    archived_at: lead.archived_at,
  })

  return (
    <section className={styles.wrap} dir="rtl">
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2>
            <Archive size={15} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
            آرشیو فروش
          </h2>
          <p>موارد آرشیوشده اینجا می‌مانند؛ قابل جستجو و بازگردانی هستند.</p>
        </div>
        <div className={styles.filters}>
          <div className={styles.search}>
            <Search size={14} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی کد پیگیری، عنوان، موبایل..."
            />
          </div>
          <select
            className={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="new">جدید</option>
            <option value="in_progress">پیگیری</option>
            <option value="confirmed">قرارداد</option>
            <option value="cancelled">بسته شده</option>
          </select>
        </div>
      </div>

      <div className={styles.meta}>
        {(pagination.total || 0).toLocaleString('fa-IR')} مورد در آرشیو
        {debouncedQuery ? ` · نتیجه جستجو برای «${debouncedQuery}»` : ''}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 size={18} className={styles.spin} /> در حال بارگذاری آرشیو...
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <Archive size={28} />
          <p>موردی در آرشیو نیست</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((lead) => {
            const tone = STATUS_COLOR[lead.status] || STATUS_COLOR.new
            return (
              <article key={lead.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.code}>
                      <Hash size={11} />
                      {lead.tracking_code || `SL-${String(lead.id).padStart(6, '0')}`}
                    </div>
                    <h3 className={styles.title}>{lead.title}</h3>
                  </div>
                  <span
                    className={styles.badge}
                    style={{ background: tone.bg, color: tone.color }}
                  >
                    {lead.status_display || STATUS_LABEL[lead.status] || lead.status}
                  </span>
                </div>
                {lead.customer_name ? (
                  <span className={styles.customer}>
                    <User size={12} />
                    {lead.customer_name}
                  </span>
                ) : null}
                <span className={styles.phone}>
                  <Phone size={12} />
                  {lead.phone}
                </span>
                {lead.assigned_to_name ? (
                  <span className={styles.owner}>
                    <User size={12} />
                    {lead.assigned_to_name}
                  </span>
                ) : null}
                {lead.archived_at ? (
                  <span className={styles.date}>
                    <Calendar size={12} />
                    آرشیو: {new Date(lead.archived_at).toLocaleDateString('fa-IR')}
                  </span>
                ) : null}
                {lead.description ? (
                  <p className={styles.desc}>
                    {lead.description.length > 110
                      ? `${lead.description.slice(0, 110)}...`
                      : lead.description}
                  </p>
                ) : null}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => onViewDetail?.(formatItem(lead))}
                  >
                    <Eye size={14} />
                    جزئیات
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId === lead.id}
                    onClick={() => handleUnarchive(lead)}
                  >
                    <RotateCcw size={14} />
                    {busyId === lead.id ? '...' : 'بازگردانی'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!loading && pagination.total_pages > 1 ? (
        <div className={styles.pager}>
          <div className={styles.pagerInfo}>
            صفحه {(pagination.page || 1).toLocaleString('fa-IR')} از{' '}
            {(pagination.total_pages || 1).toLocaleString('fa-IR')}
          </div>
          <div className={styles.pagerBtns}>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={!pagination.has_previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight size={14} />
              قبلی
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={!pagination.has_next}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
