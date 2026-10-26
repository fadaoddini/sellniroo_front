// app/jobs/[id]/JobDetailClient.jsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, DollarSign, Clock, Phone, Heart, Building2, ArrowRight,
  Calendar, Briefcase, Users, CheckCircle, Share2, Bookmark, Mail,
  Globe, Instagram, Linkedin, Twitter, ChevronRight, Star, Eye,
  MessageCircle, ShieldCheck, BadgeCheck, Truck, Utensils, Award, Wifi, User,
  XCircle, MinusCircle, Coffee, Send, Loader2, AlertCircle
} from 'lucide-react';
import jobisellApi from '@/services/jobisellApi';
import {
  DEMO_JOBS,
  filterDemoJobs,
} from '@/components/AllBoxItem/constants/demoJobs';
import { fetchSiteSettings } from '@/services/siteSettings';
import {
  DEFAULT_JOB_SINGLE_PAGE_SETTINGS,
  normalizeJobSinglePageSettings,
  jobSinglePageCssVars,
} from '@/config/jobSinglePageSettings';
import {
  normalizeJobSingleLayout,
  DEFAULT_JOB_SINGLE_LAYOUT,
} from '@/config/homeLayout';
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer';
import styles from './JobDetail.module.css';

// ============================================
// ✅ نقشه آیکون‌های داینامیک
// ============================================
const ICON_MAP = {
  'shield-check': ShieldCheck,
  'clock': Clock,
  'truck': Truck,
  'utensils': Utensils,
  'award': Award,
  'calendar': Calendar,
  'wifi': Wifi,
  'star': Star,
  'heart': Heart,
  'coffee': Coffee,
};

// ============================================
// ✅ توابع کمکی
// ============================================
const formatSalary = (amount) => {
  if (!amount) return null;
  return new Intl.NumberFormat('fa-IR').format(amount);
};

const getDaysAgo = (date) => {
  if (!date) return 'تاریخ نامشخص';
  const now = new Date();
  const jobDate = new Date(date);
  const diffTime = Math.abs(now - jobDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'امروز';
  if (diffDays === 1) return 'دیروز';
  if (diffDays < 7) return `${diffDays} روز پیش`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`;
  return `${Math.floor(diffDays / 365)} سال پیش`;
};

const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
};

// ============================================
// ✅ کامپوننت اصلی
// ============================================
export default function JobDetailClient({ initialJob }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isLiked, setIsLiked] = useState(initialJob.is_liked || false);
  const [likesCount, setLikesCount] = useState(initialJob.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(initialJob.is_bookmarked || false);
  const [showContact, setShowContact] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [hasApplied, setHasApplied] = useState(Boolean(initialJob?.has_applied));
  const [coverLetter, setCoverLetter] = useState('');
  const [similarJobs, setSimilarJobs] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [pageSettings, setPageSettings] = useState(() =>
    normalizeJobSinglePageSettings(DEFAULT_JOB_SINGLE_PAGE_SETTINGS)
  );
  const [singleLayout, setSingleLayout] = useState(DEFAULT_JOB_SINGLE_LAYOUT);

  useEffect(() => {
    let cancelled = false;
    const apply = (s) => {
      if (cancelled) return;
      setPageSettings(
        normalizeJobSinglePageSettings(
          s?.job_single_page || DEFAULT_JOB_SINGLE_PAGE_SETTINGS
        )
      );
      setSingleLayout(normalizeJobSingleLayout(s?.job_single_layout));
    };
    fetchSiteSettings()
      .then(apply)
      .catch(() => {
        if (!cancelled) setSingleLayout(DEFAULT_JOB_SINGLE_LAYOUT);
      });
    const onLayout = (ev) => {
      if (cancelled) return;
      setSingleLayout(normalizeJobSingleLayout(ev?.detail));
    };
    const onPage = (ev) => {
      if (cancelled) return;
      if (ev?.detail) {
        setPageSettings(normalizeJobSinglePageSettings(ev.detail));
      }
    };
    window.addEventListener('job-single-layout-changed', onLayout);
    window.addEventListener('job-single-page-changed', onPage);
    return () => {
      cancelled = true;
      window.removeEventListener('job-single-layout-changed', onLayout);
      window.removeEventListener('job-single-page-changed', onPage);
    };
  }, []);

  const isDemo = Boolean(job?.is_demo);

  // ============================================
  // ✅ رفرش داده‌ها از API (برای آمار جدید) — دمو را رد کن
  // ============================================
  const refreshJob = useCallback(async () => {
    if (initialJob?.is_demo) return;
    try {
      setLoading(true);
      const data = await jobisellApi.getJobDetail(initialJob.id);
      setJob(data);
      setIsLiked(data.is_liked || false);
      setLikesCount(data.likes_count || 0);
      setIsBookmarked(data.is_bookmarked || false);
      setHasApplied(Boolean(data.has_applied));
    } catch (err) {
      console.error('Error refreshing job:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [initialJob.id, initialJob?.is_demo]);

  // ============================================
  // ✅ بارگذاری آگهی‌های مشابه
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setSimilarLoading(true);

        if (job?.is_demo) {
          const results = filterDemoJobs(DEMO_JOBS, {
            adType: job.type || '',
            category: job.category || '',
          })
            .filter((j) => j.id !== job.id)
            .slice(0, 4);
          if (mounted) setSimilarJobs(results);
          return;
        }

        const params = {
          page_size: 4,
        };

        if (job.category) params.category = job.category;
        if (job.type) params.type = job.type;

        const data = await jobisellApi.getJobs(params);
        const results = (data.results || data || [])
          .filter((j) => j.id !== job.id)
          .slice(0, 4);

        if (mounted) setSimilarJobs(results);
      } catch (err) {
        console.error('Error loading similar jobs:', err);
      } finally {
        if (mounted) setSimilarLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [job.id, job.category, job.type, job?.is_demo]);

  // ============================================
  // ✅ requireAuth
  // ============================================
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      router.push(`/login?next=/jobs/${job.id}`);
      return;
    }
    callback();
  };

  // ============================================
  // ✅ لایک
  // ============================================
  const handleLike = () => {
    if (isDemo) {
      setIsLiked((v) => !v);
      setLikesCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));
      return;
    }
    requireAuth(async () => {
      // Optimistic UI
      const prevLiked = isLiked;
      const prevCount = likesCount;
      setIsLiked(!isLiked);
      setLikesCount((c) => (isLiked ? c - 1 : c + 1));

      try {
        const res = await jobisellApi.toggleLike(job.id);
        setIsLiked(res.status === 'liked');
        if (typeof res.likes_count === 'number') {
          setLikesCount(res.likes_count);
        }
      } catch (err) {
        // Rollback
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
        console.error('Like error:', err);
      }
    });
  };

  // ============================================
  // ✅ ذخیره
  // ============================================
  const handleBookmark = () => {
    if (isDemo) {
      setIsBookmarked((v) => !v);
      return;
    }
    requireAuth(async () => {
      const prev = isBookmarked;
      setIsBookmarked(!isBookmarked);

      try {
        const res = await jobisellApi.toggleBookmark(job.id);
        setIsBookmarked(res.status === 'added');
      } catch (err) {
        setIsBookmarked(prev);
        console.error('Bookmark error:', err);
      }
    });
  };

  // ============================================
  // ✅ اشتراک‌گذاری
  // ============================================
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: job.description?.substring(0, 100),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('لینک آگهی کپی شد!');
      }
    } catch (err) {
      // کاربر انصراف داد
      if (err.name !== 'AbortError') console.error('Share error:', err);
    }
  };

  // ============================================
  // ✅ ارسال درخواست
  // ============================================
  const parseApplyError = (err) => {
    const data = err?.response?.data;
    if (!data) return 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.';
    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    // خطاهای فیلدی DRF: { phone: ['...'], email: ['...'] }
    const parts = Object.entries(data)
      .filter(([, v]) => v != null)
      .map(([key, v]) => {
        const text = Array.isArray(v) ? v.join(' ') : String(v);
        return text;
      });
    return parts.length ? parts.join(' — ') : 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.';
  };

  const handleApply = () => {
    if (isDemo) {
      setApplicationStatus({
        error: 'این آگهی نمونه (دمو) است؛ ثبت درخواست واقعی ندارد.',
      });
      return;
    }
    requireAuth(async () => {
      setIsApplying(true);
      setApplicationStatus(null);

      const fullName =
        [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
        || user?.display_name
        || '';

      try {
        await jobisellApi.applyToJob(job.id, {
          full_name: fullName,
          phone: user?.mobile || '',
          email: user?.email || '',
          cover_letter: coverLetter.trim(),
        });
        setHasApplied(true);
        setApplicationStatus('success');
        setTimeout(refreshJob, 800);
      } catch (err) {
        console.error('Apply error:', err);
        const msg = parseApplyError(err);
        if (msg.includes('قبلاً')) {
          setHasApplied(true);
        }
        setApplicationStatus({ error: msg });
      } finally {
        setIsApplying(false);
      }
    });
  };

  // ============================================
  // ✅ اطلاعات
  // ============================================
  const isHiring = job.type === 'hiring';
  const adTypeLabel = isHiring ? 'استخدام' : 'کارجو';
  const adTypeIcon = isHiring ? <Briefcase size={20} /> : <User size={20} />;

  // موقعیت
  const locationStr = [job.province_name, job.city_name, job.neighborhood_name]
    .filter(Boolean)
    .join('، ') || 'نامشخص';

  // حقوق
  const renderSalary = () => {
    if (!isHiring) return null;
    if (job.min_salary && job.max_salary) {
      return `${formatSalary(job.min_salary)} - ${formatSalary(job.max_salary)} تومان`;
    }
    if (job.min_salary) return `از ${formatSalary(job.min_salary)} تومان`;
    if (job.max_salary) return `تا ${formatSalary(job.max_salary)} تومان`;
    return 'توافقی';
  };

  // ============================================
  // ✅ رندر ویژگی‌ها (داینامیک از API)
  // ============================================
  const renderFeatures = () => {
    if (!isHiring || !job.features?.length) return null;

    return (
      <div className={styles.featuresSection}>
        <h3 className={styles.featuresTitle}>مزایا و امکانات</h3>
        <div className={styles.featuresGrid}>
          {job.features.map((feat) => {
            const Icon = ICON_MAP[feat.feature_icon] || ShieldCheck;
            const val = feat.value_boolean;
            const statusClass = val === true
              ? styles.active
              : val === false
              ? styles.inactive
              : styles.unknown;
            const statusIcon = val === true
              ? <CheckCircle size={16} className={styles.featureActiveIcon} />
              : val === false
              ? <XCircle size={16} className={styles.featureInactiveIcon} />
              : <MinusCircle size={16} className={styles.featureUnknownIcon} />;
            const statusText = val === true ? 'دارد' : val === false ? 'ندارد' : 'نامشخص';

            return (
              <div
                key={feat.id}
                className={`${styles.featureItem} ${statusClass}`}
              >
                <Icon size={18} />
                <span className={styles.featureLabel}>{feat.feature_name}</span>
                {statusIcon}
                <span className={styles.featureStatus}>{statusText}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ps = pageSettings;
  const themeStyle = jobSinglePageCssVars(ps);

  // ============================================
  // ✅ رندر بدنه آگهی (اسلات صفحه‌ساز)
  // ============================================
  const appliedOk = hasApplied || applicationStatus === 'success';
  const showMobileCta = ps.show_apply || ps.show_contact;

  const articleNode = (
    <div
      className={`${styles.jobDetailPage} ${styles.inSlot} ${styles[`layout_${ps.layout}`] || ''}`}
      style={themeStyle}
      data-jsd="1"
      data-article-slot="1"
      data-jsd-layout={ps.layout}
    >
      {/* نوار بالای اپ‌مانند — فقط موبایل */}
      <header className={styles.appTopBar}>
        <Link href="/jobs" className={styles.appBack} aria-label="بازگشت به آگهی‌ها">
          <ArrowRight size={22} strokeWidth={2.25} />
        </Link>
        <div className={styles.appTopCenter}>
          <span className={styles.appTopTitle}>{job.title}</span>
          {ps.show_company ? (
            <span className={styles.appTopSub}>{job.company_name || '—'}</span>
          ) : null}
        </div>
        <div className={styles.appTopActions}>
          {ps.show_bookmark ? (
            <button
              type="button"
              onClick={handleBookmark}
              className={`${styles.appIconBtn} ${isBookmarked ? styles.active : ''}`}
              aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'نشان‌گذاری'}
            >
              <Bookmark size={20} strokeWidth={2.1} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          ) : null}
          {ps.show_like ? (
            <button
              type="button"
              onClick={handleLike}
              className={`${styles.appIconBtn} ${isLiked ? styles.active : ''}`}
              aria-label={isLiked ? 'حذف لایک' : 'لایک'}
            >
              <Heart size={20} strokeWidth={2.1} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          ) : null}
          {ps.show_share ? (
            <button
              type="button"
              onClick={handleShare}
              className={styles.appIconBtn}
              aria-label="اشتراک‌گذاری"
            >
              <Share2 size={20} strokeWidth={2.1} />
            </button>
          ) : null}
        </div>
      </header>

      <div className={styles.container}>
        {/* Breadcrumb — دسکتاپ */}
        {ps.show_breadcrumb ? (
        <nav className={styles.breadcrumb} aria-label="مسیر یابی">
          <Link href="/" className={styles.breadcrumbLink}>خانه</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <Link href="/jobs" className={styles.breadcrumbLink}>آگهی‌های شغلی</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{job.title}</span>
        </nav>
        ) : null}

        <div className={styles.jobDetailGrid}>
          {/* ستون اصلی */}
          <div className={styles.mainColumn}>
            {/* کارت اصلی */}
            <div className={styles.jobCard}>
              {/* تصویر */}
              {ps.show_image ? (
              <div className={styles.jobImageWrapper}>
                {job.image ? (
                  <div className={styles.jobImage}>
                    <Image
                      src={job.image}
                      alt={job.title}
                      fill
                      className={styles.image}
                      priority
                      unoptimized
                    />
                    {ps.show_badges && ps.show_featured_badge && job.is_featured && (
                      <span className={styles.featuredBadge}>
                        <Star size={12} fill="#fff" />
                        ویژه
                      </span>
                    )}
                    {ps.show_badges && ps.show_type_badge ? (
                    <div className={`${styles.adTypeOverlay} ${isHiring ? styles.hiringOverlay : styles.seekingOverlay}`}>
                      {adTypeIcon}
                      <span>{adTypeLabel}</span>
                    </div>
                    ) : null}
                  </div>
                ) : (
                  <div className={styles.jobImagePlaceholder}>
                    <Building2 size={64} className={styles.placeholderIcon} />
                    <span>بدون تصویر</span>
                  </div>
                )}
              </div>
              ) : null}

              {/* هدر */}
              <div className={styles.jobHeader}>
                <div className={styles.jobTitleSection}>
                  <div className={styles.jobTitleRow}>
                    {ps.show_title ? (
                    <h1 className={styles.jobTitle}>{job.title}</h1>
                    ) : null}
                    {ps.show_badges && ps.show_type_badge ? (
                    <span className={`${styles.adTypeBadgeLarge} ${isHiring ? styles.hiringBadgeLarge : styles.seekingBadgeLarge}`}>
                      {adTypeLabel}
                    </span>
                    ) : null}
                  </div>
                  {ps.show_company ? (
                  <div className={`${styles.jobCompany} ${
                    isHiring && (job.company_is_verified || job.is_verified)
                      ? styles.jobCompanyVerified
                      : ''
                  }`}>
                    <Building2 size={18} className={styles.companyIcon} />
                    <span>{job.company_name || 'بدون شرکت'}</span>
                    {ps.show_verified && isHiring && (job.company_is_verified || job.is_verified) ? (
                      <span className={styles.verifiedBadge} title="شرکت تاییدشده توسط سلنیرو">
                        <BadgeCheck size={16} />
                        شرکت تاییدشده
                      </span>
                    ) : null}
                  </div>
                  ) : null}
                </div>

                {(ps.show_bookmark || ps.show_like || ps.show_share) ? (
                <div className={styles.jobActions}>
                  {ps.show_bookmark ? (
                  <button
                    onClick={handleBookmark}
                    className={`${styles.actionBtn} ${isBookmarked ? styles.active : ''}`}
                    aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'افزودن به نشان‌ها'}
                  >
                    <Bookmark size={18} fill={isBookmarked ? '#e67e22' : 'none'} />
                  </button>
                  ) : null}
                  {ps.show_like ? (
                  <button
                    onClick={handleLike}
                    className={`${styles.actionBtn} ${isLiked ? styles.active : ''}`}
                    aria-label={isLiked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                  >
                    <Heart size={18} fill={isLiked ? '#e67e22' : 'none'} />
                  </button>
                  ) : null}
                  {ps.show_share ? (
                  <button
                    onClick={handleShare}
                    className={styles.actionBtn}
                    aria-label="اشتراک‌گذاری"
                  >
                    <Share2 size={18} />
                  </button>
                  ) : null}
                </div>
                ) : null}
              </div>

              {/* اطلاعات سریع */}
              {(ps.show_location ||
                ps.show_salary ||
                ps.show_cooperation ||
                ps.show_meta_date ||
                ps.show_experience) ? (
              <div className={styles.jobQuickInfo}>
                {ps.show_location ? (
                <div className={styles.quickInfoItem}>
                  <MapPin size={16} className={styles.quickInfoIcon} />
                  <span>{locationStr}</span>
                </div>
                ) : null}
                {ps.show_salary && isHiring && renderSalary() && (
                  <div className={styles.quickInfoItem}>
                    <DollarSign size={16} className={styles.quickInfoIcon} />
                    <span>{renderSalary()}</span>
                  </div>
                )}
                {ps.show_cooperation && job.cooperation_type_name && (
                  <div className={styles.quickInfoItem}>
                    <Clock size={16} className={styles.quickInfoIcon} />
                    <span>{job.cooperation_type_name}</span>
                  </div>
                )}
                {ps.show_meta_date ? (
                <div className={styles.quickInfoItem}>
                  <Calendar size={16} className={styles.quickInfoIcon} />
                  <span>{getDaysAgo(job.published_at || job.created_at)}</span>
                </div>
                ) : null}
                {ps.show_experience && isHiring && job.experience_level_name && (
                  <div className={styles.quickInfoItem}>
                    <Briefcase size={16} className={styles.quickInfoIcon} />
                    <span>{job.experience_level_name}</span>
                  </div>
                )}
              </div>
              ) : null}

              {/* ✅ ویژگی‌ها (داینامیک از API) */}
              {ps.show_features ? renderFeatures() : null}

              {/* اطلاعات تکمیلی */}
              {(ps.show_experience ||
                ps.show_education ||
                ps.show_gender ||
                ps.show_age ||
                ps.show_meta_date) ? (
              <div className={styles.jobAdditionalInfo}>
                <div className={styles.infoGrid}>
                  {ps.show_experience && job.experience_level_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>سابقه کار</span>
                      <span className={styles.infoValue}>{job.experience_level_name}</span>
                    </div>
                  )}
                  {ps.show_education && job.education_level_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>مدرک تحصیلی</span>
                      <span className={styles.infoValue}>{job.education_level_name}</span>
                    </div>
                  )}
                  {ps.show_gender && job.gender_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>جنسیت</span>
                      <span className={styles.infoValue}>{job.gender_name}</span>
                    </div>
                  )}
                  {ps.show_age && job.age_range && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>بازه سنی</span>
                      <span className={styles.infoValue}>{job.age_range}</span>
                    </div>
                  )}
                  {ps.show_meta_date && (job.published_at || job.created_at) && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>تاریخ انتشار</span>
                      <span className={styles.infoValue}>
                        {formatDate(job.published_at || job.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              ) : null}

              {/* توضیحات */}
              {ps.show_description ? (
              <div className={styles.jobDescription}>
                <h2 className={styles.sectionTitle}>توضیحات آگهی</h2>
                <p className={styles.descriptionText}>{job.description}</p>
              </div>
              ) : null}

              {/* تگ‌ها */}
              {ps.show_tags && job.tags?.length > 0 && (
                <div className={styles.jobTagsSection}>
                  <span className={styles.tagsLabel}>تخصص‌ها:</span>
                  <div className={styles.jobTags}>
                    {job.tags.map((tag) => (
                      <span key={tag.id} className={styles.tag}>{tag.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ آگهی‌های مشابه */}
            {ps.show_similar ? (
            <div className={styles.similarJobs}>
              <h2 className={styles.sectionTitle}>آگهی‌های مشابه</h2>
              {similarLoading ? (
                <div className={styles.similarLoading}>
                  <Loader2 size={24} className={styles.spinnerIcon} />
                  <span>در حال بارگذاری...</span>
                </div>
              ) : similarJobs.length > 0 ? (
                <div className={styles.similarJobsGrid}>
                  {similarJobs.map((sj) => (
                    <Link
                      key={sj.id}
                      href={`/jobs/${sj.id}`}
                      className={styles.similarJobCard}
                    >
                      <div className={styles.similarJobTitle}>{sj.title}</div>
                      <div className={styles.similarJobCompany}>
                        <Building2 size={12} />
                        {sj.company_name || '—'}
                      </div>
                      <div className={styles.similarJobLocation}>
                        <MapPin size={12} />
                        {sj.city_name || '—'}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={styles.similarPlaceholder}>آگهی مشابهی یافت نشد.</p>
              )}
            </div>
            ) : null}
          </div>

          {/* ستون کناری */}
          <div className={styles.sideColumn}>
            {/* کارت اقدامات — فقط استخدام */}
            {(ps.show_apply || ps.show_contact) ? (
            <div className={styles.actionCard} id="job-apply">
              <h3 className={styles.actionCardTitle}>
                {isHiring ? 'ثبت درخواست همکاری' : 'اطلاعات تماس'}
              </h3>

              {!isAuthenticated ? (
                <div className={styles.loginRequired}>
                  <p className={styles.loginMessage}>
                    {isHiring
                      ? 'برای ثبت درخواست و مشاهده اطلاعات تماس وارد حساب کاربری شوید.'
                      : 'برای مشاهده اطلاعات تماس وارد حساب کاربری شوید.'}
                  </p>
                  <Link
                    href={`/login?next=/jobs/${job.id}`}
                    className={styles.loginBtn}
                  >
                    ورود به حساب کاربری
                  </Link>
                </div>
              ) : (
                <>
                  {isHiring && appliedOk ? (
                    <div className={styles.applicationSuccess}>
                      <CheckCircle size={48} className={styles.successIcon} />
                      <h4>درخواست شما ثبت شده است</h4>
                      <p>کارفرما به‌زودی درخواست شما را بررسی می‌کند.</p>
                    </div>
                  ) : isHiring && ps.show_apply ? (
                    <>
                      <p className={styles.applyHint}>
                        اطلاعات تماس از پروفایل شما ارسال می‌شود. در صورت تمایل توضیح کوتاه بنویسید.
                      </p>

                      <label className={styles.coverLabel} htmlFor="cover-letter">
                        متن درخواست <span>(اختیاری)</span>
                      </label>
                      <textarea
                        id="cover-letter"
                        className={styles.coverInput}
                        rows={3}
                        maxLength={1000}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="مثلاً: سابقه کار مرتبط و دلیل علاقه‌مندی به این موقعیت..."
                      />

                      {applicationStatus?.error && (
                        <div className={styles.applicationError}>
                          <AlertCircle size={16} />
                          <span>{applicationStatus.error}</span>
                        </div>
                      )}

                      <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className={styles.applyBtn}
                        type="button"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 size={18} className={styles.spinnerIcon} />
                            در حال ثبت...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            ثبت درخواست
                          </>
                        )}
                      </button>
                    </>
                  ) : null}

                  {ps.show_contact ? (
                  <button
                    onClick={() => setShowContact(!showContact)}
                    className={styles.contactBtn}
                    type="button"
                  >
                    <Phone size={18} />
                    {showContact ? 'بستن اطلاعات تماس' : 'مشاهده اطلاعات تماس'}
                  </button>
                  ) : null}

                  {ps.show_contact && showContact && (
                    <div className={styles.contactInfo}>
                      {job.contact_phone && (
                        <a
                          href={`tel:${job.contact_phone}`}
                          className={styles.contactItem}
                        >
                          <Phone size={14} />
                          <span>{job.contact_phone}</span>
                        </a>
                      )}
                      {job.contact_email && (
                        <a
                          href={`mailto:${job.contact_email}`}
                          className={styles.contactItem}
                        >
                          <Mail size={14} />
                          <span>{job.contact_email}</span>
                        </a>
                      )}
                      {!job.contact_phone && !job.contact_email && (
                        <p className={styles.noContact}>
                          اطلاعات تماس ثبت نشده است.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            ) : null}

            {/* اطلاعات شرکت */}
            {ps.show_company_card ? (
            <div className={styles.companyCard}>
              <h3 className={styles.companyCardTitle}>درباره شرکت</h3>
              <div className={styles.companyInfo}>
                <div className={styles.companyLogoLarge}>
                  {job.company_logo ? (
                    <Image
                      src={job.company_logo}
                      alt={job.company_name}
                      width={64}
                      height={64}
                      unoptimized
                    />
                  ) : (
                    <Building2 size={32} />
                  )}
                </div>
                <h4 className={styles.companyNameLarge}>
                  {job.company_name || 'بدون شرکت'}
                </h4>
                {job.company_description ? (
                  <p className={styles.companyDesc}>{job.company_description}</p>
                ) : (
                  <p className={styles.companyDesc}>
                    اطلاعاتی درباره این شرکت ثبت نشده است.
                  </p>
                )}
              </div>
            </div>
            ) : null}

            {/* آمار واقعی */}
            {ps.show_views ? (
            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <Eye size={16} />
                <span>
                  {(job.views_count || 0).toLocaleString('fa-IR')} بازدید
                </span>
              </div>
              <div className={styles.statItem}>
                <Heart size={16} />
                <span>
                  {(likesCount || 0).toLocaleString('fa-IR')} لایک
                </span>
              </div>
              <div className={styles.statItem}>
                <Clock size={16} />
                <span>{getDaysAgo(job.published_at || job.created_at)}</span>
              </div>
            </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* نوار پایین اپ‌مانند — فقط موبایل */}
      {showMobileCta ? (
        <div className={styles.mobileCtaBar} role="region" aria-label="اقدام سریع">
          <div className={styles.mobileCtaInner}>
            {!isAuthenticated ? (
              <Link
                href={`/login?next=/jobs/${job.id}`}
                className={styles.mobileCtaPrimary}
              >
                ورود برای ادامه
              </Link>
            ) : isHiring && appliedOk ? (
              <div className={styles.mobileCtaDone}>
                <CheckCircle size={22} strokeWidth={2.25} />
                <span>درخواست ثبت شد</span>
              </div>
            ) : (
              <>
                {ps.show_contact ? (
                  <button
                    type="button"
                    className={styles.mobileCtaIcon}
                    onClick={() => {
                      setShowContact(true);
                      document
                        .getElementById('job-apply')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    aria-label="اطلاعات تماس"
                  >
                    <Phone size={22} strokeWidth={2.25} />
                  </button>
                ) : null}
                {isHiring && ps.show_apply ? (
                  <button
                    type="button"
                    className={styles.mobileCtaPrimary}
                    onClick={handleApply}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <Loader2 size={22} className={styles.spinnerIcon} strokeWidth={2.25} />
                    ) : (
                      <Send size={20} strokeWidth={2.25} />
                    )}
                    {isApplying ? 'در حال ثبت…' : 'ثبت درخواست'}
                  </button>
                ) : ps.show_contact ? (
                  <button
                    type="button"
                    className={styles.mobileCtaPrimary}
                    onClick={() => {
                      setShowContact(true);
                      document
                        .getElementById('job-apply')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    <Phone size={20} strokeWidth={2.25} />
                    اطلاعات تماس
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <PageBuilderRenderer
      layout={normalizeJobSingleLayout(singleLayout)}
      articleSlot={articleNode}
    />
  );
}