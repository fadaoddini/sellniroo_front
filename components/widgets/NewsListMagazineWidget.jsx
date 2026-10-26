// components/widgets/NewsListMagazineWidget.jsx
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBriefcase,
  faClock,
  faExclamationTriangle,
  faNewspaper,
  faSearch,
  faTags,
} from '@fortawesome/free-solid-svg-icons'
import newsService from '@/services/newsService'
import MagazineNewsCard from '@/components/News/MagazineNewsCard'
import NewsSkeleton from '@/components/News/NewsSkeleton'
import Pagination from '@/components/News/Pagination'
import {
  magazineCardCssVars,
  normalizeNewsMagazineSettings,
} from '@/config/newsWidgetSettings'
import styles from '@/components/News/News.module.css'

function flattenCategories(nodes, depth = 0, out = []) {
  ;(nodes || []).forEach((n) => {
    if (!n?.slug) return
    out.push({
      slug: n.slug,
      name: `${depth ? `${'— '.repeat(depth)}` : ''}${n.name}`,
      news_count: n.news_count,
    })
    if (Array.isArray(n.children) && n.children.length) {
      flattenCategories(n.children, depth + 1, out)
    }
  })
  return out
}

const COL_CLASS = {
  1: styles.newsGridCols1,
  2: styles.newsGridCols2,
  3: styles.newsGridCols3,
  4: styles.newsGridCols4,
}

export default function NewsListMagazineWidget({ settings: rawSettings } = {}) {
  const settings = normalizeNewsMagazineSettings(rawSettings)
  const rootRef = useRef(null)

  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(
    settings.category_slug || 'all'
  )
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const perPage = settings.per_page
  const columns = settings.columns
  const cardStyle = settings.card_style
  const paginationStyle = settings.pagination_style
  const paginationPosition = settings.pagination_position

  useEffect(() => {
    setSelectedCategory(settings.category_slug || 'all')
    setCurrentPage(1)
  }, [settings.category_slug])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingCategories(true)
      try {
        const result = await newsService.getCategories()
        if (cancelled) return
        if (result.success) {
          setCategories(flattenCategories(result.data || []))
        }
      } catch {
        if (!cancelled) setCategories([])
      } finally {
        if (!cancelled) setLoadingCategories(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const fetchNews = useCallback(
    async (page, search, category) => {
      setLoading(true)
      setError(null)
      try {
        const result = await newsService.getNews(
          page,
          perPage,
          search,
          category
        )
        if (result.success) {
          setNews(result.data || [])
          setTotalCount(result.total || 0)
          setTotalPages(result.totalPages || 0)
        } else {
          setError(result.error || 'خطا در دریافت محتوا')
          setNews([])
          setTotalPages(0)
          setTotalCount(0)
        }
      } catch {
        setError('خطا در ارتباط با سرور')
        setNews([])
        setTotalPages(0)
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    },
    [perPage]
  )

  useEffect(() => {
    fetchNews(currentPage, searchTerm, selectedCategory)
  }, [currentPage, searchTerm, selectedCategory, fetchNews])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      setSearchTerm(searchInput.trim())
      setCurrentPage(1)
    },
    [searchInput]
  )

  const handleCategoryChange = useCallback((slug) => {
    setSelectedCategory(slug)
    setCurrentPage(1)
  }, [])

  const themeStyle = useMemo(
    () => ({
      '--nlm-ink': settings.ink_color,
      '--nlm-muted': settings.muted_color,
      '--nlm-surface': settings.surface_bg,
      '--nlm-accent': settings.accent_color,
      '--nlm-accent-soft': settings.accent_soft,
      '--nlm-max': `${settings.section_max_width}px`,
      '--ink': settings.ink_color,
      '--muted': settings.muted_color,
      '--primary': settings.accent_color,
      '--primary-dark': settings.accent_color,
      maxWidth: settings.section_max_width,
      ...magazineCardCssVars(settings),
    }),
    [settings]
  )

  const cardOptions = useMemo(
    () => ({
      show_card_image: settings.show_card_image,
      show_card_title: settings.show_card_title,
      show_card_excerpt: settings.show_card_excerpt,
      show_card_date: settings.show_card_date,
      show_card_source: settings.show_card_source,
      show_read_more: settings.show_read_more,
      read_more_text: settings.read_more_text,
      read_more_place: settings.read_more_place,
      read_more_align: settings.read_more_align,
      read_more_as_button: settings.read_more_as_button,
      show_likes: settings.show_likes,
      show_share: settings.show_share,
      share_bale: settings.share_bale,
      share_eitaa: settings.share_eitaa,
      share_rubika: settings.share_rubika,
      share_soroush: settings.share_soroush,
    }),
    [settings]
  )

  const categoryButtons = useMemo(
    () => [{ slug: 'all', name: 'همه' }, ...categories],
    [categories]
  )

  const showPager =
    settings.show_pagination &&
    totalPages > 1 &&
    !loading &&
    !error &&
    news.length > 0

  const renderPager = (key) =>
    showPager ? (
      <Pagination
        key={key}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        variant={paginationStyle}
      />
    ) : null

  const renderBottom =
    showPager &&
    (paginationPosition === 'bottom' || paginationPosition === 'both')
  const renderTop =
    showPager &&
    (paginationPosition === 'top' || paginationPosition === 'both')
  const renderMid = showPager && paginationPosition === 'after_filters'

  const showStats =
    settings.show_stats_bar &&
    (settings.show_total_count || settings.show_page_info)

  return (
    <div
      ref={rootRef}
      className={`${styles.newsContainer} ${
        !settings.show_on_mobile ? styles.nlmHideMobile : ''
      }`}
      style={themeStyle}
      data-nlm="1"
    >
      {(settings.show_title || settings.show_search) && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {settings.show_title ? (
              <h2 className={styles.title}>
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className={styles.headerIcon}
                />
                {settings.title || 'مجله'}
              </h2>
            ) : null}
            {settings.show_total_count && !settings.show_stats_bar ? (
              <span className={styles.totalCount}>{totalCount} محتوا</span>
            ) : null}
          </div>
          {settings.show_search ? (
            <div className={styles.headerRight}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="search"
                  placeholder="جستجو در محتوا..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={styles.searchInput}
                />
                <button
                  type="submit"
                  className={styles.searchBtn}
                  aria-label="جستجو"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </form>
            </div>
          ) : null}
        </div>
      )}

      {settings.show_categories ? (
        <div className={styles.categoriesWrapper}>
          <div className={styles.categoriesLabel}>
            <FontAwesomeIcon icon={faTags} />
            <span>دسته‌بندی:</span>
          </div>
          <div className={styles.categoriesList}>
            {loadingCategories
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className={styles.categorySkeleton} />
                ))
              : categoryButtons.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    className={`${styles.categoryBtn} ${
                      selectedCategory === cat.slug ? styles.categoryActive : ''
                    }`}
                    onClick={() => handleCategoryChange(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
          </div>
        </div>
      ) : null}

      {showStats ? (
        <div className={styles.statsBar}>
          {settings.show_total_count ? (
            <div className={styles.statItem}>
              <FontAwesomeIcon icon={faNewspaper} />
              <span>{totalCount}</span>
              <span>محتوا</span>
            </div>
          ) : null}
          {settings.show_page_info ? (
            <div className={styles.statItem}>
              <FontAwesomeIcon icon={faClock} />
              <span>
                صفحه {currentPage} از {Math.max(1, totalPages)}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {renderMid ? (
        <div className={styles.paginationSlotMid}>{renderPager('mid')}</div>
      ) : null}

      {renderTop ? (
        <div className={styles.paginationSlotTop}>{renderPager('top')}</div>
      ) : null}

      {error && !loading ? (
        <div className={styles.errorState}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.errorIcon}
          />
          <h3>خطا در دریافت محتوا</h3>
          <p>{error}</p>
          <button
            type="button"
            className={styles.errorBtn}
            onClick={() =>
              fetchNews(currentPage, searchTerm, selectedCategory)
            }
          >
            تلاش مجدد
          </button>
        </div>
      ) : null}

      {!error && loading ? (
        <NewsSkeleton
          count={Math.min(perPage, Math.max(columns * 2, columns))}
          columns={columns}
        />
      ) : null}

      {!error && !loading && news.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faNewspaper} className={styles.emptyIcon} />
          <h3>هیچ محتوایی یافت نشد</h3>
          <p>با تغییر دسته یا جستجو دوباره امتحان کنید</p>
        </div>
      ) : null}

      {!error && !loading && news.length > 0 ? (
        <>
          <div
            className={`${styles.newsGrid} ${COL_CLASS[columns] || COL_CLASS[3]}`}
          >
            {news.map((item, index) => (
              <MagazineNewsCard
                key={item.slug || item.id || index}
                news={item}
                index={index}
                variant={cardStyle}
                options={cardOptions}
              />
            ))}
          </div>
          {renderBottom ? renderPager('bottom') : null}
        </>
      ) : null}
    </div>
  )
}
