// config/shopWidgetSettings.js — تنظیمات ویجت‌های طبقه فروشگاه

/** حالت‌های نمایش سبد / ویترین محصولات */
export const SHOP_DISPLAY_MODES = [
  { id: 'list', label: 'لیست' },
  { id: 'recycler', label: 'ریسایکلر' },
  { id: 'card', label: 'کارت' },
  { id: 'grid-2', label: 'دو ستونه' },
  { id: 'grid-3', label: 'سه ستونه' },
  { id: 'stories', label: 'استوری' },
]

export const SHOP_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const SHOP_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const SHOP_CARD_STYLES = [
  { id: 'soft', label: 'نرم' },
  { id: 'outline', label: 'خط‌دار' },
  { id: 'elevated', label: 'سایه‌دار' },
  { id: 'minimal', label: 'مینیمال' },
]

export const SHOP_IMAGE_RATIOS = [
  { id: '1_1', label: '۱:۱', css: '1 / 1' },
  { id: '4_3', label: '۴:۳', css: '4 / 3' },
  { id: '3_4', label: '۳:۴', css: '3 / 4' },
  { id: '16_9', label: '۱۶:۹', css: '16 / 9' },
]

/** همهٔ ویجت‌های فروشگاه با پنل تنظیمات */
export const SHOP_WIDGET_TYPES = new Set([
  'product_article',
  'shop_page',
  'featured_products',
  'latest_products',
  'bestsellers_products',
  'discounted_products',
  'products_recycler',
  'products_grid',
  'products_by_category',
  'product_stories',
  'shop_categories',
  'shop_search_bar',
])

export const SHOP_PRODUCT_STRIP_TYPES = new Set([
  'featured_products',
  'latest_products',
  'bestsellers_products',
  'discounted_products',
  'products_recycler',
  'products_grid',
  'products_by_category',
])

export const DEFAULT_SHOP_WIDGET_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: false,
  use_demo_data: true,
  show_title: true,
  show_more_link: true,
  more_href: '/shop',
  more_label: 'همه',
  title_text: '',
  limit: 8,
  offset: 0,
  display_mode: 'card',
  columns: 2,
  card_style: 'soft',
  image_ratio: '1_1',
  image_shape: 'circle',
  show_image: true,
  show_price: true,
  show_discount: true,
  show_shop: true,
  show_rating: true,
  show_add_button: true,
  category_id: '',
  category_title: '',
  max_width: 1140,
  gap: 20,
  recycler_card_width: 168,
  story_size: 70,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 8,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  ink_color: '',
  accent_color: '#ff00a6',
  surface_bg: '',
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  return raw && Object.prototype.hasOwnProperty.call(raw, key) ? !!raw[key] : d[key]
}

/** نگاشت نوع ویجت → منبع داده / UI */
export function getShopWidgetVariant(type) {
  switch (type) {
    case 'featured_products':
      return {
        kind: 'strip',
        source: 'featured',
        gate: 'shop_listings',
        title: 'محصولات ویژه',
        defaultMode: 'card',
      }
    case 'latest_products':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'جدیدترین محصولات',
        defaultMode: 'list',
      }
    case 'bestsellers_products':
      return {
        kind: 'strip',
        source: 'bestsellers',
        gate: 'shop_listings',
        title: 'پرفروش‌ترین‌ها',
        defaultMode: 'grid-2',
      }
    case 'discounted_products':
      return {
        kind: 'strip',
        source: 'discounted',
        gate: 'shop_listings',
        title: 'محصولات تخفیف‌دار',
        defaultMode: 'card',
      }
    case 'products_recycler':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'ویترین افقی',
        defaultMode: 'recycler',
      }
    case 'products_grid':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'گرید محصولات',
        defaultMode: 'grid-3',
      }
    case 'products_by_category':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'محصولات دسته',
        defaultMode: 'grid-2',
      }
    case 'product_stories':
      return {
        kind: 'stories',
        source: 'stories',
        gate: 'shop_listings',
        title: 'استوری محصولات',
        defaultMode: 'stories',
      }
    case 'shop_categories':
      return { kind: 'categories', gate: 'shop_listings', title: 'دسته‌های فروشگاه' }
    case 'shop_search_bar':
      return { kind: 'search', gate: 'shop' }
    case 'product_article':
      return { kind: 'article', gate: 'shop_product' }
    case 'shop_page':
      return { kind: 'page', gate: 'shop' }
    default:
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'محصولات',
        defaultMode: 'card',
      }
  }
}

export function isShopWidgetType(type) {
  return SHOP_WIDGET_TYPES.has(type)
}

export function normalizeShopWidgetSettings(raw = {}, type = 'featured_products') {
  const d = DEFAULT_SHOP_WIDGET_SETTINGS
  const s = { ...d, ...(raw || {}) }
  const variant = getShopWidgetVariant(type)

  s.show_on_mobile = bool(raw, 'show_on_mobile', d)
  s.show_on_desktop = bool(raw, 'show_on_desktop', d)
  s.section_full = bool(raw, 'section_full', d)
  s.use_demo_data = bool(raw, 'use_demo_data', d)
  s.show_title = bool(raw, 'show_title', d)
  s.show_more_link = bool(raw, 'show_more_link', d)
  s.show_image = bool(raw, 'show_image', d)
  s.show_price = bool(raw, 'show_price', d)
  s.show_discount = bool(raw, 'show_discount', d)
  s.show_shop = bool(raw, 'show_shop', d)
  s.show_rating = bool(raw, 'show_rating', d)
  s.show_add_button = bool(raw, 'show_add_button', d)

  s.more_href = String(s.more_href || d.more_href)
  s.more_label = String(s.more_label || d.more_label)
  s.title_text = String(s.title_text || '')
  s.category_id = String(s.category_id || '')
  s.category_title = String(s.category_title || '')
  s.ink_color = String(s.ink_color || '')
  s.accent_color = String(s.accent_color || d.accent_color)
  s.surface_bg = String(s.surface_bg || '')

  s.limit = pxNum(s.limit, d.limit, 48)
  s.offset = pxNum(s.offset, d.offset, 100)
  s.columns = pxNum(s.columns, d.columns, 4)
  s.max_width = pxNum(s.max_width, d.max_width, 1600)
  s.gap = pxNum(s.gap, d.gap, 48)
  s.recycler_card_width = pxNum(s.recycler_card_width, d.recycler_card_width, 320)
  s.story_size = pxNum(s.story_size, d.story_size, 140)

  SHOP_SPACE_FIELDS.concat(SHOP_MARGIN_FIELDS).forEach(({ key }) => {
    s[key] = pxNum(s[key], d[key], 240)
  })

  const modes = new Set(SHOP_DISPLAY_MODES.map((m) => m.id))
  if (!modes.has(s.display_mode)) {
    s.display_mode = variant.defaultMode || d.display_mode
  }
  // ویجت‌های تخصصی حالت پیش‌فرض خود را دارند مگر کاربر عوض کرده باشد
  if (type === 'products_recycler' && !(raw && raw.display_mode)) {
    s.display_mode = 'recycler'
  }
  if (type === 'product_stories' && !(raw && raw.display_mode)) {
    s.display_mode = 'stories'
  }
  if (type === 'products_grid' && !(raw && raw.display_mode)) {
    s.display_mode = 'grid-3'
  }

  if (!SHOP_CARD_STYLES.some((c) => c.id === s.card_style)) {
    s.card_style = d.card_style
  }
  if (!SHOP_IMAGE_RATIOS.some((c) => c.id === s.image_ratio)) {
    s.image_ratio = d.image_ratio
  }
  if (s.image_shape !== 'rounded' && s.image_shape !== 'circle') {
    s.image_shape = d.image_shape
  }

  if (!s.title_text && variant.title) {
    s._default_title = variant.title
  }

  return s
}

export function shopWidgetCssVars(settings) {
  const s = settings || DEFAULT_SHOP_WIDGET_SETTINGS
  const ratio = SHOP_IMAGE_RATIOS.find((r) => r.id === s.image_ratio)
  return {
    '--shop-pad-t': `${s.padding_top || 0}px`,
    '--shop-pad-r': `${s.padding_right || 0}px`,
    '--shop-pad-b': `${s.padding_bottom || 0}px`,
    '--shop-pad-l': `${s.padding_left || 0}px`,
    '--shop-mar-t': `${s.margin_top || 0}px`,
    '--shop-mar-r': `${s.margin_right || 0}px`,
    '--shop-mar-b': `${s.margin_bottom || 0}px`,
    '--shop-mar-l': `${s.margin_left || 0}px`,
    '--shop-gap': `${s.gap || 12}px`,
    '--shop-max': s.max_width ? `${s.max_width}px` : '1140px',
    '--shop-accent': s.accent_color || '#ff00a6',
    '--shop-success-light': s.accent_color || '#ff00a6',
    '--shop-ink': s.ink_color || 'inherit',
    '--shop-surface': s.surface_bg || 'transparent',
    '--shop-ratio': ratio?.css || '1 / 1',
    '--shop-recycler-w': `${s.recycler_card_width || 168}px`,
    '--shop-story': `${s.story_size || 70}px`,
  }
}
