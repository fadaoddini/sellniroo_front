'use client'

import React, { useState } from 'react'
import { 
  Instagram, Facebook, Twitter, Youtube, Linkedin, 
  TrendingUp, Users, Heart, MessageCircle, Eye,
  Calendar, Clock, Plus, Search, Filter,
  Edit, Trash2, MoreVertical, CheckCircle, XCircle,
  Send, Image, Video, Music, FileText, Link2
} from 'lucide-react'
import styles from '../../../styles/modules/SocialDashboard.module.css'

// داده‌های نمونه
const mockPosts = [
  {
    id: 1,
    platform: 'instagram',
    title: 'پروژه جدید LSF',
    content: 'نمونه‌ای از جدیدترین پروژه سازه LSF با طراحی مدرن و مقاوم',
    image: '/projects/project1.jpg',
    likes: 245,
    comments: 34,
    shares: 12,
    views: 1250,
    status: 'published',
    createdAt: '2026-06-15',
    scheduledDate: null,
    tags: ['LSF', 'سازه', 'مدرن'],
    engagement: 4.2,
  },
  {
    id: 2,
    platform: 'instagram',
    title: 'کناف مدرن',
    content: 'سیستم‌های کناف با طراحی زیبا و عایق‌بندی عالی',
    image: '/projects/project2.jpg',
    likes: 189,
    comments: 28,
    shares: 8,
    views: 980,
    status: 'published',
    createdAt: '2026-06-12',
    scheduledDate: null,
    tags: ['کناف', 'دکوراسیون', 'مدرن'],
    engagement: 3.8,
  },
  {
    id: 3,
    platform: 'instagram',
    title: 'مشاوره رایگان',
    content: 'همین امروز با کارشناسان ما تماس بگیرید و از مشاوره رایگان بهره‌مند شوید',
    image: '/projects/project3.jpg',
    likes: 312,
    comments: 45,
    shares: 23,
    views: 2100,
    status: 'published',
    createdAt: '2026-06-10',
    scheduledDate: null,
    tags: ['مشاوره', 'رایگان', 'ساخت'],
    engagement: 5.1,
  },
  {
    id: 4,
    platform: 'instagram',
    title: 'تکنولوژی جدید',
    content: 'استفاده از جدیدترین تکنولوژی‌ها در ساخت سازه‌های LSF',
    image: '/projects/project4.jpg',
    likes: 156,
    comments: 19,
    shares: 6,
    views: 780,
    status: 'scheduled',
    createdAt: '2026-06-08',
    scheduledDate: '2026-06-20',
    tags: ['تکنولوژی', 'LSF', 'نوآوری'],
    engagement: 0,
  },
  {
    id: 5,
    platform: 'instagram',
    title: 'پروژه مسکونی',
    content: 'اجرای موفق پروژه مسکونی با سازه LSF در کمتر از ۳ ماه',
    image: '/projects/project5.jpg',
    likes: 278,
    comments: 38,
    shares: 15,
    views: 1650,
    status: 'published',
    createdAt: '2026-06-05',
    scheduledDate: null,
    tags: ['مسکونی', 'LSF', 'سرعت اجرا'],
    engagement: 4.7,
  },
  {
    id: 6,
    platform: 'instagram',
    title: 'محیط زیست و LSF',
    content: 'سازه‌های LSF با مواد قابل بازیافت و سازگار با محیط زیست',
    image: '/projects/project6.jpg',
    likes: 201,
    comments: 27,
    shares: 10,
    views: 1120,
    status: 'draft',
    createdAt: '2026-06-18',
    scheduledDate: null,
    tags: ['محیط زیست', 'پایدار', 'LSF'],
    engagement: 0,
  },
]

const mockStats = {
  instagram: {
    followers: 15240,
    following: 320,
    posts: 145,
    engagement: 4.5,
    reach: 45000,
    impressions: 125000,
    profileViews: 8500,
  },
  facebook: {
    followers: 8900,
    following: 150,
    posts: 89,
    engagement: 3.2,
    reach: 28000,
    impressions: 72000,
    profileViews: 4200,
  },
  twitter: {
    followers: 4500,
    following: 200,
    posts: 56,
    engagement: 2.8,
    reach: 15000,
    impressions: 38000,
    profileViews: 2100,
  },
  youtube: {
    followers: 3200,
    following: 0,
    posts: 34,
    engagement: 4.8,
    reach: 12000,
    impressions: 45000,
    profileViews: 1800,
  },
  linkedin: {
    followers: 6800,
    following: 180,
    posts: 67,
    engagement: 3.5,
    reach: 22000,
    impressions: 58000,
    profileViews: 3500,
  },
}

const SocialDashboard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram')
  const [posts, setPosts] = useState(mockPosts)
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  const platforms = [
    { id: 'instagram', name: 'اینستاگرام', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'فیسبوک', icon: Facebook, color: '#1877F2' },
    { id: 'twitter', name: 'توییتر', icon: Twitter, color: '#1DA1F2' },
    { id: 'youtube', name: 'یوتیوب', icon: Youtube, color: '#FF0000' },
    { id: 'linkedin', name: 'لینکدین', icon: Linkedin, color: '#0A66C2' },
  ]

  const statusOptions = [
    { id: 'all', label: 'همه' },
    { id: 'published', label: 'منتشر شده' },
    { id: 'scheduled', label: 'برنامه‌ریزی شده' },
    { id: 'draft', label: 'پیش‌نویس' },
  ]

  const getFilteredPosts = () => {
    let filtered = posts.filter(p => p.platform === selectedPlatform)
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.includes(searchTerm) || 
        p.content.includes(searchTerm) ||
        p.tags.some(tag => tag.includes(searchTerm))
      )
    }
    
    return filtered
  }

  const getStatusBadge = (status) => {
    const badges = {
      published: { label: 'منتشر شده', icon: CheckCircle, color: '#34c759' },
      scheduled: { label: 'برنامه‌ریزی شده', icon: Calendar, color: '#007aff' },
      draft: { label: 'پیش‌نویس', icon: FileText, color: '#ff9500' },
    }
    return badges[status] || badges.draft
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fa-IR')
  }

  const platformStats = mockStats[selectedPlatform] || mockStats.instagram

  return (
    <div className={styles.dashboardContainer}>
      {/* هدر */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>📱 مدیریت شبکه‌های اجتماعی</h1>
          <p className={styles.pageDesc}>مدیریت یکپارچه تمام شبکه‌های اجتماعی شرکت</p>
        </div>
        <button 
          className={styles.createPostBtn}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          <span>محتوا جدید</span>
        </button>
      </div>

      {/* انتخاب پلتفرم */}
      <div className={styles.platformSelector}>
        {platforms.map(platform => (
          <button
            key={platform.id}
            className={`${styles.platformBtn} ${selectedPlatform === platform.id ? styles.activePlatform : ''}`}
            onClick={() => setSelectedPlatform(platform.id)}
            style={{ 
              borderColor: selectedPlatform === platform.id ? platform.color : 'transparent',
              background: selectedPlatform === platform.id ? `${platform.color}15` : 'transparent'
            }}
          >
            <platform.icon size={22} style={{ color: selectedPlatform === platform.id ? platform.color : '#8e8e93' }} />
            <span>{platform.name}</span>
            <span className={styles.postCount}>
              {posts.filter(p => p.platform === platform.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* آمار پلتفرم */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(228, 64, 95, 0.1)', color: '#E4405F' }}>
            <Users size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{platformStats.followers.toLocaleString()}</span>
            <span className={styles.statLabel}>دنبال‌کنندگان</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{platformStats.engagement}%</span>
            <span className={styles.statLabel}>نرخ تعامل</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007aff' }}>
            <Eye size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{platformStats.reach.toLocaleString()}</span>
            <span className={styles.statLabel}>دسترسی</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}>
            <Heart size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{platformStats.impressions.toLocaleString()}</span>
            <span className={styles.statLabel}>تأثیرگذاری</span>
          </div>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          {statusOptions.map(status => (
            <button
              key={status.id}
              className={`${styles.filterBtn} ${filterStatus === status.id ? styles.activeFilter : ''}`}
              onClick={() => setFilterStatus(status.id)}
            >
              {status.label}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی محتوا..."
            className={styles.searchInput}
          />
        </div>
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <span>▦</span>
          </button>
          <button 
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span>☰</span>
          </button>
        </div>
      </div>

      {/* لیست محتواها */}
      <div className={viewMode === 'grid' ? styles.postsGrid : styles.postsList}>
        {getFilteredPosts().map(post => {
          const statusBadge = getStatusBadge(post.status)
          const StatusIcon = statusBadge.icon
          
          return (
            <div key={post.id} className={styles.postCard}>
              <div className={styles.postImage}>
                <div className={styles.postPlaceholder}>
                  <span>🖼️</span>
                </div>
                <div className={styles.postStatus}>
                  <StatusIcon size={14} style={{ color: statusBadge.color }} />
                  <span>{statusBadge.label}</span>
                </div>
              </div>
              <div className={styles.postContent}>
                <div className={styles.postHeader}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <button className={styles.postMenu}>
                    <MoreVertical size={18} />
                  </button>
                </div>
                <p className={styles.postDesc}>{post.content}</p>
                <div className={styles.postTags}>
                  {post.tags.map((tag, i) => (
                    <span key={i} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
                <div className={styles.postFooter}>
                  <div className={styles.postStats}>
                    <div className={styles.statItem}>
                      <Heart size={14} />
                      <span>{post.likes}</span>
                    </div>
                    <div className={styles.statItem}>
                      <MessageCircle size={14} />
                      <span>{post.comments}</span>
                    </div>
                    <div className={styles.statItem}>
                      <Eye size={14} />
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <div className={styles.postDate}>
                    <Clock size={14} />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                {post.scheduledDate && (
                  <div className={styles.scheduledInfo}>
                    <Calendar size={14} />
                    <span>برنامه‌ریزی شده برای: {formatDate(post.scheduledDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* مودال ایجاد محتوا */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>➕ ایجاد محتوای جدید</h2>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>پلتفرم</label>
                <select className={styles.formSelect}>
                  <option value="instagram">اینستاگرام</option>
                  <option value="facebook">فیسبوک</option>
                  <option value="twitter">توییتر</option>
                  <option value="youtube">یوتیوب</option>
                  <option value="linkedin">لینکدین</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>عنوان</label>
                <input type="text" placeholder="عنوان محتوا..." className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label>متن محتوا</label>
                <textarea rows="4" placeholder="متن محتوا را وارد کنید..." className={styles.formTextarea} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>وضعیت</label>
                  <select className={styles.formSelect}>
                    <option value="published">منتشر شده</option>
                    <option value="scheduled">برنامه‌ریزی شده</option>
                    <option value="draft">پیش‌نویس</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>تاریخ انتشار</label>
                  <input type="date" className={styles.formInput} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>تگ‌ها</label>
                <input type="text" placeholder="تگ‌ها را با کاما جدا کنید..." className={styles.formInput} />
              </div>
              <div className={styles.formActions}>
                <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  انصراف
                </button>
                <button className={styles.submitBtn}>
                  <Send size={18} />
                  انتشار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SocialDashboard
