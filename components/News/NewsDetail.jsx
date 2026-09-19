// components/News/NewsDetail.jsx

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Calendar, 
  Image, 
  Newspaper,
  User,
  Building,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Clock,
  Tag,
  Reply,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle,
  X,
  Plus,
  Heart as HeartOff,
  Check,
  XCircle
} from 'lucide-react';
import newsService from '@/services/newsService';
import { useAuth } from '@/contexts/AuthContext';
import styles from './NewsDetail.module.css';

// ✅ لینک ثابت به صفحه ال‌اس‌اف
const LSF_PAGE_URL = 'https://ariastudholding.com/%D8%A7%D9%84%D9%80%D8%A7%D8%B3%D9%80%D8%A7%D9%81';

// ✅ فرمت تاریخ
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

// ✅ فرمت زمان نسبی
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'چند لحظه پیش';
    if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} روز پیش`;
    return formatDate(dateStr);
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
  const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (imagePath.startsWith('/media/')) {
    return `${base}${imagePath}`;
  }
  if (imagePath.startsWith('media/')) {
    return `${base}/${imagePath}`;
  }
  return `${base}/media/${imagePath.replace(/^\/+/, '')}`;
};

// ============================================================
// 🔹 کامپوننت Dialog/Modal سفارشی
// ============================================================
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.dialogOverlay} onClick={handleOverlayClick}>
      <div className={`${styles.dialog} ${styles[type]}`}>
        <button className={styles.dialogClose} onClick={onClose}>
          <X size={20} />
        </button>
        <div className={styles.dialogIcon}>
          {type === 'danger' && <AlertTriangle size={40} />}
          {type === 'success' && <CheckCircle size={40} />}
          {type === 'warning' && <AlertTriangle size={40} />}
        </div>
        <h3 className={styles.dialogTitle}>{title}</h3>
        <p className={styles.dialogMessage}>{message}</p>
        <div className={styles.dialogActions}>
          <button className={styles.dialogCancel} onClick={onClose}>
            {cancelText || 'لغو'}
          </button>
          <button className={`${styles.dialogConfirm} ${styles[type]}`} onClick={onConfirm}>
            {confirmText || 'تأیید'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 🔹 کامپوننت Toast
// ============================================================
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastIcon}>
        {type === 'success' && <CheckCircle size={20} />}
        {type === 'error' && <AlertTriangle size={20} />}
        {type === 'info' && <Plus size={20} />}
      </div>
      <span className={styles.toastMessage}>{message}</span>
      <button className={styles.toastClose} onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

// ============================================================
// 🔹 کامپوننت کامنت
// ============================================================
const CommentItem = ({ comment, depth = 0, onReply, onLike, onDelete, currentUser, isAdmin }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);

  const handleLike = async () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
      setLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setLiked(true);
      await onLike(comment.id);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
    setSubmitting(false);
  };

  const isOwner = currentUser?.id === comment.user?.id;

  return (
    <div className={`${styles.commentItem} ${depth > 0 ? styles.commentNested : ''}`} style={{ marginRight: depth * 20 }}>
      <div className={styles.commentHeader}>
        <div className={styles.commentUser}>
          <div className={styles.commentAvatar}>
            {comment.user_avatar ? (
              <img src={comment.user_avatar} alt={comment.display_name} />
            ) : (
              <span>{comment.display_name?.[0] || 'U'}</span>
            )}
          </div>
          <div className={styles.commentUserInfo}>
            <span className={styles.commentUserName}>{comment.display_name || 'کاربر ناشناس'}</span>
            <span className={styles.commentDate}>{comment.time_ago || timeAgo(comment.created_at)}</span>
          </div>
        </div>
        <div className={styles.commentActions}>
          <button className={styles.commentLikeBtn} onClick={handleLike}>
            {liked ? <Heart size={14} fill="currentColor" /> : <HeartOff size={14} />}
            <span>{likeCount}</span>
          </button>
        </div>
      </div>

      <p className={styles.commentText}>{comment.text}</p>

      <div className={styles.commentFooter}>
        <button 
          className={styles.commentReplyBtn}
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <Reply size={14} />
          پاسخ
        </button>
        {(isOwner || isAdmin) && (
          <button 
            className={styles.commentDeleteBtn}
            onClick={() => onDelete(comment.id)}
          >
            <Trash2 size={14} />
            حذف
          </button>
        )}
        {isAdmin && comment.status === 'pending' && (
          <button 
            className={styles.commentApproveBtn}
            onClick={() => onDelete(comment.id, 'approve')}
          >
            <Check size={14} />
            تایید
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className={styles.replyForm}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="پاسخ خود را بنویسید..."
            rows="2"
          />
          <div className={styles.replyFormActions}>
            <button 
              className={styles.replySubmitBtn}
              onClick={handleSubmitReply}
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? <Loader2 size={16} className={styles.spinner} /> : 'ارسال پاسخ'}
            </button>
            <button 
              className={styles.replyCancelBtn}
              onClick={() => setShowReplyForm(false)}
            >
              لغو
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.commentReplies}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              currentUser={currentUser}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 🔹 کامپوننت اصلی NewsDetail
// ============================================================
const NewsDetail = ({ slug }) => {
  const { user, isAuthenticated } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newsId, setNewsId] = useState(null);

  const commentInputRef = useRef(null);

  // بررسی ادمین
  useEffect(() => {
    setIsAdmin(user?.is_staff || user?.is_superuser || false);
  }, [user]);

  // دریافت خبر
  useEffect(() => {
    const fetchNews = async () => {
      if (!slug) {
        setError('شناسه خبر معتبر نیست');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await newsService.getNewsBySlug(slug);
        
        if (result.success && result.data) {
          setNews(result.data);
          setNewsId(result.data.id);
          setLikeCount(result.data.like_count || 0);
          setViewCount(result.data.view_count || 0);
          
          // دریافت کامنت‌ها از API
          await fetchComments(result.data.id);
          
          // افزایش بازدید
          await newsService.incrementView(slug).catch(() => {});
        } else {
          setError(result.error || 'خبر یافت نشد');
        }
      } catch (err) {
        console.error('Error loading news:', err);
        setError('خطا در دریافت خبر');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  // دریافت کامنت‌ها
  const fetchComments = useCallback(async (newsId) => {
    try {
      const result = await newsService.getComments(newsId);
      if (result.success) {
        setComments(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, []);

  // ============================================================
  // 🔹 توابع مدیریت
  // ============================================================

  // لایک کردن خبر
  const handleLike = useCallback(async () => {
    if (!slug) return;
    
    try {
      if (liked) {
        setLikeCount(prev => prev - 1);
        setLiked(false);
      } else {
        setLikeCount(prev => prev + 1);
        setLiked(true);
        await newsService.incrementLike(slug);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      if (liked) {
        setLikeCount(prev => prev + 1);
        setLiked(true);
      } else {
        setLikeCount(prev => prev - 1);
        setLiked(false);
      }
    }
  }, [slug, liked]);

  // اشتراک‌گذاری
  const handleShare = useCallback(async () => {
    if (!slug) return;

    try {
      await newsService.incrementShare(slug);
      
      const shareUrl = `${window.location.origin}/news/${slug}`;
      
      if (navigator.share) {
        await navigator.share({
          title: news?.title || 'خبر',
          text: news?.excerpt || 'مشاهده این خبر',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('لینک خبر کپی شد!', 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        showToast('خطا در اشتراک‌گذاری', 'error');
      }
    }
  }, [slug, news]);

  // ارسال کامنت
  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || !newsId) return;
    
    setSubmittingComment(true);
    
    try {
      const result = await newsService.addComment(
        newsId,
        commentText,
        null, // parent
        !isAuthenticated ? guestName : null,
        !isAuthenticated ? guestEmail : null
      );
      
      if (result.success) {
        showToast('نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود', 'success');
        setCommentText('');
        setGuestName('');
        setGuestEmail('');
        setShowCommentForm(false);
        // رفرش کامنت‌ها
        await fetchComments(newsId);
      } else {
        showToast(result.error || 'خطا در ارسال نظر', 'error');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      showToast('خطا در ارسال نظر', 'error');
    } finally {
      setSubmittingComment(false);
    }
  }, [commentText, newsId, isAuthenticated, guestName, guestEmail, fetchComments]);

  // پاسخ به کامنت
  const handleReply = useCallback(async (commentId, replyText) => {
    if (!newsId) return;
    
    try {
      const result = await newsService.addComment(
        newsId,
        replyText,
        commentId,
        !isAuthenticated ? guestName : null,
        !isAuthenticated ? guestEmail : null
      );
      
      if (result.success) {
        showToast('پاسخ شما با موفقیت ثبت شد', 'success');
        await fetchComments(newsId);
      } else {
        showToast(result.error || 'خطا در ارسال پاسخ', 'error');
      }
    } catch (error) {
      console.error('Error replying:', error);
      showToast('خطا در ارسال پاسخ', 'error');
    }
  }, [newsId, isAuthenticated, guestName, guestEmail, fetchComments]);

  // لایک کامنت
  const handleCommentLike = useCallback(async (commentId) => {
    try {
      await newsService.likeComment(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }, []);

  // حذف/تایید کامنت
  const handleCommentAction = useCallback(async (commentId, action = 'delete') => {
    const actionMap = {
      delete: {
        title: 'حذف کامنت',
        message: 'آیا از حذف این کامنت اطمینان دارید؟ این عمل قابل بازگشت نیست.',
        confirmText: 'حذف',
        type: 'danger',
        fn: async () => {
          await newsService.deleteComment(commentId);
          await fetchComments(newsId);
          showToast('کامنت با موفقیت حذف شد', 'success');
        }
      },
      approve: {
        title: 'تایید کامنت',
        message: 'آیا از تایید این کامنت اطمینان دارید؟',
        confirmText: 'تایید',
        type: 'success',
        fn: async () => {
          await newsService.approveComment(commentId);
          await fetchComments(newsId);
          showToast('کامنت با موفقیت تایید شد', 'success');
        }
      },
      reject: {
        title: 'رد کامنت',
        message: 'آیا از رد این کامنت اطمینان دارید؟',
        confirmText: 'رد',
        type: 'danger',
        fn: async () => {
          await newsService.rejectComment(commentId);
          await fetchComments(newsId);
          showToast('کامنت با موفقیت رد شد', 'success');
        }
      }
    };

    const config = actionMap[action];
    if (!config) return;

    setConfirmAction(() => async () => {
      await config.fn();
      setShowConfirmDialog(false);
    });
    
    setShowConfirmDialog(true);
  }, [newsId, fetchComments]);

  // نمایش Toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // بستن Toast
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // بستن Dialog
  const closeDialog = useCallback(() => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  }, []);

  // ============================================================
  // 🔹 رندرها
  // ============================================================

  // حالت بارگذاری
  if (loading) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.skeletonDetail}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonText} style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  // ❌ حالت خطا
  if (error || !news) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.errorState}>
          <Newspaper size={60} className={styles.errorIcon} />
          <h3>{error || 'خبر یافت نشد'}</h3>
          <p>لطفاً به صفحه اخبار بازگردید</p>
          <Link href="/news" className={styles.backBtn}>
            <ArrowRight size={16} />
            بازگشت به اخبار
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    subtitle,
    description,
    excerpt,
    publish_date,
    source_name,
    source_link,
    featured_image_display,
    featured_image,
    images = [],
    reading_time,
    status_label,
    is_featured,
    is_breaking,
    is_exclusive,
    keywords = [],
    writer_name_display,
    category_detail
  } = news;

  // ساخت گالری تصاویر
  const galleryImages = [];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
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

  // برچسب‌های ویژه
  const badges = [];
  if (is_featured) badges.push({ label: 'ویژه', className: styles.badgeFeatured });
  if (is_breaking) badges.push({ label: 'فوری', className: styles.badgeBreaking });
  if (is_exclusive) badges.push({ label: 'اختصاصی', className: styles.badgeExclusive });

  return (
    <div className={styles.detailContainer}>
      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={closeDialog}
        onConfirm={confirmAction}
        title="حذف کامنت"
        message="آیا از حذف این کامنت اطمینان دارید؟ این عمل قابل بازگشت نیست."
        confirmText="حذف"
        cancelText="لغو"
        type="danger"
      />

      {/* JSON-LD برای SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "description": excerpt || description?.substring(0, 200),
            "datePublished": publish_date,
            "dateModified": publish_date,
            "author": {
              "@type": "Person",
              "name": writer_name_display || source_name || "هلدینگ آریا استاد"
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
              "@id": `${baseUrl}/news/${slug}`
            },
            "image": displayImage ? [displayImage] : undefined
          })
        }}
      />

      {/* نوار بالایی */}
      <div className={styles.topBar}>
        <Link href="/news" className={styles.backLink}>
          <ArrowRight size={16} />
          بازگشت به لیست اخبار
        </Link>
        
       
      </div>

      {/* برچسب‌های ویژه */}
      {badges.length > 0 && (
        <div className={styles.badgesWrapper}>
          {badges.map((badge, index) => (
            <span key={index} className={`${styles.badge} ${badge.className}`}>
              {badge.label}
            </span>
          ))}
          {status_label && (
            <span className={styles.badgeStatus}>{status_label}</span>
          )}
        </div>
      )}

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
        
        {subtitle && (
          <h2 className={styles.detailSubtitle}>{subtitle}</h2>
        )}

        <div className={styles.detailMeta}>
          <span className={styles.metaItem}>
            <Calendar size={14} />
            {formatDate(publish_date)}
          </span>
          <span className={styles.metaItem}>
            <Clock size={14} />
            {reading_time ? `${reading_time} دقیقه مطالعه` : 'زمان مطالعه نامشخص'}
          </span>
          <span className={styles.metaItem}>
            <Eye size={14} />
            {viewCount || 0} بازدید
          </span>
          {writer_name_display && (
            <span className={styles.metaItem}>
              <User size={14} />
              {writer_name_display}
            </span>
          )}
          {source_name && (
            <span className={styles.metaItem}>
              <Building size={14} />
              {source_name}
              {source_link && (
                <a href={source_link} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  (منبع)
                </a>
              )}
            </span>
          )}
          {category_detail && (
            <span className={styles.metaItem}>
              <Tag size={14} />
              {category_detail.name}
            </span>
          )}
        </div>

        {excerpt && (
          <div className={styles.detailExcerpt}>
            {excerpt}
          </div>
        )}

        {/* ✅ اصلاح شده: استفاده از description به جای content */}
        {description && (
          <div 
            className={styles.detailContentText}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {/* کلمات کلیدی */}
        {keywords && keywords.length > 0 && (
          <div className={styles.keywordsWrapper}>
            <span className={styles.keywordsLabel}>کلمات کلیدی:</span>
            <div className={styles.keywordsList}>
              {keywords.map((keyword, index) => (
                <span key={index} className={styles.keywordTag}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* دکمه‌های تعامل */}
        <div className={styles.interactionBar}>
          <button 
            className={`${styles.interactionBtn} ${liked ? styles.interactionBtnLiked : ''}`}
            onClick={handleLike}
          >
            {liked ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
            <span>{likeCount || 0}</span>
          </button>
          
          <button 
            className={styles.interactionBtn}
            onClick={() => {
              setShowCommentForm(!showCommentForm);
              if (!showCommentForm) {
                setTimeout(() => commentInputRef.current?.focus(), 100);
              }
            }}
          >
            <MessageCircle size={18} />
            <span>{comments.length || 0}</span>
          </button>
          
          <button 
            className={styles.interactionBtn}
            onClick={handleShare}
          >
            <Share2 size={18} />
            <span>اشتراک‌گذاری</span>
          </button>
        </div>

        {/* فرم کامنت */}
        {showCommentForm && (
          <div className={styles.commentFormWrapper}>
            <h3 className={styles.commentFormTitle}>
              <MessageCircle size={18} />
              ارسال نظر
            </h3>
            
            {!isAuthenticated && (
              <div className={styles.commentGuestFields}>
                <input
                  type="text"
                  placeholder="نام شما *"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={styles.commentInput}
                  required
                />
                <input
                  type="email"
                  placeholder="ایمیل (اختیاری)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={styles.commentInput}
                />
              </div>
            )}
            
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              rows="4"
              className={styles.commentTextarea}
            />
            
            <div className={styles.commentFormActions}>
              <button 
                className={styles.commentSubmitBtn}
                onClick={handleSubmitComment}
                disabled={submittingComment || !commentText.trim() || (!isAuthenticated && !guestName.trim())}
              >
                {submittingComment ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <ArrowLeft size={16} />
                )}
                ارسال نظر
              </button>
              <button 
                className={styles.commentCancelBtn}
                onClick={() => setShowCommentForm(false)}
              >
                لغو
              </button>
            </div>
          </div>
        )}

        {/* بخش کامنت‌ها */}
        {comments.length > 0 && (
          <div className={styles.commentsSection}>
            <h3 className={styles.commentsTitle}>
              <MessageCircle size={18} />
              نظرات ({comments.length})
            </h3>
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onLike={handleCommentLike}
                  onDelete={(id, action) => handleCommentAction(id, action || 'delete')}
                  currentUser={user}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        )}

    
      </div>
    </div>
  );
};

export default NewsDetail;