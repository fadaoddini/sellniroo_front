'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Loader2,
  Hash,
  User,
  Phone,
  Paperclip,
  MessageSquare,
  Clock,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Route,
  UserCog,
  Mic,
  CalendarClock,
  CheckCircle2,
  CircleX,
  FileText,
  ScrollText,
} from 'lucide-react'
import karmandanService from '../services/karmandanService'
import FollowupTimeline from './FollowupTimeline'
import StatusChangeModal from './StatusChangeModal'
import ConfirmDialog from './ConfirmDialog'
import styles from '../styles/SalePathMonitor.module.css'

const STATUS_FILTERS = [
  { key: '', label: 'همه' },
  { key: 'new', label: 'جدید' },
  { key: 'in_progress', label: 'پیگیری' },
  { key: 'confirmed', label: 'قرارداد' },
  { key: 'cancelled', label: 'بسته' },
]

const STATUS_COLOR = {
  new: '#1d4ed8',
  in_progress: '#ca8a04',
  confirmed: '#15803d',
  cancelled: '#b91c1c',
}

const STATUS_ROW_CLASS = {
  new: 'rowNew',
  in_progress: 'rowProgress',
  confirmed: 'rowConfirmed',
  cancelled: 'rowCancelled',
}

const formatFa = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatFaDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.toLocaleDateString('fa-IR')} · ${d.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export default function SalePathMonitor({ employees = [], variant = 'embed' }) {
  const isFull = variant === 'full'
  const defaultPageSize = isFull ? 20 : 10

  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: defaultPageSize,
    total: 0,
    total_pages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [statusAction, setStatusAction] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmData, setConfirmData] = useState(null)
  const [savingFollowup, setSavingFollowup] = useState(false)
  const pendingFilesRef = useRef([])

  const loadList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await karmandanService.getPathMonitor({
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(status ? { status } : {}),
        ...(employeeId ? { employee_id: employeeId } : {}),
        ...(includeArchived ? { archived: '1' } : {}),
        page,
        page_size: pageSize,
      })
      const payload = res?.data && res.data.results ? res.data : res
      const results = Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(res?.data?.results)
          ? res.data.results
          : []
      setRows(results)
      setPagination(
        payload?.pagination ||
          res?.data?.pagination || {
            page: 1,
            page_size: pageSize,
            total: results.length,
            total_pages: 1,
          }
      )
    } catch (err) {
      setError(err?.message || err?.error || 'بارگذاری رصد مسیر ناموفق بود')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [q, status, employeeId, includeArchived, page, pageSize])

  useEffect(() => {
    const t = setTimeout(() => {
      loadList()
    }, q ? 280 : 0)
    return () => clearTimeout(t)
  }, [loadList, q])

  const fetchDetail = useCallback(async (id) => {
    const res = await karmandanService.getLeadDetail(id)
    return res?.data && !res?.id ? res.data : res
  }, [])

  const openPath = async (id) => {
    if (String(selectedId) === String(id)) {
      closePath()
      return
    }
    setSelectedId(id)
    setDetail(null)
    setDetailLoading(true)
    try {
      const payload = await fetchDetail(id)
      setDetail(payload)
      requestAnimationFrame(() => {
        document
          .getElementById('sale-monitor-detail')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      setError(err?.message || err?.error || 'جزئیات مسیر بارگذاری نشد')
      setSelectedId(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const closePath = () => {
    setSelectedId(null)
    setDetail(null)
    setShowStatusModal(false)
    setShowConfirmDialog(false)
    setConfirmData(null)
    setStatusAction(null)
    pendingFilesRef.current = []
  }

  const openStatusAction = (action) => {
    if (!detail?.id) return
    setStatusAction(action)
    setShowStatusModal(true)
  }

  const handleStatusChangeRequest = (itemId, status, data) => {
    pendingFilesRef.current = Array.isArray(data?.files) ? data.files.filter(Boolean) : []
    setConfirmData({
      itemId,
      status,
      data: { ...data, files: pendingFilesRef.current },
      action: statusAction,
    })
    setShowStatusModal(false)
    setShowConfirmDialog(true)
  }

  const handleStatusChangeConfirmed = async () => {
    if (!confirmData) return
    const { itemId, status, data } = confirmData
    try {
      setSavingFollowup(true)
      setError('')
      const files =
        pendingFilesRef.current.length > 0
          ? pendingFilesRef.current
          : Array.isArray(data.files)
            ? data.files.filter(Boolean)
            : []
      const saveRes = await karmandanService.addFollowup(
        itemId,
        {
          status,
          description: data.description || '',
          change_reason: data.changeReason || '',
          next_follow_up: data.nextFollowUp || null,
          next_follow_up_time: data.nextFollowUpTime || null,
        },
        files
      )
      const savedAttachments = saveRes?.data?.attachments
      if (
        files.length > 0 &&
        (!Array.isArray(savedAttachments) || savedAttachments.length === 0)
      ) {
        setError('گزارش ثبت شد، اما فایل صوتی ذخیره نشد. دوباره پیوست کنید.')
      }
      pendingFilesRef.current = []
      setShowConfirmDialog(false)
      setConfirmData(null)
      setStatusAction(null)
      const payload = await fetchDetail(itemId)
      setDetail(payload)
      await loadList()
    } catch (err) {
      setError(err?.message || err?.error || 'ثبت گزارش ناموفق بود')
    } finally {
      setSavingFollowup(false)
    }
  }

  const followups = useMemo(() => {
    const list = detail?.followups
    const invoices = Array.isArray(detail?.sale_invoices) ? detail.sale_invoices : []
    const formatted = Array.isArray(list)
      ? list.map((f) => ({
          ...f,
          createdAt: f.created_at,
          changeReason: f.change_reason,
          nextFollowUp: f.next_follow_up,
          nextFollowUpTime: f.next_follow_up_time,
          attachments: Array.isArray(f.attachments) ? f.attachments : [],
          related_invoice: f.related_invoice || null,
        }))
      : []
    const linked = new Set(
      formatted
        .map((f) => f.related_invoice?.id)
        .filter(Boolean)
        .map(String)
    )
    const orphans = invoices
      .filter((inv) => inv?.id && !linked.has(String(inv.id)))
      .map((inv) => ({
        id: `invoice-${inv.id}`,
        status: detail?.status,
        action_type: inv.doc_type === 'invoice' ? 'invoice' : 'proforma',
        description: `صدور ${inv.doc_type_label || 'سند'} شماره ${inv.number || ''}`,
        change_reason: `${inv.doc_type_label || 'سند'} صادر شد`,
        changeReason: `${inv.doc_type_label || 'سند'} صادر شد`,
        created_at: inv.created_at,
        createdAt: inv.created_at,
        created_by_name: inv.created_by_name,
        attachments: [],
        related_invoice: inv,
      }))
    return [...formatted, ...orphans].sort((a, b) => {
      const ta = new Date(a.created_at || a.createdAt || 0).getTime()
      const tb = new Date(b.created_at || b.createdAt || 0).getTime()
      return tb - ta
    })
  }, [detail])

  const assignments = Array.isArray(detail?.assignments) ? detail.assignments : []
  const saleInvoices = Array.isArray(detail?.sale_invoices) ? detail.sale_invoices : []
  const isResult =
    detail?.status === 'confirmed' || detail?.status === 'cancelled'
  const attachmentTotal = followups.reduce(
    (sum, f) => sum + (Array.isArray(f.attachments) ? f.attachments.length : 0),
    0
  )

  const confirmMeta = {
    followup: {
      title: 'تایید ثبت پیگیری',
      message: 'گزارش پیگیری با ویس/پیوست در رصد مسیر ثبت می‌شود.',
      confirmText: 'بله، پیگیری ثبت شود',
      type: 'warning',
    },
    contract: {
      title: 'تایید تبدیل به قرارداد',
      message: 'این مورد به‌عنوان قرارداد ثبت می‌شود.',
      confirmText: 'بله، قرارداد شود',
      type: 'success',
    },
    close: {
      title: 'تایید بسته شدن',
      message: 'این مورد بسته می‌شود.',
      confirmText: 'بله، بسته شود',
      type: 'danger',
    },
  }
  const confirmCfg = confirmMeta[confirmData?.action || statusAction] || confirmMeta.followup

  return (
    <section className={`${styles.panel} ${isFull ? styles.panelFull : ''}`}>
      {!isFull ? (
        <div className={styles.head}>
          <div>
            <h2>
              <Route size={15} />
              رصد مسیر بازاریابی
            </h2>
            <p>هر مورد را باز کنید تا گزارش‌ها، پیوست‌ها، واگذاری‌ها و کل مسیر دیده شود</p>
          </div>
          <label className={styles.archiveToggle}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => {
                setPage(1)
                setIncludeArchived(e.target.checked)
              }}
            />
            شامل آرشیو
          </label>
        </div>
      ) : (
        <div className={styles.fullToolbar}>
          <label className={styles.archiveToggle}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => {
                setPage(1)
                setIncludeArchived(e.target.checked)
              }}
            />
            شامل آرشیو
          </label>
          <div className={styles.toolbarLeft}>
            <label className={styles.pageSizeLabel}>
              در هر صفحه
              <select
                value={pageSize}
                onChange={(e) => {
                  setPage(1)
                  setPageSize(Number(e.target.value) || 20)
                }}
              >
                <option value={10}>۱۰</option>
                <option value={20}>۲۰</option>
                <option value={30}>۳۰</option>
                <option value={50}>۵۰</option>
              </select>
            </label>
            <span className={styles.resultCount}>
              {(pagination.total || 0).toLocaleString('fa-IR')} مورد
            </span>
          </div>
        </div>
      )}

      <div className={`${styles.filters} ${isFull ? styles.filtersFull : ''}`}>
        <div className={`${styles.searchWrap} ${isFull ? styles.searchWrapFull : ''}`}>
          <Search size={isFull ? 18 : 15} />
          <input
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
            placeholder="جستجو با کد پیگیری، عنوان، موبایل یا مشتری..."
            autoFocus={isFull}
          />
        </div>
        <div className={styles.statusRow}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key || 'all'}
              type="button"
              className={status === s.key ? styles.chipActive : styles.chip}
              onClick={() => {
                setPage(1)
                setStatus(s.key)
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          className={styles.empSelect}
          value={employeeId}
          onChange={(e) => {
            setPage(1)
            setEmployeeId(e.target.value)
          }}
        >
          <option value="">همه کارمندان</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className={styles.err}>{error}</div> : null}

      {selectedId ? (
        <div className={styles.inlineDetail} id="sale-monitor-detail">
          <div className={styles.inlineHead}>
            <div>
              <div className={styles.drawerCode}>
                <Hash size={13} />
                {detail?.tracking_code ||
                  `SL-${String(selectedId).padStart(6, '0')}`}
              </div>
              <h3>{detail?.title || 'مسیر بازاریابی'}</h3>
              <p>
                {detail?.customer_name ? `${detail.customer_name} · ` : ''}
                {detail?.phone || ''}
                {detail?.assigned_to_name
                  ? ` · مسئول: ${detail.assigned_to_name}`
                  : ''}
              </p>
            </div>
            <button type="button" className={styles.closeBtn} onClick={closePath}>
              <X size={16} />
            </button>
          </div>

          {detailLoading || !detail ? (
            <div className={styles.loading}>
              <Loader2 size={18} className={styles.spin} />
              در حال آماده‌سازی مسیر...
            </div>
          ) : (
            <div className={styles.inlineBody}>
              <div className={styles.summaryGrid}>
                <div>
                  <span>وضعیت</span>
                  <strong>{detail.status_display}</strong>
                </div>
                <div>
                  <span>گزارش‌ها</span>
                  <strong>
                    {(detail.followups_count || followups.length || 0).toLocaleString(
                      'fa-IR'
                    )}
                  </strong>
                </div>
                <div>
                  <span>پیوست / ویس</span>
                  <strong>{attachmentTotal.toLocaleString('fa-IR')}</strong>
                </div>
                <div>
                  <span>اسناد</span>
                  <strong>{saleInvoices.length.toLocaleString('fa-IR')}</strong>
                </div>
              </div>

              {!detail.is_archived && !isResult ? (
                <div className={styles.detailActions}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionFollow}`}
                    onClick={() => openStatusAction('followup')}
                  >
                    <CalendarClock size={15} />
                    ثبت پیگیری / ویس
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionContract}`}
                    onClick={() => openStatusAction('contract')}
                  >
                    <CheckCircle2 size={15} />
                    قرارداد + ویس
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionClose}`}
                    onClick={() => openStatusAction('close')}
                  >
                    <CircleX size={15} />
                    بستن + ویس
                  </button>
                  <Link
                    href={`/sale/invoice?lead=${detail.id}&type=proforma`}
                    className={styles.actionBtn}
                  >
                    <ScrollText size={15} />
                    پیش‌فاکتور
                  </Link>
                  <Link
                    href={`/sale/invoice?lead=${detail.id}&type=invoice`}
                    className={styles.actionBtn}
                  >
                    <FileText size={15} />
                    فاکتور
                  </Link>
                </div>
              ) : null}

              {detail.description ? (
                <div className={styles.leadDesc}>
                  <strong>شرح اولیه</strong>
                  <p>{detail.description}</p>
                </div>
              ) : null}

              {saleInvoices.length > 0 ? (
                <div className={styles.docsBox}>
                  <h4 className={styles.sectionTitle}>
                    <FileText size={14} />
                    پیش‌فاکتور و فاکتورهای صادرشده
                  </h4>
                  <ul className={styles.docsList}>
                    {saleInvoices.map((inv) => (
                      <li key={inv.id}>
                        <div>
                          <strong>
                            {inv.doc_type_label ||
                              (inv.doc_type === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور')}{' '}
                            {inv.number}
                          </strong>
                          <span>
                            {formatFa(inv.issue_date || inv.created_at)}
                            {inv.grand_total
                              ? ` · ${Number(inv.grand_total).toLocaleString('fa-IR')} ریال`
                              : ''}
                          </span>
                        </div>
                        <Link href={`/sale/invoice?id=${inv.id}`}>مشاهده</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={styles.inlineCols}>
                <div>
                  <h4 className={styles.sectionTitle}>
                    <UserCog size={14} />
                    مسیر مسئولیت
                  </h4>
                  {assignments.length === 0 ? (
                    <p className={styles.emptyMini}>تاریخچه واگذاری ثبت نشده</p>
                  ) : (
                    <ul className={styles.assignList}>
                      {assignments.map((a) => (
                        <li key={a.id}>
                          <div>
                            <strong>{a.employee_name}</strong>
                            <span>
                              {a.is_current || !a.ended_at ? 'فعلی' : 'قبلی'}
                            </span>
                          </div>
                          <p>
                            از {formatFaDateTime(a.started_at)}
                            {a.ended_at
                              ? ` تا ${formatFaDateTime(a.ended_at)}`
                              : ' تاکنون'}
                            {a.assigned_by_name
                              ? ` · توسط ${a.assigned_by_name}`
                              : ''}
                            {a.note ? ` · ${a.note}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className={styles.sectionTitle}>
                    <MessageSquare size={14} />
                    رصد مسیر و گزارش‌ها
                    <em>({followups.length.toLocaleString('fa-IR')})</em>
                  </h4>
                  <p className={styles.timelineHint}>
                    ویس، فایل، پیش‌فاکتور و فاکتور در همین تایم‌لاین دیده می‌شود.
                  </p>
                  <FollowupTimeline followups={followups} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.loading}>
          <Loader2 size={18} className={styles.spin} />
          در حال بارگذاری موارد...
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>موردی با این فیلتر پیدا نشد</div>
      ) : (
        <div className={styles.listTable}>
          <div className={styles.listHead} aria-hidden>
            <span>کد / عنوان</span>
            <span>وضعیت</span>
            <span>مشتری / موبایل</span>
            <span>مسئول</span>
            <span>گزارش</span>
            <span>آخرین فعالیت</span>
          </div>
          <div className={styles.listBody}>
            {rows.map((row) => {
              const color = STATUS_COLOR[row.status] || '#64748b'
              const active = String(selectedId) === String(row.id)
              const statusClass = STATUS_ROW_CLASS[row.status]
                ? styles[STATUS_ROW_CLASS[row.status]]
                : ''
              return (
                <button
                  key={row.id}
                  type="button"
                  className={`${styles.listRow} ${statusClass} ${
                    active ? styles.rowActive : ''
                  }`}
                  onClick={() => openPath(row.id)}
                >
                  <div className={styles.listMain}>
                    <span className={styles.code}>
                      <Hash size={11} />
                      {row.tracking_code || `SL-${String(row.id).padStart(6, '0')}`}
                    </span>
                    <strong className={styles.listTitle}>{row.title}</strong>
                  </div>
                  <span
                    className={styles.status}
                    style={{ color, background: `${color}14` }}
                  >
                    {row.status_display}
                  </span>
                  <div className={styles.listCell}>
                    <span>
                      <User size={12} />
                      {row.customer_name || '—'}
                    </span>
                    <span dir="ltr">
                      <Phone size={12} />
                      {row.phone || '—'}
                    </span>
                  </div>
                  <div className={styles.listCell}>
                    <span>
                      <UserCog size={12} />
                      {row.assigned_to_name || 'بدون مسئول'}
                    </span>
                  </div>
                  <div className={styles.listCell}>
                    <span>
                      <MessageSquare size={12} />
                      {(row.followups_count || 0).toLocaleString('fa-IR')}
                    </span>
                    <span>
                      <Paperclip size={12} />
                      {(row.attachments_count || 0).toLocaleString('fa-IR')}
                      {row.last_activity?.has_attachments ? (
                        <em className={styles.voiceBadge}>
                          <Mic size={10} />
                          ویس
                        </em>
                      ) : null}
                    </span>
                  </div>
                  <div className={styles.listActivity}>
                    <span className={styles.listTime}>
                      <Clock size={12} />
                      {row.last_activity
                        ? formatFaDateTime(row.last_activity.created_at)
                        : formatFa(row.updated_at)}
                    </span>
                    <span className={styles.listActText}>
                      {row.last_activity?.action_display || '—'}
                      {row.last_activity?.description
                        ? ` · ${row.last_activity.description}`
                        : ''}
                    </span>
                    <span className={styles.viewHint}>
                      <Eye size={12} />
                      {active ? 'باز' : 'مشاهده'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className={styles.pager}>
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronRight size={14} />
          قبلی
        </button>
        <span>
          صفحه {(pagination.page || page).toLocaleString('fa-IR')} از{' '}
          {Math.max(1, pagination.total_pages || 1).toLocaleString('fa-IR')}
          {' · '}
          {(pagination.total || 0).toLocaleString('fa-IR')} مورد
          {' · '}
          {(pagination.page_size || pageSize).toLocaleString('fa-IR')} در صفحه
        </span>
        <button
          type="button"
          disabled={page >= (pagination.total_pages || 1) || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          بعدی
          <ChevronLeft size={14} />
        </button>
      </div>

      {showStatusModal && detail && statusAction ? (
        <StatusChangeModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false)
            setStatusAction(null)
            pendingFilesRef.current = []
          }}
          item={{
            id: detail.id,
            title: detail.title,
            phone: detail.phone,
            customer_name: detail.customer_name,
            status: detail.status,
            status_display: detail.status_display,
          }}
          action={statusAction}
          onConfirm={handleStatusChangeRequest}
          loading={savingFollowup}
        />
      ) : null}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setConfirmData(null)
          pendingFilesRef.current = []
        }}
        onConfirm={handleStatusChangeConfirmed}
        title={confirmCfg.title}
        message={confirmCfg.message}
        confirmText={confirmCfg.confirmText}
        cancelText="انصراف"
        type={confirmCfg.type}
        loading={savingFollowup}
        itemTitle={detail?.title}
        itemPhone={detail?.phone}
        itemCustomer={detail?.customer_name}
        fromStatus={detail?.status_display || ''}
        details={[
          confirmData?.data?.description
            ? {
                label: 'توضیح',
                value:
                  confirmData.data.description.length > 80
                    ? `${confirmData.data.description.slice(0, 80)}...`
                    : confirmData.data.description,
              }
            : null,
          Array.isArray(confirmData?.data?.files) && confirmData.data.files.length
            ? {
                label: 'پیوست',
                value: `${confirmData.data.files.length} فایل / ویس`,
              }
            : null,
        ].filter(Boolean)}
      />
    </section>
  )
}
