// تنظیمات کامل + ۴ اسکلتون سینگل محصول
import { SHOP_FONTS, shopFontCss } from '@/config/shopWidgetSettings'

export const PRODUCT_SINGLE_FONTS = SHOP_FONTS
export { shopFontCss as productFontCss }

/**
 * family:
 *  - two_col     → گالری | جزئیات
 *  - two_col_rev → جزئیات | گالری
 *  - stack       → عنوان → گالری → جزئیات
 *  - stack_lead  → عنوان درشت → گالری عریض → جزئیات
 *  - cover       → هیرو تمام‌عرض + جزئیات
 */
export const PRODUCT_SINGLE_COMPOSITIONS = [
  {
    id: 'split',
    label: 'گالری کنار جزئیات',
    desc: 'استاندارد فروشگاهی؛ تصویر کنترل‌شده کنار اطلاعات و قیمت',
    skeleton: 'pdp_split',
    family: 'two_col',
  },
  {
    id: 'classic',
    label: 'کلاسیک متعادل',
    desc: '۵۰٪ تصویر / ۵۰٪ اطلاعات؛ بندانگشتی عمودی کنار گالری',
    skeleton: 'pdp_classic',
    family: 'two_col',
  },
  {
    id: 'magazine',
    label: 'مجله‌ای',
    desc: 'عنوان درشت بالا، تصویر عریض، بعد جزئیات و خرید',
    skeleton: 'pdp_magazine',
    family: 'stack',
  },
  {
    id: 'cover',
    label: 'کاور سینمایی',
    desc: 'هیرو تمام‌عرض با عنوان روی تصویر؛ جزئیات زیر کاور',
    skeleton: 'pdp_cover',
    family: 'cover',
  },
]

export const PRODUCT_SINGLE_TITLE_SIZES = [
  { id: 'sm', label: 'کوچک', px: 22 },
  { id: 'md', label: 'متوسط', px: 28 },
  { id: 'lg', label: 'بزرگ', px: 34 },
  { id: 'xl', label: 'خیلی بزرگ', px: 40 },
]

export const PRODUCT_SINGLE_GALLERY_RATIOS = [
  { id: '1_1', label: 'مربع ۱∶۱' },
  { id: '5_4', label: '۵∶۴' },
  { id: '4_5', label: '۴∶۵' },
  { id: '3_4', label: '۳∶۴' },
  { id: '3_2', label: '۳∶۲' },
  { id: '2_3', label: '۲∶۳' },
  { id: '16_9', label: '۱۶∶۹' },
]

export const PRODUCT_SINGLE_GALLERY_FITS = [
  { id: 'cover', label: 'پوشش (برش)' },
  { id: 'contain', label: 'کامل (بدون برش)' },
]

export const PRODUCT_SINGLE_CTA_STYLES = [
  { id: 'solid', label: 'توپر' },
  { id: 'outline', label: 'حاشیه‌دار' },
  { id: 'soft', label: 'نرم' },
]

export const PRODUCT_SINGLE_IMAGE_HOVERS = [
  { id: 'none', label: 'بدون افکت' },
  { id: 'zoom', label: 'زوم' },
  { id: 'lift', label: 'بالا آمدن' },
  { id: 'dim', label: 'تیره‌شدن' },
  { id: 'glow', label: 'درخشش طلایی' },
]

export const PRODUCT_SINGLE_THUMB_PLACEMENTS = [
  { id: 'outside', label: 'بیرون تصویر' },
  { id: 'inside', label: 'داخل تصویر' },
]

export const PRODUCT_SINGLE_THUMB_POSITIONS = [
  { id: 'bottom', label: 'پایین' },
  { id: 'top', label: 'بالا' },
  { id: 'start', label: 'راست' },
  { id: 'end', label: 'چپ' },
]

export const PRODUCT_SINGLE_ADMIN_TABS = [
  { id: 'skeleton', label: 'اسکلتون' },
  { id: 'blocks', label: 'چینش کنار تصویر' },
  { id: 'gallery', label: 'گالری' },
  { id: 'actions', label: 'سبد و علاقه' },
  { id: 'type', label: 'فونت و اندازه' },
  { id: 'colors', label: 'رنگ‌ها' },
]

/** بلوک‌های ستون اطلاعات کنار گالری — ترتیب قابل شخصی‌سازی */
export const PRODUCT_SINGLE_DETAIL_BLOCKS = [
  { id: 'badges', label: 'نشان‌ها', desc: 'تخفیف، ویژه، موجودی انبار', showKey: 'show_badges' },
  { id: 'title', label: 'عنوان', desc: 'نام محصول', showKey: 'show_title' },
  { id: 'rating', label: 'امتیاز', desc: 'ستاره‌ها و نمره', showKey: 'show_rating' },
  { id: 'lid', label: 'خلاصه', desc: 'لید کوتاه محصول', showKey: 'show_lid' },
  { id: 'price', label: 'قیمت', desc: 'قیمت واحد، تخفیف و تعدادی', showKey: 'show_price' },
  { id: 'stock', label: 'موجودی و سقف سفارش', desc: 'حداقل/حداکثر و رزرو سبد', showKey: 'show_stock' },
  { id: 'actions', label: 'سبد و اکشن‌ها', desc: 'افزودن به سبد، علاقه، اشتراک', showKey: 'show_add_to_cart' },
  { id: 'category', label: 'دسته‌بندی', desc: 'نام دسته محصول', showKey: 'show_category' },
  { id: 'shop', label: 'فروشگاه', desc: 'نام و لوگوی فروشگاه', showKey: 'show_shop' },
  { id: 'description', label: 'توضیحات', desc: 'متن کامل محصول', showKey: 'show_description' },
  { id: 'specs', label: 'مشخصات', desc: 'ویژگی‌ها و وزن', showKey: 'show_specs' },
]

export const DEFAULT_PRODUCT_SINGLE_DETAIL_BLOCKS_ORDER =
  PRODUCT_SINGLE_DETAIL_BLOCKS.map((b) => b.id)

export function normalizeProductSingleDetailBlocksOrder(raw) {
  const known = DEFAULT_PRODUCT_SINGLE_DETAIL_BLOCKS_ORDER
  const knownSet = new Set(known)
  const incoming = Array.isArray(raw)
    ? raw.map((id) => String(id || '').trim()).filter((id) => knownSet.has(id))
    : []
  const seen = new Set()
  const ordered = []
  incoming.forEach((id) => {
    if (seen.has(id)) return
    seen.add(id)
    ordered.push(id)
  })
  known.forEach((id) => {
    if (!seen.has(id)) ordered.push(id)
  })
  return ordered
}

export function moveProductSingleDetailBlock(order, blockId, direction) {
  const list = normalizeProductSingleDetailBlocksOrder(order)
  const i = list.indexOf(blockId)
  if (i < 0) return list
  const j = direction === 'up' ? i - 1 : i + 1
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export const PRODUCT_SINGLE_BLOCK_TOGGLES = [
  { key: 'show_breadcrumb', label: 'مسیر (breadcrumb)', group: 'nav' },
  { key: 'show_back_link', label: 'لینک بازگشت', group: 'nav' },
  { key: 'show_gallery', label: 'گالری تصویر', group: 'media' },
  { key: 'show_thumbs', label: 'بندانگشتی‌ها', group: 'media' },
  { key: 'show_badges', label: 'نشان‌ها', group: 'meta' },
  { key: 'show_featured_badge', label: 'نشان ویژه', group: 'meta' },
  { key: 'show_discount_badge', label: 'نشان تخفیف', group: 'meta' },
  { key: 'show_stock', label: 'موجودی', group: 'meta' },
  { key: 'show_title', label: 'عنوان', group: 'content' },
  { key: 'show_lid', label: 'خلاصه', group: 'content' },
  { key: 'show_description', label: 'توضیحات', group: 'content' },
  { key: 'show_specs', label: 'مشخصات', group: 'content' },
  { key: 'show_rating', label: 'امتیاز', group: 'meta' },
  { key: 'show_price', label: 'قیمت', group: 'price' },
  { key: 'show_old_price', label: 'قیمت قبل تخفیف', group: 'price' },
  { key: 'show_shop', label: 'نام فروشگاه', group: 'meta' },
  { key: 'show_category', label: 'دسته', group: 'meta' },
  { key: 'show_qty', label: 'انتخاب تعداد', group: 'actions' },
  { key: 'show_add_to_cart', label: 'دکمه افزودن به سبد', group: 'actions' },
  { key: 'show_wishlist', label: 'علاقه‌مندی', group: 'actions' },
  { key: 'show_share', label: 'اشتراک‌گذاری', group: 'actions' },
  { key: 'share_bale', label: 'اشتراک در بله', group: 'share' },
  { key: 'share_eitaa', label: 'اشتراک در ایتا', group: 'share' },
  { key: 'share_rubika', label: 'اشتراک در روبیکا', group: 'share' },
  { key: 'share_soroush', label: 'اشتراک در سروش', group: 'share' },
  { key: 'show_similar', label: 'محصولات مشابه', group: 'extra' },
]

export const PRODUCT_SINGLE_COLOR_GROUPS = [
  { id: 'general', label: 'عمومی' },
  { id: 'price', label: 'ردیف قیمت' },
  { id: 'actions', label: 'سبد و اکشن‌ها' },
  { id: 'media', label: 'گالری' },
]

export const PRODUCT_SINGLE_COLOR_FIELDS = [
  { key: 'ink_color', label: 'متن اصلی', fallback: '#3f3f3f', group: 'general' },
  { key: 'muted_color', label: 'متن فرعی', fallback: '#a1a1a1', group: 'general' },
  { key: 'accent_color', label: 'اکسنت', fallback: '#B38C00', group: 'general' },
  {
    key: 'surface_bg',
    label: 'پس‌زمینه کلی',
    fallback: '#ffffff',
    allowTransparent: true,
    group: 'general',
  },
  {
    key: 'price_panel_bg',
    label: 'پس‌زمینه باکس قیمت',
    fallback: '#faf8f3',
    allowTransparent: true,
    group: 'price',
  },
  {
    key: 'price_panel_border',
    label: 'حاشیه باکس قیمت',
    fallback: '#e8dfc4',
    group: 'price',
  },
  { key: 'price_color', label: 'قیمت نهایی', fallback: '#B38C00', group: 'price' },
  { key: 'price_old_color', label: 'قیمت قبل تخفیف', fallback: '#a1a1a1', group: 'price' },
  { key: 'price_label_color', label: 'برچسب قیمت', fallback: '#a1a1a1', group: 'price' },
  { key: 'price_off_bg', label: 'پس‌زمینه نشان تخفیف', fallback: '#B38C00', group: 'price' },
  { key: 'price_off_text', label: 'متن نشان تخفیف', fallback: '#ffffff', group: 'price' },
  {
    key: 'price_total_bg',
    label: 'پس‌زمینه جمع تعداد',
    fallback: '#fff6e0',
    allowTransparent: true,
    group: 'price',
  },
  {
    key: 'price_total_border',
    label: 'حاشیه جمع تعداد',
    fallback: '#e5d4a0',
    group: 'price',
  },
  { key: 'btn_bg', label: 'پس‌زمینه دکمه سبد', fallback: '#B38C00', allowTransparent: true, group: 'actions' },
  { key: 'btn_text', label: 'متن دکمه سبد', fallback: '#ffffff', group: 'actions' },
  { key: 'btn_border', label: 'حاشیه دکمه سبد', fallback: '#B38C00', group: 'actions' },
  { key: 'wish_bg', label: 'پس‌زمینه علاقه', fallback: '#B38C00', allowTransparent: true, group: 'actions' },
  { key: 'wish_color', label: 'آیکن علاقه', fallback: '#ffffff', group: 'actions' },
  { key: 'share_bg', label: 'پس‌زمینه اشتراک', fallback: '#ffffff', allowTransparent: true, group: 'actions' },
  { key: 'share_color', label: 'آیکن اشتراک', fallback: '#B38C00', group: 'actions' },
  { key: 'gallery_bg', label: 'پس‌زمینه گالری', fallback: '#eeeeee', allowTransparent: true, group: 'media' },
  { key: 'thumb_border', label: 'حاشیه بندانگشتی فعال', fallback: '#B38C00', group: 'media' },
  {
    key: 'cover_overlay',
    label: 'پوشش کاور',
    fallback: 'rgba(20,16,8,0.45)',
    allowTransparent: true,
    group: 'media',
  },
]

export const DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS = {
  layout: 'split',
  skeleton_id: 'split',
  title_size: 'md',
  title_font_size: 28,
  section_max_width: 1140,
  content_gap: 20,
  section_radius: 0,
  section_radius_tl: 0,
  section_radius_tr: 0,
  section_radius_br: 0,
  section_radius_bl: 0,
  section_pad: 12,

  /* درصد ستون گالری در چیدمان دوستونه (جزئیات = ۱۰۰ − این مقدار) */
  gallery_col_pct: 45,
  gallery_max_h: 460,
  gallery_fit: 'cover',

  gallery_ratio: '1_1',
  gallery_radius: 16,
  gallery_bg: '#f3f1eb',
  image_hover: 'zoom',
  show_thumbs: true,
  thumbs_placement: 'outside',
  thumbs_position: 'bottom',
  thumbs_size: 56,
  thumbs_gap: 8,
  thumbs_radius: 10,
  thumb_border: '#B38C00',

  title_font: 'edameh',
  body_font: 'iran',
  price_font: 'iran_bold',
  btn_font: 'iran',
  content_font_size: 14,
  price_font_size: 24,
  btn_font_size: 12,
  btn_height: 40,
  btn_radius: 25,
  action_gap: 10,

  cta_style: 'solid',
  wish_style: 'solid',
  share_style: 'outline',

  show_on_mobile: true,
  show_on_desktop: true,
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
  show_qty: true,
  show_wishlist: true,
  show_share: true,
  share_bale: true,
  share_eitaa: true,
  share_rubika: true,
  share_soroush: false,
  show_similar: true,
  show_specs: true,

  detail_blocks_order: [...DEFAULT_PRODUCT_SINGLE_DETAIL_BLOCKS_ORDER],

  ink_color: '#3f3f3f',
  muted_color: '#a1a1a1',
  accent_color: '#B38C00',
  price_panel_bg: '#faf8f3',
  price_panel_border: '#e8dfc4',
  price_color: '#B38C00',
  price_old_color: '#a1a1a1',
  price_label_color: '#a1a1a1',
  price_off_bg: '#B38C00',
  price_off_text: '#ffffff',
  price_total_bg: '#fff6e0',
  price_total_border: '#e5d4a0',
  surface_bg: '#ffffff',
  gallery_bg: '#eeeeee',
  thumb_border: '#B38C00',
  btn_bg: '#B38C00',
  btn_text: '#ffffff',
  btn_border: '#B38C00',
  wish_bg: '#B38C00',
  wish_color: '#ffffff',
  share_bg: '#ffffff',
  share_color: '#B38C00',
  cover_overlay: 'rgba(20,16,8,0.45)',
}

export function productSingleCompositionMeta(id) {
  return (
    PRODUCT_SINGLE_COMPOSITIONS.find((c) => c.id === id) ||
    PRODUCT_SINGLE_COMPOSITIONS[0]
  )
}

export function productSingleLayoutFamily(layoutOrSettings) {
  const id =
    typeof layoutOrSettings === 'string'
      ? layoutOrSettings
      : layoutOrSettings?.layout ||
        layoutOrSettings?.skeleton_id ||
        DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS.layout
  return productSingleCompositionMeta(id).family || 'two_col'
}

export function productSingleIsTwoCol(family) {
  return family === 'two_col' || family === 'two_col_rev'
}

export function productSingleIsStack(family) {
  return family === 'stack' || family === 'stack_lead'
}

function skeletonPatchFor(id) {
  const base = {
    layout: id,
    skeleton_id: id,
    show_gallery: true,
    show_title: true,
    show_price: true,
    show_add_to_cart: true,
    show_wishlist: true,
    show_qty: true,
    gallery_fit: 'cover',
  }

  const patches = {
    split: {
      ...base,
      title_size: 'md',
      title_font_size: 28,
      gallery_col_pct: 45,
      gallery_max_h: 460,
      gallery_ratio: '1_1',
      gallery_radius: 16,
      show_thumbs: true,
      thumbs_placement: 'outside',
      thumbs_position: 'bottom',
      image_hover: 'zoom',
      show_badges: true,
      show_rating: true,
      show_breadcrumb: true,
      cta_style: 'solid',
      content_gap: 20,
      section_max_width: 1140,
      section_radius: 0,
      section_radius_tl: 0,
      section_radius_tr: 0,
      section_radius_br: 0,
      section_radius_bl: 0,
    },
    classic: {
      ...base,
      title_size: 'md',
      title_font_size: 28,
      gallery_col_pct: 50,
      gallery_max_h: 480,
      gallery_ratio: '1_1',
      gallery_radius: 14,
      show_thumbs: true,
      thumbs_placement: 'outside',
      thumbs_position: 'start',
      image_hover: 'lift',
      show_badges: true,
      show_rating: true,
      show_breadcrumb: true,
      cta_style: 'outline',
      content_gap: 16,
      section_max_width: 1140,
    },
    magazine: {
      ...base,
      title_size: 'lg',
      title_font_size: 34,
      title_font: 'edameh',
      gallery_col_pct: 100,
      gallery_max_h: 420,
      gallery_ratio: '16_9',
      gallery_radius: 16,
      show_lid: true,
      show_description: true,
      show_thumbs: true,
      thumbs_placement: 'inside',
      thumbs_position: 'bottom',
      image_hover: 'dim',
      show_breadcrumb: false,
      cta_style: 'soft',
      content_gap: 20,
      section_radius: 16,
      section_radius_tl: 16,
      section_radius_tr: 16,
      section_radius_br: 16,
      section_radius_bl: 16,
      section_max_width: 900,
    },
    cover: {
      ...base,
      title_size: 'xl',
      title_font_size: 40,
      title_font: 'edameh',
      gallery_col_pct: 100,
      gallery_max_h: 480,
      gallery_ratio: '16_9',
      gallery_radius: 18,
      show_thumbs: true,
      thumbs_placement: 'inside',
      thumbs_position: 'end',
      image_hover: 'glow',
      show_breadcrumb: false,
      show_back_link: true,
      show_lid: true,
      cta_style: 'solid',
      content_gap: 18,
      surface_bg: 'transparent',
      section_max_width: 1140,
    },
  }

  return patches[id] || patches.split
}

export const PRODUCT_SINGLE_SKELETONS = PRODUCT_SINGLE_COMPOSITIONS.map((c) => ({
  ...c,
  patch: skeletonPatchFor(c.id),
}))

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

function pickId(list, value, fallback) {
  const ids = new Set(list.map((c) => c.id))
  return ids.has(value) ? value : fallback
}

export function normalizeProductSinglePageSettings(raw = {}) {
  const d = DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS
  const s = { ...d, ...(raw || {}) }

  s.layout = pickId(PRODUCT_SINGLE_COMPOSITIONS, s.layout, d.layout)
  s.skeleton_id = pickId(PRODUCT_SINGLE_COMPOSITIONS, s.skeleton_id, s.layout)
  s.title_size = pickId(PRODUCT_SINGLE_TITLE_SIZES, s.title_size, d.title_size)
  const sizeMeta = PRODUCT_SINGLE_TITLE_SIZES.find((c) => c.id === s.title_size)
  s.title_font_size = num(s.title_font_size, sizeMeta?.px || d.title_font_size, 14, 72)
  s.section_max_width = num(s.section_max_width, d.section_max_width, 480, 1600)
  s.content_font_size = num(s.content_font_size, d.content_font_size, 11, 28)
  s.price_font_size = num(s.price_font_size, d.price_font_size, 12, 48)
  s.btn_font_size = num(s.btn_font_size, d.btn_font_size, 10, 22)
  s.btn_height = num(s.btn_height, d.btn_height, 28, 64)
  s.btn_radius = num(s.btn_radius, d.btn_radius, 0, 40)
  s.action_gap = num(s.action_gap, d.action_gap, 0, 32)
  s.gallery_radius = num(s.gallery_radius, d.gallery_radius, 0, 48)
  s.content_gap = num(s.content_gap, d.content_gap, 0, 48)
  s.section_radius = num(s.section_radius, d.section_radius, 0, 48)
  // سازگاری: اگر گوشه جدا نبود، از شعاع کلی ارث می‌برد
  const legacyRadius = s.section_radius
  const cornerOrLegacy = (key) =>
    raw && Object.prototype.hasOwnProperty.call(raw, key)
      ? num(raw[key], legacyRadius, 0, 48)
      : legacyRadius
  s.section_radius_tl = cornerOrLegacy('section_radius_tl')
  s.section_radius_tr = cornerOrLegacy('section_radius_tr')
  s.section_radius_br = cornerOrLegacy('section_radius_br')
  s.section_radius_bl = cornerOrLegacy('section_radius_bl')
  s.section_pad = num(s.section_pad, d.section_pad, 0, 48)
  s.thumbs_size = num(s.thumbs_size, d.thumbs_size, 36, 96)
  s.thumbs_gap = num(s.thumbs_gap, d.thumbs_gap, 0, 24)
  s.thumbs_radius = num(s.thumbs_radius, d.thumbs_radius, 0, 40)
  s.gallery_col_pct = num(s.gallery_col_pct, d.gallery_col_pct, 28, 72)
  s.gallery_max_h = num(s.gallery_max_h, d.gallery_max_h, 240, 720)

  s.gallery_ratio = pickId(PRODUCT_SINGLE_GALLERY_RATIOS, s.gallery_ratio, d.gallery_ratio)
  s.gallery_fit = pickId(PRODUCT_SINGLE_GALLERY_FITS, s.gallery_fit, d.gallery_fit)
  s.cta_style = pickId(PRODUCT_SINGLE_CTA_STYLES, s.cta_style, d.cta_style)
  s.wish_style = pickId(PRODUCT_SINGLE_CTA_STYLES, s.wish_style, d.wish_style)
  s.share_style = pickId(PRODUCT_SINGLE_CTA_STYLES, s.share_style, d.share_style)
  s.image_hover = pickId(PRODUCT_SINGLE_IMAGE_HOVERS, s.image_hover, d.image_hover)
  s.thumbs_placement = pickId(
    PRODUCT_SINGLE_THUMB_PLACEMENTS,
    s.thumbs_placement,
    d.thumbs_placement
  )
  s.thumbs_position = pickId(
    PRODUCT_SINGLE_THUMB_POSITIONS,
    s.thumbs_position,
    d.thumbs_position
  )
  s.title_font = pickId(PRODUCT_SINGLE_FONTS, s.title_font, d.title_font)
  s.body_font = pickId(PRODUCT_SINGLE_FONTS, s.body_font, d.body_font)
  s.price_font = pickId(PRODUCT_SINGLE_FONTS, s.price_font, d.price_font)
  s.btn_font = pickId(PRODUCT_SINGLE_FONTS, s.btn_font, d.btn_font)

  PRODUCT_SINGLE_BLOCK_TOGGLES.forEach(({ key }) => {
    s[key] = bool(raw, key, d)
  })
  s.show_on_mobile = bool(raw, 'show_on_mobile', d)
  s.show_on_desktop = bool(raw, 'show_on_desktop', d)
  s.detail_blocks_order = normalizeProductSingleDetailBlocksOrder(
    raw?.detail_blocks_order ?? s.detail_blocks_order
  )

  PRODUCT_SINGLE_COLOR_FIELDS.forEach(({ key, fallback, allowTransparent }) => {
    const hasRaw = raw && Object.prototype.hasOwnProperty.call(raw, key)
    const rawStr = String(raw?.[key] ?? '').trim().toLowerCase()
    const next = colorStr(s[key])
    if (next) s[key] = next
    else if (
      allowTransparent &&
      hasRaw &&
      (rawStr === 'transparent' || rawStr === 'none' || rawStr === '')
    ) {
      // خالی / شفاف = بدون بک‌گراند
      s[key] = 'transparent'
    } else s[key] = fallback || d[key]
  })

  return s
}

export function productSingleCssVars(settings) {
  const s = normalizeProductSinglePageSettings(settings)
  const ratioMap = {
    '1_1': '1 / 1',
    '5_4': '5 / 4',
    '4_5': '4 / 5',
    '3_4': '3 / 4',
    '3_2': '3 / 2',
    '2_3': '2 / 3',
    '16_9': '16 / 9',
  }
  const gal = s.gallery_col_pct
  const det = Math.max(28, 100 - gal)
  return {
    '--pdp-ink': s.ink_color,
    '--pdp-muted': s.muted_color,
    '--pdp-accent': s.accent_color,
    '--pdp-price': s.price_color,
    '--pdp-price-old': s.price_old_color,
    '--pdp-price-label': s.price_label_color,
    '--pdp-price-panel-bg':
      !s.price_panel_bg || s.price_panel_bg === 'transparent'
        ? 'transparent'
        : s.price_panel_bg,
    '--pdp-price-panel-border': s.price_panel_border,
    '--pdp-price-off-bg': s.price_off_bg,
    '--pdp-price-off-text': s.price_off_text,
    '--pdp-price-total-bg':
      !s.price_total_bg || s.price_total_bg === 'transparent'
        ? 'transparent'
        : s.price_total_bg,
    '--pdp-price-total-border': s.price_total_border,
    '--pdp-surface':
      !s.surface_bg || s.surface_bg === 'transparent' ? 'transparent' : s.surface_bg,
    '--pdp-gallery-bg': s.gallery_bg,
    '--pdp-btn-bg': s.btn_bg,
    '--pdp-btn-text': s.btn_text,
    '--pdp-btn-border': s.btn_border,
    '--pdp-wish-bg': s.wish_bg,
    '--pdp-wish-color': s.wish_color,
    '--pdp-share-bg': s.share_bg,
    '--pdp-share-color': s.share_color,
    '--pdp-thumb-border': s.thumb_border,
    '--pdp-cover-overlay': s.cover_overlay,
    '--pdp-title': `${s.title_font_size}px`,
    '--pdp-body': `${s.content_font_size}px`,
    '--pdp-price-size': `${s.price_font_size}px`,
    '--pdp-btn-size': `${s.btn_font_size}px`,
    '--pdp-btn-h': `${s.btn_height}px`,
    '--pdp-btn-radius': `${s.btn_radius}px`,
    '--pdp-action-gap': `${s.action_gap}px`,
    '--pdp-max': `${s.section_max_width}px`,
    '--pdp-gap': `${s.content_gap}px`,
    '--pdp-section-radius': `${s.section_radius}px`,
    '--pdp-radius-tl': `${s.section_radius_tl}px`,
    '--pdp-radius-tr': `${s.section_radius_tr}px`,
    '--pdp-radius-br': `${s.section_radius_br}px`,
    '--pdp-radius-bl': `${s.section_radius_bl}px`,
    '--pdp-section-pad': `${s.section_pad}px`,
    '--pdp-gallery-radius': `${s.gallery_radius}px`,
    '--pdp-gallery-ratio': ratioMap[s.gallery_ratio] || '1 / 1',
    '--pdp-gallery-max-h': `${s.gallery_max_h}px`,
    '--pdp-gallery-fit': s.gallery_fit === 'contain' ? 'contain' : 'cover',
    '--pdp-gallery-pct': `${gal}%`,
    '--pdp-detail-pct': `${det}%`,
    '--pdp-thumb-size': `${s.thumbs_size}px`,
    '--pdp-thumb-gap': `${s.thumbs_gap}px`,
    '--pdp-thumb-radius': `${s.thumbs_radius}px`,
    '--pdp-title-font': shopFontCss(s.title_font),
    '--pdp-body-font': shopFontCss(s.body_font),
    '--pdp-price-font': shopFontCss(s.price_font),
    '--pdp-btn-font': shopFontCss(s.btn_font),
  }
}

export function applyProductSingleComposition(current, compositionId) {
  const base = normalizeProductSinglePageSettings(current)
  const patch = skeletonPatchFor(compositionId)
  return normalizeProductSinglePageSettings({ ...base, ...patch })
}

export function findProductArticleWidgetSettings(layout) {
  const rows = layout?.rows || []
  for (const row of rows) {
    for (const col of row.columns || []) {
      for (const w of col.widgets || []) {
        if (w?.type === 'product_article') {
          return normalizeProductSinglePageSettings(w.settings || {})
        }
      }
    }
  }
  return null
}
