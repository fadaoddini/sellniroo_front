// src/components/AllBoxItem/hooks/useFilters.js
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import jobisellApi from '@/services/jobisellApi';
import {
  DEMO_FILTER_OPTIONS,
  DEMO_JOBS,
  filterDemoJobs,
  paginateDemoJobs,
} from '../constants/demoJobs';

const PAGE_SIZE = 12;

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

const buildFiltersQuery = (filters, sortBy) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.province) params.set('province', String(filters.province));
  if (filters.city) params.set('city', String(filters.city));
  if (filters.neighborhood) params.set('neighborhood', String(filters.neighborhood));
  if (filters.adType) params.set('type', filters.adType);
  if (filters.cooperationType) {
    params.set('cooperation_type', String(filters.cooperationType));
  }
  if (filters.jobTitle) params.set('job_title', String(filters.jobTitle));
  if (filters.category) params.set('category', String(filters.category));
  if (filters.isVerified) params.set('is_verified', 'true');
  if (filters.features?.length) params.set('features', filters.features.join(','));
  if (sortBy && sortBy !== '-created_at') params.set('ordering', sortBy);
  return params.toString();
};

export const useFilters = (initialFilters = {}, options = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const demoMode = !!options.demoMode;
  /** روی صفحهٔ اصلی / ویجت، URL را عوض نکن */
  const syncUrl = options.syncUrl !== false && !demoMode;

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

  const [sortBy, setSortBy] = useState(
    initialFilters.ordering || '-created_at'
  );

  const [allProvinces, setAllProvinces] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const abortRef = useRef(null);
  const isFirstUrlSync = useRef(true);
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const jobsLoadingRef = useRef(true);
  const filtersRef = useRef(filters);
  const sortByRef = useRef(sortBy);

  filtersRef.current = filters;
  sortByRef.current = sortBy;

  const queryKey = useMemo(
    () => buildFiltersQuery(filters, sortBy),
    [filters, sortBy]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setOptionsLoading(true);
        if (demoMode) {
          if (!mounted) return;
          setFilterOptions(DEMO_FILTER_OPTIONS);
          setAllProvinces(DEMO_FILTER_OPTIONS.provinces || []);
          setAllCities(DEMO_FILTER_OPTIONS.cities || []);
          setAllNeighborhoods(DEMO_FILTER_OPTIONS.neighborhoods || []);
          return;
        }
        const data = await jobisellApi.getFilterOptions();
        if (!mounted) return;
        setFilterOptions(data);
        setAllProvinces(data.provinces || []);
        setAllCities(data.cities || []);
        setAllNeighborhoods(data.neighborhoods || []);
      } catch (err) {
        console.error('Error loading filter options:', err);
        if (mounted && demoMode) {
          setFilterOptions(DEMO_FILTER_OPTIONS);
          setAllProvinces(DEMO_FILTER_OPTIONS.provinces || []);
          setAllCities(DEMO_FILTER_OPTIONS.cities || []);
          setAllNeighborhoods(DEMO_FILTER_OPTIONS.neighborhoods || []);
        }
      } finally {
        if (mounted) setOptionsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [demoMode]);

  const availableCities = useMemo(() => {
    if (!filters.province) return [];
    return allCities.filter(
      (c) => String(c.province) === String(filters.province)
    );
  }, [allCities, filters.province]);

  const availableNeighborhoods = useMemo(() => {
    if (!filters.city) return [];
    return allNeighborhoods.filter(
      (n) => String(n.city) === String(filters.city)
    );
  }, [allNeighborhoods, filters.city]);

  const buildQueryParams = useCallback((page = 1) => {
    const f = filtersRef.current;
    const ordering = sortByRef.current;
    const params = {
      page,
      page_size: PAGE_SIZE,
      ordering,
    };

    if (f.adType && f.adType !== 'all' && f.adType !== 'همه') {
      params.type = f.adType;
    }
    if (f.province) params.province = f.province;
    if (f.city) params.city = f.city;
    if (f.neighborhood) params.neighborhood = f.neighborhood;
    if (f.cooperationType) params.cooperation_type = f.cooperationType;
    if (f.jobTitle) params.job_title = f.jobTitle;
    if (f.category) params.category = f.category;
    if (f.isVerified === true) params.is_verified = true;
    if (Array.isArray(f.features) && f.features.length > 0) {
      params.features = f.features.join(',');
    }
    if (f.q && f.q.trim()) params.q = f.q.trim();

    return params;
  }, []);

  const fetchJobs = useCallback(async ({ page = 1, append = false } = {}) => {
    if (!append && abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    if (!append) abortRef.current = controller;

    const reqId = append ? requestIdRef.current : ++requestIdRef.current;

    if (append) {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
    } else {
      jobsLoadingRef.current = true;
      loadingMoreRef.current = false;
      setJobsLoading(true);
      setIsLoadingMore(false);
      setJobsError(null);
    }

    try {
      let data;
      if (demoMode) {
        await new Promise((r) => setTimeout(r, append ? 180 : 280));
        const filtered = filterDemoJobs(
          DEMO_JOBS,
          filtersRef.current,
          sortByRef.current
        );
        data = paginateDemoJobs(filtered, page, PAGE_SIZE);
      } else {
        const params = buildQueryParams(page);
        data = await jobisellApi.getJobs(params);
      }

      if (reqId !== requestIdRef.current) return;

      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      const count =
        typeof data?.count === 'number' ? data.count : null;

      let uniqueAdded = results.length;
      if (!append) {
        setFilteredJobs(results);
      } else {
        setFilteredJobs((prev) => {
          const seen = new Set(prev.map((j) => j.id));
          const merged = [...prev];
          let added = 0;
          results.forEach((job) => {
            if (!seen.has(job.id)) {
              seen.add(job.id);
              merged.push(job);
              added += 1;
            }
          });
          uniqueAdded = added;
          return merged;
        });
      }

      pageRef.current = page;
      if (count != null) setTotalCount(count);
      else if (!append) setTotalCount(results.length);

      let more = false;
      if (results.length === 0) {
        more = false;
      } else if (append && uniqueAdded === 0) {
        // صفحه تکراری → توقف لوپ
        more = false;
      } else if (data?.next) {
        more = true;
      } else if (data?.next === null) {
        more = false;
      } else if (count != null) {
        more = page * PAGE_SIZE < count;
      } else {
        more = results.length >= PAGE_SIZE;
      }

      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      if (reqId !== requestIdRef.current) return;
      console.error('Error fetching jobs:', err);
      if (!append) {
        if (demoMode) {
          const filtered = filterDemoJobs(
            DEMO_JOBS,
            filtersRef.current,
            sortByRef.current
          );
          const data = paginateDemoJobs(filtered, 1, PAGE_SIZE);
          setFilteredJobs(data.results);
          setTotalCount(data.count);
          setJobsError(null);
          hasMoreRef.current = !!data.next;
          setHasMore(!!data.next);
        } else {
          setJobsError(err);
          setFilteredJobs([]);
          hasMoreRef.current = false;
          setHasMore(false);
          setTotalCount(0);
        }
      } else {
        // خطا در صفحه بعد → توقف برای جلوگیری از لوپ
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      if (reqId !== requestIdRef.current) return;
      if (append) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      } else {
        jobsLoadingRef.current = false;
        setJobsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [buildQueryParams, demoMode]);

  // فقط با تغییر واقعی فیلتر/مرتب‌سازی ریست کن
  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    const timer = setTimeout(() => {
      fetchJobs({ page: 1, append: false });
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const loadMore = useCallback(() => {
    if (
      !hasMoreRef.current ||
      jobsLoadingRef.current ||
      loadingMoreRef.current
    ) {
      return;
    }
    fetchJobs({ page: pageRef.current + 1, append: true });
  }, [fetchJobs]);

  // Sync URL — بدون remount و بدون لوپ (فقط صفحهٔ /jobs)
  useEffect(() => {
    if (!syncUrl) return;
    if (isFirstUrlSync.current) {
      isFirstUrlSync.current = false;
      return;
    }
    if (typeof window === 'undefined') return;

    const nextQuery = queryKey;
    const currentQuery = window.location.search.replace(/^\?/, '');

    if (nextQuery === currentQuery) return;

    const newUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [queryKey, pathname, router, syncUrl]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'province') {
        next.city = '';
        next.neighborhood = '';
      }
      if (key === 'city') {
        next.neighborhood = '';
      }
      return next;
    });
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (key === 'isVerified') next.isVerified = false;
      else if (key === 'features') next.features = [];
      else next[key] = '';

      if (key === 'province') {
        next.city = '';
        next.neighborhood = '';
      }
      if (key === 'city') next.neighborhood = '';
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setSortBy('-created_at');
  }, []);

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
    activeFilterCount,
  };
};
