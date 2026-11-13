'use client'

import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  User,
  Clock,
  CircleDot,
  CheckCircle2,
  CircleX,
  PlusCircle,
  RefreshCw,
  UserCog,
  Archive,
  RotateCcw,
  FileText,
  Image as ImageIcon,
  Music,
  File,
  Download,
  ExternalLink,
  ScrollText,
} from 'lucide-react'
import Config from '@/config/config'
import styles from '../styles/FollowupTimeline.module.css'

const resolveMediaUrl = (url) => {
  if (!url) return null
  const raw = String(url)
  if (/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw
  }
  const base = String(Config.baseUrl || '').replace(/\/$/, '')
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`
}

const formatBytes = (bytes = 0) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatMoney = (value) => {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '۰'
  return Math.round(n).toLocaleString('fa-IR')
}

const isAudioAttachment = (att) => {
  if (!att) return false
  if (att.file_type === 'audio') return true
  const ctype = String(att.content_type || '').toLowerCase()
  if (ctype.startsWith('audio/')) return true
  const name = String(att.original_name || att.url || '').toLowerCase()
  return /\.(mp3|wav|ogg|webm|m4a|aac)(\?|$)/i.test(name)
}

const isImageAttachment = (att) => {
  if (!att) return false
  if (att.file_type === 'image') return true
  const ctype = String(att.content_type || '').toLowerCase()
  if (ctype.startsWith('image/')) return true
  const name = String(att.original_name || '').toLowerCase()
  return /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(name)
}

const resolveDocFromFollowup = (followup) => {
  if (followup?.related_invoice?.id) return followup.related_invoice
  if (followup?.invoice?.id) return followup.invoice
  const action = followup?.action_type
  if (action === 'proforma' || action === 'invoice') {
    return {
      id: followup.related_invoice_id || null,
      number: followup.doc_number || '',
      doc_type: action,
      doc_type_label: action === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور',
      grand_total: followup.grand_total || '',
      items_preview: followup.items_preview || [],
    }
  }
  const text = `${followup?.description || ''} ${followup?.change_reason || followup?.changeReason || ''}`
  const m = text.match(/(پیش[‌\s-]?فاکتور|فاکتور)\s*(?:شماره)?\s*([A-Za-z0-9\-\/]+)/i)
  if (!m) return null
  const isInvoice = /فاکتور/i.test(m[1]) && !/پیش/.test(m[1])
  return {
    id: null,
    number: m[2],
    doc_type: isInvoice ? 'invoice' : 'proforma',
    doc_type_label: isInvoice ? 'فاکتور' : 'پیش‌فاکتور',
    grand_total: '',
    items_preview: [],
  }
}

const FollowupTimeline = ({ followups = [] }) => {
  if (!followups || followups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Clock size={24} />
        <span>هیچ فعالیتی ثبت نشده است</span>
      </div>
    )
  }

  const getActionIcon = (actionType) => {
    const icons = {
      create: <PlusCircle size={14} />,
      followup: <RefreshCw size={14} />,
      close: <CircleX size={14} />,
      contract: <CheckCircle2 size={14} />,
      update: <RefreshCw size={14} />,
      assign: <UserCog size={14} />,
      archive: <Archive size={14} />,
      unarchive: <RotateCcw size={14} />,
      proforma: <ScrollText size={14} />,
      invoice: <FileText size={14} />,
    }
    return icons[actionType] || <CircleDot size={14} />
  }

  const getActionColor = (actionType) => {
    const colors = {
      create: '#1d4ed8',
      followup: '#c2410c',
      close: '#b91c1c',
      contract: '#15803d',
      update: '#0f766e',
      assign: '#7c3aed',
      archive: '#475569',
      unarchive: '#0f766e',
      proforma: '#0369a1',
      invoice: '#0f766e',
    }
    return colors[actionType] || '#6b7280'
  }

  const getActionLabel = (actionType) => {
    const labels = {
      create: 'ایجاد شد',
      followup: 'پیگیری شد',
      close: 'بسته شد',
      contract: 'قرارداد شد',
      update: 'بروزرسانی شد',
      assign: 'واگذار شد',
      archive: 'آرشیو شد',
      unarchive: 'از آرشیو برگشت',
      proforma: 'پیش‌فاکتور صادر شد',
      invoice: 'فاکتور صادر شد',
    }
    return labels[actionType] || actionType
  }

  const getStatusLabel = (status) => {
    const map = {
      new: 'جدید',
      in_progress: 'در حال پیگیری',
      cancelled: 'بسته شده',
      confirmed: 'قرارداد',
    }
    return map[status] || status
  }

  const getStatusColor = (status) => {
    const map = {
      new: '#1d4ed8',
      in_progress: '#c2410c',
      cancelled: '#b91c1c',
      confirmed: '#15803d',
    }
    return map[status] || '#6b7280'
  }

  const pickDate = (followup) =>
    followup.created_at || followup.createdAt || followup.next_follow_up || followup.nextFollowUp

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const fileIcon = (type) => {
    if (type === 'audio') return <Music size={14} />
    if (type === 'image') return <ImageIcon size={14} />
    if (type === 'pdf') return <FileText size={14} />
    return <File size={14} />
  }

  return (
    <div className={styles.timeline}>
      {followups.map((followup, index) => {
        const isFirst = index === 0
        const isLast = index === followups.length - 1
        const doc = resolveDocFromFollowup(followup)
        const actionType =
          followup.action_type === 'update' && doc
            ? doc.doc_type === 'invoice'
              ? 'invoice'
              : 'proforma'
            : followup.action_type
        const actionColor = getActionColor(actionType)
        const isContract = actionType === 'contract'
        const isClose = actionType === 'close'
        const isDoc = actionType === 'proforma' || actionType === 'invoice'
        const attachments = Array.isArray(followup.attachments) ? followup.attachments : []
        const items = Array.isArray(doc?.items_preview) ? doc.items_preview : []

        return (
          <div
            key={followup.id}
            className={`${styles.timelineItem} ${isFirst ? styles.firstItem : ''} ${isLast ? styles.lastItem : ''}`}
          >
            {!isLast && (
              <div
                className={styles.timelineLine}
                style={{ borderColor: actionColor + '40' }}
              />
            )}

            <div className={styles.timelineDot} style={{ backgroundColor: actionColor }}>
              {getActionIcon(actionType)}
            </div>

            <div
              className={`${styles.timelineCard} ${isContract ? styles.contractCard : ''} ${isClose ? styles.closeCard : ''} ${isDoc ? styles.docCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardLeft}>
                  <span
                    className={styles.actionBadge}
                    style={{ backgroundColor: actionColor + '15', color: actionColor }}
                  >
                    {getActionIcon(actionType)}
                    {getActionLabel(actionType)}
                  </span>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: getStatusColor(followup.status) + '15',
                      color: getStatusColor(followup.status),
                    }}
                  >
                    {getStatusLabel(followup.status)}
                  </span>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.time}>
                    <Clock size={12} />
                    {formatTime(pickDate(followup))}
                  </span>
                  <span className={styles.date}>
                    <Calendar size={12} />
                    {formatDate(pickDate(followup))}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                {isDoc && doc ? (
                  <div className={styles.docPanel}>
                    <div className={styles.docHead}>
                      <strong>
                        {doc.doc_type_label ||
                          (doc.doc_type === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور')}
                        {doc.number ? ` ${doc.number}` : ''}
                      </strong>
                      {doc.grand_total ? (
                        <span>{formatMoney(doc.grand_total)} ریال</span>
                      ) : null}
                    </div>
                    {items.length > 0 ? (
                      <ul className={styles.docItems}>
                        {items.map((it, i) => (
                          <li key={`${followup.id}-item-${i}`}>
                            <span>{it.description || '—'}</span>
                            <em>
                              {it.area_sqm
                                ? `${Number(it.area_sqm).toLocaleString('fa-IR')} م²`
                                : ''}
                              {it.line_total
                                ? ` · ${formatMoney(it.line_total)} ریال`
                                : ''}
                            </em>
                          </li>
                        ))}
                      </ul>
                    ) : followup.description ? (
                      <p className={styles.description}>{followup.description}</p>
                    ) : null}
                    {doc.id ? (
                      <Link
                        href={`/sale/invoice?id=${doc.id}`}
                        className={styles.docLink}
                      >
                        <ExternalLink size={13} />
                        مشاهده سند
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <p className={styles.description}>{followup.description}</p>
                )}

                {(followup.change_reason || followup.changeReason) && !isDoc ? (
                  <div className={styles.reason}>
                    <span className={styles.reasonLabel}>دلیل:</span>
                    <span className={styles.reasonText}>
                      {followup.change_reason || followup.changeReason}
                    </span>
                  </div>
                ) : null}

                {(followup.next_follow_up || followup.nextFollowUp) && (
                  <div className={styles.nextFollow}>
                    <Calendar size={12} />
                    <span>
                      پیگیری بعدی:{' '}
                      {formatDate(followup.next_follow_up || followup.nextFollowUp)}
                    </span>
                    {(followup.next_follow_up_time || followup.nextFollowUpTime) && (
                      <span className={styles.nextTime}>
                        ساعت {followup.next_follow_up_time || followup.nextFollowUpTime}
                      </span>
                    )}
                  </div>
                )}

                {attachments.length > 0 ? (
                  <div className={styles.attachments}>
                    <div className={styles.attachmentsTitle}>پیوست‌ها ({attachments.length})</div>
                    <div className={styles.attachGrid}>
                      {attachments.map((att) => {
                        const url = resolveMediaUrl(att.url)
                        const name = att.original_name || 'فایل'
                        if (isImageAttachment(att) && url) {
                          return (
                            <a
                              key={att.id}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.imageCard}
                              title={name}
                            >
                              <img src={url} alt={name} />
                              <span className={styles.imageName}>{name}</span>
                            </a>
                          )
                        }
                        if (isAudioAttachment(att) && url) {
                          return (
                            <div key={att.id} className={styles.audioCard}>
                              <div className={styles.audioHead}>
                                <Music size={14} />
                                <span>{name.startsWith('voice-') ? 'فایل صوتی' : name}</span>
                                <a
                                  href={url}
                                  download={name}
                                  className={styles.audioDownload}
                                  title="دانلود صوت"
                                >
                                  <Download size={13} />
                                </a>
                              </div>
                              <audio
                                controls
                                preload="metadata"
                                src={url}
                                className={styles.audioPlayer}
                              >
                                مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
                              </audio>
                            </div>
                          )
                        }
                        return (
                          <a
                            key={att.id}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fileCard}
                            download={name}
                          >
                            <span className={styles.fileIcon}>
                              {fileIcon(isAudioAttachment(att) ? 'audio' : att.file_type)}
                            </span>
                            <span className={styles.fileMeta}>
                              <span className={styles.fileName}>{name}</span>
                              <span className={styles.fileSize}>
                                {att.file_type_display || att.file_type}
                                {att.file_size ? ` · ${formatBytes(att.file_size)}` : ''}
                              </span>
                            </span>
                            <span className={styles.fileAction}>
                              {att.file_type === 'pdf' ? (
                                <ExternalLink size={14} />
                              ) : (
                                <Download size={14} />
                              )}
                            </span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {followup.created_by_name && (
                  <div className={styles.createdBy}>
                    <User size={12} />
                    <span>توسط: {followup.created_by_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FollowupTimeline
