// components/News/NewsDetail.jsx

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faCalendar, 
  faImage, 
  faNewspaper,
  faUser,
  faBuilding,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import styles from './NewsDetail.module.css';

// ✅ لینک ثابت به صفحه ال‌اس‌اف
const LSF_PAGE_URL = 'https://ariastudholding.com/%D8%A7%D9%84%D9%80%D8%A7%D8%B3%D9%80%D8%A7%D9%81';

// ✅ تابع فرمت تاریخ (سمت سرور)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// ✅ تابع ساخت آدرس کامل تصویر
const getFullImageUrl = (imagePath, baseUrl) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/media/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  if (imagePath.startsWith('media/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  return `${baseUrl}/media/${imagePath.replace(/^\/+/, '')}`;
};

// ✅ دریافت اطلاعات خبر با آدرس کامل
async function getNewsDetail(id, baseUrl) {
  try {
    // ✅ استفاده از آدرس کامل
    const apiUrl = `${baseUrl}/api/news/${id}`;
    console.log('Fetching news from:', apiUrl);
    
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('API response not OK:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching news detail:', error);
    return null;
  }
}

// ✅ کامپوننت اصلی - Server Component
const NewsDetail = async ({ id }) => {
  // ✅ دریافت baseUrl از محیط
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  process.env.NEXT_PUBLIC_API_URL || 
                  'https://ariastudholding.com';

  // ✅ دریافت اطلاعات خبر
  const news = await getNewsDetail(id, baseUrl);

  // ❌ اگر خبر وجود نداشت
  if (!news) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.errorState}>
          <FontAwesomeIcon icon={faNewspaper} className={styles.errorIcon} />
          <h3>خبر یافت نشد</h3>
          <p>لطفاً به صفحه اخبار بازگردید</p>
          <Link href="/news" className={styles.backBtn}>
            <FontAwesomeIcon icon={faArrowRight} />
            بازگشت به اخبار
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    content,
    excerpt,
    publish_date,
    source_name,
    source_link,
    featured_image_display,
    featured_image,
    images = [],
  } = news;

  // ساخت گالری تصاویر
  const galleryImages = [];
  
  const featuredImg = featured_image_display || featured_image;
  if (featuredImg) {
    const fullUrl = getFullImageUrl(featuredImg, baseUrl);
    if (fullUrl) {
      galleryImages.push({
        url: fullUrl,
        alt: title,
        isFeatured: true
      });
    }
  }
  
  images.forEach(img => {
    const imgUrl = img.image_display || img.image;
    if (imgUrl) {
      const fullUrl = getFullImageUrl(imgUrl, baseUrl);
      if (fullUrl && !galleryImages.some(g => g.url === fullUrl)) {
        galleryImages.push({
          url: fullUrl,
          alt: img.alt_text || title,
          isFeatured: false
        });
      }
    }
  });

  const displayImage = galleryImages.length > 0 ? galleryImages[0].url : null;

  return (
    <div className={styles.detailContainer}>
      {/* JSON-LD برای SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "description": excerpt || content?.substring(0, 200),
            "datePublished": publish_date,
            "dateModified": publish_date,
            "author": {
              "@type": "Organization",
              "name": source_name || "هلدینگ آریا استاد"
            },
            "publisher": {
              "@type": "Organization",
              "name": "هلدینگ آریا استاد",
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/images/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${baseUrl}/news/${id}`
            },
            "image": displayImage ? [displayImage] : undefined
          })
        }}
      />

      {/* نوار بالایی */}
      <div className={styles.topBar}>
        <Link href="/news" className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowRight} />
          بازگشت به لیست اخبار
        </Link>
        
        <a 
          href={LSF_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.lsfLink}
        >
          <FontAwesomeIcon icon={faBuilding} />
          سازه ال اس اف
          <FontAwesomeIcon icon={faArrowLeft} className={styles.lsfLinkArrow} />
        </a>
      </div>

      {/* گالری تصاویر */}
      {galleryImages.length > 0 && displayImage && (
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img
              src={displayImage}
              alt={title}
              className={styles.mainImageInner}
            />
          </div>
          
          {galleryImages.length > 1 && (
            <div className={styles.thumbnailList}>
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${index === 0 ? styles.thumbnailActive : ''}`}
                >
                  <img src={img.url} alt={img.alt} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* محتوای خبر */}
      <div className={styles.detailContent}>
        <h1 className={styles.detailTitle}>{title}</h1>
        
        <div className={styles.detailMeta}>
          <span className={styles.metaItem}>
            <FontAwesomeIcon icon={faCalendar} />
            {formatDate(publish_date)}
          </span>
          {source_name && (
            <span className={styles.metaItem}>
              <FontAwesomeIcon icon={faUser} />
              {source_name}
              {source_link && (
                <a href={source_link} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  (منبع)
                </a>
              )}
            </span>
          )}
          {images.length > 0 && (
            <span className={styles.metaItem}>
              <FontAwesomeIcon icon={faImage} />
              {images.length} تصویر
            </span>
          )}
        </div>

        {excerpt && (
          <div className={styles.detailExcerpt}>
            {excerpt}
          </div>
        )}

        {content && (
          <div className={styles.detailContentText}>
            {content.split('\n').map((paragraph, index) => {
              if (paragraph.trim()) {
                return <p key={index}>{paragraph}</p>;
              }
              return <br key={index} />;
            })}
          </div>
        )}

        {/* بنر پایین */}
        <div className={styles.lsfBanner}>
          <div className={styles.lsfBannerContent}>
            <FontAwesomeIcon icon={faBuilding} className={styles.lsfBannerIcon} />
            <div className={styles.lsfBannerText}>
              <h3>آشنایی با سازه‌های ال اس اف (LSF)</h3>
              <p>مشاهده اطلاعات کامل درباره سازه‌های سبک فولادی ال اس اف</p>
            </div>
            <a 
              href={LSF_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.lsfBannerBtn}
            >
              مشاهده
              <FontAwesomeIcon icon={faArrowLeft} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;