// src/components/AllBoxItem/components/JobCard/JobCard.jsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Building2, MapPin, DollarSign, Clock, Phone, Heart, Eye, 
  ChevronLeft, ShieldCheck, User, Users, Briefcase, Star
} from 'lucide-react'
import JobFeatures from './JobFeatures'
import styles from './JobCard.module.css'

// تابع فرمت کردن قیمت
const formatSalary = (amount) => {
  if (!amount) return null
  return new Intl.NumberFormat('fa-IR').format(amount)
}

const JobCard = ({ job, viewMode = 'grid-2' }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const isHiring = job.type === 'hiring'
  const adTypeLabel = isHiring ? 'استخدام' : 'کارجو'
  const adTypeIcon = isHiring ? <Briefcase size={14} /> : <User size={14} />
  const cardClass = isHiring ? styles.hiringCard : styles.seekingCard

  // نمایش حقوق
  const renderSalary = () => {
    if (!isHiring) return null
    if (job.minSalary && job.maxSalary) {
      return `${formatSalary(job.minSalary)} - ${formatSalary(job.maxSalary)} تومان`
    }
    if (job.minSalary) {
      return `از ${formatSalary(job.minSalary)} تومان`
    }
    if (job.maxSalary) {
      return `تا ${formatSalary(job.maxSalary)} تومان`
    }
    return null
  }

  // حالت لیستی
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
              <span className={styles.listItemCompany}>{job.company}</span>
            </div>
          </div>
          <div className={styles.listItemRight}>
            <span className={`${styles.adTypeBadge} ${isHiring ? styles.hiringBadge : styles.seekingBadge}`}>
              {adTypeLabel}
            </span>
            {job.isVerified && (
              <ShieldCheck size={14} className={styles.verifiedIcon} />
            )}
            <span className={styles.listItemLocation}>
              <MapPin size={12} />
              {job.location}
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
    )
  }

  // حالت تصویر-چپ
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
                {job.isFeatured && (
                  <span className={styles.imageLeftBadge}>ویژه</span>
                )}
                <button 
                  className={styles.imageLeftLike}
                  onClick={handleLike}
                >
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
              <span className={styles.imageLeftCompany}>{job.company}</span>
            </div>

            <div className={styles.imageLeftDetails}>
              <div className={styles.imageLeftDetail}>
                <MapPin size={12} />
                <span>{job.location}</span>
              </div>
             
            </div>

            {/* ویژگی‌ها در حالت تصویر-چپ */}
           

            

            <div className={styles.imageLeftFooter}>
              <Link href={`/jobs/${job.id}`} className={styles.imageLeftViewBtn}>
                <Eye size={12} />
              </Link>
              <button className={styles.imageLeftContactBtn}>
                <Phone size={12} />
              </button>
              <span className={styles.imageLeftDate}>{job.date}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // حالت دو ستونه و سه ستونه
  const isCompact = viewMode === 'grid-3'

  return (
    <div className={`${styles.jobCard} ${cardClass}`}>
      {/* بخش تصویر شاخص */}
      <div className={`${styles.cardImageWrapper} ${isCompact ? styles.compactImage : ''}`}>
        {job.image && !imageError ? (
          <div className={styles.cardImage}>
            <Image
              src={job.image}
              alt={job.title}
              fill
              className={styles.image}
              onError={() => setImageError(true)}
              priority={job.isFeatured}
            />
            {job.isFeatured && (
              <span className={styles.featuredBadge}>
                <Star size={12} fill="#fff" />
                ویژه
              </span>
            )}
            <button 
              className={styles.likeBtn}
              onClick={handleLike}
            >
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

      {/* محتوای کارت */}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.companyInfo}>
            {!isCompact && (
              <div className={styles.companyLogo}>
                <Building2 size={20} />
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
              <span className={styles.companyName}>{job.company}</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            {job.isVerified && (
              <ShieldCheck size={isCompact ? 14 : 16} className={styles.verifiedIcon} />
            )}
            <span className={styles.jobDate}>{job.date}</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          {!isCompact && (
            <p className={styles.jobDescription}>{job.description}</p>
          )}
          
          {/* نمایش حقوق برای آگهی‌های استخدام */}
          {isHiring && renderSalary() && (
            <div className={styles.salaryDisplay}>
              <DollarSign size={isCompact ? 14 : 16} className={styles.salaryIcon} />
              <span className={styles.salaryText}>{renderSalary()}</span>
            </div>
          )}

          {/* ویژگی‌های آگهی */}
          <JobFeatures job={job} isCompact={isCompact} />

          <div className={`${styles.jobTags} ${isCompact ? styles.compactTags : ''}`}>
            {job.tags.slice(0, isCompact ? 2 : 3).map((tag, index) => (
              <span key={index} className={styles.tag}>{tag}</span>
            ))}
            {isCompact && job.tags.length > 2 && (
              <span className={styles.tagMore}>+{job.tags.length - 2}</span>
            )}
          </div>

          <div className={`${styles.jobDetails} ${isCompact ? styles.compactDetails : ''}`}>
            <div className={styles.detailItem}>
              <MapPin size={isCompact ? 12 : 14} />
              <span>{isCompact ? job.location.split('،')[0] : job.location}</span>
            </div>
            <div className={styles.detailItem}>
              <Clock size={isCompact ? 12 : 14} />
              <span>{job.cooperationType}</span>
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <Link href={`/jobs/${job.id}`} className={styles.viewBtn}>
            <Eye size={isCompact ? 12 : 14} />
            {!isCompact && 'مشاهده جزئیات'}
          </Link>
          <button className={styles.contactBtn}>
            <Phone size={isCompact ? 12 : 14} />
            {!isCompact && 'تماس'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobCard