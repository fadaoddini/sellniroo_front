// config/reboPricing.js — بسته‌های موضوعی + ویجت‌های تکی برای برآورد هزینه (ریال)
import {
  PAGE_BUILDER_WIDGETS,
  WIDGET_CATEGORIES,
} from '@/config/pageBuilderWidgets'

/** قیمت پیش‌فرض ویجت‌های تکی خارج از بسته — رایگان مگر جدا قیمت‌گذاری شود */
const CATEGORY_DEFAULT_PRICE = {
  breaking: 0,
  menus: 0,
  corporate: 0,
  hero: 0,
  jobs: 0,
  booking: 0,
  shop: 0,
  news: 0,
  sales: 0,
  video: 0,
  catalog: 0,
  footer: 0,
  about: 0,
  quiz: 0,
  faq: 0,
  school: 0,
  softapps: 0,
  repairs: 0,
  nav: 0,
  extra: 0,
  tools: 0,
  platform: 0,
}

const SKIP_TYPES = new Set([
  'rebo_showcase',
  'rebo_hero',
  'rebo_stack',
  'rebo_pillars',
  'rebo_capabilities',
  'rebo_dashboard',
  'rebo_usecases',
  'rebo_pricing',
  'rebo_ops',
  'rebo_cloud_order',
  'rebo_closing',
  'news_article',
  'news_page',
  'job_article',
  'product_article',
  'shop_page',
  'repairs_page',
  'apps_page',
  'booking_page',
  'about_page',
  'profile_page',
  'contact_page',
  'quiz_page',
  'sale_page',
])

export const DEFAULT_SUPPORT = {
  free_months: 3,
  monthly_price: 2_500_000,
  currency_label: 'تومان',
  title: 'پشتیبانی پس از تحویل',
  desc: 'پس از سفارش و تحویل نهایی، چند ماه پشتیبانی رایگان دارید؛ بعد از آن هزینه ماهانه اعمال می‌شود.',
  notes: '',
}

export const DEFAULT_CLOUD_SERVER = {
  enabled: true,
  daily_price: 75_000,
  currency_label: 'تومان',
  title: 'سرور ابری اشتراکی',
  desc: 'اگر سرور اختصاصی نمی‌خواهید، می‌توانید از سرور ابری ما استفاده کنید — هزینه روزانه.',
  specs: [
    { id: 'ram', label: 'رم', value: '۸ گیگابایت' },
    { id: 'cpu', label: 'پردازنده', value: '۸ هسته' },
    { id: 'storage', label: 'فضای ذخیره‌سازی', value: 'قابل تنظیم' },
    { id: 'bandwidth', label: 'ترافیک', value: 'منصفانه / نامحدود نسبی' },
  ],
  notes:
    'هزینه روزانه از اعتبار کسر می‌شود. ثبت سفارش از بخش سرور ابری در قالب ربو.',
}

export const DEFAULT_CUSTOMER_SERVICES = [
  {
    id: 'sms',
    name: 'پیامک',
    desc: 'ارسال پیامک احراز هویت و اطلاع‌رسانی',
    price: 0,
    unit: 'بر اساس تعرفه پنل پیامک مشتری',
    note: 'بر عهده مشتری',
    enabled: true,
  },
  {
    id: 'neshan',
    name: 'نقشه نشان',
    desc: 'سرویس نقشه و مکان‌یابی نشان',
    price: 0,
    unit: 'طبق تعرفه نشان / اشتراک مشتری',
    note: 'بر عهده مشتری',
    enabled: true,
  },
]

export const DEFAULT_REBO_PRICING = {
  currency_label: 'ریال',
  packages: [],
  items: [],
  support: { ...DEFAULT_SUPPORT },
  cloud_server: { ...DEFAULT_CLOUD_SERVER, specs: [...DEFAULT_CLOUD_SERVER.specs] },
  customer_services: DEFAULT_CUSTOMER_SERVICES.map((s) => ({ ...s })),
}

export function newServiceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `svc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function newPackageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `pkg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function buildDefaultReboPricingItems() {
  return PAGE_BUILDER_WIDGETS.filter(
    (w) =>
      w.status === 'ready' &&
      !SKIP_TYPES.has(w.type) &&
      !(w.moduleKey && String(w.moduleKey).startsWith('data_pack_')),
  ).map((w) => ({
    type: w.type,
    label: w.label,
    desc: w.desc || '',
    icon: w.icon || 'Boxes',
    category: w.category || '',
    price: CATEGORY_DEFAULT_PRICE[w.category] ?? 10_000_000,
    enabled: true,
  }))
}

/** کاتالوگ ویجت‌های قابل افزودن به بسته */
export function listCatalogWidgets() {
  return buildDefaultReboPricingItems().map(
    ({ type, label, desc, icon, category }) => ({
      type,
      label,
      desc,
      icon,
      category,
    }),
  )
}

export function widgetTypesByCategory(categoryId) {
  return listCatalogWidgets()
    .filter((w) => w.category === categoryId)
    .map((w) => w.type)
}

export function normalizePackage(raw = {}, index = 0) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const id = String(src.id || '').trim() || newPackageId()
  const widgetTypes = Array.isArray(src.widget_types)
    ? [
        ...new Set(
          src.widget_types
            .map((t) => String(t || '').trim())
            .filter(Boolean),
        ),
      ]
    : []
  const features = Array.isArray(src.features)
    ? src.features.map((f) => String(f || '').trim()).filter(Boolean)
    : []
  return {
    id,
    name: String(src.name || '').trim() || `موضوع ${index + 1}`,
    desc: String(src.desc || '').trim(),
    icon: String(src.icon || 'Boxes').trim() || 'Boxes',
    price: Math.max(0, Math.round(Number(src.price) || 0)),
    enabled: src.enabled === false ? false : true,
    widget_types: widgetTypes,
    features,
    discount: normalizePackageDiscount(src.discount),
    sort: Math.round(Number(src.sort) || index),
  }
}

export function normalizePackageDiscount(raw = {}) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const type = src.type === 'amount' ? 'amount' : 'percent'
  let percent = Math.max(0, Math.min(100, Math.round(Number(src.percent) || 0)))
  let amount = Math.max(0, Math.round(Number(src.amount) || 0))
  const endsAt = String(src.ends_at || '').trim()
  return {
    enabled: !!src.enabled,
    type,
    percent,
    amount,
    duration_days: Math.max(0, Math.round(Number(src.duration_days) || 0)),
    ends_at: endsAt,
    label: String(src.label || '').trim(),
  }
}

/** وضعیت تخفیف فعال و قیمت نهایی موضوع */
export function getPackagePriceInfo(pkg, now = Date.now()) {
  const original = Math.max(0, Math.round(Number(pkg?.price) || 0))
  const d = normalizePackageDiscount(pkg?.discount)
  const endsMs = d.ends_at ? Date.parse(d.ends_at) : NaN
  const hasEnd = Number.isFinite(endsMs)
  const active =
    !!d.enabled &&
    hasEnd &&
    endsMs > now &&
    ((d.type === 'percent' && d.percent > 0) ||
      (d.type === 'amount' && d.amount > 0))

  let finalPrice = original
  let saved = 0
  let percent = 0
  if (active) {
    if (d.type === 'amount') {
      saved = Math.min(original, d.amount)
      finalPrice = Math.max(0, original - saved)
      percent =
        original > 0 ? Math.round((saved / original) * 100) : 0
    } else {
      percent = d.percent
      saved = Math.round((original * percent) / 100)
      finalPrice = Math.max(0, original - saved)
    }
  }

  return {
    original,
    finalPrice: active ? finalPrice : original,
    saved: active ? saved : 0,
    percent: active ? percent : 0,
    active,
    endsAt: hasEnd ? new Date(endsMs) : null,
    remainingMs: active ? Math.max(0, endsMs - now) : 0,
    label: d.label || (active ? `${percent}٪ تخفیف` : ''),
    discount: d,
  }
}

/** شروع تخفیف از الان تا N روز بعد */
export function startDiscountForDays(discount = {}, days = 7) {
  const d = normalizePackageDiscount(discount)
  const n = Math.max(1, Number(days) || 7)
  const ms = n * 24 * 60 * 60 * 1000
  return {
    ...d,
    enabled: true,
    duration_days: n,
    ends_at: new Date(Date.now() + ms).toISOString(),
  }
}

export function splitRemaining(ms) {
  const total = Math.max(0, Math.floor(Number(ms) || 0))
  const sec = Math.floor(total / 1000)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60
  return { days, hours, minutes, seconds, total }
}

/** برچسب امکانات قابل‌نمایش برای مخاطب — features سفارشی یا نام ویجت‌ها */
export function getPackageFeatureLabels(pkg, catalog = null) {
  const features = Array.isArray(pkg?.features)
    ? pkg.features.map((f) => String(f || '').trim()).filter(Boolean)
    : []
  if (features.length) return features
  const cat = catalog || listCatalogWidgets()
  const byType = new Map(cat.map((w) => [w.type, w.label]))
  return (pkg?.widget_types || [])
    .map((t) => byType.get(t) || t)
    .filter(Boolean)
}

export function normalizeReboPricing(raw = {}) {
  const root = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const currency =
    String(root.currency_label || 'ریال').trim() || 'ریال'
  const catalog = buildDefaultReboPricingItems()
  const byType = new Map(
    (Array.isArray(root.items) ? root.items : [])
      .filter((it) => it && typeof it === 'object' && it.type)
      .map((it) => [String(it.type), it]),
  )

  const items = catalog.map((base) => {
    const saved = byType.get(base.type)
    if (!saved) return { ...base }
    const price = Math.max(0, Math.round(Number(saved.price) || 0))
    return {
      ...base,
      label: String(saved.label || base.label).trim() || base.label,
      desc: String(saved.desc ?? base.desc).trim(),
      icon: String(saved.icon || base.icon).trim() || base.icon,
      category: String(saved.category || base.category).trim(),
      price,
      enabled: saved.enabled === false ? false : true,
    }
  })

  byType.forEach((saved, type) => {
    if (items.some((it) => it.type === type)) return
    items.push({
      type,
      label: String(saved.label || type).trim(),
      desc: String(saved.desc || '').trim(),
      icon: String(saved.icon || 'Boxes').trim() || 'Boxes',
      category: String(saved.category || 'extra').trim(),
      price: Math.max(0, Math.round(Number(saved.price) || 0)),
      enabled: saved.enabled === false ? false : true,
    })
  })

  const packages = (Array.isArray(root.packages) ? root.packages : [])
    .filter((p) => p && typeof p === 'object')
    .map((p, i) => normalizePackage(p, i))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))

  return {
    currency_label: currency,
    packages,
    items,
    support: normalizeSupport(root.support),
    cloud_server: normalizeCloudServer(root.cloud_server),
    customer_services: normalizeCustomerServices(root.customer_services),
  }
}

export function normalizeSupport(raw = {}) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  return {
    free_months: Math.max(0, Math.round(Number(src.free_months) || 0)),
    monthly_price: Math.max(0, Math.round(Number(src.monthly_price) || 0)),
    currency_label:
      String(src.currency_label || DEFAULT_SUPPORT.currency_label).trim() ||
      'تومان',
    title: String(src.title || DEFAULT_SUPPORT.title).trim() || DEFAULT_SUPPORT.title,
    desc: String(src.desc ?? DEFAULT_SUPPORT.desc).trim(),
    notes: String(src.notes || '').trim(),
  }
}

export function normalizeCloudServer(raw = {}) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const defaultSpecs = DEFAULT_CLOUD_SERVER.specs
  const specsRaw = Array.isArray(src.specs) ? src.specs : null
  const specs = (specsRaw && specsRaw.length ? specsRaw : defaultSpecs)
    .filter((s) => s && typeof s === 'object')
    .map((s, i) => ({
      id: String(s.id || `spec_${i}`).trim() || `spec_${i}`,
      label: String(s.label || '').trim() || `مشخصه ${i + 1}`,
      value: String(s.value || '').trim(),
    }))
  return {
    enabled: src.enabled === false ? false : true,
    daily_price: Math.max(0, Math.round(Number(src.daily_price) || 0)),
    currency_label:
      String(src.currency_label || DEFAULT_CLOUD_SERVER.currency_label).trim() ||
      'تومان',
    title:
      String(src.title || DEFAULT_CLOUD_SERVER.title).trim() ||
      DEFAULT_CLOUD_SERVER.title,
    desc: String(src.desc ?? DEFAULT_CLOUD_SERVER.desc).trim(),
    specs,
    notes: String(src.notes || DEFAULT_CLOUD_SERVER.notes || '').trim(),
  }
}

export function normalizeCustomerServices(raw) {
  const list = Array.isArray(raw) ? raw : DEFAULT_CUSTOMER_SERVICES
  if (!list.length) {
    return DEFAULT_CUSTOMER_SERVICES.map((s) => ({ ...s }))
  }
  return list
    .filter((s) => s && typeof s === 'object')
    .map((s, i) => ({
      id: String(s.id || newServiceId()).trim() || newServiceId(),
      name: String(s.name || `خدمت ${i + 1}`).trim(),
      desc: String(s.desc || '').trim(),
      price: Math.max(0, Math.round(Number(s.price) || 0)),
      unit: String(s.unit || '').trim(),
      note: String(s.note || 'بر عهده مشتری').trim() || 'بر عهده مشتری',
      enabled: s.enabled === false ? false : true,
    }))
}

export function formatMoney(n, currency = 'تومان') {
  return `${formatRial(n)} ${currency}`
}

export function cloudMonthlyEstimate(dailyPrice) {
  return Math.max(0, Math.round(Number(dailyPrice) || 0) * 30)
}

/** ویجت‌هایی که داخل حداقل یک بستهٔ فعال هستند — قیمت تکی‌شان در ماشین‌حساب نشان داده نمی‌شود */
export function getCoveredWidgetTypes(packages = []) {
  const set = new Set()
  ;(packages || []).forEach((pkg) => {
    if (!pkg || pkg.enabled === false) return
    ;(pkg.widget_types || []).forEach((t) => {
      if (t) set.add(String(t))
    })
  })
  return set
}

/** آیتم‌های تکی قابل نمایش در ماشین‌حساب (خارج از بسته‌ها) */
export function getStandalonePricingItems(pricing) {
  const data = normalizeReboPricing(pricing)
  const covered = getCoveredWidgetTypes(data.packages)
  return (data.items || []).filter(
    (it) => it?.enabled && !covered.has(it.type),
  )
}

export function getEnabledPackages(pricing) {
  const data = normalizeReboPricing(pricing)
  return (data.packages || []).filter((p) => p.enabled !== false)
}

export function formatRial(n) {
  const v = Math.max(0, Math.round(Number(n) || 0))
  return v.toLocaleString('fa-IR')
}

export function categoryLabel(id) {
  return WIDGET_CATEGORIES.find((c) => c.id === id)?.label || id || 'سایر'
}

export function groupPricingItems(items = []) {
  const map = new Map()
  items.forEach((it) => {
    if (!it?.enabled) return
    const cat = it.category || 'extra'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat).push(it)
  })
  const order = WIDGET_CATEGORIES.map((c) => c.id)
  const keys = [...map.keys()].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    if (ia < 0 && ib < 0) return String(a).localeCompare(String(b))
    if (ia < 0) return 1
    if (ib < 0) return -1
    return ia - ib
  })
  return keys.map((id) => ({
    id,
    label: categoryLabel(id),
    items: map.get(id) || [],
  }))
}

/** پیشنهادهای آمادهٔ موضوع برای ساخت سریع بسته */
export const PACKAGE_PRESETS = [
  {
    key: 'jobs',
    name: 'کل سیستم کاریابی',
    desc: 'آگهی، رزومه، شرکت و پنل کارجو / کارفرما',
    icon: 'Briefcase',
    category: 'jobs',
    price: 65_000_000,
  },
  {
    key: 'booking',
    name: 'کل سیستم نوبت‌دهی',
    desc: 'رزرو خدمت، تقویم شمسی و پیگیری کد',
    icon: 'CalendarCheck',
    category: 'booking',
    price: 25_000_000,
  },
  {
    key: 'shop_single',
    name: 'فروشگاه تکی',
    desc: 'ویترین، سبد، پرداخت و پنل فروشگاه تک‌فروشنده',
    icon: 'Store',
    category: 'shop',
    price: 55_000_000,
  },
  {
    key: 'shop_marketplace',
    name: 'چندفروشندگی (مارکت‌پلیس)',
    desc: 'چند فروشنده، تسویه و ویترین مارکت‌پلیس',
    icon: 'ShoppingBag',
    category: 'shop',
    price: 950_000_000,
    discount: {
      enabled: true,
      type: 'percent',
      percent: 20,
      duration_days: 30,
      label: '۲۰٪ تخفیف',
    },
  },
  {
    key: 'news',
    name: 'سیستم محله خبری',
    desc: 'لیست، سینگل، دسته‌ها و نوار خبر',
    icon: 'Newspaper',
    category: 'news',
    price: 35_000_000,
  },
  {
    key: 'repairs',
    name: 'سیستم تعمیرات و سرویس',
    desc: 'اعزام سرویسکار، اجرت، قطعه و پرداخت مرحله‌ای',
    icon: 'Wrench',
    category: 'repairs',
    price: 25_000_000,
  },
  {
    key: 'school',
    name: 'مدرسه آنلاین',
    desc: 'مدیر، معلم، دانش‌آموز، تکلیف و آزمون',
    icon: 'GraduationCap',
    category: 'school',
    price: 50_000_000,
  },
  {
    key: 'video',
    name: 'سیستم ویدیو و استوری',
    desc: 'استوری دایره‌ای، آرشیو ویدیو و ویدیو برجسته',
    icon: 'Clapperboard',
    category: 'video',
    price: 8_000_000,
  },
  {
    key: 'catalog',
    name: 'کاتالوگ دیجیتال',
    desc: 'فلیپ‌بوک، جلد و دانلود کاتالوگ',
    icon: 'BookOpen',
    category: 'catalog',
    price: 7_000_000,
  },
]

export function packageFromPreset(preset) {
  const types = widgetTypesByCategory(preset.category)
  const discount = preset.discount
    ? startDiscountForDays(preset.discount, preset.discount.duration_days || 30)
    : undefined
  return normalizePackage({
    id: newPackageId(),
    name: preset.name,
    desc: preset.desc,
    icon: preset.icon,
    price: preset.price,
    enabled: true,
    widget_types: types,
    ...(discount ? { discount } : {}),
  })
}
