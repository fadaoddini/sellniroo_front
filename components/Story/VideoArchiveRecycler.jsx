'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Play,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import videoArchiveService from './services/videoArchiveService'
import {
  mergeVideoArchiveWidgetSettings,
  videoArchiveWidgetCssVars,
} from '@/config/videoArchiveWidgetSettings'
import {
  DEFAULT_VIDEO_INSTA_SETTINGS,
  fetchVideoInstaSettings,
} from '@/services/videoInstaSettings'
import styles from './styles/VideoArchiveRecycler.module.css'

function getFullUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/media/')) return `${Config.baseUrl}${path}`
  if (path.startsWith('media/')) return `${Config.baseUrl}/${path}`
  return `${Config.baseUrl}/media/${path.replace(/^\/+/, '')}`
}

/**
 * آرشیو ویدیویی ریسایکلر — اسکرول افقی کارت‌های ویدیو
 */
export default function VideoArchiveRecycler({ settings: widgetSettings = {} }) {
  const { language } = useLanguage()
  const isRTL = language === 'fa'

  const [apiSettings, setApiSettings] = useState(DEFAULT_VIDEO_INSTA_SETTINGS)
  const settings = useMemo(
    () => mergeVideoArchiveWidgetSettings(apiSettings, widgetSettings),
    [apiSettings, widgetSettings]
  )

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const trackRef = useRef(null)
  const videoRef = useRef(null)
  const trackedViewsRef = useRef(new Set())

  const pageSize = settings.count || 12
  const visible = settings.recycler_visible_desktop || 4
  const showArrows = settings.recycler_show_arrows !== false
  const dragScroll = settings.recycler_drag_scroll !== false
  const aspect = settings.recycler_aspect || '9_16'

  useEffect(() => {
    fetchVideoInstaSettings().then(setApiSettings)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const result = await videoArchiveService.getVideos(1, pageSize)
      if (cancelled) return
      if (result.success) {
        setVideos(result.data?.items || [])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [pageSize])

  const themeStyle = useMemo(
    () => ({
      ...videoArchiveWidgetCssVars(settings),
      '--vr-visible': String(visible),
      '--vr-gap': `${settings.card_gap || 14}px`,
      '--vr-card-r': `${settings.card_radius || 16}px`,
    }),
    [settings, visible]
  )

  const title =
    language === 'fa'
      ? settings.title_fa || 'آرشیو ویدیوها'
      : settings.title_en || 'Video Archive'
  const subtitle =
    language === 'fa'
      ? settings.subtitle_fa || ''
      : settings.subtitle_en || ''

  const scrollByDir = useCallback(
    (dir) => {
      const el = trackRef.current
      if (!el) return
      const card = el.querySelector('[data-vr-card]')
      const step = card
        ? card.getBoundingClientRect().width + (settings.card_gap || 14)
        : el.clientWidth * 0.7
      const delta = (isRTL ? -dir : dir) * step
      el.scrollBy({ left: delta, behavior: 'smooth' })
    },
    [isRTL, settings.card_gap]
  )

  const trackView = useCallback(async (videoId) => {
    if (!videoId || trackedViewsRef.current.has(videoId)) return
    trackedViewsRef.current.add(videoId)
    try {
      const result = await videoArchiveService.trackView(videoId)
      if (result.success && result.data?.views !== undefined) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, views: result.data.views } : v
          )
        )
      }
    } catch {
      /* silent */
    }
  }, [])

  const openViewer = useCallback(
    (index) => {
      if (!videos[index]) return
      setActiveIndex(index)
      setProgress(0)
      setIsPlaying(true)
      document.body.style.overflow = 'hidden'
      trackView(videos[index].id)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.load()
          videoRef.current.play().catch(() => {})
        }
      })
    },
    [videos, trackView]
  )

  const closeViewer = useCallback(() => {
    setActiveIndex(-1)
    setIsPlaying(false)
    videoRef.current?.pause()
    document.body.style.overflow = ''
  }, [])

  const playAt = useCallback(
    (index) => {
      if (index < 0 || index >= videos.length) {
        closeViewer()
        return
      }
      setActiveIndex(index)
      setProgress(0)
      setIsPlaying(true)
      trackView(videos[index].id)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load()
          videoRef.current.play().catch(() => {})
        }
      }, 40)
    },
    [videos, trackView, closeViewer]
  )

  const goNext = useCallback(() => {
    if (activeIndex >= videos.length - 1) {
      closeViewer()
      return
    }
    playAt(activeIndex + 1)
  }, [activeIndex, videos.length, playAt, closeViewer])

  const goPrev = useCallback(() => {
    if (activeIndex <= 0) {
      playAt(0)
      return
    }
    playAt(activeIndex - 1)
  }, [activeIndex, playAt])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (videoRef.current) videoRef.current.muted = !prev
      return !prev
    })
  }, [])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (activeIndex < 0) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeViewer()
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        isRTL ? goNext() : goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        isRTL ? goPrev() : goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, closeViewer, togglePlay, goNext, goPrev, isRTL])

  if (settings.show_on_desktop === false && settings.show_on_mobile === false) {
    return null
  }

  const activeVideo = activeIndex >= 0 ? videos[activeIndex] : null
  const hideMobile = settings.show_on_mobile === false
  const hideDesktop = settings.show_on_desktop === false

  const viewAllHref = settings.view_all_href || '/videos'
  const viewAllLabel =
    language === 'fa'
      ? settings.view_all_label_fa || 'همه'
      : settings.view_all_label_en || 'All'
  const showViewAll = settings.show_view_all !== false

  const showHeader =
    settings.show_title !== false ||
    (settings.show_subtitle !== false && !!subtitle) ||
    showViewAll

  if (loading && videos.length === 0) {
    return (
      <section
        className={`${styles.section} ${hideMobile ? styles.hideMobile : ''} ${
          hideDesktop ? styles.hideDesktop : ''
        }`}
        style={themeStyle}
      >
        <div className={styles.inner}>
          <div className={styles.loading}>
            <Loader2 size={28} className={styles.spinner} />
          </div>
        </div>
      </section>
    )
  }

  if (videos.length === 0) return null

  return (
    <>
      <section
        className={`${styles.section} ${
          settings.section_full_bleed !== false ? styles.bleed : ''
        } ${hideMobile ? styles.hideMobile : ''} ${
          hideDesktop ? styles.hideDesktop : ''
        }`}
        style={themeStyle}
      >
        <div className={styles.inner}>
          {showHeader ? (
            <div className={styles.header}>
              <div className={styles.headerMain}>
                {settings.show_title !== false ? (
                  <h2 className={styles.title}>{title}</h2>
                ) : null}
                {settings.show_subtitle !== false && subtitle ? (
                  <p className={styles.subtitle}>{subtitle}</p>
                ) : null}
              </div>
              {showViewAll ? (
                <Link href={viewAllHref} className={styles.viewAll}>
                  {viewAllLabel}
                  <ChevronLeft size={15} strokeWidth={2.4} />
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className={styles.shell}>
            {showArrows && videos.length > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.nav} ${styles.navPrev}`}
                  aria-label={language === 'fa' ? 'قبلی' : 'Previous'}
                  onClick={() => scrollByDir(-1)}
                >
                  <ChevronRight size={18} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  className={`${styles.nav} ${styles.navNext}`}
                  aria-label={language === 'fa' ? 'بعدی' : 'Next'}
                  onClick={() => scrollByDir(1)}
                >
                  <ChevronLeft size={18} strokeWidth={2.4} />
                </button>
              </>
            ) : null}

            <div
              ref={trackRef}
              className={`${styles.track} ${
                dragScroll ? styles.trackDrag : ''
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {videos.map((video, index) => {
                const thumb = getFullUrl(video.thumbnail_url)
                const label =
                  video.title ||
                  (language === 'fa' ? 'بدون عنوان' : 'Untitled')
                return (
                  <button
                    key={video.id}
                    type="button"
                    data-vr-card
                    className={`${styles.card} ${
                      aspect === '16_9' ? styles.cardWide : styles.cardTall
                    }`}
                    onClick={() => openViewer(index)}
                    aria-label={label}
                  >
                    <span className={styles.thumb}>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" loading="lazy" />
                      ) : (
                        <span className={styles.thumbFallback}>
                          <VideoIcon size={22} />
                        </span>
                      )}
                      <span className={styles.playBadge} aria-hidden>
                        <Play size={14} fill="currentColor" />
                      </span>
                      <span className={styles.meta}>
                        <span className={styles.cardTitle}>{label}</span>
                        {settings.show_views !== false ? (
                          <span className={styles.views}>
                            <Eye size={11} />
                            {(video.views || 0).toLocaleString(
                              language === 'fa' ? 'fa-IR' : 'en-US'
                            )}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {activeVideo ? (
        <div className={styles.viewer} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.viewerBackdrop}
            aria-label="Close"
            onClick={closeViewer}
          />
          <div className={styles.viewerPanel}>
            <div className={styles.viewerTop}>
              <span className={styles.viewerTitle}>
                {activeVideo.title ||
                  (language === 'fa' ? 'ویدیو' : 'Video')}
              </span>
              <div className={styles.viewerActions}>
                <button
                  type="button"
                  className={styles.viewerBtn}
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  type="button"
                  className={styles.viewerBtn}
                  onClick={closeViewer}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className={styles.viewerStage} onClick={togglePlay}>
              <video
                ref={videoRef}
                className={styles.viewerVideo}
                src={getFullUrl(activeVideo.video_url || activeVideo.video)}
                playsInline
                muted={isMuted}
                onTimeUpdate={() => {
                  const v = videoRef.current
                  if (!v || !v.duration) return
                  setProgress((v.currentTime / v.duration) * 100)
                }}
                onEnded={goNext}
              />
              {!isPlaying ? (
                <span className={styles.viewerPlay}>
                  <Play size={36} fill="currentColor" />
                </span>
              ) : null}
            </div>
            <div className={styles.viewerBar}>
              <div className={styles.viewerProgress}>
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.viewerNav}>
                <button type="button" onClick={goPrev}>
                  {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <span>
                  {activeIndex + 1} / {videos.length}
                </span>
                <button type="button" onClick={goNext}>
                  {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
