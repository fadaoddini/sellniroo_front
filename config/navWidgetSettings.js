// config/navWidgetSettings.js — تنظیمات پیش‌فرض ویجت‌های نوار بالا / منو / پروفایل
// نوار خبر فوری: desktop / mobile جدا (override تودرتو + سازگاری با کلیدهای تخت قدیمی)

export const PROFILE_MODES = [
  { id: 'hidden', label: 'مخفی' },
  { id: 'avatar', label: 'آواتار' },
  { id: 'avatar_name', label: 'آواتار + نام' },
]

export const PROFILE_SHAPES = [
  { id: 'circle', label: 'دایره' },
  { id: 'rounded', label: 'مربع گرد' },
]

/** رنگ‌های نوار */
export const NAV_BAR_COLORS = [
  { key: 'color_bg', label: 'پس‌زمینه نوار' },
  { key: 'color_text', label: 'متن تیتر' },
  { key: 'color_accent', label: 'اکسنت' },
  { key: 'color_border', label: 'حاشیه' },
  { key: 'color_date', label: 'رنگ تاریخ' },
]

export const DATE_FONT_WEIGHTS = [
  { id: 300, label: 'نازک' },
  { id: 400, label: 'عادی' },
  { id: 500, label: 'متوسط' },
  { id: 600, label: 'ضخیم' },
  { id: 700, label: 'خیلی ضخیم' },
]

/** رنگ‌های منو */
export const NAV_MENU_COLORS = [
  { key: 'color_link', label: 'لینک منو' },
  { key: 'color_menu_hover_bg', label: 'هاور — پس‌زمینه' },
  { key: 'color_menu_hover_text', label: 'هاور — متن' },
  { key: 'color_menu_icon', label: 'آیکن منوی بازشونده' },
  { key: 'color_drawer_bg', label: 'پس‌زمینه منوی بازشونده' },
]

/** رنگ‌های پروفایل / دکمه */
export const NAV_PROFILE_COLORS = [
  { key: 'color_profile_bg', label: 'پس‌زمینه آواتار+نام' },
  { key: 'color_profile_text', label: 'رنگ نام' },
  { key: 'color_avatar_border', label: 'حاشیه تصویر' },
  { key: 'color_btn_bg', label: 'دکمه مهمان — پس‌زمینه' },
  { key: 'color_btn_text', label: 'دکمه مهمان — متن' },
]

/** رنگ‌های منوی بازشونده پروفایل (دسکتاپ + شیت موبایل) */
export const NAV_PROFILE_MENU_COLORS = [
  { key: 'color_profile_menu_bg', label: 'پس‌زمینه منو' },
  { key: 'color_profile_menu_border', label: 'حاشیه منو' },
  { key: 'color_profile_menu_text', label: 'متن و لینک‌ها' },
  { key: 'color_profile_menu_muted', label: 'متن فرعی (موبایل)' },
  { key: 'color_profile_menu_icon', label: 'آیکن‌ها' },
  { key: 'color_profile_menu_hover_bg', label: 'هاور — پس‌زمینه' },
  { key: 'color_profile_menu_hover_text', label: 'هاور — متن' },
  { key: 'color_profile_menu_divider', label: 'خط جداکننده' },
]

/** رنگ‌های سبد خرید در نوار خبر فوری */
export const NAV_CART_COLORS = [
  { key: 'color_cart_icon', label: 'آیکن' },
  { key: 'color_cart_bg', label: 'پس‌زمینه دکمه' },
  { key: 'color_cart_border', label: 'حاشیه دکمه' },
  { key: 'color_cart_hover_bg', label: 'هاور — پس‌زمینه' },
  { key: 'color_cart_hover_icon', label: 'هاور — آیکن' },
  { key: 'color_cart_badge_bg', label: 'بج — پس‌زمینه' },
  { key: 'color_cart_badge_text', label: 'بج — متن' },
  { key: 'color_cart_badge_border', label: 'بج — حاشیه' },
]

export const CART_PLACES = [
  { id: 'before_profile', label: 'قبل از پروفایل' },
  { id: 'after_profile', label: 'بعد از پروفایل' },
]

export const JOB_CTA_PLACES = CART_PLACES

/** حالت‌های جستجو در نوار خبر فوری */
export const NAV_SEARCH_MODES = [
  {
    id: 'bar',
    label: 'نوار کامل',
    hint: 'فیلد + دکمه + متن راهنما',
  },
  {
    id: 'icon',
    label: 'آیکن بازشو',
    hint: 'کنار پروفایل؛ با کلیک آرام باز می‌شود',
  },
]

/** رنگ‌های دکمه‌های ساخت رزومه / شرکت */
export const NAV_JOB_CTA_COLORS = [
  { key: 'color_resume_cta_bg', label: 'رزومه — پس‌زمینه' },
  { key: 'color_resume_cta_text', label: 'رزومه — متن' },
  { key: 'color_resume_cta_border', label: 'رزومه — حاشیه' },
  { key: 'color_resume_cta_hover_bg', label: 'رزومه — هاور' },
  { key: 'color_company_cta_bg', label: 'شرکت — پس‌زمینه' },
  { key: 'color_company_cta_text', label: 'شرکت — متن' },
  { key: 'color_company_cta_border', label: 'شرکت — حاشیه' },
  { key: 'color_company_cta_hover_bg', label: 'شرکت — هاور' },
]

export const NAV_COLOR_FIELDS = [
  ...NAV_BAR_COLORS,
  ...NAV_MENU_COLORS,
  ...NAV_PROFILE_COLORS,
  ...NAV_PROFILE_MENU_COLORS,
  ...NAV_CART_COLORS,
  ...NAV_JOB_CTA_COLORS,
]

export const NAV_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const NAV_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

/** کلیدهایی که برای دسکتاپ و موبایل جدا ذخیره می‌شوند */
export const NAV_LOGO_PLACES = [
  { id: 'after_hamburger', label: 'بعد از همبرگر' },
  { id: 'before_hamburger', label: 'قبل از همبرگر' },
]

export const NAV_VIEWPORT_KEYS = [
  'show_ticker',
  'show_hamburger',
  'show_logo',
  'logo_height',
  'logo_place',
  'show_menu_items',
  'show_menu_icons',
  'show_date',
  'underline',
  'profile_mode',
  'avatar_shape',
  'guest_visible',
  'guest_label',
  'guest_icon',
  'guest_href',
  'show_cart',
  'cart_show_empty',
  'cart_show_badge',
  'cart_place',
  'cart_icon',
  'cart_href',
  'cart_icon_size',
  'cart_btn_size',
  'cart_btn_radius',
  'cart_badge_size',
  'show_search',
  'search_mode',
  'search_placeholder',
  'search_button_label',
  'search_href',
  'show_resume_cta',
  'show_company_cta',
  'resume_cta_label',
  'company_cta_label',
  'resume_cta_href',
  'company_cta_href',
  'job_cta_place',
  'sticky',
  'sticky_offset',
  'height',
  'blur',
  'shadow',
  'border_width',
  'font_size',
  'date_font_size',
  'date_font_weight',
  'nav_gap',
  'link_radius',
  'drawer_width',
  'padding_top',
  'padding_right',
  'padding_bottom',
  'padding_left',
  'margin_top',
  'margin_right',
  'margin_bottom',
  'margin_left',
  /** تمام‌عرض صفحه vs کارت inset با فاصله از کنار */
  'bar_full_bleed',
  /** گردی گوشه‌ها — یکنواخت (سازگاری) + چهار گوشه جدا */
  'bar_radius',
  'bar_radius_tl',
  'bar_radius_tr',
  'bar_radius_br',
  'bar_radius_bl',
  'avatar_border_width',
  'sheet_ms',
  ...NAV_COLOR_FIELDS.map((f) => f.key),
]

/** برچسب گردی چهار گوشه (فیزیکی: TL/TR/BR/BL) */
export const NAV_RADIUS_CORNERS = [
  { key: 'bar_radius_tl', label: 'بالا چپ' },
  { key: 'bar_radius_tr', label: 'بالا راست' },
  { key: 'bar_radius_br', label: 'پایین راست' },
  { key: 'bar_radius_bl', label: 'پایین چپ' },
]

/** فقط در ریشه — برای هر دو حالت مشترک */
export const NAV_SHARED_ROOT_KEYS = new Set([
  'menu_slug',
  'show_on_mobile',
  'show_on_desktop',
  'use_site_logo',
  'logo_url',
  'logo_href',
])

export const NAV_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const DEFAULT_NAV_WIDGET_SETTINGS = {
  menu_slug: 'main',
  show_ticker: true,
  show_hamburger: true,
  show_logo: false,
  use_site_logo: true,
  logo_url: '',
  logo_href: '/',
  logo_height: 40,
  logo_place: 'after_hamburger',
  show_menu_items: true,
  show_menu_icons: true,
  show_date: true,
  underline: false,
  show_on_mobile: true,
  show_on_desktop: true,
  profile_mode: 'avatar',
  avatar_shape: 'circle',
  guest_visible: true,
  guest_label: 'ورود',
  guest_icon: 'LogIn',
  guest_href: '/login',
  show_cart: true,
  cart_show_empty: true,
  cart_show_badge: true,
  cart_place: 'before_profile',
  cart_icon: 'ShoppingCart',
  cart_href: '',
  cart_icon_size: 16,
  cart_btn_size: 32,
  cart_btn_radius: 8,
  cart_badge_size: 16,
  show_search: false,
  search_mode: 'icon',
  search_placeholder: 'جستجو در سایت…',
  search_button_label: 'جستجو',
  search_href: '/search',
  show_resume_cta: false,
  show_company_cta: false,
  resume_cta_label: 'ساخت رزومه',
  company_cta_label: 'ساخت شرکت',
  resume_cta_href: '/profile?tab=resume',
  company_cta_href: '/profile?tab=company',
  job_cta_place: 'before_profile',
  color_resume_cta_bg: '#FEF3E2',
  color_resume_cta_text: '#2A1A0E',
  color_resume_cta_border: '#F4AE52',
  color_resume_cta_hover_bg: '#FFF8EC',
  color_company_cta_bg: '#FEF3E2',
  color_company_cta_text: '#2A1A0E',
  color_company_cta_border: '#F4AE52',
  color_company_cta_hover_bg: '#FFF8EC',
  color_cart_icon: '',
  color_cart_bg: '',
  color_cart_border: '',
  color_cart_hover_bg: '',
  color_cart_hover_icon: '',
  color_cart_badge_bg: '',
  color_cart_badge_text: '',
  color_cart_badge_border: '',
  sticky: true,
  sticky_offset: 0,
  height: 40,
  blur: 0,
  shadow: true,
  border_width: 2,
  font_size: 13,
  date_font_size: 11,
  date_font_weight: 400,
  nav_gap: 6,
  link_radius: 6,
  drawer_width: 300,
  bar_full_bleed: true,
  bar_radius: 0,
  bar_radius_tl: 0,
  bar_radius_tr: 0,
  bar_radius_br: 0,
  bar_radius_bl: 0,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  color_bg: '',
  color_text: '',
  color_accent: '',
  color_border: '',
  color_date: '',
  color_link: '',
  color_menu_hover_bg: '',
  color_menu_hover_text: '',
  color_menu_icon: '',
  color_drawer_bg: '',
  color_profile_bg: 'transparent',
  color_profile_text: '',
  color_avatar_border: '',
  avatar_border_width: 2,
  sheet_ms: 350,
  color_btn_bg: '',
  color_btn_text: '',
  color_profile_menu_bg: '',
  color_profile_menu_border: '',
  color_profile_menu_text: '',
  color_profile_menu_muted: '',
  color_profile_menu_icon: '',
  color_profile_menu_hover_bg: '',
  color_profile_menu_hover_text: '',
  color_profile_menu_divider: '',
}

export const SHEET_SPEEDS = [
  { id: 250, label: 'سریع' },
  { id: 350, label: 'عادی' },
  { id: 500, label: 'آرام' },
  { id: 700, label: 'خیلی آرام' },
]

export const NAV_WIDGET_TYPES = new Set([
  'breaking_news',
  'hamburger_menu',
  'header_menu',
  'profile',
  'nav_bar',
])

function pxNum(v, fallback = 0) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(240, Math.round(n)))
}

function colorStr(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (s.toLowerCase() === 'transparent' || s.toLowerCase() === 'none') {
    return 'transparent'
  }
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s
  if (/^rgba?\(/i.test(s) || /^hsla?\(/i.test(s)) return s
  return ''
}

function pickViewportSlice(obj = {}) {
  const out = {}
  NAV_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

/**
 * دسکتاپ و موبایل جدا — موبایل از desktop ارث نمی‌برد.
 * اگر هنوز کلید موبایلی نباشد، موقتاً ظاهر دسکتاپ نشان داده می‌شود.
 */
export function mergeNavViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}

  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) {
      // موبایل override می‌کند؛ رنگ خالی = «تنظیم نشده» تا رنگ دسکتاپ نپرد
      const merged = { ...desktop, ...mobileOv }
      NAV_COLOR_FIELDS.forEach(({ key }) => {
        const mob = mobileOv[key]
        if (mob === '' || mob == null) {
          if (desktop[key]) merged[key] = desktop[key]
        }
      })
      return merged
    }
    return desktop
  }
  return desktop
}

function coerceNavSettings(merged, rawRoot = {}) {
  const s = { ...DEFAULT_NAV_WIDGET_SETTINGS, ...merged }

  if (!PROFILE_MODES.some((m) => m.id === s.profile_mode)) {
    s.profile_mode = 'avatar'
  }
  if (!PROFILE_SHAPES.some((f) => f.id === s.avatar_shape)) {
    s.avatar_shape = 'circle'
  }

  s.show_ticker = s.show_ticker !== false
  s.show_hamburger =
    merged.show_hamburger === undefined ? true : !!merged.show_hamburger
  s.show_logo = !!merged.show_logo
  s.show_menu_items =
    merged.show_menu_items === undefined ? true : !!merged.show_menu_items
  s.show_menu_icons =
    merged.show_menu_icons === undefined ? true : !!merged.show_menu_icons
  s.show_date = merged.show_date === undefined ? true : !!merged.show_date
  s.underline = !!merged.underline
  s.sticky = merged.sticky === undefined ? true : !!merged.sticky
  s.shadow = merged.shadow === undefined ? true : !!merged.shadow
  s.bar_full_bleed =
    merged.bar_full_bleed === undefined ? true : !!merged.bar_full_bleed

  s.use_site_logo =
    rawRoot.use_site_logo === undefined
      ? true
      : !!rawRoot.use_site_logo
  s.logo_url = String((rawRoot.logo_url ?? s.logo_url) || '').trim()
  s.logo_href =
    String((rawRoot.logo_href ?? s.logo_href) || '/').trim() || '/'
  s.logo_height = Math.min(
    64,
    Math.max(
      16,
      pxNum(s.logo_height, DEFAULT_NAV_WIDGET_SETTINGS.logo_height),
    ),
  )
  if (!NAV_LOGO_PLACES.some((p) => p.id === s.logo_place)) {
    s.logo_place = 'after_hamburger'
  }
  s.bar_radius = Math.min(48, pxNum(s.bar_radius, 0))
  /* اگر گوشه جدا ست نشده، از bar_radius یکنواخت ارث ببرد */
  ;['bar_radius_tl', 'bar_radius_tr', 'bar_radius_br', 'bar_radius_bl'].forEach(
    (k) => {
      const hasOwn = merged[k] !== undefined && merged[k] !== null && merged[k] !== ''
      s[k] = Math.min(
        48,
        pxNum(hasOwn ? merged[k] : s.bar_radius, s.bar_radius)
      )
    }
  )
  s.guest_visible = s.guest_visible !== false
  s.guest_label = String(s.guest_label || 'ورود').trim() || 'ورود'
  s.guest_icon = String(s.guest_icon || 'LogIn').trim() || 'LogIn'
  s.guest_href = String(s.guest_href || '/login').trim() || '/login'

  s.show_cart = merged.show_cart === undefined ? true : !!merged.show_cart
  s.cart_show_empty =
    merged.cart_show_empty === undefined ? true : !!merged.cart_show_empty
  s.cart_show_badge =
    merged.cart_show_badge === undefined ? true : !!merged.cart_show_badge
  if (!CART_PLACES.some((p) => p.id === s.cart_place)) {
    s.cart_place = 'before_profile'
  }
  s.show_search = !!merged.show_search
  s.search_mode = merged.search_mode === 'bar' ? 'bar' : 'icon'
  s.search_placeholder =
    String(
      s.search_placeholder || DEFAULT_NAV_WIDGET_SETTINGS.search_placeholder,
    ).trim() || DEFAULT_NAV_WIDGET_SETTINGS.search_placeholder
  s.search_button_label =
    String(
      s.search_button_label || DEFAULT_NAV_WIDGET_SETTINGS.search_button_label,
    ).trim() || DEFAULT_NAV_WIDGET_SETTINGS.search_button_label
  s.search_href =
    String(s.search_href || DEFAULT_NAV_WIDGET_SETTINGS.search_href).trim() ||
    DEFAULT_NAV_WIDGET_SETTINGS.search_href
  s.cart_icon = String(s.cart_icon || 'ShoppingCart').trim() || 'ShoppingCart'
  s.cart_href = String(s.cart_href || '').trim()
  s.cart_icon_size = Math.min(
    28,
    Math.max(12, pxNum(s.cart_icon_size, DEFAULT_NAV_WIDGET_SETTINGS.cart_icon_size)),
  )
  s.cart_btn_size = Math.min(
    56,
    Math.max(24, pxNum(s.cart_btn_size, DEFAULT_NAV_WIDGET_SETTINGS.cart_btn_size)),
  )
  s.cart_btn_radius = Math.min(
    28,
    pxNum(s.cart_btn_radius, DEFAULT_NAV_WIDGET_SETTINGS.cart_btn_radius),
  )
  s.cart_badge_size = Math.min(
    28,
    Math.max(12, pxNum(s.cart_badge_size, DEFAULT_NAV_WIDGET_SETTINGS.cart_badge_size)),
  )

  s.show_resume_cta = !!merged.show_resume_cta
  s.show_company_cta = !!merged.show_company_cta
  s.resume_cta_label =
    String(s.resume_cta_label || DEFAULT_NAV_WIDGET_SETTINGS.resume_cta_label).trim() ||
    DEFAULT_NAV_WIDGET_SETTINGS.resume_cta_label
  s.company_cta_label =
    String(s.company_cta_label || DEFAULT_NAV_WIDGET_SETTINGS.company_cta_label).trim() ||
    DEFAULT_NAV_WIDGET_SETTINGS.company_cta_label
  s.resume_cta_href =
    String(s.resume_cta_href || DEFAULT_NAV_WIDGET_SETTINGS.resume_cta_href).trim() ||
    DEFAULT_NAV_WIDGET_SETTINGS.resume_cta_href
  s.company_cta_href =
    String(s.company_cta_href || DEFAULT_NAV_WIDGET_SETTINGS.company_cta_href).trim() ||
    DEFAULT_NAV_WIDGET_SETTINGS.company_cta_href
  if (!JOB_CTA_PLACES.some((p) => p.id === s.job_cta_place)) {
    s.job_cta_place = 'before_profile'
  }

  s.menu_slug =
    String((rawRoot.menu_slug ?? s.menu_slug) || 'main').trim() || 'main'
  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop

  ;[
    'padding_top',
    'padding_right',
    'padding_bottom',
    'padding_left',
    'margin_top',
    'margin_right',
    'margin_bottom',
    'margin_left',
  ].forEach((k) => {
    s[k] = pxNum(s[k], DEFAULT_NAV_WIDGET_SETTINGS[k])
  })

  s.sticky_offset = Math.min(
    120,
    pxNum(s.sticky_offset, DEFAULT_NAV_WIDGET_SETTINGS.sticky_offset)
  )
  s.height = Math.min(
    120,
    Math.max(28, pxNum(s.height, DEFAULT_NAV_WIDGET_SETTINGS.height))
  )
  s.blur = Math.min(40, pxNum(s.blur, DEFAULT_NAV_WIDGET_SETTINGS.blur))
  s.border_width = Math.min(
    8,
    pxNum(s.border_width, DEFAULT_NAV_WIDGET_SETTINGS.border_width)
  )
  s.font_size = Math.min(
    22,
    Math.max(10, pxNum(s.font_size, DEFAULT_NAV_WIDGET_SETTINGS.font_size))
  )
  s.date_font_size = Math.min(
    22,
    Math.max(
      9,
      pxNum(s.date_font_size, DEFAULT_NAV_WIDGET_SETTINGS.date_font_size)
    )
  )
  const dateWeight = Number(s.date_font_weight)
  s.date_font_weight = [300, 400, 500, 600, 700].includes(dateWeight)
    ? dateWeight
    : 400
  s.nav_gap = Math.min(32, pxNum(s.nav_gap, DEFAULT_NAV_WIDGET_SETTINGS.nav_gap))
  s.link_radius = Math.min(
    24,
    pxNum(s.link_radius, DEFAULT_NAV_WIDGET_SETTINGS.link_radius)
  )
  s.drawer_width = Math.min(
    420,
    Math.max(
      220,
      pxNum(s.drawer_width, DEFAULT_NAV_WIDGET_SETTINGS.drawer_width)
    )
  )

  s.avatar_border_width = Math.min(
    12,
    pxNum(s.avatar_border_width, DEFAULT_NAV_WIDGET_SETTINGS.avatar_border_width)
  )

  const sheetMs = Number(s.sheet_ms)
  s.sheet_ms = [250, 350, 500, 700].includes(sheetMs) ? sheetMs : 350

  NAV_COLOR_FIELDS.forEach(({ key }) => {
    s[key] = colorStr(s[key])
  })

  return s
}

/**
 * @param {object} raw
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function normalizeNavWidgetSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeNavViewportRaw(root, viewport)
  return coerceNavSettings(merged, root)
}

/** فقط پرچم‌های نمایش کل ویجت در ریشه */
export function getNavVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

/** اسنپ‌شات کلیدهای ویوپورت از تنظیمات فعلی دسکتاپ (برای کپی به موبایل) */
export function snapshotNavViewportSettings(raw = {}, viewport = 'desktop') {
  return pickViewportSlice(normalizeNavWidgetSettings(raw, { viewport }))
}

/**
 * پچ تنظیمات برای یک ویوپورت — اسنپ‌شات کامل همان دستگاه
 * تا دسکتاپ و موبایل از هم جدا بمانند
 */
export function buildNavViewportPatch(raw, device, key, value) {
  if (NAV_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotNavViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

/**
 * استایل CSS سفارشی برای نوار خبر از تنظیمات ویجت
 * @param {object} settings
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function navWidgetCssVars(settings, opts = {}) {
  const s = normalizeNavWidgetSettings(settings || {}, opts)
  const fullBleed = s.bar_full_bleed !== false
  const vars = {
    '--bn-h': `${s.height}px`,
    '--bn-sticky-top': s.sticky ? `${s.sticky_offset}px` : 'auto',
    '--bn-blur': `${s.blur}px`,
    '--bn-bw': `${s.border_width}px`,
    '--bn-fs': `${s.font_size}px`,
    '--bn-date-fs': `${s.date_font_size}px`,
    '--bn-date-fw': String(s.date_font_weight || 400),
    '--bn-gap': `${s.nav_gap}px`,
    '--bn-link-radius': `${s.link_radius}px`,
    '--bn-drawer-w': `${s.drawer_width}px`,
    '--bn-logo-h': `${s.logo_height}px`,
    '--bn-shadow': s.shadow
      ? '0 2px 8px rgba(0, 0, 0, 0.15)'
      : 'none',
    '--bn-pt': `${s.padding_top}px`,
    '--bn-pr': `${s.padding_right}px`,
    '--bn-pb': `${s.padding_bottom}px`,
    '--bn-pl': `${s.padding_left}px`,
    '--bn-mt': `${s.margin_top}px`,
    '--bn-mr': fullBleed ? '0px' : `${s.margin_right}px`,
    '--bn-mb': `${s.margin_bottom}px`,
    '--bn-ml': fullBleed ? '0px' : `${s.margin_left}px`,
    '--bn-bar-radius': `${s.bar_radius || 0}px`,
    '--bn-rtl': `${s.bar_radius_tl || 0}px`,
    '--bn-rtr': `${s.bar_radius_tr || 0}px`,
    '--bn-rbr': `${s.bar_radius_br || 0}px`,
    '--bn-rbl': `${s.bar_radius_bl || 0}px`,
    '--bn-avatar-radius': s.avatar_shape === 'rounded' ? '8px' : '50%',
    '--bn-profile-chip-radius':
      s.avatar_shape === 'rounded' ? '10px' : '999px',
    '--bn-avatar-border-w': `${s.avatar_border_width}px`,
    '--bn-sheet-ms': `${s.sheet_ms}ms`,
    '--bn-cart-icon-size': `${s.cart_icon_size}px`,
    '--bn-cart-btn-size': `${s.cart_btn_size}px`,
    '--bn-cart-btn-radius': `${s.cart_btn_radius}px`,
    '--bn-cart-badge-size': `${s.cart_badge_size}px`,
  }

  const map = {
    color_bg: '--bn-bg',
    color_text: '--bn-text',
    color_accent: '--bn-accent',
    color_border: '--bn-border',
    color_date: '--bn-date',
    color_link: '--bn-link',
    color_menu_hover_bg: '--bn-menu-hover-bg',
    color_menu_hover_text: '--bn-menu-hover-text',
    color_menu_icon: '--bn-menu-icon',
    color_drawer_bg: '--bn-drawer-bg',
    color_profile_bg: '--bn-profile-bg',
    color_profile_text: '--bn-profile-text',
    color_avatar_border: '--bn-avatar-border',
    color_btn_bg: '--bn-btn-bg',
    color_btn_text: '--bn-btn-text',
    color_profile_menu_bg: '--bn-profile-menu-bg',
    color_profile_menu_border: '--bn-profile-menu-border',
    color_profile_menu_text: '--bn-profile-menu-text',
    color_profile_menu_muted: '--bn-profile-menu-muted',
    color_profile_menu_icon: '--bn-profile-menu-icon',
    color_profile_menu_hover_bg: '--bn-profile-menu-hover-bg',
    color_profile_menu_hover_text: '--bn-profile-menu-hover-text',
    color_profile_menu_divider: '--bn-profile-menu-divider',
    color_cart_icon: '--bn-cart-icon',
    color_cart_bg: '--bn-cart-bg',
    color_cart_border: '--bn-cart-border',
    color_cart_hover_bg: '--bn-cart-hover-bg',
    color_cart_hover_icon: '--bn-cart-hover-icon',
    color_cart_badge_bg: '--bn-cart-badge-bg',
    color_cart_badge_text: '--bn-cart-badge-text',
    color_cart_badge_border: '--bn-cart-badge-border',
    color_resume_cta_bg: '--bn-resume-cta-bg',
    color_resume_cta_text: '--bn-resume-cta-text',
    color_resume_cta_border: '--bn-resume-cta-border',
    color_resume_cta_hover_bg: '--bn-resume-cta-hover-bg',
    color_company_cta_bg: '--bn-company-cta-bg',
    color_company_cta_text: '--bn-company-cta-text',
    color_company_cta_border: '--bn-company-cta-border',
    color_company_cta_hover_bg: '--bn-company-cta-hover-bg',
  }

  Object.entries(map).forEach(([key, cssVar]) => {
    if (s[key]) vars[cssVar] = s[key]
  })

  return vars
}

export function isNavWidgetType(type) {
  return NAV_WIDGET_TYPES.has(type)
}
