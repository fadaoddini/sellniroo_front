// src/components/AllBoxItem/components/JobCard/JobCard.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, MapPin, DollarSign, Clock, Phone, Heart,
  BadgeCheck, User, Briefcase, Star, ChevronLeft,
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
    return new Intl.DateTimeFormat('fa-IR').format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const stop = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const CompanyLabel = ({ name, verified, size = 14, showText = true }) => (
  <span className={`${styles.companyLabel} ${verified ? styles.companyVerified : ''}`}>
    <span className={styles.companyLabelName}>{name || '—'}</span>
    {verified && (
      <span className={styles.verifiedMark} title="شرکت تاییدشده">
        <BadgeCheck size={size} aria-hidden />
        {showText && <em>تاییدشده</em>}
      </span>
    )}
  </span>
);

const JobCard = ({ job, viewMode = 'grid-2' }) => {
  const [isLiked, setIsLiked] = useState(job.is_liked || false);
  const [imageError, setImageError] = useState(false);

  const handleLike = async (e) => {
    stop(e);
    const prev = isLiked;
    setIsLiked(!prev);
    try {
      const res = await jobisellApi.toggleLike(job.id);
      setIsLiked(res.status === 'liked');
    } catch {
      setIsLiked(prev);
    }
  };

  const handleContact = (e) => {
    stop(e);
    if (!job.contact_phone) return;
    window.location.href = `tel:${job.contact_phone}`;
  };

  const isHiring = job.type === 'hiring';
  const isCompanyVerified = Boolean(
    job.company_is_verified || (isHiring && job.is_verified)
  );
  const isCompact = viewMode === 'grid-3';
  const detailHref = `/jobs/${job.id}`;
  const adTypeLabel = isHiring ? 'استخدام' : 'کارجو';
  const adTypeIcon = isHiring ? <Briefcase size={13} /> : <User size={13} />;

  const cardClass = [
    styles.jobCard,
    isHiring ? styles.hiringCard : styles.seekingCard,
    isHiring && isCompanyVerified ? styles.verifiedHiringCard : '',
    isCompact ? styles.compact : '',
    viewMode === 'list' ? styles.listMode : '',
    viewMode === 'image-left' ? styles.imageLeftMode : '',
  ]
    .filter(Boolean)
    .join(' ');

  const locationStr =
    [job.city_name, job.neighborhood_name].filter(Boolean).join('، ') || '—';

  const salaryText = (() => {
    if (!isHiring) return null;
    if (job.min_salary && job.max_salary) {
      return `${formatSalary(job.min_salary)} - ${formatSalary(job.max_salary)} تومان`;
    }
    if (job.min_salary) return `از ${formatSalary(job.min_salary)} تومان`;
    if (job.max_salary) return `تا ${formatSalary(job.max_salary)} تومان`;
    return null;
  })();

  /* ---------- لیست ---------- */
  if (viewMode === 'list') {
    return (
      <article className={cardClass}>
        <Link href={detailHref} className={styles.stretchedLink} aria-label={job.title} />

        <div className={styles.listRow}>
          <div className={`${styles.listIcon} ${isHiring ? styles.hiringIcon : styles.seekingIcon}`}>
            {adTypeIcon}
          </div>

          <div className={styles.listMain}>
            <div className={styles.listTitleRow}>
              <h3 className={styles.listTitle}>{job.title}</h3>
              <span className={`${styles.typeChip} ${isHiring ? styles.hiringChip : styles.seekingChip}`}>
                {adTypeLabel}
              </span>
            </div>
            <CompanyLabel
              name={job.company_name || 'بدون شرکت'}
              verified={isHiring && isCompanyVerified}
              size={13}
            />
            <div className={styles.listMeta}>
              <span><MapPin size={12} />{locationStr}</span>
              {salaryText && <span><DollarSign size={12} />{salaryText}</span>}
            </div>
          </div>

          <div className={styles.listActions}>
            {job.contact_phone ? (
              <button
                type="button"
                className={styles.contactBtn}
                onClick={handleContact}
                aria-label="تماس"
              >
                <Phone size={14} />
                تماس
              </button>
            ) : null}
            <ChevronLeft size={18} className={styles.listChevron} aria-hidden />
          </div>
        </div>
      </article>
    );
  }

  /* ---------- تصویر چپ ---------- */
  if (viewMode === 'image-left') {
    return (
      <article className={cardClass}>
        <Link href={detailHref} className={styles.stretchedLink} aria-label={job.title} />

        <div className={styles.imageLeftLayout}>
          <div className={styles.thumb}>
            {job.image && !imageError ? (
              <Image
                src={job.image}
                alt=""
                fill
                className={styles.thumbImg}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.thumbPlaceholder}>
                <Building2 size={26} />
              </div>
            )}
            {job.is_featured && <span className={styles.featuredBadge}>ویژه</span>}
          </div>

          <div className={styles.imageLeftBody}>
            <div className={styles.listTitleRow}>
              <h3 className={styles.imageLeftTitle}>{job.title}</h3>
              <span className={`${styles.typeChip} ${isHiring ? styles.hiringChip : styles.seekingChip}`}>
                {adTypeLabel}
              </span>
            </div>
            <CompanyLabel
              name={job.company_name || '—'}
              verified={isHiring && isCompanyVerified}
              size={12}
              showText={false}
            />
            <div className={styles.listMeta}>
              <span><MapPin size={12} />{locationStr}</span>
              <span>{formatDate(job.published_at || job.created_at)}</span>
            </div>

            <div className={styles.imageLeftActions}>
              <button
                type="button"
                className={styles.likeBtnInline}
                onClick={handleLike}
                aria-label={isLiked ? 'حذف لایک' : 'لایک'}
              >
                <Heart size={14} fill={isLiked ? '#e67e22' : 'none'} color={isLiked ? '#e67e22' : 'currentColor'} />
              </button>
              {job.contact_phone ? (
                <button
                  type="button"
                  className={styles.contactBtn}
                  onClick={handleContact}
                >
                  <Phone size={13} />
                  تماس
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ---------- گرید ---------- */
  return (
    <article className={cardClass}>
      <Link href={detailHref} className={styles.stretchedLink} aria-label={`مشاهده ${job.title}`} />

      <div className={`${styles.media} ${isCompact ? styles.mediaCompact : ''}`}>
        {job.image && !imageError ? (
          <Image
            src={job.image}
            alt=""
            fill
            className={styles.mediaImg}
            onError={() => setImageError(true)}
            priority={job.is_featured}
          />
        ) : (
          <div className={styles.mediaPlaceholder}>
            <Building2 size={isCompact ? 28 : 36} />
          </div>
        )}

        <div className={styles.mediaTop}>
          <span className={`${styles.typeChip} ${isHiring ? styles.hiringChip : styles.seekingChip}`}>
            {adTypeIcon}
            {adTypeLabel}
          </span>
          {job.is_featured && (
            <span className={styles.featuredBadge}>
              <Star size={11} fill="#fff" />
              ویژه
            </span>
          )}
        </div>

        {isHiring && isCompanyVerified && (
          <span className={styles.verifiedRibbon}>
            <BadgeCheck size={12} />
            شرکت تاییدشده
          </span>
        )}

        <button
          type="button"
          className={styles.likeBtn}
          onClick={handleLike}
          aria-label={isLiked ? 'حذف لایک' : 'لایک'}
        >
          <Heart
            size={isCompact ? 14 : 16}
            fill={isLiked ? '#e67e22' : 'none'}
            color={isLiked ? '#e67e22' : '#fff'}
          />
        </button>
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          {!isCompact && (
            <div className={`${styles.logo} ${isCompanyVerified && isHiring ? styles.logoVerified : ''}`}>
              {job.company_logo ? (
                <Image src={job.company_logo} alt="" width={40} height={40} />
              ) : (
                <Building2 size={18} />
              )}
            </div>
          )}
          <div className={styles.headerText}>
            <h3 className={styles.title}>{job.title}</h3>
            <CompanyLabel
              name={job.company_name || '—'}
              verified={isHiring && isCompanyVerified}
              size={isCompact ? 12 : 14}
              showText={!isCompact}
            />
          </div>
          <time className={styles.date} dateTime={job.published_at || job.created_at}>
            {formatDate(job.published_at || job.created_at)}
          </time>
        </header>

        {!isCompact && job.description && (
          <p className={styles.desc}>{job.description}</p>
        )}

        {salaryText && (
          <div className={styles.salary}>
            <DollarSign size={isCompact ? 13 : 15} />
            <span>{salaryText}</span>
          </div>
        )}

        {!isCompact && (
          <JobFeatures features={(job.features || []).slice(0, 4)} isCompact={false} />
        )}

        {job.tags?.length > 0 && (
          <div className={styles.tags}>
            {job.tags.slice(0, isCompact ? 2 : 3).map((tag) => (
              <span key={tag.id} className={styles.tag}>{tag.name}</span>
            ))}
          </div>
        )}

        <div className={styles.metaRow}>
          <span><MapPin size={13} />{isCompact ? job.city_name || locationStr : locationStr}</span>
          {job.cooperation_type_name && (
            <span><Clock size={13} />{job.cooperation_type_name}</span>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.detailsHint}>
          مشاهده جزئیات
          <ChevronLeft size={14} />
        </span>
        {job.contact_phone ? (
          <button
            type="button"
            className={styles.contactBtn}
            onClick={handleContact}
            aria-label={`تماس با ${job.company_name || 'کارفرما'}`}
          >
            <Phone size={isCompact ? 13 : 15} />
            {!isCompact && 'تماس'}
          </button>
        ) : (
          <span className={styles.contactDisabled} aria-hidden>
            <Phone size={isCompact ? 13 : 15} />
            {!isCompact && 'تماس'}
          </span>
        )}
      </footer>
    </article>
  );
};

export default JobCard;
