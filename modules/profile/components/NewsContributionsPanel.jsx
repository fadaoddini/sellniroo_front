'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Loader2,
  Newspaper,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  ExternalLink,
  AlertCircle,
  PenLine,
  Search,
  RefreshCw,
  Calendar,
  Tag,
  User,
} from 'lucide-react'
import moment from 'moment-jalaali'
import { useAuth } from '@/contexts/AuthContext'
import newsService from '@/services/newsService'
import EmptyState from './EmptyState'
import styles from '../styles/NewsContributionsPanel.module.css'

moment.loadPersian({ dialect: 'persian-modern' })

const STATUS_FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'published', label: 'تایید شده' },
  { key: 'pending', label: 'در انتظار تایید' },
  { key: 'review', label: 'در حال بررسی' },
  { key: 'rejected', label: 'رد شده' },
]

const STATUS = {
  pending: { label: 'در انتظار', className: 'pending', icon: Clock },
  review: { label: 'در بررسی', className: 'review', icon: FileEdit },
  published: { label: 'تایید شده', className: 'published', icon: CheckCircle2 },
  rejected: { label: 'رد شده', className: 'rejected', icon: XCircle },
  draft: { label: 'پیش‌نویس', className: 'draft', icon: FileEdit },
  archived: { label: 'بایگانی', className: 'draft', icon: FileEdit },
  scheduled: { label: 'زمان‌بندی', className: 'review', icon: Clock },
}

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return moment(iso).format('jYYYY/jMM/jDD')
  } catch {
    return iso
  }
}

export default function NewsContributionsPanel() {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 320)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      const result = await newsService.getMyContributions(getAuthHeaders())
      if (result.success) {
        setItems(result.data || [])
      } else {
        setError(result.error || 'خطا در دریافت مطالب')
        setItems([])
      }
    } catch {
      setError('خطا در ارتباط با سرور')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter !== 'all') {
      list = list.filter((i) => i.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.excerpt || '').toLowerCase().includes(q) ||
          (i.writer_name || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [items, statusFilter, search])

  const hasFilters = statusFilter !== 'all' || !!search

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} aria-hidden />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو در مطالب ارسالی…"
            aria-label="جستجو در مطالب ارسالی"
          />
        </div>

        <div
          className={styles.statusFilters}
          role="group"
          aria-label="فیلتر وضعیت"
        >
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${styles.statusBtn} ${
                statusFilter === s.key ? styles.activeStatus : ''
              }`}
              onClick={() => setStatusFilter(s.key)}
              aria-pressed={statusFilter === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={load}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={loading ? styles.spinIcon : undefined}
          />
          بروزرسانی
        </button>

        <Link href="/news" className={styles.newBtn}>
          <PenLine size={14} />
          ارسال مطلب
        </Link>
      </div>

      {error && !loading && items.length === 0 ? (
        <div className={styles.errorBox}>
          <AlertCircle size={28} />
          <p>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={load}>
            <RefreshCw size={14} />
            تلاش دوباره
          </button>
        </div>
      ) : null}

      {loading && items.length === 0 ? (
        <div className={styles.loading} role="status">
          <Loader2 className={styles.spinner} size={32} />
          <p>در حال بارگذاری مطالب…</p>
        </div>
      ) : null}

      {!loading && filtered.length === 0 && !error ? (
        <EmptyState
          icon={Newspaper}
          title={
            hasFilters
              ? 'مطلبی با این فیلتر پیدا نشد'
              : 'هنوز مطلبی نفرستاده‌اید'
          }
          description={
            hasFilters
              ? 'فیلتر یا عبارت جستجو را تغییر دهید.'
              : 'از صفحه مجله مطلب بفرستید؛ وضعیت تایید اینجا نمایش داده می‌شود.'
          }
          actionLabel={hasFilters ? undefined : 'رفتن به مجله'}
          actionHref={hasFilters ? undefined : '/news'}
        />
      ) : null}

      {filtered.length > 0 ? (
        <>
          <div
            className={`${styles.listGrid} ${
              loading ? styles.listLoading : ''
            }`}
            aria-busy={loading}
          >
            {filtered.map((item) => {
              const st = STATUS[item.status] || STATUS.pending
              const rejected =
                item.status === 'rejected' &&
                (item.rejection_reason || '').trim()

              return (
                <article key={item.id} className={styles.card}>
                  <div className={styles.media}>
                    <div className={styles.imagePlaceholder}>
                      <Newspaper size={26} strokeWidth={1.7} />
                    </div>
                    <div className={styles.mediaTop}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[st.className] || ''
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>

                  <div className={styles.content}>
                    <h3 className={styles.title} title={item.title}>
                      {item.title || 'بدون عنوان'}
                    </h3>

                    {item.excerpt ? (
                      <p className={styles.excerpt}>{item.excerpt}</p>
                    ) : null}

                    <div className={styles.meta}>
                      <span className={styles.metaItem}>
                        <Calendar size={12} strokeWidth={2.2} aria-hidden />
                        {formatDate(item.created_at)}
                      </span>
                      {item.category_name ? (
                        <span className={styles.metaItem}>
                          <Tag size={12} strokeWidth={2.2} aria-hidden />
                          {item.category_name}
                        </span>
                      ) : null}
                      {item.writer_name ? (
                        <span className={styles.metaItem}>
                          <User size={12} strokeWidth={2.2} aria-hidden />
                          {item.writer_name}
                        </span>
                      ) : null}
                    </div>

                    {rejected ? (
                      <div className={styles.rejectBox}>
                        <strong>دلیل رد</strong>
                        <p>{item.rejection_reason}</p>
                      </div>
                    ) : null}

                    <div className={styles.footer}>
                      {item.reviewed_at ? (
                        <span className={styles.reviewed}>
                          بررسی: {formatDate(item.reviewed_at)}
                        </span>
                      ) : (
                        <span className={styles.reviewed}>—</span>
                      )}
                      {item.status === 'published' && item.slug ? (
                        <Link
                          href={`/news/${item.slug}`}
                          className={styles.viewBtn}
                          target="_blank"
                        >
                          مشاهده
                          <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <span className={styles.viewBtnDisabled}>
                          {item.status === 'rejected'
                            ? 'منتشر نشده'
                            : 'در صف بررسی'}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className={styles.pager}>
            <p className={styles.pagerMeta}>
              {faNum(filtered.length)} مطلب
              {hasFilters ? ` از ${faNum(items.length)}` : ''}
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
