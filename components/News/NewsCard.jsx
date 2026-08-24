import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faImage } from '@fortawesome/free-solid-svg-icons';
import styles from './News.module.css';
import Config from '@/config/config';

const NewsCard = ({ news, index }) => {
  if (!news) return null;

  const {
    id,
    title,
    excerpt,
    featured_image_display,
    featured_image,
    publish_date,
    source_name,
    images = [],
  } = news;

  // ✅ اگر id وجود نداشت، از index استفاده کن
  const newsId = id || `news-${index}`;

  // ✅ تابع ساخت آدرس کامل تصویر
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/media/')) {
      return `${Config.baseUrl}${imagePath}`;
    }
    
    if (imagePath.startsWith('media/')) {
      return `${Config.baseUrl}/${imagePath}`;
    }
    
    return `${Config.baseUrl}/media/${imagePath.replace(/^\/+/, '')}`;
  };

  // ✅ دریافت آدرس تصویر
  const getImageUrl = () => {
    if (featured_image_display) {
      return getFullImageUrl(featured_image_display);
    }
    
    if (featured_image) {
      return getFullImageUrl(featured_image);
    }
    
    if (images && images.length > 0) {
      const firstImg = images[0];
      const imgUrl = firstImg.image_display || firstImg.image;
      if (imgUrl) {
        return getFullImageUrl(imgUrl);
      }
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
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
    <Link href={`/news/${newsId}`} className={styles.cardLink}>
      <div className={`${styles.card} ${styles.cardHover}`}>
        <div className={styles.cardImage}>
          {hasImage ? (
            <img
              src={imageUrl}
              alt={title || 'خبر'}
              className={styles.cardImageInner}
              loading={index < 3 ? 'eager' : 'lazy'}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.querySelector('.fallback-image')?.classList.remove('hidden');
              }}
            />
          ) : (
            <div className={styles.cardImagePlaceholder}>
              <FontAwesomeIcon icon={faImage} className={styles.cardImageIcon} />
            </div>
          )}
          <div className="fallback-image hidden">
            <div className={styles.cardImagePlaceholder}>
              <FontAwesomeIcon icon={faImage} className={styles.cardImageIcon} />
            </div>
          </div>
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