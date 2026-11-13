'use client'

import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import {
  MONTH_NAMES_FA,
  DAY_NAMES_FA,
  DAY_NAMES_SHORT_FA,
  toFaDigits,
  toApiDate,
  toJalaliParts,
  jalaliToDate,
  shiftJalaliMonth,
  buildJalaliMonthCells,
  todayApiDate,
  getJalaliWeekIndex,
} from '@/modules/gym/utils/jalaliCalendar'
import styles from './WorkoutManager.module.css'

/**
 * تقویم شمسی کامل برای برنامه تمرین/غذا
 * markedDates: آرایه تاریخ‌های YYYY-MM-DD یا Date/ISO که نقطهٔ «دارای برنامه» دارند
 */
export default function GymPersianCalendar({
  selectedDate,
  onDateSelect,
  markedDates = [],
}) {
  const selectedParts = toJalaliParts(selectedDate || new Date())
  const todayParts = toJalaliParts(new Date())
  const selectedApi = toApiDate(selectedDate) || todayApiDate()

  const [currentYear, setCurrentYear] = useState(
    selectedParts.year || todayParts.year,
  )
  const [currentMonth, setCurrentMonth] = useState(
    selectedParts.month || todayParts.month,
  )
  const [pickerMode, setPickerMode] = useState(null)

  useEffect(() => {
    if (!selectedParts.year || !selectedParts.month) return
    setCurrentYear(selectedParts.year)
    setCurrentMonth(selectedParts.month)
  }, [selectedParts.year, selectedParts.month])

  const calendarDays = useMemo(
    () => buildJalaliMonthCells(currentYear, currentMonth),
    [currentYear, currentMonth],
  )

  const yearOptions = useMemo(() => {
    const center = todayParts.year || 1400
    return Array.from({ length: 21 }, (_, i) => center - 10 + i)
  }, [todayParts.year])

  const markedSet = useMemo(() => {
    const set = new Set()
    markedDates.forEach((d) => {
      const api = toApiDate(d)
      if (api) set.add(api)
    })
    return set
  }, [markedDates])

  const handleDayClick = (cell) => {
    if (!cell?.apiDate) return
    if (!cell.isCurrentMonth) {
      setCurrentYear(cell.year)
      setCurrentMonth(cell.month)
    }
    const date = jalaliToDate(cell.year, cell.month, cell.day)
    if (date) onDateSelect(date)
    setPickerMode(null)
  }

  const goToPrevMonth = () => {
    const next = shiftJalaliMonth(currentYear, currentMonth, -1)
    setCurrentYear(next.year)
    setCurrentMonth(next.month)
  }

  const goToNextMonth = () => {
    const next = shiftJalaliMonth(currentYear, currentMonth, 1)
    setCurrentYear(next.year)
    setCurrentMonth(next.month)
  }

  const goToToday = () => {
    setCurrentYear(todayParts.year)
    setCurrentMonth(todayParts.month)
    setPickerMode(null)
    const date = jalaliToDate(todayParts.year, todayParts.month, todayParts.day)
    if (date) onDateSelect(date)
  }

  const isViewingTodayMonth =
    currentYear === todayParts.year && currentMonth === todayParts.month

  return (
    <div className={styles.calendar} dir="rtl" lang="fa">
      <div className={styles.calendarHeader}>
        <div className={styles.calendarHeaderRight}>
          <button
            type="button"
            className={styles.calendarMonthButton}
            onClick={() =>
              setPickerMode((m) => (m === 'month' ? null : 'month'))
            }
            aria-expanded={pickerMode === 'month'}
          >
            {MONTH_NAMES_FA[currentMonth - 1]} {toFaDigits(currentYear)}
            {pickerMode === 'month' ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
          <button
            type="button"
            className={styles.calendarYearButton}
            onClick={() => setPickerMode((m) => (m === 'year' ? null : 'year'))}
            aria-expanded={pickerMode === 'year'}
          >
            سال
          </button>
        </div>
        <div className={styles.calendarHeaderLeft}>
          <button
            type="button"
            className={styles.calendarNavButton}
            onClick={goToPrevMonth}
            aria-label="ماه قبل"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            className={clsx(
              styles.calendarTodayButton,
              isViewingTodayMonth && styles.calendarTodayButtonActive,
            )}
            onClick={goToToday}
          >
            امروز
          </button>
          <button
            type="button"
            className={styles.calendarNavButton}
            onClick={goToNextMonth}
            aria-label="ماه بعد"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {pickerMode === 'month' ? (
        <div className={styles.monthPicker}>
          {MONTH_NAMES_FA.map((name, index) => (
            <button
              key={name}
              type="button"
              className={clsx(
                styles.monthPickerButton,
                currentMonth === index + 1 && styles.monthPickerButtonActive,
              )}
              onClick={() => {
                setCurrentMonth(index + 1)
                setPickerMode(null)
              }}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      {pickerMode === 'year' ? (
        <div className={styles.yearPicker}>
          {yearOptions.map((year) => (
            <button
              key={year}
              type="button"
              className={clsx(
                styles.yearPickerButton,
                currentYear === year && styles.yearPickerButtonActive,
              )}
              onClick={() => {
                setCurrentYear(year)
                setPickerMode(null)
              }}
            >
              {toFaDigits(year)}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.weekDays}>
        {DAY_NAMES_SHORT_FA.map((day, index) => (
          <div
            key={day}
            className={clsx(styles.weekDay, index === 6 && styles.weekend)}
            title={DAY_NAMES_FA[index]}
          >
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {calendarDays.map((cell) => {
          const marked = markedSet.has(cell.apiDate)
          const selected = cell.apiDate === selectedApi
          return (
            <button
              key={cell.key}
              type="button"
              className={clsx(
                styles.day,
                !cell.isCurrentMonth && styles.otherMonth,
                cell.isToday && styles.today,
                selected && styles.selected,
                cell.isFriday && styles.friday,
                marked && styles.hasWorkout,
              )}
              onClick={() => handleDayClick(cell)}
              aria-label={`${DAY_NAMES_FA[getJalaliWeekIndex(cell.year, cell.month, cell.day)]} ${toFaDigits(cell.day)} ${MONTH_NAMES_FA[cell.month - 1]} ${toFaDigits(cell.year)}`}
              aria-current={cell.isToday ? 'date' : undefined}
              aria-pressed={selected}
            >
              <span className={styles.dayNumber}>{toFaDigits(cell.day)}</span>
              {marked ? <span className={styles.dayDot} /> : null}
              {cell.isToday && !selected ? (
                <span className={styles.todayMark} aria-hidden />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className={styles.calendarLegend}>
        <div className={styles.legendItem}>
          <div className={clsx(styles.legendDot, styles.legendToday)} />
          <span>امروز</span>
        </div>
        <div className={styles.legendItem}>
          <div className={clsx(styles.legendDot, styles.legendWorkout)} />
          <span>دارای برنامه</span>
        </div>
        <div className={styles.legendItem}>
          <div className={clsx(styles.legendDot, styles.legendFriday)} />
          <span>جمعه</span>
        </div>
      </div>
    </div>
  )
}
