export const SCHOOL_WIDGET_TYPES = [
  'school_animation',
  'school_landing',
  'school_hero_breaking',
  'school_role_bar',
  'school_hero',
  'school_portals',
  'school_report_preview',
  'school_counseling',
  'school_closing',
]

/** تنظیمات خبر فوری شفاف روی گرادیان هیرو */
export const DEFAULT_SCHOOL_HERO_BREAKING_NEWS = {
  show_ticker: true,
  sticky: true,
  shadow: false,
  bar_full_bleed: true,
  show_hamburger: false,
  show_menu_items: false,
  show_cart: false,
  guest_visible: true,
  guest_label: 'ورود',
  guest_href: '/login?next=/profile',
  color_bg: 'transparent',
  color_text: '#ffffff',
  color_link: '#a5c1ae',
  color_date: '#a5c1ae',
  color_accent: '#f3f4f6',
  color_border: 'transparent',
  color_btn_bg: '#cb0b0a',
  color_btn_text: '#ffffff',
  color_menu_icon: '#a5c1ae',
  color_profile_bg: 'transparent',
  color_profile_text: '#ffffff',
  height: 40,
  padding_top: 8,
  padding_bottom: 8,
  mobile: {
    color_bg: 'transparent',
    color_text: '#ffffff',
    color_link: '#a5c1ae',
    color_date: '#ffffff',
    color_profile_text: '#ffffff',
    color_border: 'transparent',
    shadow: false,
    sticky: true,
    bar_full_bleed: true,
  },
  desktop: {
    color_bg: 'transparent',
    color_text: '#ffffff',
    color_link: '#a5c1ae',
    color_date: '#a5c1ae',
    color_profile_text: '#ffffff',
    color_border: 'transparent',
    shadow: false,
    sticky: true,
    bar_full_bleed: true,
  },
}

/** ادغام تنظیمات خبر فوری هیرو — بدون اجبار شفافیت؛ مقدار ذخیره‌شده اولویت دارد */
export function buildHeroBreakingNewsSettings(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const mergeVp = (vp) => {
    const defVp =
      DEFAULT_SCHOOL_HERO_BREAKING_NEWS[vp] &&
      typeof DEFAULT_SCHOOL_HERO_BREAKING_NEWS[vp] === 'object'
        ? DEFAULT_SCHOOL_HERO_BREAKING_NEWS[vp]
        : {}
    const srcVp = src[vp] && typeof src[vp] === 'object' ? src[vp] : {}
    return { ...defVp, ...srcVp }
  }
  const { mobile: _m, desktop: _d, ...rootDef } = DEFAULT_SCHOOL_HERO_BREAKING_NEWS
  const { mobile: _sm, desktop: _sd, ...rootSrc } = src
  return {
    ...rootDef,
    ...rootSrc,
    sticky: src.sticky !== false,
    mobile: mergeVp('mobile'),
    desktop: mergeVp('desktop'),
  }
}

export const SCHOOL_PALETTE = {
  forest: '#004733',
  emerald: '#2b6a4d',
  sea: '#568d66',
  teal: '#a5c1ae',
  smoke: '#f3f4f6',
  alabaster: '#dcdfe5',
  coral: '#df8080',
  ember: '#cb0b0a',
  mahogany: '#ad080f',
  crimson: '#8e0413',
}

export const DEFAULT_SCHOOL_LANDING = {
  brand: 'مدرسه',
  headline: 'همه‌چیز مدرسه، در یک سامانه',
  subtitle:
    'از کارنامه و نمودار پیشرفت تا پنل مشاور، آزمون هوش، حضور و غیاب و تکالیف — برای مدیر، معلم، مشاور و دانش‌آموز.',
  cta_label: 'ورود به سامانه',
  cta_href: '/login?next=/profile',
  secondary_label: 'داشبورد دانش‌آموز',
  secondary_href: '/login?next=' + encodeURIComponent('/profile?tab=students'),
  hide_hero: false,
  hide_mobile_dock: false,
  hide_portals: false,
  show_on_mobile: true,
  show_on_desktop: true,
}

export const SCHOOL_PORTALS = [
  {
    id: 'student',
    href: '/login?next=' + encodeURIComponent('/profile?tab=students'),
    title: 'دانش‌آموز',
    desc: 'کارنامه، نمودار، تکالیف، آزمون و رتبه کلاسی',
    tone: 'cream',
  },
  {
    id: 'teacher',
    href: '/login?next=' + encodeURIComponent('/profile?tab=teacher'),
    title: 'معلم',
    desc: 'دروس، نمره‌دهی، کارنامه، آزمون و بررسی تکالیف',
    tone: 'sage',
  },
  {
    id: 'counselor',
    href: '/login?next=' + encodeURIComponent('/profile?tab=counselor'),
    title: 'مشاور',
    desc: 'آزمون IQ و EQ، پرونده دانش‌آموز و نوبت مشاوره',
    tone: 'blush',
  },
  {
    id: 'admin',
    href: '/login?next=' + encodeURIComponent('/profile?tab=manage'),
    title: 'مدیر',
    desc: 'معلمان، مشاوران، کلاس‌ها و نمای کلی فعالیت‌ها',
    tone: 'deep',
  },
]

export const REPORT_SUBJECTS = [
  { name: 'ریاضی', score: 18.5, bar: 92 },
  { name: 'علوم', score: 17.25, bar: 86 },
  { name: 'فارسی', score: 19, bar: 95 },
  { name: 'انگلیسی', score: 16.5, bar: 82 },
  { name: 'تاریخ', score: 18, bar: 90 },
]

export const CHART_MONTHS = [
  { label: 'مهر', v: 62 },
  { label: 'آبان', v: 70 },
  { label: 'آذر', v: 68 },
  { label: 'دی', v: 78 },
  { label: 'بهمن', v: 85 },
  { label: 'اسفند', v: 88 },
]

export const COUNSELOR_TESTS = [
  { title: 'هوش کلی (IQ)', meta: '۴۵ دقیقه · چندگزینه‌ای' },
  { title: 'هوش هیجانی (EQ)', meta: '۳۰ دقیقه · خودارزیابی' },
  { title: 'سبک یادگیری', meta: '۲۰ دقیقه · توصیه‌محور' },
]

export const TEACHER_TOOLS = [
  { title: 'کارنامه ماهانه', desc: 'ثبت نمره و رتبه در کلاس' },
  { title: 'آزمون آنلاین', desc: 'طراحی، زمان‌بندی و تصحیح' },
  { title: 'تکالیف تصویری', desc: 'ارسال و بازخورد معلم' },
  { title: 'حضور و غیاب', desc: 'ثبت روزانه و گزارش ماه' },
]

export function normalizeSchoolSettings(raw = {}, fallback = DEFAULT_SCHOOL_LANDING) {
  const s = raw && typeof raw === 'object' ? raw : {}
  return {
    ...fallback,
    brand: String(s.brand ?? fallback.brand).trim() || fallback.brand,
    headline: String(s.headline ?? fallback.headline).trim() || fallback.headline,
    subtitle: String(s.subtitle ?? fallback.subtitle).trim() || fallback.subtitle,
    cta_label: String(s.cta_label ?? fallback.cta_label).trim() || fallback.cta_label,
    cta_href: String(s.cta_href ?? fallback.cta_href).trim() || fallback.cta_href,
    secondary_label:
      String(s.secondary_label ?? fallback.secondary_label).trim() || fallback.secondary_label,
    secondary_href:
      String(s.secondary_href ?? fallback.secondary_href).trim() || fallback.secondary_href,
    hide_hero: s.hide_hero === true,
    hide_mobile_dock: s.hide_mobile_dock === true || s.hide_hero === true,
    hide_portals: s.hide_portals === true,
    show_on_mobile: s.show_on_mobile !== false,
    show_on_desktop: s.show_on_desktop !== false,
  }
}
