// ابزار تاریخ شمسی برای ماژول مدرسه
import moment from 'moment-jalaali'

moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

export const WEEKDAYS_FA = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export const MONTHS_FA = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

export function toFaDigits(str) {
  return String(str ?? '').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

/** ISO تاریخ میلادی YYYY-MM-DD یا datetime → برچسب شمسی */
export function formatJalali(iso, withWeekday = false) {
  if (!iso) return '—'
  const m = moment(String(iso).slice(0, 10), 'YYYY-MM-DD')
  if (!m.isValid()) return String(iso)
  const base = m.format('jD jMMMM jYYYY')
  if (!withWeekday) return toFaDigits(base)
  const wd = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'][m.day()]
  return toFaDigits(`${wd} · ${base}`)
}

export function formatJalaliShort(iso) {
  if (!iso) return '—'
  const m = moment(String(iso).slice(0, 10), 'YYYY-MM-DD')
  if (!m.isValid()) return String(iso)
  return toFaDigits(m.format('jYYYY/jMM/jDD'))
}

export function todayGregorian() {
  return moment().format('YYYY-MM-DD')
}

export function currentJalaliMonth() {
  const m = moment()
  return { jy: m.jYear(), jm: m.jMonth() + 1 }
}

/** بازه میلادی یک ماه شمسی */
export function jalaliMonthRange(jy, jm) {
  const start = moment(`${jy}/${jm}/1`, 'jYYYY/jM/jD').startOf('day')
  const end = start.clone().endOf('jMonth')
  return {
    from: start.format('YYYY-MM-DD'),
    to: end.format('YYYY-MM-DD'),
    label: `${MONTHS_FA[jm - 1]} ${toFaDigits(jy)}`,
    daysInMonth: end.jDate(),
    start,
    end,
  }
}

/**
 * سلول‌های تقویم ماه شمسی — هفته از شنبه
 * هر سلول: { key, jDay, gDate, inMonth, isToday, isFriday }
 */
export function buildJalaliMonthGrid(jy, jm) {
  const { start, daysInMonth } = jalaliMonthRange(jy, jm)
  // moment day(): 0=Sun … 6=Sat — برای ایران شنبه اول هفته است
  // شنبه = 6 در moment → index 0
  const startWeekday = (start.day() + 1) % 7 // Sat=0 … Fri=6
  const cells = []
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `pad-${i}`, empty: true })
  }
  const todayG = todayGregorian()
  for (let d = 1; d <= daysInMonth; d += 1) {
    const m = moment(`${jy}/${jm}/${d}`, 'jYYYY/jM/jD')
    const gDate = m.format('YYYY-MM-DD')
    cells.push({
      key: gDate,
      empty: false,
      jDay: d,
      gDate,
      inMonth: true,
      isToday: gDate === todayG,
      isFriday: m.day() === 5,
      weekdayFa: WEEKDAYS_FA[(m.day() + 1) % 7],
    })
  }
  return cells
}

export function shiftJalaliMonth(jy, jm, delta) {
  const m = moment(`${jy}/${jm}/1`, 'jYYYY/jM/jD').add(delta, 'jMonth')
  return { jy: m.jYear(), jm: m.jMonth() + 1 }
}

export function groupRecordsByJalaliMonth(records = []) {
  const map = new Map()
  records.forEach((r) => {
    const m = moment(String(r.date || '').slice(0, 10), 'YYYY-MM-DD')
    if (!m.isValid()) return
    const key = `${m.jYear()}-${String(m.jMonth() + 1).padStart(2, '0')}`
    const label = `${MONTHS_FA[m.jMonth()]} ${toFaDigits(m.jYear())}`
    if (!map.has(key)) map.set(key, { key, label, jy: m.jYear(), jm: m.jMonth() + 1, items: [] })
    map.get(key).items.push(r)
  })
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1))
}
