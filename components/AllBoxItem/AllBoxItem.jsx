// src/components/AllBoxItem/AllBoxItem.jsx

'use client'

import React, { useState, useMemo } from 'react'
import { Briefcase } from 'lucide-react'
import { useFilters } from './hooks/useFilters'
import FiltersSection from './components/FiltersSection/FiltersSection'
import JobListings from './components/JobListings/JobListings'
import ViewToggle from './components/ViewToggle/ViewToggle'
import AdTypeTabs from './components/AdTypeTabs/AdTypeTabs'
import styles from './AllBoxItem.module.css'

const AllBoxItem = ({ initialFilters = {} }) => {
  const [viewMode, setViewMode] = useState('grid-2')

  const [activeTab, setActiveTab] = useState(() => {
    if (initialFilters.adType === 'hiring') return 'hiring'
    if (initialFilters.adType === 'seeking') return 'seeking'
    return 'all'
  })

  const {
    filters,
    filterOptions,
    optionsLoading,
    activeFilterCount,
    availableCities,
    availableNeighborhoods,
    allProvinces,
    filteredJobs,
    jobsLoading,
    isLoadingMore,
    jobsError,
    totalCount,
    hasMore,
    loadMore,
    sortBy,
    setSortBy,
    updateFilter,
    clearFilter,
    clearAllFilters,
  } = useFilters(initialFilters)

  // وقتی تب از API فیلتر شده، لیست همان است؛ برای all همه را نشان بده
  const visibleJobs = useMemo(() => {
    if (activeTab === 'all') return filteredJobs
    return filteredJobs.filter((job) => job.type === activeTab)
  }, [filteredJobs, activeTab])

  const hiringCount = useMemo(
    () => filteredJobs.filter((job) => job.type === 'hiring').length,
    [filteredJobs]
  )

  const seekingCount = useMemo(
    () => filteredJobs.filter((job) => job.type === 'seeking').length,
    [filteredJobs]
  )

  const handleFilterChange = (key, value) => {
    updateFilter(key, value)
  }

  const handleFilterClear = (key) => {
    clearFilter(key)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'hiring') updateFilter('adType', 'hiring')
    else if (tabId === 'seeking') updateFilter('adType', 'seeking')
    else updateFilter('adType', '')
  }

  const handleSortChange = (value) => {
    setSortBy(value)
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
  }

  const handleClearAll = () => {
    clearAllFilters()
    setActiveTab('all')
  }

  return (
    <div className={styles.allBoxItem}>
      <div className={styles.container}>
        <aside className={styles.filtersAside} aria-label="فیلترهای آگهی">
          <div className={styles.filtersSticky}>
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
          </div>
        </aside>

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
                  : jobsLoading
                    ? 'در حال بارگذاری...'
                    : '۰ آگهی'}
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
            jobs={visibleJobs}
            totalItems={totalCount}
            viewMode={viewMode}
            loading={jobsLoading}
            loadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            error={jobsError}
          >
            {!jobsLoading && visibleJobs.length === 0 && (
              <button
                className={styles.emptyResetBtn}
                onClick={handleClearAll}
                type="button"
              >
                حذف همه فیلترها
              </button>
            )}
          </JobListings>
        </div>
      </div>
    </div>
  )
}

export default AllBoxItem
