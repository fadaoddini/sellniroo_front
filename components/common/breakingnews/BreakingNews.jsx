// components/BreakingNews.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import moment from 'moment-jalaali'
import { 
  Megaphone, Check, X,
  LogIn, LogOut, Phone, Settings, LayoutDashboard, 
  Brain, Gamepad2, User, HandCoins, Info
} from 'lucide-react'
import styles from './BreakingNews.module.css'

moment.loadPersian({ dialect: 'persian-modern' })

const BreakingNews = () => {
  const { user, isAuthenticated, logout, loading } = useAuth()
  
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const phoneNumberRef = useRef('')

  const typingTimerRef = useRef(null)
  const pauseTimerRef = useRef(null)
  const profileDropdownRef = useRef(null)

  const news = [
    { id: 1, text: 'بهترین فرصت‌های شغلی فروش و بازاریابی را با ما پیدا کنید' },
    { id: 2, text: 'رزومه خود را ارسال کنید و به تیم حرفه‌ای ما بپیوندید' },
    { id: 3, text: 'استخدام بازاریاب و فروشنده حرفه‌ای - شرایط عالی' },
    { id: 4, text: 'برای مشاوره شغلی رایگان با ما تماس بگیرید: ۰۲۱-۱۲۳۴۵۶۷۸' },
    { id: 5, text: 'بیش از ۵۰۰ فرصت شغلی در سراسر کشور' }
  ]

  const t = {
    login: "ورود",
    consult: "مشاوره شغلی",
    about: "درباره ما",
    logout: "خروج",
    profile: "پروفایل من",
    settings: "تنظیمات",
    dashboard: "داشبورد",
    marketing: "بازاریابی",
    challenge: "چالش مهندسین",
    game: "بازی",
    dearUser: "کاربر عزیز"
  }

  // تشخیص موبایل
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getPersianDate = () => {
    const now = new Date()
    const m = moment(now)
    
    const weekDays = {
      'Saturday': 'شنبه', 'Sunday': 'یکشنبه', 'Monday': 'دوشنبه',
      'Tuesday': 'سه‌شنبه', 'Wednesday': 'چهارشنبه',
      'Thursday': 'پنجشنبه', 'Friday': 'جمعه'
    }
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ]
    
    const jYear = m.jYear()
    const jMonth = m.jMonth()
    const jDate = m.jDate()
    const dayOfWeek = m.format('dddd')
    const persianDay = weekDays[dayOfWeek] || dayOfWeek
    const persianMonth = monthNames[jMonth]
    
    return `${persianDay} ${jDate} ${persianMonth} ${jYear}`
  }

  const startTyping = (text) => {
    setIsTyping(true)
    setDisplayText('')
    
    let charIndex = 0
    const fullText = text
    
    if (typingTimerRef.current) clearInterval(typingTimerRef.current)
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    
    const speed = Math.min(100, Math.max(40, 70 - fullText.length * 0.15))
    
    typingTimerRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayText(fullText.substring(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
        setIsTyping(false)
        
        pauseTimerRef.current = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % news.length)
        }, 4000)
      }
    }, speed)
  }

  useEffect(() => {
    const encoded = 'MDkxNTEyNDQ4OTg='
    phoneNumberRef.current = atob(encoded)
  }, [])
  
  const handleConsultClick = () => {
    if (phoneNumberRef.current) {
      window.location.href = `tel:${phoneNumberRef.current}`
    }
  }

  // بستن با کلیک بیرون — فقط در حالت دسکتاپ
  useEffect(() => {
    if (isMobile) return
    
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile])

  // قفل اسکرول بدنه در حالت موبایل وقتی دیالوگ بازه
  useEffect(() => {
    if (isMobile && isProfileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobile, isProfileOpen])

  // بستن با کلید Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsProfileOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  useEffect(() => {
    const currentNews = news[currentIndex]
    startTyping(currentNews.text)
    
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [currentIndex])

  useEffect(() => {
    setCurrentDate(getPersianDate())
    const dateInterval = setInterval(() => {
      setCurrentDate(getPersianDate())
    }, 60000)
    return () => clearInterval(dateInterval)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsProfileOpen(false)
  }

  const getUserDisplayName = () => {
    if (!user) return t.dearUser
    return user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.mobile
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const first = user.first_name?.[0] || ""
    const last = user.last_name?.[0] || ""
    return (first + last).toUpperCase() || user.mobile?.slice(0, 2) || "U"
  }

  const isMenuItemActive = (href) => {
    if (typeof window === 'undefined') return false
    const pathname = window.location.pathname
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href) || pathname === href
  }

  const profileMenuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.dashboard },
    { href: '/profile',   icon: User,            label: t.profile },
    { href: '/sale',      icon: HandCoins,       label: t.marketing },
    { href: '/quiz',      icon: Brain,           label: t.challenge },
    { href: '/game',      icon: Gamepad2,        label: t.game },
  ]

  // محتوای منو (استفاده در هر دو حالت دسکتاپ و موبایل)
  const ProfileMenuContent = () => (
    <>
      {/* هدر پروفایل */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user.image ? (
            <Image 
              src={user.image} 
              alt={t.profile}
              width={48}
              height={48}
              className={styles.profileAvatarImage}
            />
          ) : (
            <div className={styles.profileAvatarPlaceholder}>
              {getUserInitials()}
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h4>{getUserDisplayName()}</h4>
          <p>{user.mobile}</p>
        </div>
        {/* دکمه بستن فقط در موبایل */}
        {isMobile && (
          <button 
            className={styles.closeDialogBtn}
            onClick={() => setIsProfileOpen(false)}
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className={styles.profileDivider} />

      {/* آیتم‌های منو */}
      {profileMenuItems.map((item) => {
        const isActive = isMenuItemActive(item.href)
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.profileMenuItem} ${
              isActive ? styles.activeMenuItem : ''
            }`}
            onClick={() => setIsProfileOpen(false)}
          >
            <item.icon size={isMobile ? 20 : 16} />
            <span>{item.label}</span>
            {isActive && <Check size={14} className={styles.activeCheck} />}
          </Link>
        )
      })}

      <div className={styles.profileDivider} />

      <Link 
        href="/settings" 
        className={`${styles.profileMenuItem} ${
          isMenuItemActive('/settings') ? styles.activeMenuItem : ''
        }`}
        onClick={() => setIsProfileOpen(false)}
      >
        <Settings size={isMobile ? 20 : 16} />
        <span>{t.settings}</span>
      </Link>

      <button 
        className={`${styles.profileMenuItem} ${styles.logoutItem}`} 
        onClick={handleLogout}
      >
        <LogOut size={isMobile ? 20 : 16} />
        <span>{t.logout}</span>
      </button>
    </>
  )

  return (
    <div className={styles.breakingNews}>
      <div className={styles.container}>
        {/* بخش چپ */}
        <div className={styles.newsLeft}>
          <div className={styles.newsLabel}>
            <Megaphone size={16} className={styles.labelIcon} />
          </div>
          <div className={styles.newsContent}>
            <span className={styles.newsText}>
              {displayText}
              {isTyping && <span className={styles.cursor}>|</span>}
            </span>
          </div>
        </div>

        {/* بخش راست */}
        <div className={styles.newsRight}>
          <button className={styles.consultButton} onClick={handleConsultClick}>
            <Phone size={14} />
            <span>{t.consult}</span>
          </button>

          <Link href="/about" className={styles.aboutButton}>
            <Info size={14} />
            <span>{t.about}</span>
          </Link>

          {loading ? (
            <div className={styles.loginButton} style={{ opacity: 0.5 }}>
              <span>...</span>
            </div>
          ) : isAuthenticated && user ? (
            <>
              {/* دکمه پروفایل */}
              <div className={styles.profileSection} ref={profileDropdownRef}>
                <button 
                  className={styles.profileButton}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="پروفایل"
                  aria-expanded={isProfileOpen}
                >
                  <div className={styles.avatar}>
                    {user.image ? (
                      <Image 
                        src={user.image} 
                        alt={t.profile}
                        width={28}
                        height={28}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {getUserInitials()}
                      </div>
                    )}
                  </div>
                </button>

                {/* دسکتاپ: dropdown */}
                {!isMobile && isProfileOpen && (
                  <div className={styles.profileDropdown}>
                    <ProfileMenuContent />
                  </div>
                )}
              </div>

              {/* موبایل: دیالوگ مرکزی */}
              {isMobile && isProfileOpen && (
                <div 
                  className={styles.dialogOverlay}
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div 
                    className={styles.dialogBox}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ProfileMenuContent />
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              <LogIn size={14} />
              <span>{t.login}</span>
            </Link>
          )}

          <div className={styles.datetime}>
            <span className={styles.dateText}>{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakingNews