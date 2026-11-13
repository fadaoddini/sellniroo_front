'use client'

import React from 'react'
import {
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  Info,
  ArrowLeft,
  CalendarClock,
  CircleX,
} from 'lucide-react'
import styles from '../styles/ConfirmDialog.module.css'

const TYPE_META = {
  warning: {
    icon: CalendarClock,
    iconClass: styles.iconWrapWarning,
    btnClass: styles.confirmBtnWarning,
    chipTo: styles.chipToWarning,
    toLabel: 'پیگیری',
  },
  danger: {
    icon: CircleX,
    iconClass: styles.iconWrapDanger,
    btnClass: styles.confirmBtnDanger,
    chipTo: styles.chipToDanger,
    toLabel: 'بسته شده',
  },
  success: {
    icon: CheckCircle2,
    iconClass: styles.iconWrapSuccess,
    btnClass: styles.confirmBtnSuccess,
    chipTo: styles.chipToSuccess,
    toLabel: 'قرارداد',
  },
  info: {
    icon: Info,
    iconClass: styles.iconWrapInfo,
    btnClass: styles.confirmBtnInfo,
    chipTo: styles.chipToInfo,
    toLabel: 'بروزرسانی',
  },
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تایید',
  cancelText = 'انصراف',
  type = 'warning',
  loading = false,
  itemTitle,
  itemPhone,
  itemCustomer,
  fromStatus,
  details = [],
}) => {
  if (!isOpen) return null

  const meta = TYPE_META[type] || TYPE_META.warning
  const Icon = meta.icon || AlertTriangle

  const rows = [
    itemTitle ? { label: 'عنوان', value: itemTitle } : null,
    itemCustomer ? { label: 'مشتری', value: itemCustomer } : null,
    itemPhone ? { label: 'موبایل', value: itemPhone } : null,
    ...details.filter(Boolean),
  ].filter(Boolean)

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.handle} />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          disabled={loading}
          aria-label="بستن"
        >
          <X size={18} />
        </button>

        <div className={`${styles.iconWrap} ${meta.iconClass}`}>
          <Icon size={34} strokeWidth={2.2} />
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        {(fromStatus || meta.toLabel) && (
          <div className={styles.changePreview}>
            {fromStatus ? (
              <span className={`${styles.chip} ${styles.chipFrom}`}>{fromStatus}</span>
            ) : null}
            <ArrowLeft size={16} className={styles.arrow} />
            <span className={`${styles.chip} ${meta.chipTo}`}>{meta.toLabel}</span>
          </div>
        )}

        {rows.length > 0 ? (
          <div className={styles.detailCard}>
            {rows.map((row) => (
              <div key={`${row.label}-${row.value}`} className={styles.detailRow}>
                <span className={styles.detailLabel}>{row.label}</span>
                <span className={styles.detailValue}>{row.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.confirmBtn} ${meta.btnClass}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                در حال ثبت...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
