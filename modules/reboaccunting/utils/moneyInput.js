const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

const ONES = [
  '',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
]
const TEENS = [
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
]
const TENS = [
  '',
  '',
  'بیست',
  'سی',
  'چهل',
  'پنجاه',
  'شصت',
  'هفتاد',
  'هشتاد',
  'نود',
]
const HUNDREDS = [
  '',
  'یکصد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
]
const SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون']

/** تبدیل ارقام فارسی/عربی به لاتین و حذف جداکننده‌ها */
export function normalizeDigits(value) {
  return String(value ?? '')
    .split('')
    .map((ch) => {
      const fa = FA_DIGITS.indexOf(ch)
      if (fa >= 0) return String(fa)
      const ar = AR_DIGITS.indexOf(ch)
      if (ar >= 0) return String(ar)
      return ch
    })
    .join('')
}

/** فقط رقم‌های صحیح از ورودی (پشتیبانی کیبورد فارسی) */
export function extractDigits(value) {
  return normalizeDigits(value).replace(/\D/g, '')
}

/** جداسازی سه‌رقم‌سه‌رقم برای نمایش */
export function formatGroupedDigits(digits) {
  const raw = extractDigits(digits)
  if (!raw) return ''
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** پارس مبلغ عددی از فیلد فرمت‌شده */
export function parseGroupedAmount(value) {
  const digits = extractDigits(value)
  if (!digits) return 0
  const n = Number(digits)
  return Number.isFinite(n) ? n : 0
}

function threeDigitWords(n) {
  const num = Math.floor(n) % 1000
  if (num <= 0) return ''
  const h = Math.floor(num / 100)
  const t = Math.floor((num % 100) / 10)
  const o = num % 10
  const parts = []
  if (h) parts.push(HUNDREDS[h])
  if (t === 1) {
    parts.push(TEENS[o])
  } else {
    if (t) parts.push(TENS[t])
    if (o) parts.push(ONES[o])
  }
  return parts.join(' و ')
}

/** عدد صحیح به حروف فارسی */
export function numberToPersianWords(value) {
  let n = Math.floor(Math.abs(Number(value) || 0))
  if (!n) return 'صفر'
  const chunks = []
  let scale = 0
  while (n > 0 && scale < SCALES.length) {
    const chunk = n % 1000
    if (chunk) {
      const words = threeDigitWords(chunk)
      const scaleWord = SCALES[scale]
      chunks.unshift(scaleWord ? `${words} ${scaleWord}` : words)
    }
    n = Math.floor(n / 1000)
    scale += 1
  }
  const text = chunks.join(' و ')
  return value < 0 ? `منفی ${text}` : text
}

export function amountWordsLabel(value, unit = 'تومان') {
  const n = parseGroupedAmount(value)
  if (!extractDigits(value)) return ''
  return `${numberToPersianWords(n)} ${unit}`
}
