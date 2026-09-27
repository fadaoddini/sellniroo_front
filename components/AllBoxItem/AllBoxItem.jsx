// src/components/AllBoxItem/AllBoxItem.jsx

'use client'

import React, { useState, useMemo } from 'react'
import { Briefcase } from 'lucide-react'
import { useFilters } from './hooks/useFilters'
import { usePagination } from './hooks/usePagination'
import FiltersSection from './components/FiltersSection/FiltersSection'
import JobListings from './components/JobListings/JobListings'
import Pagination from './components/Pagination/Pagination'
import ViewToggle from './components/ViewToggle/ViewToggle'
import AdTypeTabs from './components/AdTypeTabs/AdTypeTabs'
import styles from './AllBoxItem.module.css'

const AllBoxItem = ({ initialFilters = {} }) => {
  const ITEMS_PER_PAGE = 10

  // ============================================
  // ✅ State های نمایش
  // ============================================
  const [viewMode, setViewMode] = useState('grid-2')

  // ✅ تب فعال از URL یا 'all'
  const [activeTab, setActiveTab] = useState(() => {
    if (initialFilters.adType === 'hiring') return 'hiring'
    if (initialFilters.adType === 'seeking') return 'seeking'
    return 'all'
  })

  // ============================================
  // ✅ هوک فیلترها (داینامیک از API + آبشاری + URL)
  // ============================================
  const {
    // فیلترها
    filters,
    filterOptions,
    optionsLoading,
    activeFilterCount,

    // ✅ آبشاری
    availableCities,
    availableNeighborhoods,
    allProvinces,

    // آگهی‌ها
    filteredJobs,
    jobsLoading,
    jobsError,
    totalCount,

    // صفحه‌بندی
    currentPage,
    setCurrentPage,

    // مرتب‌سازی
    sortBy,
    setSortBy,

    // توابع
    updateFilter,
    clearFilter,
    clearAllFilters,
  } = useFilters(initialFilters)

  // ============================================
  // ✅ فیلتر بر اساس تب فعال
  // ============================================
  const tabFilteredJobs = useMemo(() => {
    if (activeTab === 'all') return filteredJobs
    return filteredJobs.filter((job) => job.type === activeTab)
  }, [filteredJobs, activeTab])

  // ============================================
  // ✅ صفحه‌بندی
  // ============================================
  const { totalItems, totalPages, currentItems, goToPage } = usePagination(
    tabFilteredJobs,
    ITEMS_PER_PAGE,
    currentPage
  )

  // ============================================
  // ✅ آمار تب‌ها
  // ============================================
  const hiringCount = useMemo(
    () => filteredJobs.filter((job) => job.type === 'hiring').length,
    [filteredJobs]
  )

  const seekingCount = useMemo(
    () => filteredJobs.filter((job) => job.type === 'seeking').length,
    [filteredJobs]
  )

  // ============================================
  // ✅ هندلرها
  // ============================================

  const handleFilterChange = (key, value) => {
    updateFilter(key, value)
  }

  const handleFilterClear = (key) => {
    clearFilter(key)
  }

  // ✅ تغییر تب + به‌روزرسانی URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setCurrentPage(1)

    // اگر تب hiring/seeking است، فیلتر type را ست کن
    if (tabId === 'hiring') {
      updateFilter('adType', 'hiring')
    } else if (tabId === 'seeking') {
      updateFilter('adType', 'seeking')
    } else {
      updateFilter('adType', '')
    }
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleVerifiedToggle = (value) => {
    updateFilter('isVerified', value)
  }

  const handleFeatureToggle = (featureId) => {
    const current = filters.features || []
    const updated = current.includes(featureId)
      ? current.filter((id) => id !== featureId)
      : [...current, featureId]
    updateFilter('features', updated)
  }

  const handleSearchSubmit = (value) => {
    updateFilter('q', value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    goToPage(page, setCurrentPage)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ✅ حذف همه فیلترها + بازگشت تب به all
  const handleClearAll = () => {
    clearAllFilters()
    setActiveTab('all')
  }

  // ============================================
  // ✅ رندر
  // ============================================
  return (
    <div className={styles.allBoxItem}>
      <div className={styles.container}>
        <FiltersSection
          filters={filters}
          filterOptions={filterOptions}
          optionsLoading={optionsLoading}
          activeFilterCount={activeFilterCount}
          allProvinces={allProvinces}
          availableCities={availableCities}
          availableNeighborhoods={availableNeighborhoods}
          sortBy={sortBy}
          onFilterChange={handleFilterChange}
          onFilterClear={handleFilterClear}
          onClearAll={handleClearAll}
          onVerifiedToggle={handleVerifiedToggle}
          onFeatureToggle={handleFeatureToggle}
          onSortChange={handleSortChange}
          onSearchSubmit={handleSearchSubmit}
        />

        <div className={styles.mainContent}>
          <div className={styles.listingsHeader}>
            <div className={styles.listingsTitleWrapper}>
              <h3 className={styles.listingsTitle}>
                <Briefcase size={18} />
                <span>آگهی‌های شغلی</span>
              </h3>
              <span className={styles.listingsCount}>
                {totalCount > 0
                  ? `${totalCount.toLocaleString('fa-IR')} آگهی`
                  : 'در حال بارگذاری...'}
              </span>
            </div>

            <div className={styles.headerControls}>
              <AdTypeTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                hiringCount={hiringCount}
                seekingCount={seekingCount}
              />
              <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          <JobListings
            jobs={currentItems}
            totalItems={totalItems}
            viewMode={viewMode}
            loading={jobsLoading}
            error={jobsError}
          >
            {!jobsLoading && currentItems.length === 0 && (
              <button
                className={styles.emptyResetBtn}
                onClick={handleClearAll}
              >
                حذف همه فیلترها
              </button>
            )}
          </JobListings>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AllBoxItem