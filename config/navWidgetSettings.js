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

export const NAV_COLOR_FIELDS = [
  ...NAV_BAR_COLORS,
  ...NAV_MENU_COLORS,
  ...NAV_PROFILE_COLORS,
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
export const NAV_VIEWPORT_KEYS = [
  'show_ticker',
  'show_hamburger',
  'show_menu_items',
  'profile_mode',
  'avatar_shape',
  'guest_visible',
  'guest_label',
  'guest_icon',
  'guest_href',
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
  /** گردی گوشه‌های نوار (مفید برای موبایل) */
  'bar_radius',
  'avatar_border_width',
  'sheet_ms',
  ...NAV_COLOR_FIELDS.map((f) => f.key),
]

/** فقط در ریشه — برای هر دو حالت مشترک */
export const NAV_SHARED_ROOT_KEYS = new Set([
  'menu_slug',
  'show_on_mobile',
  'show_on_desktop',
])

export const NAV_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const DEFAULT_NAV_WIDGET_SETTINGS = {
  menu_slug: 'main',
  show_ticker: true,
  show_hamburger: true,
  show_menu_items: true,
  show_on_mobile: true,
  show_on_desktop: true,
  profile_mode: 'avatar',
  avatar_shape: 'circle',
  guest_visible: true,
  guest_label: 'ورود',
  guest_icon: 'LogIn',
  guest_href: '/login',
  bar_full_bleed: true,
  bar_radius: 0,
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
      return { ...flat, ...mobileOv }
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
  s.show_menu_items =
    merged.show_menu_items === undefined ? true : !!merged.show_menu_items
  s.bar_full_bleed =
    merged.bar_full_bleed === undefined ? true : !!merged.bar_full_bleed
  s.bar_radius = Math.min(40, pxNum(s.bar_radius, 0))
  s.guest_visible = s.guest_visible !== false
  s.guest_label = String(s.guest_label || 'ورود').trim() || 'ورود'
  s.guest_icon = String(s.guest_icon || 'LogIn').trim() || 'LogIn'
  s.guest_href = String(s.guest_href || '/login').trim() || '/login'

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
    '--bn-pt': `${s.padding_top}px`,
    '--bn-pr': `${s.padding_right}px`,
    '--bn-pb': `${s.padding_bottom}px`,
    '--bn-pl': `${s.padding_left}px`,
    '--bn-mt': `${s.margin_top}px`,
    '--bn-mr': fullBleed ? '0px' : `${s.margin_right}px`,
    '--bn-mb': `${s.margin_bottom}px`,
    '--bn-ml': fullBleed ? '0px' : `${s.margin_left}px`,
    '--bn-bar-radius': `${s.bar_radius || 0}px`,
    '--bn-avatar-radius': s.avatar_shape === 'rounded' ? '8px' : '50%',
    '--bn-profile-chip-radius':
      s.avatar_shape === 'rounded' ? '10px' : '999px',
    '--bn-avatar-border-w': `${s.avatar_border_width}px`,
    '--bn-sheet-ms': `${s.sheet_ms}ms`,
  }

  const map = {
    color_bg: '--bn-bg',
    color_text: '--bn-text',
    color_accent: '--bn-accent',
    color_border: '--bn-border',
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
  }

  Object.entries(map).forEach(([key, cssVar]) => {
    if (s[key]) vars[cssVar] = s[key]
  })

  return vars
}

export function isNavWidgetType(type) {
  return NAV_WIDGET_TYPES.has(type)
}
