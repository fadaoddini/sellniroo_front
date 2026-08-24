// components/News/NewsCard.jsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { faCalendar, faEye, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './News.module.css';

const NewsCard = ({ news, index }) => {
  if (!news) return null;

  const {
    id,
    title,
    excerpt,
    featured_image_display,
    publish_date,
    source_name,
    images = [],
    link
  } = news;

  const imageUrl = featured_image_display || images?.[0]?.image_display || '/images/default-news.jpg';
  const hasImage = imageUrl && !imageUrl.includes('default-news.jpg');

  // تاریخ به صورت شمسی
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
    <Link href={`/news/${id}`} className={styles.cardLink}>
      <div className={`${styles.card} ${styles.cardHover}`}>
        {/* تصویر شاخص */}
        <div className={styles.cardImage}>
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={title || 'خبر'}
              fill
              className={styles.cardImageInner}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className={styles.cardImagePlaceholder}>
              <FontAwesomeIcon icon={faImage} className={styles.cardImageIcon} />
            </div>
          )}
          {/* برچسب تعداد تصاویر */}
          {images?.length > 0 && (
            <div className={styles.imageCount}>
              <FontAwesomeIcon icon={faImage} size="xs" />
              <span>{images.length}</span>
            </div>
          )}
        </div>

        {/* محتوای کارت */}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title}</h3>
          
          {excerpt && (
            <p className={styles.cardExcerpt}>{excerpt}</p>
          )}

          <div className={styles.cardFooter}>
            <div className={styles.cardMeta}>
              <span className={styles.cardDate}>
                <FontAwesomeIcon icon={faCalendar} />
                {formatDate(publish_date)}
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