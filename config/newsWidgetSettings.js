// config/newsWidgetSettings.js — تنظیمات ویجت آخرین اخبار

export const NEWS_FONTS = [
  { id: 'iran', label: 'ایران', css: "var(--font-iran, 'iran', Tahoma, sans-serif)" },
  { id: 'iran_bold', label: 'ایران بولد', css: "var(--font-iran-bold, 'iran_bold', Tahoma, sans-serif)" },
  { id: 'edameh', label: 'ادامه', css: "var(--font-edameh, Tahoma, sans-serif)" },
  { id: 'tahoma', label: 'تاهوما', css: 'Tahoma, Arial, sans-serif' },
]

export const NEWS_BORDER_STYLES = [
  { id: 'none', label: 'بدون' },
  { id: 'solid', label: 'خطی' },
  { id: 'dashed', label: 'خط‌چین' },
  { id: 'dotted', label: 'نقطه‌ای' },
]

export const NEWS_IMAGE_SHAPES = [
  { id: 'circle', label: 'دایره' },
  { id: 'rounded', label: 'مربع گرد' },
]

/** وقتی تصویر خاموش است، کنار متن چه چیزی باشد */
export const NEWS_TEXT_MARKERS = [
  { id: 'none', label: 'هیچ‌کدام' },
  { id: 'circle_filled', label: 'نقطه توپر' },
  { id: 'circle_outline', label: 'نقطه توخالی' },
  { id: 'square_filled', label: 'مربع توپر' },
  { id: 'square_outline', label: 'مربع توخالی' },
]

export const NEWS_READ_MORE_ALIGNS = [
  { id: 'right', label: 'راست' },
  { id: 'center', label: 'وسط' },
  { id: 'left', label: 'چپ' },
]

export const NEWS_STATS_LAYOUTS = [
  { id: 'stack', label: 'زیر هم' },
  { id: 'row', label: 'کنار هم' },
]

export const NEWS_RECYCLER_TEXT_Y = [
  { id: 'top', label: 'بالا' },
  { id: 'center', label: 'وسط' },
  { id: 'bottom', label: 'پایین' },
]

export const NEWS_RECYCLER_TEXT_X = [
  { id: 'full', label: 'تمام‌عرض' },
  { id: 'right', label: 'راست' },
  { id: 'center', label: 'وسط' },
  { id: 'left', label: 'چپ' },
]

/** نسبت تصویر کارت ریسایکلر — free = ارتفاع ثابت دستی */
export const NEWS_RECYCLER_ASPECTS = [
  { id: 'free', label: 'آزاد (ارتفاع)', css: 'auto' },
  { id: '16_9', label: '۱۶:۹', css: '16 / 9' },
  { id: '4_3', label: '۴:۳', css: '4 / 3' },
  { id: '3_2', label: '۳:۲', css: '3 / 2' },
  { id: '1_1', label: '۱:۱', css: '1 / 1' },
  { id: '21_9', label: '۲۱:۹', css: '21 / 9' },
  { id: '9_16', label: '۹:۱۶', css: '9 / 16' },
]

/** موقعیت نسبت به کارت مادر */
/* راست/چپ = سمت فیزیکی صفحه (نه start/end منطقی) — مناسب UI فارسی */
export const NEWS_READ_MORE_PLACES = [
  { id: 'flow', label: 'زیر متن' },
  { id: 'bottom_right', label: 'گوشه پایین راست' },
  { id: 'bottom_left', label: 'گوشه پایین چپ' },
  { id: 'bottom_center', label: 'پایین وسط' },
  { id: 'top_right', label: 'گوشه بالا راست' },
  { id: 'top_left', label: 'گوشه بالا چپ' },
  { id: 'top_center', label: 'بالا وسط' },
]

/* ترتیب شبکه ۲×۲ با dir=rtl: راست‌بالا، چپ‌بالا / راست‌پایین، چپ‌پایین */
export const NEWS_READ_MORE_RADIUS_FIELDS = [
  { key: 'read_more_radius_top_right', label: '↗ راست بالا' },
  { key: 'read_more_radius_top_left', label: '↖ چپ بالا' },
  { key: 'read_more_radius_bottom_right', label: '↘ راست پایین' },
  { key: 'read_more_radius_bottom_left', label: '↙ چپ پایین' },
]

export const DEFAULT_NEWS_WIDGET_SETTINGS = {
  show_on_mobile: true,
  count: 5,
  /** چند خبر اول را رد کند (۰ = از اول) */
  offset: 0,
  /** اسلاگ دسته — فقط برای news_by_category */
  category_slug: '',
  font_size: 14,
  font_bold: false,
  font_family: 'iran',
  show_image: true,
  image_size: 44,
  image_shape: 'rounded',
  image_border_width: 0,
  image_border_color: '',
  image_shadow: false,
  text_marker: 'circle_filled',
  text_marker_size: 8,
  text_marker_color: '',
  /** ریسایکلر: پس‌زمینه لایه متن روی تصویر (شفاف = بدون رنگ) */
  recycler_overlay_bg: 'transparent',
  /** گرادیان تیره روی تصویر برای خوانایی متن */
  recycler_show_gradient: true,
  /** سایه زیر کارت ریسایکلر */
  recycler_card_shadow: false,
  /** بردر هر کارت ریسایکلر */
  recycler_card_border_width: 1,
  recycler_card_border_color: 'rgba(255, 255, 255, 0.12)',
  recycler_card_border_hover: 'rgba(251, 195, 0, 0.35)',
  /** ریسایکلر: رنگ متن روی تصویر */
  recycler_text_color: '#ffffff',
  recycler_height: 280,
  /** free | 16_9 | 4_3 | … — پیش‌فرض آزاد تا ارتفاع قدیمی‌ها حفظ شود */
  recycler_aspect: 'free',
  recycler_image_crop: true,
  recycler_text_y: 'bottom',
  recycler_text_x: 'full',
  /** چند کارت کنار هم در دسکتاپ */
  recycler_visible_desktop: 4,
  recycler_show_arrows: true,
  recycler_autoplay: false,
  recycler_autoplay_ms: 4000,
  recycler_pause_on_hover: true,
  /** اسکرول افقی با کلیک‌وکشیدن موس */
  recycler_drag_scroll: true,
  /** سکشن تمام‌عرض؛ محتوا داخل container */
  recycler_section_full: true,
  /** گرادیان پس‌زمینه سکشن */
  recycler_section_from: '#071a2e',
  recycler_section_to: '#0e3d66',
  recycler_section_angle: 180,
  show_likes: true,
  show_views: true,
  like_color: '#e74c3c',
  views_color: '#8b939e',
  share_color: '#8b939e',
  stats_layout: 'stack',
  stats_icon_size: 14,
  stats_font_size: 10,
  stats_bg: 'transparent',
  stats_radius: 999,
  stats_gap: 6,
  stats_padding_x: 0,
  stats_padding_y: 0,
  stats_margin_x: 0,
  stats_margin_y: 0,
  show_author: false,
  show_lead: false,
  show_read_more: true,
  read_more_text: 'ادامه مطلب…',
  read_more_color: '',
  read_more_hover_color: '',
  read_more_bg: '',
  read_more_hover_bg: '',
  read_more_size: 12,
  read_more_bold: true,
  read_more_as_button: false,
  read_more_align: 'right',
  read_more_place: 'flow',
  read_more_inset: 8,
  read_more_on_hover: false,
  read_more_radius_top_left: 8,
  read_more_radius_top_right: 8,
  read_more_radius_bottom_right: 8,
  read_more_radius_bottom_left: 8,
  show_share: false,
  title_max_chars: 48,
  title_wrap: false,
  item_border: true,
  border_style: 'solid',
  border_width: 1,
  border_color: '',
  hover_bg: '',
  hover_text: '',
  hover_show_lead: true,
  hover_lead_image: true,
  card_bg: '',
  card_radius_top_left: 0,
  card_radius_top_right: 0,
  card_radius_bottom_right: 0,
  card_radius_bottom_left: 0,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
}

/**
 * تنظیمات کلی/داده‌ای ویجت‌های لیست اخبار
 * (بدون رنگ و ظاهر — برای داشبورد کاربر)
 */
export const NEWS_LIST_DASHBOARD_KEYS = [
  'category_slug',
  'count',
  'offset',
  'show_on_mobile',
  'show_image',
  'show_likes',
  'show_views',
  'show_share',
  'show_author',
  'show_lead',
  'show_read_more',
  'read_more_text',
  'title_max_chars',
  'title_wrap',
]

/** @deprecated استفاده از NEWS_LIST_DASHBOARD_KEYS */
export const FEATURED_LIST_DASHBOARD_KEYS = NEWS_LIST_DASHBOARD_KEYS

export function pickNewsListDashboardSettings(raw = {}) {
  const base = normalizeNewsWidgetSettings(raw || {})
  const out = {}
  NEWS_LIST_DASHBOARD_KEYS.forEach((k) => {
    out[k] = base[k]
  })
  return out
}

export const pickFeaturedListDashboardSettings = pickNewsListDashboardSettings

/**
 * تنظیمات کامل داشبورد ریسایکلرویوی اخبار
 * (داده + ظاهر + رنگ‌ها + اسکرول)
 */
export const NEWS_RECYCLER_DASHBOARD_KEYS = [
  ...NEWS_LIST_DASHBOARD_KEYS,
  'font_size',
  'font_bold',
  'font_family',
  'like_color',
  'views_color',
  'share_color',
  'stats_layout',
  'stats_icon_size',
  'stats_font_size',
  'stats_bg',
  'stats_radius',
  'stats_gap',
  'stats_padding_x',
  'stats_padding_y',
  'stats_margin_x',
  'stats_margin_y',
  'read_more_color',
  'read_more_hover_color',
  'read_more_bg',
  'read_more_hover_bg',
  'read_more_size',
  'read_more_bold',
  'padding_top',
  'padding_bottom',
  'recycler_overlay_bg',
  'recycler_show_gradient',
  'recycler_card_shadow',
  'recycler_card_border_width',
  'recycler_card_border_color',
  'recycler_card_border_hover',
  'recycler_text_color',
  'recycler_height',
  'recycler_aspect',
  'recycler_image_crop',
  'recycler_text_y',
  'recycler_text_x',
  'recycler_visible_desktop',
  'recycler_show_arrows',
  'recycler_autoplay',
  'recycler_autoplay_ms',
  'recycler_pause_on_hover',
  'recycler_drag_scroll',
  'recycler_section_full',
  'recycler_section_from',
  'recycler_section_to',
  'recycler_section_angle',
]

export function pickNewsRecyclerDashboardSettings(raw = {}) {
  const base = normalizeNewsWidgetSettings(raw || {})
  const out = {}
  NEWS_RECYCLER_DASHBOARD_KEYS.forEach((k) => {
    out[k] = base[k]
  })
  return out
}

/** پالت‌های آماده ترکیب رنگی ریسایکلر */
export const NEWS_RECYCLER_COLOR_PRESETS = [
  {
    id: 'navy_gold',
    label: 'سرمه‌ای طلایی',
    patch: {
      recycler_section_from: '#071a2e',
      recycler_section_to: '#0e3d66',
      recycler_section_angle: 180,
      recycler_text_color: '#ffffff',
      recycler_overlay_bg: 'transparent',
      recycler_card_border_color: 'rgba(255, 255, 255, 0.12)',
      recycler_card_border_hover: 'rgba(251, 195, 0, 0.45)',
      like_color: '#fbc300',
      views_color: '#c8d6e5',
      share_color: '#c8d6e5',
    },
  },
  {
    id: 'forest',
    label: 'سبز جنگلی',
    patch: {
      recycler_section_from: '#0d2818',
      recycler_section_to: '#1b5e20',
      recycler_section_angle: 145,
      recycler_text_color: '#f1f8e9',
      recycler_overlay_bg: 'transparent',
      recycler_card_border_color: 'rgba(200, 230, 201, 0.18)',
      recycler_card_border_hover: 'rgba(129, 199, 132, 0.55)',
      like_color: '#81c784',
      views_color: '#a5d6a7',
      share_color: '#a5d6a7',
    },
  },
  {
    id: 'sunset',
    label: 'غروب گرم',
    patch: {
      recycler_section_from: '#3e1f0a',
      recycler_section_to: '#b71c1c',
      recycler_section_angle: 120,
      recycler_text_color: '#fff8e1',
      recycler_overlay_bg: 'rgba(0,0,0,0.25)',
      recycler_card_border_color: 'rgba(255, 183, 77, 0.25)',
      recycler_card_border_hover: 'rgba(255, 152, 0, 0.6)',
      like_color: '#ff8a65',
      views_color: '#ffe0b2',
      share_color: '#ffe0b2',
    },
  },
  {
    id: 'violet',
    label: 'بنفش شب',
    patch: {
      recycler_section_from: '#1a1033',
      recycler_section_to: '#4a148c',
      recycler_section_angle: 160,
      recycler_text_color: '#f3e5f5',
      recycler_overlay_bg: 'transparent',
      recycler_card_border_color: 'rgba(225, 190, 231, 0.2)',
      recycler_card_border_hover: 'rgba(186, 104, 200, 0.55)',
      like_color: '#ce93d8',
      views_color: '#e1bee7',
      share_color: '#e1bee7',
    },
  },
  {
    id: 'slate',
    label: 'خاکستری مدرن',
    patch: {
      recycler_section_from: '#212121',
      recycler_section_to: '#455a64',
      recycler_section_angle: 180,
      recycler_text_color: '#fafafa',
      recycler_overlay_bg: 'transparent',
      recycler_card_border_color: 'rgba(255, 255, 255, 0.14)',
      recycler_card_border_hover: 'rgba(144, 202, 249, 0.5)',
      like_color: '#90caf9',
      views_color: '#b0bec5',
      share_color: '#b0bec5',
    },
  },
  {
    id: 'teal',
    label: 'فیروزه‌ای',
    patch: {
      recycler_section_from: '#004d40',
      recycler_section_to: '#00897b',
      recycler_section_angle: 135,
      recycler_text_color: '#e0f2f1',
      recycler_overlay_bg: 'transparent',
      recycler_card_border_color: 'rgba(178, 223, 219, 0.22)',
      recycler_card_border_hover: 'rgba(77, 208, 225, 0.55)',
      like_color: '#4dd0e1',
      views_color: '#b2dfdb',
      share_color: '#b2dfdb',
    },
  },
]

/** تعداد کارت در هر ردیف (۱ تا ۴) */
export const NEWS_MAGAZINE_COLUMNS = [
  { id: 1, label: '۱ کارت' },
  { id: 2, label: '۲ کارت' },
  { id: 3, label: '۳ کارت' },
  { id: 4, label: '۴ کارت' },
]

/** سبک کارت مجله */
export const NEWS_MAGAZINE_CARD_STYLES = [
  {
    id: 'classic',
    label: 'کلاسیک',
    hint: 'تصویر بالا، عنوان و لید زیر کارت',
  },
  {
    id: 'overlay',
    label: 'روی تصویر',
    hint: 'عنوان روی عکس؛ با هاور لید نرم ظاهر می‌شود',
  },
  {
    id: 'cover',
    label: 'کاور روشن',
    hint: 'کارت تمام‌تصویر با گرادیان و متای پایین',
  },
  {
    id: 'split',
    label: 'دو ستونه',
    hint: 'تصویر کنار متن — ظاهر مجله‌ای افقی',
  },
  {
    id: 'editorial',
    label: 'سردبیری',
    hint: 'نوار تاکید + عنوان درشت و تصویر باریک',
  },
  {
    id: 'glass',
    label: 'شیشه‌ای',
    hint: 'متن روی شیشه مات روی تصویر',
  },
  {
    id: 'framed',
    label: 'قاب عکس',
    hint: 'قاب پولاروید با حاشیه سفید و کپشن',
  },
]

/** گوشه‌های کارت مجله */
export const NEWS_MAGAZINE_RADIUS_FIELDS = [
  { key: 'card_radius_top_right', label: 'بالا راست' },
  { key: 'card_radius_top_left', label: 'بالا چپ' },
  { key: 'card_radius_bottom_left', label: 'پایین چپ' },
  { key: 'card_radius_bottom_right', label: 'پایین راست' },
]

/** نسبت ابعاد تصویر کارت مجله */
export const NEWS_MAGAZINE_ASPECTS = [
  { id: '16_9', label: '۱۶:۹', css: '16 / 9' },
  { id: '4_3', label: '۴:۳', css: '4 / 3' },
  { id: '3_2', label: '۳:۲', css: '3 / 2' },
  { id: '1_1', label: '۱:۱', css: '1 / 1' },
  { id: '5_4', label: '۵:۴', css: '5 / 4' },
  { id: '3_4', label: '۳:۴', css: '3 / 4' },
  { id: '2_3', label: '۲:۳', css: '2 / 3' },
  { id: '21_9', label: '۲۱:۹', css: '21 / 9' },
  { id: '9_16', label: '۹:۱۶', css: '9 / 16' },
]

/** شکل صفحه‌بندی */
export const NEWS_MAGAZINE_PAGINATION_STYLES = [
  { id: 'classic', label: 'کلاسیک', hint: 'دکمه‌های مربعی شماره‌دار' },
  { id: 'pills', label: 'کپسولی', hint: 'دکمه‌های گرد و نرم' },
  { id: 'minimal', label: 'مینیمال', hint: 'قبلی / بعدی + شماره صفحه' },
  { id: 'bar', label: 'نوار', hint: 'خط زیرین و تاکید گسترده‌تر' },
]

/** جایگاه صفحه‌بندی */
export const NEWS_MAGAZINE_PAGINATION_POSITIONS = [
  { id: 'bottom', label: 'پایین' },
  { id: 'top', label: 'بالا' },
  { id: 'both', label: 'بالا و پایین' },
  { id: 'after_filters', label: 'زیر فیلترها' },
]

/** تنظیمات ویجت مجله‌ای «لیست اخبار» (شبیه components/News) */
export const DEFAULT_NEWS_MAGAZINE_SETTINGS = {
  show_on_mobile: true,
  title: 'مجله',
  show_title: true,
  show_search: true,
  show_categories: true,
  show_stats_bar: false,
  show_total_count: false,
  show_page_info: false,
  show_pagination: true,
  per_page: 12,
  category_slug: '',
  columns: 3,
  card_style: 'classic',
  pagination_style: 'classic',
  pagination_position: 'bottom',
  grid_min: 300,
  card_aspect: '16_9',
  card_radius: 16,
  card_radius_top_left: 16,
  card_radius_top_right: 16,
  card_radius_bottom_left: 16,
  card_radius_bottom_right: 16,
  card_border: true,
  card_border_width: 1,
  card_border_color: 'rgba(90, 60, 20, 0.12)',
  card_shadow: true,
  card_shadow_x: 0,
  card_shadow_y: 6,
  card_shadow_blur: 18,
  card_shadow_spread: 0,
  card_shadow_opacity: 8,
  section_max_width: 1200,
  show_card_image: true,
  show_card_title: true,
  show_card_excerpt: true,
  show_card_date: true,
  show_card_source: true,
  show_read_more: true,
  read_more_text: 'ادامه مطلب…',
  read_more_place: 'flow',
  read_more_align: 'right',
  read_more_as_button: false,
  read_more_color: '#c27800',
  read_more_bg: '',
  show_likes: false,
  show_share: false,
  share_bale: true,
  share_eitaa: true,
  share_rubika: true,
  share_soroush: true,
  share_color: '#8b939e',
  like_color: '#e25555',
  ink_color: '#2a241c',
  muted_color: '#6f675c',
  title_color: '',
  excerpt_color: '',
  date_color: '',
  surface_bg: '#ffffff',
  accent_color: '#c27800',
  accent_soft: '#fff3c4',
}

export const NEWS_MAGAZINE_DASHBOARD_KEYS = Object.keys(
  DEFAULT_NEWS_MAGAZINE_SETTINGS
)

export const NEWS_MAGAZINE_COLOR_PRESETS = [
  {
    id: 'sellniroo_gold',
    label: 'طلایی سلنیرو',
    patch: {
      ink_color: '#2a241c',
      muted_color: '#6f675c',
      surface_bg: '#ffffff',
      accent_color: '#c27800',
      accent_soft: '#fff3c4',
    },
  },
  {
    id: 'navy_mag',
    label: 'سرمه‌ای',
    patch: {
      ink_color: '#0d2137',
      muted_color: '#5a6f82',
      surface_bg: '#ffffff',
      accent_color: '#0e3d66',
      accent_soft: '#e3f2fd',
    },
  },
  {
    id: 'forest_mag',
    label: 'سبز',
    patch: {
      ink_color: '#1b3a1e',
      muted_color: '#5d735f',
      surface_bg: '#ffffff',
      accent_color: '#2e7d32',
      accent_soft: '#e8f5e9',
    },
  },
  {
    id: 'slate_mag',
    label: 'خاکستری',
    patch: {
      ink_color: '#263238',
      muted_color: '#78909c',
      surface_bg: '#ffffff',
      accent_color: '#455a64',
      accent_soft: '#eceff1',
    },
  },
  {
    id: 'rose_mag',
    label: 'رز',
    patch: {
      ink_color: '#4a1528',
      muted_color: '#8d6e7a',
      surface_bg: '#ffffff',
      accent_color: '#ad1457',
      accent_soft: '#fce4ec',
    },
  },
  {
    id: 'teal_mag',
    label: 'فیروزه‌ای',
    patch: {
      ink_color: '#004d40',
      muted_color: '#5f7d77',
      surface_bg: '#ffffff',
      accent_color: '#00897b',
      accent_soft: '#e0f2f1',
    },
  },
]

const MAG_CARD_STYLE_IDS = new Set(
  NEWS_MAGAZINE_CARD_STYLES.map((x) => x.id)
)
const MAG_PAG_STYLE_IDS = new Set(
  NEWS_MAGAZINE_PAGINATION_STYLES.map((x) => x.id)
)
const MAG_PAG_POS_IDS = new Set(
  NEWS_MAGAZINE_PAGINATION_POSITIONS.map((x) => x.id)
)

export function normalizeNewsMagazineSettings(raw = {}) {
  const d = DEFAULT_NEWS_MAGAZINE_SETTINGS
  const rawObj = raw || {}
  const s = { ...d, ...rawObj }
  s.show_on_mobile = rawObj.show_on_mobile === undefined ? true : !!rawObj.show_on_mobile
  s.title = String(s.title ?? d.title).trim() || d.title
  s.show_title = rawObj.show_title === undefined ? true : !!rawObj.show_title
  s.show_search = rawObj.show_search === undefined ? true : !!rawObj.show_search
  s.show_categories =
    rawObj.show_categories === undefined ? true : !!rawObj.show_categories
  s.show_stats_bar = !!s.show_stats_bar
  s.show_total_count = !!s.show_total_count
  s.show_page_info = !!s.show_page_info
  s.show_pagination =
    rawObj.show_pagination === undefined ? true : !!rawObj.show_pagination
  s.per_page = Math.max(4, Math.min(24, pxNum(s.per_page, d.per_page, 24)))
  s.category_slug = String(s.category_slug || '').trim()
  s.columns = Math.max(1, Math.min(4, Math.round(pxNum(s.columns, d.columns, 4))))
  s.card_style = MAG_CARD_STYLE_IDS.has(s.card_style) ? s.card_style : d.card_style
  s.pagination_style = MAG_PAG_STYLE_IDS.has(s.pagination_style)
    ? s.pagination_style
    : d.pagination_style
  s.pagination_position = MAG_PAG_POS_IDS.has(s.pagination_position)
    ? s.pagination_position
    : d.pagination_position
  s.grid_min = Math.max(220, Math.min(420, pxNum(s.grid_min, d.grid_min, 420)))
  if (!NEWS_MAGAZINE_ASPECTS.some((o) => o.id === s.card_aspect)) {
    s.card_aspect = d.card_aspect
  }
  s.card_radius = Math.max(0, Math.min(48, pxNum(s.card_radius, d.card_radius, 48)))
  ;[
    'card_radius_top_left',
    'card_radius_top_right',
    'card_radius_bottom_left',
    'card_radius_bottom_right',
  ].forEach((k) => {
    if (rawObj[k] === undefined && rawObj.card_radius !== undefined) {
      s[k] = s.card_radius
    } else {
      s[k] = Math.max(0, Math.min(64, pxNum(s[k], d[k], 64)))
    }
  })
  s.card_border = rawObj.card_border === undefined ? true : !!rawObj.card_border
  s.card_border_width = Math.min(12, pxNum(s.card_border_width, d.card_border_width, 12))
  s.card_border_color =
    colorStr(s.card_border_color) || d.card_border_color
  s.card_shadow = rawObj.card_shadow === undefined ? true : !!rawObj.card_shadow
  s.card_shadow_x = Math.max(-40, Math.min(40, Number(s.card_shadow_x) || 0))
  s.card_shadow_y = Math.max(-40, Math.min(40, Number(s.card_shadow_y) || 0))
  s.card_shadow_blur = Math.max(0, Math.min(80, pxNum(s.card_shadow_blur, 18, 80)))
  s.card_shadow_spread = Math.max(-20, Math.min(40, Number(s.card_shadow_spread) || 0))
  s.card_shadow_opacity = Math.max(
    0,
    Math.min(100, pxNum(s.card_shadow_opacity, 8, 100))
  )
  s.section_max_width = Math.max(
    720,
    Math.min(1400, pxNum(s.section_max_width, d.section_max_width, 1400))
  )
  s.show_card_image =
    rawObj.show_card_image === undefined ? true : !!rawObj.show_card_image
  s.show_card_title =
    rawObj.show_card_title === undefined ? true : !!rawObj.show_card_title
  s.show_card_excerpt =
    rawObj.show_card_excerpt === undefined ? true : !!rawObj.show_card_excerpt
  s.show_card_date =
    rawObj.show_card_date === undefined ? true : !!rawObj.show_card_date
  s.show_card_source =
    rawObj.show_card_source === undefined ? true : !!rawObj.show_card_source
  s.show_read_more =
    rawObj.show_read_more === undefined ? true : !!rawObj.show_read_more
  s.read_more_text =
    String(s.read_more_text ?? '').trim() || d.read_more_text
  if (!NEWS_READ_MORE_PLACES.some((p) => p.id === s.read_more_place)) {
    s.read_more_place = d.read_more_place
  }
  if (!NEWS_READ_MORE_ALIGNS.some((a) => a.id === s.read_more_align)) {
    s.read_more_align = d.read_more_align
  }
  s.read_more_as_button = !!s.read_more_as_button
  s.read_more_color = colorStr(s.read_more_color) || d.read_more_color
  s.read_more_bg = colorStr(s.read_more_bg)
  s.show_likes = !!s.show_likes
  s.show_share = !!s.show_share
  s.share_bale = rawObj.share_bale === undefined ? true : !!rawObj.share_bale
  s.share_eitaa = rawObj.share_eitaa === undefined ? true : !!rawObj.share_eitaa
  s.share_rubika =
    rawObj.share_rubika === undefined ? true : !!rawObj.share_rubika
  s.share_soroush =
    rawObj.share_soroush === undefined ? true : !!rawObj.share_soroush
  s.share_color = colorStr(s.share_color) || d.share_color
  s.like_color = colorStr(s.like_color) || d.like_color
  s.ink_color = colorStr(s.ink_color) || d.ink_color
  s.muted_color = colorStr(s.muted_color) || d.muted_color
  s.title_color = colorStr(s.title_color)
  s.excerpt_color = colorStr(s.excerpt_color)
  s.date_color = colorStr(s.date_color)
  s.surface_bg = colorStr(s.surface_bg) || d.surface_bg
  s.accent_color = colorStr(s.accent_color) || d.accent_color
  s.accent_soft = colorStr(s.accent_soft) || d.accent_soft
  return s
}

/** CSS variables برای کارت مجله */
export function magazineCardCssVars(s) {
  const op = Math.max(0, Math.min(1, (s.card_shadow_opacity || 0) / 100))
  const shadow = s.card_shadow
    ? `${s.card_shadow_x}px ${s.card_shadow_y}px ${s.card_shadow_blur}px ${s.card_shadow_spread}px rgba(40, 28, 10, ${op})`
    : 'none'
  const bw = s.card_border ? `${s.card_border_width}px` : '0'
  const aspect =
    NEWS_MAGAZINE_ASPECTS.find((o) => o.id === s.card_aspect) ||
    NEWS_MAGAZINE_ASPECTS[0]
  return {
    '--nlm-radius-tl': `${s.card_radius_top_left}px`,
    '--nlm-radius-tr': `${s.card_radius_top_right}px`,
    '--nlm-radius-bl': `${s.card_radius_bottom_left}px`,
    '--nlm-radius-br': `${s.card_radius_bottom_right}px`,
    '--nlm-radius': `${s.card_radius}px`,
    '--nlm-border-w': bw,
    '--nlm-border-c': s.card_border_color || 'transparent',
    '--nlm-shadow': shadow,
    '--nlm-aspect': aspect.css,
    '--nlm-title-c': s.title_color || s.ink_color,
    '--nlm-excerpt-c': s.excerpt_color || s.muted_color,
    '--nlm-date-c': s.date_color || s.muted_color,
    '--nlm-rm-c': s.read_more_color || s.accent_color,
    '--nlm-rm-bg': s.read_more_bg || 'transparent',
    '--nlm-share-c': s.share_color,
    '--nlm-like-c': s.like_color,
    '--nlm-rm-align':
      s.read_more_align === 'left'
        ? 'flex-start'
        : s.read_more_align === 'center'
          ? 'center'
          : 'flex-end',
  }
}

export function pickNewsMagazineDashboardSettings(raw = {}) {
  const base = normalizeNewsMagazineSettings(raw || {})
  const out = {}
  NEWS_MAGAZINE_DASHBOARD_KEYS.forEach((k) => {
    out[k] = base[k]
  })
  return out
}

export function isNewsMagazineWidgetType(type) {
  return type === 'news_list'
}

/** ویجت‌های لیستی فشرده با پنل تنظیمات اخبار */
export const NEWS_LIST_WIDGET_TYPES = [
  'latest_news',
  'news_by_category',
  'featured_news',
  'latest_news_recycler',
]

/** ویجت‌های خبری با پنل تنظیمات (لیست فشرده + مجله) */
export const NEWS_WIDGET_TYPES = new Set([
  ...NEWS_LIST_WIDGET_TYPES,
  'news_list',
])

/**
 * منبع داده و چیدمان بر اساس نوع ویجت
 * @returns {{ source: 'latest'|'featured'|'category', layout: 'list'|'recycler' }}
 */
export function getNewsWidgetVariant(type) {
  switch (type) {
    case 'news_by_category':
      return { source: 'category', layout: 'list' }
    case 'featured_news':
      return { source: 'featured', layout: 'list' }
    case 'latest_news_recycler':
      return { source: 'latest', layout: 'recycler' }
    case 'latest_news':
    default:
      return { source: 'latest', layout: 'list' }
  }
}

/**
 * تنظیمات کامل داشبورد ویجت لیست اخبار (داده + ظاهر + رنگ)
 */
export const NEWS_LIST_FULL_DASHBOARD_KEYS = [
  ...NEWS_LIST_DASHBOARD_KEYS,
  'font_size',
  'font_bold',
  'font_family',
  'image_size',
  'image_shape',
  'image_border_width',
  'image_border_color',
  'image_shadow',
  'text_marker',
  'text_marker_size',
  'text_marker_color',
  'like_color',
  'views_color',
  'share_color',
  'stats_layout',
  'stats_icon_size',
  'stats_font_size',
  'stats_bg',
  'stats_radius',
  'stats_gap',
  'stats_padding_x',
  'stats_padding_y',
  'stats_margin_x',
  'stats_margin_y',
  'read_more_color',
  'read_more_hover_color',
  'read_more_bg',
  'read_more_hover_bg',
  'read_more_size',
  'read_more_bold',
  'read_more_as_button',
  'read_more_align',
  'read_more_place',
  'item_border',
  'border_style',
  'border_width',
  'border_color',
  'hover_bg',
  'hover_text',
  'hover_show_lead',
  'hover_lead_image',
  'card_bg',
  'card_radius_top_left',
  'card_radius_top_right',
  'card_radius_bottom_right',
  'card_radius_bottom_left',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
]

export function pickNewsListFullDashboardSettings(raw = {}) {
  const base = normalizeNewsWidgetSettings(raw || {})
  const out = {}
  NEWS_LIST_FULL_DASHBOARD_KEYS.forEach((k) => {
    out[k] = base[k]
  })
  return out
}

/** پالت‌های آماده برای ویجت لیست اخبار */
export const NEWS_LIST_COLOR_PRESETS = [
  {
    id: 'clean_light',
    label: 'روشن مینیمال',
    patch: {
      card_bg: '#ffffff',
      border_color: 'rgba(20, 24, 31, 0.1)',
      hover_bg: '#f4f7fb',
      hover_text: '#132033',
      like_color: '#e74c3c',
      views_color: '#8b939e',
      share_color: '#8b939e',
      read_more_color: '#1565c0',
      image_border_color: 'transparent',
    },
  },
  {
    id: 'navy_soft',
    label: 'سرمه‌ای نرم',
    patch: {
      card_bg: '#0e3d66',
      border_color: 'rgba(255, 255, 255, 0.12)',
      hover_bg: '#1565c0',
      hover_text: '#ffffff',
      like_color: '#fbc300',
      views_color: '#c8d6e5',
      share_color: '#c8d6e5',
      read_more_color: '#fbc300',
      image_border_color: 'rgba(255,255,255,0.2)',
    },
  },
  {
    id: 'warm_paper',
    label: 'کاغذ گرم',
    patch: {
      card_bg: '#fff8e8',
      border_color: 'rgba(194, 120, 0, 0.22)',
      hover_bg: '#ffefc8',
      hover_text: '#5a3d00',
      like_color: '#c27800',
      views_color: '#a06a10',
      share_color: '#a06a10',
      read_more_color: '#c27800',
      image_border_color: 'rgba(194,120,0,0.25)',
    },
  },
  {
    id: 'forest_list',
    label: 'سبز آرام',
    patch: {
      card_bg: '#f1f8e9',
      border_color: 'rgba(46, 125, 50, 0.18)',
      hover_bg: '#e8f5e9',
      hover_text: '#1b5e20',
      like_color: '#2e7d32',
      views_color: '#558b2f',
      share_color: '#558b2f',
      read_more_color: '#2e7d32',
      image_border_color: 'rgba(46,125,50,0.2)',
    },
  },
  {
    id: 'slate_list',
    label: 'خاکستری مدرن',
    patch: {
      card_bg: '#f5f7fa',
      border_color: 'rgba(69, 90, 100, 0.18)',
      hover_bg: '#eceff1',
      hover_text: '#263238',
      like_color: '#546e7a',
      views_color: '#78909c',
      share_color: '#78909c',
      read_more_color: '#37474f',
      image_border_color: 'rgba(69,90,100,0.25)',
    },
  },
  {
    id: 'rose_list',
    label: 'رز ملایم',
    patch: {
      card_bg: '#fff5f7',
      border_color: 'rgba(173, 20, 87, 0.14)',
      hover_bg: '#fce4ec',
      hover_text: '#880e4f',
      like_color: '#c2185b',
      views_color: '#ad1457',
      share_color: '#ad1457',
      read_more_color: '#ad1457',
      image_border_color: 'rgba(194,24,91,0.2)',
    },
  },
]

export const NEWS_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const NEWS_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const NEWS_BAR_COLORS = [
  { key: 'border_color', label: 'رنگ بردر' },
  { key: 'image_border_color', label: 'حاشیه تصویر' },
  { key: 'hover_bg', label: 'هاور — پس‌زمینه' },
  { key: 'hover_text', label: 'هاور — متن' },
]

export const NEWS_CARD_RADIUS_FIELDS = [
  { key: 'card_radius_top_right', label: 'بالا راست' },
  { key: 'card_radius_top_left', label: 'بالا چپ' },
  { key: 'card_radius_bottom_left', label: 'پایین چپ' },
  { key: 'card_radius_bottom_right', label: 'پایین راست' },
]

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent') return 'transparent'
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

export function normalizeNewsWidgetSettings(raw = {}) {
  const s = { ...DEFAULT_NEWS_WIDGET_SETTINGS, ...(raw || {}) }
  s.show_on_mobile =
    raw.show_on_mobile === undefined ? true : !!raw.show_on_mobile
  s.font_bold = !!s.font_bold
  s.show_image = raw.show_image === undefined ? true : !!raw.show_image
  s.image_shadow = !!s.image_shadow
  s.show_likes = raw.show_likes === undefined ? true : !!raw.show_likes
  s.show_views = raw.show_views === undefined ? true : !!raw.show_views
  if (!NEWS_STATS_LAYOUTS.some((l) => l.id === s.stats_layout)) {
    s.stats_layout = 'stack'
  }
  s.like_color = colorStr(s.like_color) || DEFAULT_NEWS_WIDGET_SETTINGS.like_color
  s.views_color =
    colorStr(s.views_color) || DEFAULT_NEWS_WIDGET_SETTINGS.views_color
  s.share_color =
    colorStr(s.share_color) || DEFAULT_NEWS_WIDGET_SETTINGS.share_color
  s.stats_bg =
    colorStr(s.stats_bg) || DEFAULT_NEWS_WIDGET_SETTINGS.stats_bg
  s.stats_icon_size = Math.max(
    10,
    Math.min(28, pxNum(s.stats_icon_size, 14, 28))
  )
  s.stats_font_size = Math.max(
    8,
    Math.min(18, pxNum(s.stats_font_size, 10, 18))
  )
  s.stats_radius = Math.min(999, pxNum(s.stats_radius, 999, 999))
  s.stats_gap = Math.min(32, pxNum(s.stats_gap, 6, 32))
  s.stats_padding_x = Math.min(40, pxNum(s.stats_padding_x, 0, 40))
  s.stats_padding_y = Math.min(40, pxNum(s.stats_padding_y, 0, 40))
  s.stats_margin_x = Math.min(48, pxNum(s.stats_margin_x, 0, 48))
  s.stats_margin_y = Math.min(48, pxNum(s.stats_margin_y, 0, 48))
  s.show_author = !!s.show_author
  s.show_lead = !!s.show_lead
  s.show_read_more = raw.show_read_more === undefined ? true : !!raw.show_read_more
  s.show_share = !!s.show_share
  s.title_wrap = !!s.title_wrap
  s.read_more_bold = raw.read_more_bold === undefined ? true : !!raw.read_more_bold
  s.read_more_as_button = !!s.read_more_as_button
  s.read_more_on_hover = !!s.read_more_on_hover
  s.read_more_text =
    String(s.read_more_text ?? '').trim() ||
    DEFAULT_NEWS_WIDGET_SETTINGS.read_more_text
  if (!NEWS_READ_MORE_ALIGNS.some((a) => a.id === s.read_more_align)) {
    s.read_more_align = 'right'
  }
  if (!NEWS_READ_MORE_PLACES.some((p) => p.id === s.read_more_place)) {
    s.read_more_place = 'flow'
  }
  s.item_border = raw.item_border === undefined ? true : !!raw.item_border
  s.hover_show_lead =
    raw.hover_show_lead === undefined ? true : !!raw.hover_show_lead
  s.hover_lead_image =
    raw.hover_lead_image === undefined ? true : !!raw.hover_lead_image

  s.count = Math.max(1, Math.min(20, pxNum(s.count, 5, 20)))
  /* API latest حداکثر ۵۰ تا می‌دهد — افست + تعداد ≤ ۵۰ */
  s.offset = Math.max(0, Math.min(40, pxNum(s.offset, 0, 40)))
  if (s.offset + s.count > 50) {
    s.offset = Math.max(0, 50 - s.count)
  }
  s.category_slug = String(s.category_slug ?? '').trim()
  s.font_size = Math.max(10, Math.min(28, pxNum(s.font_size, 14, 28)))
  s.image_size = Math.max(24, Math.min(120, pxNum(s.image_size, 44, 120)))
  s.image_border_width = Math.min(8, pxNum(s.image_border_width, 0, 8))
  s.title_max_chars = Math.max(10, Math.min(200, pxNum(s.title_max_chars, 48, 200)))
  s.border_width = Math.min(8, pxNum(s.border_width, 1, 8))
  s.read_more_size = Math.max(10, Math.min(22, pxNum(s.read_more_size, 12, 22)))
  s.read_more_inset = Math.min(48, pxNum(s.read_more_inset, 8, 48))
  s.read_more_color = colorStr(s.read_more_color)
  s.read_more_hover_color = colorStr(s.read_more_hover_color)
  s.read_more_bg = colorStr(s.read_more_bg)
  s.read_more_hover_bg = colorStr(s.read_more_hover_bg)

  if (!NEWS_FONTS.some((f) => f.id === s.font_family)) s.font_family = 'iran'
  if (!NEWS_IMAGE_SHAPES.some((f) => f.id === s.image_shape)) s.image_shape = 'rounded'
  if (!NEWS_TEXT_MARKERS.some((f) => f.id === s.text_marker)) s.text_marker = 'circle_filled'
  if (!NEWS_BORDER_STYLES.some((f) => f.id === s.border_style)) s.border_style = 'solid'
  s.text_marker_size = Math.max(4, Math.min(20, pxNum(s.text_marker_size, 8, 20)))
  s.text_marker_color = colorStr(s.text_marker_color)
  s.recycler_overlay_bg =
    colorStr(s.recycler_overlay_bg) ||
    DEFAULT_NEWS_WIDGET_SETTINGS.recycler_overlay_bg
  s.recycler_show_gradient =
    raw.recycler_show_gradient === undefined
      ? true
      : !!raw.recycler_show_gradient
  s.recycler_card_shadow = !!s.recycler_card_shadow
  s.recycler_card_border_width = Math.min(
    12,
    pxNum(s.recycler_card_border_width, 1, 12)
  )
  s.recycler_card_border_color =
    colorStr(s.recycler_card_border_color) ||
    DEFAULT_NEWS_WIDGET_SETTINGS.recycler_card_border_color
  s.recycler_card_border_hover =
    colorStr(s.recycler_card_border_hover) ||
    DEFAULT_NEWS_WIDGET_SETTINGS.recycler_card_border_hover
  s.recycler_text_color =
    colorStr(s.recycler_text_color) ||
    DEFAULT_NEWS_WIDGET_SETTINGS.recycler_text_color
  s.recycler_height = Math.max(
    160,
    Math.min(520, pxNum(s.recycler_height, 280, 520))
  )
  if (!NEWS_RECYCLER_ASPECTS.some((o) => o.id === s.recycler_aspect)) {
    s.recycler_aspect = 'free'
  }
  s.recycler_image_crop =
    raw.recycler_image_crop === undefined ? true : !!raw.recycler_image_crop
  if (!NEWS_RECYCLER_TEXT_Y.some((o) => o.id === s.recycler_text_y)) {
    s.recycler_text_y = 'bottom'
  }
  if (!NEWS_RECYCLER_TEXT_X.some((o) => o.id === s.recycler_text_x)) {
    s.recycler_text_x = 'full'
  }
  s.recycler_visible_desktop = Math.max(
    1,
    Math.min(8, pxNum(s.recycler_visible_desktop, 4, 8))
  )
  s.recycler_show_arrows =
    raw.recycler_show_arrows === undefined ? true : !!raw.recycler_show_arrows
  s.recycler_autoplay = !!s.recycler_autoplay
  s.recycler_autoplay_ms = Math.max(
    1500,
    Math.min(15000, pxNum(s.recycler_autoplay_ms, 4000, 15000))
  )
  s.recycler_pause_on_hover =
    raw.recycler_pause_on_hover === undefined
      ? true
      : !!raw.recycler_pause_on_hover
  s.recycler_drag_scroll =
    raw.recycler_drag_scroll === undefined ? true : !!raw.recycler_drag_scroll
  s.recycler_section_full =
    raw.recycler_section_full === undefined ? true : !!raw.recycler_section_full
  s.recycler_section_from =
    colorStr(s.recycler_section_from) ||
    DEFAULT_NEWS_WIDGET_SETTINGS.recycler_section_from
  s.recycler_section_to =
    colorStr(s.recycler_section_to) ||
    DEFAULT_NEWS_WIDGET_SETTINGS.recycler_section_to
  s.recycler_section_angle = Math.max(
    0,
    Math.min(360, pxNum(s.recycler_section_angle, 180, 360))
  )

  ;[
    'padding_top',
    'padding_right',
    'padding_bottom',
    'padding_left',
    'margin_top',
    'margin_right',
    'margin_bottom',
    'margin_left',
    'card_radius_top_left',
    'card_radius_top_right',
    'card_radius_bottom_right',
    'card_radius_bottom_left',
    'read_more_radius_top_left',
    'read_more_radius_top_right',
    'read_more_radius_bottom_right',
    'read_more_radius_bottom_left',
  ].forEach((k) => {
    const max =
      k.startsWith('card_radius_') || k.startsWith('read_more_radius_') ? 64 : 240
    s[k] = pxNum(s[k], DEFAULT_NEWS_WIDGET_SETTINGS[k], max)
  })

  NEWS_BAR_COLORS.forEach(({ key }) => {
    s[key] = colorStr(s[key])
  })
  s.card_bg = colorStr(s.card_bg)

  return s
}

export function newsFontCss(id) {
  return NEWS_FONTS.find((f) => f.id === id)?.css || NEWS_FONTS[0].css
}

export function newsWidgetCssVars(settings) {
  const s = normalizeNewsWidgetSettings(settings || {})
  const vars = {
    '--ln-pt': `${s.padding_top}px`,
    '--ln-pr': `${s.padding_right}px`,
    '--ln-pb': `${s.padding_bottom}px`,
    '--ln-pl': `${s.padding_left}px`,
    '--ln-mt': `${s.margin_top}px`,
    '--ln-mr': `${s.margin_right}px`,
    '--ln-mb': `${s.margin_bottom}px`,
    '--ln-ml': `${s.margin_left}px`,
    '--ln-fs': `${s.font_size}px`,
    '--ln-fw': s.font_bold ? '700' : '500',
    '--ln-ff': newsFontCss(s.font_family),
    '--ln-img': `${s.image_size}px`,
    '--ln-img-r': s.image_shape === 'circle' ? '50%' : '10px',
    '--ln-img-bw': `${s.image_border_width}px`,
    '--ln-marker': `${s.text_marker_size}px`,
    '--ln-title-ch': `${s.title_max_chars}ch`,
    '--ln-bbw': s.item_border && s.border_style !== 'none' ? `${s.border_width}px` : '0',
    '--ln-bbs': s.item_border ? s.border_style : 'none',
    '--ln-card-tl': `${s.card_radius_top_left}px`,
    '--ln-card-tr': `${s.card_radius_top_right}px`,
    '--ln-card-br': `${s.card_radius_bottom_right}px`,
    '--ln-card-bl': `${s.card_radius_bottom_left}px`,
    '--ln-rm-fs': `${s.read_more_size}px`,
    '--ln-rm-fw': s.read_more_bold ? '700' : '500',
    '--ln-rm-inset': `${s.read_more_inset}px`,
    '--ln-rm-rtl': `${s.read_more_radius_top_left}px`,
    '--ln-rm-rtr': `${s.read_more_radius_top_right}px`,
    '--ln-rm-rbr': `${s.read_more_radius_bottom_right}px`,
    '--ln-rm-rbl': `${s.read_more_radius_bottom_left}px`,
    /* فیزیکی: در RTL هم راست/چپ همان سمت صفحه است */
    '--ln-rm-align':
      s.read_more_align === 'left'
        ? 'left'
        : s.read_more_align === 'center'
          ? 'center'
          : 'right',
  }
  vars['--ln-like-color'] = s.like_color || '#e74c3c'
  vars['--ln-views-color'] = s.views_color || '#8b939e'
  vars['--ln-share-color'] = s.share_color || '#8b939e'
  vars['--ln-st-bg'] = s.stats_bg || 'transparent'
  vars['--ln-st-icon'] = `${s.stats_icon_size}px`
  vars['--ln-st-fs'] = `${s.stats_font_size}px`
  vars['--ln-st-radius'] = `${s.stats_radius}px`
  vars['--ln-st-gap'] = `${s.stats_gap}px`
  vars['--ln-st-px'] = `${s.stats_padding_x}px`
  vars['--ln-st-py'] = `${s.stats_padding_y}px`
  vars['--ln-st-mx'] = `${s.stats_margin_x}px`
  vars['--ln-st-my'] = `${s.stats_margin_y}px`
  if (s.card_bg) vars['--ln-card-bg'] = s.card_bg
  if (s.image_border_color) vars['--ln-img-bc'] = s.image_border_color
  if (s.text_marker_color) vars['--ln-marker-color'] = s.text_marker_color
  vars['--ln-rv-overlay'] =
    s.recycler_overlay_bg || 'transparent'
  vars['--ln-rv-text'] = s.recycler_text_color || '#ffffff'
  vars['--ln-rv-card-bg'] = 'transparent'
  vars['--ln-rv-card-shadow'] = s.recycler_card_shadow
    ? '0 10px 32px rgba(2, 30, 50, 0.28)'
    : 'none'
  vars['--ln-rv-card-shadow-hover'] = s.recycler_card_shadow
    ? '0 16px 40px rgba(2, 30, 50, 0.4)'
    : 'none'
  vars['--ln-rv-card-bw'] = `${s.recycler_card_border_width}px`
  vars['--ln-rv-card-bc'] =
    s.recycler_card_border_width > 0
      ? s.recycler_card_border_color || 'transparent'
      : 'transparent'
  vars['--ln-rv-card-bc-hover'] =
    s.recycler_card_border_width > 0
      ? s.recycler_card_border_hover ||
        s.recycler_card_border_color ||
        'transparent'
      : 'transparent'
  /* همیشه کمی تیره برای خوانایی متن؛ با سوییچ گرادیان قوی‌تر می‌شود */
  if (s.recycler_show_gradient) {
    vars['--ln-rv-scrim'] =
      'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.35) 40%, rgba(0, 0, 0, 0.78) 100%)'
    vars['--ln-rv-scrim-hover'] =
      'linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.42) 42%, rgba(0, 0, 0, 0.84) 100%)'
  } else {
    vars['--ln-rv-scrim'] =
      'linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.22) 50%, rgba(0, 0, 0, 0.55) 100%)'
    vars['--ln-rv-scrim-hover'] =
      'linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.28) 50%, rgba(0, 0, 0, 0.62) 100%)'
  }
  {
    const aspect =
      NEWS_RECYCLER_ASPECTS.find((o) => o.id === s.recycler_aspect) ||
      NEWS_RECYCLER_ASPECTS[0]
    const useAspect = aspect.id !== 'free' && aspect.css !== 'auto'
    vars['--ln-rv-aspect'] = useAspect ? aspect.css : 'auto'
    vars['--ln-rv-h'] = useAspect ? 'auto' : `${s.recycler_height}px`
    vars['--ln-rv-min-h'] = useAspect ? '0px' : `${s.recycler_height}px`
  }
  vars['--ln-rv-fit'] = s.recycler_image_crop ? 'cover' : 'contain'
  vars['--ln-rv-visible'] = String(s.recycler_visible_desktop)
  {
    const from = s.recycler_section_from || 'transparent'
    const to = s.recycler_section_to || from
    if (from === 'transparent' && to === 'transparent') {
      vars['--ln-rv-section-bg'] = 'transparent'
    } else {
      vars['--ln-rv-section-bg'] =
        `linear-gradient(${s.recycler_section_angle}deg, ${from}, ${to})`
    }
  }
  vars['--ln-rv-fs'] = `${s.font_size}px`
  vars['--ln-rv-fw'] = s.font_bold ? '700' : '500'
  if (s.border_color) vars['--ln-bbc'] = s.border_color
  if (s.hover_bg) vars['--ln-hover-bg'] = s.hover_bg
  if (s.hover_text) vars['--ln-hover-text'] = s.hover_text
  if (s.read_more_color) vars['--ln-rm-color'] = s.read_more_color
  if (s.read_more_hover_color) vars['--ln-rm-hover'] = s.read_more_hover_color
  if (s.read_more_bg) vars['--ln-rm-bg'] = s.read_more_bg
  if (s.read_more_hover_bg) vars['--ln-rm-hover-bg'] = s.read_more_hover_bg
  return vars
}

export function isNewsWidgetType(type) {
  return NEWS_WIDGET_TYPES.has(type)
}
