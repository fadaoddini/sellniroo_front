/** تنظیمات ویجت‌های اختصاصی نوبت/صدرا (پیشوند nobat_) */

export const NOBAT_WIDGET_TYPES = [
  'nobat_hero',
  'nobat_pillars',
  'nobat_parts',
  'nobat_search',
  'nobat_process',
  'nobat_book',
  'nobat_team',
  'nobat_report',
  'nobat_closing',
]

export const NOBAT_WIDGET_TYPE_SET = new Set(NOBAT_WIDGET_TYPES)

export function isNobatWidgetType(type) {
  return NOBAT_WIDGET_TYPE_SET.has(type)
}

const SPACE = {
  padding_top: 28,
  padding_right: 16,
  padding_bottom: 28,
  padding_left: 16,
  margin_top: 0,
  margin_bottom: 0,
}

export const NOBAT_DEFAULT_PILLARS = [
  {
    id: 'parts',
    title: 'تامین قطعات',
    text: 'انبار قطعات یدکی منبع لیزر، اپتیک، خنک‌کننده و الکترونیک',
    icon: 'Package',
    href: '/shop',
    accent: '#dbbe00',
  },
  {
    id: 'book',
    title: 'رزرو تعمیر',
    text: 'نوبت حضوری یا سیار طبق ضوابط مرکز صدرا با تقویم شمسی',
    icon: 'Calendar',
    href: '/repairs',
    accent: '#B38C00',
  },
  {
    id: 'service',
    title: 'مدیریت سرویس',
    text: 'اعزام تکنسین، ثبت مراحل تعمیر و گزارش وضعیت دستگاه',
    icon: 'Wrench',
    href: '/repairs',
    accent: '#8F7000',
  },
  {
    id: 'story',
    title: 'استوری تخصصی',
    text: 'آموزش کوتاه، معرفی قطعه و پشت‌صحنه تعمیرات لیزر',
    icon: 'Clapperboard',
    href: '/#nobat-stories',
    accent: '#e8d98a',
  },
]

export const NOBAT_DEFAULT_PARTS = [
  {
    title: 'منبع لیزر و تیوب',
    desc: 'تیوب CO₂، دیود و ماژول‌های توان',
    href: '/shop',
    tag: 'اپتیک',
  },
  {
    title: 'آینه و لنز',
    desc: 'آینه سیلیکون، لنز فوکوس و محافظ',
    href: '/shop',
    tag: 'مسیر نور',
  },
  {
    title: 'خنک‌کننده',
    desc: 'چیلر، پمپ و سنسور دما',
    href: '/shop',
    tag: 'ترمال',
  },
  {
    title: 'الکترونیک کنترل',
    desc: 'برد کنترل، درایور و سنسور ایمنی',
    href: '/shop',
    tag: 'کنترل',
  },
]

export const NOBAT_DEFAULT_STEPS = [
  {
    n: '۰۱',
    title: 'رزرو نوبت',
    text: 'خدمت و بازه زمانی را طبق ظرفیت مرکز انتخاب کنید',
  },
  {
    n: '۰۲',
    title: 'پذیرش دستگاه',
    text: 'ثبت مدل، سریال و شرح ایراد در پرونده سرویس',
  },
  {
    n: '۰۳',
    title: 'اعزام / تعمیر',
    text: 'تکنسین مسئول مراحل عیب‌یابی و تعویض قطعه را ثبت می‌کند',
  },
  {
    n: '۰۴',
    title: 'گزارش و تحویل',
    text: 'وضعیت نهایی، قطعات مصرفی و توصیه سرویس بعدی',
  },
]

export const NOBAT_DEFAULT_TEAM = [
  {
    name: 'مهندس رضایی',
    role: 'تکنسین ارشد منبع لیزر',
    city: 'تهران',
    specialty: 'تعمیر تیوب و کالیبراسیون توان',
  },
  {
    name: 'مهندس کریمی',
    role: 'سرویس سیار',
    city: 'تهران / البرز',
    specialty: 'سرویس دوره‌ای و اپتیک',
  },
  {
    name: 'مهندس موسوی',
    role: 'الکترونیک کنترل',
    city: 'تهران',
    specialty: 'برد کنترل و ایمنی',
  },
]

const TYPE_DEFAULTS = {
  nobat_hero: {
    ...SPACE,
    padding_top: 48,
    padding_bottom: 48,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'مرکز خدمات لیزر صدرا',
    title: 'قطعات، رزرو تعمیر و گزارش سرویس — یکپارچه',
    subtitle:
      'تامین قطعات دستگاه‌های لیزر، رزرو نوبت طبق ضوابط مرکز، و پیگیری اینکه چه کسی رفته و چه مراحلی طی شده است.',
    primary_label: 'رزرو نوبت تعمیر',
    primary_href: '/repairs',
    secondary_label: 'فروشگاه قطعات',
    secondary_href: '/shop',
    tertiary_label: 'پیگیری سرویس',
    tertiary_href: '/repairs?tab=track',
    badge_a: 'تامین قطعه',
    badge_b: 'رزرو آنلاین',
    badge_c: 'گزارش تکنسین',
    max_width: 1120,
  },
  nobat_pillars: {
    ...SPACE,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'ظرفیت صدرا',
    title: 'چهار ستون خدمات مرکز',
    subtitle: 'از انبار قطعه تا گزارش نهایی تعمیر، همه در یک سامانه',
    items: NOBAT_DEFAULT_PILLARS,
    max_width: 1120,
  },
  nobat_parts: {
    ...SPACE,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'انبار قطعات',
    title: 'تامین و فروش قطعات دستگاه لیزر',
    subtitle: 'دسته‌های پرکاربرد برای نگهداشت و تعمیر تخصصی',
    cta_label: 'ورود به فروشگاه',
    cta_href: '/shop',
    items: NOBAT_DEFAULT_PARTS,
    max_width: 1120,
  },
  nobat_search: {
    ...SPACE,
    padding_top: 8,
    padding_bottom: 8,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: '',
    title: '',
    subtitle: '',
    placeholder: 'جستجوی قطعه، برند یا مدل دستگاه…',
    submit_label: '',
    results_href: '/shop',
    hint: 'تیوب · لنز · چیلر · برد کنترل',
    max_width: 720,
  },
  nobat_process: {
    ...SPACE,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'فرآیند سرویس',
    title: 'مسیر تعمیر از رزرو تا گزارش',
    subtitle: 'طبق ضوابط مرکز صدرا، هر مرحله ثبت و قابل پیگیری است',
    steps: NOBAT_DEFAULT_STEPS,
    max_width: 1120,
  },
  nobat_book: {
    ...SPACE,
    padding_top: 20,
    padding_bottom: 20,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'نوبت‌دهی',
    title: 'رزرو نوبت تعمیر دستگاه لیزر',
    subtitle: 'عیب‌یابی، تعمیر اپتیک، سرویس دوره‌ای و کالیبراسیون',
    primary_label: 'شروع رزرو',
    primary_href: '/repairs',
    secondary_label: 'پیگیری نوبت',
    secondary_href: '/repairs?tab=track',
    max_width: 1120,
  },
  nobat_team: {
    ...SPACE,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'تیم فنی',
    title: 'تعمیرکارانی که سرویس را انجام می‌دهند',
    subtitle: 'در گزارش هر سفارش می‌بینید چه کسی رفته و چه تخصصی داشته',
    items: NOBAT_DEFAULT_TEAM,
    max_width: 1120,
  },
  nobat_report: {
    ...SPACE,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'گزارش تعمیر',
    title: 'پیگیری وضعیت، تکنسین و مراحل طی‌شده',
    subtitle:
      'با کد سفارش ببینید دستگاه در چه مرحله‌ای است، چه قطعه‌ای مصرف شده و نتیجه نهایی چیست.',
    primary_label: 'پیگیری سرویس',
    primary_href: '/repairs#track',
    secondary_label: 'ثبت درخواست جدید',
    secondary_href: '/repairs',
    points: [
      'نام تکنسین اعزامی',
      'مراحل عیب‌یابی و تعمیر',
      'قطعات مصرفی و اجرت',
      'توصیه سرویس بعدی',
    ],
    max_width: 1120,
  },
  nobat_closing: {
    ...SPACE,
    padding_top: 40,
    padding_bottom: 40,
    show_on_mobile: true,
    show_on_desktop: true,
    eyebrow: 'صدرا',
    title: 'آماده همکاری برای نگهداشت دستگاه‌های لیزر شما',
    subtitle: 'قطعه بخرید، نوبت بگیرید، سرویس را تا گزارش نهایی دنبال کنید',
    primary_label: 'رزرو تعمیر',
    primary_href: '/repairs',
    secondary_label: 'مشاوره قطعات',
    secondary_href: '/#contact',
    max_width: 900,
  },
}

export function getNobatTypeDefaults(type = 'nobat_hero') {
  return { ...(TYPE_DEFAULTS[type] || TYPE_DEFAULTS.nobat_hero) }
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

export function normalizeNobatWidgetSettings(raw = {}, type = 'nobat_hero') {
  const base = getNobatTypeDefaults(type)
  const src = raw && typeof raw === 'object' ? raw : {}
  const s = { ...base, ...src }

  s.show_on_mobile = src.show_on_mobile === undefined ? true : !!src.show_on_mobile
  s.show_on_desktop = src.show_on_desktop === undefined ? true : !!src.show_on_desktop

  ;[
    'eyebrow',
    'title',
    'subtitle',
    'primary_label',
    'primary_href',
    'secondary_label',
    'secondary_href',
    'tertiary_label',
    'tertiary_href',
    'cta_label',
    'cta_href',
    'badge_a',
    'badge_b',
    'badge_c',
    'placeholder',
    'submit_label',
    'results_href',
    'hint',
  ].forEach((k) => {
    if (src[k] !== undefined) s[k] = String(src[k] ?? '').trim()
  })

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
    s[k] = pxNum(s[k], base[k] || 0, k.startsWith('padding') ? 200 : 120)
  })

  s.max_width = Math.max(320, Math.min(1400, pxNum(s.max_width, base.max_width || 1120, 1400)))

  if (Array.isArray(src.items) && src.items.length) s.items = src.items
  if (Array.isArray(src.steps) && src.steps.length) s.steps = src.steps
  if (Array.isArray(src.points) && src.points.length) {
    s.points = src.points.map((p) => String(p || '').trim()).filter(Boolean)
  }

  return s
}

export function nobatCssVars(settings) {
  const s = settings || {}
  return {
    '--nb-pt': `${s.padding_top ?? 28}px`,
    '--nb-pr': `${s.padding_right ?? 16}px`,
    '--nb-pb': `${s.padding_bottom ?? 28}px`,
    '--nb-pl': `${s.padding_left ?? 16}px`,
    '--nb-mt': `${s.margin_top ?? 0}px`,
    '--nb-mb': `${s.margin_bottom ?? 0}px`,
    '--nb-max': `${s.max_width ?? 1120}px`,
  }
}

export function createDefaultNobatWidgetSettings(type = 'nobat_hero') {
  return getNobatTypeDefaults(type)
}
