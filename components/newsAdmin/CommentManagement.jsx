// components/newsAdmin/CommentManagement.jsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import axios from 'axios'
import Config from '@/config/config'
import {
  CheckCircle, XCircle, Trash2, RefreshCw, AlertCircle,
  MessageSquare, User, Clock, ThumbsUp
} from 'lucide-react'
import styles from '@/styles/modules/NewsManagement.module.css'

const CommentManagement = ({ showToast }) => {
  const { getAuthHeaders } = useAuth()
  const { language } = useLanguage()

  const [comments, setComments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending | approved | rejected | all

  const texts = {
    fa: {
      title: 'مدیریت کامنت‌ها',
      pending: 'در انتظار',
      approved: 'تایید شده',
      rejected: 'رد شده',
      all: 'همه',
      loading: 'در حال بارگذاری...',
      empty: 'کامنتی یافت نشد',
      approve: 'تایید',
      reject: 'رد',
      delete: 'حذف',
      approveSuccess: 'کامنت تایید شد',
      rejectSuccess: 'کامنت رد شد',
      deleteSuccess: 'کامنت حذف شد',
      confirmDelete: 'آیا از حذف این کامنت مطمئن هستید؟',
      guest: 'مهمان',
      noComment: 'کامنت',
    },
    en: {
      title: 'Comments Management',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      all: 'All',
      loading: 'Loading...',
      empty: 'No comments found',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      approveSuccess: 'Comment approved',
      rejectSuccess: 'Comment rejected',
      deleteSuccess: 'Comment deleted',
      confirmDelete: 'Are you sure you want to delete this comment?',
      guest: 'Guest',
      noComment: 'Comment',
    }
  }

  const t = texts[language] || texts.fa

  // ============================================
  // ✅ دریافت کامنت‌ها
  // ============================================
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      let url
      if (filter === 'pending') {
        url = Config.endpoints.news.pendingComments()
      } else {
        const params = filter !== 'all' ? { status: filter } : {}
        url = Config.endpoints.news.comments('', params)
      }
      const res = await axios.get(url, { headers: getAuthHeaders() })
      const data = res.data?.data || res.data?.results || res.data || []
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [filter, getAuthHeaders])

  // ============================================
  // ✅ دریافت آمار
  // ============================================
  const fetchStats = useCallback(async () => {
    try {
      const url = Config.endpoints.news.commentStats()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setStats(res.data?.data || res.data)
    } catch (err) {
      console.error('Error fetching comment stats:', err)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    fetchComments()
    fetchStats()
  }, [fetchComments, fetchStats])

  // ============================================
  // ✅ تایید
  // ============================================
  const handleApprove = async (comment) => {
    try {
      const url = Config.endpoints.news.approveComment(comment.id)
      await axios.post(url, {}, { headers: getAuthHeaders() })
      showToast(t.approveSuccess)
      await fetchComments()
      await fetchStats()
    } catch (err) {
      showToast(err.response?.data?.error || 'خطا', 'error')
    }
  }

  // ============================================
  // ✅ رد
  // ============================================
  const handleReject = async (comment) => {
    try {
      const url = Config.endpoints.news.rejectComment(comment.id)
      await axios.post(url, {}, { headers: getAuthHeaders() })
      showToast(t.rejectSuccess)
      await fetchComments()
      await fetchStats()
    } catch (err) {
      showToast(err.response?.data?.error || 'خطا', 'error')
    }
  }

  // ============================================
  // ✅ حذف
  // ============================================
  const handleDelete = async (comment) => {
    if (!window.confirm(t.confirmDelete)) return
    try {
      const url = Config.endpoints.news.deleteComment(comment.id)
      await axios.delete(url, { headers: getAuthHeaders() })
      showToast(t.deleteSuccess)
      await fetchComments()
      await fetchStats()
    } catch (err) {
      showToast(err.response?.data?.error || 'خطا', 'error')
    }
  }


  // ============================================
// ✅ ارسال به بله
// ============================================
const handleSendToBale = async (item) => {
  try {
    const url = Config.endpoints.news.sendToBale(item.slug)
    const res = await axios.post(url, {}, { headers: getAuthHeaders() })

    showToast('✅ خبر با موفقیت به کانال بله ارسال شد')
    await fetchNews()
    await fetchStats()
    return { success: true, data: res.data }
  } catch (err) {
    console.error('❌ Error sending to Bale:', err)
    const msg = err.response?.data?.message || 'خطا در ارسال به بله'
    showToast(msg, 'error')
    throw err
  }
}

  return (
    <div>
      {/* آمار کامنت‌ها */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#e3f2fd', color: '#1976d2' }}>
              <MessageSquare size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total ?? 0}</span>
              <span className={styles.statLabel}>کل</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fff3e0', color: '#e65100' }}>
              <Clock size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.pending ?? 0}</span>
              <span className={styles.statLabel}>{t.pending}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#166534' }}>
              <CheckCircle size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.approved ?? 0}</span>
              <span className={styles.statLabel}>{t.approved}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#991b1b' }}>
              <XCircle size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.rejected ?? 0}</span>
              <span className={styles.statLabel}>{t.rejected}</span>
            </div>
          </div>
        </div>
      )}

      {/* فیلتر */}
      <div className={styles.tabs} style={{ marginBottom: 16 }}>
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            className={`${styles.tab} ${filter === f ? styles.tabActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {t[f]}
          </button>
        ))}
      </div>

      {/* لیست کامنت‌ها */}
      {loading ? (
        <div className={styles.loadingBox}>
          <RefreshCw size={28} className={styles.spinning} />
          <p>{t.loading}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className={styles.emptyBox}>
          <AlertCircle size={28} />
          <p>{t.empty}</p>
        </div>
      ) : (
        <div className={styles.commentsList}>
          {comments.map((c) => (
            <div key={c.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div className={styles.commentUser}>
                  <div className={styles.commentAvatar}>
                    <User size={16} />
                  </div>
                  <div>
                    <div className={styles.commentName}>
                      {c.display_name || c.guest_name || t.guest}
                    </div>
                    <div className={styles.commentTime}>
                      <Clock size={11} /> {c.time_ago || c.created_at}
                    </div>
                  </div>
                </div>
                <div className={styles.commentActions}>
                  {c.status !== 'approved' && (
                    <button
                      className={`${styles.iconBtn} ${styles.activateBtn}`}
                      onClick={() => handleApprove(c)}
                      title={t.approve}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {c.status !== 'rejected' && (
                    <button
                      className={`${styles.iconBtn} ${styles.deactivateBtn}`}
                      onClick={() => handleReject(c)}
                      title={t.reject}
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  <button
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(c)}
                    title={t.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className={styles.commentText}>{c.text}</div>
              <div className={styles.commentFooter}>
                <span className={styles.commentNews}>
                  {c.news_title || `خبر #${c.news}`}
                </span>
                <span className={styles.commentLikes}>
                  <ThumbsUp size={12} /> {c.likes ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentManagement