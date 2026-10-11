// components/AllBoxItem/components/FiltersSection/FiltersSection.jsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Filter,
  Search,
  X,
  MapPin,
  Building2,
  Briefcase,
  Layers,
  BadgeCheck,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
} from 'lucide-react'
import styles from './FiltersSection.module.css'

const FiltersSection = ({
  filters,
  availableCities,
  availableNeighborhoods,
  allProvinces,
  filterOptions,
  optionsLoading,
  activeFilterCount,
  onFilterChange,
  onClearAll,
  onVerifiedToggle,
  onFeatureToggle,
  onSortChange,
  onSearchSubmit,
  sortBy,
}) => {
  const [searchValue, setSearchValue] = useState(filters.q || '')
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    setSearchValue(filters.q || '')
  }, [filters.q])

  useEffect(() => {
    if (!sheetOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setSheetOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen])

  // اگر به دسکتاپ رسیدیم دیالوگ بسته شود
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(min-width: 901px)')
    const onChange = () => {
      if (mq.matches) setSheetOpen(false)
    }
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearchSubmit(searchValue)
  }

  const nameOf = (list, id) => list?.find((o) => String(o.id) === String(id))?.name

  const activeChips = useMemo(() => {
    const chips = []
    if (filters.q) chips.push({ key: 'q', label: `جستجو: ${filters.q}` })
    if (filters.province) {
      chips.push({
        key: 'province',
        label: nameOf(allProvinces, filters.province) || 'استان',
      })
    }
    if (filters.city) {
      chips.push({
        key: 'city',
        label: nameOf(availableCities, filters.city) || 'شهر',
      })
    }
    if (filters.neighborhood) {
      chips.push({
        key: 'neighborhood',
        label: nameOf(availableNeighborhoods, filters.neighborhood) || 'محله',
      })
    }
    if (filters.cooperationType) {
      chips.push({
        key: 'cooperationType',
        label: nameOf(filterOptions?.cooperation_types, filters.cooperationType) || 'همکاری',
      })
    }
    if (filters.jobTitle) {
      chips.push({
        key: 'jobTitle',
        label: nameOf(filterOptions?.job_titles, filters.jobTitle) || 'عنوان',
      })
    }
    if (filters.category) {
      chips.push({
        key: 'category',
        label: nameOf(filterOptions?.categories, filters.category) || 'دسته',
      })
    }
    if (filters.isVerified) chips.push({ key: 'isVerified', label: 'تاییدشده' })
    ;(filters.features || []).forEach((fid) => {
      chips.push({
        key: `feature:${fid}`,
        label: nameOf(filterOptions?.features, fid) || 'مزیت',
        featureId: fid,
      })
    })
    return chips
  }, [
    filters,
    allProvinces,
    availableCities,
    availableNeighborhoods,
    filterOptions,
  ])

  // روی دکمه موبایل، جستجو را جدا حساب نکن
  const sheetFilterCount = useMemo(
    () => activeChips.filter((c) => c.key !== 'q').length,
    [activeChips]
  )

  const clearChip = (chip) => {
    if (chip.key === 'isVerified') {
      onVerifiedToggle(false)
      return
    }
    if (chip.key.startsWith('feature:')) {
      onFeatureToggle(chip.featureId)
      return
    }
    if (chip.key === 'q') {
      setSearchValue('')
      onSearchSubmit('')
      return
    }
    onFilterChange(chip.key, '')
  }

  const renderChips = (className) => {
    if (!activeChips.length) return null
    return (
      <div className={className || styles.activeChips} aria-label="فیلترهای فعال">
        {activeChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={styles.activeChip}
            onClick={() => clearChip(chip)}
            title="حذف فیلتر"
          >
            <span>{chip.label}</span>
            <X size={12} />
          </button>
        ))}
      </div>
    )
  }

  const filtersBody = (
    <>
      <section className={styles.block}>
        <h4 className={styles.blockTitle}>
          <MapPin size={14} />
          موقعیت مکانی
        </h4>
        <div className={styles.cascadingFilters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterGroupLabel}>استان</label>
            <select
              value={filters.province}
              onChange={(e) => onFilterChange('province', e.target.value)}
              className={styles.filterSelect}
              disabled={optionsLoading}
            >
              <option value="">همه استان‌ها</option>
              {allProvinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterGroupLabel}>
              <Building2 size={12} />
              شهر
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value)}
              className={styles.filterSelect}
              disabled={!filters.province || optionsLoading}
            >
              <option value="">
                {!filters.province ? 'اول استان را انتخاب کنید' : 'همه شهرها'}
              </option>
              {availableCities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterGroupLabel}>محله</label>
            <select
              value={filters.neighborhood}
              onChange={(e) => onFilterChange('neighborhood', e.target.value)}
              className={styles.filterSelect}
              disabled={!filters.city || optionsLoading}
            >
              <option value="">
                {!filters.city ? 'اول شهر را انتخاب کنید' : 'همه محله‌ها'}
              </option>
              {availableNeighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <h4 className={styles.blockTitle}>
          <Briefcase size={14} />
          جزئیات شغلی
        </h4>
        <div className={styles.filtersList}>
          <div className={styles.filterGroup}>
            <label className={styles.filterGroupLabel}>نوع همکاری</label>
            <select
              value={filters.cooperationType}
              onChange={(e) => onFilterChange('cooperationType', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">همه</option>
              {filterOptions?.cooperation_types?.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterGroupLabel}>عنوان شغلی</label>
            <select
              value={filters.jobTitle}
              onChange={(e) => onFilterChange('jobTitle', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">همه</option>
              {filterOptions?.job_titles?.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterGroupLabel}>
              <Layers size={12} />
              دسته‌بندی
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">همه</option>
              {filterOptions?.categories?.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <label className={`${styles.verifiedFilter} ${filters.isVerified ? styles.verifiedOn : ''}`}>
        <span className={styles.checkboxVisual} aria-hidden="true">
          {filters.isVerified ? <BadgeCheck size={14} /> : null}
        </span>
        <input
          type="checkbox"
          checked={!!filters.isVerified}
          onChange={(e) => onVerifiedToggle(e.target.checked)}
          className={styles.srOnly}
        />
        <span className={styles.verifiedText}>فقط شرکت‌های تاییدشده</span>
      </label>

      {filterOptions?.features?.length > 0 && (
        <section className={styles.block}>
          <h4 className={styles.blockTitle}>
            <Sparkles size={14} />
            مزایا و امکانات
          </h4>
          <div className={styles.featuresFilterList}>
            {filterOptions.features.map((feature) => {
              const isActive = (filters.features || []).includes(feature.id)
              return (
                <button
                  key={feature.id}
                  type="button"
                  className={`${styles.featureChip} ${isActive ? styles.featureChipActive : ''}`}
                  onClick={() => onFeatureToggle(feature.id)}
                >
                  {feature.name}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className={`${styles.block} ${styles.sortBlock}`}>
        <h4 className={styles.blockTitle}>
          <ArrowUpDown size={14} />
          مرتب‌سازی
        </h4>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="-created_at">جدیدترین</option>
          <option value="created_at">قدیمی‌ترین</option>
          <option value="-min_salary">بیشترین حقوق</option>
          <option value="min_salary">کمترین حقوق</option>
          <option value="-views_count">پربازدیدترین</option>
        </select>
      </section>
    </>
  )

  return (
    <>
      <div className={styles.filtersSection}>
        {/* هدر کامل — فقط دسکتاپ */}
        <div className={styles.desktopOnly}>
          <div className={styles.filtersHeader}>
            <h3 className={styles.filtersTitle}>
              <span className={styles.titleIcon}>
                <Filter size={15} />
              </span>
              <span>فیلترها</span>
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </h3>
            {activeFilterCount > 0 && (
              <button type="button" className={styles.clearAllBtn} onClick={onClearAll}>
                <X size={13} />
                پاک کردن
              </button>
            )}
          </div>
          {renderChips()}
        </div>

        {/* جستجو — همیشه */}
        <form onSubmit={handleSubmit} className={styles.searchFilterForm}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="جستجو در آگهی‌ها..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.searchFilterInput}
              enterKeyHint="search"
            />
            {searchValue ? (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => {
                  setSearchValue('')
                  onSearchSubmit('')
                }}
                aria-label="پاک کردن جستجو"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          <button type="submit" className={styles.searchFilterBtn} aria-label="جستجو">
            <Search size={16} />
          </button>
        </form>

        {/* دکمه باز کردن فیلترها — فقط موبایل */}
        <button
          type="button"
          className={styles.mobileOpenBtn}
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal size={16} />
          <span>فیلترها و مرتب‌سازی</span>
          {sheetFilterCount > 0 && (
            <span className={styles.filterBadge}>{sheetFilterCount}</span>
          )}
        </button>

        {/* چیپ‌های فشرده موبایل (بدون جستجو) */}
        {sheetFilterCount > 0 && (
          <div className={styles.mobileChipsBar}>
            {activeChips
              .filter((c) => c.key !== 'q')
              .slice(0, 4)
              .map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={styles.activeChip}
                  onClick={() => clearChip(chip)}
                >
                  <span>{chip.label}</span>
                  <X size={12} />
                </button>
              ))}
            {sheetFilterCount > 4 && (
              <button
                type="button"
                className={styles.moreChipsBtn}
                onClick={() => setSheetOpen(true)}
              >
                +{sheetFilterCount - 4}
              </button>
            )}
          </div>
        )}

        {/* بدنه فیلترها — فقط دسکتاپ */}
        <div className={styles.desktopFilters}>{filtersBody}</div>
      </div>

      {/* دیالوگ تمام‌صفحه موبایل */}
      {sheetOpen && (
        <div
          className={styles.sheetOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-sheet-title"
        >
          <div className={styles.sheet}>
            <header className={styles.sheetHeader}>
              <h3 id="filters-sheet-title" className={styles.sheetTitle}>
                <span className={styles.titleIcon}>
                  <Filter size={15} />
                </span>
                فیلترها
                {sheetFilterCount > 0 && (
                  <span className={styles.filterBadge}>{sheetFilterCount}</span>
                )}
              </h3>
              <button
                type="button"
                className={styles.sheetClose}
                onClick={() => setSheetOpen(false)}
                aria-label="بستن"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.sheetBody}>
              {renderChips(styles.sheetChips)}
              {filtersBody}
            </div>

            <footer className={styles.sheetFooter}>
              {sheetFilterCount > 0 ? (
                <button
                  type="button"
                  className={styles.sheetClearBtn}
                  onClick={onClearAll}
                >
                  <X size={15} />
                  پاک کردن
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className={styles.sheetApplyBtn}
                onClick={() => setSheetOpen(false)}
              >
                <Check size={16} />
                مشاهده نتایج
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}

export default FiltersSection
