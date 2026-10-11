// app/(admin)/jobs-manage/page.jsx — مدیریت آگهی‌های شغلی
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Briefcase, RefreshCw, Shield, LayoutDashboard, Search,
  CheckCircle2, XCircle, Star, Eye, Trash2, Power, X,
  MapPin, Building2, User, ExternalLink, Clock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import styles from './JobsManage.module.css'

const STATUS_TABS = [
  { id: '', key: 'all' },
  { id: 'pending', key: 'pending' },
  { id: 'approved', key: 'approved' },
  { id: 'rejected', key: 'rejected' },
  { id: 'expired', key: 'expired' },
]

function formatDate(value, language) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(language === 'en' ? 'en-GB' : 'fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'pending': return styles.badgePending
    case 'approved': return styles.badgeApproved
    case 'rejected': return styles.badgeRejected
    case 'expired': return styles.badgeExpired
    default: return styles.badgeExpired
  }
}

export default function JobsManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('pending')
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [drawer, setDrawer] = useState(null)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Job listings',
    subtitle: 'Review, approve and manage all job ads',
    back: 'Dashboard',
    loading: 'Loading...',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can manage job listings',
    search: 'Search title, company...',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    hiring: 'Hiring',
    seeking: 'Seeking',
    typeAll: 'All types',
    featured: 'Featured',
    activeOnly: 'Active only',
    approve: 'Approve',
    reject: 'Reject',
    view: 'View',
    delete: 'Delete',
    toggleActive: 'Toggle active',
    toggleFeatured: 'Toggle featured',
    empty: 'No listings match these filters',
    confirmDelete: 'Delete this listing permanently?',
    confirmReject: 'Reject this listing?',
    total: 'Total',
    inactive: 'Inactive',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    company: 'Company',
    city: 'City',
    owner: 'Owner',
    created: 'Created',
    views: 'Views',
    description: 'Description',
    openPublic: 'Open on site',
    saved: 'Updated successfully',
    noCompany: 'No company',
  } : {
    title: 'مدیریت آگهی‌ها',
    subtitle: 'بررسی، تایید و مدیریت همه آگهی‌های شغلی',
    back: 'داشبورد',
    loading: 'در حال بارگذاری...',
    accessDenied: 'دسترسی محدود',
    needManager: 'مدیریت آگهی‌ها فقط برای مدیر و staff است',
    search: 'جستجوی عنوان، شرکت...',
    all: 'همه',
    pending: 'در انتظار',
    approved: 'تایید شده',
    rejected: 'رد شده',
    expired: 'منقضی',
    hiring: 'استخدام',
    seeking: 'کارجو',
    typeAll: 'همه انواع',
    featured: 'ویژه',
    activeOnly: 'فقط فعال',
    approve: 'تایید',
    reject: 'رد',
    view: 'جزئیات',
    delete: 'حذف',
    toggleActive: 'فعال/غیرفعال',
    toggleFeatured: 'ویژه',
    empty: 'آگهی‌ای با این فیلترها پیدا نشد',
    confirmDelete: 'این آگهی برای همیشه حذف شود؟',
    confirmReject: 'این آگهی رد شود؟',
    total: 'کل',
    inactive: 'غیرفعال',
    page: 'صفحه',
    of: 'از',
    prev: 'قبلی',
    next: 'بعدی',
    company: 'شرکت',
    city: 'شهر',
    owner: 'ثبت‌کننده',
    created: 'تاریخ ثبت',
    views: 'بازدید',
    description: 'توضیحات',
    openPublic: 'مشاهده در سایت',
    saved: 'با موفقیت به‌روزرسانی شد',
    noCompany: 'بدون شرکت',
  }

  const tabLabels = {
    all: t.all,
    pending: t.pending,
    approved: t.approved,
    rejected: t.rejected,
    expired: t.expired,
  }

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(Config.endpoints.jobisell.jobs.adminStats(), {
        headers: getAuthHeaders(),
      })
      setStats(res.data)
    } catch {
      setStats(null)
    }
  }, [getAuthHeaders])

  const fetchList = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const params = {
        manage: 1,
        page,
        ordering: '-created_at',
      }
      if (status) params.status = status
      if (type) params.type = type
      if (q.trim()) params.q = q.trim()
      if (featuredOnly) params.is_featured = true
      if (activeOnly) params.is_active = true

      const res = await axios.get(Config.endpoints.jobisell.jobs.list(params), {
        headers: getAuthHeaders(),
      })
      const data = res.data
      const list = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : []
      setItems(list)
      setCount(typeof data?.count === 'number' ? data.count : list.length)
      if (data?.count != null) {
        setTotalPages(Math.max(1, Math.ceil(data.count / 20)))
      } else {
        setTotalPages(1)
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message)
      setItems([])
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders, page, status, type, q, featuredOnly, activeOnly])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) {
      fetchList()
      fetchStats()
    } else if (isAuthenticated) {
      setLoadingData(false)
    }
  }, [isAuthenticated, canManage, fetchList, fetchStats])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      setQ(searchInput)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(null), 3000)
    return () => clearTimeout(timer)
  }, [success])

  const fmtErrors = (data) => {
    if (!data) return 'خطا'
    if (typeof data === 'string') return data
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join('، ') : data.detail
    if (data.error) return data.error
    if (data.message) return data.message
    return 'خطا'
  }

  const patchLocal = (updated) => {
    if (!updated?.id) return
    setItems((prev) => prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it)))
    setDrawer((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
  }

  const runAction = async (id, requestFn, { removeIfFiltered } = {}) => {
    try {
      setBusyId(id)
      setError(null)
      const res = await requestFn()
      const updated = res.data?.data || res.data
      if (updated?.id) {
        const stillMatches =
          (!status || updated.status === status) &&
          (!type || updated.type === type) &&
          (!featuredOnly || updated.is_featured) &&
          (!activeOnly || updated.is_active)
        if (removeIfFiltered && !stillMatches) {
          setItems((prev) => prev.filter((it) => it.id !== id))
          if (drawer?.id === id) setDrawer(null)
        } else {
          patchLocal(updated)
        }
      }
      setSuccess(t.saved)
      fetchStats()
    } catch (err) {
      setError(fmtErrors(err.response?.data))
    } finally {
      setBusyId(null)
    }
  }

  const handleApprove = (item) =>
    runAction(item.id, () =>
      axios.post(Config.endpoints.jobisell.jobs.approve(item.id), {}, { headers: getAuthHeaders() })
    , { removeIfFiltered: true })

  const handleReject = (item) => {
    if (!window.confirm(t.confirmReject)) return
    return runAction(item.id, () =>
      axios.post(Config.endpoints.jobisell.jobs.reject(item.id), {}, { headers: getAuthHeaders() })
    , { removeIfFiltered: true })
  }

  const handleToggleFeatured = (item) =>
    runAction(item.id, () =>
      axios.post(Config.endpoints.jobisell.jobs.toggleFeatured(item.id), {}, { headers: getAuthHeaders() })
    , { removeIfFiltered: true })

  const handleToggleActive = (item) =>
    runAction(item.id, () =>
      axios.post(Config.endpoints.jobisell.jobs.toggleActive(item.id), {}, { headers: getAuthHeaders() })
    , { removeIfFiltered: true })

  const handleDelete = async (item) => {
    if (!window.confirm(`${t.confirmDelete}\n${item.title}`)) return
    try {
      setBusyId(item.id)
      await axios.delete(Config.endpoints.jobisell.jobs.delete(item.id), {
        headers: getAuthHeaders(),
      })
      setItems((prev) => prev.filter((it) => it.id !== item.id))
      if (drawer?.id === item.id) setDrawer(null)
      setSuccess(t.saved)
      fetchStats()
    } catch (err) {
      setError(fmtErrors(err.response?.data))
    } finally {
      setBusyId(null)
    }
  }

  if (loading || (loadingData && !items.length && !error)) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={28} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canManage) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.denied}>
            <span className={styles.deniedIcon}><Shield size={40} /></span>
            <h3>{t.accessDenied}</h3>
            <p>{t.needManager}</p>
            <Link href="/dashboard" className={styles.primaryBtn}>{t.back}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><Briefcase size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title}</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
            <button
              type="button"
              className={styles.headerGhost}
              onClick={() => { fetchList(); fetchStats() }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.total ?? 0}</span>
              <span className={styles.statLabel}>{t.total}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <span className={styles.statValue}>{stats.pending ?? 0}</span>
              <span className={styles.statLabel}>{t.pending}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statApproved}`}>
              <span className={styles.statValue}>{stats.approved ?? 0}</span>
              <span className={styles.statLabel}>{t.approved}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statRejected}`}>
              <span className={styles.statValue}>{stats.rejected ?? 0}</span>
              <span className={styles.statLabel}>{t.rejected}</span>
            </div>
          </div>
        )}

        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <Search size={15} />
            <input
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.search}
            />
          </div>
          <select
            className={styles.selectInput}
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1) }}
          >
            <option value="">{t.typeAll}</option>
            <option value="hiring">{t.hiring}</option>
            <option value="seeking">{t.seeking}</option>
          </select>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.filterChip} ${status === tab.id ? styles.filterChipActive : ''}`}
              onClick={() => { setStatus(tab.id); setPage(1) }}
            >
              {tab.id === 'pending' && stats?.pending != null ? `${tabLabels[tab.key]} (${stats.pending})` : tabLabels[tab.key]}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.filterChip} ${featuredOnly ? styles.filterChipActive : ''}`}
            onClick={() => { setFeaturedOnly((v) => !v); setPage(1) }}
          >
            <Star size={12} /> {t.featured}
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${activeOnly ? styles.filterChipActive : ''}`}
            onClick={() => { setActiveOnly((v) => !v); setPage(1) }}
          >
            <Power size={12} /> {t.activeOnly}
          </button>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}
        {success && <div className={styles.successBar}>{success}</div>}

        {loadingData && items.length === 0 ? (
          <div className={styles.loadingBox}>
            <RefreshCw size={28} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyBox}>
            <Briefcase size={32} />
            <p>{t.empty}</p>
          </div>
        ) : (
          <div className={styles.listWrap}>
            {items.map((item) => (
              <article
                key={item.id}
                className={`${styles.jobCard} ${!item.is_active ? styles.jobCardInactive : ''}`}
              >
                <div className={styles.jobMain}>
                  <div className={styles.jobTop}>
                    <h2 className={styles.jobTitle}>{item.title}</h2>
                    <span className={`${styles.badge} ${item.type === 'hiring' ? styles.badgeHiring : styles.badgeSeeking}`}>
                      {item.type_display || (item.type === 'hiring' ? t.hiring : t.seeking)}
                    </span>
                    <span className={`${styles.badge} ${statusBadgeClass(item.status)}`}>
                      {item.status_display || item.status}
                    </span>
                    {item.is_featured ? (
                      <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                        <Star size={10} /> {t.featured}
                      </span>
                    ) : null}
                    {!item.is_active ? (
                      <span className={`${styles.badge} ${styles.badgeInactive}`}>{t.inactive}</span>
                    ) : null}
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      <Building2 size={12} />
                      {item.company_name || t.noCompany}
                    </span>
                    {(item.city_name || item.province_name) && (
                      <span className={styles.metaItem}>
                        <MapPin size={12} />
                        {[item.city_name, item.province_name].filter(Boolean).join('، ')}
                      </span>
                    )}
                    {item.created_by_display && (
                      <span className={styles.metaItem}>
                        <User size={12} />
                        {item.created_by_display}
                      </span>
                    )}
                    <span className={styles.metaItem}>
                      <Clock size={12} />
                      {formatDate(item.created_at, language)}
                    </span>
                    <span className={styles.metaItem}>
                      <Eye size={12} />
                      {item.views_count ?? 0} {t.views}
                    </span>
                  </div>
                </div>

                <div className={styles.jobActions}>
                  {item.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.approve}`}
                        disabled={busyId === item.id}
                        onClick={() => handleApprove(item)}
                      >
                        <CheckCircle2 size={13} /> {t.approve}
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.reject}`}
                        disabled={busyId === item.id}
                        onClick={() => handleReject(item)}
                      >
                        <XCircle size={13} /> {t.reject}
                      </button>
                    </>
                  )}
                  {item.status === 'rejected' && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.approve}`}
                      disabled={busyId === item.id}
                      onClick={() => handleApprove(item)}
                    >
                      <CheckCircle2 size={13} /> {t.approve}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${item.is_featured ? styles.starOn : ''}`}
                    title={t.toggleFeatured}
                    disabled={busyId === item.id}
                    onClick={() => handleToggleFeatured(item)}
                  >
                    <Star size={15} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    title={t.toggleActive}
                    disabled={busyId === item.id}
                    onClick={() => handleToggleActive(item)}
                  >
                    <Power size={15} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    title={t.view}
                    onClick={() => setDrawer(item)}
                  >
                    <Eye size={15} />
                  </button>
                  {item.id && item.status === 'approved' && (
                    <Link
                      href={`/jobs/${item.id}`}
                      className={styles.iconBtn}
                      target="_blank"
                      title={t.openPublic}
                    >
                      <ExternalLink size={15} />
                    </Link>
                  )}
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.danger}`}
                    title={t.delete}
                    disabled={busyId === item.id}
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pager}>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t.prev}
            </button>
            <span className={styles.pagerInfo}>
              {t.page} {page} {t.of} {totalPages} · {count}
            </span>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t.next}
            </button>
          </div>
        )}
      </div>

      {drawer && (
        <div className={styles.overlay} onClick={() => setDrawer(null)} role="presentation">
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            <div className={styles.drawerHead}>
              <div>
                <h2>{drawer.title}</h2>
                <p className={styles.drawerMeta}>
                  {drawer.type_display} · {drawer.status_display}
                </p>
              </div>
              <button type="button" className={styles.iconBtn} onClick={() => setDrawer(null)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.drawerGrid}>
              <div className={styles.drawerField}>
                <label>{t.company}</label>
                <span>{drawer.company_name || t.noCompany}</span>
              </div>
              <div className={styles.drawerField}>
                <label>{t.city}</label>
                <span>{[drawer.city_name, drawer.province_name].filter(Boolean).join('، ') || '—'}</span>
              </div>
              <div className={styles.drawerField}>
                <label>{t.owner}</label>
                <span>{drawer.created_by_display || '—'}</span>
              </div>
              <div className={styles.drawerField}>
                <label>{t.created}</label>
                <span>{formatDate(drawer.created_at, language)}</span>
              </div>
              <div className={styles.drawerField}>
                <label>{t.views}</label>
                <span>{drawer.views_count ?? 0}</span>
              </div>
            </div>

            <p className={styles.drawerMeta} style={{ marginBottom: 6 }}>{t.description}</p>
            <div className={styles.drawerBody}>
              {drawer.description || '—'}
            </div>

            <div className={styles.drawerActions}>
              {drawer.status !== 'approved' && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.approve}`}
                  disabled={busyId === drawer.id}
                  onClick={() => handleApprove(drawer)}
                >
                  <CheckCircle2 size={13} /> {t.approve}
                </button>
              )}
              {drawer.status !== 'rejected' && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.reject}`}
                  disabled={busyId === drawer.id}
                  onClick={() => handleReject(drawer)}
                >
                  <XCircle size={13} /> {t.reject}
                </button>
              )}
              {drawer.id && drawer.status === 'approved' && (
                <Link href={`/jobs/${drawer.id}`} className={styles.ghostBtn} target="_blank">
                  <ExternalLink size={14} /> {t.openPublic}
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
