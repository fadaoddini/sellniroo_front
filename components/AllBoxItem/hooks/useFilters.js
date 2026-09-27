// src/components/AllBoxItem/hooks/useFilters.js
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import jobisellApi from '@/services/jobisellApi';

// ============================================
// ✅ مقادیر پیش‌فرض
// ============================================
const DEFAULT_FILTERS = {
  adType: '',
  province: '',
  city: '',
  neighborhood: '',
  cooperationType: '',
  jobTitle: '',
  category: '',
  isVerified: false,
  features: [],
  q: '',
};

export const useFilters = (initialFilters = {}) => {
  const router = useRouter();
  const pathname = usePathname();

  // ============================================
  // ✅ State فیلترها (مقدار اولیه از initialFilters)
  // ============================================
  const [filters, setFilters] = useState(() => ({
    adType: initialFilters.adType || '',
    province: initialFilters.province || '',
    city: initialFilters.city || '',
    neighborhood: initialFilters.neighborhood || '',
    cooperationType: initialFilters.cooperationType || '',
    jobTitle: initialFilters.jobTitle || '',
    category: initialFilters.category || '',
    isVerified: initialFilters.isVerified === true,
    features: Array.isArray(initialFilters.features) ? initialFilters.features : [],
    q: initialFilters.q || '',
  }));

  const [currentPage, setCurrentPage] = useState(
    parseInt(initialFilters.page, 10) || 1
  );
  const [sortBy, setSortBy] = useState(
    initialFilters.ordering || '-created_at'
  );

  // ============================================
  // ✅ داده‌های داینامیک
  // ============================================
  const [allProvinces, setAllProvinces] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // ============================================
  // ✅ آگهی‌ها
  // ============================================
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const abortRef = useRef(null);
  const isFirstRender = useRef(true);

  // ============================================
  // ✅ بارگذاری گزینه‌های فیلتر
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setOptionsLoading(true);
        const data = await jobisellApi.getFilterOptions();
        if (!mounted) return;
        setFilterOptions(data);
        setAllProvinces(data.provinces || []);
        setAllCities(data.cities || []);
        setAllNeighborhoods(data.neighborhoods || []);
      } catch (err) {
        console.error('Error loading filter options:', err);
      } finally {
        if (mounted) setOptionsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ============================================
  // ✅ شهرهای قابل نمایش (آبشاری)
  // ============================================
  const availableCities = useMemo(() => {
    if (!filters.province) return [];
    return allCities.filter(
      (c) => String(c.province) === String(filters.province)
    );
  }, [allCities, filters.province]);

  // ============================================
  // ✅ محله‌های قابل نمایش (آبشاری)
  // ============================================
  const availableNeighborhoods = useMemo(() => {
    if (!filters.city) return [];
    return allNeighborhoods.filter(
      (n) => String(n.city) === String(filters.city)
    );
  }, [allNeighborhoods, filters.city]);

  // ============================================
  // ✅ ساخت Query Params برای API
  // ============================================
  const buildQueryParams = useCallback(() => {
    const params = {
      page: currentPage,
      page_size: 10,
      ordering: sortBy,
    };

    if (filters.adType && filters.adType !== 'all' && filters.adType !== 'همه') {
      params.type = filters.adType;
    }

    if (filters.province) params.province = filters.province;
    if (filters.city) params.city = filters.city;
    if (filters.neighborhood) params.neighborhood = filters.neighborhood;

    if (filters.cooperationType) params.cooperation_type = filters.cooperationType;
    if (filters.jobTitle) params.job_title = filters.jobTitle;
    if (filters.category) params.category = filters.category;

    if (filters.isVerified === true) params.is_verified = true;

    if (Array.isArray(filters.features) && filters.features.length > 0) {
      params.features = filters.features.join(',');
    }

    if (filters.q && filters.q.trim()) {
      params.q = filters.q.trim();
    }

    return params;
  }, [filters, currentPage, sortBy]);

  // ============================================
  // ✅ دریافت آگهی‌ها (Debounced)
  // ============================================
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setJobsLoading(true);
        setJobsError(null);

        const params = buildQueryParams();
        const data = await jobisellApi.getJobs(params);

        const results = data.results || data;
        setFilteredJobs(Array.isArray(results) ? results : []);
        setTotalCount(data.count ?? (Array.isArray(results) ? results.length : 0));
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error fetching jobs:', err);
          setJobsError(err);
          setFilteredJobs([]);
        }
      } finally {
        setJobsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [buildQueryParams]);

  // ============================================
  // ✅ Sync با URL (push در هر تغییر)
  // ============================================
  useEffect(() => {
    // ✅ اولین رندر را skip کن (چون خودمان از URL خوانده‌ایم)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();

    if (filters.q) params.set('q', filters.q);
    if (filters.province) params.set('province', filters.province);
    if (filters.city) params.set('city', filters.city);
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
    if (filters.adType) params.set('type', filters.adType);
    if (filters.cooperationType) params.set('cooperation_type', filters.cooperationType);
    if (filters.jobTitle) params.set('job_title', filters.jobTitle);
    if (filters.category) params.set('category', filters.category);
    if (filters.isVerified) params.set('is_verified', 'true');
    if (filters.features?.length) params.set('features', filters.features.join(','));
    if (sortBy && sortBy !== '-created_at') params.set('ordering', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));

    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;

    // ✅ از window.location.search برای مقایسه استفاده کن (به‌جای searchParams)
    // چون searchParams ممکن است stale باشد و باعث loop شود
    const currentUrl = pathname + (window.location.search || '');

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    filters.q,
    filters.province,
    filters.city,
    filters.neighborhood,
    filters.adType,
    filters.cooperationType,
    filters.jobTitle,
    filters.category,
    filters.isVerified,
    filters.features,
    sortBy,
    currentPage,
    pathname,
    router,
  ]);

  // ============================================
  // ✅ updateFilter (منطق آبشاری)
  // ============================================
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      // آبشاری
      if (key === 'province') {
        next.city = '';
        next.neighborhood = '';
      }
      if (key === 'city') {
        next.neighborhood = '';
      }

      return next;
    });
    setCurrentPage(1);
  }, []);

  // ============================================
  // ✅ clearFilter (حذف یک فیلتر)
  // ============================================
  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const next = { ...prev };

      if (key === 'isVerified') {
        next.isVerified = false;
      } else if (key === 'features') {
        next.features = [];
      } else {
        next[key] = '';
      }

      // آبشاری
      if (key === 'province') {
        next.city = '';
        next.neighborhood = '';
      }
      if (key === 'city') {
        next.neighborhood = '';
      }

      return next;
    });
    setCurrentPage(1);
  }, []);

  // ============================================
  // ✅ clearAllFilters
  // ============================================
  const clearAllFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setSortBy('-created_at');
    setCurrentPage(1);
  }, []);

  // ============================================
  // ✅ تعداد فیلترهای فعال
  // ============================================
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.adType) count++;
    if (filters.province) count++;
    if (filters.city) count++;
    if (filters.neighborhood) count++;
    if (filters.cooperationType) count++;
    if (filters.jobTitle) count++;
    if (filters.category) count++;
    if (filters.isVerified) count++;
    if (Array.isArray(filters.features) && filters.features.length) {
      count += filters.features.length;
    }
    if (filters.q) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filterOptions,
    optionsLoading,
    availableCities,
    availableNeighborhoods,
    allProvinces,
    filteredJobs,
    jobsLoading,
    jobsError,
    totalCount,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    updateFilter,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
  };
};