'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  X,
  Calendar,
  Clock as ClockIcon,
  CircleDot,
  CircleX,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  User,
  Phone,
  Loader2,
  FileText,
  Paperclip,
  Mic,
  Square,
  Trash2,
  Image as ImageIcon,
  File,
  Music,
} from 'lucide-react'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import styles from '../styles/StatusChangeModal.module.css'

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
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|webm|m4a|aac)$/.test(name)) return 'audio'
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/.test(name)) return 'image'
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  return 'file'
}

const StatusChangeModal = ({
  isOpen,
  onClose,
  item,
  action,
  onConfirm,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    nextFollowUp: '',
    nextFollowUpTime: '',
    changeReason: '',
    description: '',
  })
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
      setFormData({
        nextFollowUp: '',
        nextFollowUpTime: '',
        changeReason: '',
        description: '',
      })
      setAttachments([])
      setError('')
      stopRecordingCleanup()
    }
    return () => stopRecordingCleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, action])

  if (!isOpen || !item) return null

  const getActionConfig = () => {
    const configs = {
      followup: {
        title: 'ثبت گزارش پیگیری',
        hint: 'توضیح بنویسید یا ویس بفرستید؛ هر دو در رصد مسیر ثبت می‌شود.',
        icon: <CalendarClock size={22} />,
        color: '#c2410c',
        soft: '#fff7ed',
        status: 'in_progress',
        fields: ['nextFollowUp', 'nextFollowUpTime', 'description'],
        requireDate: true,
        placeholder: 'مثلاً: تماس گرفته شد، مشتری درخواست پیش‌فاکتور کرد...',
        confirmText: 'ادامه و تایید',
      },
      close: {
        title: 'بسته شدن مورد',
        hint: 'دلیل بستن را بنویسید یا با ویس توضیح دهید؛ می‌توانید فایل هم پیوست کنید.',
        icon: <CircleX size={22} />,
        color: '#b91c1c',
        soft: '#fef2f2',
        status: 'cancelled',
        fields: ['changeReason', 'description'],
        requireDate: false,
        placeholder: 'توضیح کامل درباره علت بسته شدن...',
        confirmText: 'ادامه و تایید',
      },
      contract: {
        title: 'تبدیل به قرارداد',
        hint: 'جزئیات قرارداد را بنویسید یا ویس بفرستید؛ مدارک را هم می‌توانید پیوست کنید.',
        icon: <CheckCircle2 size={22} />,
        color: '#15803d',
        soft: '#f0fdf4',
        status: 'confirmed',
        fields: ['changeReason', 'description'],
        requireDate: false,
        placeholder: 'مثلاً: قرارداد امضا شد، مبلغ توافقی...',
        confirmText: 'ادامه و تایید',
      },
    }
    return configs[action] || configs.followup
  }

  const config = getActionConfig()

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
          kind === 'image' || kind === 'audio'
            ? URL.createObjectURL(file)
            : null
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
        const blob = new Blob(chunksRef.current, { type: blobType || 'audio/webm' })
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
        const fileType = blob.type || 'audio/webm'
        let file
        try {
          file = new File([blob], fileName, { type: fileType })
        } catch {
          // بعضی مرورگرهای قدیمی File constructor ندارند
          file = new Blob([blob], { type: fileType })
          Object.defineProperty(file, 'name', { value: fileName })
        }
        addFiles([file])
      }

      // timeslice تا در همه مرورگرها chunk بیاید
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
    } catch (err) {
      console.error(err)
      setError('دسترسی به میکروفون مجاز نیست یا در دسترس نیست')
      stopRecordingCleanup()
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    } else {
      stopRecordingCleanup()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (recording) {
      setError('ابتدا ضبط صوت را متوقف کنید')
      return
    }

    if (config.requireDate && !formData.nextFollowUp) {
      setError('لطفاً تاریخ پیگیری بعدی را انتخاب کنید')
      return
    }

    if (config.fields.includes('changeReason') && !formData.changeReason.trim()) {
      setError('لطفاً دلیل تغییر وضعیت را وارد کنید')
      return
    }

    const hasVoice = attachments.some((a) => a.kind === 'audio')
    const description = formData.description.trim()
    if (!description && !hasVoice) {
      setError('توضیح بنویسید یا حداقل یک ویس ضبط کنید')
      return
    }

    onConfirm(item.id, config.status, {
      ...formData,
      description: description || 'گزارش صوتی پیوست شد',
      changeReason: formData.changeReason || '',
      files: attachments.map((a) => a.file),
    })
  }

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const recordLabel = `${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(
    recordSeconds % 60
  ).padStart(2, '0')}`

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span
              className={styles.iconWrapper}
              style={{ color: config.color, backgroundColor: config.soft }}
            >
              {config.icon}
            </span>
            <div>
              <h2>{config.title}</h2>
              <p className={styles.headerHint}>{config.hint}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.itemInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              <User size={14} />
              عنوان
            </span>
            <span className={styles.infoValue}>{item.title}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              <Phone size={14} />
              موبایل
            </span>
            <span className={styles.infoValue} dir="ltr">
              {item.phone}
            </span>
          </div>
          {item.customer_name ? (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <User size={14} />
                مشتری
              </span>
              <span className={styles.infoValue}>{item.customer_name}</span>
            </div>
          ) : null}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              <CircleDot size={14} />
              وضعیت
            </span>
            <span
              className={styles.currentStatus}
              style={{ color: config.color, backgroundColor: config.soft }}
            >
              {item.status_display || item.status}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {config.fields.includes('nextFollowUp') ? (
            <div className={styles.dateSection}>
              <div className={styles.formGroup}>
                <label>
                  <Calendar size={14} />
                  تاریخ پیگیری بعدی *
                </label>
                <PersianDatePicker
                  value={formData.nextFollowUp}
                  onChange={(date) => handleFieldChange('nextFollowUp', date)}
                  placeholder="انتخاب تاریخ"
                  theme="light"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <ClockIcon size={14} />
                  ساعت (اختیاری)
                </label>
                <input
                  type="time"
                  value={formData.nextFollowUpTime}
                  onChange={(e) =>
                    handleFieldChange('nextFollowUpTime', e.target.value)
                  }
                />
              </div>
            </div>
          ) : null}

          {config.fields.includes('changeReason') ? (
            <div className={styles.formGroup}>
              <label>
                <AlertCircle size={14} />
                دلیل تغییر وضعیت *
              </label>
              <input
                type="text"
                value={formData.changeReason}
                onChange={(e) =>
                  handleFieldChange('changeReason', e.target.value)
                }
                placeholder={
                  action === 'close'
                    ? 'مثلاً: مشتری منصرف شد'
                    : 'مثلاً: قرارداد امضا شد'
                }
                required
              />
            </div>
          ) : null}

          <div className={styles.formGroup}>
            <label>
              <FileText size={14} />
              گزارش کار *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder={`${config.placeholder} (اگر فقط ویس می‌فرستید، خالی بگذارید)`}
              rows={4}
            />
            <p className={styles.hint}>
              متن یا ویس — هر دو در رصد مسیر ثبت می‌شود.
            </p>
          </div>

          <div className={styles.voicePanel}>
            <div className={styles.voiceHead}>
              <span className={styles.voiceTitle}>
                <Mic size={15} />
                پیام صوتی
              </span>
              <span className={styles.voiceHint}>برای هر سه فرم: پیگیری، قرارداد، بستن</span>
            </div>
            {!recording ? (
              <button
                type="button"
                className={styles.voiceRecordBtn}
                onClick={startRecording}
                disabled={loading}
              >
                <Mic size={20} />
                شروع ضبط ویس
              </button>
            ) : (
              <button
                type="button"
                className={styles.voiceStopBtn}
                onClick={stopRecording}
              >
                <Square size={16} />
                توقف ضبط — {recordLabel}
              </button>
            )}
            {recording ? (
              <p className={styles.voiceRecordingHint}>در حال ضبط… بعد از توقف، ویس به گزارش اضافه می‌شود.</p>
            ) : (
              <p className={styles.hint}>می‌توانید چند ویس بفرستید؛ قبل از تایید می‌توانید پخش کنید.</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>
              <Paperclip size={14} />
              پیوست فایل (اختیاری)
            </label>
            <div className={styles.attachActions}>
              <button
                type="button"
                className={styles.attachBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || recording}
              >
                <Paperclip size={16} />
                انتخاب فایل
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                className={styles.hiddenInput}
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
            <p className={styles.hint}>
              تصویر، PDF یا سند — حداکثر {MAX_FILES} فایل، هر کدام تا ۲۰ مگابایت
            </p>

            {attachments.length > 0 ? (
              <ul className={styles.attachList}>
                {attachments.map((itemFile) => {
                  const KindIcon =
                    itemFile.kind === 'audio'
                      ? Music
                      : itemFile.kind === 'image'
                        ? ImageIcon
                        : itemFile.kind === 'pdf'
                          ? FileText
                          : File
                  return (
                    <li key={itemFile.id} className={styles.attachItem}>
                      <div className={styles.attachMeta}>
                        {itemFile.kind === 'image' && itemFile.previewUrl ? (
                          <img
                            src={itemFile.previewUrl}
                            alt=""
                            className={styles.attachThumb}
                          />
                        ) : (
                          <span className={styles.attachIcon}>
                            <KindIcon size={14} />
                          </span>
                        )}
                        <div className={styles.attachText}>
                          <span className={styles.attachName}>
                            {itemFile.displayName || itemFile.file?.name || 'فایل'}
                          </span>
                          <span className={styles.attachSize}>
                            {formatSize(itemFile.file?.size || 0)}
                            {itemFile.kind === 'audio' ? ' · صوت' : ''}
                          </span>
                          {itemFile.kind === 'audio' && itemFile.previewUrl ? (
                            <audio
                              controls
                              preload="metadata"
                              src={itemFile.previewUrl}
                              className={styles.attachAudio}
                            />
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.attachRemove}
                        onClick={() => removeAttachment(itemFile.id)}
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>

          {error ? (
            <p className={styles.hint} style={{ color: '#b91c1c', fontWeight: 700 }}>
              {error}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.confirmBtn}
              style={{ backgroundColor: config.color }}
              disabled={loading || recording}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  در حال آماده‌سازی...
                </>
              ) : (
                <>
                  {config.icon}
                  {config.confirmText}
                </>
              )}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusChangeModal
