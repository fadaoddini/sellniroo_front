// components/common/PersianDatePicker.jsx

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { 
  toPersianDate, 
  getTodayPersian, 
  persianToGregorian,
  formatPersianDate 
} from '../../utils/dateUtils'
import styles from '../../styles/modules/PersianDatePicker.module.css'

const PersianDatePicker = ({ value, onChange, placeholder = 'تاریخ را انتخاب کنید' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value || '')
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  
  // ✅ مقداردهی اولیه با تاریخ امروز شمسی
  const todayPersian = getTodayPersian()
  const [persianYear, setPersianYear] = useState(todayPersian?.year || 1404)
  const [persianMonth, setPersianMonth] = useState(todayPersian?.month || 1)
  
  const pickerRef = useRef(null)

  // ✅ وقتی value تغییر می‌کند، state رو بروزرسانی کن
  useEffect(() => {
    if (value) {
      setSelectedDate(value)
      const persian = toPersianDate(value)
      if (persian) {
        setPersianYear(persian.year)
        setPersianMonth(persian.month)
      }
    }
  }, [value])

  // بستن پیکر با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ نمایش تاریخ شمسی به صورت فارسی
  const getPersianDisplayDate = (date) => {
    if (!date) return ''
    const persian = toPersianDate(date)
    if (!persian) return ''
    return formatPersianDate(persian, 'full')
  }

  // محاسبه روزهای ماه شمسی
  const getPersianDaysInMonth = (year, month) => {
    const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    if (month === 12) {
      const isLeap = (year % 33 === 1 || year % 33 === 5 || year % 33 === 9 || 
                      year % 33 === 13 || year % 33 === 17 || year % 33 === 22 || 
                      year % 33 === 26 || year % 33 === 30)
      return isLeap ? 30 : 29
    }
    return daysInMonth[month - 1]
  }

  // تولید روزهای ماه
  const getDaysInMonth = () => {
    const days = getPersianDaysInMonth(persianYear, persianMonth)
    
    // ✅ محاسبه درست روز اول ماه شمسی
    const firstDayOfMonth = new Date(persianToGregorian(persianYear, persianMonth, 1))
    const dayOfWeek = firstDayOfMonth.getDay() // 0=Sunday, 1=Monday, ...
    
    // در تقویم فارسی، شنبه اولین روز هفته است (dayOfWeek 6)
    const startOffset = (dayOfWeek + 1) % 7
    
    const daysArray = []
    
    // روزهای خالی قبل از شروع ماه
    for (let i = 0; i < startOffset; i++) {
      daysArray.push(null)
    }
    
    // روزهای ماه
    for (let i = 1; i <= days; i++) {
      daysArray.push(i)
    }
    
    return daysArray
  }

  const handleDateSelect = (day) => {
    if (!day) return
    
    try {
      // ساخت تاریخ میلادی
      const gregorianDate = persianToGregorian(persianYear, persianMonth, day)
      if (!gregorianDate) return
      
      setSelectedDate(gregorianDate)
      onChange(gregorianDate)
      setIsOpen(false)
    } catch (e) {
      console.error('Error selecting date:', e)
    }
  }

  const changeMonth = (delta) => {
    let newMonth = persianMonth + delta
    let newYear = persianYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    setPersianMonth(newMonth)
    setPersianYear(newYear)
  }

  const displayValue = selectedDate ? getPersianDisplayDate(selectedDate) : ''

  // ✅ نام ماه‌ها
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]

  // ✅ روزهای هفته به فارسی
  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

  return (
    <div className={styles.pickerWrapper} ref={pickerRef}>
      <div 
        className={styles.pickerInput}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={18} className={styles.calendarIcon} />
        <span className={displayValue ? styles.selectedDate : styles.placeholder}>
          {displayValue || placeholder}
        </span>
        {selectedDate && (
          <button 
            className={styles.clearBtn}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDate('')
              onChange('')
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.pickerDropdown}>
          <div className={styles.pickerHeader}>
            <button onClick={() => changeMonth(-1)} className={styles.navBtn}>
              <ChevronRight size={18} />
            </button>
            <span className={styles.monthYear}>
              {persianYear} - {monthNames[persianMonth - 1]}
            </span>
            <button onClick={() => changeMonth(1)} className={styles.navBtn}>
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className={styles.weekDays}>
            {weekDays.map((day, index) => (
              <span key={index} className={styles.weekDay}>{day}</span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={index} className={styles.emptyDay} />
              }
              
              // ✅ بررسی اینکه آیا امروز هست
              const today = getTodayPersian()
              const isToday = today && 
                             day === today.day && 
                             persianMonth === today.month &&
                             persianYear === today.year
              
              // ✅ بررسی اینکه آیا انتخاب شده
              const isSelected = selectedDate && (() => {
                const persian = toPersianDate(selectedDate)
                return persian && 
                       day === persian.day && 
                       persianMonth === persian.month &&
                       persianYear === persian.year
              })()

              return (
                <button
                  key={index}
                  className={`${styles.dayBtn} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default PersianDatePicker