'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Video as VideoIcon,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './styles/VideoInstaStoriesRail.module.css'
import videoArchiveService from './services/videoArchiveService'
import Config from '@/config/config'
import {
  DEFAULT_VIDEO_INSTA_SETTINGS,
  fetchVideoInstaSettings,
  buildVideoInstaCssVars,
} from '@/services/videoInstaSettings'

const SEEN_KEY = 'videoinsta_seen_ids'

function readSeenIds() {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeSeenIds(set) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}

const VideoInstaStoriesRail = () => {
  const { language } = useLanguage()
  const isRTL = language === 'fa'

  const [settings, setSettings] = useState(DEFAULT_VIDEO_INSTA_SETTINGS)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [seenIds, setSeenIds] = useState(() => new Set())
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const videoRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  const trackedViewsRef = useRef(new Set())

  const activeVideo = videos[activeIndex] || null

  useEffect(() => {
    setSeenIds(readSeenIds())
  }, [])

  const getFullUrl = useCallback((path) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('/media/')) return `${Config.baseUrl}${path}`
    if (path.startsWith('media/')) return `${Config.baseUrl}/${path}`
    return `${Config.baseUrl}/media/${path.replace(/^\/+/, '')}`
  }, [])

  const markSeen = useCallback((id) => {
    if (!id) return
    setSeenIds((prev) => {
      const next = new Set(prev)
      next.add(String(id))
      writeSeenIds(next)
      return next
    })
  }, [])

  const trackVideoView = useCallback(
    async (videoId) => {
      if (!videoId || trackedViewsRef.current.has(videoId)) return
      trackedViewsRef.current.add(videoId)
      markSeen(videoId)
      try {
        await videoArchiveService.trackView(videoId)
      } catch {
        /* silent */
      }
    },
    [markSeen]
  )

  useEffect(() => {
    let cancelled = false
    const isNarrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    ;(async () => {
      const s = await fetchVideoInstaSettings()
      if (cancelled) return
      setSettings(s)
      if (!isNarrow || s.show_mobile_rail === false) {
        setLoading(false)
        return
      }
      setLoading(true)
      const result = await videoArchiveService.getVideos(1, 24)
      if (cancelled) return
      if (result.success) {
        setVideos(result.data?.items || [])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
    setIsPlaying(false)
    videoRef.current?.pause()
    document.body.style.overflow = ''
  }, [])

  const openViewer = useCallback(
    (index) => {
      if (!videos[index]) return
      setActiveIndex(index)
      setProgress(0)
      setViewerOpen(true)
      setIsPlaying(true)
      document.body.style.overflow = 'hidden'
      trackVideoView(videos[index].id)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.load()
          videoRef.current.play().catch(() => {})
        }
      })
    },
    [videos, trackVideoView]
  )

  const playAtIndex = useCallback(
    (index) => {
      if (index < 0 || index >= videos.length) {
        closeViewer()
        return
      }
      setActiveIndex(index)
      setProgress(0)
      setIsPlaying(true)
      trackVideoView(videos[index].id)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load()
          videoRef.current.play().catch(() => {})
        }
      }, 40)
    },
    [videos, trackVideoView, closeViewer]
  )

  const goToNext = useCallback(() => {
    if (activeIndex >= videos.length - 1) {
      closeViewer()
      return
    }
    playAtIndex(activeIndex + 1)
  }, [activeIndex, videos.length, playAtIndex, closeViewer])

  const goToPrev = useCallback(() => {
    if (activeIndex <= 0) {
      playAtIndex(0)
      return
    }
    playAtIndex(activeIndex - 1)
  }, [activeIndex, playAtIndex])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
      if (activeVideo?.id) trackVideoView(activeVideo.id)
    }
  }, [isPlaying, activeVideo, trackVideoView])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (videoRef.current) videoRef.current.muted = !prev
      return !prev
    })
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const dur = videoRef.current.duration || 0
    if (dur > 0) setProgress((current / dur) * 100)
  }, [])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStartX.current || isSwiping.current) return
    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current
    if (Math.abs(diffX) > 18 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      e.preventDefault()
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      const startX = touchStartX.current
      const startY = touchStartY.current
      touchStartX.current = 0
      touchStartY.current = 0
      if (!startX) return
      const end = e.changedTouches?.[0]
      if (!end) return
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
      }
    },
    [goToNext, goToPrev, isRTL]
  )

  useEffect(() => {
    if (!viewerOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeViewer()
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        isRTL ? goToNext() : goToPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        isRTL ? goToPrev() : goToNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewerOpen, closeViewer, togglePlay, goToNext, goToPrev, isRTL])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (settings.show_mobile_rail === false) return null

  const themeStyle = buildVideoInstaCssVars(settings)

  if (loading) {
    return (
      <div className={styles.rail} style={themeStyle} aria-hidden>
        <div className={styles.railScroll}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonRing} />
              <div className={styles.skeletonLabel} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (videos.length === 0) return null

  return (
    <>
      <div className={styles.rail} style={themeStyle}>
        <div className={styles.railScroll} dir={isRTL ? 'rtl' : 'ltr'}>
          {videos.map((video, index) => {
            const seen = seenIds.has(String(video.id))
            const thumb = getFullUrl(video.thumbnail_url)
            const label =
              video.title ||
              (language === 'fa' ? `استوری ${index + 1}` : `Story ${index + 1}`)
            return (
              <button
                key={video.id}
                type="button"
                className={styles.storyItem}
                onClick={() => openViewer(index)}
                aria-label={label}
              >
                <span
                  className={`${styles.ring} ${seen ? styles.ringSeen : styles.ringNew}`}
                >
                  <span className={styles.avatar}>
                    {thumb ? (
                      <img src={thumb} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.avatarFallback}>
                        <VideoIcon size={22} />
                      </span>
                    )}
                  </span>
                </span>
                <span className={styles.storyLabel}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {viewerOpen && activeVideo && (
        <div className={styles.viewer} role="dialog" aria-modal="true">
          <div
            className={styles.viewerInner}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className={styles.progressRow}>
              {videos.map((v, i) => (
                <div key={v.id} className={styles.progressSeg}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width:
                        i < activeIndex
                          ? '100%'
                          : i === activeIndex
                            ? `${progress}%`
                            : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            <div className={styles.viewerHeader}>
              <div className={styles.viewerUser}>
                <span className={styles.viewerAvatar}>
                  {getFullUrl(activeVideo.thumbnail_url) ? (
                    <img
                      src={getFullUrl(activeVideo.thumbnail_url)}
                      alt=""
                    />
                  ) : (
                    <VideoIcon size={14} />
                  )}
                </span>
                <div className={styles.viewerMeta}>
                  <span className={styles.viewerTitle}>
                    {activeVideo.title ||
                      (language === 'fa' ? 'بدون عنوان' : 'Untitled')}
                  </span>
                  <span className={styles.viewerCount}>
                    {activeIndex + 1} / {videos.length}
                  </span>
                </div>
              </div>
              <div className={styles.viewerActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={closeViewer}
                  aria-label={language === 'fa' ? 'بستن' : 'Close'}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.videoWrap}>
              <video
                ref={videoRef}
                className={styles.video}
                src={getFullUrl(activeVideo.video_url)}
                poster={getFullUrl(activeVideo.thumbnail_url)}
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={goToNext}
                onClick={togglePlay}
              />

              <div className={styles.tapZones}>
                <button
                  type="button"
                  className={styles.tapZone}
                  aria-label={isRTL ? 'بعدی' : 'Previous'}
                  onClick={(e) => {
                    e.stopPropagation()
                    isRTL ? goToNext() : goToPrev()
                  }}
                />
                <button
                  type="button"
                  className={styles.tapZone}
                  aria-label={isRTL ? 'قبلی' : 'Next'}
                  onClick={(e) => {
                    e.stopPropagation()
                    isRTL ? goToPrev() : goToNext()
                  }}
                />
              </div>

              {!isPlaying && (
                <button
                  type="button"
                  className={styles.centerPlay}
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlay()
                  }}
                  aria-label={language === 'fa' ? 'پخش' : 'Play'}
                >
                  <Play size={28} fill="white" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoInstaStoriesRail
