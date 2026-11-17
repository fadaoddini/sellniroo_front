'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import styles from '../styles/Report.module.css'

const MAX_FILES = 8
const MAX_SIZE = 20 * 1024 * 1024

const ACTIVITY_OPTIONS = [
  { id: 'in_progress', label: 'در حال انجام' },
  { id: 'review', label: 'ارسال بررسی' },
  { id: 'done', label: 'اعلام اتمام' },
]

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const guessKind = (file) => {
  const type = (file?.type || '').toLowerCase()
  const name = (file?.name || '').toLowerCase()
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|webm|m4a|aac)$/.test(name))
    return 'audio'
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/.test(name))
    return 'image'
  return 'file'
}

export default function ActivityReportModal({
  isOpen,
  onClose,
  task,
  onSubmit,
  loading = false,
}) {
  const [description, setDescription] = useState('')
  const [activityStatus, setActivityStatus] = useState('in_progress')
  const [attachments, setAttachments] = useState([])
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const stopRecordingCleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
    setRecording(false)
    setRecordSeconds(0)
  }

  useEffect(() => {
    if (isOpen) {
      setDescription('')
      setActivityStatus(
        task?.status === 'done' || task?.status === 'review'
          ? task.status
          : 'in_progress'
      )
      setAttachments([])
      setError('')
      stopRecordingCleanup()
    }
    return () => stopRecordingCleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?.id])

  if (!isOpen || !task) return null

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    setAttachments((prev) => {
      const next = [...prev]
      for (const file of incoming) {
        if (next.length >= MAX_FILES) {
          setError(`حداکثر ${MAX_FILES} فایل می‌توانید پیوست کنید`)
          break
        }
        if (file.size > MAX_SIZE) {
          setError(`حجم «${file.name || 'فایل'}» بیش از ۲۰ مگابایت است`)
          continue
        }
        const kind = guessKind(file)
        const previewUrl =
          kind === 'audio' || kind === 'image' ? URL.createObjectURL(file) : null
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          kind,
          previewUrl,
          displayName:
            file.name ||
            (kind === 'audio' ? 'پیام صوتی' : `فایل-${next.length + 1}`),
        })
      }
      return next
    })
    if (error) setError('')
  }

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((a) => a.id !== id)
    })
  }

  const startRecording = async () => {
    setError('')
    if (attachments.length >= MAX_FILES) {
      setError(`حداکثر ${MAX_FILES} فایل می‌توانید پیوست کنید`)
      return
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('ضبط صوت در این مرورگر پشتیبانی نمی‌شود')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blobType = recorder.mimeType || 'audio/webm'
        const ext = blobType.includes('mp4')
          ? 'm4a'
          : blobType.includes('mpeg')
            ? 'mp3'
            : 'webm'
        const blob = new Blob(chunksRef.current, {
          type: blobType || 'audio/webm',
        })
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
        mediaRecorderRef.current = null
        chunksRef.current = []
        setRecording(false)
        setRecordSeconds(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        if (!blob.size) {
          setError('ضبط صوت خالی بود — دوباره امتحان کنید')
          return
        }
        const stamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19)
        const fileName = `voice-${stamp}.${ext}`
        let file
        try {
          file = new File([blob], fileName, { type: blob.type || 'audio/webm' })
        } catch {
          file = new Blob([blob], { type: blob.type || 'audio/webm' })
          Object.defineProperty(file, 'name', { value: fileName })
        }
        addFiles([file])
      }

      try {
        recorder.start(400)
      } catch {
        recorder.start()
      }
      setRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } catch {
      setError('دسترسی به میکروفون مجاز نیست یا در دسترس نیست')
      stopRecordingCleanup()
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    else stopRecordingCleanup()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (recording) {
      setError('ابتدا ضبط صوت را متوقف کنید')
      return
    }
    const hasVoice = attachments.some((a) => a.kind === 'audio')
    const text = description.trim()
    if (!text && !hasVoice) {
      setError('توضیح بنویسید یا حداقل یک ویس ضبط کنید')
      return
    }
    try {
      await onSubmit({
        description: text || 'گزارش صوتی پیوست شد',
        activity_status: activityStatus,
        files: attachments.map((a) => a.file),
      })
    } catch (err) {
      setError(err?.message || err?.error || 'ثبت گزارش ناموفق بود')
    }
  }

  const recordLabel = `${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(
    recordSeconds % 60
  ).padStart(2, '0')}`

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.handle} />
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.iconWrap}>
              <FileText size={18} />
            </span>
            <div>
              <h3>ثبت فعالیت روزانه</h3>
              <p>متن، ویس یا فایل پیوست کنید؛ مدیر بررسی می‌کند.</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        <p className={styles.taskTitle}>
          وظیفه: <strong>{task.title}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>وضعیت فعلی کار</label>
          <div className={styles.statusRow}>
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`${styles.statusBtn} ${
                  activityStatus === opt.id ? styles.statusBtnActive : ''
                }`}
                onClick={() => setActivityStatus(opt.id)}
                disabled={loading}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className={styles.label}>گزارش عملکرد</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثلاً: امروز تماس‌ها انجام شد، فایل طراحی آماده است..."
            disabled={loading}
          />

          <div className={styles.mediaBar}>
            <button
              type="button"
              className={`${styles.mediaBtn} ${recording ? styles.mediaBtnRec : ''}`}
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
            >
              {recording ? <Square size={14} /> : <Mic size={14} />}
              {recording ? `توقف ${recordLabel}` : 'ضبط ویس'}
            </button>
            <button
              type="button"
              className={styles.mediaBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Paperclip size={14} />
              پیوست فایل
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {attachments.length ? (
            <div className={styles.fileList}>
              {attachments.map((a) => (
                <div key={a.id} className={styles.fileItem}>
                  {a.kind === 'audio' && a.previewUrl ? (
                    <audio src={a.previewUrl} controls preload="metadata" />
                  ) : null}
                  <span className={styles.fileMeta}>
                    {a.displayName} · {formatSize(a.file?.size)}
                  </span>
                  <button
                    type="button"
                    className={styles.fileRemove}
                    onClick={() => removeAttachment(a.id)}
                    aria-label="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={onClose}
              disabled={loading}
            >
              انصراف
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? <Loader2 size={15} className={styles.spin} /> : null}
              ثبت گزارش
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
