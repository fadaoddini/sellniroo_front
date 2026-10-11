// components/common/PersianDatePicker.jsx
'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react'
import {
  toPersianDate,
  getTodayPersian,
  persianToGregorian,
  formatPersianDate,
} from '../../utils/dateUtils'
import styles from '../../styles/modules/PersianDatePicker.module.css'

const MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]
const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const getPersianDaysInMonth = (year, month) => {
  const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  if (month === 12) {
    const isLeap =
      year % 33 === 1 || year % 33 === 5 || year % 33 === 9 ||
      year % 33 === 13 || year % 33 === 17 || year % 33 === 22 ||
      year % 33 === 26 || year % 33 === 30
    return isLeap ? 30 : 29
  }
  return daysInMonth[month - 1]
}

const PersianDatePicker = ({
  value,
  onChange,
  placeholder = 'تاریخ را انتخاب کنید',
  disabled = false,
  minYear = 1300,
  maxYear,
}) => {
  const todayPersian = getTodayPersian()
  const yearMax = maxYear || (todayPersian?.year || 1404) + 5

  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value || '')
  const [persianYear, setPersianYear] = useState(todayPersian?.year || 1404)
  const [persianMonth, setPersianMonth] = useState(todayPersian?.month || 1)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 300, openUp: false })
  const [mounted, setMounted] = useState(false)

  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (value) {
      setSelectedDate(value)
      const persian = toPersianDate(value)
      if (persian) {
        setPersianYear(persian.year)
        setPersianMonth(persian.month)
      }
    } else {
      setSelectedDate('')
    }
  }, [value])

  useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  const updatePosition = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dropdownHeight = 360
    const gap = 8
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < dropdownHeight && rect.top > spaceBelow
    const width = Math.max(Math.min(rect.width, 360), 280)
    let left = rect.left
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12)
    }
    if (left < 12) left = 12

    // position: fixed → مختصات viewport (بدون scrollY)
    setDropdownPos({
      top: openUp
        ? Math.max(8, rect.top - dropdownHeight - gap)
        : rect.bottom + gap,
      left,
      width,
      openUp,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event) => {
      const inInput = inputRef.current?.contains(event.target)
      const inDropdown = dropdownRef.current?.contains(event.target)
      if (!inInput && !inDropdown) setIsOpen(false)
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const years = useMemo(() => {
    const list = []
    for (let y = yearMax; y >= minYear; y -= 1) list.push(y)
    return list
  }, [minYear, yearMax])

  const days = useMemo(() => {
    const count = getPersianDaysInMonth(persianYear, persianMonth)
    const firstDayOfMonth = new Date(persianToGregorian(persianYear, persianMonth, 1))
    const dayOfWeek = firstDayOfMonth.getDay()
    const startOffset = (dayOfWeek + 1) % 7
    const daysArray = []
    for (let i = 0; i < startOffset; i += 1) daysArray.push(null)
    for (let i = 1; i <= count; i += 1) daysArray.push(i)
    return daysArray
  }, [persianYear, persianMonth])

  const displayValue = selectedDate
    ? formatPersianDate(toPersianDate(selectedDate), 'full')
    : ''

  const openPicker = () => {
    if (disabled) return
    updatePosition()
    setIsOpen(true)
  }

  const handleDateSelect = (day) => {
    if (!day) return
    try {
      const gregorianDate = persianToGregorian(persianYear, persianMonth, day)
      if (!gregorianDate) return
      setSelectedDate(gregorianDate)
      onChange?.(gregorianDate)
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
      newYear += 1
    } else if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }
    if (newYear < minYear || newYear > yearMax) return
    setPersianMonth(newMonth)
    setPersianYear(newYear)
  }

  const goToday = () => {
    if (!todayPersian) return
    setPersianYear(todayPersian.year)
    setPersianMonth(todayPersian.month)
  }

  const dropdown = isOpen && mounted && !disabled
    ? createPortal(
        <div
          ref={dropdownRef}
          className={`${styles.pickerDropdown} ${dropdownPos.openUp ? styles.openUp : ''}`}
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
          role="dialog"
          aria-label="انتخاب تاریخ شمسی"
        >
          <div className={styles.pickerHeader}>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className={styles.navBtn}
              aria-label="ماه قبل"
            >
              <ChevronRight size={16} />
            </button>

            <div className={styles.selectors}>
              <select
                className={styles.monthSelect}
                value={persianMonth}
                onChange={(e) => setPersianMonth(Number(e.target.value))}
                aria-label="ماه"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>{name}</option>
                ))}
              </select>
              <select
                className={styles.yearSelect}
                value={persianYear}
                onChange={(e) => setPersianYear(Number(e.target.value))}
                aria-label="سال"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className={styles.navBtn}
              aria-label="ماه بعد"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <div className={styles.weekDays}>
            {WEEK_DAYS.map((day) => (
              <span key={day} className={styles.weekDay}>{day}</span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`e-${index}`} className={styles.emptyDay} />
              }

              const isToday =
                todayPersian &&
                day === todayPersian.day &&
                persianMonth === todayPersian.month &&
                persianYear === todayPersian.year

              const selectedPersian = selectedDate ? toPersianDate(selectedDate) : null
              const isSelected =
                selectedPersian &&
                day === selectedPersian.day &&
                persianMonth === selectedPersian.month &&
                persianYear === selectedPersian.year

              return (
                <button
                  type="button"
                  key={`${persianYear}-${persianMonth}-${day}`}
                  className={`${styles.dayBtn} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.todayBtn} onClick={goToday}>
              امروز
            </button>
            <button
              type="button"
              className={styles.closeFooterBtn}
              onClick={() => setIsOpen(false)}
            >
              بستن
            </button>
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <div
      className={`${styles.pickerWrapper} ${disabled ? styles.disabled : ''} ${isOpen ? styles.open : ''}`}
    >
      <div
        ref={inputRef}
        className={styles.pickerInput}
        onClick={() => {
          if (disabled) return
          if (isOpen) setIsOpen(false)
          else openPicker()
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (isOpen) setIsOpen(false)
            else openPicker()
          }
        }}
      >
        <Calendar size={18} className={styles.calendarIcon} />
        <span className={displayValue ? styles.selectedDate : styles.placeholder}>
          {displayValue || placeholder}
        </span>
        {selectedDate && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDate('')
              onChange?.('')
            }}
            aria-label="پاک کردن تاریخ"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {dropdown}
    </div>
  )
}

export default PersianDatePicker
