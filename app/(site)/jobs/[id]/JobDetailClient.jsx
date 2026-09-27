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
  MessageCircle, ShieldCheck, Truck, Utensils, Award, Wifi, User,
  XCircle, MinusCircle, Coffee, Send, Loader2, AlertCircle
} from 'lucide-react';
import jobisellApi from '@/services/jobisellApi';
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
  const [similarJobs, setSimilarJobs] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // ============================================
  // ✅ رفرش داده‌ها از API (برای آمار جدید)
  // ============================================
  const refreshJob = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jobisellApi.getJobDetail(initialJob.id);
      setJob(data);
      setIsLiked(data.is_liked || false);
      setLikesCount(data.likes_count || 0);
      setIsBookmarked(data.is_bookmarked || false);
    } catch (err) {
      console.error('Error refreshing job:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [initialJob.id]);

  // ============================================
  // ✅ بارگذاری آگهی‌های مشابه
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setSimilarLoading(true);
        const params = {
          page_size: 4,
        };

        // اگر دسته‌بندی دارد، بر اساس آن فیلتر کن
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
  }, [job.id, job.category, job.type]);

  // ============================================
  // ✅ requireAuth
  // ============================================
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/jobs/${job.id}`);
      return;
    }
    callback();
  };

  // ============================================
  // ✅ لایک
  // ============================================
  const handleLike = () => {
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
  const handleApply = () => {
    requireAuth(async () => {
      setIsApplying(true);
      setApplicationStatus(null);

      try {
        await jobisellApi.applyToJob(job.id, {
          full_name: user?.display_name || '',
          phone: user?.mobile || '',
          email: user?.email || '',
          cover_letter: '',
        });
        setApplicationStatus('success');
        // رفرش آمار
        setTimeout(refreshJob, 1000);
      } catch (err) {
        console.error('Apply error:', err);
        const msg = err.response?.data?.detail
          || err.response?.data?.error
          || 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.';
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

  // ============================================
  // ✅ رندر
  // ============================================
  return (
    <div className={styles.jobDetailPage}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="مسیر یابی">
          <Link href="/" className={styles.breadcrumbLink}>خانه</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <Link href="/jobs" className={styles.breadcrumbLink}>آگهی‌های شغلی</Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{job.title}</span>
        </nav>

        <div className={styles.jobDetailGrid}>
          {/* ستون اصلی */}
          <div className={styles.mainColumn}>
            {/* کارت اصلی */}
            <div className={styles.jobCard}>
              {/* تصویر */}
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
                    {job.is_featured && (
                      <span className={styles.featuredBadge}>
                        <Star size={12} fill="#fff" />
                        ویژه
                      </span>
                    )}
                    <div className={`${styles.adTypeOverlay} ${isHiring ? styles.hiringOverlay : styles.seekingOverlay}`}>
                      {adTypeIcon}
                      <span>{adTypeLabel}</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.jobImagePlaceholder}>
                    <Building2 size={64} className={styles.placeholderIcon} />
                    <span>بدون تصویر</span>
                  </div>
                )}
              </div>

              {/* هدر */}
              <div className={styles.jobHeader}>
                <div className={styles.jobTitleSection}>
                  <div className={styles.jobTitleRow}>
                    <h1 className={styles.jobTitle}>{job.title}</h1>
                    <span className={`${styles.adTypeBadgeLarge} ${isHiring ? styles.hiringBadgeLarge : styles.seekingBadgeLarge}`}>
                      {adTypeLabel}
                    </span>
                  </div>
                  <div className={styles.jobCompany}>
                    <Building2 size={18} className={styles.companyIcon} />
                    <span>{job.company_name || 'بدون شرکت'}</span>
                    {job.is_verified && (
                      <span className={styles.verifiedBadge}>
                        <ShieldCheck size={14} />
                        تایید شده
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.jobActions}>
                  <button
                    onClick={handleBookmark}
                    className={`${styles.actionBtn} ${isBookmarked ? styles.active : ''}`}
                    aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'افزودن به نشان‌ها'}
                  >
                    <Bookmark size={18} fill={isBookmarked ? '#e67e22' : 'none'} />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`${styles.actionBtn} ${isLiked ? styles.active : ''}`}
                    aria-label={isLiked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                  >
                    <Heart size={18} fill={isLiked ? '#e67e22' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className={styles.actionBtn}
                    aria-label="اشتراک‌گذاری"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* اطلاعات سریع */}
              <div className={styles.jobQuickInfo}>
                <div className={styles.quickInfoItem}>
                  <MapPin size={16} className={styles.quickInfoIcon} />
                  <span>{locationStr}</span>
                </div>
                {isHiring && renderSalary() && (
                  <div className={styles.quickInfoItem}>
                    <DollarSign size={16} className={styles.quickInfoIcon} />
                    <span>{renderSalary()}</span>
                  </div>
                )}
                {job.cooperation_type_name && (
                  <div className={styles.quickInfoItem}>
                    <Clock size={16} className={styles.quickInfoIcon} />
                    <span>{job.cooperation_type_name}</span>
                  </div>
                )}
                <div className={styles.quickInfoItem}>
                  <Calendar size={16} className={styles.quickInfoIcon} />
                  <span>{getDaysAgo(job.published_at || job.created_at)}</span>
                </div>
                {isHiring && job.experience_level_name && (
                  <div className={styles.quickInfoItem}>
                    <Briefcase size={16} className={styles.quickInfoIcon} />
                    <span>{job.experience_level_name}</span>
                  </div>
                )}
              </div>

              {/* ✅ ویژگی‌ها (داینامیک از API) */}
              {renderFeatures()}

              {/* اطلاعات تکمیلی */}
              <div className={styles.jobAdditionalInfo}>
                <div className={styles.infoGrid}>
                  {job.experience_level_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>سابقه کار</span>
                      <span className={styles.infoValue}>{job.experience_level_name}</span>
                    </div>
                  )}
                  {job.education_level_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>مدرک تحصیلی</span>
                      <span className={styles.infoValue}>{job.education_level_name}</span>
                    </div>
                  )}
                  {job.gender_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>جنسیت</span>
                      <span className={styles.infoValue}>{job.gender_name}</span>
                    </div>
                  )}
                  {job.age_range && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>بازه سنی</span>
                      <span className={styles.infoValue}>{job.age_range}</span>
                    </div>
                  )}
                  {(job.published_at || job.created_at) && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>تاریخ انتشار</span>
                      <span className={styles.infoValue}>
                        {formatDate(job.published_at || job.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* توضیحات */}
              <div className={styles.jobDescription}>
                <h2 className={styles.sectionTitle}>توضیحات آگهی</h2>
                <p className={styles.descriptionText}>{job.description}</p>
              </div>

              {/* تگ‌ها */}
              {job.tags?.length > 0 && (
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
          </div>

          {/* ستون کناری */}
          <div className={styles.sideColumn}>
            {/* کارت اقدامات */}
            <div className={styles.actionCard}>
              <h3 className={styles.actionCardTitle}>ثبت درخواست</h3>

              {!isAuthenticated ? (
                <div className={styles.loginRequired}>
                  <p className={styles.loginMessage}>
                    برای ثبت درخواست و مشاهده اطلاعات تماس، لطفاً وارد حساب کاربری خود شوید.
                  </p>
                  <Link
                    href={`/login?redirect=/jobs/${job.id}`}
                    className={styles.loginBtn}
                  >
                    ورود به حساب کاربری
                  </Link>
                </div>
              ) : (
                <>
                  {/* وضعیت موفق */}
                  {applicationStatus === 'success' ? (
                    <div className={styles.applicationSuccess}>
                      <CheckCircle size={48} className={styles.successIcon} />
                      <h4>درخواست شما با موفقیت ثبت شد!</h4>
                      <p>به زودی با شما تماس گرفته خواهد شد.</p>
                    </div>
                  ) : (
                    <>
                      {/* خطا */}
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

                      <button
                        onClick={() => setShowContact(!showContact)}
                        className={styles.contactBtn}
                      >
                        <Phone size={18} />
                        {showContact ? 'بستن اطلاعات تماس' : 'مشاهده اطلاعات تماس'}
                      </button>

                      {showContact && (
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
                </>
              )}
            </div>

            {/* اطلاعات شرکت */}
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

            {/* آمار واقعی */}
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
          </div>
        </div>
      </div>
    </div>
  );
}