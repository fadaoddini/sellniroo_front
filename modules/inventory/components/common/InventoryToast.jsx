'use client'

import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'
import styles from './InventoryToast.module.css'

/**
 * @param {{ message: string, type?: 'success' | 'error', duration?: number } | null} toast
 * @param {() => void} onClose
 */
export default function InventoryToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const ms = toast.duration ?? (toast.type === 'error' ? 5500 : 4000)
    const id = setTimeout(onClose, ms)
    return () => clearTimeout(id)
  }, [toast, onClose])

  if (!toast?.message) return null

  const isError = toast.type === 'error'

  return (
    <div
      className={`${styles.toast} ${isError ? styles.error : styles.success}`}
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
    >
      {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      <span className={styles.message}>{toast.message}</span>
      <button type="button" className={styles.close} onClick={onClose} aria-label="close">
        <X size={16} />
      </button>
    </div>
  )
}

export function getApiErrorMessage(err, fallback = 'خطا در انجام عملیات') {
  const data = err?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  if (typeof data?.error === 'string' && data.error.trim()) return data.error
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors).flat?.()?.[0]
    if (typeof first === 'string') return first
  }
  const status = err?.response?.status
  if (status === 404) return 'سرویس یافت نشد (۴۰۴)'
  if (status === 401 || status === 403) return 'دسترسی مجاز نیست'
  if (status >= 500) return 'خطای سرور؛ لطفاً دوباره تلاش کنید'
  if (typeof err?.message === 'string' && !err.message.startsWith('Request failed')) {
    return err.message
  }
  return fallback
}
