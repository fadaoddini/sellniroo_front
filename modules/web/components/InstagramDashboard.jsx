'use client'

import React, { useState, useEffect } from 'react'
import { 
  Instagram, Heart, MessageCircle, Eye, 
  Clock, Calendar, Plus, Send, Image as ImageIcon,
  Video, Repeat, Trash2, Reply, MoreVertical,
  Loader2, Users, TrendingUp, Camera
} from 'lucide-react'
import { createInstagramService, getInstagramToken, getInstagramUserId } from '../../../services/instagramService'
import styles from '../../../styles/modules/InstagramDashboard.module.css'

const InstagramDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({
    imageUrl: '',
    caption: '',
    mediaType: 'image',
  })
  const [publishing, setPublishing] = useState(false)

  // بارگذاری داده‌ها
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const service = createInstagramService()
      
      // دریافت اطلاعات کاربر
      const user = await service.getUserInfo()
      setUserInfo(user)
      
      // دریافت پست‌ها
      const postsData = await service.getPosts(20)
      setPosts(postsData.data || [])
      
      // دریافت استوری‌ها
      try {
        const storiesData = await service.getStories()
        setStories(storiesData.data || [])
      } catch (err) {
        console.log('No stories available')
        setStories([])
      }
      
      // دریافت آمار
      const statsData = await service.getPostStats()
      setStats(statsData)
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'خطا در بارگذاری داده‌ها')
    } finally {
      setLoading(false)
    }
  }

  // بارگذاری کامنت‌های یک پست
  const loadComments = async (mediaId) => {
    try {
      const service = createInstagramService()
      const commentsData = await service.getComments(mediaId)
      setComments(commentsData.data || [])
      setSelectedPost(mediaId)
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }

  // ارسال پاسخ به کامنت
  const handleReply = async (commentId) => {
    if (!replyText.trim()) return
    
    try {
      const service = createInstagramService()
      await service.replyToComment(commentId, replyText)
      
      // به‌روزرسانی لیست کامنت‌ها
      await loadComments(selectedPost)
      setReplyText('')
      setReplyingTo(null)
      
    } catch (err) {
      console.error('Error replying to comment:', err)
      alert('خطا در ارسال پاسخ: ' + err.message)
    }
  }

  // انتشار پست جدید
  const handlePublishPost = async () => {
    if (!newPost.imageUrl.trim()) {
      alert('لطفاً آدرس تصویر را وارد کنید')
      return
    }

    try {
      setPublishing(true)
      const service = createInstagramService()
      
      let container
      if (newPost.mediaType === 'video') {
        container = await service.createVideoContainer(
          newPost.imageUrl,
          newPost.caption,
          newPost.imageUrl // thumbnail
        )
      } else {
        container = await service.createMediaContainer(
          newPost.imageUrl,
          newPost.caption
        )
      }
      
      await service.publishMedia(container.id)
      
      // به‌روزرسانی لیست پست‌ها
      await loadData()
      
      setShowCreatePost(false)
      setNewPost({
        imageUrl: '',
        caption: '',
        mediaType: 'image',
      })
      
    } catch (err) {
      console.error('Error publishing post:', err)
      alert('خطا در انتشار پست: ' + err.message)
    } finally {
      setPublishing(false)
    }
  }

  // حذف پست
  const handleDeletePost = async (mediaId) => {
    if (!window.confirm('آیا از حذف این پست اطمینان دارید؟')) return
    
    try {
      const service = createInstagramService()
      await service.deleteMedia(mediaId)
      await loadData()
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('خطا در حذف پست: ' + err.message)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // فرمت تاریخ
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={40} className={styles.spinner} />
        <p>در حال بارگذاری داده‌ها...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h3>⚠️ خطا در بارگذاری</h3>
          <p>{error}</p>
          <button onClick={loadData} className={styles.retryBtn}>
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* هدر و اطلاعات کاربر */}
      <div className={styles.dashboardHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <Instagram size={28} />
          </div>
          <div className={styles.userDetails}>
            <h2 className={styles.username}>{userInfo?.username || 'نام کاربری'}</h2>
            <p className={styles.userBio}>{userInfo?.biography || 'بدون توضیحات'}</p>
          </div>
        </div>
        <div className={styles.userStats}>
          <div className={styles.userStat}>
            <span className={styles.statNumber}>{userInfo?.followers_count?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>دنبال‌کننده</span>
          </div>
          <div className={styles.userStat}>
            <span className={styles.statNumber}>{userInfo?.follows_count?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>دنبال‌شونده</span>
          </div>
          <div className={styles.userStat}>
            <span className={styles.statNumber}>{userInfo?.media_count?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>پست</span>
          </div>
        </div>
      </div>

      {/* کارت‌های آماری */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(225, 48, 108, 0.1)', color: '#E1306C' }}>
              <Heart size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalLikes.toLocaleString()}</span>
              <span className={styles.statLabel}>مجموع لایک</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007aff' }}>
              <MessageCircle size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalComments.toLocaleString()}</span>
              <span className={styles.statLabel}>مجموع کامنت</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.avgLikes}</span>
              <span className={styles.statLabel}>میانگین لایک</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}>
              <Repeat size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.avgComments}</span>
              <span className={styles.statLabel}>میانگین کامنت</span>
            </div>
          </div>
        </div>
      )}

      {/* دکمه پست جدید */}
      <div className={styles.actionBar}>
        <button 
          className={styles.createPostBtn}
          onClick={() => setShowCreatePost(!showCreatePost)}
        >
          <Plus size={20} />
          <span>پست جدید</span>
        </button>
        <button className={styles.refreshBtn} onClick={loadData}>
          <Repeat size={18} />
          <span>به‌روزرسانی</span>
        </button>
      </div>

      {/* فرم ایجاد پست */}
      {showCreatePost && (
        <div className={styles.createPostForm}>
          <h3>📝 ایجاد پست جدید</h3>
          <div className={styles.formGroup}>
            <label>نوع محتوا</label>
            <select 
              value={newPost.mediaType}
              onChange={(e) => setNewPost({ ...newPost, mediaType: e.target.value })}
              className={styles.formSelect}
            >
              <option value="image">تصویر</option>
              <option value="video">ویدیو</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>آدرس تصویر/ویدیو</label>
            <input
              type="url"
              value={newPost.imageUrl}
              onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>متن پست</label>
            <textarea
              value={newPost.caption}
              onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
              placeholder="متن پست را وارد کنید..."
              rows="3"
              className={styles.formTextarea}
            />
          </div>
          <div className={styles.formActions}>
            <button 
              className={styles.cancelBtn}
              onClick={() => setShowCreatePost(false)}
            >
              انصراف
            </button>
            <button 
              className={styles.publishBtn}
              onClick={handlePublishPost}
              disabled={publishing}
            >
              {publishing ? 'در حال انتشار...' : (
                <>
                  <Send size={18} />
                  انتشار
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* لیست پست‌ها */}
      <div className={styles.postsSection}>
        <h3 className={styles.sectionTitle}>📸 پست‌های اینستاگرام</h3>
        
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <Camera size={48} />
            <p>هیچ پستی یافت نشد</p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postMedia}>
                  {post.media_type === 'VIDEO' ? (
                    <div className={styles.videoBadge}>
                      <Video size={20} />
                    </div>
                  ) : post.media_type === 'CAROUSEL_ALBUM' ? (
                    <div className={styles.carouselBadge}>
                      <Repeat size={20} />
                    </div>
                  ) : null}
                  <div className={styles.postPlaceholder}>
                    <ImageIcon size={32} />
                  </div>
                </div>
                
                <div className={styles.postContent}>
                  <div className={styles.postHeader}>
                    <p className={styles.postCaption}>
                      {post.caption || 'بدون توضیحات'}
                    </p>
                    <button 
                      className={styles.postMenu}
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className={styles.postStats}>
                    <span className={styles.statItem}>
                      <Heart size={14} />
                      {post.like_count || 0}
                    </span>
                    <span className={styles.statItem}>
                      <MessageCircle size={14} />
                      {post.comments_count || 0}
                    </span>
                  </div>
                  
                  <div className={styles.postDate}>
                    <Clock size={14} />
                    <span>{formatDate(post.timestamp)}</span>
                  </div>
                  
                  <button 
                    className={styles.commentsBtn}
                    onClick={() => loadComments(post.id)}
                  >
                    <MessageCircle size={16} />
                    <span>مشاهده کامنت‌ها</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* بخش کامنت‌ها */}
      {selectedPost && (
        <div className={styles.commentsSection}>
          <div className={styles.commentsHeader}>
            <h3>💬 کامنت‌ها</h3>
            <button 
              className={styles.closeComments}
              onClick={() => {
                setSelectedPost(null)
                setComments([])
              }}
            >
              ✕
            </button>
          </div>
          
          {comments.length === 0 ? (
            <p className={styles.noComments}>هیچ کامنتی برای این پست وجود ندارد</p>
          ) : (
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentUser}>{comment.username || 'کاربر'}</span>
                    <span className={styles.commentDate}>{formatDate(comment.timestamp)}</span>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
                  
                  {comment.replies && comment.replies.data && comment.replies.data.length > 0 && (
                    <div className={styles.repliesList}>
                      {comment.replies.data.map((reply) => (
                        <div key={reply.id} className={styles.replyItem}>
                          <div className={styles.replyHeader}>
                            <span className={styles.replyUser}>{reply.username || 'کاربر'}</span>
                          </div>
                          <p className={styles.replyText}>{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {replyingTo === comment.id ? (
                    <div className={styles.replyForm}>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="پاسخ خود را بنویسید..."
                        className={styles.replyInput}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                      />
                      <button 
                        className={styles.sendReplyBtn}
                        onClick={() => handleReply(comment.id)}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={styles.replyBtn}
                      onClick={() => {
                        setReplyingTo(comment.id)
                        setReplyText('')
                      }}
                    >
                      <Reply size={14} />
                      پاسخ
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InstagramDashboard
