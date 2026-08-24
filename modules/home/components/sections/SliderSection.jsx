// modules/home/components/section/SliderSection.jsx

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Image as ImageIcon,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useAuth } from '../../../../contexts/AuthContext'
import galleryService from '@/services/galleryService'
import styles from '../../styles/SliderSection.module.css'

const SliderSection = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [scales, setScales] = useState({})
  const gridRef = useRef(null)

  const isAdmin = user?.is_staff || user?.is_superuser || false

  // State for new slide
  const [newSlideData, setNewSlideData] = useState({
    title_fa: '',
    title_en: '',
    subtitle_fa: '',
    subtitle_en: '',
    description_fa: '',
    description_en: '',
    image: null,
    link: '',
    link_text_fa: '',
    link_text_en: '',
    is_featured: false,
    order: 0,
  })

  // ============================================
  // تولید اسکیل‌های تصادفی برای شش‌ضلعی‌ها
  // ============================================
  const generateRandomScales = useCallback((items) => {
    const newScales = {}
    items.forEach(item => {
      const scale = 0.90 + Math.random() * 0.06
      newScales[item.id] = scale
    })
    return newScales
  }, [])

  // ============================================
  // بارگذاری داده‌ها از سرور
  // ============================================
  const loadSlides = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await galleryService.getSlides()
      console.log('Slides loaded:', data)
      
      setSlides(data)
      setScales(generateRandomScales(data))
    } catch (err) {
      console.error('Error loading slides:', err)
      setError(err.error || 'خطا در بارگذاری اسلایدها')
    } finally {
      setLoading(false)
    }
  }, [generateRandomScales])

  useEffect(() => {
    loadSlides()
  }, [loadSlides])

  // ============================================
  // توابع مدیریت اسلاید
  // ============================================
  

const handleAddSlide = async () => {
  // اعتبارسنجی
  if (!newSlideData.title_fa || !newSlideData.title_fa.trim()) {
    alert('عنوان فارسی الزامی است')
    return
  }
  if (!newSlideData.image) {
    alert('تصویر الزامی است')
    return
  }

  try {
    setSubmitting(true)
    
    // ایجاد FormData
    const formData = new FormData()
    
    // فیلدهای متنی - فقط فیلدهای پر شده را اضافه کن
    formData.append('title_fa', newSlideData.title_fa.trim())
    
    if (newSlideData.title_en?.trim()) {
      formData.append('title_en', newSlideData.title_en.trim())
    }
    if (newSlideData.subtitle_fa?.trim()) {
      formData.append('subtitle_fa', newSlideData.subtitle_fa.trim())
    }
    if (newSlideData.subtitle_en?.trim()) {
      formData.append('subtitle_en', newSlideData.subtitle_en.trim())
    }
    if (newSlideData.description_fa?.trim()) {
      formData.append('description_fa', newSlideData.description_fa.trim())
    }
    if (newSlideData.description_en?.trim()) {
      formData.append('description_en', newSlideData.description_en.trim())
    }
    if (newSlideData.link?.trim()) {
      formData.append('link', newSlideData.link.trim())
    }
    if (newSlideData.link_text_fa?.trim()) {
      formData.append('link_text_fa', newSlideData.link_text_fa.trim())
    }
    if (newSlideData.link_text_en?.trim()) {
      formData.append('link_text_en', newSlideData.link_text_en.trim())
    }
    
    // boolean و number
    formData.append('is_featured', newSlideData.is_featured ? 'true' : 'false')
    formData.append('order', String(newSlideData.order || 0))
    
    // تصویر
    if (newSlideData.image) {
      formData.append('image', newSlideData.image)
    }
    
    // لاگ برای دیباگ
    console.log('FormData entries:')
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]))
    }
    
    const result = await galleryService.createSlide(formData)
    console.log('Slide created:', result)
    
    await loadSlides()
    
    // Reset form
    setNewSlideData({
      title_fa: '',
      title_en: '',
      subtitle_fa: '',
      subtitle_en: '',
      description_fa: '',
      description_en: '',
      image: null,
      link: '',
      link_text_fa: '',
      link_text_en: '',
      is_featured: false,
      order: 0,
    })
    setIsAdding(false)
    
  } catch (err) {
    console.error('Error creating slide:', err)
    // نمایش خطاهای دقیق
    if (typeof err === 'object') {
      const errorMessages = Object.entries(err)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n')
      alert(`خطا در ایجاد اسلاید:\n${errorMessages}`)
    } else {
      alert(err.error || 'خطا در ایجاد اسلاید')
    }
  } finally {
    setSubmitting(false)
  }
}


const handleUpdateSlide = async () => {
  if (!editData) return
  
  // اعتبارسنجی
  if (!editData.title_fa || !editData.title_fa.trim()) {
    alert('عنوان فارسی الزامی است')
    return
  }

  try {
    setSubmitting(true)
    
    const formData = new FormData()
    
    // فیلدهای متنی
    formData.append('title_fa', editData.title_fa.trim())
    
    if (editData.title_en?.trim()) {
      formData.append('title_en', editData.title_en.trim())
    }
    if (editData.subtitle_fa?.trim()) {
      formData.append('subtitle_fa', editData.subtitle_fa.trim())
    }
    if (editData.subtitle_en?.trim()) {
      formData.append('subtitle_en', editData.subtitle_en.trim())
    }
    if (editData.description_fa?.trim()) {
      formData.append('description_fa', editData.description_fa.trim())
    }
    if (editData.description_en?.trim()) {
      formData.append('description_en', editData.description_en.trim())
    }
    if (editData.link?.trim()) {
      formData.append('link', editData.link.trim())
    }
    if (editData.link_text_fa?.trim()) {
      formData.append('link_text_fa', editData.link_text_fa.trim())
    }
    if (editData.link_text_en?.trim()) {
      formData.append('link_text_en', editData.link_text_en.trim())
    }
    
    formData.append('is_featured', editData.is_featured ? 'true' : 'false')
    formData.append('order', String(editData.order || 0))
    
    // تصویر (اگر تغییر کرده باشد)
    if (editData.image instanceof File) {
      formData.append('image', editData.image)
    }
    
    console.log('Update FormData entries:')
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]))
    }
    
    const result = await galleryService.updateSlide(editData.id, formData)
    console.log('Slide updated:', result)
    
    await loadSlides()
    
    setIsEditing(false)
    setEditData(null)
    
  } catch (err) {
    console.error('Error updating slide:', err)
    if (typeof err === 'object') {
      const errorMessages = Object.entries(err)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n')
      alert(`خطا در بروزرسانی اسلاید:\n${errorMessages}`)
    } else {
      alert(err.error || 'خطا در بروزرسانی اسلاید')
    }
  } finally {
    setSubmitting(false)
  }
}

  const handleDeleteSlide = async (id) => {
    if (!confirm('آیا از حذف این اسلاید اطمینان دارید؟')) return
    
    try {
      setSubmitting(true)
      await galleryService.deleteSlide(id)
      await loadSlides()
    } catch (err) {
      console.error('Error deleting slide:', err)
      alert(err.error || 'خطا در حذف اسلاید')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeSlide = async (id) => {
    try {
      await galleryService.likeSlide(id)
      await loadSlides()
    } catch (err) {
      console.error('Error liking slide:', err)
    }
  }

  // ============================================
  // توابع مودال
  // ============================================
  
  const openModal = (slide) => {
    setSelectedSlide(slide)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedSlide(null)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'auto'
  }

  const nextImage = () => {
    if (selectedSlide && selectedSlide.gallery_images) {
      setCurrentImageIndex((prev) => 
        prev < selectedSlide.gallery_images.length - 1 ? prev + 1 : 0
      )
    }
  }

  const prevImage = () => {
    if (selectedSlide && selectedSlide.gallery_images) {
      setCurrentImageIndex((prev) => 
        prev > 0 ? prev - 1 : selectedSlide.gallery_images.length - 1
      )
    }
  }

  // کلیدهای کیبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedSlide) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSlide, currentImageIndex])

  // ============================================
  // شروع ویرایش
  // ============================================
  const startEditing = (item) => {
    setIsEditing(true)
    setEditData({
      id: item.id,
      title_fa: item.title_fa || '',
      title_en: item.title_en || '',
      subtitle_fa: item.subtitle_fa || '',
      subtitle_en: item.subtitle_en || '',
      description_fa: item.description_fa || '',
      description_en: item.description_en || '',
      image: item.image, // نگهداری URL قبلی
      link: item.link || '',
      link_text_fa: item.link_text_fa || '',
      link_text_en: item.link_text_en || '',
      is_featured: item.is_featured || false,
      order: item.order || 0,
    })
  }

  // ============================================
  // دریافت تنظیمات ردیف‌ها (همانند نسخه قبلی)
  // ============================================
  const getRowConfig = () => {
    const rows = [
      { start: 0, count: 4, indent: 'row1' },
      { start: 4, count: 3, indent: 'row2' },
      { start: 7, count: 5, indent: 'row3' },
    ]
    return rows
  }

  // ============================================
  // رندر یک آیتم شش‌ضلعی
  // ============================================
  const renderHexItem = (item, rowIndex, itemIndex) => {
    const scale = scales[item.id] || 0.95
    const title = language === 'fa' ? item.title_fa : (item.title_en || item.title_fa)
    const subtitle = language === 'fa' ? item.subtitle_fa : (item.subtitle_en || item.subtitle_fa)
    const imageUrl = item.image_url || item.image

    return (
      <div 
        key={item.id}
        className={`${styles.hex} ${styles[`row${rowIndex + 1}`]}`}
        style={{ transform: `scale(${scale})` }}
        tabIndex="0"
        role="button"
        onClick={() => openModal(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openModal(item)
          }
        }}
      >
        <div className={styles.hexShape}>
          <img 
            src={imageUrl} 
            alt={title}
            loading="lazy"
          />
          
          {isAdmin && !isEditing && (
            <div className={styles.slideActions}>
              <button
                className={styles.editSlideBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  startEditing(item)
                }}
                disabled={submitting}
                title="ویرایش"
              >
                <Edit size={12} />
              </button>
              <button
                className={styles.deleteSlideBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSlide(item.id)
                }}
                disabled={submitting}
                title="حذف"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}

          {isEditing && editData?.id === item.id ? (
            <div className={styles.editSlideForm} onClick={(e) => e.stopPropagation()}>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.title_fa}
                  onChange={(e) => setEditData({...editData, title_fa: e.target.value})}
                  placeholder="عنوان فارسی *"
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.title_en}
                  onChange={(e) => setEditData({...editData, title_en: e.target.value})}
                  placeholder="عنوان انگلیسی"
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.subtitle_fa}
                  onChange={(e) => setEditData({...editData, subtitle_fa: e.target.value})}
                  placeholder="زیرنویس فارسی"
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.subtitle_en}
                  onChange={(e) => setEditData({...editData, subtitle_en: e.target.value})}
                  placeholder="زیرنویس انگلیسی"
                />
              </div>
              <div className={styles.formField}>
                <textarea
                  value={editData.description_fa}
                  onChange={(e) => setEditData({...editData, description_fa: e.target.value})}
                  placeholder="توضیحات فارسی"
                  rows={2}
                />
              </div>
              <div className={styles.formField}>
                <textarea
                  value={editData.description_en}
                  onChange={(e) => setEditData({...editData, description_en: e.target.value})}
                  placeholder="توضیحات انگلیسی"
                  rows={2}
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.link}
                  onChange={(e) => setEditData({...editData, link: e.target.value})}
                  placeholder="لینک"
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.link_text_fa}
                  onChange={(e) => setEditData({...editData, link_text_fa: e.target.value})}
                  placeholder="متن لینک فارسی"
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  value={editData.link_text_en}
                  onChange={(e) => setEditData({...editData, link_text_en: e.target.value})}
                  placeholder="متن لینک انگلیسی"
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditData({...editData, image: e.target.files[0]})}
                />
                <small>تصویر جدید (اختیاری)</small>
              </div>
              <div className={styles.formField}>
                <label>
                  <input
                    type="checkbox"
                    checked={editData.is_featured}
                    onChange={(e) => setEditData({...editData, is_featured: e.target.checked})}
                  />
                  ویژه
                </label>
              </div>
              <div className={styles.editActions}>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleUpdateSlide}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 size={12} className={styles.spinner} /> : <Save size={12} />}
                  ذخیره
                </button>
                <button 
                  className={styles.cancelBtn} 
                  onClick={() => {
                    setIsEditing(false)
                    setEditData(null)
                  }}
                  disabled={submitting}
                >
                  <X size={12} />
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.hexCaption}>
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
              <div className={styles.hexViews}>
                <Eye size={10} />
                <span>{item.views}</span>
              </div>
              {item.is_featured && (
                <div className={styles.featuredBadge}>★</div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // رندر مودال
  // ============================================
  const renderModal = () => {
    if (!selectedSlide) return null

    const title = language === 'fa' ? selectedSlide.title_fa : (selectedSlide.title_en || selectedSlide.title_fa)
    const subtitle = language === 'fa' ? selectedSlide.subtitle_fa : (selectedSlide.subtitle_en || selectedSlide.subtitle_fa)
    const description = language === 'fa' ? selectedSlide.description_fa : (selectedSlide.description_en || selectedSlide.description_fa)
    
    const galleryImages = selectedSlide.gallery_images || []
    const allImages = galleryImages.length > 0 
      ? galleryImages.map(img => img.image_url || img.image)
      : [selectedSlide.image_url || selectedSlide.image]
    
    const currentImage = allImages[currentImageIndex] || selectedSlide.image_url || selectedSlide.image

    const dateStr = selectedSlide.date 
      ? new Date(selectedSlide.date).toLocaleDateString(
          language === 'fa' ? 'fa-IR' : 'en-US',
          { year: 'numeric', month: 'long', day: 'numeric' }
        )
      : ''

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.modalCloseBtn} onClick={closeModal}>
            <XCircle size={28} />
          </button>

          <div className={styles.modalSlider}>
            <button 
              className={styles.modalNavBtn} 
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>

            <div className={styles.modalImageWrapper}>
              <img 
                src={currentImage} 
                alt={title}
                className={styles.modalImage}
              />
              {allImages.length > 1 && (
                <div className={styles.modalImageCounter}>
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            <button 
              className={styles.modalNavBtn} 
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {allImages.length > 1 && (
            <div className={styles.modalThumbnails}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.modalThumbnail} ${
                    idx === currentImageIndex ? styles.active : ''
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className={styles.modalInfo}>
            <h2 className={styles.modalTitle}>{title}</h2>
            {subtitle && <p className={styles.modalSubtitle}>{subtitle}</p>}
            {description && <p className={styles.modalDescription}>{description}</p>}
            <div className={styles.modalMeta}>
              {dateStr && (
                <span className={styles.modalDate}>
                  <Calendar size={16} />
                  {dateStr}
                </span>
              )}
              <span className={styles.modalViews}>
                <Eye size={16} />
                {selectedSlide.views} {language === 'fa' ? 'بازدید' : 'views'}
              </span>
              <button 
                className={styles.modalLikeBtn}
                onClick={() => handleLikeSlide(selectedSlide.id)}
              >
                ❤️ {selectedSlide.likes || 0}
              </button>
              {selectedSlide.is_featured && (
                <span className={styles.modalFeatured}>⭐ ویژه</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // نمایش بارگذاری
  // ============================================
  if (loading) {
    return (
      <section className={styles.sliderSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={40} />
            <p>در حال بارگذاری گالری...</p>
          </div>
        </div>
      </section>
    )
  }

  // ============================================
  // نمایش خطا
  // ============================================
  if (error) {
    return (
      <section className={styles.sliderSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.errorContainer}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>خطا در بارگذاری</h3>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={loadSlides}>
              تلاش مجدد
            </button>
          </div>
        </div>
      </section>
    )
  }

  const title = language === 'fa' ? 'گالری پروژه‌ها' : 'Project Gallery'
  const subtitle = language === 'fa' 
    ? 'نمایش پروژه‌های اجرا شده با سازه‌های LSF' 
    : 'Showcase of projects implemented with LSF structures'

  // ============================================
  // رندر ردیف‌های عمودی با ساختار شش‌ضلعی
  // ============================================
  const rows = getRowConfig()

  return (
    <section className={styles.sliderSection}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <p className={styles.sectionSubtitle}>{subtitle}</p>
          </div>
          {isAdmin && (
            <button
              className={styles.addSlideBtn}
              onClick={() => setIsAdding(true)}
              disabled={submitting}
            >
              <Plus size={16} />
              {language === 'fa' ? 'افزودن اسلاید' : 'Add Slide'}
            </button>
          )}
        </div>

        {isAdding && isAdmin && (
          <div className={styles.addSlideForm}>
            <h4>{language === 'fa' ? 'افزودن اسلاید جدید' : 'Add New Slide'}</h4>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'عنوان (فارسی) *' : 'Title (Persian) *'}</label>
                <input
                  type="text"
                  value={newSlideData.title_fa}
                  onChange={(e) => setNewSlideData({...newSlideData, title_fa: e.target.value})}
                  placeholder={language === 'fa' ? 'عنوان فارسی را وارد کنید' : 'Enter Persian title'}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'عنوان (انگلیسی)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={newSlideData.title_en}
                  onChange={(e) => setNewSlideData({...newSlideData, title_en: e.target.value})}
                  placeholder={language === 'fa' ? 'عنوان انگلیسی را وارد کنید' : 'Enter English title'}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'زیرنویس (فارسی)' : 'Subtitle (Persian)'}</label>
                <input
                  type="text"
                  value={newSlideData.subtitle_fa}
                  onChange={(e) => setNewSlideData({...newSlideData, subtitle_fa: e.target.value})}
                  placeholder={language === 'fa' ? 'زیرنویس فارسی' : 'Persian subtitle'}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'زیرنویس (انگلیسی)' : 'Subtitle (English)'}</label>
                <input
                  type="text"
                  value={newSlideData.subtitle_en}
                  onChange={(e) => setNewSlideData({...newSlideData, subtitle_en: e.target.value})}
                  placeholder={language === 'fa' ? 'زیرنویس انگلیسی' : 'English subtitle'}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'توضیحات (فارسی)' : 'Description (Persian)'}</label>
                <textarea
                  value={newSlideData.description_fa}
                  onChange={(e) => setNewSlideData({...newSlideData, description_fa: e.target.value})}
                  placeholder={language === 'fa' ? 'توضیحات کامل به فارسی' : 'Full description in Persian'}
                  rows={3}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'توضیحات (انگلیسی)' : 'Description (English)'}</label>
                <textarea
                  value={newSlideData.description_en}
                  onChange={(e) => setNewSlideData({...newSlideData, description_en: e.target.value})}
                  placeholder={language === 'fa' ? 'توضیحات کامل به انگلیسی' : 'Full description in English'}
                  rows={3}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'لینک' : 'Link'}</label>
                <input
                  type="text"
                  value={newSlideData.link}
                  onChange={(e) => setNewSlideData({...newSlideData, link: e.target.value})}
                  placeholder={language === 'fa' ? '/projects/example' : '/projects/example'}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'متن لینک (فارسی)' : 'Link Text (Persian)'}</label>
                <input
                  type="text"
                  value={newSlideData.link_text_fa}
                  onChange={(e) => setNewSlideData({...newSlideData, link_text_fa: e.target.value})}
                  placeholder={language === 'fa' ? 'مشاهده پروژه' : ''}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'متن لینک (انگلیسی)' : 'Link Text (English)'}</label>
                <input
                  type="text"
                  value={newSlideData.link_text_en}
                  onChange={(e) => setNewSlideData({...newSlideData, link_text_en: e.target.value})}
                  placeholder="View Project"
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'تصویر *' : 'Image *'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setNewSlideData({...newSlideData, image: file})
                    }
                  }}
                  required
                />
                {newSlideData.image && (
                  <span className={styles.fileName}>
                    📷 {newSlideData.image.name}
                  </span>
                )}
              </div>
              <div className={styles.formField}>
                <label>
                  <input
                    type="checkbox"
                    checked={newSlideData.is_featured}
                    onChange={(e) => setNewSlideData({...newSlideData, is_featured: e.target.checked})}
                  />
                  {language === 'fa' ? 'ویژه' : 'Featured'}
                </label>
              </div>
            </div>
            <div className={styles.formActions}>
              <button 
                className={styles.saveBtn} 
                onClick={handleAddSlide}
                disabled={submitting}
              >
                {submitting ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                {language === 'fa' ? 'ذخیره' : 'Save'}
              </button>
              <button 
                className={styles.cancelBtn} 
                onClick={() => {
                  setIsAdding(false)
                  setNewSlideData({
                    title_fa: '',
                    title_en: '',
                    subtitle_fa: '',
                    subtitle_en: '',
                    description_fa: '',
                    description_en: '',
                    image: null,
                    link: '',
                    link_text_fa: '',
                    link_text_en: '',
                    is_featured: false,
                    order: 0,
                  })
                }}
                disabled={submitting}
              >
                <X size={16} />
                {language === 'fa' ? 'لغو' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================
            رندر ردیف‌های عمودی با ساختار شش‌ضلعی
            ============================================ */}
        <div className={styles.hexGrid} ref={gridRef}>
          {slides.length === 0 ? (
            <div className={styles.emptyState}>
              <ImageIcon size={48} className={styles.emptyIcon} />
              <p>{language === 'fa' ? 'هیچ اسلایدی یافت نشد' : 'No slides found'}</p>
            </div>
          ) : (
            rows.map((row, rowIndex) => {
              const rowItems = slides.slice(row.start, row.start + row.count)
              
              return (
                <div 
                  key={rowIndex} 
                  className={`${styles.hexRow} ${styles[`row${rowIndex + 1}`]}`}
                >
                  {rowItems.map((item, itemIndex) => 
                    renderHexItem(item, rowIndex, itemIndex)
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {renderModal()}
    </section>
  )
}

export default SliderSection