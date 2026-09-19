// components/newsAdmin/NewsSearch.jsx
'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from '@/styles/modules/NewsManagement.module.css'

const NewsSearch = ({
  searchQuery, setSearchQuery,
  filterStatus, setFilterStatus,
  filterCategory, setFilterCategory,
  filterFeatured, setFilterFeatured,
  categories = [],
}) => {
  const { language } = useLanguage()

  const texts = {
    fa: {
      placeholder: 'جستجو بر اساس عنوان، روتیر یا خلاصه...',
      all: 'همه',
      allCategories: 'همه دسته‌ها',
      status: 'وضعیت',
      category: 'دسته‌بندی',
      featured: 'ویژه',
      draft: 'پیش‌نویس',
      pending: 'در انتظار',
      review: 'در حال بررسی',
      published: 'منتشر شده',
      scheduled: 'زمان‌بندی',
      archived: 'بایگانی',
      rejected: 'رد شده',
      isFeatured: 'خبر ویژه',
      isBreaking: 'خبر فوری',
    },
    en: {
      placeholder: 'Search by title, subtitle or excerpt...',
      all: 'All',
      allCategories: 'All Categories',
      status: 'Status',
      category: 'Category',
      featured: 'Featured',
      draft: 'Draft',
      pending: 'Pending',
      review: 'Review',
      published: 'Published',
      scheduled: 'Scheduled',
      archived: 'Archived',
      rejected: 'Rejected',
      isFeatured: 'Featured',
      isBreaking: 'Breaking',
    }
  }

  const t = texts[language] || texts.fa

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t.placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={16} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{t.status}: {t.all}</option>
            <option value="draft">{t.draft}</option>
            <option value="pending">{t.pending}</option>
            <option value="review">{t.review}</option>
            <option value="published">{t.published}</option>
            <option value="scheduled">{t.scheduled}</option>
            <option value="archived">{t.archived}</option>
            <option value="rejected">{t.rejected}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">{t.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value)}
          >
            <option value="all">{t.featured}: {t.all}</option>
            <option value="featured">{t.isFeatured}</option>
            <option value="breaking">{t.isBreaking}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default NewsSearch