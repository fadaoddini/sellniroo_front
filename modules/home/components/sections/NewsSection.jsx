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
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useAuth } from '../../../../contexts/AuthContext'
import styles from '../../styles/NewsSection.module.css'
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
    excerpt: '',
    content: '',
    featured_image: null,
    image_url: '',
    source_name: 'نبض ساختمان',
    source_link: 'https://nabzsakhteman.com',
    publish_date: new Date().toISOString(),
    category: null,
    is_active: true
  })

  const isAdmin = user?.is_staff || user?.is_superuser || false

  // 🔹 تابع ساخت آدرس کامل تصویر
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    if (imagePath.startsWith('/media/')) {
      return `${Config.baseUrl}${imagePath}`
    }
    
    if (imagePath.startsWith('media/')) {
      return `${Config.baseUrl}/${imagePath}`
    }
    
    return `${Config.baseUrl}/media/${imagePath.replace(/^\/+/, '')}`
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
      // تلاش برای پیدا کردن یک تصویر معتبر از گالری
      for (const img of item.images) {
        const imgUrl = img.image_display || img.image || img.image_url
        if (imgUrl) {
          const fullUrl = getFullImageUrl(imgUrl)
          if (fullUrl) return fullUrl
        }
      }
    }
    
    // اگر هیچ تصویری وجود نداشت، null برگردان
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
      title: item.title,
      excerpt: item.excerpt || '',
      content: item.content || '',
      image_url: item.featured_image_url || '',
      category: item.category || null,
      is_active: item.is_active !== undefined ? item.is_active : true
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
          excerpt: editData.excerpt,
          content: editData.content,
          featured_image_url: editData.image_url,
          category: editData.category,
          is_active: editData.is_active
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
        title: newNewsData.title,
        excerpt: newNewsData.excerpt,
        content: newNewsData.content,
        featured_image_url: newNewsData.image_url || '',
        featured_image_display: newNewsData.image_url || '',
        source_name: newNewsData.source_name,
        source_link: newNewsData.source_link,
        publish_date: newNewsData.publish_date,
        category: newNewsData.category,
        is_active: newNewsData.is_active,
        images: [],
        views: 0,
        created_at: new Date().toISOString()
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
      excerpt: '',
      content: '',
      featured_image: null,
      image_url: '',
      source_name: 'نبض ساختمان',
      source_link: 'https://nabzsakhteman.com',
      publish_date: new Date().toISOString(),
      category: null,
      is_active: true
    })
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

  const title = language === 'fa' ? 'اخبار و رویدادها' : 'News & Events'
  const viewAll = language === 'fa' ? 'مشاهده همه' : 'View All'

  return (
    <section className={styles.newsSection}>
      <div className="container">
        <div className={styles.newsHeader}>
          <div className={styles.newsHeaderLeft}>
            <span className={styles.newsBadge}>
              {language === 'fa' ? '📰 آخرین اخبار' : '📰 Latest News'}
            </span>
            <h2 className={styles.newsTitle}>{title}</h2>
            <p className={styles.newsSubtitle}>
              {language === 'fa'
                ? 'با آخرین اخبار صنعت راه و ساختمان با ما همراه باشید'
                : 'Stay updated with the latest news in the road and building industry'}
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
                  value={newNewsData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setNewNewsData({...newNewsData, is_active: e.target.value === 'active'})}
                >
                  <option value="active">{language === 'fa' ? 'فعال' : 'Active'}</option>
                  <option value="inactive">{language === 'fa' ? 'غیرفعال' : 'Inactive'}</option>
                </select>
              </div>
              
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'نام منبع' : 'Source Name'}</label>
                <input
                  type="text"
                  value={newNewsData.source_name}
                  onChange={(e) => setNewNewsData({...newNewsData, source_name: e.target.value})}
                  placeholder="نبض ساختمان"
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
            
            return (
              <a 
                href={`/news/${item.id}`} 
                key={item.id} 
                className={styles.newsCardLink}
              >
                <div className={styles.newsCard}>
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
                              // اگر تصویر بارگذاری نشد، سعی کن از گالری تصویر دیگری استفاده کن
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
                              // اگر هیچ تصویری کار نکرد، یک placeholder نشان بده
                              e.target.style.display = 'none'
                              e.target.parentElement.querySelector('.no-image-placeholder')?.classList.remove('hidden')
                            }}
                          />
                        ) : (
                          <div className={`${styles.noImagePlaceholder} no-image-placeholder`}>
                            <ImageIcon size={48} />
                            <span>بدون تصویر</span>
                          </div>
                        )}
                        
                        {/* Placeholder برای زمانی که تصویر وجود ندارد */}
                        {!imageUrl && (
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