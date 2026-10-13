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
import FilterDialog, {
  FilterSelectTrigger,
} from '../FilterDialog/FilterDialog'
import styles from './FiltersSection.module.css'

const SORT_OPTIONS = [
  { id: '-created_at', name: 'جدیدترین' },
  { id: 'created_at', name: 'قدیمی‌ترین' },
  { id: '-min_salary', name: 'بیشترین حقوق' },
  { id: 'min_salary', name: 'کمترین حقوق' },
  { id: '-views_count', name: 'پربازدیدترین' },
]

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
  const [picker, setPicker] = useState(null)

  useEffect(() => {
    setSearchValue(filters.q || '')
  }, [filters.q])

  useEffect(() => {
    if (!sheetOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen])

  useEffect(() => {
    if (!sheetOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && !picker) setSheetOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen, picker])

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

  const openPicker = ({
    key,
    title,
    options,
    value,
    emptyLabel,
    onPick,
    showEmpty = true,
  }) => {
    setPicker({
      key,
      title,
      options: options || [],
      value: value ?? '',
      emptyLabel: emptyLabel || 'همه',
      showEmpty,
      onPick,
    })
  }

  const closePicker = () => setPicker(null)

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

  const provinceName = nameOf(allProvinces, filters.province)
  const cityName = nameOf(availableCities, filters.city)
  const neighborhoodName = nameOf(availableNeighborhoods, filters.neighborhood)
  const coopName = nameOf(filterOptions?.cooperation_types, filters.cooperationType)
  const jobTitleName = nameOf(filterOptions?.job_titles, filters.jobTitle)
  const categoryName = nameOf(filterOptions?.categories, filters.category)
  const sortName = nameOf(SORT_OPTIONS, sortBy) || 'جدیدترین'

  const filtersBody = (
    <>
      <section className={styles.block}>
        <h4 className={styles.blockTitle}>
          <MapPin size={14} />
          موقعیت مکانی
        </h4>
        <div className={styles.cascadingFilters}>
          <FilterSelectTrigger
            label="استان"
            displayValue={provinceName}
            placeholder={optionsLoading ? 'در حال بارگذاری…' : 'همه استان‌ها'}
            disabled={optionsLoading}
            onClick={() =>
              openPicker({
                key: 'province',
                title: 'انتخاب استان',
                options: allProvinces,
                value: filters.province,
                emptyLabel: 'همه استان‌ها',
                onPick: (v) => onFilterChange('province', v),
              })
            }
          />

          <FilterSelectTrigger
            label="شهر"
            icon={Building2}
            displayValue={cityName}
            placeholder={
              !filters.province ? 'اول استان را انتخاب کنید' : 'همه شهرها'
            }
            disabled={!filters.province || optionsLoading}
            onClick={() =>
              openPicker({
                key: 'city',
                title: 'انتخاب شهر',
                options: availableCities,
                value: filters.city,
                emptyLabel: 'همه شهرها',
                onPick: (v) => onFilterChange('city', v),
              })
            }
          />

          <FilterSelectTrigger
            label="محله"
            displayValue={neighborhoodName}
            placeholder={
              !filters.city ? 'اول شهر را انتخاب کنید' : 'همه محله‌ها'
            }
            disabled={!filters.city || optionsLoading}
            onClick={() =>
              openPicker({
                key: 'neighborhood',
                title: 'انتخاب محله',
                options: availableNeighborhoods,
                value: filters.neighborhood,
                emptyLabel: 'همه محله‌ها',
                onPick: (v) => onFilterChange('neighborhood', v),
              })
            }
          />
        </div>
      </section>

      <section className={styles.block}>
        <h4 className={styles.blockTitle}>
          <Briefcase size={14} />
          جزئیات شغلی
        </h4>
        <div className={styles.filtersList}>
          <FilterSelectTrigger
            label="نوع همکاری"
            displayValue={coopName}
            placeholder="همه"
            onClick={() =>
              openPicker({
                key: 'cooperationType',
                title: 'نوع همکاری',
                options: filterOptions?.cooperation_types || [],
                value: filters.cooperationType,
                emptyLabel: 'همه انواع همکاری',
                onPick: (v) => onFilterChange('cooperationType', v),
              })
            }
          />

          <FilterSelectTrigger
            label="عنوان شغلی"
            displayValue={jobTitleName}
            placeholder="همه"
            onClick={() =>
              openPicker({
                key: 'jobTitle',
                title: 'عنوان شغلی',
                options: filterOptions?.job_titles || [],
                value: filters.jobTitle,
                emptyLabel: 'همه عناوین',
                onPick: (v) => onFilterChange('jobTitle', v),
              })
            }
          />

          <FilterSelectTrigger
            label="دسته‌بندی"
            icon={Layers}
            displayValue={categoryName}
            placeholder="همه"
            onClick={() =>
              openPicker({
                key: 'category',
                title: 'دسته‌بندی',
                options: filterOptions?.categories || [],
                value: filters.category,
                emptyLabel: 'همه دسته‌ها',
                onPick: (v) => onFilterChange('category', v),
              })
            }
          />
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
        <FilterSelectTrigger
          displayValue={sortName}
          placeholder="مرتب‌سازی"
          onClick={() =>
            openPicker({
              key: 'sort',
              title: 'مرتب‌سازی',
              options: SORT_OPTIONS,
              value: sortBy || '-created_at',
              showEmpty: false,
              onPick: (v) => onSortChange(v || '-created_at'),
            })
          }
        />
      </section>
    </>
  )

  return (
    <>
      <div className={styles.filtersSection}>
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

        <div className={styles.desktopFilters}>{filtersBody}</div>
      </div>

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

      <FilterDialog
        isOpen={!!picker}
        title={picker?.title || ''}
        options={picker?.options || []}
        value={picker?.value ?? ''}
        emptyLabel={picker?.emptyLabel}
        showEmpty={picker?.showEmpty !== false}
        loading={
          optionsLoading &&
          ['province', 'city', 'neighborhood'].includes(picker?.key)
        }
        onChange={(v) => {
          picker?.onPick?.(v)
        }}
        onClose={closePicker}
      />
    </>
  )
}

export default FiltersSection
