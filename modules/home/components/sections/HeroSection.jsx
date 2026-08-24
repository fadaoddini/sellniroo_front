'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { 
  Award, Building2, Factory, Users, TrendingUp, 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2
} from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useAuth } from '../../../../contexts/AuthContext'
import HeroService from '../../../../services/heroService'
import styles from '../../styles/HeroSection.module.css'

const HeroSection = () => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [heroData, setHeroData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false)
  
  const videoRef = useRef(null)
  const scrollRef = useRef(null)
  const bgVideoRef = useRef(null)
  const playerContainerRef = useRef(null)
  const progressBarRef = useRef(null)

  const isAdmin = user?.is_staff || user?.is_superuser || false

  // دریافت دیتا از سرور
  const fetchData = async () => {
    setLoading(true)
    const result = await HeroService.getActiveHero(language)
    
    if (result.success) {
      setHeroData(result.data)
      setError(null)
    } else {
      setError(result.error)
      setHeroData(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [language])

  useEffect(() => {
    setProgress(0)
    setCurrentTime(0)
  }, [selectedVideoIndex])

  // ساخت statsWithVideo از دیتای دریافتی
  const statsWithVideo = useMemo(() => {
    const icons = [Award, Building2, Factory, Users, TrendingUp]
    
    if (heroData?.stats?.length > 0) {
      return heroData.stats.map((stat, index) => {
        const IconComponent = icons[index % icons.length] || Award
        const isFa = language === 'fa'
        
        return {
          id: stat.id,
          value: stat.value || '—',
          label: isFa ? stat.label_fa : stat.label_en,
          icon: IconComponent,
          video: stat.video || '/videos/experience.mp4',
          poster: stat.poster || '/images/experience-poster.jpg',
          badge: isFa ? stat.badge_fa : stat.badge_en,
          title: isFa ? stat.title_fa : stat.title_en,
          desc: isFa ? stat.description_fa : stat.description_en,
          duration: '02:30',
          label_fa: stat.label_fa || '',
          label_en: stat.label_en || '',
          title_fa: stat.title_fa || '',
          title_en: stat.title_en || '',
          description_fa: stat.description_fa || '',
          description_en: stat.description_en || '',
          badge_fa: stat.badge_fa || '',
          badge_en: stat.badge_en || ''
        }
      })
    }
    
    // داده‌های محلی برای fallback
    const localStats = [
      { 
        value: '۱۵+', 
        label_fa: 'سال تجربه',
        label_en: 'Years Experience',
        title_fa: '۱۵ سال تجربه درخشان',
        title_en: '15 Years of Excellence',
        description_fa: 'مشاهده روند پیشرفت و تجربه ما در صنعت ساخت و ساز',
        description_en: 'Witness our growth and expertise in the construction industry',
        badge_fa: '🏆 سال‌ها تجربه',
        badge_en: '🏆 Years of Experience'
      },
      { 
        value: '۱۷۰۰+', 
        label_fa: 'پروژه موفق',
        label_en: 'Successful Projects',
        title_fa: 'بیش از ۱۷۰۰ پروژه موفق',
        title_en: 'Over 1700 Successful Projects',
        description_fa: 'نمونه‌ای از پروژه‌های مسکونی، صنعتی و تجاری',
        description_en: 'Examples of residential, industrial, and commercial projects',
        badge_fa: '🏗️ پروژه‌های موفق',
        badge_en: '🏗️ Successful Projects'
      },
      { 
        value: '۵', 
        label_fa: 'کارخانه فعال',
        label_en: 'Active Factories',
        title_fa: '۵ کارخانه فعال در سراسر کشور',
        title_en: '5 Active Factories Across the Country',
        description_fa: 'تولید انبوه سازه‌های LSF با تکنولوژی روز',
        description_en: 'Mass production of LSF structures with modern technology',
        badge_fa: '🏭 کارخانه‌های ما',
        badge_en: '🏭 Our Factories'
      },
      { 
        value: '۱۰۰+', 
        label_fa: 'همکار',
        label_en: 'Colleagues',
        title_fa: 'تیمی متشکل از ۱۰۰+ همکار',
        title_en: 'A Team of 100+ Colleagues',
        description_fa: 'همکاران متخصص در زمینه اجرای پروژه‌های عمرانی',
        description_en: 'Specialized colleagues in construction project execution',
        badge_fa: '👥 تیم حرفه‌ای',
        badge_en: '👥 Professional Team'
      },
      { 
        value: '۹۶%', 
        label_fa: 'رضایت مشتری',
        label_en: 'Client Satisfaction',
        title_fa: '۹۶٪ رضایت مشتریان',
        title_en: '96% Client Satisfaction',
        description_fa: 'نظرات و بازخوردهای مثبت مشتریان از پروژه‌های ما',
        description_en: 'Positive feedback and reviews from our clients',
        badge_fa: '⭐ رضایت مشتریان',
        badge_en: '⭐ Client Satisfaction'
      }
    ]
    
    return localStats.map((stat, index) => {
      const IconComponent = icons[index % icons.length] || Award
      const isFa = language === 'fa'
      return {
        id: index,
        value: stat.value,
        label: isFa ? stat.label_fa : stat.label_en,
        icon: IconComponent,
        title: isFa ? stat.title_fa : stat.title_en,
        desc: isFa ? stat.description_fa : stat.description_en,
        badge: isFa ? stat.badge_fa : stat.badge_en,
        video: `/videos/${['experience', 'projects', 'factory', 'team', 'satisfaction'][index]}.mp4`,
        poster: `/images/${['experience', 'projects', 'factory', 'team', 'satisfaction'][index]}-poster.jpg`,
        duration: '02:30',
        label_fa: stat.label_fa,
        label_en: stat.label_en,
        title_fa: stat.title_fa,
        title_en: stat.title_en,
        description_fa: stat.description_fa,
        description_en: stat.description_en,
        badge_fa: stat.badge_fa,
        badge_en: stat.badge_en
      }
    })
  }, [heroData, language])

  // ============================================
  // کنترل‌های ویدیو
  // ============================================
  
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime
      const dur = videoRef.current.duration
      setCurrentTime(current)
      setDuration(dur)
      if (!isDraggingProgress) {
        setProgress((current / dur) * 100)
      }
    }
  }, [isDraggingProgress])

  const handleProgressClick = useCallback((e) => {
    if (videoRef.current && videoRef.current.duration && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const newTime = percentage * videoRef.current.duration
      videoRef.current.currentTime = newTime
      setProgress(percentage * 100)
    }
  }, [])

  const handleProgressMouseDown = useCallback((e) => {
    setIsDraggingProgress(true)
    handleProgressClick(e)
  }, [handleProgressClick])

  const handleProgressMouseMove = useCallback((e) => {
    if (isDraggingProgress && videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const newTime = percentage * videoRef.current.duration
      videoRef.current.currentTime = newTime
      setProgress(percentage * 100)
    }
  }, [isDraggingProgress])

  const handleProgressMouseUp = useCallback(() => {
    setIsDraggingProgress(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.() ||
      playerContainerRef.current.webkitRequestFullscreen?.() ||
      playerContainerRef.current.msRequestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.() ||
      document.msExitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // گوش دادن به رویدادهای موس برای dragging
  useEffect(() => {
    if (isDraggingProgress) {
      document.addEventListener('mousemove', handleProgressMouseMove)
      document.addEventListener('mouseup', handleProgressMouseUp)
    } else {
      document.removeEventListener('mousemove', handleProgressMouseMove)
      document.removeEventListener('mouseup', handleProgressMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove)
      document.removeEventListener('mouseup', handleProgressMouseUp)
    }
  }, [isDraggingProgress, handleProgressMouseMove, handleProgressMouseUp])

  const selectVideo = useCallback((index) => {
    if (index === selectedVideoIndex) return
    setSelectedVideoIndex(index)
    setProgress(0)
    setCurrentTime(0)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.load()
      setTimeout(() => {
        videoRef.current.play()
        setIsPlaying(true)
      }, 100)
    }
  }, [selectedVideoIndex])

  // کشیدن با موس برای اسکرول استتس
  const handleMouseDown = (e) => {
    if (scrollRef.current) {
      setIsDragging(true)
      setStartX(e.pageX - scrollRef.current.offsetLeft)
      setScrollLeft(scrollRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (scrollRef.current) {
      setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
      setScrollLeft(scrollRef.current.scrollLeft)
    }
  }

  const handleTouchMove = (e) => {
    if (!scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  if (loading) {
    return (
      <section className={styles.hero} aria-label="Loading">
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.loading} role="status">در حال بارگذاری...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {/* Structured Data - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "هلدینگ آریا استاد",
            "url": "https://ariastudholding.com/about",
            "logo": "https://ariastudholding.com/images/logo.png",
            "description": heroData?.description || "هلدینگ آریا اِستاد - پیشرو در صنعت ساخت و ساز",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IR"
            }
          })
        }}
      />

      {/* ویدیو پس‌زمینه */}
      <div className={styles.bgVideoWrapper}>
        <video
          ref={bgVideoRef}
          className={styles.bgVideo}
          src={heroData?.background_video || '/videos/bg.mp4'}
          poster={heroData?.background_poster || '/images/hero-bg-poster.jpg'}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className={styles.bgVideoOverlay} />
      </div>

      <div className="container">
        <div className={styles.heroContent}>
          {/* سمت چپ - متن و آمار */}
          <div className={styles.heroLeft}>
            <div className={styles.heroText}>
              <span className={styles.heroBadge}>
                {heroData?.badge || 'پیشرو در صنعت ساخت و ساز'}
              </span>
              <h1 id="hero-title" className={styles.heroTitle}>
                {heroData?.title || 'هلدینگ آریا اِستاد'}
              </h1>
              <p className={styles.heroDesc}>
                {heroData?.description || 'با بیش از یک دهه تجربه درخشان در زمینه مشاوره، طراحی و اجرای سازه‌های مسکونی، صنعتی و تجاری با استفاده از جدیدترین تکنولوژی‌های روز دنیا'}
              </p>
              <a 
                href="https://ariastudholding.com/about" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.heroLink}
                aria-label="بازدید از سایت اصلی هلدینگ آریا استاد"
              >
                آریا استاد هلدینگ
                <span className={styles.heroLinkArrow}>→</span>
              </a>
            </div>

            {/* Stats Grid - 3 Columns */}
            <div className={styles.statsRecyclerView}>
              <div 
                ref={scrollRef}
                className={`${styles.statsGrid} ${isDragging ? styles.dragging : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                role="tablist"
                aria-label="انتخاب ویدیوهای آمار"
              >
                {statsWithVideo.map((stat, index) => (
                  <div 
                    key={stat.id || index} 
                    className={`${styles.statCard} ${selectedVideoIndex === index ? styles.active : ''}`}
                    onClick={() => selectVideo(index)}
                    role="tab"
                    aria-selected={selectedVideoIndex === index}
                    aria-label={`${stat.label} - ${stat.value}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectVideo(index)
                      }
                    }}
                  >
                    {/* شش ضلعی اصلی */}
                    <div className={styles.statHexagon}>
                      {/* آیکون پلی روی شش ضلعی */}
                      <div className={styles.playIconOverlay}>
                        <Play size={18} className={styles.playIconOnStat} />
                      </div>

                      {/* محتوای شش ضلعی */}
                      <div className={styles.statHexagonContent}>
                        <stat.icon 
                          className={styles.statHexagonIcon} 
                          aria-hidden="true" 
                        />
                        <span className={styles.statHexagonValue}>
                          {stat.value}
                        </span>
                        <span className={styles.statHexagonLabel}>
                          {stat.label}
                        </span>
                      </div>

                      {/* نشانگر فعال */}
                      {selectedVideoIndex === index && (
                        <div className={styles.statActiveIndicator} aria-hidden="true" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================
              سمت راست - پلیر حرفه‌ای
              ============================================ */}
          <div className={styles.heroRight}>
            <div className={styles.heroImage}>
              <div 
                className={`${styles.videoPlayer} ${isFullscreen ? styles.fullscreen : ''}`}
                ref={playerContainerRef}
              >
                <div className={styles.videoWrapper}>
                  <video
                    ref={videoRef}
                    className={styles.video}
                    poster={statsWithVideo[selectedVideoIndex]?.poster}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration)
                      }
                    }}
                    aria-label={`ویدیو: ${statsWithVideo[selectedVideoIndex]?.title}`}
                  >
                    <source src={statsWithVideo[selectedVideoIndex]?.video} type="video/mp4" />
                    مرورگر شما از ویدیو پشتیبانی نمی‌کند.
                  </video>
                  
                  {/* دکمه پخش مرکزی */}
                  <button 
                    className={styles.playButton} 
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'مکث' : 'پخش'}
                  >
                    {isPlaying ? (
                      <Pause size={24} fill="white" aria-hidden="true" />
                    ) : (
                      <Play size={24} fill="white" aria-hidden="true" />
                    )}
                  </button>
                  
                  {/* ==========================================
                      کنترل‌های ویدیو - حرفه‌ای
                      ========================================== */}
                  <div className={styles.videoControls}>
                    {/* نوار پیشرفت */}
                    <div 
                      ref={progressBarRef}
                      className={styles.progressBar}
                      onClick={handleProgressClick}
                      onMouseDown={handleProgressMouseDown}
                      role="slider"
                      aria-label="نوار پیشرفت ویدیو"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${progress}%` }}
                      />
                      <div 
                        className={styles.progressThumb} 
                        style={{ left: `${progress}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    
                    {/* دکمه‌های کنترل */}
                    <div className={styles.controlsBottom}>
                      <button 
                        className={styles.controlBtn} 
                        onClick={togglePlay} 
                        aria-label={isPlaying ? 'مکث' : 'پخش'}
                      >
                        {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                      </button>
                      
                      <button 
                        className={styles.controlBtn} 
                        onClick={toggleMute} 
                        aria-label={isMuted ? 'صدا روشن' : 'صدا خاموش'}
                      >
                        {isMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
                      </button>
                      
                      <span className={styles.videoTimeText}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      
                      <button 
                        className={styles.controlBtn} 
                        onClick={toggleFullscreen} 
                        aria-label={isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه'}
                      >
                        {isFullscreen ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* کپشن ویدیو */}
                <div className={styles.videoCaption}>
                  <h2 className={styles.videoTitle}>
                    {statsWithVideo[selectedVideoIndex]?.title}
                  </h2>
                  <p className={styles.videoDesc}>
                    {statsWithVideo[selectedVideoIndex]?.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection