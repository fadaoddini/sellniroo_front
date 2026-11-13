// modules/gym/components/GymPage.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  Dumbbell,
  Waves,
  ArrowLeft,
  Check,
  Sparkles,
  Star,
  Users,
  Calendar,
  Award,
  Circle,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import Config from '@/config/config';
import styles from './GymPage.module.css';

// ============================================
// آیکون والیبال (سفارشی)
// ============================================
const VolleyballIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 0 20" />
    <path d="M12 2a15.3 15.3 0 0 0 0 20" />
    <path d="M2 12h20" />
    <path d="M4.5 4.5l15 15" />
    <path d="M4.5 19.5l15-15" />
  </svg>
);

// ============================================
// آیکون بیلیارد (سفارشی)
// ============================================
const BilliardIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <line x1="12" y1="2" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="22" />
    <line x1="2" y1="12" x2="10" y2="12" />
    <line x1="14" y1="12" x2="22" y2="12" />
  </svg>
);

// ============================================
// آیکون فوتبال (سفارشی)
// ============================================
const FootballIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z" />
  </svg>
);

// ============================================
// نقشه آیکون‌ها
// ============================================
const iconMap = {
  Dumbbell,
  Waves,
  Circle,
  Check,
  Star,
  Users,
  Calendar,
  Award,
  MoreVertical,
  Sparkles,
  Volleyball: VolleyballIcon,
  Billiard: BilliardIcon,
  Football: FootballIcon,
};

// ============================================
// تصویر پیش‌فرض برای هر زیرمجموعه
// ============================================
const defaultImages = {
  bodybuilding: '/images/job/rebo.png',
  billiard: '/images/job/rebo.png',
  pool: '/images/job/rebo.png',
  football: '/images/job/rebo.png',
  volleyball: '/images/job/rebo.png',
  other: '/images/job/rebo.png',
};

export default function GymPage() {
  const [gymTypes, setGymTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [hoveredGym, setHoveredGym] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});

  // ============================================
  // دریافت زیرمجموعه‌های دسته gym از API
  // ============================================
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = Config.endpoints.club.categories.subcategories('gym');
        console.log('Fetching gym subcategories from:', url);

        const response = await axios.get(url);
        console.log('Gym subcategories response:', response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        const list = data.length
          ? data
          : [
              {
                id: 'bb',
                slug: 'bodybuilding',
                title: 'باشگاه بدنسازی',
                description: 'مدیریت کامل بدون اشتراک',
                href: '/gym/profile',
                icon_name: 'Dumbbell',
                color: '#a3e635',
              },
              {
                id: 'bi',
                slug: 'billiard',
                title: 'باشگاه بیلیارد',
                description: 'مدیریت کامل بدون اشتراک',
                href: '/gym/billiard',
                icon_name: 'Billiard',
                color: '#38bdf8',
              },
            ]
        setGymTypes(list);
      } catch (err) {
        console.error('Error fetching gym subcategories:', err);
        // بدون وابستگی به اشتراک/API کلاب — لینک‌های ثابت سایت
        setGymTypes([
          {
            id: 'bb',
            slug: 'bodybuilding',
            title: 'باشگاه بدنسازی',
            description: 'مدیریت کامل بدون اشتراک',
            href: '/gym/profile',
            icon_name: 'Dumbbell',
            color: '#a3e635',
          },
          {
            id: 'bi',
            slug: 'billiard',
            title: 'باشگاه بیلیارد',
            description: 'مدیریت کامل بدون اشتراک',
            href: '/gym/billiard',
            icon_name: 'Billiard',
            color: '#38bdf8',
          },
        ]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  // ============================================
  // گرفتن تصویر
  // ============================================
  const getImageUrl = (gym) => {
    if (gym.image_url) return gym.image_url;
    if (defaultImages[gym.slug]) return defaultImages[gym.slug];
    return '/images/job/rebo.png';
  };

  const handleImageLoad = (id) =>
    setImagesLoaded((prev) => ({ ...prev, [id]: true }));

  const handleImageError = (id) =>
    setImagesLoaded((prev) => ({ ...prev, [id]: 'error' }));

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className={styles.gymPage}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={18} />
              بازگشت به صفحه اصلی
            </Link>
            <div className={styles.pageBadge}>
              <Sparkles size={14} />
              <span>مدیریت باشگاه</span>
            </div>
            <h1 className={styles.pageTitle}>
              باشگاه خود را <span>انتخاب کنید</span>
            </h1>
            <p className={styles.pageSubtitle}>
              REBO راه‌حل مدیریت یکپارچه برای تمام باشگاه‌های ورزشی
            </p>
          </div>
        </div>
        <div className={styles.gymGridContainer}>
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={48} />
            <p>در حال دریافت لیست باشگاه‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Error
  // ============================================
  if (error) {
    return (
      <div className={styles.gymPage}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={18} />
              بازگشت به صفحه اصلی
            </Link>
            <div className={styles.pageBadge}>
              <Sparkles size={14} />
              <span>مدیریت باشگاه</span>
            </div>
            <h1 className={styles.pageTitle}>
              باشگاه خود را <span>انتخاب کنید</span>
            </h1>
          </div>
        </div>
        <div className={styles.gymGridContainer}>
          <div className={styles.errorState}>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              تلاش دوباره
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // حالت خالی
  // ============================================
  if (gymTypes.length === 0) {
    return (
      <div className={styles.gymPage}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={18} />
              بازگشت به صفحه اصلی
            </Link>
            <div className={styles.pageBadge}>
              <Sparkles size={14} />
              <span>مدیریت باشگاه</span>
            </div>
            <h1 className={styles.pageTitle}>
              باشگاه خود را <span>انتخاب کنید</span>
            </h1>
          </div>
        </div>
        <div className={styles.gymGridContainer}>
          <div className={styles.errorState}>
            <p>هنوز باشگاهی ثبت نشده است</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // رندر اصلی
  // ============================================
  return (
    <div className={styles.gymPage}>
      {/* هدر */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            بازگشت به صفحه اصلی
          </Link>
          <div className={styles.pageBadge}>
            <Sparkles size={14} />
            <span>مدیریت باشگاه</span>
          </div>
          <h1 className={styles.pageTitle}>
            باشگاه خود را <span>انتخاب کنید</span>
          </h1>
          <p className={styles.pageSubtitle}>
            REBO راه‌حل مدیریت یکپارچه برای تمام باشگاه‌های ورزشی
          </p>
        </div>
      </div>

      {/* شبکه باشگاه‌ها */}
      <div className={styles.gymGridContainer}>
        <div className={styles.gymGrid}>
          {gymTypes.map((gym) => {
            const gymHref =
              gym.slug === 'bodybuilding' ||
              String(gym.href || '').includes('/gym/bodybuilding')
                ? '/gym/profile'
                : gym.href || `/gym/${gym.slug}`
            const Icon = iconMap[gym.icon_name] || Dumbbell;
            const isHovered = hoveredGym === gym.id;
            const isSelected = selectedGym === gym.id;
            const isLoaded = imagesLoaded[gym.id];
            const imageUrl = getImageUrl(gym);

            return (
              <div
                key={gym.id}
                className={`${styles.gymCard} ${
                  isSelected ? styles.gymCardSelected : ''
                }`}
                onMouseEnter={() => setHoveredGym(gym.id)}
                onMouseLeave={() => setHoveredGym(null)}
                onClick={() =>
                  setSelectedGym(selectedGym === gym.id ? null : gym.id)
                }
              >
                <div
                  className={styles.gymCardImage}
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* اسکلتون */}
                  {isLoaded !== true && isLoaded !== 'error' && (
                    <div className={styles.imageSkeleton} />
                  )}

                  {/* خطا */}
                  {isLoaded === 'error' && (
                    <div className={styles.imageError}>
                      <Icon size={32} />
                    </div>
                  )}

                  <div className={styles.gymCardOverlay} />

                  {isSelected && (
                    <div className={styles.gymSelectedBadge}>
                      <Check size={16} />
                    </div>
                  )}

                  <div className={styles.gymCardContent}>
                    <div
                      className={styles.gymIconWrapper}
                      style={{ backgroundColor: `${gym.color}20` }}
                    >
                      <Icon size={24} style={{ color: gym.color }} />
                    </div>

                    <h3 className={styles.gymCardTitle}>{gym.title}</h3>
                    <p className={styles.gymCardDesc}>{gym.description}</p>

                    <div
                      className={`${styles.gymFeatures} ${
                        isHovered || isSelected ? styles.gymFeaturesVisible : ''
                      }`}
                    >
                      {(gym.features || []).slice(0, 4).map((feature, index) => (
                        <span key={index} className={styles.gymFeature}>
                          <Check size={12} />
                          {feature}
                        </span>
                      ))}
                      {(gym.features || []).length > 4 && (
                        <span className={styles.gymFeatureMore}>
                          +{gym.features.length - 4} مورد دیگر
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.gymCardAction}>
                    <Link
                      href={gymHref}
                      className={styles.gymCardButton}
                      style={{
                        backgroundColor: isHovered ? gym.color : 'transparent',
                        borderColor: isHovered ? gym.color : 'rgba(255,255,255,0.2)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>مدیریت باشگاه</span>
                      <ArrowLeft size={16} />
                    </Link>
                  </div>

                  {/* آمار */}
                  {(gym.users_count > 0 || gym.rating) && (
                    <div className={styles.gymStats}>
                      {gym.users_count > 0 && (
                        <span>
                          <Users size={12} />
                          {new Intl.NumberFormat('fa-IR').format(gym.users_count)} کاربر
                        </span>
                      )}
                      {gym.rating && (
                        <span>
                          <Star size={12} />
                          {gym.rating}
                        </span>
                      )}
                    </div>
                  )}

                  {/* تصویر مخفی برای تشخیص لود */}
                  <img
                    src={imageUrl}
                    alt=""
                    style={{ display: 'none' }}
                    onLoad={() => handleImageLoad(gym.id)}
                    onError={() => handleImageError(gym.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* بخش پایین */}
      <div className={styles.gymBottomSection}>
        <div className={styles.gymBottomContent}>
          <div className={styles.gymBottomFeatures}>
            <div className={styles.gymBottomFeature}>
              <div className={styles.gymBottomIcon}>
                <Calendar size={20} />
              </div>
              <div>
                <h4>رزرو هوشمند</h4>
                <p>سیستم رزرو آنلاین و مدیریت زمان‌بندی</p>
              </div>
            </div>
            <div className={styles.gymBottomFeature}>
              <div className={styles.gymBottomIcon}>
                <Users size={20} />
              </div>
              <div>
                <h4>مدیریت اعضا</h4>
                <p>پروفایل کامل اعضا و تاریخچه فعالیت</p>
              </div>
            </div>
            <div className={styles.gymBottomFeature}>
              <div className={styles.gymBottomIcon}>
                <Award size={20} />
              </div>
              <div>
                <h4>گزارشات تخصصی</h4>
                <p>آمار و گزارشات پیشرفته مدیریتی</p>
              </div>
            </div>
          </div>

          <div className={styles.gymBottomCTA}>
            <p className={styles.gymBottomText}>
              آیا باشگاه شما در لیست نیست؟{' '}
              <Link href="/contact" className={styles.gymBottomLink}>
                با ما تماس بگیرید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}