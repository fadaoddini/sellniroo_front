// config/productSinglePageSettings.js — تنظیمات صفحه سینگل محصول

export const PRODUCT_SINGLE_COMPOSITIONS = [
  {
    id: 'classic',
    label: 'کلاسیک',
    desc: 'گالری کنار جزئیات و دکمه خرید',
  },
  {
    id: 'magazine',
    label: 'مجله‌ای',
    desc: 'عنوان درشت، تمرکز روی توضیحات',
  },
  {
    id: 'cover',
    label: 'کاور',
    desc: 'تصویر تمام‌عرض با عنوان روی تصویر',
  },
  {
    id: 'split',
    label: 'دو ستونه',
    desc: 'گالری و جزئیات کنار هم روی دسکتاپ',
  },
]

export const PRODUCT_SINGLE_TITLE_SIZES = [
  { id: 'sm', label: 'کوچک', px: 22 },
  { id: 'md', label: 'متوسط', px: 28 },
  { id: 'lg', label: 'بزرگ', px: 34 },
  { id: 'xl', label: 'خیلی بزرگ', px: 40 },
]

export const DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS = {
  layout: 'split',
  title_size: 'md',
  title_font_size: 18,
  section_max_width: 1140,
  show_breadcrumb: true,
  show_back_link: true,
  show_gallery: true,
  show_badges: true,
  show_featured_badge: true,
  show_discount_badge: true,
  show_title: true,
  show_shop: true,
  show_category: true,
  show_rating: true,
  show_price: true,
  show_old_price: true,
  show_stock: true,
  show_description: true,
  show_lid: true,
  show_add_to_cart: true,
  show_wishlist: true,
  show_share: true,
  show_similar: true,
  show_specs: true,
  ink_color: '#3f3f3f',
  muted_color: '#a1a1a1',
  accent_color: '#ff00a6',
  surface_bg: '#ffffff',
  content_font_size: 14,
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent') return 'transparent'
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s
  if (/^(rgb|hsl)a?\(/i.test(s)) return s
  return ''
}

function bool(raw, key, d) {
  return raw && Object.prototype.hasOwnProperty.call(raw, key) ? !!raw[key] : d[key]
}

function num(v, fallback, min = 0, max = 2000) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

export function normalizeProductSinglePageSettings(raw = {}) {
  const d = DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS
  const s = { ...d, ...(raw || {}) }
  const layouts = new Set(PRODUCT_SINGLE_COMPOSITIONS.map((c) => c.id))
  if (!layouts.has(s.layout)) s.layout = d.layout

  const sizes = new Set(PRODUCT_SINGLE_TITLE_SIZES.map((c) => c.id))
  if (!sizes.has(s.title_size)) s.title_size = d.title_size
  const sizeMeta = PRODUCT_SINGLE_TITLE_SIZES.find((c) => c.id === s.title_size)
  s.title_font_size = num(s.title_font_size, sizeMeta?.px || d.title_font_size, 14, 64)
  s.section_max_width = num(s.section_max_width, d.section_max_width, 480, 1600)
  s.content_font_size = num(s.content_font_size, d.content_font_size, 12, 28)

  ;[
    'show_breadcrumb',
    'show_back_link',
    'show_gallery',
    'show_badges',
    'show_featured_badge',
    'show_discount_badge',
    'show_title',
    'show_shop',
    'show_category',
    'show_rating',
    'show_price',
    'show_old_price',
    'show_stock',
    'show_description',
    'show_lid',
    'show_add_to_cart',
    'show_wishlist',
    'show_share',
    'show_similar',
    'show_specs',
  ].forEach((k) => {
    s[k] = bool(raw, k, d)
  })

  s.ink_color = colorStr(s.ink_color) || d.ink_color
  s.muted_color = colorStr(s.muted_color) || d.muted_color
  s.accent_color = colorStr(s.accent_color) || d.accent_color
  s.surface_bg = colorStr(s.surface_bg) || d.surface_bg

  return s
}

export function productSingleCssVars(settings) {
  const s = normalizeProductSinglePageSettings(settings)
  return {
    '--pdp-ink': s.ink_color,
    '--pdp-muted': s.muted_color,
    '--pdp-accent': s.accent_color,
    '--pdp-surface': s.surface_bg,
    '--pdp-title': `${s.title_font_size}px`,
    '--pdp-body': `${s.content_font_size}px`,
    '--pdp-max': `${s.section_max_width}px`,
  }
}

/** اعمال قالب ترکیب روی تنظیمات فعلی */
export function applyProductSingleComposition(current, compositionId) {
  const base = normalizeProductSinglePageSettings(current)
  const size = PRODUCT_SINGLE_TITLE_SIZES.find((x) => x.id === base.title_size)
  const next = { ...base, layout: compositionId }
  if (compositionId === 'magazine') {
    next.title_size = 'lg'
    next.title_font_size = 34
    next.show_lid = true
  } else if (compositionId === 'cover') {
    next.title_size = 'xl'
    next.title_font_size = 40
    next.show_gallery = true
  } else if (compositionId === 'split') {
    next.title_size = 'md'
    next.title_font_size = size?.px || 28
  } else {
    next.title_size = 'md'
    next.title_font_size = 28
  }
  return normalizeProductSinglePageSettings(next)
}
