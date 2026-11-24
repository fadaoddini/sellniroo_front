'use client'

import { useEffect } from 'react'
import { AlertTriangle, EyeOff, Loader2, Trash2, X } from 'lucide-react'
import styles from './StaffRemoveModal.module.css'

/**
 * Dialog for teacher/counselor removal: recommend deactivate, allow hard delete.
 */
export default function StaffRemoveModal({
  roleLabel = 'معلم',
  name = '',
  alreadyInactive = false,
  loading = false,
  onDeactivate,
  onHardDelete,
  onCancel,
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [loading, onCancel])

  const titleName = name ? `«${name}»` : ''

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onCancel} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-remove-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onCancel}
          disabled={loading}
          aria-label="بستن"
        >
          <X size={16} />
        </button>

        <div className={styles.iconWrapper}>
          <AlertTriangle size={28} />
        </div>

        <h3 id="staff-remove-title" className={styles.title}>
          حذف یا غیرفعال‌سازی {roleLabel} {titleName}
        </h3>

        <p className={styles.message}>
          حذف کامل باعث از بین رفتن تمام داده‌های مرتبط با این {roleLabel} می‌شود
          (دروس، آزمون‌ها، پرونده‌ها و …). این کار قابل بازگشت نیست.
        </p>

        {!alreadyInactive ? (
          <div className={styles.hint}>
            <EyeOff size={16} />
            <p>
              پیشنهاد می‌شود به‌جای حذف، این {roleLabel} را <strong>غیرفعال</strong> کنید.
              با غیرفعال‌سازی، از دید کاربران سایت پنهان می‌شود و داده‌ها حفظ می‌مانند.
            </p>
          </div>
        ) : (
          <div className={styles.hint}>
            <EyeOff size={16} />
            <p>این {roleLabel} هم‌اکنون غیرفعال است و از دید کاربران سایت پنهان است.</p>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            انصراف
          </button>
          {!alreadyInactive ? (
            <button
              type="button"
              className={styles.deactivateBtn}
              onClick={onDeactivate}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <EyeOff size={14} />}
              غیرفعال کن
            </button>
          ) : null}
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onHardDelete}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className={styles.spin} /> : <Trash2 size={14} />}
            حذف کامل
          </button>
        </div>
      </div>
    </div>
  )
}
