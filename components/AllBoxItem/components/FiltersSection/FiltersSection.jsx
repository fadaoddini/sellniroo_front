// src/components/AllBoxItem/components/FiltersSection/FiltersSection.jsx
'use client';

import React, { useState } from 'react';
import {
  Filter, Search, X, MapPin, Building2,
  Briefcase, Users, ChevronDown
} from 'lucide-react';
import styles from './FiltersSection.module.css';

const FiltersSection = ({
  filters,
  availableCities,
  availableNeighborhoods,
  allProvinces,
  filterOptions,
  optionsLoading,
  activeFilterCount,
  onFilterChange,     // ✅ جدید: تغییر مستقیم فیلتر
  onClearAll,
  onVerifiedToggle,
  onFeatureToggle,
  onSortChange,
  onSearchSubmit,
  sortBy,
}) => {
  const [searchValue, setSearchValue] = useState(filters.q || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchValue);
  };

  // ✅ هندل تغییر استان
  const handleProvinceChange = (e) => {
    onFilterChange('province', e.target.value);
  };

  // ✅ هندل تغییر شهر
  const handleCityChange = (e) => {
    onFilterChange('city', e.target.value);
  };

  // ✅ هندل تغییر محله
  const handleNeighborhoodChange = (e) => {
    onFilterChange('neighborhood', e.target.value);
  };

  // سایر فیلترها
  const handleCooperationChange = (e) => {
    onFilterChange('cooperationType', e.target.value);
  };

  const handleJobTitleChange = (e) => {
    onFilterChange('jobTitle', e.target.value);
  };

  const handleCategoryChange = (e) => {
    onFilterChange('category', e.target.value);
  };

  return (
    <div className={styles.filtersSection}>
      {/* هدر */}
      <div className={styles.filtersHeader}>
        <h3 className={styles.filtersTitle}>
          <Filter size={18} />
          <span>فیلترها</span>
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button className={styles.clearAllBtn} onClick={onClearAll}>
            <X size={14} />
            حذف همه
          </button>
        )}
      </div>

      {/* جستجو */}
      <form onSubmit={handleSubmit} className={styles.searchFilterForm}>
        <input
          type="text"
          placeholder="جستجو در آگهی‌ها..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={styles.searchFilterInput}
        />
        <button type="submit" className={styles.searchFilterBtn}>
          <Search size={18} />
        </button>
      </form>

      {/* ============================================
          ✅ فیلترهای آبشاری: استان → شهر → محله
          ============================================ */}
      <div className={styles.cascadingFilters}>
        {/* استان */}
        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel}>
            <MapPin size={14} />
            استان
          </label>
          <select
            value={filters.province}
            onChange={handleProvinceChange}
            className={styles.filterSelect}
            disabled={optionsLoading}
          >
            <option value="">همه استان‌ها</option>
            {allProvinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* شهر — فقط اگر استان انتخاب شده */}
        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel}>
            <Building2 size={14} />
            شهر
          </label>
          <select
            value={filters.city}
            onChange={handleCityChange}
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

        {/* محله — فقط اگر شهر انتخاب شده */}
        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel}>
            <MapPin size={14} />
            محله
          </label>
          <select
            value={filters.neighborhood}
            onChange={handleNeighborhoodChange}
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

      {/* ============================================
          سایر فیلترها
          ============================================ */}
      <div className={styles.filtersList}>
        {/* نوع همکاری */}
        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel}>نوع همکاری</label>
          <select
            value={filters.cooperationType}
            onChange={handleCooperationChange}
            className={styles.filterSelect}
          >
            <option value="">همه</option>
            {filterOptions?.cooperation_types?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        {/* عنوان شغلی */}
        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel}>عنوان شغلی</label>
          <select
            value={filters.jobTitle}
            onChange={handleJobTitleChange}
            className={styles.filterSelect}
          >
            <option value="">همه</option>
            {filterOptions?.job_titles?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        {/* دسته‌بندی */}
        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel}>دسته‌بندی</label>
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className={styles.filterSelect}
          >
            <option value="">همه</option>
            {filterOptions?.categories?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* تاییدیه */}
      <div className={styles.verifiedFilter}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.isVerified}
            onChange={(e) => onVerifiedToggle(e.target.checked)}
          />
          <span>فقط آگهی‌های دارای تاییدیه</span>
        </label>
      </div>

      {/* ویژگی‌ها */}
      {filterOptions?.features?.length > 0 && (
        <div className={styles.featuresFilter}>
          <h4 className={styles.featuresFilterTitle}>مزایا و امکانات</h4>
          <div className={styles.featuresFilterList}>
            {filterOptions.features.map((feature) => {
              const isActive = (filters.features || []).includes(feature.id);
              return (
                <button
                  key={feature.id}
                  className={`${styles.featureChip} ${isActive ? styles.featureChipActive : ''}`}
                  onClick={() => onFeatureToggle(feature.id)}
                >
                  {feature.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* مرتب‌سازی */}
      <div className={styles.sortSection}>
        <label className={styles.sortLabel}>مرتب‌سازی:</label>
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
      </div>
    </div>
  );
};

export default FiltersSection;