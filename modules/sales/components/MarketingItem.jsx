'use client'

import React from 'react'
import {
  Phone,
  Calendar,
  Clock as ClockIcon,
  CircleDot,
  CircleX,
  CheckCircle2,
  CalendarClock,
  Eye,
  User,
  Sparkles,
  Archive,
  Hash,
} from 'lucide-react'
import styles from '../styles/MarketingItem.module.css'

const STATUS_MAP = {
  new: {
    label: 'جدید',
    color: '#2563eb',
    icon: Sparkles,
    className: 'statusNew',
  },
  in_progress: {
    label: 'پیگیری',
    color: '#c2410c',
    icon: CircleDot,
    className: 'statusProgress',
  },
  cancelled: {
    label: 'بسته',
    color: '#b91c1c',
    icon: CircleX,
    className: 'statusCancelled',
  },
  confirmed: {
    label: 'قرارداد',
    color: '#15803d',
    icon: CheckCircle2,
    className: 'statusConfirmed',
  },
}

const MarketingItem = ({
  item,
  onViewDetail,
  onStatusChange,
  onArchive,
}) => {
  const isToday = item.nextFollowUp === new Date().toISOString().split('T')[0]
  const status = STATUS_MAP[item.status] || STATUS_MAP.new
  const StatusIcon = status.icon
  const isResultItem = item.status === 'confirmed' || item.status === 'cancelled'
  const code = item.tracking_code || item.trackingCode || `SL-${String(item.id).padStart(6, '0')}`

  const getNextFollowUpLabel = () => {
    if (!item.nextFollowUp) return null
    const today = new Date().toISOString().split('T')[0]
    if (item.nextFollowUp === today) return 'امروز'
    return new Date(item.nextFollowUp).toLocaleDateString('fa-IR')
  }

  const stop = (e, fn) => {
    e.stopPropagation()
    fn?.()
  }

  return (
    <article
      className={`${styles.item} ${styles[status.className]} ${
        isToday ? styles.todayItem : ''
      }`}
      style={{ '--card-accent': status.color }}
      data-tour="sale-card"
      onClick={() => onViewDetail(item)}
    >
      <div className={styles.stageBar} aria-hidden />

      <div className={styles.itemBody}>
        <div className={styles.topRow}>
          <span className={styles.trackingCode}>
            <Hash size={11} />
            {code}
          </span>
          <span className={styles.statusBadge}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        <h3 className={styles.titleText} title={item.title}>
          {item.title || '—'}
        </h3>

        <div className={styles.metaGrid}>
          <span className={styles.metaItem} title={item.customer_name || ''}>
            <User size={12} />
            <span className={styles.metaText}>{item.customer_name || '—'}</span>
          </span>
          <span className={styles.metaItem} title={item.phone || ''}>
            <Phone size={12} />
            <span className={styles.metaText}>{item.phone || '—'}</span>
          </span>
          <span className={styles.metaItem}>
            <Calendar size={12} />
            <span className={styles.metaText}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('fa-IR')
                : '—'}
            </span>
          </span>
          <span
            className={`${styles.metaItem} ${isToday ? styles.nextToday : ''}`}
          >
            <ClockIcon size={12} />
            <span className={styles.metaText}>
              {item.nextFollowUp
                ? `${getNextFollowUpLabel()}${item.nextFollowUpTime ? ` ${item.nextFollowUpTime}` : ''}`
                : 'بدون پیگیری'}
            </span>
          </span>
        </div>

        {item.assigned_to_name ? (
          <div className={styles.assignee}>
            <User size={11} />
            {item.assigned_to_name}
          </div>
        ) : (
          <div className={`${styles.assignee} ${styles.assigneeEmpty}`}>بدون مسئول</div>
        )}
      </div>

      <div
        className={styles.actionBar}
        data-tour="sale-card-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconView}`}
            title="جزئیات"
            onClick={(e) => stop(e, () => onViewDetail(item))}
          >
            <Eye size={14} />
          </button>
          {!isResultItem ? (
            <>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.iconFollow}`}
                title="پیگیری"
                onClick={(e) => stop(e, () => onStatusChange?.(item, 'followup'))}
              >
                <CalendarClock size={14} />
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.iconContract}`}
                title="قرارداد"
                onClick={(e) => stop(e, () => onStatusChange?.(item, 'contract'))}
              >
                <CheckCircle2 size={14} />
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.iconClose}`}
                title="بستن"
                onClick={(e) => stop(e, () => onStatusChange?.(item, 'close'))}
              >
                <CircleX size={14} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconArchive}`}
              title="آرشیو"
              onClick={(e) => stop(e, () => onArchive?.(item))}
            >
              <Archive size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default MarketingItem
