'use client'

import React from 'react'
import {
  Archive,
  Calendar,
  CheckCircle2,
  CircleDot,
  CircleX,
  Clock,
  FileText,
  Hash,
  Phone,
  ScrollText,
  Sparkles,
  User,
  UserCog,
  X,
  MessageSquare,
  RotateCcw,
} from 'lucide-react'
import FollowupTimeline from './FollowupTimeline'
import styles from '../styles/MarketingLeadDetail.module.css'

const STATUS = {
  new: { label: 'جدید', color: '#1d4ed8', icon: Sparkles },
  in_progress: { label: 'در حال پیگیری', color: '#c2410c', icon: CircleDot },
  confirmed: { label: 'قرارداد', color: '#15803d', icon: CheckCircle2 },
  cancelled: { label: 'بسته شده', color: '#b91c1c', icon: CircleX },
}

export default function MarketingLeadDetail({
  item,
  followups = [],
  assignments = [],
  isSaleManager = false,
  assignableStaff = [],
  assignEmployeeId = '',
  assignNote = '',
  assigning = false,
  onClose,
  onAssignEmployeeId,
  onAssignNote,
  onAssign,
  onSendDocument,
  onArchive,
  onUnarchive,
  onStatusChange,
  formatAssignmentRange,
}) {
  if (!item) return null

  const status = STATUS[item.status] || STATUS.new
  const StatusIcon = status.icon
  const code =
    item.tracking_code ||
    item.trackingCode ||
    `SL-${String(item.id).padStart(6, '0')}`
  const isResult =
    item.status === 'confirmed' || item.status === 'cancelled'
  const canArchive = !item.is_archived && isResult

  return (
    <div className={styles.overlay} onClick={onClose} dir="rtl">
      <div
        className={styles.modal}
        data-tour="sale-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head} data-tour="sale-dialog-info">
          <div className={styles.headMain}>
            <div className={styles.code}>
              <Hash size={13} />
              {code}
            </div>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.sub}>
              {item.customer_name ? `${item.customer_name} · ` : ''}
              {item.phone}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.grid}>
          <section className={styles.col}>
            <h3 className={styles.colTitle}>
              <User size={14} />
              مشخصات
            </h3>
            <div className={styles.facts}>
              <div className={styles.fact}>
                <span className={styles.factLabel}>کد پیگیری</span>
                <span className={styles.factValue} style={{ direction: 'ltr' }}>
                  {code}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>وضعیت</span>
                <span className={styles.factValue}>
                  <span
                    className={styles.statusPill}
                    style={{
                      background: `${status.color}18`,
                      color: status.color,
                    }}
                  >
                    <StatusIcon size={12} />
                    {item.status_display || status.label}
                  </span>
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>مشتری</span>
                <span className={styles.factValue}>
                  {item.customer_name || '—'}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>موبایل</span>
                <span className={styles.factValue}>
                  <Phone size={12} style={{ verticalAlign: 'middle' }} />{' '}
                  {item.phone}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>مسئول</span>
                <span className={styles.factValue}>
                  {item.assigned_to_name || 'تعیین نشده'}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>ایجاد</span>
                <span className={styles.factValue}>
                  <Calendar size={12} style={{ verticalAlign: 'middle' }} />{' '}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('fa-IR')
                    : '—'}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>پیگیری بعدی</span>
                <span className={styles.factValue}>
                  {item.nextFollowUp ? (
                    <>
                      <Clock size={12} style={{ verticalAlign: 'middle' }} />{' '}
                      {new Date(item.nextFollowUp).toLocaleDateString('fa-IR')}
                      {item.nextFollowUpTime
                        ? ` · ${item.nextFollowUpTime}`
                        : ''}
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            </div>

            <div className={styles.descBox}>
              <strong
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6,
                  fontSize: '0.76rem',
                }}
              >
                <MessageSquare size={13} />
                توضیحات
              </strong>
              {item.description?.trim()
                ? item.description
                : 'توضیحی ثبت نشده است'}
            </div>
          </section>

          <section className={styles.col} data-tour="sale-dialog-actions">
            <h3 className={styles.colTitle}>
              <Sparkles size={14} />
              اقدامات
            </h3>
            <div className={styles.actionStack}>
              {!item.is_archived && !isResult ? (
                <>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionWarn}`}
                    onClick={() => onStatusChange?.(item, 'followup')}
                  >
                    <Calendar size={15} />
                    ثبت پیگیری
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionOk}`}
                    onClick={() => onStatusChange?.(item, 'contract')}
                  >
                    <CheckCircle2 size={15} />
                    تبدیل به قرارداد
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionDanger}`}
                    onClick={() => onStatusChange?.(item, 'close')}
                  >
                    <CircleX size={15} />
                    بستن مورد
                  </button>
                </>
              ) : null}

              {!isResult ? (
                <>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => onSendDocument?.(item, 'proforma')}
                  >
                    <ScrollText size={15} />
                    ارسال پیش‌فاکتور
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => onSendDocument?.(item, 'invoice')}
                  >
                    <FileText size={15} />
                    ارسال فاکتور
                  </button>
                </>
              ) : null}

              {item.is_archived ? (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionPrimary}`}
                  onClick={() => onUnarchive?.(item)}
                >
                  <RotateCcw size={15} />
                  بازگردانی از آرشیو
                </button>
              ) : canArchive ? (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionArchive}`}
                  onClick={() => onArchive?.(item)}
                >
                  <Archive size={15} />
                  انتقال به آرشیو
                </button>
              ) : null}
            </div>

            {isSaleManager && !item.is_archived ? (
              <div className={styles.assignBox}>
                <h3 className={styles.colTitle}>
                  <UserCog size={14} />
                  واگذاری
                </h3>
                <p className={styles.assignHint}>
                  مسئول فعلی:{' '}
                  <strong>{item.assigned_to_name || 'تعیین نشده'}</strong>
                </p>
                <div className={styles.assignRow}>
                  <select
                    className={styles.assignSelect}
                    value={assignEmployeeId}
                    onChange={(e) => onAssignEmployeeId?.(e.target.value)}
                  >
                    <option value="">انتخاب کارمند...</option>
                    {assignableStaff
                      .filter(
                        (emp) => String(emp.id) !== String(item.assigned_to)
                      )
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name}
                          {emp.employee_code ? ` (${emp.employee_code})` : ''}
                        </option>
                      ))}
                  </select>
                  <input
                    className={styles.assignNote}
                    value={assignNote}
                    onChange={(e) => onAssignNote?.(e.target.value)}
                    placeholder="یادداشت اختیاری"
                  />
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionPrimary}`}
                    disabled={assigning || !assignEmployeeId}
                    onClick={() => onAssign?.()}
                  >
                    {assigning ? 'در حال واگذاری...' : 'واگذاری'}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className={styles.col} data-tour="sale-dialog-path">
            <h3 className={styles.colTitle}>
              <User size={14} />
              مسیر مسئولیت
            </h3>
            {assignments.length === 0 ? (
              <p className={styles.empty}>تاریخچه واگذاری ثبت نشده</p>
            ) : (
              <ul className={styles.historyList}>
                {assignments.map((row) => (
                  <li
                    key={row.id}
                    className={`${styles.historyItem} ${
                      row.is_current || !row.ended_at
                        ? styles.historyCurrent
                        : ''
                    }`}
                  >
                    <div className={styles.historyTop}>
                      <span>{row.employee_name}</span>
                      <span>
                        {row.is_current || !row.ended_at
                          ? 'فعلی'
                          : 'قبلی'}
                      </span>
                    </div>
                    <div className={styles.historyMeta}>
                      {formatAssignmentRange?.(row) || ''}
                      {row.assigned_by_name
                        ? ` · توسط ${row.assigned_by_name}`
                        : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h3 className={styles.colTitle}>
              <Clock size={14} />
              {isSaleManager ? 'رصد مسیر و گزارش‌ها' : 'تاریخچه فعالیت'}
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                ({followups.length})
              </span>
            </h3>
            <p className={styles.empty} style={{ marginBottom: '0.45rem' }}>
              گزارش‌ها، فایل‌های صوتی، پیش‌فاکتور و فاکتورهای صادرشده
            </p>
            <FollowupTimeline followups={followups} />
          </section>
        </div>
      </div>
    </div>
  )
}
