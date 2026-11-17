// config/reboWidgetSettings.js — تنظیمات ویجت‌های بخش‌های ربو (دسکتاپ / موبایل جدا)

export const REBO_WIDGET_TYPES = [
  'rebo_hero',
  'rebo_stack',
  'rebo_pillars',
  'rebo_capabilities',
  'rebo_dashboard',
  'rebo_usecases',
  'school_animation',
  'rebo_pricing',
  'rebo_order_steps',
  'rebo_setup_costs',
  'rebo_ops',
  'rebo_cloud_order',
  'rebo_closing',
  'rebo_showcase',
]

export const DEFAULT_REBO_SETUP_COST_ITEMS = [
  {
    id: 'package',
    icon: 'package',
    title: 'بسته سایت',
    amount_label: 'طبق بسته انتخابی',
    text: 'هزینه خودِ سایت همان قیمت بسته‌ای است که انتخاب می‌کنید و از قبل مشخص شده است.',
  },
  {
    id: 'server',
    icon: 'server',
    title: 'سرور و میزبانی',
    amount_label: '۱۰۰٬۰۰۰ تومان / روز',
    text: 'اگر ما میزبان شما باشیم، سرور لینوکسی ابری با ۸ گیگ رم و ۸ هسته CPU با هزینه روزانه ۱۰۰ هزار تومان ارائه می‌شود.',
  },
  {
    id: 'support',
    icon: 'support',
    title: 'پشتیبانی ماهانه',
    amount_label: '۳٬۰۰۰٬۰۰۰ تومان / ماه',
    text: 'در صورت نیاز، پشتیبانی ماهانه ۳ میلیون تومان اضافه می‌شود و شامل آموزش و تغییرات جزئی در طول قرارداد است. اگر قابلیت خاصی بخواهید اضافه شود، ابتدا بررسی و برآورد دقیق و معقول اعلام می‌گردد.',
  },
  {
    id: 'sms',
    icon: 'sms',
    title: 'پیامک',
    amount_label: '۲۵۰ تومان / پیامک',
    text: 'هزینه ارسال پیامک را به ازای هر پیامک ۲۵۰ تومان در نظر بگیرید.',
  },
  {
    id: 'ssl',
    icon: 'ssl',
    title: 'گواهینامه SSL',
    amount_label: 'حدود ۷۰۰٬۰۰۰ تومان / سال برای هر SSL',
    text: 'برای هر سرویس معمولاً دو گواهینامه SSL نیاز است؛ هزینه هر SSL در حال حاضر نزدیک به ۷۰۰ هزار تومان در سال است.',
  },
]

export const DEFAULT_REBO_SETUP_COST_FOOTER =
  'بنابراین سالیانه هزینه اضافه‌ای بابت خودِ سایت پرداخت نخواهید کرد؛ از سال بعد فقط هزینه‌های سرور، پشتیبانی در صورت نیاز، گواهینامه‌ها و پیامک‌ها را خواهید داشت.'

export const DEFAULT_REBO_ORDER_STEPS = [
  {
    id: 'domain',
    title: 'انتخاب دامنه',
    text: 'دامنه اختصاصی کسب‌وکارتان را ثبت کنید — مثلاً از طریق سایت nic.ir.',
    links: [{ label: 'ثبت دامنه در nic.ir', href: 'https://www.nic.ir' }],
  },
  {
    id: 'server',
    title: 'سفارش سرور',
    text: 'اگر دوست دارید ما میزبان شما باشیم، سرور را از ربو سفارش دهید. در غیر این صورت می‌توانید از پارس‌پک یا هر سرویس دیگری یک سرور لینوکسی ابری تهیه کنید.',
    links: [
      { label: 'میزبانی با ربو', href: '/cloud-server' },
      { label: 'پارس‌پک', href: 'https://parspack.com' },
    ],
  },
  {
    id: 'sms',
    title: 'پنل پیامکی',
    text: 'یک پنل پیامکی اختصاصی سفارش دهید، یا گزینه «پنل پیامکی با ما» را انتخاب کنید تا ربو این بخش را برایتان پوشش دهد.',
    links: [{ label: 'هماهنگی پنل پیامکی', href: '/contact' }],
  },
  {
    id: 'consult',
    title: 'جلسه مشاوره رایگان',
    text: 'یک جلسه رایگان برای هماهنگی، شنیدن نیازها و سلیقه شما برگزار می‌کنیم تا مسیر دقیقاً مطابق کسب‌وکارتان شکل بگیرد.',
    links: [{ label: 'درخواست مشاوره', href: '/contact' }],
  },
  {
    id: 'contract',
    title: 'امضای قرارداد',
    text: 'توافقات رسمی، محدوده کار و زمان‌بندی در قرارداد شفاف ثبت می‌شود تا همکاری با خیال راحت شروع شود.',
    links: [],
  },
  {
    id: 'delivery',
    title: 'تحویل سایت',
    text: 'اگر نیازتان در بسته‌های آماده ما باشد، سایت را در کمتر از ۱۰ روز کاری تحویل می‌دهیم. و اصلاً نگران نباشید — حتی اگر نیازتان در بسته‌ها نباشد (که بعید می‌دانیم)، ایده شما را در کمترین زمان ممکن به یک نرم‌افزار ایده‌آل و کاربردی تبدیل می‌کنیم.',
    links: [{ label: 'مشاهده بسته‌ها', href: '/#rebo-cost' }],
  },
  {
    id: 'launch',
    title: 'آماده‌اید؛ شروع کنید',
    text: 'سایتتان آماده است و می‌توانید کار را شروع کنید — تیم ربو کنار شما می‌ماند.',
    links: [{ label: 'ورود به پروفایل', href: '/profile?tab=rebo' }],
  },
]

export const REBO_WIDGET_TYPE_SET = new Set(REBO_WIDGET_TYPES)

export function isReboWidgetType(type) {
  return REBO_WIDGET_TYPE_SET.has(type)
}

export const REBO_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const REBO_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const REBO_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const REBO_COLOR_FIELDS = [
  { key: 'color_bg', label: 'پس‌زمینه سکشن' },
  { key: 'color_ink', label: 'متن اصلی' },
  { key: 'color_muted', label: 'متن فرعی' },
  { key: 'color_accent', label: 'اکسنت / لینک' },
  { key: 'color_cta_bg', label: 'دکمه اصلی — پس‌زمینه' },
  { key: 'color_cta_text', label: 'دکمه اصلی — متن' },
  { key: 'color_surface', label: 'سطح کارت / پنل' },
]

/** کلیدهای مشترک ریشه */
export const REBO_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'brand',
  'headline',
  'title',
  'subtitle',
  'eyebrow',
  'kicker',
  'cta_label',
  'cta_href',
  'secondary_label',
  'secondary_href',
  'show_pricing_calculator',
  'show_cloud_order',
  'show_brand',
  'show_headline',
  'show_title',
  'show_subtitle',
  'show_eyebrow',
  'show_cta',
  'show_secondary_cta',
  'show_devices',
  'show_kicker',
  'show_topics_heading',
  'dial_items',
  /* rebo_usecases */
  'show_sky_brand',
  'sky_brand_text',
  'sky_bulb_color',
  'sky_bulb_hex',
  'show_clouds',
  'show_birds',
  'show_planes',
  'show_city',
  'show_trees',
  'show_buildings',
  'show_road',
  'show_walker',
  'show_checks',
  'show_sky_flash',
  'building_loop_seconds',
  'city_speed_factor',
  'tree_speed_factor',
  'road_speed_factor',
  'cloud_speed_factor',
  'bird_speed_factor',
  'plane_speed_factor',
  'scene_full_page',
  'scene_height',
  'usecase_industries',
  'show_music_btn',
  'music_url',
  'music_label',
  'music_loop',
  'music_volume',
  'order_steps',
  'setup_cost_items',
  'setup_cost_footer',
])

/** کلیدهای وابسته به ویوپورت */
export const REBO_VIEWPORT_KEYS = [
  'section_full',
  'align',
  'max_width',
  'gap',
  'show_laptop',
  'show_phone',
  'device_scale',
  'scene_full_page',
  'scene_height',
  ...REBO_SPACE_FIELDS.map((f) => f.key),
  ...REBO_MARGIN_FIELDS.map((f) => f.key),
  ...REBO_COLOR_FIELDS.map((f) => f.key),
]

export const REBO_ALIGNS = [
  { id: 'center', label: 'وسط' },
  { id: 'start', label: 'شروع' },
  { id: 'end', label: 'پایان' },
]

const BASE_DEFAULTS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: true,
  align: 'center',
  max_width: 1080,
  gap: 16,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  color_bg: '',
  color_ink: '',
  color_muted: '',
  color_accent: '',
  color_cta_bg: '',
  color_cta_text: '',
  color_surface: '',
  show_brand: true,
  show_headline: true,
  show_title: true,
  show_subtitle: true,
  show_eyebrow: true,
  eyebrow: '',
  show_cta: true,
  show_secondary_cta: true,
  show_devices: true,
  show_laptop: true,
  show_phone: true,
  show_kicker: true,
  show_topics_heading: true,
  device_scale: 100,
  brand: 'ربو',
  headline: 'موتوری برای ساخت سامانه اختصاصی شما',
  title: '',
  subtitle: 'سریع، مینیمال و دقیقاً مطابق کسب‌وکارتان.',
  kicker: '',
  cta_label: 'شروع همکاری',
  cta_href: '/contact',
  secondary_label: 'برآورد هزینه',
  secondary_href: '#rebo-cost',
  show_pricing_calculator: true,
  show_cloud_order: true,
  dial_items: [],
}

const TYPE_DEFAULTS = {
  rebo_hero: {
    ...BASE_DEFAULTS,
    title: '',
    kicker: '',
    padding_top: 72,
    padding_bottom: 0,
  },
  rebo_stack: {
    ...BASE_DEFAULTS,
    eyebrow: 'استک فنی',
    title: 'استک فنی ربو',
    subtitle: 'هر لایه با ابزار مناسب خودش — از هسته پایتون تا داشبورد مدیریت.',
    show_eyebrow: true,
    show_title: true,
    show_subtitle: true,
    padding_top: 40,
    padding_bottom: 40,
  },
  rebo_pillars: {
    ...BASE_DEFAULTS,
    title: 'یک هسته. بی‌نهایت چهره.',
    subtitle: 'سامانه‌ای که با رشد کسب‌وکارتان شکل می‌گیرد.',
    headline: '',
    padding_top: 64,
    padding_bottom: 64,
  },
  rebo_capabilities: {
    ...BASE_DEFAULTS,
    title: 'امکانات روی یک موتور',
    subtitle: 'هر آنچه برای راه‌اندازی سامانه حرفه‌ای نیاز دارید.',
    headline: '',
    padding_top: 64,
    padding_bottom: 64,
  },
  rebo_dashboard: {
    ...BASE_DEFAULTS,
    title: 'مدیریت، به سادگی یک محصول',
    subtitle: 'اسکلت داشبورد هر سیستم را ببینید — تمیز و آماده کار.',
    kicker: 'داشبورد',
    headline: '',
    padding_top: 64,
    padding_bottom: 64,
  },
  rebo_usecases: {
    ...BASE_DEFAULTS,
    title: '',
    subtitle: '',
    headline: '',
    show_headline: false,
    show_subtitle: false,
    color_bg: '',
    color_ink: '',
    color_muted: '',
    max_width: 0,
    padding_top: 0,
    padding_bottom: 0,
    padding_left: 0,
    padding_right: 0,
    margin_top: 0,
    margin_bottom: 0,
    margin_left: 0,
    margin_right: 0,
    show_sky_brand: true,
    sky_brand_text: 'REBO.IR',
    sky_bulb_color: 'custom',
    sky_bulb_hex: '#e11d48',
    show_clouds: true,
    show_birds: true,
    show_planes: true,
    show_city: true,
    show_trees: true,
    show_buildings: true,
    show_road: true,
    show_walker: true,
    show_checks: true,
    show_sky_flash: true,
    building_loop_seconds: 14,
    city_speed_factor: 32,
    tree_speed_factor: 55,
    road_speed_factor: 100,
    cloud_speed_factor: 100,
    bird_speed_factor: 100,
    plane_speed_factor: 100,
    scene_full_page: true,
    scene_height: 380,
    usecase_industries: [
      { id: 'salon', label: 'آرایشگاه' },
      { id: 'clinic', label: 'مطب' },
      { id: 'restaurant', label: 'رستوران' },
      { id: 'shop', label: 'فروشگاه' },
      { id: 'company', label: 'شرکت' },
      { id: 'school', label: 'آموزشگاه' },
    ],
    show_music_btn: true,
    music_url: '',
    music_label: 'پخش موسیقی',
    music_loop: true,
    music_volume: 70,
  },
  school_animation: {
    ...BASE_DEFAULTS,
    title: '',
    subtitle: '',
    headline: '',
    show_headline: false,
    show_subtitle: false,
    color_bg: '',
    color_ink: '',
    color_muted: '',
    max_width: 0,
    padding_top: 0,
    padding_bottom: 0,
    padding_left: 0,
    padding_right: 0,
    margin_top: 0,
    margin_bottom: 0,
    margin_left: 0,
    margin_right: 0,
    show_sky_brand: true,
    sky_brand_text: 'REBO.IR',
    sky_bulb_color: 'custom',
    sky_bulb_hex: '#e11d48',
    show_clouds: true,
    show_birds: true,
    show_planes: true,
    show_city: true,
    show_trees: true,
    show_buildings: true,
    show_road: true,
    show_walker: true,
    show_checks: true,
    show_sky_flash: true,
    building_loop_seconds: 14,
    city_speed_factor: 32,
    tree_speed_factor: 55,
    road_speed_factor: 100,
    cloud_speed_factor: 100,
    bird_speed_factor: 100,
    plane_speed_factor: 100,
    scene_full_page: true,
    scene_height: 380,
    usecase_industries: [
      { id: 'salon', label: '' },
      { id: 'clinic', label: '' },
      { id: 'school', label: 'مدرسه آسمان علم' },
      { id: 'shop', label: '' },
      { id: 'company', label: '' },
      { id: 'restaurant', label: '' },
    ],
    show_music_btn: true,
    music_url: '',
    music_label: 'پخش موسیقی',
    music_loop: true,
    music_volume: 70,
    show_checks: false,
  },
  rebo_pricing: {
    ...BASE_DEFAULTS,
    title: 'بسته را انتخاب کنید — یک کلیک تا سفارش',
    subtitle: 'جمع لحظه‌ای؛ ثبت در پروفایل کاربری و پیگیری توسط تیم ربو.',
    kicker: 'برآورد و سفارش',
    cta_label: 'ثبت سفارش در پروفایل',
    cta_href: '/profile?tab=rebo',
    headline: '',
    show_kicker: true,
    show_title: true,
    show_subtitle: true,
    show_topics_heading: true,
    padding_top: 64,
    padding_bottom: 64,
  },
  rebo_order_steps: {
    ...BASE_DEFAULTS,
    title: 'از سفارش تا تحویل — گام‌به‌گام با ربو',
    subtitle:
      'مسیر شفاف راه‌اندازی سایت اختصاصی؛ از دامنه و سرور تا مشاوره، قرارداد و شروع کار.',
    kicker: 'مراحل سفارش',
    headline: '',
    show_kicker: true,
    show_title: true,
    show_subtitle: true,
    padding_top: 64,
    padding_bottom: 64,
    order_steps: DEFAULT_REBO_ORDER_STEPS.map((row) => ({
      ...row,
      links: (row.links || []).map((l) => ({ ...l })),
    })),
  },
  rebo_setup_costs: {
    ...BASE_DEFAULTS,
    title: 'هزینه‌های راه‌اندازی با ربو',
    subtitle:
      'شفاف و قابل پیش‌بینی: بسته سایت، سرور، پشتیبانی، پیامک و گواهینامه SSL.',
    kicker: 'هزینه‌های راه‌اندازی',
    headline: '',
    show_kicker: true,
    show_title: true,
    show_subtitle: true,
    padding_top: 64,
    padding_bottom: 64,
    setup_cost_items: DEFAULT_REBO_SETUP_COST_ITEMS.map((row) => ({ ...row })),
    setup_cost_footer: DEFAULT_REBO_SETUP_COST_FOOTER,
  },
  rebo_ops: {
    ...BASE_DEFAULTS,
    title: 'پشتیبانی',
    subtitle:
      'سه ماه رایگان پس از تحویل؛ سپس پلن ماهانه از مبتدی تا حرفه‌ای. نگران به‌روزرسانی قالب و بک‌اند نباشید.',
    kicker: 'پشتیبانی',
    headline: '',
    padding_top: 64,
    padding_bottom: 64,
  },
  rebo_cloud_order: {
    ...BASE_DEFAULTS,
    title: 'ثبت سفارش سرور ابری اشتراکی',
    subtitle: '',
    kicker: 'سرور ابری ربو',
    headline: '',
    padding_top: 24,
    padding_bottom: 64,
  },
  rebo_closing: {
    ...BASE_DEFAULTS,
    title: 'از ایران تا بازار همسایه و دلار',
    subtitle: 'شروع با بازار داخل؛ بعد کشورهای همسایه و مسیر ارزی — همان موتور، مقیاس بزرگ‌تر.',
    cta_label: 'شروع سفارش',
    cta_href: '#rebo-cost',
    headline: '',
    padding_top: 32,
    padding_bottom: 64,
  },
  rebo_showcase: {
    ...BASE_DEFAULTS,
    show_pricing_calculator: true,
    show_cloud_order: true,
  },
}

export function getReboTypeDefaults(type = 'rebo_hero') {
  return TYPE_DEFAULTS[type] || BASE_DEFAULTS
}

export const DEFAULT_REBO_WIDGET_SETTINGS = { ...BASE_DEFAULTS }

function pxNum(v, fallback, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function str(src, key, defaults) {
  if (Object.prototype.hasOwnProperty.call(src, key)) {
    return String(src[key] ?? '')
  }
  return String(defaults[key] ?? '')
}

function bool(src, key, defaults) {
  if (Object.prototype.hasOwnProperty.call(src, key)) return !!src[key]
  return !!defaults[key]
}

const USECASE_BUILDING_IDS = new Set([
  'salon',
  'clinic',
  'restaurant',
  'shop',
  'company',
  'school',
])

const SKY_BULB_COLORS = new Set(['red', 'green', 'multi', 'custom'])

function hexColor(v, fallback = '#e11d48') {
  const s = String(v || '').trim()
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return s
  return fallback
}

export function normalizeUsecaseIndustries(raw, defaults = []) {
  const fallback =
    Array.isArray(defaults) && defaults.length
      ? defaults
      : getReboTypeDefaults('rebo_usecases').usecase_industries
  if (!Array.isArray(raw) || !raw.length) {
    return fallback.map((row) => ({ ...row }))
  }
  return raw
    .map((row, i) => {
      const idRaw = String(row?.id || fallback[i % fallback.length]?.id || 'shop')
      const id = USECASE_BUILDING_IDS.has(idRaw) ? idRaw : 'shop'
      const label = String(row?.label ?? '').trim()
      return { id, label: label || fallback[i % fallback.length]?.label || id }
    })
    .slice(0, 12)
}

export function normalizeOrderSteps(raw, defaults = DEFAULT_REBO_ORDER_STEPS) {
  const fallback =
    Array.isArray(defaults) && defaults.length
      ? defaults
      : DEFAULT_REBO_ORDER_STEPS
  if (!Array.isArray(raw) || !raw.length) {
    return fallback.map((row) => ({
      id: row.id,
      title: row.title,
      text: row.text,
      links: Array.isArray(row.links)
        ? row.links.map((l) => ({
            label: String(l?.label || '').trim(),
            href: String(l?.href || '').trim(),
          }))
        : [],
    }))
  }
  return raw
    .map((row, i) => {
      const base = fallback[i % fallback.length] || {}
      const linksRaw = Array.isArray(row?.links) ? row.links : base.links || []
      return {
        id: String(row?.id || base.id || `step_${i + 1}`).trim() || `step_${i + 1}`,
        title: String(row?.title ?? base.title ?? '').trim(),
        text: String(row?.text ?? base.text ?? '').trim(),
        links: linksRaw
          .map((l) => ({
            label: String(l?.label || '').trim(),
            href: String(l?.href || '').trim(),
          }))
          .filter((l) => l.label && l.href)
          .slice(0, 4),
      }
    })
    .filter((row) => row.title || row.text)
    .slice(0, 12)
}

const SETUP_COST_ICONS = new Set([
  'package',
  'server',
  'support',
  'sms',
  'ssl',
])

export function normalizeSetupCostItems(
  raw,
  defaults = DEFAULT_REBO_SETUP_COST_ITEMS,
) {
  const fallback =
    Array.isArray(defaults) && defaults.length
      ? defaults
      : DEFAULT_REBO_SETUP_COST_ITEMS
  if (!Array.isArray(raw) || !raw.length) {
    return fallback.map((row) => ({ ...row }))
  }
  return raw
    .map((row, i) => {
      const base = fallback[i % fallback.length] || {}
      const iconRaw = String(row?.icon || base.icon || 'package').trim()
      return {
        id: String(row?.id || base.id || `cost_${i + 1}`).trim() || `cost_${i + 1}`,
        icon: SETUP_COST_ICONS.has(iconRaw) ? iconRaw : 'package',
        title: String(row?.title ?? base.title ?? '').trim(),
        amount_label: String(row?.amount_label ?? base.amount_label ?? '').trim(),
        text: String(row?.text ?? base.text ?? '').trim(),
      }
    })
    .filter((row) => row.title || row.text)
    .slice(0, 12)
}

function pickViewportSlice(settings) {
  const out = {}
  REBO_VIEWPORT_KEYS.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(settings, k)) out[k] = settings[k]
  })
  return out
}

function mergeViewportRaw(root, viewport) {
  const flat = { ...root }
  delete flat.desktop
  delete flat.mobile
  const slice =
    root && typeof root[viewport] === 'object' && root[viewport]
      ? root[viewport]
      : {}
  return { ...flat, ...slice }
}

function coerce(merged, rawRoot, type) {
  const d = getReboTypeDefaults(type)
  const alignIds = new Set(REBO_ALIGNS.map((a) => a.id))
  const align = alignIds.has(merged.align) ? merged.align : d.align

  return {
    show_on_mobile: bool(rawRoot, 'show_on_mobile', d),
    show_on_desktop: bool(rawRoot, 'show_on_desktop', d),

    brand: str(rawRoot, 'brand', d) || d.brand,
    headline: str(rawRoot, 'headline', d),
    title: str(rawRoot, 'title', d),
    subtitle: str(rawRoot, 'subtitle', d),
    eyebrow: str(rawRoot, 'eyebrow', d),
    kicker: str(rawRoot, 'kicker', d),
    cta_label: str(rawRoot, 'cta_label', d) || d.cta_label,
    cta_href: str(rawRoot, 'cta_href', d) || d.cta_href,
    secondary_label: str(rawRoot, 'secondary_label', d),
    secondary_href: str(rawRoot, 'secondary_href', d),

    show_brand: bool(rawRoot, 'show_brand', d),
    show_headline: bool(rawRoot, 'show_headline', d),
    show_title: bool(rawRoot, 'show_title', d),
    show_subtitle: bool(rawRoot, 'show_subtitle', d),
    show_eyebrow: bool(rawRoot, 'show_eyebrow', d),
    show_cta: bool(rawRoot, 'show_cta', d),
    show_secondary_cta: bool(rawRoot, 'show_secondary_cta', d),
    show_devices: bool(rawRoot, 'show_devices', d),
    show_kicker: bool(rawRoot, 'show_kicker', d),
    show_topics_heading: bool(rawRoot, 'show_topics_heading', d),
    show_pricing_calculator: bool(rawRoot, 'show_pricing_calculator', d),
    show_cloud_order: bool(rawRoot, 'show_cloud_order', d),
    dial_items: Array.isArray(rawRoot.dial_items) ? rawRoot.dial_items : [],

    show_sky_brand: bool(rawRoot, 'show_sky_brand', d),
    sky_brand_text: str(rawRoot, 'sky_brand_text', d) || d.sky_brand_text || 'REBO.IR',
    sky_bulb_color: SKY_BULB_COLORS.has(rawRoot.sky_bulb_color)
      ? rawRoot.sky_bulb_color
      : d.sky_bulb_color || 'custom',
    sky_bulb_hex: hexColor(rawRoot.sky_bulb_hex, d.sky_bulb_hex || '#e11d48'),
    show_clouds: bool(rawRoot, 'show_clouds', d),
    show_birds: bool(rawRoot, 'show_birds', d),
    show_planes: bool(rawRoot, 'show_planes', d),
    show_city: bool(rawRoot, 'show_city', d),
    show_trees: bool(rawRoot, 'show_trees', d),
    show_buildings: bool(rawRoot, 'show_buildings', d),
    show_road: bool(rawRoot, 'show_road', d),
    show_walker: bool(rawRoot, 'show_walker', d),
    show_checks: bool(rawRoot, 'show_checks', d),
    show_sky_flash: bool(rawRoot, 'show_sky_flash', d),
    building_loop_seconds: Math.max(
      6,
      Math.min(60, pxNum(rawRoot.building_loop_seconds, d.building_loop_seconds || 14, 60)),
    ),
    city_speed_factor: Math.max(
      5,
      Math.min(200, pxNum(rawRoot.city_speed_factor, d.city_speed_factor || 32, 200)),
    ),
    tree_speed_factor: Math.max(
      5,
      Math.min(200, pxNum(rawRoot.tree_speed_factor, d.tree_speed_factor || 55, 200)),
    ),
    road_speed_factor: Math.max(
      5,
      Math.min(200, pxNum(rawRoot.road_speed_factor, d.road_speed_factor || 100, 200)),
    ),
    cloud_speed_factor: Math.max(
      5,
      Math.min(200, pxNum(rawRoot.cloud_speed_factor, d.cloud_speed_factor || 100, 200)),
    ),
    bird_speed_factor: Math.max(
      5,
      Math.min(200, pxNum(rawRoot.bird_speed_factor, d.bird_speed_factor || 100, 200)),
    ),
    plane_speed_factor: Math.max(
      5,
      Math.min(200, pxNum(rawRoot.plane_speed_factor, d.plane_speed_factor || 100, 200)),
    ),
    scene_full_page:
      type === 'rebo_usecases' || type === 'school_animation'
        ? rawRoot.scene_full_page !== false && merged.scene_full_page !== false
        : bool(merged, 'scene_full_page', d),
    scene_height: Math.max(
      200,
      Math.min(1400, pxNum(merged.scene_height, d.scene_height || 380, 1400)),
    ),
    usecase_industries: normalizeUsecaseIndustries(
      rawRoot.usecase_industries,
      d.usecase_industries,
    ),
    order_steps: normalizeOrderSteps(
      rawRoot.order_steps,
      d.order_steps || DEFAULT_REBO_ORDER_STEPS,
    ),
    setup_cost_items: normalizeSetupCostItems(
      rawRoot.setup_cost_items,
      d.setup_cost_items || DEFAULT_REBO_SETUP_COST_ITEMS,
    ),
    setup_cost_footer:
      Object.prototype.hasOwnProperty.call(rawRoot, 'setup_cost_footer')
        ? String(rawRoot.setup_cost_footer ?? '')
        : String(d.setup_cost_footer ?? DEFAULT_REBO_SETUP_COST_FOOTER),
    show_music_btn: bool(rawRoot, 'show_music_btn', d),
    music_url: str(rawRoot, 'music_url', d),
    music_label: (() => {
      const raw =
        str(rawRoot, 'music_label', d) || d.music_label || 'پخش موسیقی'
      if (
        raw === 'PLAY' ||
        raw === 'play' ||
        raw === 'گوش کنید'
      ) {
        return 'پخش موسیقی'
      }
      return raw
    })(),
    music_loop: bool(rawRoot, 'music_loop', d),
    music_volume: Math.max(
      0,
      Math.min(100, pxNum(rawRoot.music_volume, d.music_volume ?? 70, 100)),
    ),

    section_full: bool(merged, 'section_full', d),
    align,
    max_width:
      type === 'rebo_usecases' || type === 'school_animation'
        ? Math.max(0, Math.min(1600, pxNum(merged.max_width, d.max_width, 1600)))
        : Math.max(
            320,
            Math.min(1600, pxNum(merged.max_width, d.max_width, 1600)),
          ),
    gap: Math.max(0, Math.min(64, pxNum(merged.gap, d.gap, 64))),
    show_laptop: bool(merged, 'show_laptop', d),
    show_phone: bool(merged, 'show_phone', d),
    device_scale: Math.max(
      60,
      Math.min(140, pxNum(merged.device_scale, d.device_scale, 140)),
    ),

    padding_top: pxNum(merged.padding_top, d.padding_top),
    padding_right: pxNum(merged.padding_right, d.padding_right),
    padding_bottom: pxNum(merged.padding_bottom, d.padding_bottom),
    padding_left: pxNum(merged.padding_left, d.padding_left),
    margin_top: pxNum(merged.margin_top, d.margin_top),
    margin_right: pxNum(merged.margin_right, d.margin_right),
    margin_bottom: pxNum(merged.margin_bottom, d.margin_bottom),
    margin_left: pxNum(merged.margin_left, d.margin_left),

    color_bg: str(merged, 'color_bg', d),
    color_ink: str(merged, 'color_ink', d),
    color_muted: str(merged, 'color_muted', d),
    color_accent: str(merged, 'color_accent', d),
    color_cta_bg: str(merged, 'color_cta_bg', d),
    color_cta_text: str(merged, 'color_cta_text', d),
    color_surface: str(merged, 'color_surface', d),
  }
}

/**
 * @param {object} raw
 * @param {string} [type]
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function normalizeReboWidgetSettings(
  raw,
  type = 'rebo_hero',
  opts = {},
) {
  let widgetType = type
  let options = opts
  if (type && typeof type === 'object' && !Array.isArray(type)) {
    options = type
    widgetType = options.type || 'rebo_hero'
  }
  const viewport = options.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeViewportRaw(root, viewport)
  return coerce(merged, root, widgetType)
}

export function getReboVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotReboViewportSettings(
  raw = {},
  viewport = 'desktop',
  type = 'rebo_hero',
) {
  return pickViewportSlice(
    normalizeReboWidgetSettings(raw, type, { viewport }),
  )
}

export function buildReboViewportPatch(raw, device, key, value, type) {
  if (REBO_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotReboViewportSettings(root, vp, type)
  return { [vp]: { ...current, [key]: value } }
}

export function reboWidgetSectionStyle(settings) {
  const s = settings || BASE_DEFAULTS
  const style = {
    paddingTop: `${s.padding_top || 0}px`,
    paddingRight: `${s.padding_right || 0}px`,
    paddingBottom: `${s.padding_bottom || 0}px`,
    paddingLeft: `${s.padding_left || 0}px`,
    marginTop: `${s.margin_top || 0}px`,
    marginRight: `${s.margin_right || 0}px`,
    marginBottom: `${s.margin_bottom || 0}px`,
    marginLeft: `${s.margin_left || 0}px`,
    textAlign: s.align || 'center',
  }
  if (s.color_bg) style.background = s.color_bg
  if (s.color_ink) {
    style.color = s.color_ink
    style['--rebo-ink'] = s.color_ink
  }
  if (s.color_muted) style['--rebo-muted'] = s.color_muted
  if (s.color_accent) style['--rebo-blue'] = s.color_accent
  if (s.color_cta_bg) style['--rebo-cta-bg'] = s.color_cta_bg
  if (s.color_cta_text) style['--rebo-cta-text'] = s.color_cta_text
  if (s.color_surface) style['--rebo-surface'] = s.color_surface
  if (s.max_width) style['--rebo-max'] = `${s.max_width}px`
  if (s.gap != null) style['--rebo-gap'] = `${s.gap}px`
  if (s.device_scale) style['--rebo-device-scale'] = s.device_scale / 100
  return style
}

/** فیلدهای محتوای قابل ویرایش بر اساس نوع ویجت */
export function reboContentFieldsForType(type) {
  switch (type) {
    case 'rebo_hero':
      return [
        'brand',
        'headline',
        'subtitle',
        'cta_label',
        'cta_href',
        'secondary_label',
        'secondary_href',
      ]
    case 'rebo_pillars':
    case 'rebo_capabilities':
      return ['title', 'subtitle']
    case 'rebo_usecases':
    case 'school_animation':
      return ['title', 'subtitle']
    case 'rebo_dashboard':
    case 'rebo_ops':
    case 'rebo_pricing':
    case 'rebo_order_steps':
    case 'rebo_setup_costs':
    case 'rebo_cloud_order':
      return ['kicker', 'title', 'subtitle', 'cta_label', 'cta_href']
    case 'rebo_closing':
      return ['brand', 'title', 'subtitle', 'cta_label', 'cta_href']
    case 'rebo_showcase':
      return [
        'brand',
        'headline',
        'subtitle',
        'cta_label',
        'cta_href',
        'show_pricing_calculator',
        'show_cloud_order',
      ]
    case 'rebo_stack':
      return ['eyebrow', 'title', 'subtitle']
    default:
      return []
  }
}

export function createDefaultReboWidgetSettings(type = 'rebo_hero') {
  return { ...getReboTypeDefaults(type) }
}
