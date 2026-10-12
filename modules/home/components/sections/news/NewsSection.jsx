// modules/home/components/sections/news/NewsSection.jsx
// ماژول سایت: news_section ⊂ news — از /adminweb فعال/غیرفعال می‌شود

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  Loader2,
  Upload,
  Link2,
  FileText,
  Settings2,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './NewsSection.module.css'
import newsService from '@/services/newsService'
import Config from '@/config/config'

const CKEditorWrapper = dynamic(
  () => import('@/components/newsAdmin/CKEditorWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.editorLoading}>
        در حال بارگذاری ادیتور...
      </div>
    ),
  }
)

const INITIAL_NEWS_FORM = {
  title: '',
  subtitle: '',
  lid: '',
  excerpt: '',
  content: '',
  featured_image: null,
  image_url: '',
  source_name: '',
  source_link: '',
  publish_date: new Date().toISOString().slice(0, 16),
  category: null,
  status: 'published',
  is_active: true,
  is_featured: false,
  is_breaking: false,
  is_exclusive: false,
  language: 'fa',
}

const NewsSection = () => {
  const { language } = useLanguage()
  const { user, getAuthHeaders } = useAuth()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [imageTab, setImageTab] = useState('upload') // upload | url
  const fileInputRef = useRef(null)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [newNewsData, setNewNewsData] = useState(INITIAL_NEWS_FORM)

  const isAdmin = user?.is_staff || user?.is_superuser || false

  const setField = (key, value) => {
    setNewNewsData((prev) => ({ ...prev, [key]: value }))
  }

  const clearImage = () => {
    setNewNewsData((prev) => ({ ...prev, featured_image: null, image_url: '' }))
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const applyImageFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert(language === 'fa' ? 'فقط فایل تصویری مجاز است' : 'Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'fa' ? 'حجم تصویر حداکثر ۵ مگابایت باشد' : 'Max image size is 5MB')
      return
    }
    setNewNewsData((prev) => ({ ...prev, featured_image: file, image_url: '' }))
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) applyImageFile(file)
  }

  // 🔹 تابع ساخت آدرس کامل تصویر
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    const baseUrl = Config.baseUrl || 'http://localhost:8000'
    
    if (imagePath.startsWith('/media/')) {
      return `${baseUrl}${imagePath}`
    }
    
    if (imagePath.startsWith('media/')) {
      return `${baseUrl}/${imagePath}`
    }
    
    return `${baseUrl}/media/${imagePath.replace(/^\/+/, '')}`
  }

  // 🔹 تابع دریافت بهترین تصویر برای خبر
  const getBestImage = (item) => {
    // 1. اولویت اول: تصویر شاخص (featured_image_display)
    if (item.featured_image_display) {
      const fullUrl = getFullImageUrl(item.featured_image_display)
      if (fullUrl) return fullUrl
    }
    
    // 2. اولویت دوم: featured_image
    if (item.featured_image) {
      const fullUrl = getFullImageUrl(item.featured_image)
      if (fullUrl) return fullUrl
    }
    
    // 3. اولویت سوم: featured_image_url
    if (item.featured_image_url) {
      const fullUrl = getFullImageUrl(item.featured_image_url)
      if (fullUrl) return fullUrl
    }
    
    // 4. اولویت چهارم: تصاویر گالری
    if (item.images && item.images.length > 0) {
      for (const img of item.images) {
        const imgUrl = img.image_display || img.image || img.image_url
        if (imgUrl) {
          const fullUrl = getFullImageUrl(imgUrl)
          if (fullUrl) return fullUrl
        }
      }
    }
    
    return null
  }

  // 🔹 دریافت اخبار از بک‌اند
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true)
      const result = await newsService.getNews(1, 50)
      if (result.success) {
        setNews(result.data || [])
      } else {
        console.error('Error fetching news:', result.error)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // Pagination Logic
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const currentNews = news.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (language === 'fa') {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  // 🔹 شروع ویرایش
  const startEditing = (item) => {
    setIsEditing(true)
    setEditData({
      id: item.id,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle || '',
      lid: item.lid || '',
      excerpt: item.excerpt || '',
      content: item.description || item.content || '',
      image_url: item.featured_image_url || '',
      source_name: item.source_name || '',
      source_link: item.source_link || '',
      status: item.status || 'published',
      is_active: item.is_active !== undefined ? item.is_active : true,
      is_featured: item.is_featured || false,
      is_breaking: item.is_breaking || false,
      is_exclusive: item.is_exclusive || false
    })
  }

  // 🔹 ذخیره ویرایش
  const saveEditing = async () => {
    if (!editData) return
    setSubmitting(true)
    
    try {
      setNews(prev => prev.map(item =>
        item.id === editData.id ? { 
          ...item, 
          title: editData.title,
          subtitle: editData.subtitle,
          lid: editData.lid,
          excerpt: editData.excerpt,
          description: editData.content,
          content: editData.content,
          featured_image_url: editData.image_url,
          source_name: editData.source_name,
          source_link: editData.source_link,
          status: editData.status,
          is_active: editData.is_active,
          is_featured: editData.is_featured,
          is_breaking: editData.is_breaking,
          is_exclusive: editData.is_exclusive
        } : item
      ))
      setIsEditing(false)
      setEditData(null)
    } catch (error) {
      console.error('Error saving news:', error)
      alert('خطا در ذخیره خبر')
    } finally {
      setSubmitting(false)
    }
  }

  // 🔹 حذف خبر
  const deleteNews = async (id) => {
    if (!confirm('آیا از حذف این خبر اطمینان دارید؟')) return
    try {
      setNews(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('خطا در حذف خبر')
    }
  }

  // 🔹 افزودن خبر جدید
  const addNews = async () => {
    if (!newNewsData.title.trim()) {
      alert(language === 'fa' ? 'لطفاً عنوان خبر را وارد کنید' : 'Please enter a title')
      return
    }

    setSubmitting(true)

    try {
      const fd = new FormData()
      fd.append('title', newNewsData.title.trim())
      if (newNewsData.subtitle) fd.append('subtitle', newNewsData.subtitle)
      if (newNewsData.lid) fd.append('lid', newNewsData.lid)
      if (newNewsData.excerpt) fd.append('excerpt', newNewsData.excerpt)
      // بک‌اند معمولاً description دارد
      fd.append('description', newNewsData.content || newNewsData.excerpt || newNewsData.title)
      if (newNewsData.content) fd.append('content', newNewsData.content)
      fd.append('status', newNewsData.status || 'published')
      fd.append('is_active', newNewsData.is_active ? 'true' : 'false')
      fd.append('is_featured', newNewsData.is_featured ? 'true' : 'false')
      fd.append('is_breaking', newNewsData.is_breaking ? 'true' : 'false')
      fd.append('is_exclusive', newNewsData.is_exclusive ? 'true' : 'false')
      fd.append('language', newNewsData.language || 'fa')
      if (newNewsData.source_name) fd.append('source_name', newNewsData.source_name)
      if (newNewsData.source_link) fd.append('source_link', newNewsData.source_link)
      if (newNewsData.publish_date) {
        const iso = new Date(newNewsData.publish_date).toISOString()
        fd.append('publish_date', iso)
      }
      if (newNewsData.featured_image instanceof File) {
        fd.append('featured_image', newNewsData.featured_image)
      } else if (newNewsData.image_url?.trim()) {
        fd.append('featured_image_url', newNewsData.image_url.trim())
      }

      const result = await newsService.createNews(fd, getAuthHeaders())
      if (!result.success) {
        alert(result.error || 'خطا در افزودن خبر')
        return
      }

      const created = result.data
      if (created) {
        setNews((prev) => [created, ...prev])
      } else {
        await fetchNews()
      }
      setIsAdding(false)
      resetNewNewsForm()
      setCurrentPage(1)
    } catch (error) {
      console.error('Error adding news:', error)
      alert(language === 'fa' ? 'خطا در افزودن خبر' : 'Error adding news')
    } finally {
      setSubmitting(false)
    }
  }

  const resetNewNewsForm = () => {
    setNewNewsData({
      ...INITIAL_NEWS_FORM,
      publish_date: new Date().toISOString().slice(0, 16),
    })
    setImagePreview(null)
    setImageTab('upload')
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 🔹 دریافت وضعیت نمایشی
  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { label: 'پیش‌نویس', color: '#6c757d' },
      pending: { label: 'در انتظار بررسی', color: '#ffc107' },
      review: { label: 'در حال بررسی', color: '#17a2b8' },
      published: { label: 'منتشر شده', color: '#28a745' },
      scheduled: { label: 'برنامه‌ریزی شده', color: '#007bff' },
      archived: { label: 'بایگانی شده', color: '#6c757d' },
      rejected: { label: 'رد شده', color: '#dc3545' }
    }
    return statusMap[status] || { label: status, color: '#6c757d' }
  }

  if (loading) {
    return (
      <section className={styles.newsSection}>
        <div className="container">
          <div className={styles.loading}>
            <Loader2 size={32} className={styles.spinner} />
            <span>در حال بارگذاری اخبار...</span>
          </div>
        </div>
      </section>
    )
  }

  const title = language === 'fa' ? 'مجله' : 'Magazine'
  const viewAll = language === 'fa' ? 'مشاهده همه' : 'View All'

  return (
    <section className={styles.newsSection}>
      <div className="container">
        <div className={styles.newsHeader}>
          <div className={styles.newsHeaderLeft}>
       
            <h2 className={styles.newsTitle}>{title}</h2>
            <p className={styles.newsSubtitle}>
              {language === 'fa'
                ? 'با آخرین محتوای آموزش ، استخدام و کاریابی با ما همراه باشید'
                : 'Stay updated with the latest news ...'}
            </p>
          </div>
          <div className={styles.newsHeaderRight}>
            {isAdmin && (
              <button
                className={styles.addNewsBtn}
                onClick={() => setIsAdding(true)}
                disabled={isAdding}
              >
                <Plus size={16} />
                {language === 'fa' ? 'خبر جدید' : 'New News'}
              </button>
            )}
            <a href="/news" className={styles.viewAllBtn}>
              {viewAll}
              <ChevronLeft size={16} />
            </a>
          </div>
        </div>

        {/* فرم افزودن خبر جدید */}
        {isAdding && isAdmin && (
          <div className={styles.addNewsForm}>
            <div className={styles.formHead}>
              <div>
                <h4>{language === 'fa' ? 'افزودن خبر جدید' : 'Add New News'}</h4>
                <p className={styles.formHeadHint}>
                  {language === 'fa'
                    ? 'تصویر را بکشید و رها کنید یا از گالری انتخاب کنید'
                    : 'Drag & drop an image or pick from gallery'}
                </p>
              </div>
              <button
                type="button"
                className={styles.formHeadClose}
                onClick={() => { setIsAdding(false); resetNewNewsForm() }}
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.formLayout}>
              {/* ستون تصویر */}
              <div className={styles.mediaCol}>
                <div className={styles.sectionLabel}>
                  <ImageIcon size={14} />
                  {language === 'fa' ? 'تصویر شاخص' : 'Featured image'}
                </div>

                <div className={styles.imageTabs}>
                  <button
                    type="button"
                    className={`${styles.imageTab} ${imageTab === 'upload' ? styles.imageTabActive : ''}`}
                    onClick={() => setImageTab('upload')}
                  >
                    <Upload size={14} />
                    {language === 'fa' ? 'آپلود' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.imageTab} ${imageTab === 'url' ? styles.imageTabActive : ''}`}
                    onClick={() => setImageTab('url')}
                  >
                    <Link2 size={14} />
                    {language === 'fa' ? 'لینک' : 'URL'}
                  </button>
                </div>

                {imageTab === 'upload' ? (
                  imagePreview ? (
                    <div className={styles.imagePreviewBox}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="preview" className={styles.imagePreviewImg} />
                      <div className={styles.imagePreviewActions}>
                        <button
                          type="button"
                          className={styles.imageChangeBtn}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {language === 'fa' ? 'تعویض تصویر' : 'Change'}
                        </button>
                        <button type="button" className={styles.imageRemoveBtn} onClick={clearImage}>
                          <X size={14} />
                          {language === 'fa' ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                      }}
                    >
                      <Upload size={28} />
                      <strong>
                        {language === 'fa' ? 'تصویر را اینجا رها کنید' : 'Drop image here'}
                      </strong>
                      <span>
                        {language === 'fa'
                          ? 'یا برای انتخاب از گالری کلیک کنید · JPG, PNG, WEBP تا ۵MB'
                          : 'or click to browse · JPG, PNG, WEBP up to 5MB'}
                      </span>
                    </div>
                  )
                ) : (
                  <div className={styles.urlImageBox}>
                    <div className={styles.formField}>
                      <label>{language === 'fa' ? 'آدرس تصویر' : 'Image URL'}</label>
                      <input
                        type="url"
                        value={newNewsData.image_url}
                        onChange={(e) => {
                          const url = e.target.value
                          setNewNewsData((prev) => ({ ...prev, featured_image: null, image_url: url }))
                          setImagePreview(url.trim() || null)
                        }}
                        placeholder="https://example.com/image.jpg"
                        dir="ltr"
                      />
                    </div>
                    {imagePreview && (
                      <div className={styles.imagePreviewBox}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="preview"
                          className={styles.imagePreviewImg}
                          onError={() => setImagePreview(null)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={styles.hiddenFile}
                  onChange={(e) => applyImageFile(e.target.files?.[0])}
                />
              </div>

              {/* ستون محتوا */}
              <div className={styles.fieldsCol}>
                <div className={styles.sectionLabel}>
                  <FileText size={14} />
                  {language === 'fa' ? 'محتوا' : 'Content'}
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.formField} ${styles.full}`}>
                    <label>{language === 'fa' ? 'عنوان خبر *' : 'Title *'}</label>
                    <input
                      type="text"
                      value={newNewsData.title}
                      onChange={(e) => setField('title', e.target.value)}
                      placeholder={language === 'fa' ? 'عنوان خبر را وارد کنید' : 'Enter news title'}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>{language === 'fa' ? 'زیر عنوان' : 'Subtitle'}</label>
                    <input
                      type="text"
                      value={newNewsData.subtitle}
                      onChange={(e) => setField('subtitle', e.target.value)}
                      placeholder={language === 'fa' ? 'روتیر' : 'Subtitle'}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>{language === 'fa' ? 'لید' : 'Lid'}</label>
                    <input
                      type="text"
                      value={newNewsData.lid}
                      onChange={(e) => setField('lid', e.target.value)}
                      placeholder={language === 'fa' ? 'تیزر کوتاه' : 'Short teaser'}
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.full}`}>
                    <label>{language === 'fa' ? 'خلاصه خبر' : 'Excerpt'}</label>
                    <textarea
                      value={newNewsData.excerpt}
                      onChange={(e) => setField('excerpt', e.target.value)}
                      placeholder={language === 'fa' ? 'خلاصه کوتاه برای کارت خبر' : 'Short excerpt'}
                      rows={2}
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.full}`}>
                    <label>{language === 'fa' ? 'متن کامل خبر' : 'Full content'}</label>
                    <div className={styles.editorWrap}>
                      <CKEditorWrapper
                        key={isAdding ? 'add-editor' : 'idle'}
                        value={newNewsData.content}
                        onChange={(data) => setField('content', data)}
                        placeholder={
                          language === 'fa'
                            ? 'متن کامل خبر را اینجا بنویسید...'
                            : 'Write the full news content...'
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.sectionLabel}>
                  <Settings2 size={14} />
                  {language === 'fa' ? 'تنظیمات انتشار' : 'Publish settings'}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label>{language === 'fa' ? 'وضعیت' : 'Status'}</label>
                    <select
                      value={newNewsData.status}
                      onChange={(e) => setField('status', e.target.value)}
                    >
                      <option value="draft">پیش‌نویس</option>
                      <option value="pending">در انتظار بررسی</option>
                      <option value="published">منتشر شده</option>
                      <option value="scheduled">برنامه‌ریزی شده</option>
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label>{language === 'fa' ? 'تاریخ انتشار' : 'Publish date'}</label>
                    <input
                      type="datetime-local"
                      value={newNewsData.publish_date}
                      onChange={(e) => setField('publish_date', e.target.value)}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>{language === 'fa' ? 'نام منبع' : 'Source'}</label>
                    <input
                      type="text"
                      value={newNewsData.source_name}
                      onChange={(e) => setField('source_name', e.target.value)}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>{language === 'fa' ? 'لینک منبع' : 'Source link'}</label>
                    <input
                      type="url"
                      value={newNewsData.source_link}
                      onChange={(e) => setField('source_link', e.target.value)}
                      dir="ltr"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className={styles.flagRow}>
                  <label className={`${styles.flagChip} ${newNewsData.is_featured ? styles.flagOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={newNewsData.is_featured}
                      onChange={(e) => setField('is_featured', e.target.checked)}
                    />
                    {language === 'fa' ? 'ویژه' : 'Featured'}
                  </label>
                  <label className={`${styles.flagChip} ${newNewsData.is_breaking ? styles.flagOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={newNewsData.is_breaking}
                      onChange={(e) => setField('is_breaking', e.target.checked)}
                    />
                    {language === 'fa' ? 'فوری' : 'Breaking'}
                  </label>
                  <label className={`${styles.flagChip} ${newNewsData.is_exclusive ? styles.flagOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={newNewsData.is_exclusive}
                      onChange={(e) => setField('is_exclusive', e.target.checked)}
                    />
                    {language === 'fa' ? 'اختصاصی' : 'Exclusive'}
                  </label>
                  <label className={`${styles.flagChip} ${newNewsData.is_active ? styles.flagOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={newNewsData.is_active}
                      onChange={(e) => setField('is_active', e.target.checked)}
                    />
                    {language === 'fa' ? 'فعال' : 'Active'}
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={addNews}
                disabled={submitting || !newNewsData.title.trim()}
              >
                {submitting ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <Save size={16} />
                )}
                {submitting
                  ? (language === 'fa' ? 'در حال ذخیره...' : 'Saving...')
                  : (language === 'fa' ? 'انتشار خبر' : 'Publish')}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => { setIsAdding(false); resetNewNewsForm() }}
                disabled={submitting}
              >
                <X size={16} />
                {language === 'fa' ? 'لغو' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* لیست اخبار */}
        <div className={styles.newsGrid}>
          {currentNews.map((item) => {
            const imageUrl = getBestImage(item)
            // ✅ استفاده از slug به جای id
            const newsSlug = item.slug || item.id
            const statusInfo = getStatusBadge(item.status)
            
            return (
              <a 
                href={`/news/${newsSlug}`} 
                key={item.id} 
                className={styles.newsCardLink}
              >
                <div className={styles.newsCard}>
                  {/* برچسب‌های ویژه */}
                  <div className={styles.newsBadgesTop}>
                    {item.is_featured && (
                      <span className={styles.featuredBadge}> ویژه</span>
                    )}
                    {item.is_breaking && (
                      <span className={styles.breakingBadge}> فوری</span>
                    )}
                    {item.is_exclusive && (
                      <span className={styles.exclusiveBadge}> اختصاصی</span>
                    )}
                    {item.status && (
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                    )}
                  </div>

                  {isAdmin && !isEditing && (
                    <div className={styles.newsActions}>
                      <button
                        className={styles.editNewsBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditing(item)
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className={styles.deleteNewsBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteNews(item.id)
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  
                  {/* فرم ویرایش خبر */}
                  {isEditing && editData?.id === item.id ? (
                    <div className={styles.editNewsForm} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.formField}>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData({...editData, title: e.target.value})}
                          placeholder="عنوان خبر"
                        />
                      </div>
                      <div className={styles.formField}>
                        <input
                          type="text"
                          value={editData.subtitle || ''}
                          onChange={(e) => setEditData({...editData, subtitle: e.target.value})}
                          placeholder="زیر عنوان"
                        />
                      </div>
                      <div className={styles.formField}>
                        <input
                          type="url"
                          value={editData.image_url || ''}
                          onChange={(e) => setEditData({...editData, image_url: e.target.value})}
                          placeholder="لینک تصویر"
                        />
                      </div>
                      <div className={styles.formField}>
                        <textarea
                          value={editData.excerpt || ''}
                          onChange={(e) => setEditData({...editData, excerpt: e.target.value})}
                          placeholder="خلاصه خبر"
                          rows="2"
                        />
                      </div>
                      <div className={`${styles.formField} ${styles.full}`}>
                        <label>{language === 'fa' ? 'متن کامل خبر' : 'Full content'}</label>
                        <div className={`${styles.editorWrap} ${styles.editorCompact}`}>
                          <CKEditorWrapper
                            key={`edit-${editData.id || editData.slug}`}
                            value={editData.content || ''}
                            onChange={(data) => setEditData({ ...editData, content: data })}
                            placeholder={
                              language === 'fa'
                                ? 'متن کامل خبر را اینجا بنویسید...'
                                : 'Write the full news content...'
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.editActions}>
                        <button 
                          className={styles.saveBtn} 
                          onClick={saveEditing}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 size={14} className={styles.spinner} />
                          ) : (
                            <Save size={14} />
                          )}
                          {language === 'fa' ? 'ذخیره' : 'Save'}
                        </button>
                        <button 
                          className={styles.cancelBtn} 
                          onClick={() => {
                            setIsEditing(false)
                            setEditData(null)
                          }}
                        >
                          <X size={14} />
                          {language === 'fa' ? 'لغو' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.newsImageWrapper}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className={styles.newsImage}
                            onError={(e) => {
                              if (item.images && item.images.length > 0) {
                                for (const img of item.images) {
                                  const imgUrl = img.image_display || img.image || img.image_url
                                  if (imgUrl) {
                                    const fullUrl = getFullImageUrl(imgUrl)
                                    if (fullUrl && fullUrl !== e.target.src) {
                                      e.target.src = fullUrl
                                      return
                                    }
                                  }
                                }
                              }
                              e.target.style.display = 'none'
                              e.target.parentElement.querySelector('.no-image-placeholder')?.classList.remove('hidden')
                            }}
                          />
                        ) : (
                          <div className={styles.noImagePlaceholder}>
                            <ImageIcon size={48} />
                            <span>بدون تصویر</span>
                          </div>
                        )}
                        
                        <div className={styles.newsOverlay}></div>
                        
                        <div className={styles.newsOverlayContent}>
                          <h3 className={styles.newsCardTitle}>
                            {item.title}
                          </h3>

                          {item.subtitle && (
                            <p className={styles.newsSubtitleText}>
                              {item.subtitle}
                            </p>
                          )}

                          <div className={styles.newsExcerptWrapper}>
                            <p className={styles.newsExcerpt}>
                              {item.excerpt || ''}
                            </p>
                          </div>

                          <div className={styles.newsBadges}>
                            <span className={styles.badge}>
                              <Calendar size={12} />
                              {formatDate(item.publish_date || item.created_at)}
                            </span>
                            {item.source_name && (
                              <span className={styles.badge}>
                                {item.source_name}
                              </span>
                            )}
                            {item.images && item.images.length > 0 && (
                              <span className={styles.badge}>
                                <ImageIcon size={12} />
                                {item.images.length}
                              </span>
                            )}
                            {item.view_count > 0 && (
                              <span className={styles.badge}>
                                <Eye size={12} />
                                {item.view_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </a>
            )
          })}
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                className={`${styles.pageBtn} ${currentPage === number ? styles.active : ''}`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            ))}

            <button 
              className={styles.pageBtn} 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <div className={styles.newsFooter}>
          <a href="/news" className={styles.newsFooterBtn}>
            {language === 'fa' ? 'مشاهده تمام اخبار' : 'View All News'}
            <ChevronLeft size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}

export default NewsSection