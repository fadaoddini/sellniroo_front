// src/components/AllBoxItem/components/JobCard/JobCard.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, MapPin, DollarSign, Clock, Phone, Heart, Eye,
  ChevronLeft, ShieldCheck, User, Briefcase, Star,
} from 'lucide-react';
import JobFeatures from './JobFeatures';
import jobisellApi from '@/services/jobisellApi';
import styles from './JobCard.module.css';

const formatSalary = (amount) => {
  if (!amount) return null;
  return new Intl.NumberFormat('fa-IR').format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR').format(d);
  } catch {
    return dateStr;
  }
};

const JobCard = ({ job, viewMode = 'grid-2' }) => {
  const [isLiked, setIsLiked] = useState(job.is_liked || false);
  const [likesCount, setLikesCount] = useState(job.likes_count || 0);
  const [imageError, setImageError] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI
    setIsLiked(!isLiked);
    setLikesCount((c) => (isLiked ? c - 1 : c + 1));

    try {
      const res = await jobisellApi.toggleLike(job.id);
      setIsLiked(res.status === 'liked');
      if (typeof res.likes_count === 'number') {
        setLikesCount(res.likes_count);
      }
    } catch (err) {
      // برگرداندن در صورت خطا
      setIsLiked(isLiked);
      setLikesCount((c) => (isLiked ? c + 1 : c - 1));
      console.error('Like error:', err);
    }
  };

  const isHiring = job.type === 'hiring';
  const adTypeLabel = isHiring ? 'استخدام' : 'کارجو';
  const adTypeIcon = isHiring ? <Briefcase size={14} /> : <User size={14} />;
  const cardClass = isHiring ? styles.hiringCard : styles.seekingCard;

  // موقعیت (ساخت رشته از province + city + neighborhood)
  const locationStr = [job.city_name, job.neighborhood_name]
    .filter(Boolean)
    .join('، ') || '—';

  const renderSalary = () => {
    if (!isHiring) return null;
    if (job.min_salary && job.max_salary) {
      return `${formatSalary(job.min_salary)} - ${formatSalary(job.max_salary)} تومان`;
    }
    if (job.min_salary) return `از ${formatSalary(job.min_salary)} تومان`;
    if (job.max_salary) return `تا ${formatSalary(job.max_salary)} تومان`;
    return null;
  };

  // ============================================
  // حالت لیستی
  // ============================================
  if (viewMode === 'list') {
    return (
      <Link href={`/jobs/${job.id}`} className={`${styles.listItem} ${cardClass}`}>
        <div className={styles.listItemContent}>
          <div className={styles.listItemLeft}>
            <div className={`${styles.listItemIcon} ${isHiring ? styles.hiringIcon : styles.seekingIcon}`}>
              {adTypeIcon}
            </div>
            <div className={styles.listItemInfo}>
              <span className={styles.listItemTitle}>{job.title}</span>
              <span className={styles.listItemCompany}>
                {job.company_name || 'بدون شرکت'}
              </span>
            </div>
          </div>
          <div className={styles.listItemRight}>
            <span className={`${styles.adTypeBadge} ${isHiring ? styles.hiringBadge : styles.seekingBadge}`}>
              {adTypeLabel}
            </span>
            {job.is_verified && <ShieldCheck size={14} className={styles.verifiedIcon} />}
            <span className={styles.listItemLocation}>
              <MapPin size={12} />
              {locationStr}
            </span>
            {isHiring && renderSalary() && (
              <span className={styles.listItemSalary}>
                <DollarSign size={12} />
                {renderSalary()}
              </span>
            )}
            <ChevronLeft size={16} className={styles.listItemArrow} />
          </div>
        </div>
      </Link>
    );
  }

  // ============================================
  // حالت تصویر-چپ
  // ============================================
  if (viewMode === 'image-left') {
    return (
      <div className={`${styles.jobCard} ${styles.imageLeftCard} ${cardClass}`}>
        <div className={styles.imageLeftWrapper}>
          <div className={styles.imageLeftImage}>
            {job.image && !imageError ? (
              <div className={styles.imageLeftImageWrapper}>
                <Image
                  src={job.image}
                  alt={job.title}
                  fill
                  className={styles.imageLeftImg}
                  onError={() => setImageError(true)}
                />
                {job.is_featured && <span className={styles.imageLeftBadge}>ویژه</span>}
                <button className={styles.imageLeftLike} onClick={handleLike}>
                  <Heart
                    size={14}
                    fill={isLiked ? '#e67e22' : 'none'}
                    color={isLiked ? '#e67e22' : '#fff'}
                  />
                </button>
              </div>
            ) : (
              <div className={styles.imageLeftPlaceholder}>
                <Building2 size={28} />
              </div>
            )}
          </div>

          <div className={styles.imageLeftContent}>
            <div className={styles.imageLeftHeader}>
              <div className={styles.imageLeftTitleRow}>
                <h4 className={styles.imageLeftTitle}>{job.title}</h4>
                <span className={`${styles.adTypeBadgeSmall} ${isHiring ? styles.hiringBadgeSmall : styles.seekingBadgeSmall}`}>
                  {adTypeLabel}
                </span>
              </div>
              <span className={styles.imageLeftCompany}>{job.company_name || '—'}</span>
            </div>

            <div className={styles.imageLeftDetails}>
              <div className={styles.imageLeftDetail}>
                <MapPin size={12} />
                <span>{locationStr}</span>
              </div>
            </div>

            <div className={styles.imageLeftFooter}>
              <Link href={`/jobs/${job.id}`} className={styles.imageLeftViewBtn}>
                <Eye size={12} />
              </Link>
              {job.contact_phone && (
                <a href={`tel:${job.contact_phone}`} className={styles.imageLeftContactBtn}>
                  <Phone size={12} />
                </a>
              )}
              <span className={styles.imageLeftDate}>{formatDate(job.published_at || job.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // حالت گرید
  // ============================================
  const isCompact = viewMode === 'grid-3';

  return (
    <div className={`${styles.jobCard} ${cardClass}`}>
      <div className={`${styles.cardImageWrapper} ${isCompact ? styles.compactImage : ''}`}>
        {job.image && !imageError ? (
          <div className={styles.cardImage}>
            <Image
              src={job.image}
              alt={job.title}
              fill
              className={styles.image}
              onError={() => setImageError(true)}
              priority={job.is_featured}
            />
            {job.is_featured && (
              <span className={styles.featuredBadge}>
                <Star size={12} fill="#fff" />
                ویژه
              </span>
            )}
            <button className={styles.likeBtn} onClick={handleLike}>
              <Heart
                size={isCompact ? 14 : 18}
                fill={isLiked ? '#e67e22' : 'none'}
                color={isLiked ? '#e67e22' : '#fff'}
              />
            </button>
            <div className={`${styles.adTypeOverlay} ${isHiring ? styles.hiringOverlay : styles.seekingOverlay}`}>
              {adTypeIcon}
              <span>{adTypeLabel}</span>
            </div>
          </div>
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <Building2 size={isCompact ? 24 : 40} />
            <span>بدون تصویر</span>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.companyInfo}>
            {!isCompact && (
              <div className={styles.companyLogo}>
                {job.company_logo ? (
                  <Image src={job.company_logo} alt={job.company_name} width={40} height={40} />
                ) : (
                  <Building2 size={20} />
                )}
              </div>
            )}
            <div>
              <div className={styles.titleRow}>
                <h4 className={`${styles.jobTitle} ${isCompact ? styles.compactTitle : ''}`}>
                  {job.title}
                </h4>
                {!isCompact && (
                  <span className={`${styles.adTypeBadge} ${isHiring ? styles.hiringBadge : styles.seekingBadge}`}>
                    {adTypeLabel}
                  </span>
                )}
              </div>
              <span className={styles.companyName}>{job.company_name || '—'}</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            {job.is_verified && (
              <ShieldCheck size={isCompact ? 14 : 16} className={styles.verifiedIcon} />
            )}
            <span className={styles.jobDate}>{formatDate(job.published_at || job.created_at)}</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          {!isCompact && job.description && (
            <p className={styles.jobDescription}>{job.description}</p>
          )}

          {isHiring && renderSalary() && (
            <div className={styles.salaryDisplay}>
              <DollarSign size={isCompact ? 14 : 16} className={styles.salaryIcon} />
              <span className={styles.salaryText}>{renderSalary()}</span>
            </div>
          )}

          {/* ✅ ویژگی‌ها از API */}
          <JobFeatures features={job.features || []} isCompact={isCompact} />

          {/* تگ‌ها */}
          {job.tags?.length > 0 && (
            <div className={`${styles.jobTags} ${isCompact ? styles.compactTags : ''}`}>
              {job.tags.slice(0, isCompact ? 2 : 3).map((tag) => (
                <span key={tag.id} className={styles.tag}>{tag.name}</span>
              ))}
              {isCompact && job.tags.length > 2 && (
                <span className={styles.tagMore}>+{job.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className={`${styles.jobDetails} ${isCompact ? styles.compactDetails : ''}`}>
            <div className={styles.detailItem}>
              <MapPin size={isCompact ? 12 : 14} />
              <span>{isCompact ? job.city_name || locationStr : locationStr}</span>
            </div>
            {job.cooperation_type_name && (
              <div className={styles.detailItem}>
                <Clock size={isCompact ? 12 : 14} />
                <span>{job.cooperation_type_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <Link href={`/jobs/${job.id}`} className={styles.viewBtn}>
            <Eye size={isCompact ? 12 : 14} />
            {!isCompact && 'مشاهده جزئیات'}
          </Link>
          {job.contact_phone ? (
            <a href={`tel:${job.contact_phone}`} className={styles.contactBtn}>
              <Phone size={isCompact ? 12 : 14} />
              {!isCompact && 'تماس'}
            </a>
          ) : (
            <button className={styles.contactBtn} disabled>
              <Phone size={isCompact ? 12 : 14} />
              {!isCompact && 'تماس'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;