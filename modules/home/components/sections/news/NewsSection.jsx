// components/NewsSection.jsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  Loader2
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './NewsSection.module.css'
import newsService from '@/services/newsService'
import Config from '@/config/config'

const NewsSection = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // State for new news
  const [newNewsData, setNewNewsData] = useState({
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
    language: 'fa'
  })

  const isAdmin = user?.is_staff || user?.is_superuser || false

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
      content: item.content || '',
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
      alert('لطفاً عنوان خبر را وارد کنید')
      return
    }
    
    setSubmitting(true)
    
    try {
      const newItem = {
        id: Date.now(),
        slug: newNewsData.title
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, '')
          .toLowerCase(),
        title: newNewsData.title,
        subtitle: newNewsData.subtitle || '',
        lid: newNewsData.lid || '',
        excerpt: newNewsData.excerpt || '',
        content: newNewsData.content || '',
        featured_image_url: newNewsData.image_url || '',
        featured_image_display: newNewsData.image_url || '',
        source_name: newNewsData.source_name || '',
        source_link: newNewsData.source_link || '',
        publish_date: newNewsData.publish_date || new Date().toISOString(),
        status: newNewsData.status || 'published',
        is_active: newNewsData.is_active,
        is_featured: newNewsData.is_featured,
        is_breaking: newNewsData.is_breaking,
        is_exclusive: newNewsData.is_exclusive,
        images: [],
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setNews(prev => [newItem, ...prev])
      setIsAdding(false)
      resetNewNewsForm()
    } catch (error) {
      console.error('Error adding news:', error)
      alert('خطا در افزودن خبر')
    } finally {
      setSubmitting(false)
    }
  }

  const resetNewNewsForm = () => {
    setNewNewsData({
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
      language: 'fa'
    })
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
            <h4>
              {language === 'fa' ? '✏️ افزودن خبر جدید' : '✏️ Add New News'}
            </h4>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'عنوان خبر (ضروری)' : 'Title (Required)'}</label>
                <input
                  type="text"
                  value={newNewsData.title}
                  onChange={(e) => setNewNewsData({...newNewsData, title: e.target.value})}
                  placeholder={language === 'fa' ? 'عنوان خبر را وارد کنید' : 'Enter news title'}
                  required
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'زیر عنوان (روتیر)' : 'Subtitle'}</label>
                <input
                  type="text"
                  value={newNewsData.subtitle}
                  onChange={(e) => setNewNewsData({...newNewsData, subtitle: e.target.value})}
                  placeholder={language === 'fa' ? 'زیر عنوان خبر' : 'News subtitle'}
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'لید (تیزر کوتاه)' : 'Lid'}</label>
                <input
                  type="text"
                  value={newNewsData.lid}
                  onChange={(e) => setNewNewsData({...newNewsData, lid: e.target.value})}
                  placeholder={language === 'fa' ? 'لید خبر' : 'News lid'}
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'لینک تصویر شاخص' : 'Featured Image URL'}</label>
                <input
                  type="url"
                  value={newNewsData.image_url}
                  onChange={(e) => setNewNewsData({...newNewsData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'خلاصه خبر' : 'Excerpt'}</label>
                <textarea
                  value={newNewsData.excerpt}
                  onChange={(e) => setNewNewsData({...newNewsData, excerpt: e.target.value})}
                  placeholder={language === 'fa' ? 'خلاصه خبر را وارد کنید' : 'Enter news excerpt'}
                  rows="2"
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'متن کامل خبر' : 'Content'}</label>
                <textarea
                  value={newNewsData.content}
                  onChange={(e) => setNewNewsData({...newNewsData, content: e.target.value})}
                  placeholder={language === 'fa' ? 'متن کامل خبر را وارد کنید' : 'Enter full content'}
                  rows="4"
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'وضعیت' : 'Status'}</label>
                <select
                  value={newNewsData.status}
                  onChange={(e) => setNewNewsData({...newNewsData, status: e.target.value})}
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="pending">در انتظار بررسی</option>
                  <option value="review">در حال بررسی</option>
                  <option value="published">منتشر شده</option>
                  <option value="scheduled">برنامه‌ریزی شده</option>
                  <option value="archived">بایگانی شده</option>
                  <option value="rejected">رد شده</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'فعال' : 'Active'}</label>
                <select
                  value={newNewsData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setNewNewsData({...newNewsData, is_active: e.target.value === 'active'})}
                >
                  <option value="active">{language === 'fa' ? 'فعال' : 'Active'}</option>
                  <option value="inactive">{language === 'fa' ? 'غیرفعال' : 'Inactive'}</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'خبر ویژه' : 'Featured'}</label>
                <select
                  value={newNewsData.is_featured ? 'yes' : 'no'}
                  onChange={(e) => setNewNewsData({...newNewsData, is_featured: e.target.value === 'yes'})}
                >
                  <option value="no">{language === 'fa' ? 'خیر' : 'No'}</option>
                  <option value="yes">{language === 'fa' ? 'بله' : 'Yes'}</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'خبر فوری' : 'Breaking'}</label>
                <select
                  value={newNewsData.is_breaking ? 'yes' : 'no'}
                  onChange={(e) => setNewNewsData({...newNewsData, is_breaking: e.target.value === 'yes'})}
                >
                  <option value="no">{language === 'fa' ? 'خیر' : 'No'}</option>
                  <option value="yes">{language === 'fa' ? 'بله' : 'Yes'}</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'اختصاصی' : 'Exclusive'}</label>
                <select
                  value={newNewsData.is_exclusive ? 'yes' : 'no'}
                  onChange={(e) => setNewNewsData({...newNewsData, is_exclusive: e.target.value === 'yes'})}
                >
                  <option value="no">{language === 'fa' ? 'خیر' : 'No'}</option>
                  <option value="yes">{language === 'fa' ? 'بله' : 'Yes'}</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'نام منبع' : 'Source Name'}</label>
                <input
                  type="text"
                  value={newNewsData.source_name}
                  onChange={(e) => setNewNewsData({...newNewsData, source_name: e.target.value})}
                  placeholder={language === 'fa' ? 'نام منبع' : 'Source name'}
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'لینک منبع' : 'Source Link'}</label>
                <input
                  type="url"
                  value={newNewsData.source_link}
                  onChange={(e) => setNewNewsData({...newNewsData, source_link: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'تاریخ انتشار' : 'Publish Date'}</label>
                <input
                  type="datetime-local"
                  value={newNewsData.publish_date}
                  onChange={(e) => setNewNewsData({...newNewsData, publish_date: e.target.value})}
                />
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button 
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
                  : (language === 'fa' ? 'ذخیره' : 'Save')
                }
              </button>
              <button 
                className={styles.cancelBtn} 
                onClick={() => {
                  setIsAdding(false)
                  resetNewNewsForm()
                }}
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
                      <div className={styles.formField}>
                        <textarea
                          value={editData.content || ''}
                          onChange={(e) => setEditData({...editData, content: e.target.value})}
                          placeholder="متن کامل خبر"
                          rows="3"
                        />
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