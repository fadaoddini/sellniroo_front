'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Film,
  Loader2,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import videoArchiveService from './services/videoArchiveService'
import Config from '@/config/config'
import Pagination from '@/components/News/Pagination'
import ViewToggle from '@/components/AllBoxItem/components/ViewToggle/ViewToggle'
import newsStyles from '@/components/News/News.module.css'
import styles from './styles/VideoArchiveListPage.module.css'

const LIMIT = 12
const VIEW_STORAGE_KEY = 'sellniroo_videos_view_mode'

const SORT_OPTIONS = [
  { id: '-created_at', label: 'جدیدترین' },
  { id: 'created_at', label: 'قدیمی‌ترین' },
  { id: '-views', label: 'پربازدید' },
]

const SPECIAL_TABS = [
  { id: 'all', label: 'همه', icon: Film },
  { id: 'popular', label: 'پربازدید', icon: Star },
  { id: 'newest', label: 'تازه‌ها', icon: Clock },
]

const VIEW_META = {
  'grid-3': { cols: 3, card: 'grid' },
  'grid-2': { cols: 2, card: 'gridLarge' },
  'image-left': { cols: 3, card: 'split' },
  list: { cols: 1, card: 'list' },
}

function getFullUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/media/')) return `${Config.baseUrl}${path}`
  if (path.startsWith('media/')) return `${Config.baseUrl}/${path}`
  return `${Config.baseUrl}/media/${path.replace(/^\/+/, '')}`
}

function readViewMode() {
  if (typeof window === 'undefined') return 'grid-3'
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY)
    if (v && VIEW_META[v]) return v
  } catch {
    /* ignore */
  }
  return 'grid-3'
}

function buildQuery({ page, search, special, ordering }) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (search) params.set('search', search)
  if (special && special !== 'all') params.set('filter', special)
  if (ordering && ordering !== '-created_at') {
    params.set('ordering', ordering)
  }
  const q = params.toString()
  return q ? `/videos?${q}` : '/videos'
}

function sortItems(items, ordering) {
  const list = [...(items || [])]
  if (ordering === '-views') {
    return list.sort((a, b) => (b.views || 0) - (a.views || 0))
  }
  if (ordering === 'created_at') {
    return list.sort(
      (a, b) =>
        new Date(a.created_at || a.created || 0) -
        new Date(b.created_at || b.created || 0)
    )
  }
  return list.sort(
    (a, b) =>
      new Date(b.created_at || b.created || 0) -
      new Date(a.created_at || a.created || 0)
  )
}

/**
 * لیست آرشیو ویدیو — چیدمان و امکانات مشابه /news (NewsList)
 */
export default function VideoArchiveListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState('grid-3')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const videoRef = useRef(null)
  const trackedViewsRef = useRef(new Set())

  const currentPage = Math.max(
    1,
    parseInt(searchParams?.get('page') || '1', 10) || 1
  )
  const searchTerm = searchParams?.get('search') || ''
  const special = searchParams?.get('filter') || 'all'
  const ordering = searchParams?.get('ordering') || '-created_at'

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    setViewMode(readViewMode())
  }, [])

  const pushFilters = useCallback(
    (patch) => {
      const next = {
        page: patch.page ?? 1,
        search: patch.search !== undefined ? patch.search : searchTerm,
        special: patch.special !== undefined ? patch.special : special,
        ordering: patch.ordering !== undefined ? patch.ordering : ordering,
      }
      router.push(buildQuery(next), { scroll: false })
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [router, searchTerm, special, ordering]
  )

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const extra = {}
      if (searchTerm) extra.search = searchTerm
      if (ordering) extra.ordering = ordering

      const result = await videoArchiveService.getVideos(
        currentPage,
        LIMIT,
        extra
      )

      if (result.success) {
        let items = result.data?.items || []
        const pag = result.data?.pagination || {}

        if (special === 'popular') {
          items = sortItems(items, '-views')
        } else if (special === 'newest') {
          items = sortItems(items, '-created_at')
        } else {
          items = sortItems(items, ordering)
        }

        if (searchTerm) {
          const q = searchTerm.trim().toLowerCase()
          items = items.filter((v) =>
            String(v.title || '')
              .toLowerCase()
              .includes(q)
          )
        }

        setVideos(items)
        setTotalCount(pag.total_items || items.length)
        setTotalPages(pag.total_pages || 1)
      } else {
        setError(result.error || 'خطا در دریافت محتوا')
        setVideos([])
        setTotalPages(0)
        setTotalCount(0)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('خطا در ارتباط با سرور')
      setVideos([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, special, ordering])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (searchTerm) n += 1
    if (special !== 'all') n += 1
    if (ordering !== '-created_at' && special !== 'newest') n += 1
    return n
  }, [searchTerm, special, ordering])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    pushFilters({ search: searchInput.trim(), page: 1 })
    setMobileFiltersOpen(false)
  }

  const handleClearAll = () => {
    setSearchInput('')
    router.push('/videos', { scroll: false })
    setMobileFiltersOpen(false)
  }

  const handleViewChange = (mode) => {
    setViewMode(mode)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }

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
        goNext()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, closeViewer, togglePlay, goNext, goPrev])

  const viewMeta = VIEW_META[viewMode] || VIEW_META['grid-3']
  const gridClass =
    viewMeta.cols === 3
      ? newsStyles.newsGridCols3
      : viewMeta.cols === 2
        ? newsStyles.newsGridCols2
        : newsStyles.newsGridCols1

  const activeVideo = activeIndex >= 0 ? videos[activeIndex] : null

  const filtersPanel = (
    <aside className={newsStyles.nlFilters}>
      <div className={newsStyles.nlFiltersHead}>
        <span className={newsStyles.nlFiltersTitle}>
          <SlidersHorizontal size={16} />
          فیلتر ویدیو
        </span>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            className={newsStyles.nlClearBtn}
            onClick={handleClearAll}
          >
            <RotateCcw size={13} />
            پاک کردن
            <em>{activeFilterCount}</em>
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSearchSubmit} className={newsStyles.nlSearchForm}>
        <Search size={16} className={newsStyles.nlSearchIcon} aria-hidden />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="جستجو در ویدیوها…"
          className={newsStyles.nlSearchInput}
          dir="rtl"
        />
        {searchInput ? (
          <button
            type="button"
            className={newsStyles.nlSearchClear}
            aria-label="پاک کردن جستجو"
            onClick={() => {
              setSearchInput('')
              if (searchTerm) pushFilters({ search: '', page: 1 })
            }}
          >
            <X size={14} />
          </button>
        ) : null}
        <button type="submit" className={newsStyles.nlSearchSubmit}>
          جستجو
        </button>
      </form>

      <div className={newsStyles.nlFilterBlock}>
        <p className={newsStyles.nlFilterLabel}>
          <Star size={14} />
          ویژه و تازه‌ها
        </p>
        <div className={newsStyles.nlSpecialGrid}>
          {SPECIAL_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${newsStyles.nlSpecialBtn} ${
                special === id ? newsStyles.nlSpecialBtnOn : ''
              }`}
              onClick={() => pushFilters({ special: id, page: 1 })}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={newsStyles.nlFilterBlock}>
        <p className={newsStyles.nlFilterLabel}>
          <Clock size={14} />
          مرتب‌سازی
        </p>
        <div className={newsStyles.nlSortList}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`${newsStyles.nlSortBtn} ${
                ordering === opt.id ? newsStyles.nlSortBtnOn : ''
              }`}
              onClick={() => pushFilters({ ordering: opt.id, page: 1 })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )

  const renderCard = (video, index) => {
    const thumb = getFullUrl(video.thumbnail_url)
    const label = video.title || 'بدون عنوان'
    const cardKind = viewMeta.card
    return (
      <button
        key={video.id}
        type="button"
        className={`${styles.card} ${styles[`card_${cardKind}`] || ''}`}
        onClick={() => openViewer(index)}
        aria-label={label}
      >
        <span className={styles.thumb}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" loading="lazy" />
          ) : (
            <span className={styles.thumbFallback}>
              <VideoIcon size={28} />
            </span>
          )}
          <span className={styles.playBadge} aria-hidden>
            <Play size={cardKind === 'list' ? 18 : 14} fill="currentColor" />
          </span>
        </span>
        <span className={styles.body}>
          <span className={styles.cardTitle}>{label}</span>
          <span className={styles.views}>
            <Eye size={12} />
            {(video.views || 0).toLocaleString('fa-IR')} بازدید
          </span>
        </span>
      </button>
    )
  }

  return (
    <>
      <div className={newsStyles.nlShell}>
        <div className={newsStyles.nlLayout}>
          <div className={newsStyles.nlAsideDesktop}>{filtersPanel}</div>

          <main className={newsStyles.nlMain}>
            <header className={newsStyles.nlToolbar}>
              <div className={newsStyles.nlToolbarStart}>
                <h1 className={newsStyles.nlTitle}>
                  <Film size={22} aria-hidden />
                  آرشیو ویدیو
                </h1>
                <span className={newsStyles.nlCount}>
                  {loading
                    ? '…'
                    : `${totalCount.toLocaleString('fa-IR')} ویدیو`}
                </span>
              </div>

              <div className={newsStyles.nlToolbarEnd}>
                <button
                  type="button"
                  className={newsStyles.nlMobileFilterBtn}
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal size={16} />
                  فیلتر
                  {activeFilterCount > 0 ? <em>{activeFilterCount}</em> : null}
                </button>
                <ViewToggle
                  viewMode={viewMode}
                  onViewChange={handleViewChange}
                />
              </div>
            </header>

            {activeFilterCount > 0 ? (
              <div className={newsStyles.nlChips}>
                {searchTerm ? (
                  <button
                    type="button"
                    className={newsStyles.nlChip}
                    onClick={() => pushFilters({ search: '', page: 1 })}
                  >
                    جستجو: {searchTerm}
                    <X size={12} />
                  </button>
                ) : null}
                {special !== 'all' ? (
                  <button
                    type="button"
                    className={newsStyles.nlChip}
                    onClick={() => pushFilters({ special: 'all', page: 1 })}
                  >
                    {SPECIAL_TABS.find((t) => t.id === special)?.label ||
                      special}
                    <X size={12} />
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className={newsStyles.nlQuickTabs} role="tablist">
              {SPECIAL_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={special === id}
                  className={`${newsStyles.nlQuickTab} ${
                    special === id ? newsStyles.nlQuickTabOn : ''
                  }`}
                  onClick={() => pushFilters({ special: id, page: 1 })}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {error && !loading ? (
              <div className={newsStyles.errorState}>
                <AlertTriangle className={newsStyles.errorIcon} size={36} />
                <h3>خطا در دریافت محتوا</h3>
                <p>{error}</p>
                <button
                  type="button"
                  className={newsStyles.errorBtn}
                  onClick={fetchVideos}
                >
                  تلاش مجدد
                </button>
              </div>
            ) : null}

            {!error && loading ? (
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : null}

            {!error && !loading && videos.length === 0 ? (
              <div className={newsStyles.emptyState}>
                <Film className={newsStyles.emptyIcon} size={48} />
                <h3>هیچ ویدیویی یافت نشد</h3>
                <p>فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید</p>
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    className={newsStyles.emptyBtn}
                    onClick={handleClearAll}
                  >
                    پاک کردن فیلترها
                  </button>
                ) : null}
              </div>
            ) : null}

            {!error && !loading && videos.length > 0 ? (
              <>
                <div
                  className={`${newsStyles.newsGrid} ${gridClass} ${
                    viewMode === 'list' ? newsStyles.nlViewList : ''
                  } ${
                    viewMode === 'image-left' ? newsStyles.nlViewSplit : ''
                  } ${styles.videoGrid}`}
                >
                  {videos.map((video, index) => renderCard(video, index))}
                </div>

                {totalPages > 1 ? (
                  <div className={newsStyles.nlPaginationWrap}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => pushFilters({ page })}
                      variant="pills"
                    />
                    <p className={newsStyles.nlPageHint}>
                      صفحه {currentPage.toLocaleString('fa-IR')} از{' '}
                      {totalPages.toLocaleString('fa-IR')}
                      <span aria-hidden> · </span>
                      هر صفحه {LIMIT} ویدیو
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
          </main>
        </div>

        {mobileFiltersOpen ? (
          <div className={newsStyles.nlSheet} role="dialog" aria-modal="true">
            <button
              type="button"
              className={newsStyles.nlSheetBackdrop}
              aria-label="بستن"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className={newsStyles.nlSheetPanel}>
              <div className={newsStyles.nlSheetHead}>
                <strong>فیلتر ویدیو</strong>
                <button
                  type="button"
                  className={newsStyles.nlSheetClose}
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="بستن"
                >
                  <X size={18} />
                </button>
              </div>
              <div className={newsStyles.nlSheetBody}>{filtersPanel}</div>
              <div className={newsStyles.nlSheetFoot}>
                <button
                  type="button"
                  className={newsStyles.nlSheetApply}
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  مشاهده {totalCount.toLocaleString('fa-IR')} نتیجه
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

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
                {activeVideo.title || 'بدون عنوان'}
              </span>
              <div className={styles.viewerActions}>
                <button
                  type="button"
                  className={styles.viewerBtn}
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  type="button"
                  className={styles.viewerBtn}
                  onClick={closeViewer}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className={styles.viewerStage} onClick={togglePlay}>
              <video
                ref={videoRef}
                className={styles.viewerVideo}
                src={getFullUrl(activeVideo.video_url)}
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
                  <ChevronRight size={18} />
                </button>
                <span>
                  {activeIndex + 1} / {videos.length}
                </span>
                <button type="button" onClick={goNext}>
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
