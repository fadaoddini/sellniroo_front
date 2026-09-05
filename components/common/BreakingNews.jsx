// components/BreakingNews.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import moment from 'moment-jalaali'
import { 
  Briefcase, Search, UserPlus, LogIn, Phone, 
  ChevronDown, Clock, Award, Target, TrendingUp,
  FileText, Users, MessageSquare, Headphones,
  Building2, Info
} from 'lucide-react'
import styles from '../../styles/modules/BreakingNews.module.css'

// تنظیمات اولیه moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' })

const BreakingNews = () => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const phoneNumberRef = useRef('')

  // پیام‌های مرتبط با استخدام و کاریابی در حوزه فروش و بازاریابی
  const news = [
    {
      id: 1,
      text: 'بهترین فرصت‌های شغلی فروش و بازاریابی را با ما پیدا کنید'
    },
    {
      id: 2,
      text: 'رزومه خود را ارسال کنید و به تیم حرفه‌ای ما بپیوندید'
    },
    {
      id: 3,
      text: 'استخدام بازاریاب و فروشنده حرفه‌ای - شرایط عالی'
    },
    {
      id: 4,
      text: 'برای مشاوره شغلی رایگان با ما تماس بگیرید: ۰۲۱-۱۲۳۴۵۶۷۸'
    },
    {
      id: 5,
      text: 'بیش از ۵۰۰ فرصت شغلی در سراسر کشور'
    }
  ]

  // دریافت تاریخ شمسی با moment-jalaali
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

  // افکت تایپ
  const startTyping = (text) => {
    setIsTyping(true)
    setDisplayText('')
    
    let charIndex = 0
    const fullText = text
    
    if (window.typingTimer) clearInterval(window.typingTimer)
    if (window.pauseTimer) clearTimeout(window.pauseTimer)
    
    const speed = Math.min(100, Math.max(40, 70 - fullText.length * 0.15))
    
    window.typingTimer = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayText(fullText.substring(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(window.typingTimer)
        window.typingTimer = null
        setIsTyping(false)
        
        window.pauseTimer = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % news.length)
        }, 4000)
      }
    }, speed)
  }

  // شروع تایپ با تغییر پیام
  useEffect(() => {
    const currentNews = news[currentIndex]
    startTyping(currentNews.text)
    
    return () => {
      if (window.typingTimer) clearInterval(window.typingTimer)
      if (window.pauseTimer) clearTimeout(window.pauseTimer)
    }
  }, [currentIndex])

  // بروزرسانی تاریخ
  useEffect(() => {
    setCurrentDate(getPersianDate())
    const dateInterval = setInterval(() => {
      setCurrentDate(getPersianDate())
    }, 60000)
    return () => clearInterval(dateInterval)
  }, [])

  // شماره تلفن مشاوره
  useEffect(() => {
    const encoded = 'MDkxNTEyNDQ4OTg='
    phoneNumberRef.current = atob(encoded)
  }, [])

  const handleConsultClick = () => {
    if (phoneNumberRef.current) {
      window.location.href = `tel:${phoneNumberRef.current}`
    }
  }

  return (
    <div className={styles.breakingNews}>
      <div className={styles.container}>
        {/* بخش چپ - پیام متحرک */}
        <div className={styles.newsLeft}>
          <div className={styles.newsLabel}>
            <Briefcase size={16} className={styles.labelIcon} />
          </div>
          
          <div className={styles.newsContent}>
            <span className={styles.newsText}>
              {displayText}
              {isTyping && <span className={styles.cursor}>|</span>}
            </span>
          </div>
        </div>

        {/* بخش راست - منو و ابزارها */}
        <div className={styles.newsRight}>
          {/* دکمه مشاوره */}
          <button 
            className={styles.consultButton}
            onClick={handleConsultClick}
          >
            <Phone size={14} />
            <span>مشاوره شغلی</span>
          </button>

          {/* دکمه درباره ما - لینک به صفحه درباره ما */}
          <Link href="/about" className={styles.aboutButton}>
            <Info size={14} />
            <span>درباره ما</span>
          </Link>

          {/* دکمه ورود */}
          <Link href="/login" className={styles.loginButton}>
            <LogIn size={14} />
            <span>ورود</span>
          </Link>

          {/* تاریخ */}
          <div className={styles.datetime}>
            <Clock size={12} />
            <span className={styles.dateText}>{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakingNews