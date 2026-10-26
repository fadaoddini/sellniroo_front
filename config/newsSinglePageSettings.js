// config/newsSinglePageSettings.js — تنظیمات صفحه سینگل خبر

/**
 * طرح‌های پیش‌فرض چیدمان بدنه خبر — با اسکلت زنده در /news-single
 */
export const NEWS_SINGLE_COMPOSITIONS = [
  {
    id: 'classic',
    label: 'کلاسیک',
    desc: 'بج بالای تصویر، عنوان و متن در کارت جدا',
    badge_placement: 'above',
    title_place: 'below',
    meta_place: 'below_title',
    lead_place: 'below',
    hero_style: 'card',
  },
  {
    id: 'magazine',
    label: 'مجله‌ای',
    desc: 'بج روی تصویر، عنوان درشت زیر گالری',
    badge_placement: 'on_image',
    title_place: 'below',
    meta_place: 'below_title',
    lead_place: 'below',
    hero_style: 'flush',
  },
  {
    id: 'cover',
    label: 'کاور',
    desc: 'عنوان و بج روی تصویر کاور با گرادیان',
    badge_placement: 'on_image',
    title_place: 'on_image',
    meta_place: 'on_image',
    lead_place: 'below',
    hero_style: 'cover',
  },
  {
    id: 'split',
    label: 'تصویر + لید',
    desc: 'دو ستونه: تصویر کنار عنوان و لید — روی موبایل زیر هم',
    badge_placement: 'on_image',
    title_place: 'beside_image',
    meta_place: 'beside_image',
    lead_place: 'beside_image',
    hero_style: 'split',
  },
]

export const NEWS_SINGLE_TITLE_SIZES = [
  { id: 'sm', label: 'کوچک', px: 22 },
  { id: 'md', label: 'متوسط', px: 28 },
  { id: 'lg', label: 'بزرگ', px: 34 },
  { id: 'xl', label: 'خیلی بزرگ', px: 40 },
]

/** @deprecated — از NEWS_SINGLE_COMPOSITIONS استفاده کنید */
export const NEWS_SINGLE_LAYOUTS = NEWS_SINGLE_COMPOSITIONS.map((c) => ({
  id: c.id,
  label: c.label,
}))

export const NEWS_SINGLE_BADGE_PLACEMENTS = [
  { id: 'above', label: 'بالای تصویر' },
  { id: 'on_image', label: 'روی تصویر' },
  { id: 'below_image', label: 'زیر تصویر' },
]

export const NEWS_SINGLE_GALLERY_RATIOS = [
  { id: '16_9', label: '۱۶:۹', css: '16 / 9' },
  { id: '4_3', label: '۴:۳', css: '4 / 3' },
  { id: '3_2', label: '۳:۲', css: '3 / 2' },
  { id: '1_1', label: '۱:۱', css: '1 / 1' },
  { id: '21_9', label: '۲۱:۹', css: '21 / 9' },
]

/** ۴ طرح ظاهر متا (تاریخ، بازدید، دسته، …) */
export const NEWS_SINGLE_META_STYLES = [
  {
    id: 'pills',
    label: 'قرصی',
    desc: 'پس‌زمینه نرم و گوشه گرد',
  },
  {
    id: 'chips',
    label: 'چیپ رنگی',
    desc: 'پس‌زمینه اکسنت و پررنگ',
  },
  {
    id: 'plain',
    label: 'ساده',
    desc: 'فقط آیکن و متن بدون باکس',
  },
  {
    id: 'stack',
    label: 'ستونی',
    desc: 'آیتم‌ها زیر هم به‌صورت عمودی',
  },
]

export const NEWS_SINGLE_META_PLACEMENTS = [
  { id: 'above_title', label: 'بالای عنوان' },
  { id: 'below_title', label: 'زیر عنوان' },
  { id: 'above_excerpt', label: 'بالای لید / توضیحات' },
  { id: 'below_image', label: 'زیر تصویر' },
  { id: 'on_image', label: 'روی تصویر' },
  { id: 'beside_image', label: 'کنار تصویر (عمودی)' },
]

export const DEFAULT_NEWS_SINGLE_PAGE_SETTINGS = {
  layout: 'classic',
  badge_placement: 'above',
  meta_style: 'pills',
  meta_placement: 'below_title',
  meta_text_color: '#6f675c',
  meta_bg_color: 'rgba(28, 25, 23, 0.04)',
  meta_icon_color: '#c27800',
  meta_border_color: 'rgba(28, 25, 23, 0.06)',
  title_size: 'md',
  title_font_size: 28,
  section_max_width: 900,
  gallery_aspect: '16_9',
  show_back_link: true,
  show_badges: true,
  show_status_badge: true,
  show_gallery: true,
  show_thumbnails: true,
  show_title: true,
  show_subtitle: true,
  show_excerpt: true,
  show_body: true,
  show_keywords: true,
  show_meta_date: true,
  show_meta_reading_time: true,
  show_meta_views: true,
  show_meta_writer: true,
  show_meta_source: true,
  show_meta_category: true,
  show_like: true,
  show_comment_btn: true,
  show_share: true,
  share_bale: true,
  share_eitaa: true,
  share_rubika: true,
  share_soroush: true,
  comments_enabled: true,
  allow_guest_comments: true,
  show_comments_list: true,
  show_json_ld: true,
  ink_color: '#2a241c',
  muted_color: '#6f675c',
  accent_color: '#c27800',
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
  'show_back_link',
  'show_badges',
  'show_status_badge',
  'show_gallery',
  'show_thumbnails',
  'show_title',
  'show_subtitle',
  'show_excerpt',
  'show_body',
  'show_keywords',
  'show_meta_date',
  'show_meta_reading_time',
  'show_meta_views',
  'show_meta_writer',
  'show_meta_source',
  'show_meta_category',
  'show_like',
  'show_comment_btn',
  'show_share',
  'share_bale',
  'share_eitaa',
  'share_rubika',
  'share_soroush',
  'comments_enabled',
  'allow_guest_comments',
  'show_comments_list',
  'show_json_ld',
]

export function getNewsSingleComposition(layoutId) {
  const id = layoutId === 'minimal' ? 'cover' : layoutId
  return (
    NEWS_SINGLE_COMPOSITIONS.find((c) => c.id === id) ||
    NEWS_SINGLE_COMPOSITIONS[0]
  )
}

/** اعمال پیش‌فرض‌های یک طرح روی تنظیمات (با حفظ بقیه فیلدها) */
function mapCompMetaPlace(place) {
  const known = NEWS_SINGLE_META_PLACEMENTS.some((p) => p.id === place)
  if (known) return place
  if (place === 'below') return 'below_title'
  return 'below_title'
}

export function applyNewsSingleComposition(prev, layoutId) {
  const comp = getNewsSingleComposition(layoutId)
  return normalizeNewsSinglePageSettings({
    ...(prev || {}),
    layout: comp.id,
    badge_placement: comp.badge_placement,
    meta_placement: mapCompMetaPlace(comp.meta_place),
  })
}

export function normalizeNewsSinglePageSettings(raw = {}) {
  const d = DEFAULT_NEWS_SINGLE_PAGE_SETTINGS
  const s = { ...d, ...(raw || {}) }

  // مهاجرت layout قدیمی
  if (s.layout === 'minimal') s.layout = 'cover'
  if (!NEWS_SINGLE_COMPOSITIONS.some((l) => l.id === s.layout)) {
    s.layout = d.layout
  }

  const comp = getNewsSingleComposition(s.layout)
  if (!NEWS_SINGLE_BADGE_PLACEMENTS.some((p) => p.id === s.badge_placement)) {
    s.badge_placement = comp.badge_placement || d.badge_placement
  }
  if (!NEWS_SINGLE_META_STYLES.some((p) => p.id === s.meta_style)) {
    s.meta_style = d.meta_style
  }
  if (!NEWS_SINGLE_META_PLACEMENTS.some((p) => p.id === s.meta_placement)) {
    s.meta_placement =
      mapCompMetaPlace(comp.meta_place) || d.meta_placement
  }

  if (!NEWS_SINGLE_GALLERY_RATIOS.some((a) => a.id === s.gallery_aspect)) {
    s.gallery_aspect = d.gallery_aspect
  }

  if (!NEWS_SINGLE_TITLE_SIZES.some((t) => t.id === s.title_size)) {
    s.title_size = d.title_size
  }
  const titlePreset =
    NEWS_SINGLE_TITLE_SIZES.find((t) => t.id === s.title_size) ||
    NEWS_SINGLE_TITLE_SIZES[1]
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
    Math.min(1200, pxNum(s.section_max_width, d.section_max_width, 1200))
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
  s.meta_text_color = colorStr(s.meta_text_color) || d.meta_text_color
  s.meta_bg_color = colorStr(s.meta_bg_color) || d.meta_bg_color
  s.meta_icon_color = colorStr(s.meta_icon_color) || d.meta_icon_color
  s.meta_border_color = colorStr(s.meta_border_color) || d.meta_border_color
  return s
}

/** مقادیر مؤثر چیدمان (طرح + override بج/متا) */
export function resolveNewsSingleComposition(settings) {
  const n = normalizeNewsSinglePageSettings(settings)
  const base = getNewsSingleComposition(n.layout)
  return {
    ...base,
    badge_placement: n.badge_placement || base.badge_placement,
    meta_placement: n.meta_placement || mapCompMetaPlace(base.meta_place),
    meta_style: n.meta_style || 'pills',
    settings: n,
  }
}

export function newsSinglePageCssVars(s) {
  const n = normalizeNewsSinglePageSettings(s)
  const aspect =
    NEWS_SINGLE_GALLERY_RATIOS.find((a) => a.id === n.gallery_aspect) ||
    NEWS_SINGLE_GALLERY_RATIOS[0]
  return {
    '--nsd-ink': n.ink_color,
    '--nsd-muted': n.muted_color,
    '--nsd-accent': n.accent_color,
    '--nsd-surface': n.surface_bg,
    '--nsd-max': `${n.section_max_width}px`,
    '--nsd-fs': `${n.content_font_size}px`,
    '--nsd-title-fs': `${n.title_font_size}px`,
    '--nsd-aspect': aspect.css,
    '--nsd-meta-text': n.meta_text_color,
    '--nsd-meta-bg': n.meta_bg_color,
    '--nsd-meta-icon': n.meta_icon_color,
    '--nsd-meta-border': n.meta_border_color,
  }
}
