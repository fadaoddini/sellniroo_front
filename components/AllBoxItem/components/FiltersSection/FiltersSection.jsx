// src/components/AllBoxItem/components/FiltersSection/FiltersSection.jsx

'use client'

import React from 'react'
import { Filter, Search, ChevronDown, Shield, ShieldCheck } from 'lucide-react'
import { filterLabels } from '../../constants/filterOptions'
import styles from './FiltersSection.module.css'

const FiltersSection = ({ 
  filters, 
  onFilterClick, 
  onClearAll,
  onVerifiedToggle,
  onSortChange,
  sortBy 
}) => {
  return (
    <div className={styles.filtersSection}>
      <div className={styles.filtersHeader}>
        <h3 className={styles.filtersTitle}>
          <Filter size={18} />
          <span>فیلترها</span>
        </h3>
        <button 
          className={styles.clearAllBtn}
          onClick={onClearAll}
          aria-label="حذف همه فیلترها"
        >
          حذف همه
        </button>
      </div>

      <div className={styles.filtersList}>
        {Object.keys(filterLabels).map((filterKey) => (
          <div key={filterKey} className={styles.filterItem}>
            <button
              className={`${styles.filterButton} ${filters[filterKey] ? styles.hasValue : ''}`}
              onClick={() => onFilterClick(filterKey)}
              aria-label={`فیلتر ${filterLabels[filterKey]}`}
            >
              <span className={styles.filterLabel}>{filterLabels[filterKey]}</span>
              <span className={styles.filterValue}>
                {filters[filterKey] || 'انتخاب'}
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* فیلتر تاییدیه */}
      <div className={styles.verifiedFilter}>
        <button
          className={`${styles.verifiedBtn} ${filters.isVerified ? styles.active : ''}`}
          onClick={() => onVerifiedToggle(!filters.isVerified)}
        >
          {filters.isVerified ? (
            <>
              <ShieldCheck size={16} />
              <span>دارای تاییدیه</span>
            </>
          ) : (
            <>
              <Shield size={16} />
              <span>نمایش تایید شده‌ها</span>
            </>
          )}
        </button>
      </div>


      <button className={styles.searchFilterBtn}>
        <Search size={18} />
        <span>جستجو</span>
      </button>
    </div>
  )
}

export default FiltersSection