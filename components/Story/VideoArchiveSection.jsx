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
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './styles/VideoArchiveSection.module.css'
import videoArchiveService from './services/videoArchiveService'
import Config from '@/config/config'
import {
  DEFAULT_VIDEO_INSTA_SETTINGS,
  fetchVideoInstaSettings,
  buildVideoInstaCssVars,
} from '@/services/videoInstaSettings'

const VideoArchiveSection = () => {
  const { language } = useLanguage()
  const { user } = useAuth()

  const [settings, setSettings] = useState(DEFAULT_VIDEO_INSTA_SETTINGS)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [activeVideo, setActiveVideo] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

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
  const pageSize = 8

  const [newVideo, setNewVideo] = useState({
    title: '',
    video: null,
    thumbnail: null,
    is_active: true,
  })

  const videoRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  const isFetchingRef = useRef(false)
  const trackedViewsRef = useRef(new Set())

  const isAdmin = user?.is_staff || user?.is_superuser || false
  const isRTL = language === 'fa'

  const getFullUrl = useCallback((path) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('/media/')) return `${Config.baseUrl}${path}`
    if (path.startsWith('media/')) return `${Config.baseUrl}/${path}`
    return `${Config.baseUrl}/media/${path.replace(/^\/+/, '')}`
  }, [])

  const trackVideoView = useCallback(async (videoId) => {
    if (!videoId) return
    if (trackedViewsRef.current.has(videoId)) return

    trackedViewsRef.current.add(videoId)

    try {
      const result = await videoArchiveService.trackView(videoId)

      if (result.success && result.data?.views !== undefined) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, views: result.data.views } : v
          )
        )
        setActiveVideo((prev) =>
          prev && prev.id === videoId
            ? { ...prev, views: result.data.views }
            : prev
        )
      }
    } catch {
      // silent fail
    }
  }, [])

  const fetchVideos = useCallback(
    async (page = 1, isInitial = false) => {
      if (isFetchingRef.current) return

      isFetchingRef.current = true
      setLoading(true)

      try {
        const result = await videoArchiveService.getVideos(page, pageSize)

        if (result.success) {
          const newItems = result.data?.items || []
          const pagination = result.data?.pagination || {}

          const uniqueNewItems = newItems.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          )

          setVideos(uniqueNewItems)
          setTotalPages(pagination.total_pages || 1)
          setTotalItems(pagination.total_items || 0)
          setCurrentPage(pagination.current_page || page)

          if (uniqueNewItems.length > 0) {
            setActiveVideo(uniqueNewItems[0])
            setActiveIndex(0)
            setIsPlaying(false)
          } else {
            setActiveVideo(null)
          }

          if (isInitial) setIsInitialLoad(false)
        } else {
          console.error('خطا در دریافت ویدیوها:', result.error)
        }
      } catch (error) {
        console.error('خطای غیرمنتظره:', error)
      } finally {
        setLoading(false)
        isFetchingRef.current = false
      }
    },
    [pageSize]
  )

  useEffect(() => {
    fetchVideos(1, true)
    fetchVideoInstaSettings().then(setSettings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playVideo = useCallback(
    (video, index) => {
      if (!video) return
      setActiveVideo(video)
      setActiveIndex(index)
      setIsPlaying(true)
      setProgress(0)
      setCurrentTime(0)

      trackVideoView(video.id)

      if (videoRef.current) {
        videoRef.current.load()
        setTimeout(() => {
          videoRef.current?.play().catch(() => {})
        }, 100)
      }
    },
    [trackVideoView]
  )

  const pauseVideo = useCallback(() => {
    setIsPlaying(false)
    videoRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      pauseVideo()
    } else {
      setIsPlaying(true)
      videoRef.current.play().catch(() => {})
      if (activeVideo?.id) {
        trackVideoView(activeVideo.id)
      }
    }
  }, [isPlaying, pauseVideo, activeVideo, trackVideoView])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (videoRef.current) videoRef.current.muted = !prev
      return !prev
    })
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const dur = videoRef.current.duration || 0
      setCurrentTime(current)
      setDuration(dur)
      if (dur > 0) setProgress((current / dur) * 100)
    }
  }, [])

  const handleProgressClick = useCallback(
    (e) => {
      if (!videoRef.current || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = x / rect.width
      videoRef.current.currentTime = percent * duration
    },
    [duration]
  )

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => {
      const next = !prev
      document.body.style.overflow = next ? 'hidden' : ''
      return next
    })
  }, [])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const goToNext = useCallback(() => {
    if (videos.length === 0) return
    const nextIndex = (activeIndex + 1) % videos.length
    playVideo(videos[nextIndex], nextIndex)
  }, [activeIndex, videos, playVideo])

  const goToPrev = useCallback(() => {
    if (videos.length === 0) return
    const prevIndex = (activeIndex - 1 + videos.length) % videos.length
    playVideo(videos[prevIndex], prevIndex)
  }, [activeIndex, videos, playVideo])

  const handleCardClick = useCallback(
    (video, index) => {
      if (activeVideo?.id === video.id) {
        toggleZoom()
        return
      }
      playVideo(video, index)
    },
    [activeVideo, playVideo, toggleZoom]
  )

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
  }, [])

  const handleTouchMove = useCallback(
    (e) => {
      if (!touchStartX.current || isZoomed || isSwiping.current) return
      const diffX = e.touches[0].clientX - touchStartX.current
      const diffY = e.touches[0].clientY - touchStartY.current

      // فقط وقتی حرکت افقی واضح است، اسکرول عمودی را قفل کن
      if (Math.abs(diffX) > 18 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
        e.preventDefault()
      }
    },
    [isZoomed]
  )

  const handleTouchEnd = useCallback(
    (e) => {
      const startX = touchStartX.current
      const startY = touchStartY.current
      touchStartX.current = 0
      touchStartY.current = 0

      if (!startX || isZoomed) {
        isSwiping.current = false
        return
      }

      const end = e.changedTouches?.[0]
      if (!end) {
        isSwiping.current = false
        return
      }

      const diffX = end.clientX - startX
      const diffY = end.clientY - startY

      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.15) {
        isSwiping.current = true
        if (diffX > 0) {
          isRTL ? goToNext() : goToPrev()
        } else {
          isRTL ? goToPrev() : goToNext()
        }
        setTimeout(() => {
          isSwiping.current = false
        }, 220)
        return
      }

      isSwiping.current = false
    },
    [goToNext, goToPrev, isRTL, isZoomed]
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return

      switch (e.key) {
        case 'Escape':
          if (isZoomed) toggleZoom()
          break
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          isRTL ? goToNext() : goToPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          isRTL ? goToPrev() : goToNext()
          break
        case 'f':
        case 'F':
          toggleZoom()
          break
        case 'm':
        case 'M':
          toggleMute()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZoomed, toggleZoom, togglePlay, toggleMute, goToNext, goToPrev, isRTL])

  const goToPage = useCallback(
    (page) => {
      if (page === currentPage) return
      if (page < 1 || page > totalPages) return
      fetchVideos(page, false)
    },
    [currentPage, totalPages, fetchVideos]
  )

  const deleteVideo = async (id) => {
    if (
      !confirm(
        language === 'fa'
          ? 'آیا از حذف این ویدیو اطمینان دارید؟'
          : 'Delete this video?'
      )
    )
      return

    try {
      const result = await videoArchiveService.deleteVideo(id)
      if (result.success) {
        if (videos.length === 1 && currentPage > 1) {
          await fetchVideos(currentPage - 1, false)
        } else {
          await fetchVideos(currentPage, false)
        }
      } else {
        alert(result.error || 'خطا در حذف ویدیو')
      }
    } catch {
      alert(language === 'fa' ? 'خطا در حذف ویدیو' : 'Error deleting video')
    }
  }

  const resetForm = () => {
    setNewVideo({ title: '', video: null, thumbnail: null, is_active: true })
  }

  const addVideo = async () => {
    if (!newVideo.video) {
      alert(
        language === 'fa'
          ? 'لطفاً فایل ویدیو را انتخاب کنید'
          : 'Please select a video file'
      )
      return
    }
    setSubmitting(true)
    try {
      const result = await videoArchiveService.createVideo(newVideo)
      if (result.success) {
        setIsAdding(false)
        resetForm()
        await fetchVideos(1, false)
      } else {
        alert(result.error || 'خطا در ایجاد ویدیو')
      }
    } catch {
      alert(language === 'fa' ? 'خطا در ایجاد ویدیو' : 'Error creating video')
    } finally {
      setSubmitting(false)
    }
  }

  const t = {
    title:
      language === 'fa'
        ? settings.title_fa || 'آرشیو ویدیوها'
        : settings.title_en || 'Video Archive',
    subtitle:
      language === 'fa'
        ? settings.subtitle_fa || ''
        : settings.subtitle_en || '',
    addNew: language === 'fa' ? 'ویدیو جدید' : 'New Video',
    empty: language === 'fa' ? 'هنوز ویدیویی وجود ندارد' : 'No videos yet',
    loading: language === 'fa' ? 'در حال بارگذاری...' : 'Loading...',
    addTitle: language === 'fa' ? 'عنوان (اختیاری)' : 'Title (optional)',
    addVideo: language === 'fa' ? 'فایل ویدیو (ضروری)' : 'Video file (required)',
    addThumbnail:
      language === 'fa' ? 'تصویر شاخص (اختیاری)' : 'Thumbnail (optional)',
    save: language === 'fa' ? 'ذخیره' : 'Save',
    cancel: language === 'fa' ? 'لغو' : 'Cancel',
    views: language === 'fa' ? 'بازدید' : 'views',
    nowPlaying: language === 'fa' ? 'در حال پخش' : 'Now Playing',
    allVideos: language === 'fa' ? 'همه ویدیوها' : 'All Videos',
    prev: language === 'fa' ? 'قبلی' : 'Previous',
    next: language === 'fa' ? 'بعدی' : 'Next',
    closeZoom: language === 'fa' ? 'خروج' : 'Exit',
    page: language === 'fa' ? 'صفحه' : 'Page',
    play: language === 'fa' ? 'پخش' : 'Play',
  }

  const themeStyle = buildVideoInstaCssVars(settings)

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPaginationRange = () => {
    const total = totalPages
    const current = currentPage
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i)
      }
    }

    let prev
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1)
        } else if (i - prev !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      prev = i
    }
    return rangeWithDots
  }

  if (settings.show_desktop_section === false) return null

  if (loading && videos.length === 0) {
    return (
      <section
        className={`${styles.section} ${styles.desktopOnly}`}
        style={themeStyle}
      >
        <div className="container">
          <div className={styles.loading}>
            <Loader2 size={32} className={styles.spinner} />
            <span>{t.loading}</span>
          </div>
        </div>
      </section>
    )
  }

  const showHeader =
    settings.show_title !== false ||
    settings.show_subtitle !== false ||
    (isAdmin && settings.show_add_button !== false)

  return (
    <section
      className={`${styles.section} ${styles.desktopOnly}`}
      style={themeStyle}
    >
      <div className="container">
        {showHeader && (
          <div className={styles.header}>
            <div className={styles.headerText}>
              {settings.show_title !== false && (
                <h2
                  className={`${styles.title} ${
                    settings.title_color ? styles.titleSolid : ''
                  }`}
                >
                  {t.title}
                </h2>
              )}
              {settings.show_subtitle !== false && t.subtitle ? (
                <p className={styles.subtitle}>{t.subtitle}</p>
              ) : null}
            </div>
            {isAdmin && settings.show_add_button !== false && (
              <button
                className={styles.addBtn}
                onClick={() => setIsAdding(true)}
                disabled={isAdding}
              >
                <Plus size={16} /> {t.addNew}
              </button>
            )}
          </div>
        )}

        {isAdding && isAdmin && settings.show_add_button !== false && (
          <div className={styles.addForm}>
            <div className={styles.addFormHeader}>
              <h4>
                <VideoIcon size={18} />{' '}
                {language === 'fa' ? 'افزودن ویدیو جدید' : 'Add New Video'}
              </h4>
              <button
                className={styles.closeAddBtn}
                onClick={() => {
                  setIsAdding(false)
                  resetForm()
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label>{t.addTitle}</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  placeholder={
                    language === 'fa' ? 'مثلاً: پروژه جدید' : 'e.g., New Project'
                  }
                />
              </div>
              <div className={styles.formField}>
                <label>{t.addVideo}</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, video: e.target.files[0] })
                    }
                    className={styles.fileInput}
                    id="videoFile"
                  />
                  <label htmlFor="videoFile" className={styles.fileLabel}>
                    <Upload size={16} />
                    {newVideo.video
                      ? newVideo.video.name
                      : language === 'fa'
                        ? 'انتخاب فایل'
                        : 'Choose file'}
                  </label>
                </div>
              </div>
              <div className={styles.formField}>
                <label>{t.addThumbnail}</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, thumbnail: e.target.files[0] })
                    }
                    className={styles.fileInput}
                    id="thumbnailFile"
                  />
                  <label htmlFor="thumbnailFile" className={styles.fileLabel}>
                    <ImageIcon size={16} />
                    {newVideo.thumbnail
                      ? newVideo.thumbnail.name
                      : language === 'fa'
                        ? 'انتخاب تصویر'
                        : 'Choose image'}
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                className={styles.saveBtn}
                onClick={addVideo}
                disabled={submitting || !newVideo.video}
              >
                {submitting ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <Save size={16} />
                )}
                {t.save}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setIsAdding(false)
                  resetForm()
                }}
                disabled={submitting}
              >
                <X size={16} /> {t.cancel}
              </button>
            </div>
          </div>
        )}

        {videos.length > 0 && activeVideo ? (
          <div
            className={`${styles.mainLayout} ${
              isZoomed ? styles.zoomedMode : ''
            }`}
          >
            <div
              className={styles.playerColumn}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className={`${styles.storyPlayer} ${
                  isZoomed ? styles.zoomed : ''
                }`}
              >
                <div className={styles.storyProgressBar}>
                  {videos.map((v, i) => (
                    <div
                      key={v.id}
                      className={`${styles.storyProgressSegment} ${
                        i < activeIndex
                          ? styles.completed
                          : i === activeIndex
                            ? styles.active
                            : ''
                      }`}
                    >
                      <div
                        className={styles.storyProgressFill}
                        style={{
                          width:
                            i === activeIndex
                              ? `${progress}%`
                              : i < activeIndex
                                ? '100%'
                                : '0%',
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.storyHeader}>
                  <div className={styles.storyUserInfo}>
                    <div className={styles.storyAvatar}>
                      <VideoIcon size={16} />
                    </div>
                    <div className={styles.storyUserText}>
                      <span className={styles.storyUsername}>
                        {activeVideo.title ||
                          (language === 'fa' ? 'بدون عنوان' : 'Untitled')}
                      </span>
                      <span className={styles.storyTime}>
                        {activeIndex + 1} / {videos.length}
                      </span>
                    </div>
                  </div>
                  <div className={styles.storyHeaderActions}>
                    <button
                      className={styles.storyIconBtn}
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button
                      className={styles.storyIconBtn}
                      onClick={toggleZoom}
                      aria-label={isZoomed ? 'Exit zoom' : 'Zoom'}
                    >
                      {isZoomed ? (
                        <Minimize2 size={18} />
                      ) : (
                        <Maximize2 size={18} />
                      )}
                    </button>
                    {isZoomed && (
                      <button
                        className={styles.closeZoomBtn}
                        onClick={toggleZoom}
                        aria-label={t.closeZoom}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.storyVideoWrapper}>
                  <video
                    ref={videoRef}
                    src={getFullUrl(activeVideo.video_url)}
                    poster={getFullUrl(activeVideo.thumbnail_url)}
                    className={styles.storyVideo}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={goToNext}
                    onClick={togglePlay}
                  />

                  <div className={styles.storyNavLayer}>
                    <button
                      className={`${styles.storyNavZone} ${styles.storyNavLeft}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        isRTL ? goToNext() : goToPrev()
                      }}
                      aria-label={isRTL ? t.next : t.prev}
                    />
                    <button
                      className={`${styles.storyNavZone} ${styles.storyNavRight}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        isRTL ? goToPrev() : goToNext()
                      }}
                      aria-label={isRTL ? t.prev : t.next}
                    />
                  </div>

                  {!isPlaying && (
                    <button
                      className={styles.bigPlayBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePlay()
                      }}
                      aria-label={t.play}
                    >
                      <Play size={32} fill="white" />
                    </button>
                  )}

                  <button
                    className={`${styles.navBtn} ${styles.navBtnPrev}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      isRTL ? goToNext() : goToPrev()
                    }}
                    aria-label={t.prev}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    className={`${styles.navBtn} ${styles.navBtnNext}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      isRTL ? goToPrev() : goToNext()
                    }}
                    aria-label={t.next}
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className={styles.storyFooter}>
                  <button
                    className={styles.storyControlBtn}
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <span className={styles.storyTimeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <div
                    className={styles.storyProgressClickable}
                    onClick={handleProgressClick}
                  >
                    <div
                      className={styles.storyProgressClickableFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.gridColumn}>
              <div className={styles.gridHeader}>
                <h3 className={styles.gridTitle}>
                  <VideoIcon size={16} /> {t.allVideos}
                </h3>
                <span className={styles.gridCount}>
                  {totalItems} {language === 'fa' ? 'ویدیو' : 'videos'}
                </span>
              </div>

              <div className={styles.videoGrid}>
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`${styles.videoCard} ${
                      activeVideo?.id === video.id
                        ? styles.videoCardActive
                        : ''
                    }`}
                    onClick={() => handleCardClick(video, index)}
                  >
                    <div className={styles.videoThumb}>
                      {video.thumbnail_url ? (
                        <img
                          src={getFullUrl(video.thumbnail_url)}
                          alt={video.title || 'Video'}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.thumbPlaceholder}>
                          <VideoIcon size={28} />
                        </div>
                      )}

                      <div className={styles.videoOverlay}>
                        <div className={styles.videoPlayIcon}>
                          <Play size={20} fill="white" />
                        </div>
                      </div>

                      {activeVideo?.id === video.id && (
                        <div className={styles.playingBadge}>
                          <span className={styles.playingDot} />
                          {t.nowPlaying}
                        </div>
                      )}

                      {isAdmin && (
                        <button
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteVideo(video.id)
                          }}
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      <div className={styles.videoMeta}>
                        <span className={styles.videoTitle}>
                          {video.title ||
                            (language === 'fa' ? 'بدون عنوان' : 'Untitled')}
                        </span>
                        {settings.show_views !== false && (
                          <span className={styles.videoViews}>
                            <Eye size={12} />{' '}
                            {(video.views || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageNavBtn}
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    aria-label={t.prev}
                  >
                    <ChevronRight size={18} />
                  </button>

                  <div className={styles.pageNumbers}>
                    {getPaginationRange().map((page, idx) =>
                      page === '...' ? (
                        <span key={`dots-${idx}`} className={styles.pageDots}>
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`${styles.pageNumber} ${
                            currentPage === page
                              ? styles.pageNumberActive
                              : ''
                          }`}
                          onClick={() => goToPage(page)}
                          disabled={loading}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className={styles.pageNavBtn}
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    aria-label={t.next}
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
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
