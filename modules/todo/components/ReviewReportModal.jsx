'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  Mic,
  Paperclip,
  Square,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import styles from '../styles/Report.module.css'

const MAX_FILES = 8
const MAX_SIZE = 20 * 1024 * 1024

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
  return 'file'
}

export default function ReviewReportModal({
  isOpen,
  onClose,
  task,
  report,
  onSubmit,
  loading = false,
}) {
  const [decision, setDecision] = useState('approved')
  const [note, setNote] = useState('')
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
      setDecision('approved')
      setNote('')
      setAttachments([])
      setError('')
      stopRecordingCleanup()
    }
    return () => stopRecordingCleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, report?.id])

  if (!isOpen || !task || !report) return null

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    setAttachments((prev) => {
      const next = [...prev]
      for (const file of incoming) {
        if (next.length >= MAX_FILES) {
          setError(`حداکثر ${MAX_FILES} فایل`)
          break
        }
        if (file.size > MAX_SIZE) {
          setError(`حجم فایل بیش از ۲۰ مگابایت است`)
          continue
        }
        const kind = guessKind(file)
        const previewUrl = kind === 'audio' ? URL.createObjectURL(file) : null
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          kind,
          previewUrl,
          displayName: file.name || 'پیام صوتی',
        })
      }
      return next
    })
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
        const ext = blobType.includes('mp4') ? 'm4a' : 'webm'
        const blob = new Blob(chunksRef.current, { type: blobType })
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
          setError('ضبط خالی بود')
          return
        }
        const fileName = `review-voice-${Date.now()}.${ext}`
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
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      setError('دسترسی میکروفون ممکن نیست')
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
      setError('ابتدا ضبط را متوقف کنید')
      return
    }
    const hasVoice = attachments.some((a) => a.kind === 'audio')
    const text = note.trim()
    if (!text && !hasVoice) {
      setError('دلیل تأیید/رد را بنویسید یا ویس بدهید')
      return
    }
    try {
      await onSubmit({
        decision,
        review_note: text || (decision === 'approved' ? 'تأیید صوتی ثبت شد' : 'رد صوتی ثبت شد'),
        files: attachments.map((a) => a.file),
      })
    } catch (err) {
      setError(err?.message || err?.error || 'ثبت بررسی ناموفق بود')
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
              {decision === 'approved' ? (
                <CheckCircle2 size={18} />
              ) : (
                <XCircle size={18} />
              )}
            </span>
            <div>
              <h3>بررسی گزارش کارمند</h3>
              <p>تأیید یا رد کنید و دلیل را با متن یا ویس ثبت کنید.</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        <p className={styles.taskTitle}>
          <strong>{task.title}</strong>
          <br />
          گزارش {report.author_name || 'کارمند'}: {report.description}
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.decisionRow}>
            <button
              type="button"
              className={`${styles.decisionBtn} ${
                decision === 'approved' ? styles.decisionApprove : ''
              }`}
              onClick={() => setDecision('approved')}
              disabled={loading}
            >
              <CheckCircle2 size={15} /> تأیید
            </button>
            <button
              type="button"
              className={`${styles.decisionBtn} ${
                decision === 'rejected' ? styles.decisionReject : ''
              }`}
              onClick={() => setDecision('rejected')}
              disabled={loading}
            >
              <XCircle size={15} /> رد
            </button>
          </div>

          <label className={styles.label}>توضیح مدیر</label>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              decision === 'approved'
                ? 'مثلاً: عالی بود، ادامه بده...'
                : 'مثلاً: ناقص است، جزئیات بیشتری لازم است...'
            }
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
              {recording ? `توقف ${recordLabel}` : 'ویس مدیر'}
            </button>
            <button
              type="button"
              className={styles.mediaBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Paperclip size={14} />
              پیوست
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
            <button
              type="submit"
              className={
                decision === 'approved' ? styles.btnApprove : styles.btnReject
              }
              disabled={loading}
            >
              {loading ? <Loader2 size={15} className={styles.spin} /> : null}
              {decision === 'approved' ? 'ثبت تأیید' : 'ثبت رد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
