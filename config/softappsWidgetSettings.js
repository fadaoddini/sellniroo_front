// config/softappsWidgetSettings.js — تنظیمات ویجت نرم‌افزارهای کاربردی
// دسکتاپ / موبایل جدا (مثل نوار خبر فوری)

import { SHOP_FONTS, shopFontCss } from '@/config/shopWidgetSettings'

export { SHOP_FONTS as SOFTAPPS_FONTS, shopFontCss as softAppsFontCss }

export const SOFTAPPS_WIDGET_TYPES = new Set([
  'softapps_grid',
  'softapps_featured',
  'softapps_cta',
])

export const SOFTAPPS_GRID_TYPES = new Set([
  'softapps_grid',
  'softapps_featured',
])

export const SOFTAPPS_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const SOFTAPPS_DISPLAY_MODES = [
  { id: 'grid', label: 'گرید' },
  { id: 'list', label: 'لیست' },
  { id: 'recycler', label: 'ریسایکلر' },
]

/** ۴ اسکلتون کارت — افقی / عمودی */
export const SOFTAPPS_CARD_SKELETONS = [
  {
    id: 'vertical',
    label: 'عمودی کلاسیک',
    desc: 'آیکن بالا، متن و قیمت زیر',
    skeleton: 'vertical',
    patch: {
      card_skeleton: 'vertical',
      display_mode: 'grid',
      columns: 3,
      icon_size: 64,
      show_desc: true,
    },
  },
  {
    id: 'horizontal',
    label: 'افقی کنارهم',
    desc: 'آیکن کنار عنوان و توضیح',
    skeleton: 'horizontal',
    patch: {
      card_skeleton: 'horizontal',
      display_mode: 'grid',
      columns: 2,
      icon_size: 56,
      show_desc: true,
    },
  },
  {
    id: 'row',
    label: 'ردیفی پهن',
    desc: 'کارت افقی تمام‌عرض شبیه لیست',
    skeleton: 'row',
    patch: {
      card_skeleton: 'row',
      display_mode: 'list',
      icon_size: 52,
      show_desc: true,
    },
  },
  {
    id: 'tile',
    label: 'کاشی مربعی',
    desc: 'عمودی فشرده با آیکن درشت وسط',
    skeleton: 'tile',
    patch: {
      card_skeleton: 'tile',
      display_mode: 'grid',
      columns: 4,
      icon_size: 72,
      show_desc: false,
    },
  },
]

export function getSoftAppsCardSkeleton(id) {
  return SOFTAPPS_CARD_SKELETONS.find((p) => p.id === id) || null
}

export const SOFTAPPS_COLUMNS = [
  { id: 2, label: '۲ ستون' },
  { id: 3, label: '۳ ستون' },
  { id: 4, label: '۴ ستون' },
]

export const SOFTAPPS_CARD_STYLES = [
  { id: 'soft', label: 'نرم' },
  { id: 'outline', label: 'خط‌دار' },
  { id: 'elevated', label: 'سایه‌دار' },
  { id: 'minimal', label: 'مینیمال' },
]

export const SOFTAPPS_ICON_SHAPES = [
  { id: 'rounded', label: 'مربع گرد' },
  { id: 'circle', label: 'دایره' },
  { id: 'square', label: 'مربع' },
]

export const SOFTAPPS_PRICING_FILTERS = [
  { id: 'all', label: 'همه' },
  { id: 'free', label: 'فقط رایگان' },
  { id: 'paid', label: 'فقط پولی' },
]

export const SOFTAPPS_PLATFORMS = [
  { id: '', label: 'همه پلتفرم‌ها' },
  { id: 'windows', label: 'ویندوز' },
  { id: 'mac', label: 'مک' },
  { id: 'android', label: 'اندروید' },
  { id: 'ios', label: 'iOS' },
  { id: 'linux', label: 'لینوکس' },
  { id: 'web', label: 'وب' },
  { id: 'other', label: 'سایر' },
]

export const SOFTAPPS_TITLE_ALIGNS = [
  { id: 'center', label: 'وسط' },
  { id: 'start', label: 'شروع' },
  { id: 'end', label: 'پایان' },
]

export const SOFTAPPS_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const SOFTAPPS_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

/** کلیدهای مشترک ریشه — برای هر دو دستگاه یکسان */
export const SOFTAPPS_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'limit',
  'offset',
  'featured_only',
  'pricing',
  'category_id',
  'platform',
  'sort',
  'more_href',
  'cta_href',
])

/** کلیدهای وابسته به ویوپورت (دسکتاپ / موبایل جدا) */
export const SOFTAPPS_VIEWPORT_KEYS = [
  'section_full',
  'show_brand',
  'brand_text',
  'show_title',
  'title_text',
  'show_subtitle',
  'subtitle_text',
  'title_align',
  'display_mode',
  'columns',
  'card_skeleton',
  'card_style',
  'icon_shape',
  'icon_size',
  'recycler_card_width',
  'gap',
  'max_width',
  'title_font',
  'card_title_font',
  'body_font',
  'show_icon',
  'show_desc',
  'show_price',
  'show_downloads',
  'show_platform',
  'show_version',
  'show_badges',
  'show_category',
  'show_more_link',
  'more_label',
  'cta_label',
  'cta_align',
  'cta_full_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  'accent_color',
  'ink_color',
  'muted_color',
  'surface_bg',
  'card_bg',
]

export const DEFAULT_SOFTAPPS_WIDGET_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: false,

  show_brand: true,
  brand_text: 'سلنیرو',
  show_title: true,
  title_text: 'نرم‌افزارهای کاربردی',
  show_subtitle: true,
  subtitle_text: '',
  title_align: 'center',

  limit: 6,
  offset: 0,
  featured_only: false,
  pricing: 'all',
  category_id: '',
  platform: '',
  sort: 'default',

  display_mode: 'grid',
  columns: 3,
  card_skeleton: 'horizontal',
  card_style: 'soft',
  icon_shape: 'rounded',
  icon_size: 56,
  recycler_card_width: 220,
  gap: 18,
  max_width: 1080,
  title_font: 'edameh',
  card_title_font: 'edameh',
  body_font: 'iran',

  show_icon: true,
  show_desc: true,
  show_price: true,
  show_downloads: true,
  show_platform: true,
  show_version: true,
  show_badges: true,
  show_category: false,

  show_more_link: true,
  more_label: 'مشاهده همه',
  more_href: '/apps',

  cta_label: 'نرم‌افزارهای کاربردی',
  cta_href: '/apps',
  cta_align: 'center',
  cta_full_width: false,

  padding_top: 24,
  padding_right: 16,
  padding_bottom: 24,
  padding_left: 16,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,

  accent_color: '#0e7490',
  ink_color: '',
  muted_color: '',
  surface_bg: '',
  card_bg: '',
}

/** پیش‌فرض موبایل — فشرده‌تر و inset */
export const DEFAULT_SOFTAPPS_MOBILE_OVERRIDES = {
  columns: 2,
  display_mode: 'grid',
  icon_size: 48,
  gap: 12,
  max_width: 480,
  recycler_card_width: 180,
  padding_top: 16,
  padding_right: 12,
  padding_bottom: 16,
  padding_left: 12,
  margin_left: 0,
  margin_right: 0,
  section_full: false,
  title_align: 'center',
  show_platform: false,
  show_version: false,
  show_desc: true,
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  return raw && Object.prototype.hasOwnProperty.call(raw, key)
    ? !!raw[key]
    : d[key]
}

function str(raw, key, d) {
  if (raw && Object.prototype.hasOwnProperty.call(raw, key)) {
    return String(raw[key] ?? '')
  }
  return d[key]
}

function pickViewportSlice(obj = {}) {
  const out = {}
  SOFTAPPS_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function isSoftAppsWidgetType(type) {
  return SOFTAPPS_WIDGET_TYPES.has(type)
}

export function isSoftAppsGridWidgetType(type) {
  return SOFTAPPS_GRID_TYPES.has(type)
}

export function isSoftAppsCtaWidgetType(type) {
  return type === 'softapps_cta'
}

/** پیش‌فرض‌های وابسته به نوع ویجت — با desktop/mobile جدا */
export function getSoftAppsWidgetDefaults(type) {
  const base = { ...DEFAULT_SOFTAPPS_WIDGET_SETTINGS }
  if (type === 'softapps_featured') {
    base.featured_only = true
    base.title_text = 'نرم‌افزارهای ویژه'
    base.limit = 4
  }
  if (type === 'softapps_cta') {
    base.show_brand = false
    base.show_title = false
    base.show_subtitle = false
    base.show_more_link = false
  }

  const desktopSlice = pickViewportSlice(base)
  const mobileSlice = {
    ...desktopSlice,
    ...DEFAULT_SOFTAPPS_MOBILE_OVERRIDES,
  }
  if (type === 'softapps_cta') {
    mobileSlice.cta_full_width = true
    mobileSlice.padding_top = 12
    mobileSlice.padding_bottom = 12
    mobileSlice.padding_left = 12
    mobileSlice.padding_right = 12
  }

  return {
    ...base,
    desktop: desktopSlice,
    mobile: mobileSlice,
  }
}

/**
 * دسکتاپ و موبایل جدا — اگر موبایل خالی باشد موقتاً دسکتاپ نشان داده می‌شود.
 */
export function mergeSoftAppsViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}

  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) {
      return { ...flat, ...mobileOv }
    }
    return desktop
  }
  return desktop
}

function coerceSoftAppsSettings(merged, rawRoot = {}, type = 'softapps_grid') {
  const flatDefaults = { ...DEFAULT_SOFTAPPS_WIDGET_SETTINGS }
  if (type === 'softapps_featured') {
    flatDefaults.featured_only = true
    flatDefaults.title_text = 'نرم‌افزارهای ویژه'
    flatDefaults.limit = 4
  }
  if (type === 'softapps_cta') {
    flatDefaults.show_brand = false
    flatDefaults.show_title = false
    flatDefaults.show_subtitle = false
    flatDefaults.show_more_link = false
  }

  const r = { ...flatDefaults, ...merged }

  const displayModes = new Set(SOFTAPPS_DISPLAY_MODES.map((m) => m.id))
  const cardStyles = new Set(SOFTAPPS_CARD_STYLES.map((m) => m.id))
  const cardSkeletons = new Set(SOFTAPPS_CARD_SKELETONS.map((m) => m.id))
  const fontIds = new Set(SHOP_FONTS.map((m) => m.id))
  const iconShapes = new Set(SOFTAPPS_ICON_SHAPES.map((m) => m.id))
  const pricing = new Set(SOFTAPPS_PRICING_FILTERS.map((m) => m.id))
  const aligns = new Set(SOFTAPPS_TITLE_ALIGNS.map((m) => m.id))
  const sorts = new Set(['default', 'downloads', 'newest', 'price'])

  let columns = Number(r.columns ?? flatDefaults.columns)
  if (![2, 3, 4].includes(columns)) columns = flatDefaults.columns

  let display_mode = str(r, 'display_mode', flatDefaults)
  if (!displayModes.has(display_mode)) display_mode = flatDefaults.display_mode

  let card_skeleton = str(r, 'card_skeleton', flatDefaults)
  if (!cardSkeletons.has(card_skeleton)) {
    card_skeleton = flatDefaults.card_skeleton
  }

  let card_style = str(r, 'card_style', flatDefaults)
  if (!cardStyles.has(card_style)) card_style = flatDefaults.card_style

  let icon_shape = str(r, 'icon_shape', flatDefaults)
  if (!iconShapes.has(icon_shape)) icon_shape = flatDefaults.icon_shape

  let title_font = str(r, 'title_font', flatDefaults)
  if (!fontIds.has(title_font)) title_font = flatDefaults.title_font
  let card_title_font = str(r, 'card_title_font', flatDefaults)
  if (!fontIds.has(card_title_font)) {
    card_title_font = flatDefaults.card_title_font
  }
  let body_font = str(r, 'body_font', flatDefaults)
  if (!fontIds.has(body_font)) body_font = flatDefaults.body_font

  // داده‌های مشترک از ریشه
  let pricingVal = str(rawRoot, 'pricing', flatDefaults)
  if (!Object.prototype.hasOwnProperty.call(rawRoot, 'pricing')) {
    pricingVal = str(r, 'pricing', flatDefaults)
  }
  if (!pricing.has(pricingVal)) pricingVal = flatDefaults.pricing

  let title_align = str(r, 'title_align', flatDefaults)
  if (!aligns.has(title_align)) title_align = flatDefaults.title_align

  let cta_align = str(r, 'cta_align', flatDefaults)
  if (!aligns.has(cta_align)) cta_align = flatDefaults.cta_align

  let sort = str(rawRoot, 'sort', flatDefaults)
  if (!Object.prototype.hasOwnProperty.call(rawRoot, 'sort')) {
    sort = str(r, 'sort', flatDefaults)
  }
  if (!sorts.has(sort)) sort = flatDefaults.sort

  let featured_only = bool(rawRoot, 'featured_only', flatDefaults)
  if (
    type === 'softapps_featured' &&
    !Object.prototype.hasOwnProperty.call(rawRoot, 'featured_only')
  ) {
    featured_only = true
  }

  const limitSrc = Object.prototype.hasOwnProperty.call(rawRoot, 'limit')
    ? rawRoot
    : r
  const offsetSrc = Object.prototype.hasOwnProperty.call(rawRoot, 'offset')
    ? rawRoot
    : r

  return {
    show_on_mobile:
      rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile,
    show_on_desktop:
      rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop,
    section_full: bool(r, 'section_full', flatDefaults),

    show_brand: bool(r, 'show_brand', flatDefaults),
    brand_text: str(r, 'brand_text', flatDefaults),
    show_title: bool(r, 'show_title', flatDefaults),
    title_text: str(r, 'title_text', flatDefaults),
    show_subtitle: bool(r, 'show_subtitle', flatDefaults),
    subtitle_text: str(r, 'subtitle_text', flatDefaults),
    title_align,

    limit: Math.max(
      1,
      Math.min(48, pxNum(limitSrc.limit, flatDefaults.limit, 48))
    ),
    offset: Math.max(
      0,
      Math.min(200, pxNum(offsetSrc.offset, flatDefaults.offset, 200))
    ),
    featured_only,
    pricing: pricingVal,
    category_id: Object.prototype.hasOwnProperty.call(rawRoot, 'category_id')
      ? String(rawRoot.category_id ?? '')
      : str(r, 'category_id', flatDefaults),
    platform: Object.prototype.hasOwnProperty.call(rawRoot, 'platform')
      ? String(rawRoot.platform ?? '')
      : str(r, 'platform', flatDefaults),
    sort,

    display_mode,
    columns,
    card_skeleton,
    card_style,
    icon_shape,
    title_font,
    card_title_font,
    body_font,
    icon_size: Math.max(
      32,
      Math.min(120, pxNum(r.icon_size, flatDefaults.icon_size, 120))
    ),
    recycler_card_width: Math.max(
      140,
      Math.min(
        360,
        pxNum(r.recycler_card_width, flatDefaults.recycler_card_width, 360)
      )
    ),
    gap: Math.max(0, Math.min(48, pxNum(r.gap, flatDefaults.gap, 48))),
    max_width: Math.max(
      280,
      Math.min(1600, pxNum(r.max_width, flatDefaults.max_width, 1600))
    ),

    show_icon: bool(r, 'show_icon', flatDefaults),
    show_desc: bool(r, 'show_desc', flatDefaults),
    show_price: bool(r, 'show_price', flatDefaults),
    show_downloads: bool(r, 'show_downloads', flatDefaults),
    show_platform: bool(r, 'show_platform', flatDefaults),
    show_version: bool(r, 'show_version', flatDefaults),
    show_badges: bool(r, 'show_badges', flatDefaults),
    show_category: bool(r, 'show_category', flatDefaults),

    show_more_link: bool(r, 'show_more_link', flatDefaults),
    more_label: str(r, 'more_label', flatDefaults),
    more_href:
      (Object.prototype.hasOwnProperty.call(rawRoot, 'more_href')
        ? String(rawRoot.more_href ?? '')
        : str(r, 'more_href', flatDefaults)) || '/apps',

    cta_label: str(r, 'cta_label', flatDefaults),
    cta_href:
      (Object.prototype.hasOwnProperty.call(rawRoot, 'cta_href')
        ? String(rawRoot.cta_href ?? '')
        : str(r, 'cta_href', flatDefaults)) || '/apps',
    cta_align,
    cta_full_width: bool(r, 'cta_full_width', flatDefaults),

    padding_top: pxNum(r.padding_top, flatDefaults.padding_top),
    padding_right: pxNum(r.padding_right, flatDefaults.padding_right),
    padding_bottom: pxNum(r.padding_bottom, flatDefaults.padding_bottom),
    padding_left: pxNum(r.padding_left, flatDefaults.padding_left),
    margin_top: pxNum(r.margin_top, flatDefaults.margin_top),
    margin_right: pxNum(r.margin_right, flatDefaults.margin_right),
    margin_bottom: pxNum(r.margin_bottom, flatDefaults.margin_bottom),
    margin_left: pxNum(r.margin_left, flatDefaults.margin_left),

    accent_color: str(r, 'accent_color', flatDefaults) || flatDefaults.accent_color,
    ink_color: str(r, 'ink_color', flatDefaults),
    muted_color: str(r, 'muted_color', flatDefaults),
    surface_bg: str(r, 'surface_bg', flatDefaults),
    card_bg: str(r, 'card_bg', flatDefaults),
  }
}

/**
 * @param {object} raw
 * @param {string} [type]
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function normalizeSoftAppsWidgetSettings(
  raw,
  type = 'softapps_grid',
  opts = {}
) {
  // سازگاری با امضای قبلی: normalize(raw, type) یا normalize(raw, { viewport })
  let widgetType = type
  let options = opts
  if (type && typeof type === 'object' && !Array.isArray(type)) {
    options = type
    widgetType = options.type || 'softapps_grid'
  }

  const viewport = options.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeSoftAppsViewportRaw(root, viewport)
  return coerceSoftAppsSettings(merged, root, widgetType)
}

/** فقط پرچم‌های نمایش کل ویجت در ریشه */
export function getSoftAppsVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotSoftAppsViewportSettings(
  raw = {},
  viewport = 'desktop',
  type = 'softapps_grid'
) {
  return pickViewportSlice(
    normalizeSoftAppsWidgetSettings(raw, type, { viewport })
  )
}

/**
 * پچ تنظیمات برای یک ویوپورت — اسنپ‌شات کامل همان دستگاه
 */
export function buildSoftAppsViewportPatch(raw, device, key, value, type) {
  if (SOFTAPPS_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotSoftAppsViewportSettings(root, vp, type)
  return { [vp]: { ...current, [key]: value } }
}

export function softAppsWidgetSectionStyle(settings) {
  const s = settings || DEFAULT_SOFTAPPS_WIDGET_SETTINGS
  const style = {
    paddingTop: `${s.padding_top}px`,
    paddingRight: `${s.padding_right}px`,
    paddingBottom: `${s.padding_bottom}px`,
    paddingLeft: `${s.padding_left}px`,
    marginTop: `${s.margin_top}px`,
    marginRight: `${s.margin_right}px`,
    marginBottom: `${s.margin_bottom}px`,
    marginLeft: `${s.margin_left}px`,
    '--sa-accent': s.accent_color || '#0e7490',
    '--sa-title-ff': shopFontCss(s.title_font),
    '--sa-card-title-ff': shopFontCss(s.card_title_font),
    '--sa-body-ff': shopFontCss(s.body_font),
  }
  if (s.ink_color) style['--sa-ink'] = s.ink_color
  if (s.muted_color) style['--sa-muted'] = s.muted_color
  if (s.surface_bg) style.background = s.surface_bg
  if (s.card_bg) style['--sa-card-bg'] = s.card_bg
  return style
}

/** اعمال یکجای اسکلتون کارت */
export function applySoftAppsCardSkeleton(skeletonId, current = {}) {
  const preset = getSoftAppsCardSkeleton(skeletonId)
  if (!preset) return { ...current, card_skeleton: skeletonId }
  return { ...current, ...preset.patch }
}
