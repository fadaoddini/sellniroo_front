// components/newsAdmin/NewsManagement.jsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import axios from 'axios'
import Config from '@/config/config'
import NewsStats from './NewsStats'
import NewsSearch from './NewsSearch'
import NewsList from './NewsList'
import NewsForm from './NewsForm'
import CommentManagement from './CommentManagement'
import styles from '@/styles/modules/NewsManagement.module.css'
import {
  Plus, RefreshCw, Newspaper, AlertCircle, CheckCircle, X,
  FileText, MessageSquare
} from 'lucide-react'

const NewsManagement = () => {
  const { getAuthHeaders, user } = useAuth()
  const { language, dir } = useLanguage()

  const [activeTab, setActiveTab] = useState('news')

  const [news, setNews] = useState([])
  const [stats, setStats] = useState(null)
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterFeatured, setFilterFeatured] = useState('all')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [toast, setToast] = useState(null)

  const texts = {
    fa: {
      title: 'مدیریت اخبار',
      subtitle: 'افزودن، ویرایش و مدیریت اخبار و کامنت‌ها',
      newsTab: 'اخبار',
      commentsTab: 'کامنت‌ها',
      addNews: 'افزودن خبر',
      refresh: 'بروزرسانی',
      loading: 'در حال بارگذاری...',
      loadingDetail: 'در حال بارگذاری جزئیات خبر...',
      error: 'خطا در دریافت اطلاعات',
      successCreate: 'خبر با موفقیت ایجاد شد',
      successUpdate: 'خبر با موفقیت بروزرسانی شد',
      successDelete: 'خبر با موفقیت حذف شد',
      successBale: '✅ خبر با موفقیت به کانال بله ارسال شد',
      errorBale: 'خطا در ارسال به بله',
      confirmDelete: 'آیا از حذف این خبر مطمئن هستید؟',
      noAccess: 'شما دسترسی به این بخش ندارید',
      detailError: 'خطا در بارگذاری جزئیات خبر',
    },
    en: {
      title: 'News Management',
      subtitle: 'Add, edit and manage news & comments',
      newsTab: 'News',
      commentsTab: 'Comments',
      addNews: 'Add News',
      refresh: 'Refresh',
      loading: 'Loading...',
      loadingDetail: 'Loading news details...',
      error: 'Error loading data',
      successCreate: 'News created successfully',
      successUpdate: 'News updated successfully',
      successDelete: 'News deleted successfully',
      successBale: '✅ News sent to Bale channel successfully',
      errorBale: 'Error sending to Bale',
      confirmDelete: 'Are you sure you want to delete this news?',
      noAccess: 'You do not have access to this section',
      detailError: 'Error loading news details',
    }
  }

  const t = texts[language] || texts.fa

  // ============================================
  // ✅ دریافت لیست اخبار
  // ============================================
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = Config.endpoints.news.list({ limit: 100 })
      const res = await axios.get(url, { headers: getAuthHeaders() })

      let data = []
      if (Array.isArray(res.data)) data = res.data
      else if (Array.isArray(res.data?.results)) data = res.data.results
      else if (Array.isArray(res.data?.data)) data = res.data.data
      setNews(data)
    } catch (err) {
      console.error('❌ Error fetching news:', err)
      setError(err.response?.data?.message || t.error)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, t.error])

  // ============================================
  // ✅ دریافت آمار
  // ============================================
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const url = Config.endpoints.news.stats()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setStats(res.data?.data || res.data)
    } catch (err) {
      console.error('❌ Error fetching stats:', err)
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [getAuthHeaders])

  // ============================================
  // ✅ دریافت دسته‌بندی‌ها
  // ============================================
  const fetchCategories = useCallback(async () => {
    try {
      const url = Config.endpoints.news.categories()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setCategories(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    fetchNews()
    fetchStats()
    fetchCategories()
  }, [fetchNews, fetchStats, fetchCategories])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ============================================
  // ✅ مهم: باز کردن فرم ویرایش با fetch detail
  // ============================================
  const handleEdit = async (item) => {
    try {
      setDetailLoading(true)
      console.log('📄 Fetching full news detail for:', item.slug)

      const url = Config.endpoints.news.detail(item.slug)
      const res = await axios.get(url, { headers: getAuthHeaders() })

      const fullNews = res.data?.data || res.data

      console.log('📄 Full news received:', {
        slug: fullNews.slug,
        title: fullNews.title,
        hasDescription: !!fullNews.description,
        descriptionLength: fullNews.description?.length || 0,
        descriptionPreview: fullNews.description?.substring(0, 150),
      })

      if (!fullNews?.description) {
        console.warn('⚠️ description در پاسخ detail وجود ندارد!')
      }

      setEditingItem(fullNews)
      setIsFormOpen(true)
    } catch (err) {
      console.error('❌ Error loading news detail:', err)
      showToast(t.detailError, 'error')
      setEditingItem(item)
      setIsFormOpen(true)
    } finally {
      setDetailLoading(false)
    }
  }

  // ============================================
  // ✅ ایجاد / ویرایش
  // ============================================
  const handleFormSubmit = async (formData, slug = null) => {
    try {
      const url = slug
        ? Config.endpoints.news.update(slug)
        : Config.endpoints.news.create()

      console.log(`📤 ${slug ? 'Updating' : 'Creating'} news:`, url)

      const res = await axios({
        method: slug ? 'patch' : 'post',
        url,
        data: formData,
        headers: getAuthHeaders(),
      })

      showToast(slug ? t.successUpdate : t.successCreate)
      setIsFormOpen(false)
      setEditingItem(null)
      await fetchNews()
      await fetchStats()
      return { success: true, data: res.data }
    } catch (err) {
      console.error('❌ Submit error:', err)
      let msg = 'خطا در ذخیره اطلاعات'
      const data = err.response?.data
      if (typeof data === 'string') msg = data
      else if (data?.message) msg = data.message
      else if (data?.detail) msg = data.detail
      else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstErr = data[firstKey]
        if (Array.isArray(firstErr)) msg = `${firstKey}: ${firstErr[0]}`
        else if (typeof firstErr === 'string') msg = `${firstKey}: ${firstErr}`
      }
      showToast(msg, 'error')
      throw err
    }
  }

  // ============================================
  // ✅ حذف
  // ============================================
  const handleDelete = async (item) => {
    if (!window.confirm(t.confirmDelete)) return
    try {
      const url = Config.endpoints.news.delete(item.slug)
      await axios.delete(url, { headers: getAuthHeaders() })
      showToast(t.successDelete)
      await fetchNews()
      await fetchStats()
    } catch (err) {
      console.error('Delete error:', err)
      showToast(err.response?.data?.message || 'خطا در حذف', 'error')
    }
  }


  // ============================================
// ✅ ارسال به همه پلتفرم‌ها (بله + روبیکا)
// ============================================
const handleSendToPlatforms = async (item) => {
  try {
    const url = Config.endpoints.news.sendToPlatforms(item.slug)
    console.log('📤 Sending to platforms:', url)

    const res = await axios.post(url, {
      bale: true,
      rubika: true,
    }, { headers: getAuthHeaders() })

    console.log('✅ Sent:', res.data)

    // ✅ نمایش پیام موفقیت/خطا
    const data = res.data?.data || {}
    const baleStatus = data.bale?.success ? '✅ بله' : '❌ بله'
    const rubikaStatus = data.rubika?.success ? '✅ روبیکا' : '❌ روبیکا'

    if (data.bale?.success || data.rubika?.success) {
      showToast(`ارسال شد → ${baleStatus} | ${rubikaStatus}`)
    } else {
      showToast('خطا در ارسال به همه پلتفرم‌ها', 'error')
    }

    await fetchNews()
    await fetchStats()
    return { success: true, data: res.data }
  } catch (err) {
    console.error('❌ Error sending:', err)
    const msg = err.response?.data?.message || 'خطا در ارسال'
    showToast(msg, 'error')
    throw err
  }
}

  // ============================================
  // ✅ ارسال به بله
  // ============================================
  const handleSendToBale = async (item) => {
    try {
      const url = Config.endpoints.news.sendToBale(item.slug)
      console.log('📤 Sending to Bale:', url)

      const res = await axios.post(url, {}, { headers: getAuthHeaders() })

      console.log('✅ Sent to Bale:', res.data)

      showToast(t.successBale)
      await fetchNews()
      await fetchStats()
      return { success: true, data: res.data }
    } catch (err) {
      console.error('❌ Error sending to Bale:', err)
      const msg = err.response?.data?.message || t.errorBale
      showToast(msg, 'error')
      throw err
    }
  }

  // ============================================
  // ✅ فیلتر
  // ============================================
  const filteredNews = news.filter((n) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const match =
        (n.title || '').toLowerCase().includes(q) ||
        (n.subtitle || '').toLowerCase().includes(q) ||
        (n.excerpt || '').toLowerCase().includes(q)
      if (!match) return false
    }
    if (filterStatus !== 'all' && n.status !== filterStatus) return false
    if (filterCategory !== 'all' && n.category?.slug !== filterCategory) return false
    if (filterFeatured === 'featured' && !n.is_featured) return false
    if (filterFeatured === 'breaking' && !n.is_breaking) return false
    return true
  })

  const canManage = user?.is_staff || user?.is_superuser

  if (!canManage && !loading) {
    return (
      <div className={styles.container} dir={dir}>
        <div className={styles.noAccessBox}>
          <AlertCircle size={48} className={styles.noAccessIcon} />
          <h3>{t.noAccess}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container} dir={dir}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className={styles.toastClose}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Newspaper size={28} />
          </div>
          <div>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={() => { fetchNews(); fetchStats(); fetchCategories(); }}
            disabled={loading || statsLoading}
          >
            <RefreshCw size={18} className={(loading || statsLoading) ? styles.spinning : ''} />
            {t.refresh}
          </button>
          {activeTab === 'news' && (
            <button
              className={styles.addBtn}
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            >
              <Plus size={18} />
              {t.addNews}
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'news' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('news')}
        >
          <FileText size={16} />
          {t.newsTab}
          <span className={styles.tabCount}>{news.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'comments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={16} />
          {t.commentsTab}
        </button>
      </div>

      {activeTab === 'news' && (
        <>
          <NewsStats stats={stats} loading={statsLoading} />

          <NewsSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterFeatured={filterFeatured}
            setFilterFeatured={setFilterFeatured}
            categories={categories}
          />

          <NewsList
            news={filteredNews}
            loading={loading || detailLoading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSendToBale={handleSendToPlatforms}  // ✅ حالا هر دو رو می‌فرسته
            onRefresh={fetchNews}
          />
        </>
      )}

      {activeTab === 'comments' && (
        <CommentManagement showToast={showToast} />
      )}

      {isFormOpen && (
        <NewsForm
          key={editingItem?.id || editingItem?.slug || 'new'}
          news={editingItem}
          categories={categories}
          onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}

export default NewsManagement