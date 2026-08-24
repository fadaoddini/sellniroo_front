// components/BreakingNews.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import moment from 'moment-jalaali'
import { 
  Megaphone, Globe, BadgeDollarSign, Award, Check, ChevronDown, 
  LogIn, LogOut, Phone, UserCircle, Settings, LayoutDashboard, 
  ArrowUp, ArrowDown, Brain, Warehouse, Package, FileText, 
  AlertTriangle, BarChart3, Users, Briefcase, Shield, Home,
  ShoppingCart, Truck, ClipboardList, PieChart, UserCog,
  CalendarCheck, Clock, UserPlus, FileCheck, Building, Store,
  Boxes, ClipboardEdit, TrendingUp, TrendingDown, History,
  Bell, FileBarChart, Gavel, HandCoins, Gamepad2, Puzzle,
  MessageSquare, Headphones, BookOpen, Timer, Target, Zap
} from 'lucide-react'
import styles from '../../styles/modules/BreakingNews.module.css'

moment.loadPersian({ dialect: 'persian-modern' })

const BreakingNews = () => {
  const { language, changeLanguage, dir } = useLanguage()
  const { 
    user, 
    isAuthenticated, 
    logout, 
    loading,
    isEmployee,
    employeeData,
    checkingEmployee,
    permissions,
    hasPermission
  } = useAuth()
  
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const phoneNumberRef = useRef('')

  const typingTimerRef = useRef(null)
  const pauseTimerRef = useRef(null)
  const langDropdownRef = useRef(null)
  const profileDropdownRef = useRef(null)

  const news = [
    {
      id: 1,
      fa: 'بزرگترین تولید کننده سازه‌های LSF در ایران - آریا استاد',
      en: 'The largest producer of LSF structures in Iran - Aria Stad'
    },
    {
      id: 2,
      fa: 'اجرای پروژه‌های مسکونی و صنعتی با بالاترین کیفیت',
      en: 'Execution of residential and industrial projects with the highest quality'
    },
    {
      id: 3,
      fa: 'برای مشاوره رایگان با ما تماس بگیرید:  05137688500',
      en: 'Call us for free consultation: 05137688500'
    },
  ]

  const languages = [
    { code: "fa", label: "فارسی", flag: "🇮🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ]

  const getPersianDate = () => {
    const now = new Date()
    const m = moment(now)
    
    const weekDays = {
      'Saturday': 'شنبه',
      'Sunday': 'یکشنبه',
      'Monday': 'دوشنبه',
      'Tuesday': 'سه‌شنبه',
      'Wednesday': 'چهارشنبه',
      'Thursday': 'پنجشنبه',
      'Friday': 'جمعه'
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

  const getEnglishDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const updateDate = () => {
    if (language === 'fa') {
      setCurrentDate(getPersianDate())
    } else {
      setCurrentDate(getEnglishDate())
    }
  }

  const startTyping = (text) => {
    setIsTyping(true)
    setDisplayText('')
    
    let charIndex = 0
    const fullText = text
    
    if (typingTimerRef.current) clearInterval(typingTimerRef.current)
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    
    const speed = Math.min(120, Math.max(40, 80 - fullText.length * 0.2))
    
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
        }, 5000)
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const currentNews = news[currentIndex]
    const text = language === 'fa' ? currentNews.fa : currentNews.en
    startTyping(text)
    
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [currentIndex, language])

  useEffect(() => {
    updateDate()
    const dateInterval = setInterval(updateDate, 60000)
    return () => clearInterval(dateInterval)
  }, [language])

  const handleLanguageChange = (code) => {
    changeLanguage(code)
    setIsLangOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setIsProfileOpen(false)
  }

  const getUserDisplayName = () => {
    if (!user) return language === "fa" ? "کاربر عزیز" : "Dear User"
    return user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.mobile
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const first = user.first_name?.[0] || ""
    const last = user.last_name?.[0] || ""
    return (first + last).toUpperCase() || user.mobile?.slice(0, 2) || "U"
  }

  // ============================================
  // ✅ تعریف منوها بر اساس دسترسی
  // ============================================
  const getMenuItems = () => {
    const menuItems = []
    const t = texts[language] || texts.fa

    // ========== منوی داشبورد ==========
    if (isEmployee) {
      menuItems.push({
        type: 'link',
        href: '/dashboard',
        icon: LayoutDashboard,
        label: t.dashboard,
        className: styles.dashboardItem,
        isDashboard: true
      })
    }

    // ========== منوهای بازاریابی ==========
    if (hasPermission('marketing')) {
      menuItems.push({ type: 'divider' })
      menuItems.push({
        type: 'link',
        href: '/sale',
        icon: HandCoins,
        label: 'لیدهای بازاریابی '
      })
      
    }

    // ========== منوهای فروش ==========
    // if (hasPermission('sales')) {
    //   menuItems.push({ type: 'divider' })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/sales/orders',
    //     icon: ShoppingCart,
    //     label: 'سفارشات',
    //     section: 'sales'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/sales/invoices',
    //     icon: FileText,
    //     label: 'فاکتورها',
    //     section: 'sales'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/sales/customers',
    //     icon: Users,
    //     label: 'مشتریان',
    //     section: 'sales'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/sales/stats',
    //     icon: TrendingUp,
    //     label: 'آمار فروش',
    //     section: 'sales'
    //   })
    // }

    // ========== منوهای انبار ==========
    if (hasPermission('warehouse')) {
      menuItems.push({ type: 'divider' })
      menuItems.push({
        type: 'link',
        href: '/inventory/dashboard',
        icon: Warehouse,
        label: 'داشبورد انبار',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/warehouses',
        icon: Building,
        label: 'مدیریت انبارها',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/products',
        icon: Package,
        label: 'مدیریت کالاها',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/stock-in',
        icon: ArrowUp,
        label: 'ورود کالا',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/stock-out',
        icon: ArrowDown,
        label: 'خروج کالا',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/transactions',
        icon: History,
        label: 'تاریخچه تراکنش‌ها',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/alerts',
        icon: Bell,
        label: 'هشدارها',
        section: 'warehouse'
      })
      menuItems.push({
        type: 'link',
        href: '/inventory/reports',
        icon: FileBarChart,
        label: 'گزارش‌ها',
        section: 'warehouse'
      })
    }

    // ========== منوهای حضور و غیاب ==========
    // if (hasPermission('attendance')) {
    //   menuItems.push({ type: 'divider' })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/attendance/dashboard',
    //     icon: CalendarCheck,
    //     label: 'داشبورد حضور و غیاب',
    //     section: 'attendance'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/attendance/check-in',
    //     icon: Clock,
    //     label: 'ثبت ورود/خروج',
    //     section: 'attendance'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/attendance/history',
    //     icon: History,
    //     label: 'تاریخچه حضور',
    //     section: 'attendance'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/attendance/reports',
    //     icon: FileBarChart,
    //     label: 'گزارش‌ها',
    //     section: 'attendance'
    //   })
    // }

    // ========== منوهای پشتیبانی ==========
    // if (hasPermission('support')) {
    //   menuItems.push({ type: 'divider' })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/support/tickets',
    //     icon: MessageSquare,
    //     label: 'تیکت‌های پشتیبانی',
    //     section: 'support'
    //   })
    //   menuItems.push({
    //     type: 'link',
    //     href: '/support/knowledge',
    //     icon: BookOpen,
    //     label: 'دانشنامه',
    //     section: 'support'
    //   })
    // }

    // ========== منوهای عمومی ==========
    menuItems.push({ type: 'divider' })
    menuItems.push({
      type: 'link',
      href: '/setad',
      icon: Gavel,
      label: 'مزایده/مناقصه'
    })

    menuItems.push({
      type: 'link',
      href: '/quiz',
      icon: Brain,
      label: 'چالش مهندسین'
    })
    menuItems.push({
      type: 'link',
      href: '/game',
      icon: Gamepad2,
      label: 'بازی'
    })

    return menuItems
  }

  // متون چندزبانه
  const texts = {
    fa: {
      login: "ورود",
      consult: "مشاوره رایگان",
      logout: "خروج",
      profile: "پروفایل من",
      settings: "تنظیمات",
      dashboard: "داشبورد مدیریت",
      employee: "کارمند",
      inventory: "داشبورد انبار",
      warehouses: "مدیریت انبارها",
      products: "مدیریت کالاها",
      stockIn: "ورود کالا",
      stockOut: "خروج کالا",
      transactions: "تاریخچه تراکنش‌ها",
      alerts: "هشدارها",
      reports: "گزارش‌ها",
      tender: "مزایده/مناقصه",
      sales: "فروش",
      challenge: "چالش مهندسین",
      game: "بازی",
      dearUser: "کاربر عزیز"
    },
    en: {
      login: "Login",
      consult: "Free Consult",
      logout: "Logout",
      profile: "My Profile",
      settings: "Settings",
      dashboard: "Dashboard",
      employee: "Employee",
      inventory: "Inventory Dashboard",
      warehouses: "Warehouses",
      products: "Products",
      stockIn: "Stock In",
      stockOut: "Stock Out",
      transactions: "Transactions",
      alerts: "Alerts",
      reports: "Reports",
      tender: "Tender/Auction",
      sales: "Sales",
      challenge: "Engineers Challenge",
      game: "Game",
      dearUser: "Dear User"
    }
  }

  const t = texts[language] || texts.fa
  const textDirection = language === 'fa' ? 'rtl' : 'ltr'
  const menuItems = getMenuItems()

  // ✅ تابع برای تشخیص بخش فعال
  const isActiveSection = (section) => {
    if (typeof window === 'undefined') return false
    const pathname = window.location.pathname
    return pathname.includes(`/${section}/`) || pathname === `/${section}`
  }

  return (
    <div className={styles.breakingNews} dir={dir}>
      <div className={styles.newsContainer}>
        <div className={styles.newsLeft}>
          <div className={styles.newsLabel}>
            <Megaphone size={14} className={styles.labelIcon} />
          </div>
          
          <div className={styles.newsContent}>
            <span 
              className={styles.newsText} 
              dir={textDirection}
              style={{ direction: textDirection }}
            >
              {displayText}
              {isTyping && <span className={styles.cursor}>|</span>}
            </span>
          </div>
        </div>

        <div className={styles.newsRight}>
          {/* انتخاب زبان */}
          <div className={styles.langSelector} ref={langDropdownRef}>
            <button 
              className={styles.langButton}
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <Globe size={14} />
              <span>{language === "fa" ? "فارسی" : "English"}</span>
              <ChevronDown size={12} className={isLangOpen ? styles.rotated : ""} />
            </button>
            {isLangOpen && (
              <div className={styles.langDropdown}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`${styles.langOption} ${language === lang.code ? styles.activeLang : ""}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* دکمه مشاوره */}
          <button 
            className={styles.consultButton}
            onClick={handleConsultClick}
          >
            <Phone size={14} />
            <span>{t.consult}</span>
          </button>

          {/* ورود / پروفایل */}
          {isAuthenticated && user ? (
            <div className={styles.profileSection} ref={profileDropdownRef}>
              <button 
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.avatar}>
                  {user.image ? (
                    <Image 
                      src={user.image} 
                      alt={t.profile}
                      width={24}
                      height={24}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {getUserInitials()}
                    </div>
                  )}
                </div>
              </button>
              
              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                      {user.image ? (
                        <Image 
                          src={user.image} 
                          alt={t.profile}
                          width={32}
                          height={32}
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
                      {isEmployee && employeeData && !checkingEmployee && (
                        <span className={styles.employeeBadge}>
                          <Briefcase size={10} />
                          <span>{t.employee}</span>
                          <span className={styles.employeeCode}>
                            ({employeeData.employee_code})
                          </span>
                          {employeeData.access_level_label && (
                            <span className={styles.accessLevelBadge}>
                              • {employeeData.access_level_label}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.profileDivider} />
                  
                  {/* ✅ منوهای داینامیک بر اساس دسترسی‌ها */}
                  {menuItems.map((item, index) => {
                    if (item.type === 'divider') {
                      return <div key={`divider-${index}`} className={styles.profileDivider} />
                    }
                    
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`${styles.profileMenuItem} ${item.className || ''} ${
                          item.section && isActiveSection(item.section) ? styles.activeMenuItem : ''
                        }`}
                      >
                        {item.icon && <item.icon size={16} />}
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}

                  {/* دکمه خروج */}
                  <button 
                    className={`${styles.profileMenuItem} ${styles.logoutItem}`} 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              <LogIn size={14} />
              <span>{t.login}</span>
            </Link>
          )}

          {/* تاریخ */}
          <div className={styles.datetime}>
            <span className={styles.dateText}>{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakingNews