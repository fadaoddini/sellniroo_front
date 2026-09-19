// components/News/NewsCard.jsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faImage } from '@fortawesome/free-solid-svg-icons';
import styles from './News.module.css';
import Config from '@/config/config';

const NewsCard = ({ news, index }) => {
  if (!news) return null;

  const {
    slug,        // ✅ استفاده از slug
    id,          // ✅ fallback به id
    title,
    excerpt,
    featured_image_display,
    featured_image,
    publish_date,
    source_name,
    images = [],
  } = news;

  // ✅ اولویت با slug، اگر نبود از id استفاده کن
  const newsSlug = slug || id || `news-${index}`;
  
  console.log('🔗 NewsCard slug:', newsSlug, 'id:', id);

  // ساخت آدرس کامل تصویر
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = Config.baseUrl || 'http://localhost:8000';
    if (imagePath.startsWith('/media/')) {
      return `${baseUrl}${imagePath}`;
    }
    if (imagePath.startsWith('media/')) {
      return `${baseUrl}/${imagePath}`;
    }
    return `${baseUrl}/media/${imagePath.replace(/^\/+/, '')}`;
  };

  const imageUrl = getFullImageUrl(featured_image_display || featured_image || images?.[0]?.image_display);
  const hasImage = imageUrl && imageUrl.length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Link href={`/news/${newsSlug}`} className={styles.cardLink}>
      <div className={`${styles.card} ${styles.cardHover}`}>
        <div className={styles.cardImage}>
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={title || 'خبر'}
              fill
              className={styles.cardImageInner}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading={index < 3 ? 'eager' : 'lazy'}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className={styles.cardImagePlaceholder}>
              <FontAwesomeIcon icon={faImage} className={styles.cardImageIcon} />
            </div>
          )}
          {images?.length > 0 && (
            <div className={styles.imageCount}>
              <FontAwesomeIcon icon={faImage} size="xs" />
              <span>{images.length}</span>
            </div>
          )}
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title || 'بدون عنوان'}</h3>
          
          {excerpt && (
            <p className={styles.cardExcerpt}>{excerpt}</p>
          )}

          <div className={styles.cardFooter}>
            <div className={styles.cardMeta}>
              <span className={styles.cardDate}>
                <FontAwesomeIcon icon={faCalendar} />
                {formatDate(publish_date) || 'تاریخ نامشخص'}
              </span>
              {source_name && (
                <span className={styles.cardSource}>{source_name}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;