// src/components/AllBoxItem/hooks/useFilters.js

import { useState, useMemo } from 'react'
import { featureMap } from '../constants/filterOptions'

export const useFilters = (initialFilters, jobListings) => {
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('newest')

  const filteredJobs = useMemo(() => {
    let result = [...jobListings]

    // فیلتر بر اساس نوع آگهی (از تب‌ها)
    if (filters.adType && filters.adType !== 'همه' && filters.adType !== 'all') {
      const typeMap = {
        'استخدام': 'hiring',
        'کارجو': 'seeking',
        'hiring': 'hiring',
        'seeking': 'seeking'
      }
      const mappedType = typeMap[filters.adType]
      if (mappedType) {
        result = result.filter(job => job.type === mappedType)
      }
    }

    // فیلتر بر اساس محله
    if (filters.neighborhood) {
      result = result.filter(job => job.location.includes(filters.neighborhood))
    }

    // فیلتر بر اساس نوع همکاری
    if (filters.cooperationType) {
      result = result.filter(job => job.cooperationType === filters.cooperationType)
    }

    // فیلتر بر اساس عنوان شغلی
    if (filters.jobTitle) {
      result = result.filter(job => job.title.includes(filters.jobTitle))
    }

    // فیلتر بر اساس تاییدیه
    if (filters.isVerified === true) {
      result = result.filter(job => job.isVerified === true)
    }

    // فیلتر بر اساس ویژگی‌ها (فقط برای آگهی‌های استخدام)
    if (filters.features && Array.isArray(filters.features) && filters.features.length > 0) {
      result = result.filter(job => {
        if (job.type !== 'hiring') return false
        return filters.features.every(feature => {
          const key = featureMap[feature]
          if (!key) return false
          return job[key] === true
        })
      })
    }

    // مرتب‌سازی
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.date.split('/').join('-')) - new Date(a.date.split('/').join('-')))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.date.split('/').join('-')) - new Date(b.date.split('/').join('-')))
        break
      case 'highestSalary':
        result.sort((a, b) => {
          const aSalary = a.maxSalary || a.minSalary || 0
          const bSalary = b.maxSalary || b.minSalary || 0
          return bSalary - aSalary
        })
        break
      case 'lowestSalary':
        result.sort((a, b) => {
          const aSalary = a.minSalary || a.maxSalary || 0
          const bSalary = b.minSalary || b.maxSalary || 0
          return aSalary - bSalary
        })
        break
      default:
        break
    }

    return result
  }, [filters, jobListings, sortBy])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilters({
      adType: '',
      neighborhood: '',
      cooperationType: '',
      jobTitle: '',
      isVerified: false,
      features: []
    })
    setSortBy('newest')
    setCurrentPage(1)
  }

  return {
    filters,
    filteredJobs,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    updateFilter,
    clearAllFilters
  }
}