// app/jobs/JobsPageClient.jsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AllBoxItem from '@/components/AllBoxItem';
import styles from './Jobs.module.css';

export default function JobsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ============================================
  // ✅ خواندن پارامترها
  // ============================================
  const initialFilters = useMemo(() => {
    return {
      q: searchParams.get('q') || '',
      province: searchParams.get('province') || '',
      city: searchParams.get('city') || '',
      neighborhood: searchParams.get('neighborhood') || '',
      adType: searchParams.get('type') || '',
      cooperationType: searchParams.get('cooperation_type') || '',
      jobTitle: searchParams.get('job_title') || '',
      category: searchParams.get('category') || '',
      isVerified: searchParams.get('is_verified') === 'true',
      features: searchParams.get('features')
        ? searchParams.get('features').split(',').filter(Boolean)
        : [],
      ordering: searchParams.get('ordering') || '-created_at',
      page: parseInt(searchParams.get('page') || '1', 10),
    };
  }, [searchParams]);

  // ✅ کلید یکتا برای Force Remount
  const remountKey = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  // ============================================
  // ✅ پاک کردن جستجو
  // ============================================
  const handleClearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page'); // صفحه را هم ریست کن
    router.push(`/jobs${params.toString() ? '?' + params.toString() : ''}`);
  }, [searchParams, router]);

  // ============================================
  // ✅ پاک کردن همه فیلترها
  // ============================================
  const handleClearAll = useCallback(() => {
    router.push('/jobs');
  }, [router]);

  // ============================================
  // ✅ خلاصه فیلترها
  // ============================================
  const filterSummary = useMemo(() => {
    const parts = [];
    if (initialFilters.q) parts.push(`جستجو: «${initialFilters.q}»`);
    if (initialFilters.city) parts.push(`شهر: انتخاب شده`);
    if (initialFilters.province) parts.push(`استان: انتخاب شده`);
    if (initialFilters.adType === 'hiring') parts.push('نوع: استخدام');
    else if (initialFilters.adType === 'seeking') parts.push('نوع: کارجو');
    return parts;
  }, [initialFilters]);

  return (
    <div className={styles.jobsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="مسیر یابی">
            <Link href="/" className={styles.breadcrumbLink}>خانه</Link>
            <ArrowRight size={14} className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>آگهی‌های شغلی</span>
          </nav>

          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                {initialFilters.q ? (
                  <>
                    <Search size={24} className={styles.titleIcon} />
                    نتایج جستجو برای «{initialFilters.q}»
                  </>
                ) : (
                  <>
                    <SlidersHorizontal size={24} className={styles.titleIcon} />
                    همه آگهی‌های شغلی
                  </>
                )}
              </h1>

              {filterSummary.length > 0 && (
                <div className={styles.filterSummary}>
                  {filterSummary.map((item, idx) => (
                    <span key={idx} className={styles.filterSummaryChip}>
                      {item}
                    </span>
                  ))}
                  <button
                    className={styles.clearAllChip}
                    onClick={handleClearAll}
                  >
                    <X size={12} />
                    پاک کردن همه
                  </button>
                </div>
              )}
            </div>

            {initialFilters.q && (
              <button
                onClick={handleClearSearch}
                className={styles.clearSearchBtn}
              >
                <X size={16} />
                حذف جستجو
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* ✅ key={remountKey} → با تغییر URL، کامپوننت کامل remount می‌شود */}
        <AllBoxItem
          key={remountKey}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}