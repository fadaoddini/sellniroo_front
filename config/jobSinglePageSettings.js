// config/jobSinglePageSettings.js — تنظیمات صفحه سینگل آگهی (/jobs/[id])

export const JOB_SINGLE_COMPOSITIONS = [
  {
    id: 'classic',
    label: 'کلاسیک',
    desc: 'تصویر بالا، جزئیات و سایدبار شرکت',
  },
  {
    id: 'magazine',
    label: 'مجله‌ای',
    desc: 'عنوان درشت، متا فشرده، تمرکز روی توضیحات',
  },
  {
    id: 'cover',
    label: 'کاور',
    desc: 'تصویر تمام‌عرض با عنوان روی تصویر',
  },
  {
    id: 'split',
    label: 'دو ستونه',
    desc: 'جزئیات کنار کارت اقدام و شرکت',
  },
]

export const JOB_SINGLE_TITLE_SIZES = [
  { id: 'sm', label: 'کوچک', px: 22 },
  { id: 'md', label: 'متوسط', px: 28 },
  { id: 'lg', label: 'بزرگ', px: 34 },
  { id: 'xl', label: 'خیلی بزرگ', px: 40 },
]

export const DEFAULT_JOB_SINGLE_PAGE_SETTINGS = {
  layout: 'classic',
  title_size: 'md',
  title_font_size: 28,
  section_max_width: 1100,
  show_breadcrumb: true,
  show_back_link: true,
  show_image: true,
  show_badges: true,
  show_type_badge: true,
  show_featured_badge: true,
  show_title: true,
  show_company: true,
  show_verified: true,
  show_location: true,
  show_salary: true,
  show_cooperation: true,
  show_meta_date: true,
  show_experience: true,
  show_education: true,
  show_gender: true,
  show_age: true,
  show_description: true,
  show_features: true,
  show_tags: true,
  show_apply: true,
  show_like: true,
  show_bookmark: true,
  show_share: true,
  show_contact: true,
  show_company_card: true,
  show_similar: true,
  show_views: true,
  share_bale: true,
  share_eitaa: true,
  share_rubika: true,
  share_soroush: true,
  ink_color: '#1a2332',
  muted_color: '#6b7280',
  accent_color: '#e67e22',
  surface_bg: '#ffffff',
  content_font_size: 16,
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent') return 'transparent'
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

const BOOL_KEYS = [
  'show_breadcrumb',
  'show_back_link',
  'show_image',
  'show_badges',
  'show_type_badge',
  'show_featured_badge',
  'show_title',
  'show_company',
  'show_verified',
  'show_location',
  'show_salary',
  'show_cooperation',
  'show_meta_date',
  'show_experience',
  'show_education',
  'show_gender',
  'show_age',
  'show_description',
  'show_features',
  'show_tags',
  'show_apply',
  'show_like',
  'show_bookmark',
  'show_share',
  'show_contact',
  'show_company_card',
  'show_similar',
  'show_views',
  'share_bale',
  'share_eitaa',
  'share_rubika',
  'share_soroush',
]

export function getJobSingleComposition(layoutId) {
  return (
    JOB_SINGLE_COMPOSITIONS.find((c) => c.id === layoutId) ||
    JOB_SINGLE_COMPOSITIONS[0]
  )
}

export function applyJobSingleComposition(prev, layoutId) {
  const comp = getJobSingleComposition(layoutId)
  return normalizeJobSinglePageSettings({
    ...(prev || {}),
    layout: comp.id,
  })
}

export function normalizeJobSinglePageSettings(raw = {}) {
  const d = DEFAULT_JOB_SINGLE_PAGE_SETTINGS
  const s = { ...d, ...(raw || {}) }

  if (!JOB_SINGLE_COMPOSITIONS.some((c) => c.id === s.layout)) {
    s.layout = d.layout
  }
  if (!JOB_SINGLE_TITLE_SIZES.some((t) => t.id === s.title_size)) {
    s.title_size = d.title_size
  }
  const titlePreset =
    JOB_SINGLE_TITLE_SIZES.find((t) => t.id === s.title_size) ||
    JOB_SINGLE_TITLE_SIZES[1]
  if (raw && Object.prototype.hasOwnProperty.call(raw, 'title_font_size')) {
    s.title_font_size = Math.max(
      18,
      Math.min(48, pxNum(raw.title_font_size, titlePreset.px, 48))
    )
  } else {
    s.title_font_size = titlePreset.px
  }

  s.section_max_width = Math.max(
    640,
    Math.min(1400, pxNum(s.section_max_width, d.section_max_width, 1400))
  )
  s.content_font_size = Math.max(
    13,
    Math.min(22, pxNum(s.content_font_size, d.content_font_size, 22))
  )

  BOOL_KEYS.forEach((k) => {
    if (raw && Object.prototype.hasOwnProperty.call(raw, k)) {
      s[k] = !!raw[k]
    } else {
      s[k] = d[k]
    }
  })

  s.ink_color = colorStr(s.ink_color) || d.ink_color
  s.muted_color = colorStr(s.muted_color) || d.muted_color
  s.accent_color = colorStr(s.accent_color) || d.accent_color
  s.surface_bg = colorStr(s.surface_bg) || d.surface_bg
  return s
}

export function jobSinglePageCssVars(s) {
  const n = normalizeJobSinglePageSettings(s)
  return {
    '--jsd-ink': n.ink_color,
    '--jsd-muted': n.muted_color,
    '--jsd-accent': n.accent_color,
    '--jsd-surface': n.surface_bg,
    '--jsd-max': `${n.section_max_width}px`,
    '--jsd-fs': `${n.content_font_size}px`,
    '--jsd-title-fs': `${n.title_font_size}px`,
  }
}
