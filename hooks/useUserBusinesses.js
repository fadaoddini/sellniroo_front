// src/hooks/useUserBusinesses.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Config from '@/config/config';
import { useAuth } from '@/contexts/AuthContext';

export function useUserBusinesses(subcategorySlug = null) {
  const { isAuthenticated, getAuthHeaders, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (subcategorySlug) params.subcategory = subcategorySlug;

        const url = Config.endpoints.club.businesses.list(params);
        const response = await axios.get(url, { headers: getAuthHeaders() });

        if (!isMounted) return;

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setBusinesses(data);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching businesses:', err);
        setError('خطا در دریافت کسب‌وکارها');
        setBusinesses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusinesses();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, subcategorySlug, getAuthHeaders]);

  return { businesses, loading, error };
}