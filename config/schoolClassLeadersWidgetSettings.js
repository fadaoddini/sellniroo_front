/**
 * ویجت لیست نفرات برتر یک کلاس (۵ نفر · عمودی · جمع‌وجور)
 */
import {
  HOME_PAGE_FONTS,
  resolveHomePageFont,
} from '@/config/homeHeroSlider'

export const SCHOOL_CLASS_LEADERS_WIDGET_TYPE = 'school_class_leaders'

export const SCHOOL_CLASS_LEADERS_FONTS = [
  ...HOME_PAGE_FONTS,
  {
    id: 'iran_bold',
    label: 'ایران بلد',
    css: "var(--font-iran-bold), 'iran_bold', var(--font-iran), Tahoma, sans-serif",
  },
]

export const SCHOOL_CLASS_LEADERS_RADIUS_CORNERS = [
  { key: 'radius_tl', label: 'بالا چپ' },
  { key: 'radius_tr', label: 'بالا راست' },
  { key: 'radius_br', label: 'پایین راست' },
  { key: 'radius_bl', label: 'پایین چپ' },
]

export const DEMO_SCHOOL_CLASSES = [
  { id: 'demo_1a', label: 'اول دبستان · الف' },
  { id: 'demo_1b', label: 'اول دبستان · ب' },
  { id: 'demo_9a', label: 'نهم · الف' },
  { id: 'demo_9b', label: 'نهم · ب' },
]

/** دادهٔ نمونه به‌ازای هر کلاس */
export const DEMO_CLASS_LEADERS = {
  'اول دبستان · الف': [
    { id: '1', name: 'آوا محمدی', score: '۱۹٫۸', points: 420 },
    { id: '2', name: 'پارسا کریمی', score: '۱۹٫۲', points: 390 },
    { id: '3', name: 'نیکا رضایی', score: '۱۸٫۹', points: 360 },
    { id: '4', name: 'مانی جعفری', score: '۱۸٫۵', points: 310 },
    { id: '5', name: 'هستی احمدی', score: '۱۸٫۱', points: 280 },
  ],
  'اول دبستان · ب': [
    { id: '1', name: 'کیان مرادی', score: '۱۹٫۵', points: 400 },
    { id: '2', name: 'رستا نوری', score: '۱۹٫۰', points: 370 },
    { id: '3', name: 'یاسمن اکبری', score: '۱۸٫۷', points: 340 },
    { id: '4', name: 'آرش سلیمی', score: '۱۸٫۳', points: 300 },
    { id: '5', name: 'ملیکا فرهادی', score: '۱۷٫۹', points: 270 },
  ],
  'نهم · الف': [
    { id: '1', name: 'سارا موسوی', score: '۱۹٫۶', points: 980 },
    { id: '2', name: 'امیرحسین کاظمی', score: '۱۹٫۱', points: 910 },
    { id: '3', name: 'هلنا شریفی', score: '۱۸٫۸', points: 860 },
    { id: '4', name: 'دانیال رستمی', score: '۱۸٫۴', points: 800 },
    { id: '5', name: 'نرگس بهرامی', score: '۱۸٫۰', points: 750 },
  ],
  'نهم · ب': [
    { id: '1', name: 'پریا جلالی', score: '۱۹٫۴', points: 940 },
    { id: '2', name: 'سپهر طاهری', score: '۱۸٫۹', points: 880 },
    { id: '3', name: 'آیدا قاسمی', score: '۱۸٫۶', points: 830 },
    { id: '4', name: 'نیما حیدری', score: '۱۸٫۲', points: 780 },
    { id: '5', name: 'کیمیا راد', score: '۱۷٫۸', points: 720 },
  ],
}

export const DEFAULT_SCHOOL_CLASS_LEADERS_SETTINGS = {
  title: 'نفرات برتر کلاس',
  show_title: true,
  class_id: '',
  class_label: 'اول دبستان · الف',
  limit: 5,
  use_demo_data: true,
  items: [],
  show_score: true,
  show_points: true,
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: false,
  color_bg: '#f7faf8',
  color_text: '#004733',
  color_muted: '#568d66',
  color_row: '#ffffff',
  color_gold: '#c9a227',
  color_silver: '#c0c7d1',
  color_bronze: '#c88a4a',
  color_plain: '#ffffff',
  color_border: 'rgba(0, 71, 51, 0.1)',
  border_width: 1,
  radius: 14,
  radius_tl: 14,
  radius_tr: 14,
  radius_br: 14,
  radius_bl: 14,
  shadow: false,
  font_family: 'iran',
  font_title: 'iran_bold',
  font_size_title: 15,
  font_size_name: 13,
  font_size_meta: 11,
  row_radius: 10,
  gap: 6,
}

function str(v, fallback = '') {
  const s = String(v ?? '').trim()
  return s || fallback
}

function num(v, fallback, min = 0, max = 9999) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  if (raw && Object.prototype.hasOwnProperty.call(raw, key)) return !!raw[key]
  return d[key] !== false
}

function resolveFont(id) {
  const found = SCHOOL_CLASS_LEADERS_FONTS.find((f) => f.id === id)
  if (found?.css) return found.css
  return resolveHomePageFont(id) || SCHOOL_CLASS_LEADERS_FONTS[0].css
}

export function normalizeClassLeaderItem(raw, index = 0) {
  const s = raw && typeof raw === 'object' ? raw : {}
  return {
    id: str(s.id, `cl_${index + 1}`),
    name: str(s.name || s.display_name, `دانش‌آموز ${index + 1}`),
    score: str(s.score || s.avg || s.gpa, ''),
    points: num(s.points ?? s.activity_points, 0, 0, 999999),
    href: str(s.href || s.link, ''),
  }
}

export function normalizeSchoolClassLeadersSettings(raw = {}) {
  const d = DEFAULT_SCHOOL_CLASS_LEADERS_SETTINGS
  const s = raw && typeof raw === 'object' ? raw : {}
  const itemsRaw = Array.isArray(s.items) ? s.items : []
  const radius = num(s.radius, d.radius, 0, 48)
  const pickCorner = (key) => {
    const hasOwn =
      Object.prototype.hasOwnProperty.call(s, key) &&
      s[key] !== null &&
      s[key] !== ''
    return num(hasOwn ? s[key] : radius, radius, 0, 48)
  }
  const fontFamily = SCHOOL_CLASS_LEADERS_FONTS.some((f) => f.id === s.font_family)
    ? s.font_family
    : d.font_family
  const fontTitle = SCHOOL_CLASS_LEADERS_FONTS.some((f) => f.id === s.font_title)
    ? s.font_title
    : d.font_title

  return {
    ...d,
    ...s,
    title: str(s.title, d.title),
    show_title: bool(s, 'show_title', d),
    class_id: str(s.class_id, d.class_id),
    class_label: str(s.class_label, d.class_label),
    limit: num(s.limit, d.limit, 1, 10),
    use_demo_data: bool(s, 'use_demo_data', d),
    items: itemsRaw.map(normalizeClassLeaderItem).filter((x) => x.name),
    show_score: bool(s, 'show_score', d),
    show_points: bool(s, 'show_points', d),
    show_on_mobile: bool(s, 'show_on_mobile', d),
    show_on_desktop: bool(s, 'show_on_desktop', d),
    section_full: bool(s, 'section_full', d),
    color_bg: str(s.color_bg, d.color_bg),
    color_text: str(s.color_text, d.color_text),
    color_muted: str(s.color_muted, d.color_muted),
    color_row: str(s.color_row, d.color_row),
    color_gold: str(s.color_gold, d.color_gold),
    color_silver: str(s.color_silver, d.color_silver),
    color_bronze: str(s.color_bronze, d.color_bronze),
    color_plain: str(s.color_plain, d.color_plain),
    color_border: str(s.color_border, d.color_border),
    border_width: num(s.border_width, d.border_width, 0, 8),
    radius,
    radius_tl: pickCorner('radius_tl'),
    radius_tr: pickCorner('radius_tr'),
    radius_br: pickCorner('radius_br'),
    radius_bl: pickCorner('radius_bl'),
    shadow: bool(s, 'shadow', d),
    font_family: fontFamily,
    font_title: fontTitle,
    font_size_title: num(s.font_size_title, d.font_size_title, 10, 28),
    font_size_name: num(s.font_size_name, d.font_size_name, 10, 24),
    font_size_meta: num(s.font_size_meta, d.font_size_meta, 9, 20),
    row_radius: num(s.row_radius, d.row_radius, 0, 24),
    gap: num(s.gap, d.gap, 0, 20),
  }
}

export function resolveClassLeadersList(settings) {
  const s = normalizeSchoolClassLeadersSettings(settings)
  if (s.items.length) return s.items.slice(0, s.limit)
  if (!s.use_demo_data) return []
  const demo =
    DEMO_CLASS_LEADERS[s.class_label] ||
    DEMO_CLASS_LEADERS['اول دبستان · الف'] ||
    []
  return demo.slice(0, s.limit).map(normalizeClassLeaderItem)
}

/** رنگ پس‌زمینه ردیف بر اساس رتبهٔ ۱..۵ */
export function classLeaderPlaceTone(place) {
  if (place === 1) return 'gold'
  if (place === 2) return 'silver'
  if (place === 3) return 'bronze'
  return 'plain'
}

export function schoolClassLeadersCssVars(settings) {
  const s = normalizeSchoolClassLeadersSettings(settings)
  return {
    '--scl-bg': s.color_bg,
    '--scl-text': s.color_text,
    '--scl-muted': s.color_muted,
    '--scl-row': s.color_row,
    '--scl-gold': s.color_gold,
    '--scl-silver': s.color_silver,
    '--scl-bronze': s.color_bronze,
    '--scl-plain': s.color_plain,
    '--scl-border': s.color_border,
    '--scl-bw': `${s.border_width}px`,
    '--scl-rtl': `${s.radius_tl}px`,
    '--scl-rtr': `${s.radius_tr}px`,
    '--scl-rbr': `${s.radius_br}px`,
    '--scl-rbl': `${s.radius_bl}px`,
    '--scl-shadow': s.shadow
      ? '0 10px 28px rgba(0, 53, 40, 0.12)'
      : 'none',
    '--scl-font': resolveFont(s.font_family),
    '--scl-font-title': resolveFont(s.font_title),
    '--scl-fs-title': `${s.font_size_title}px`,
    '--scl-fs-name': `${s.font_size_name}px`,
    '--scl-fs-meta': `${s.font_size_meta}px`,
    '--scl-radius': `${s.row_radius}px`,
    '--scl-gap': `${s.gap}px`,
  }
}

export function createDefaultSchoolClassLeadersSettings() {
  return { ...DEFAULT_SCHOOL_CLASS_LEADERS_SETTINGS }
}

export function isSchoolClassLeadersWidgetType(type) {
  return String(type || '') === SCHOOL_CLASS_LEADERS_WIDGET_TYPE
}
