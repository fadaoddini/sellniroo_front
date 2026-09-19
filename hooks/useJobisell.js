// src/hooks/useJobisell.js
import { useState, useEffect, useCallback, useRef } from 'react';
import jobisellApi from '@/services/jobisellApi';

export const useJobisellFilterOptions = () => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await jobisellApi.getFilterOptions();
        if (mounted) setOptions(data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { options, loading, error };
};

/**
 * هوک اصلی برای دریافت آگهی‌ها با فیلتر
 */
export const useJobisell = (initialFilters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const abortRef = useRef(null);

  const fetchJobs = useCallback(async (filters = {}) => {
    try {
      // لغو درخواست قبلی
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const params = {
        page,
        page_size: pageSize,
        ...filters,
      };

      const data = await jobisellApi.getJobs(params);
      setJobs(data.results || data);
      setCount(data.count ?? (data.results ? data.count : data.length));
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Error fetching jobs:', err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchJobs(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return {
    jobs,
    loading,
    error,
    count,
    page,
    setPage,
    pageSize,
    refetch: () => fetchJobs(initialFilters),
    fetchJobs,
  };
};