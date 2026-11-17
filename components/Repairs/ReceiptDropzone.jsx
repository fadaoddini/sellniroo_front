'use client'

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import styles from './ReceiptDropzone.module.css'

function formatSize(bytes) {
  const n = Number(bytes || 0)
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default function ReceiptDropzone({
  file = null,
  onChange,
  disabled = false,
  label = 'تصویر رسید',
  hint = 'بکشید و رها کنید، یا برای انتخاب کلیک کنید',
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const previewUrl = useMemo(() => {
    if (!file) return null
    try {
      return URL.createObjectURL(file)
    } catch {
      return null
    }
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const pick = (next) => {
    setError('')
    if (!next) {
      onChange?.(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (!next.type?.startsWith('image/')) {
      setError('فقط فایل تصویری مجاز است')
      return
    }
    if (next.size > 8 * 1024 * 1024) {
      setError('حجم تصویر حداکثر ۸ مگابایت باشد')
      return
    }
    onChange?.(next)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    if (disabled) return
    pick(e.dataTransfer.files?.[0] || null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {file ? (
          <button
            type="button"
            className={styles.clearBtn}
            disabled={disabled}
            onClick={() => pick(null)}
          >
            <Trash2 size={12} />
            حذف
          </button>
        ) : null}
      </div>

      {file && previewUrl ? (
        <div className={`${styles.zone} ${styles.zoneFilled}`}>
          <div className={styles.preview}>
            <img src={previewUrl} alt="پیش‌نمایش رسید" />
          </div>
          <div className={styles.meta}>
            <strong title={file.name}>{file.name}</strong>
            <span>{formatSize(file.size)}</span>
            <button
              type="button"
              className={styles.changeBtn}
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              تعویض تصویر
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`${styles.zone} ${dragging ? styles.zoneActive : ''} ${
            disabled ? styles.zoneDisabled : ''
          }`}
          onDragEnter={(e) => {
            e.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragging(false)
          }}
          onDrop={onDrop}
        >
          <span className={styles.iconBox} aria-hidden>
            {dragging ? <Upload size={18} /> : <ImagePlus size={18} />}
          </span>
          <span className={styles.zoneTitle}>
            {dragging ? 'رها کنید' : 'آپلود تصویر رسید'}
          </span>
          <span className={styles.zoneHint}>{hint}</span>
          <span className={styles.zoneFormats}>JPG، PNG یا WEBP — تا ۸ مگابایت</span>
        </label>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        disabled={disabled}
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  )
}
