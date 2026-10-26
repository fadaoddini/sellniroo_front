// components/newsAdmin/NewsList.jsx
'use client'

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import moment from 'moment-jalaali'
import {
  Edit, Trash2, Eye, Heart, MessageSquare, AlertCircle,
  RefreshCw, Star, Zap, Calendar, Send, CheckCircle, Loader2, X,
} from 'lucide-react'
import styles from '@/styles/modules/NewsManagement.module.css'

// ============================================================
// ✅ Helper: ساخت URL کامل تصویر
// ============================================================
const getFullImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000'
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`
}

// ============================================================
// ✅ Helper: تبدیل تاریخ میلادی به شمسی
// ============================================================
const toJalali = (dateString, format = 'jYYYY/jMM/jDD') => {
  if (!dateString) return '—'
  try {
    return moment(dateString).format(format)
  } catch (err) {
    console.error('Date format error:', err)
    return dateString
  }
}

const toJalaliWithTime = (dateString) => {
  if (!dateString) return '—'
  try {
    return moment(dateString).format('jYYYY/jMM/jDD - HH:mm')
  } catch (err) {
    return dateString
  }
}

// ============================================================
// ✅ رنگ وضعیت‌ها
// ============================================================
const statusColors = {
  draft: { bg: '#f3f4f6', color: '#4b5563' },
  pending: { bg: '#fff3e0', color: '#e65100' },
  review: { bg: '#e1f5fe', color: '#0277bd' },
  published: { bg: '#dcfce7', color: '#166534' },
  scheduled: { bg: '#dbeafe', color: '#1e40af' },
  archived: { bg: '#f3e5f5', color: '#6a1b9a' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
}

const PLATFORM_LABELS = {
  bale: { fa: 'بله', en: 'Bale' },
  eitaa: { fa: 'ایتا', en: 'Eitaa' },
  rubika: { fa: 'روبیکا', en: 'Rubika' },
}

const NewsList = ({
  news, loading, error,
  onEdit, onDelete, onSendToBale, onRefresh, readyPlatforms = [],
  emptyHint,
}) => {
  const { language } = useLanguage()
  const [sendingBale, setSendingBale] = React.useState(null)
  const [sendTarget, setSendTarget] = React.useState(null)
  const [picked, setPicked] = React.useState({})

  const texts = {
    fa: {
      loading: 'در حال بارگذاری...',
      error: 'خطا در دریافت اطلاعات',
      empty: 'هیچ خبری یافت نشد',
      title: 'عنوان',
      category: 'دسته',
      status: 'وضعیت',
      stats: 'آمار',
      date: 'تاریخ',
      actions: 'عملیات',
      edit: 'ویرایش',
      delete: 'حذف',
      views: 'بازدید',
      likes: 'لایک',
      comments: 'کامنت',
      featured: 'ویژه',
      breaking: 'فوری',
      noCategory: 'بدون دسته',
      noImage: 'بدون تصویر',
      sendToBale: 'ارسال به پیام‌رسان‌ها',
      sending: 'در حال ارسال...',
      alreadySent: 'قبلاً ارسال شده',
      confirmSend: 'ارسال',
      cancel: 'انصراف',
      pickPlatforms: 'انتخاب پیام‌رسان‌ها',
      pickHint: 'هر کدام را که می‌خواهید انتخاب کنید؛ فقط پلتفرم‌های آماده نمایش داده می‌شوند.',
      selectAll: 'همه',
      noPlatform: 'هیچ پیام‌رسان آماده‌ای نیست. از «اتصالات پیام‌رسان» تنظیم کنید.',
      onlyPublished: 'فقط اخبار منتشر شده قابل ارسال هستند',
      pickOne: 'حداقل یک پیام‌رسان را انتخاب کنید',
      statusLabel: {
        draft: 'پیش‌نویس',
        pending: 'در انتظار',
        review: 'در حال بررسی',
        published: 'منتشر شده',
        scheduled: 'زمان‌بندی',
        archived: 'بایگانی',
        rejected: 'رد شده',
      }
    },
    en: {
      loading: 'Loading...',
      error: 'Error loading data',
      empty: 'No news found',
      title: 'Title',
      category: 'Category',
      status: 'Status',
      stats: 'Stats',
      date: 'Date',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      views: 'Views',
      likes: 'Likes',
      comments: 'Comments',
      featured: 'Featured',
      breaking: 'Breaking',
      noCategory: 'No Category',
      noImage: 'No Image',
      sendToBale: 'Send to messengers',
      sending: 'Sending...',
      alreadySent: 'Already sent',
      confirmSend: 'Send',
      cancel: 'Cancel',
      pickPlatforms: 'Choose messengers',
      pickHint: 'Pick where to send. Only ready platforms are listed.',
      selectAll: 'All',
      noPlatform: 'No ready messenger. Configure them in Messenger bots.',
      onlyPublished: 'Only published news can be sent',
      pickOne: 'Select at least one messenger',
      statusLabel: {
        draft: 'Draft', pending: 'Pending', review: 'Review',
        published: 'Published', scheduled: 'Scheduled',
        archived: 'Archived', rejected: 'Rejected',
      }
    }
  }

  const t = texts[language] || texts.fa
  const langKey = language === 'en' ? 'en' : 'fa'

  const openSendModal = (item) => {
    if (item.status !== 'published') {
      alert(t.onlyPublished)
      return
    }
    if (!readyPlatforms?.length) {
      alert(t.noPlatform)
      return
    }
    const initial = {}
    readyPlatforms.forEach((p) => { initial[p] = true })
    setPicked(initial)
    setSendTarget(item)
  }

  const togglePlatform = (platform) => {
    setPicked((prev) => ({ ...prev, [platform]: !prev[platform] }))
  }

  const selectAllPlatforms = () => {
    const next = {}
    readyPlatforms.forEach((p) => { next[p] = true })
    setPicked(next)
  }

  const confirmSend = async () => {
    if (!sendTarget) return
    const selected = {}
    let any = false
    readyPlatforms.forEach((p) => {
      selected[p] = !!picked[p]
      if (picked[p]) any = true
    })
    if (!any) {
      alert(t.pickOne)
      return
    }

    const item = sendTarget
    setSendTarget(null)
    setSendingBale(item.id)
    try {
      await onSendToBale(item, selected)
    } catch (err) {
      console.error('Send to platforms error:', err)
    } finally {
      setSendingBale(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <RefreshCw size={28} className={styles.spinning} />
        <p>{t.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
      </div>
    )
  }

  if (!news || news.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <AlertCircle size={28} />
        <p>{emptyHint || t.empty}</p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t.title}</th>
            <th>{t.category}</th>
            <th>{t.status}</th>
            <th>{t.stats}</th>
            <th>{t.date}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {news.map((n) => {
            const colors = statusColors[n.status] || statusColors.draft

            const imageUrl = getFullImageUrl(
              n.featured_image_display || n.featured_image
            )

            const publishDateJalali = toJalali(
              n.publish_date || n.created_at,
              'jYYYY/jMM/jDD'
            )

            const fullDateTitle = toJalaliWithTime(
              n.publish_date || n.created_at
            )

            const isSending = sendingBale === n.id
            const wasSent = !!(n.bale_sent_at || n.eitaa_sent_at || n.rubika_sent_at)
            const canSend = n.status === 'published'

            return (
              <tr key={n.id}>
                <td>
                  <div className={styles.newsCell}>
                    {imageUrl ? (
                      <div className={styles.newsThumb}>
                        <img
                          src={imageUrl}
                          alt={n.title || 'news'}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                            const parent = e.target.parentElement
                            if (parent) {
                              parent.classList.add(styles.imageError)
                              parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className={styles.newsThumbPlaceholder}>
                        {n.title?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className={styles.newsInfo}>
                      <div className={styles.newsTitle}>{n.title || '—'}</div>
                      {n.subtitle && (
                        <div className={styles.newsSubtitle}>{n.subtitle}</div>
                      )}
                      <div className={styles.newsBadges}>
                        {n.is_featured && (
                          <span className={`${styles.miniBadge} ${styles.badgeFeatured}`}>
                            <Star size={10} /> {t.featured}
                          </span>
                        )}
                        {n.is_breaking && (
                          <span className={`${styles.miniBadge} ${styles.badgeBreaking}`}>
                            <Zap size={10} /> {t.breaking}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {n.category_detail ? (
                    <span
                      className={styles.categoryBadge}
                      style={{
                        background: n.category_detail.color || '#6589ffff',
                        color: '#fff',
                      }}
                    >
                      {n.category_detail.name}
                    </span>
                  ) : (
                    <span className={styles.noCategory}>{t.noCategory}</span>
                  )}
                </td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {t.statusLabel[n.status] || n.status}
                  </span>
                </td>
                <td>
                  <div className={styles.statsCell}>
                    <span title={t.views}>
                      <Eye size={12} /> {n.view_count ?? 0}
                    </span>
                    <span title={t.likes}>
                      <Heart size={12} /> {n.like_count ?? 0}
                    </span>
                    <span title={t.comments}>
                      <MessageSquare size={12} /> {n.comment_count ?? 0}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.dateCell} title={fullDateTitle}>
                    <Calendar size={12} />
                    <span>{publishDateJalali}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    {/* ویرایش */}
                    <button
                      className={`${styles.iconBtn} ${styles.editBtn}`}
                      onClick={() => onEdit(n)}
                      title={t.edit}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className={`${styles.iconBtn} ${styles.baleBtn}`}
                      onClick={() => openSendModal(n)}
                      disabled={!canSend || isSending || !readyPlatforms?.length}
                      title={
                        !readyPlatforms?.length
                          ? t.noPlatform
                          : !canSend
                            ? t.onlyPublished
                            : wasSent
                              ? t.alreadySent
                              : t.sendToBale
                      }
                    >
                      {isSending ? (
                        <Loader2 size={16} className={styles.spinning} />
                      ) : wasSent ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>

                    {/* حذف */}
                    <button
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      onClick={() => onDelete(n)}
                      title={t.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {sendTarget && (
        <div
          className={styles.sendModalOverlay}
          onClick={() => setSendTarget(null)}
          role="presentation"
        >
          <div
            className={styles.sendModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-platform-title"
          >
            <div className={styles.sendModalHeader}>
              <h2 id="send-platform-title">{t.pickPlatforms}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setSendTarget(null)}
                aria-label={t.cancel}
              >
                <X size={16} />
              </button>
            </div>
            <p className={styles.sendModalTitle}>{sendTarget.title}</p>
            <p className={styles.sendModalHint}>{t.pickHint}</p>
            <div className={styles.sendPlatformList}>
              {readyPlatforms.map((p) => (
                <label key={p} className={styles.sendPlatformRow}>
                  <input
                    type="checkbox"
                    checked={!!picked[p]}
                    onChange={() => togglePlatform(p)}
                  />
                  <span>{PLATFORM_LABELS[p]?.[langKey] || p}</span>
                </label>
              ))}
            </div>
            <div className={styles.sendModalActions}>
              <button type="button" className={styles.sendSelectAll} onClick={selectAllPlatforms}>
                {t.selectAll}
              </button>
              <div className={styles.sendModalBtns}>
                <button type="button" className={styles.sendCancelBtn} onClick={() => setSendTarget(null)}>
                  {t.cancel}
                </button>
                <button type="button" className={styles.sendConfirmBtn} onClick={confirmSend}>
                  <Send size={14} />
                  {t.confirmSend}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsList