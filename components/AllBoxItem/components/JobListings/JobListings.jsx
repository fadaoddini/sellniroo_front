// src/components/AllBoxItem/components/JobListings/JobListings.jsx
'use client';

import React, { useEffect, useRef } from 'react';
import JobCard from '../JobCard/JobCard';
import styles from './JobListings.module.css';

const JobListings = ({
  jobs,
  totalItems,
  viewMode = 'grid-2',
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
  children,
}) => {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-3':
        return styles.grid3;
      case 'image-left':
        return styles.imageLeft;
      case 'list':
        return styles.list;
      default:
        return styles.grid2;
    }
  };

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!hasMoreRef.current || loadingMoreRef.current) return;
        onLoadMoreRef.current?.();
      },
      {
        root: null,
        rootMargin: '360px 0px',
        threshold: 0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [jobs.length > 0]);

  if (loading && jobs.length === 0) {
    return (
      <div className={styles.listingsSection}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>در حال بارگذاری آگهی‌ها...</p>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className={styles.listingsSection}>
        <div className={styles.errorState}>
          <p>خطا در دریافت آگهی‌ها</p>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listingsSection}>
      <div className={styles.listingsGridWrapper}>
        <div className={`${styles.listingsGrid} ${getGridClass()}`}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} viewMode={viewMode} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p className={styles.emptyText}>هیچ آگهی با این فیلترها یافت نشد</p>
              {children}
            </div>
          )}
        </div>
      </div>

      {jobs.length > 0 && (
        <div className={styles.lazyFooter} aria-live="polite">
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          <div className={styles.footerSlot}>
            {loadingMore ? (
              <span className={styles.loadMoreState}>در حال بارگذاری...</span>
            ) : !hasMore ? (
              <span className={styles.endMessage}>
                {typeof totalItems === 'number' && totalItems > 0
                  ? `همه ${totalItems.toLocaleString('fa-IR')} آگهی`
                  : 'انتهای لیست'}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;
