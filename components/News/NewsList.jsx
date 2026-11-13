// components/News/NewsList.jsx
// لیست اخبار با فیلتر کناری، جستجو، ویژه/فوری، چند حالت نمایش و صفحه‌بندی سبک

'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Newspaper,
  Star,
  Zap,
  Clock,
  Tags,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Loader2,
  AlertTriangle,
  PenLine,
} from 'lucide-react'
import newsService from '@/services/newsService'
import MagazineNewsCard from './MagazineNewsCard'
import NewsSkeleton from './NewsSkeleton'
import Pagination from './Pagination'
import NewsContributeDialog from './NewsContributeDialog'
import ViewToggle from '@/components/AllBoxItem/components/ViewToggle/ViewToggle'
import { useAuth } from '@/contexts/AuthContext'
import styles from './News.module.css'

const LIMIT = 12
const VIEW_STORAGE_KEY = 'sellniroo_news_view_mode'

const NEWS_SORT_OPTIONS = [
  { id: '-publish_date', label: 'جدیدترین' },
  { id: 'publish_date', label: 'قدیمی‌ترین' },
  { id: '-view_count', label: 'پربازدید' },
  { id: '-like_count', label: 'محبوب‌ترین' },
]

const SPECIAL_TABS = [
  { id: 'all', label: 'همه', icon: Newspaper },
  { id: 'featured', label: 'ویژه‌ها', icon: Star },
  { id: 'breaking', label: 'فوری', icon: Zap },
  { id: 'newest', label: 'تازه‌ها', icon: Clock },
]

const VIEW_CARD = {
  'grid-3': { variant: 'classic', cols: 3 },
  'grid-2': { variant: 'framed', cols: 2 },
  /* عکس کنار محتوا — سه ستون افقی */
  'image-left': { variant: 'split', cols: 3 },
  list: { variant: 'editorial', cols: 1 },
}

function readViewMode() {
  if (typeof window === 'undefined') return 'grid-3'
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY)
    if (v && VIEW_CARD[v]) return v
  } catch {
    /* ignore */
  }
  return 'grid-3'
}

function buildQuery({
  page,
  search,
  category,
  special,
  ordering,
}) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (search) params.set('search', search)
  if (category && category !== 'all') params.set('category', category)
  if (special && special !== 'all') params.set('filter', special)
  if (ordering && ordering !== '-publish_date') {
    params.set('ordering', ordering)
  }
  const q = params.toString()
  return q ? `/news?${q}` : '/news'
}

const NewsList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState('grid-3')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [contributeOpen, setContributeOpen] = useState(false)

  const [refreshing, setRefreshing] = useState(false)
  const [refreshStatus, setRefreshStatus] = useState('idle')
  const [refreshMessage, setRefreshMessage] = useState('')

  const isAdmin = user?.is_staff === true || user?.is_superuser === true

  // فیلترها از URL
  const currentPage = Math.max(
    1,
    parseInt(searchParams?.get('page') || '1', 10) || 1
  )
  const searchTerm = searchParams?.get('search') || ''
  const selectedCategory = searchParams?.get('category') || 'all'
  const special =
    searchParams?.get('filter') ||
    (searchParams?.get('featured') === '1' ? 'featured' : 'all')
  const ordering = searchParams?.get('ordering') || '-publish_date'

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
        category:
          patch.category !== undefined ? patch.category : selectedCategory,
        special: patch.special !== undefined ? patch.special : special,
        ordering: patch.ordering !== undefined ? patch.ordering : ordering,
      }
      router.push(buildQuery(next), { scroll: false })
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [router, searchTerm, selectedCategory, special, ordering]
  )

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true)
      const result = await newsService.getCategories()
      if (result.success) setCategories(result.data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let fromDate = undefined
      if (special === 'newest') {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        fromDate = d.toISOString().slice(0, 10)
      }

      const result = await newsService.getNews({
        page: currentPage,
        limit: LIMIT,
        search: searchTerm,
        category: selectedCategory,
        is_featured: special === 'featured',
        is_breaking: special === 'breaking',
        ordering: ordering || '-publish_date',
        from_date: fromDate,
      })

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
    } catch (err) {
      console.error('Fetch error:', err)
      setError('خطا در ارتباط با سرور')
      setNews([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    special,
    ordering,
  ])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (searchTerm) n += 1
    if (selectedCategory !== 'all') n += 1
    if (special !== 'all') n += 1
    if (ordering !== '-publish_date' && special !== 'newest') n += 1
    return n
  }, [searchTerm, selectedCategory, special, ordering])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    pushFilters({ search: searchInput.trim(), page: 1 })
    setMobileFiltersOpen(false)
  }

  const handleClearAll = () => {
    setSearchInput('')
    router.push('/news', { scroll: false })
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

  const handleRefresh = useCallback(async () => {
    if (refreshing || refreshStatus === 'running') return
    setRefreshStatus('running')
    setRefreshing(true)
    setRefreshMessage('در حال بروزرسانی…')
    try {
      const scrapeResult = await newsService.triggerScrape()
      if (!scrapeResult.success) {
        setRefreshStatus('error')
        setRefreshMessage(scrapeResult.error || 'خطا در اسکرپینگ')
        return
      }
      await new Promise((r) => setTimeout(r, 2000))
      const refreshResult = await newsService.refreshNews()
      if (refreshResult.success) {
        await fetchCategories()
        await fetchNews()
        setRefreshStatus('success')
        setRefreshMessage('بروزرسانی انجام شد')
        setTimeout(() => {
          setRefreshStatus('idle')
          setRefreshMessage('')
        }, 3000)
      } else {
        setRefreshStatus('error')
        setRefreshMessage(refreshResult.error || 'خطا')
      }
    } catch {
      setRefreshStatus('error')
      setRefreshMessage('خطا در بروزرسانی')
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, refreshStatus, fetchCategories, fetchNews])

  const viewMeta = VIEW_CARD[viewMode] || VIEW_CARD['grid-3']
  const gridClass =
    viewMeta.cols === 3
      ? styles.newsGridCols3
      : viewMeta.cols === 2
        ? styles.newsGridCols2
        : styles.newsGridCols1

  const cardOptions = {
    show_card_image: true,
    show_card_title: true,
    show_card_excerpt: viewMode === 'grid-2' || viewMode === 'list',
    show_card_date: true,
    show_card_source: viewMode === 'list' || viewMode === 'grid-2',
    show_read_more: true,
    show_likes: viewMode === 'list',
    show_share: false,
    read_more_text: 'ادامه مطلب',
  }

  const filtersPanel = (
    <aside className={styles.nlFilters}>
      <div className={styles.nlFiltersHead}>
        <span className={styles.nlFiltersTitle}>
          <SlidersHorizontal size={16} />
          فیلتر اخبار
        </span>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            className={styles.nlClearBtn}
            onClick={handleClearAll}
          >
            <RotateCcw size={13} />
            پاک کردن
            <em>{activeFilterCount}</em>
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSearchSubmit} className={styles.nlSearchForm}>
        <Search size={16} className={styles.nlSearchIcon} aria-hidden />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="جستجو در اخبار…"
          className={styles.nlSearchInput}
          dir="rtl"
        />
        {searchInput ? (
          <button
            type="button"
            className={styles.nlSearchClear}
            aria-label="پاک کردن جستجو"
            onClick={() => {
              setSearchInput('')
              if (searchTerm) pushFilters({ search: '', page: 1 })
            }}
          >
            <X size={14} />
          </button>
        ) : null}
        <button type="submit" className={styles.nlSearchSubmit}>
          جستجو
        </button>
      </form>

      <div className={styles.nlFilterBlock}>
        <p className={styles.nlFilterLabel}>
          <Star size={14} />
          ویژه و تازه‌ها
        </p>
        <div className={styles.nlSpecialGrid}>
          {SPECIAL_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.nlSpecialBtn} ${
                special === id ? styles.nlSpecialBtnOn : ''
              }`}
              onClick={() => pushFilters({ special: id, page: 1 })}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.nlFilterBlock}>
        <p className={styles.nlFilterLabel}>
          <Tags size={14} />
          دسته‌بندی
        </p>
        <div className={styles.nlCatList}>
          <button
            type="button"
            className={`${styles.nlCatBtn} ${
              selectedCategory === 'all' ? styles.nlCatBtnOn : ''
            }`}
            onClick={() => pushFilters({ category: 'all', page: 1 })}
          >
            همه دسته‌ها
          </button>
          {loadingCategories
            ? [...Array(4)].map((_, i) => (
                <span key={i} className={styles.nlCatSkeleton} />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  className={`${styles.nlCatBtn} ${
                    selectedCategory === cat.slug ? styles.nlCatBtnOn : ''
                  }`}
                  onClick={() =>
                    pushFilters({ category: cat.slug, page: 1 })
                  }
                >
                  {cat.name}
                </button>
              ))}
        </div>
      </div>

      <div className={styles.nlFilterBlock}>
        <p className={styles.nlFilterLabel}>
          <Clock size={14} />
          مرتب‌سازی
        </p>
        <div className={styles.nlSortList}>
          {NEWS_SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`${styles.nlSortBtn} ${
                ordering === opt.id ? styles.nlSortBtnOn : ''
              }`}
              onClick={() =>
                pushFilters({ ordering: opt.id, page: 1 })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isAdmin ? (
        <button
          type="button"
          className={styles.nlAdminRefresh}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 size={15} className={styles.nlSpin} />
          ) : refreshStatus === 'success' ? (
            <Check size={15} />
          ) : (
            <RotateCcw size={15} />
          )}
          {refreshMessage || 'بروزرسانی محتوا'}
        </button>
      ) : null}
    </aside>
  )

  return (
    <div className={styles.nlShell}>
      <div className={styles.nlLayout}>
        <div className={styles.nlAsideDesktop}>{filtersPanel}</div>

        <main className={styles.nlMain}>
          <header className={styles.nlToolbar}>
            <div className={styles.nlToolbarStart}>
              <h1 className={styles.nlTitle}>
                <Newspaper size={22} aria-hidden />
                مجله
              </h1>
              <span className={styles.nlCount}>
                {loading ? '…' : `${totalCount.toLocaleString('fa-IR')} خبر`}
              </span>
            </div>

            <div className={styles.nlToolbarEnd}>
              <button
                type="button"
                className={styles.nlMobileFilterBtn}
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} />
                فیلتر
                {activeFilterCount > 0 ? (
                  <em>{activeFilterCount}</em>
                ) : null}
              </button>
              <ViewToggle
                viewMode={viewMode}
                onViewChange={handleViewChange}
              />
            </div>
          </header>

          <section className={styles.nlContributeBanner}>
            <div className={styles.nlContributeBannerText}>
              <strong>شما هم بنویسید</strong>
              <p>
                مطلب مفید یا خبر جالبی به ذهنتان رسیده؟ با نام خودتان ارسال کنید؛
                بعد از تایید مدیر روی مجله منتشر می‌شود.
              </p>
            </div>
            <button
              type="button"
              className={styles.nlContributeBannerBtn}
              onClick={() => setContributeOpen(true)}
            >
              <PenLine size={16} />
              ارسال مطلب
            </button>
          </section>

          {/* چیپ‌های فعال */}
          {activeFilterCount > 0 ? (
            <div className={styles.nlChips}>
              {searchTerm ? (
                <button
                  type="button"
                  className={styles.nlChip}
                  onClick={() => pushFilters({ search: '', page: 1 })}
                >
                  جستجو: {searchTerm}
                  <X size={12} />
                </button>
              ) : null}
              {selectedCategory !== 'all' ? (
                <button
                  type="button"
                  className={styles.nlChip}
                  onClick={() =>
                    pushFilters({ category: 'all', page: 1 })
                  }
                >
                  {categories.find((c) => c.slug === selectedCategory)
                    ?.name || selectedCategory}
                  <X size={12} />
                </button>
              ) : null}
              {special !== 'all' ? (
                <button
                  type="button"
                  className={styles.nlChip}
                  onClick={() =>
                    pushFilters({ special: 'all', page: 1 })
                  }
                >
                  {SPECIAL_TABS.find((t) => t.id === special)?.label ||
                    special}
                  <X size={12} />
                </button>
              ) : null}
            </div>
          ) : null}

          {/* تب‌های سریع ویژه روی دسکتاپ هم در تولبار */}
          <div className={styles.nlQuickTabs} role="tablist">
            {SPECIAL_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={special === id}
                className={`${styles.nlQuickTab} ${
                  special === id ? styles.nlQuickTabOn : ''
                }`}
                onClick={() => pushFilters({ special: id, page: 1 })}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {error && !loading ? (
            <div className={styles.errorState}>
              <AlertTriangle className={styles.errorIcon} size={36} />
              <h3>خطا در دریافت محتوا</h3>
              <p>{error}</p>
              <button
                type="button"
                className={styles.errorBtn}
                onClick={fetchNews}
              >
                تلاش مجدد
              </button>
            </div>
          ) : null}

          {!error && loading ? <NewsSkeleton count={LIMIT} /> : null}

          {!error && !loading && news.length === 0 ? (
            <div className={styles.emptyState}>
              <Newspaper className={styles.emptyIcon} size={48} />
              <h3>هیچ خبری یافت نشد</h3>
              <p>فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید</p>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  className={styles.emptyBtn}
                  onClick={handleClearAll}
                >
                  پاک کردن فیلترها
                </button>
              ) : null}
            </div>
          ) : null}

          {!error && !loading && news.length > 0 ? (
            <>
              <div
                className={`${styles.newsGrid} ${gridClass} ${
                  viewMode === 'list' ? styles.nlViewList : ''
                } ${
                  viewMode === 'image-left' ? styles.nlViewSplit : ''
                }`}
              >
                {news.map((item, index) => (
                  <MagazineNewsCard
                    key={item.slug || item.id || index}
                    news={item}
                    index={index}
                    variant={viewMeta.variant}
                    options={cardOptions}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className={styles.nlPaginationWrap}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) =>
                      pushFilters({ page })
                    }
                    variant="pills"
                  />
                  <p className={styles.nlPageHint}>
                    صفحه {currentPage.toLocaleString('fa-IR')} از{' '}
                    {totalPages.toLocaleString('fa-IR')}
                    <span aria-hidden> · </span>
                    هر صفحه {LIMIT} خبر
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </main>
      </div>

      <NewsContributeDialog
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
        categories={categories}
      />

      {/* شیت فیلتر موبایل */}
      {mobileFiltersOpen ? (
        <div className={styles.nlSheet} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.nlSheetBackdrop}
            aria-label="بستن"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className={styles.nlSheetPanel}>
            <div className={styles.nlSheetHead}>
              <strong>فیلتر اخبار</strong>
              <button
                type="button"
                className={styles.nlSheetClose}
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.nlSheetBody}>{filtersPanel}</div>
            <div className={styles.nlSheetFoot}>
              <button
                type="button"
                className={styles.nlSheetApply}
                onClick={() => setMobileFiltersOpen(false)}
              >
                مشاهده {totalCount.toLocaleString('fa-IR')} نتیجه
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NewsList
