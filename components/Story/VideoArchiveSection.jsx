// components/VideoArchiveSection.jsx

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  Loader2,
  Video as VideoIcon,
  Pause,
  Play,
  Clock,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './styles/VideoArchiveSection.module.css'
import videoArchiveService from './services/videoArchiveService'
import Config from '@/config/config'

const VideoArchiveSection = () => {
  const { language, dir } = useLanguage()
  const { user } = useAuth()

  // ============================================
  // STATE
  // ============================================
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const pageSize = 10

  const [centerIndex, setCenterIndex] = useState(0)

  const [newVideo, setNewVideo] = useState({
    title: '',
    video: null,
    thumbnail: null,
    is_active: true
  })

  // ============================================
  // REFS
  // ============================================
  const videoRef = useRef(null)
  const gridRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  const isFetchingRef = useRef(false)

  const isAdmin = user?.is_staff || user?.is_superuser || false
  const isRTL = language === 'fa'

  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // ============================================
  // تشخیص دستگاه
  // ============================================
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const getVisibleCount = useCallback(() => {
    if (isMobile) return 1
    if (isTablet) return 3
    return 5
  }, [isMobile, isTablet])

  // ============================================
  // ساخت URL کامل
  // ============================================
  const getFullUrl = useCallback((path) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    if (path.startsWith('/media/')) {
      return `${Config.baseUrl}${path}`
    }
    if (path.startsWith('media/')) {
      return `${Config.baseUrl}/${path}`
    }
    return `${Config.baseUrl}/media/${path.replace(/^\/+/, '')}`
  }, [])

  // ============================================
  // دریافت ویدیوها
  // ============================================
  const fetchVideos = useCallback(async (page = 1, isInitial = false) => {
    if (isFetchingRef.current) {
      console.log('📹 [VideoArchive] ⚠️ درخواست قبلی هنوز در حال انجام است')
      return
    }

    if (isInitial && !isInitialLoad) {
      console.log('📹 [VideoArchive] ⚠️ بارگذاری اولیه قبلاً انجام شده')
      return
    }
    
    isFetchingRef.current = true
    
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      
      const result = await videoArchiveService.getVideos(page, pageSize)
      
      if (result.success) {
        let newItems = result.data?.items || []
        const pagination = result.data?.pagination || {}
        
        const uniqueNewItems = newItems.filter(
          (item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
        )
        
        if (page === 1) {
          const existingIds = new Set(videos.map(v => v.id))
          const reallyUnique = uniqueNewItems.filter(item => !existingIds.has(item.id))
          
          if (reallyUnique.length > 0) {
            setVideos(reallyUnique)
            setSelectedVideo(reallyUnique[0])
          } else {
            setVideos([])
            setSelectedVideo(null)
          }
          
          if (isInitial) {
            setIsInitialLoad(false)
          }
        } else {
          setVideos(prev => {
            const existingIds = new Set(prev.map(v => v.id))
            const itemsToAdd = uniqueNewItems.filter(item => !existingIds.has(item.id))
            
            if (itemsToAdd.length === 0) {
              return prev
            }
            
            return [...prev, ...itemsToAdd]
          })
        }
        
        setTotalPages(pagination.total_pages || 1)
        setTotalItems(pagination.total_items || 0)
        setCurrentPage(pagination.current_page || 1)
        
        if (page === 1) {
          const currentVideos = page === 1 ? 
            (videos.length > 0 ? videos : uniqueNewItems) : 
            videos
          
          if (currentVideos.length > 0) {
            const halfCount = Math.floor(getVisibleCount() / 2)
            const newCenterIndex = Math.min(halfCount, currentVideos.length - 1)
            setCenterIndex(newCenterIndex)
          }
        }
      } else {
        console.error('❌ [VideoArchive] خطا در دریافت ویدیوها:', result.error)
      }
    } catch (error) {
      console.error('❌ [VideoArchive] خطای غیرمنتظره:', error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
      isFetchingRef.current = false
    }
  }, [pageSize, getVisibleCount, videos, isInitialLoad])

  // ============================================
  // بارگذاری اولیه
  // ============================================
  useEffect(() => {
    fetchVideos(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ============================================
  // کنترل‌های پلیر
  // ============================================
  const playVideo = useCallback((video) => {
    if (!video) return
    
    setSelectedVideo(video)
    setIsPlaying(true)
    setProgress(0)
    setCurrentTime(0)
    
    if (videoRef.current) {
      videoRef.current.load()
      setTimeout(() => {
        videoRef.current?.focus()
        videoRef.current?.play().catch(() => {})
      }, 100)
    }
  }, [])

  const pauseVideo = useCallback(() => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseVideo()
    } else {
      setIsPlaying(true)
      if (videoRef.current) {
        videoRef.current.play().catch(() => {})
      }
    }
  }, [isPlaying, pauseVideo])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }, [isMuted])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const dur = videoRef.current.duration || 0
      setCurrentTime(current)
      setDuration(dur)
      if (dur > 0) {
        setProgress((current / dur) * 100)
      }
    }
  }, [])

  // ============================================
  // بزرگنمایی - با دکمه خروج واضح
  // ============================================
  const toggleZoom = useCallback(() => {
    const newZoomState = !isZoomed
    setIsZoomed(newZoomState)
    
    if (newZoomState) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [isZoomed])

  // ============================================
  // جابجایی بین آیتم‌ها
  // ============================================
  const handleNext = useCallback(() => {
    const total = videos.length
    if (centerIndex < total - 1) {
      const newIndex = centerIndex + 1
      setCenterIndex(newIndex)
      playVideo(videos[newIndex])
      
      if (gridRef.current && isMobile) {
        gridRef.current.scrollTo({
          left: gridRef.current.scrollWidth / total * newIndex,
          behavior: 'smooth'
        })
      }
    }
  }, [centerIndex, videos, playVideo, isMobile])

  const handlePrev = useCallback(() => {
    if (centerIndex > 0) {
      const newIndex = centerIndex - 1
      setCenterIndex(newIndex)
      playVideo(videos[newIndex])
      
      if (gridRef.current && isMobile) {
        gridRef.current.scrollTo({
          left: gridRef.current.scrollWidth / videos.length * newIndex,
          behavior: 'smooth'
        })
      }
    }
  }, [centerIndex, videos, playVideo, isMobile])

  // ============================================
  // کلیک روی آیتم
  // ============================================
  const handleItemClick = useCallback((video, index) => {
    if (centerIndex === index && selectedVideo?.id === video.id) {
      toggleZoom()
      return
    }
    
    setCenterIndex(index)
    playVideo(video)
    
    if (isZoomed) {
      setIsZoomed(false)
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
    }
  }, [centerIndex, selectedVideo, playVideo, toggleZoom, isZoomed])

  // ============================================
  // کشیدن با انگشت (Swipe)
  // ============================================
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStartX.current || isZoomed) return
    
    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      isSwiping.current = true
      e.preventDefault()
      
      if (diffX > 0) {
        handlePrev()
      } else {
        handleNext()
      }
      
      touchStartX.current = 0
      touchStartY.current = 0
    }
  }, [handlePrev, handleNext, isZoomed])

  const handleTouchEnd = useCallback(() => {
    touchStartX.current = 0
    touchStartY.current = 0
    setTimeout(() => {
      isSwiping.current = false
    }, 100)
  }, [])

  // ============================================
  // مدیریت کلیدهای صفحه کلید
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest?.('input') ||
        target.closest?.('textarea')
      ) {
        return
      }

      if (!selectedVideo) {
        if (e.key === 'Escape' && isZoomed) {
          toggleZoom()
        }
        return
      }

      switch (e.key) {
        case 'Escape':
          if (isZoomed) {
            e.preventDefault()
            toggleZoom()
          }
          break

        case ' ':
          e.preventDefault()
          e.stopPropagation()
          togglePlay()
          break

        case 'ArrowLeft':
          e.preventDefault()
          e.stopPropagation()
          if (isRTL) {
            handleNext()
          } else {
            handlePrev()
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          e.stopPropagation()
          if (isRTL) {
            handlePrev()
          } else {
            handleNext()
          }
          break

        case 'f':
        case 'F':
          e.preventDefault()
          toggleZoom()
          break

        case 'm':
        case 'M':
          e.preventDefault()
          toggleMute()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedVideo, isZoomed, toggleZoom, togglePlay, toggleMute, handleNext, handlePrev, isRTL])

  // ============================================
  // حذف و افزودن ویدیو
  // ============================================
  const deleteVideo = async (id) => {
    if (!confirm(language === 'fa' ? 'آیا از حذف این ویدیو اطمینان دارید؟' : 'Delete this video?')) {
      return
    }
    
    try {
      const result = await videoArchiveService.deleteVideo(id)
      
      if (result.success) {
        setVideos(prev => prev.filter(v => v.id !== id))
        setTotalItems(prev => Math.max(0, prev - 1))
        
        setVideos(prev => {
          if (prev.length > 0) {
            if (selectedVideo?.id === id) {
              setSelectedVideo(prev[0])
              playVideo(prev[0])
            }
            if (centerIndex >= prev.length) {
              setCenterIndex(prev.length - 1)
            }
          } else {
            setSelectedVideo(null)
            setIsPlaying(false)
            setCenterIndex(0)
          }
          return prev
        })
        
        await fetchVideos(1, true)
      } else {
        alert(result.error || 'خطا در حذف ویدیو')
      }
    } catch (error) {
      alert(language === 'fa' ? 'خطا در حذف ویدیو' : 'Error deleting video')
    }
  }

  const addVideo = async () => {
    if (!newVideo.video) {
      alert(language === 'fa' ? 'لطفاً فایل ویدیو را انتخاب کنید' : 'Please select a video file')
      return
    }
    
    setSubmitting(true)
    
    try {
      const result = await videoArchiveService.createVideo(newVideo)
      
      if (result.success) {
        const newVideoData = result.data
        
        setVideos(prev => {
          const exists = prev.some(v => v.id === newVideoData.id)
          if (exists) return prev
          return [newVideoData, ...prev]
        })
        
        setSelectedVideo(newVideoData)
        setCenterIndex(0)
        setTotalItems(prev => prev + 1)
        setIsAdding(false)
        resetForm()
        
        setTimeout(() => {
          playVideo(newVideoData)
        }, 300)
      } else {
        alert(result.error || 'خطا در ایجاد ویدیو')
      }
    } catch (error) {
      alert(language === 'fa' ? 'خطا در ایجاد ویدیو' : 'Error creating video')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewVideo({ 
      title: '', 
      video: null, 
      thumbnail: null, 
      is_active: true 
    })
  }

  // ============================================
  // ترجمه‌ها
  // ============================================
  const t = {
    title: language === 'fa' ? 'آرشیو ویدیوها' : 'Video Archive',
    subtitle: language === 'fa' ? 'آرشیو ویدیوهای منتخب ما' : 'Our selected video archive',
    addNew: language === 'fa' ? 'ویدیو جدید' : 'New Video',
    empty: language === 'fa' ? 'هنوز ویدیویی وجود ندارد' : 'No videos yet',
    loading: language === 'fa' ? 'در حال بارگذاری...' : 'Loading...',
    addTitle: language === 'fa' ? 'عنوان (اختیاری)' : 'Title (optional)',
    addVideo: language === 'fa' ? 'فایل ویدیو (ضروری)' : 'Video file (required)',
    addThumbnail: language === 'fa' ? 'تصویر شاخص (اختیاری)' : 'Thumbnail (optional)',
    save: language === 'fa' ? 'ذخیره' : 'Save',
    cancel: language === 'fa' ? 'لغو' : 'Cancel',
    views: language === 'fa' ? 'بازدید' : 'views',
    pause: language === 'fa' ? 'مکث' : 'Pause',
    play: language === 'fa' ? 'پخش' : 'Play',
    zoomIn: language === 'fa' ? 'بزرگنمایی' : 'Zoom In',
    zoomOut: language === 'fa' ? 'خروج از بزرگنمایی' : 'Zoom Out',
    prev: language === 'fa' ? 'قبلی' : 'Previous',
    next: language === 'fa' ? 'بعدی' : 'Next',
    closeZoom: language === 'fa' ? 'خروج از بزرگنمایی' : 'Exit Zoom',
    tapToZoom: language === 'fa' ? '👆 کلیک برای بزرگنمایی' : '👆 Tap to zoom',
    tapToClose: language === 'fa' ? '✕ خروج از بزرگنمایی' : '✕ Exit Zoom',
  }

  // ============================================
  // محاسبه آیتم‌های قابل نمایش
  // ============================================
  const visibleItems = React.useMemo(() => {
    const total = videos.length
    const visibleCount = getVisibleCount()
    const halfCount = Math.floor(visibleCount / 2)
    
    const start = Math.max(0, centerIndex - halfCount)
    const end = Math.min(total, centerIndex + halfCount + 1)
    
    return videos.slice(start, end).map((video, idx) => ({
      ...video,
      originalIndex: start + idx,
      isCenter: start + idx === centerIndex,
      position: start + idx - centerIndex
    }))
  }, [videos, centerIndex, getVisibleCount])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ============================================
  // RENDER
  // ============================================
  if (loading && videos.length === 0) {
    return (
      <section className={styles.videoArchiveSection}>
        <div className="container">
          <div className={styles.loading}>
            <Loader2 size={28} className={styles.spinner} />
            <span>{t.loading}</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.videoArchiveSection}>
      <div className="container">
        {/* ===== HEADER ===== */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.badge}>🎬 {language === 'fa' ? 'آرشیو' : 'Archive'}</div>
            <h2 className={styles.title}>{t.title}</h2>
            <p className={styles.subtitle}>{t.subtitle}</p>
            {totalItems > 0 && (
              <span className={styles.totalCount}>
                {totalItems} {language === 'fa' ? 'ویدیو' : 'videos'}
              </span>
            )}
          </div>
          {isAdmin && (
            <button className={styles.addBtn} onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus size={16} /> {t.addNew}
            </button>
          )}
        </div>

        {/* ===== ADD FORM ===== */}
        {isAdding && isAdmin && (
          <div className={styles.addForm}>
            <h4><VideoIcon size={18} /> {language === 'fa' ? 'افزودن ویدیو جدید' : 'Add New Video'}</h4>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label>{t.addTitle}</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder={language === 'fa' ? 'مثلاً: پروژه جدید' : 'e.g., New Project'}
                />
              </div>
              <div className={styles.formField}>
                <label>{t.addVideo}</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setNewVideo({ ...newVideo, video: e.target.files[0] })}
                    className={styles.fileInput}
                    id="videoFile"
                  />
                  <label htmlFor="videoFile" className={styles.fileLabel}>
                    <Upload size={16} />
                    {newVideo.video ? newVideo.video.name : language === 'fa' ? 'انتخاب فایل' : 'Choose file'}
                  </label>
                </div>
              </div>
              <div className={styles.formField}>
                <label>{t.addThumbnail}</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.files[0] })}
                    className={styles.fileInput}
                    id="thumbnailFile"
                  />
                  <label htmlFor="thumbnailFile" className={styles.fileLabel}>
                    <ImageIcon size={16} />
                    {newVideo.thumbnail ? newVideo.thumbnail.name : language === 'fa' ? 'انتخاب تصویر' : 'Choose image'}
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={addVideo} disabled={submitting || !newVideo.video}>
                {submitting ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                {t.save}
              </button>
              <button className={styles.cancelBtn} onClick={() => { setIsAdding(false); resetForm() }} disabled={submitting}>
                <X size={16} /> {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* ===== CAROUSEL ===== */}
        {videos.length > 0 && selectedVideo ? (
          <div 
            className={`${styles.carouselContainer} ${isZoomed ? styles.zoomed : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ===== دکمه خروج از بزرگنمایی - بسیار واضح ===== */}
            {isZoomed && (
              <button 
                className={styles.closeZoomBtn}
                onClick={toggleZoom}
                aria-label={t.closeZoom}
              >
                <X size={isMobile ? 28 : 32} />
                <span>{t.closeZoom}</span>
              </button>
            )}

            {/* ===== دکمه‌های قبلی/بعدی - در موبایل هم نمایش داده می‌شوند ===== */}
            {!isZoomed && centerIndex > 0 && (
              <button 
                className={`${styles.scrollBtn} ${styles.scrollLeft}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                aria-label={t.prev}
              >
                <ChevronLeft size={isMobile ? 24 : 28} />
              </button>
            )}

            {!isZoomed && centerIndex < videos.length - 1 && (
              <button 
                className={`${styles.scrollBtn} ${styles.scrollRight}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                aria-label={t.next}
              >
                <ChevronRight size={isMobile ? 24 : 28} />
              </button>
            )}

            {/* ===== دکمه‌های لمسی برای موبایل (لبه‌های صفحه) ===== */}
            {isMobile && !isZoomed && (
              <>
                <div 
                  className={styles.touchLeft}
                  onClick={handlePrev}
                  aria-label={t.prev}
                />
                <div 
                  className={styles.touchRight}
                  onClick={handleNext}
                  aria-label={t.next}
                />
              </>
            )}

            {/* ===== TRACK ===== */}
            <div className={styles.carouselTrack} ref={gridRef}>
              {visibleItems.map((item, index) => (
                <div 
                  key={`video-${item.id}-${index}`}
                  className={`${styles.carouselItem} ${item.isCenter ? styles.centerItem : styles.sideItem}`}
                  onClick={() => handleItemClick(item, item.originalIndex)}
                >
                  <div className={styles.mobileFrame}>
                    <div className={`${styles.phoneMockup} ${item.isCenter && isZoomed ? styles.zoomedPhone : ''}`}>
                      <div className={styles.phoneNotch}>
                        <div className={styles.notchCamera}></div>
                      </div>
                      
                      <div className={styles.phoneScreen}>
                        {item.isCenter && selectedVideo ? (
                          <>
                            <video
                              ref={videoRef}
                              src={getFullUrl(selectedVideo.video_url)}
                              className={styles.phoneVideo}
                              poster={getFullUrl(selectedVideo.thumbnail_url)}
                              playsInline
                              tabIndex={0}
                              onTimeUpdate={handleTimeUpdate}
                              onPlay={() => setIsPlaying(true)}
                              onPause={() => setIsPlaying(false)}
                              onEnded={() => handleNext()}
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <div className={styles.videoControls} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.progressBar}>
                                <div 
                                  className={styles.progressFill} 
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              
                              <div className={styles.controlsBottom}>
                                <button 
                                  className={styles.controlBtn}
                                  onClick={togglePlay}
                                  aria-label={isPlaying ? t.pause : t.play}
                                >
                                  {isPlaying ? <Pause size={isMobile ? 14 : 18} /> : <Play size={isMobile ? 14 : 18} />}
                                </button>
                                
                                <span className={styles.timeText}>
                                  {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                                
                                <button 
                                  className={styles.controlBtn}
                                  onClick={toggleMute}
                                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                                >
                                  {isMuted ? <VolumeX size={isMobile ? 14 : 18} /> : <Volume2 size={isMobile ? 14 : 18} />}
                                </button>
                                
                                <button 
                                  className={`${styles.controlBtn} ${styles.zoomBtn}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleZoom()
                                  }}
                                  title={isZoomed ? t.zoomOut : t.zoomIn}
                                  aria-label={isZoomed ? t.zoomOut : t.zoomIn}
                                >
                                  {isZoomed ? <Minimize2 size={isMobile ? 14 : 18} /> : <Maximize2 size={isMobile ? 14 : 18} />}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {item.thumbnail_url ? (
                              <img
                                src={getFullUrl(item.thumbnail_url)}
                                alt={item.title || 'Video'}
                                className={styles.phoneImage}
                                loading="lazy"
                              />
                            ) : (
                              <div className={styles.phonePlaceholder}>
                                <VideoIcon size={isMobile ? 32 : 48} />
                              </div>
                            )}
                            
                            <div className={styles.playOverlay}>
                              <Play size={isMobile ? 20 : 28} className={styles.playIconSmall} />
                            </div>
                          </>
                        )}
                        
                        {/* ===== عنوان و بازدید - همیشه نمایش داده می‌شود ===== */}
                        <div className={styles.phoneInfo}>
                          <span className={styles.phoneTitle}>
                            {item.title || (language === 'fa' ? 'بدون عنوان' : 'Untitled')}
                          </span>
                          <span className={styles.phoneViews}>
                            <Eye size={isMobile ? 10 : 14} /> {(item.views || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.phoneHome}></div>
                    </div>
                    
                    {item.isCenter && !isZoomed && (
                      <div className={styles.centerBadge}>
                        {t.tapToZoom}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ===== شمارنده موبایل ===== */}
            {isMobile && (
              <div className={styles.mobileCounter}>
                {centerIndex + 1} / {videos.length}
              </div>
            )}

            {/* ===== PAGE INDICATOR ===== */}
            <div className={styles.pageIndicator}>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={`page-${i}`}
                  className={`${styles.pageDot} ${currentPage === i + 1 ? styles.activeDot : ''}`}
                  onClick={() => {
                    if (currentPage !== i + 1) {
                      fetchVideos(i + 1)
                    }
                  }}
                  aria-label={`صفحه ${i + 1}`}
                />
              ))}
              {totalPages > 5 && (
                <span className={styles.pageDotsMore}>...</span>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <VideoIcon size={48} />
            <p>{t.empty}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default VideoArchiveSection