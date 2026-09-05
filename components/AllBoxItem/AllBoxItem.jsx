// src/components/AllBoxItem/AllBoxItem.jsx

'use client'

import React, { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { useFilters } from './hooks/useFilters'
import { usePagination } from './hooks/usePagination'
import { useDialog } from './hooks/useDialog'
import { jobListings } from './constants/jobData'
import FiltersSection from './components/FiltersSection/FiltersSection'
import FilterDialog from './components/FilterDialog/FilterDialog'
import JobListings from './components/JobListings/JobListings'
import Pagination from './components/Pagination/Pagination'
import ViewToggle from './components/ViewToggle/ViewToggle'
import AdTypeTabs from './components/AdTypeTabs/AdTypeTabs'
import styles from './AllBoxItem.module.css'

const AllBoxItem = () => {
  const ITEMS_PER_PAGE = 10

  // State برای نحوه نمایش
  const [viewMode, setViewMode] = useState('grid-2')
  
  // State برای تب فعال
  const [activeTab, setActiveTab] = useState('all')

  // استفاده از هوک‌های سفارشی
  const {
    filters,
    filteredJobs,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    updateFilter,
    clearAllFilters
  } = useFilters(
    { 
      adType: '',
      neighborhood: '',
      cooperationType: '',
      jobTitle: '',
      isVerified: false,
      features: []
    },
    jobListings
  )

  // فیلتر بر اساس تب انتخاب شده
  const getFilteredByTab = () => {
    if (activeTab === 'all') {
      return filteredJobs
    }
    return filteredJobs.filter(job => job.type === activeTab)
  }

  const tabFilteredJobs = getFilteredByTab()

  const {
    totalItems,
    totalPages,
    currentItems,
    goToPage
  } = usePagination(tabFilteredJobs, ITEMS_PER_PAGE, currentPage)

  const {
    isOpen,
    selectedKey,
    tempValue,
    openDialog,
    closeDialog,
    selectOption,
    setTempValue
  } = useDialog()

  // آمار برای تب‌ها
  const hiringCount = filteredJobs.filter(job => job.type === 'hiring').length
  const seekingCount = filteredJobs.filter(job => job.type === 'seeking').length

  const handleFilterClick = (filterKey) => {
    openDialog(filterKey, filters[filterKey] || '')
  }

  const handleConfirm = () => {
    if (selectedKey) {
      updateFilter(selectedKey, tempValue)
    }
    closeDialog()
  }

  const handleClear = () => {
    if (selectedKey) {
      updateFilter(selectedKey, '')
      setTempValue('')
    }
  }

  const handlePageChange = (page) => {
    goToPage(page, setCurrentPage)
  }

  const handleVerifiedToggle = (value) => {
    updateFilter('isVerified', value)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setCurrentPage(1)
  }

  return (
    <div className={styles.allBoxItem}>
      <div className={styles.container}>
        {/* بخش فیلترها */}
        <FiltersSection
          filters={filters}
          onFilterClick={handleFilterClick}
          onClearAll={clearAllFilters}
          onVerifiedToggle={handleVerifiedToggle}
          onSortChange={handleSortChange}
          sortBy={sortBy}
        />

        <div className={styles.mainContent}>
          {/* بخش هدر با تب‌ها */}
          <div className={styles.listingsHeader}>
            <div className={styles.listingsTitleWrapper}>
              <h3 className={styles.listingsTitle}>
                <Briefcase size={18} />
                <span>آگهی‌های شغلی</span>
              </h3>
              <span className={styles.listingsCount}>
                {totalItems} آگهی
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

          {/* بخش آگهی‌ها */}
          <JobListings 
            jobs={currentItems} 
            totalItems={totalItems}
            viewMode={viewMode}
          >
            {currentItems.length === 0 && (
              <button className={styles.emptyResetBtn} onClick={clearAllFilters}>
                حذف همه فیلترها
              </button>
            )}
          </JobListings>

          {/* صفحه‌بندی */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* دیالوگ فیلتر */}
      <FilterDialog
        isOpen={isOpen}
        selectedKey={selectedKey}
        tempValue={tempValue}
        onSelectOption={selectOption}
        onConfirm={handleConfirm}
        onClear={handleClear}
        onClose={closeDialog}
        filters={filters}
      />
    </div>
  )
}

export default AllBoxItem