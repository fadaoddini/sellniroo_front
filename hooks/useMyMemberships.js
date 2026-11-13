'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Config from '@/config/config';
import { useAuth } from '@/contexts/AuthContext';

export function useMyMemberships() {
  const { isAuthenticated, getAuthHeaders, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setMemberships([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = Config.endpoints.bodybuilding.myMemberships.list();
        const res = await axios.get(url, { headers: getAuthHeaders() });
        if (!isMounted) return;
        setMemberships(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching memberships:', err);
        setError('خطا در دریافت اطلاعات باشگاه‌ها');
        setMemberships([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [isAuthenticated, authLoading, getAuthHeaders]);

  return { memberships, loading, error };
}