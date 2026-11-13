// modules/gym/utils/jalaliCalendar.js — تقویم شمسی پایدار برای باشگاه
import moment from 'moment-jalaali'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

export const MONTH_NAMES_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

export const DAY_NAMES_FA = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
]

export const DAY_NAMES_SHORT_FA = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export function toFaDigits(str) {
  return String(str ?? '').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

/** ورودی‌های رایج (Date | ISO | YYYY-MM-DD | jYYYY/jM/jD) → moment محلی */
export function parseToMoment(date) {
  if (!date && date !== 0) return moment.invalid()
  if (moment.isMoment(date)) return date.clone()

  if (typeof date === 'string') {
    const raw = date.trim()
    const isoDay = raw.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDay)) {
      return moment(isoDay, 'YYYY-MM-DD', true).startOf('day')
    }
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(raw)) {
      const jalali = moment(raw, 'jYYYY/jM/jD', true)
      if (jalali.isValid()) return jalali.startOf('day')
    }
    const m = moment(raw)
    return m.isValid() ? m.startOf('day') : moment.invalid()
  }

  const m = moment(date)
  return m.isValid() ? m.startOf('day') : moment.invalid()
}

export function toApiDate(date) {
  const m = parseToMoment(date)
  return m.isValid() ? m.format('YYYY-MM-DD') : ''
}

export function todayApiDate() {
  return moment().startOf('day').format('YYYY-MM-DD')
}

export function toJalaliParts(date) {
  const m = parseToMoment(date)
  if (!m.isValid()) return { year: 0, month: 0, day: 0 }
  return {
    year: m.jYear(),
    month: m.jMonth() + 1,
    day: m.jDate(),
  }
}

export function jalaliToApiDate(year, month, day) {
  const m = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD', true)
  return m.isValid() ? m.format('YYYY-MM-DD') : ''
}

export function jalaliToDate(year, month, day) {
  const m = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD', true)
  return m.isValid() ? m.startOf('day').toDate() : null
}

export function getDaysInJalaliMonth(year, month) {
  return moment.jDaysInMonth(year, month - 1)
}

/** شنبه=0 … جمعه=6 */
export function getJalaliWeekIndex(year, month, day) {
  const m = moment(`${year}/${month}/${day}`, 'jYYYY/jM/jD', true)
  if (!m.isValid()) return 0
  return (m.day() + 1) % 7
}

export function isSameApiDay(a, b) {
  const da = toApiDate(a)
  const db = toApiDate(b)
  return Boolean(da && db && da === db)
}

export function formatJalaliDate(date, { withWeekday = true, faDigits = true } = {}) {
  const m = parseToMoment(date)
  if (!m.isValid()) return '—'
  const weekday = DAY_NAMES_FA[(m.day() + 1) % 7]
  const base = `${m.jDate()} ${MONTH_NAMES_FA[m.jMonth()]} ${m.jYear()}`
  const text = withWeekday ? `${weekday} ${base}` : base
  return faDigits ? toFaDigits(text) : text
}

export function shiftJalaliMonth(year, month, delta) {
  const m = moment(`${year}/${month}/1`, 'jYYYY/jM/jD', true).add(delta, 'jMonth')
  return { year: m.jYear(), month: m.jMonth() + 1 }
}

/**
 * شبکه کامل ۶×۷ ماه شمسی
 * هر سلول: { key, day, month, year, apiDate, isCurrentMonth, isToday, isFriday }
 */
export function buildJalaliMonthCells(year, month) {
  const daysInMonth = getDaysInJalaliMonth(year, month)
  const firstWeekIndex = getJalaliWeekIndex(year, month, 1)
  const today = todayApiDate()
  const cells = []

  const prev = shiftJalaliMonth(year, month, -1)
  const prevDays = getDaysInJalaliMonth(prev.year, prev.month)
  for (let i = firstWeekIndex - 1; i >= 0; i -= 1) {
    const day = prevDays - i
    const apiDate = jalaliToApiDate(prev.year, prev.month, day)
    cells.push({
      key: apiDate || `p-${day}`,
      day,
      month: prev.month,
      year: prev.year,
      apiDate,
      isCurrentMonth: false,
      isToday: apiDate === today,
      isFriday: getJalaliWeekIndex(prev.year, prev.month, day) === 6,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const apiDate = jalaliToApiDate(year, month, day)
    cells.push({
      key: apiDate || `c-${day}`,
      day,
      month,
      year,
      apiDate,
      isCurrentMonth: true,
      isToday: apiDate === today,
      isFriday: getJalaliWeekIndex(year, month, day) === 6,
    })
  }

  const next = shiftJalaliMonth(year, month, 1)
  let nextDay = 1
  while (cells.length < 42) {
    const apiDate = jalaliToApiDate(next.year, next.month, nextDay)
    cells.push({
      key: apiDate || `n-${nextDay}`,
      day: nextDay,
      month: next.month,
      year: next.year,
      apiDate,
      isCurrentMonth: false,
      isToday: apiDate === today,
      isFriday: getJalaliWeekIndex(next.year, next.month, nextDay) === 6,
    })
    nextDay += 1
  }

  return cells
}
