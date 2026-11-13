/** تنظیمات ویجت‌های صفحه اصلی قالب انبارداری پیشرفته */

export const INVENTORY_WIDGET_TYPES = [
  'inventory_add_keeper',
  'inventory_top_operators',
  'inventory_stock_in_cta',
  'inventory_stock_out_cta',
  'inventory_activity_chart',
  'inventory_today_vouchers',
]

export function isInventoryWidgetType(type) {
  return INVENTORY_WIDGET_TYPES.includes(String(type || ''))
}

const DEFAULTS = {
  inventory_add_keeper: {
    title: 'افزودن انباردار',
    subtitle: 'تعریف فرد مجاز برای تأیید ورود و خروج کالا',
    cta_label: 'ثبت انباردار جدید',
    href: '/inventory/authorized-persons',
    margin_top: 8,
    margin_bottom: 8,
  },
  inventory_top_operators: {
    title: 'پررونق‌ترین صادرکنندگان',
    subtitle: 'بیشترین فعالیت ورود و خروج در بازه انتخابی',
    days: 30,
    margin_top: 8,
    margin_bottom: 8,
  },
  inventory_stock_in_cta: {
    title: 'ورود به انبار',
    subtitle: 'ثبت موجودی ورودی با واحد سلسله‌مراتبی',
    cta_label: 'شروع ورود کالا',
    href: '/inventory/in',
    margin_top: 8,
    margin_bottom: 8,
  },
  inventory_stock_out_cta: {
    title: 'خروج از انبار',
    subtitle: 'ثبت خروج کالا و صدور حواله',
    cta_label: 'شروع خروج کالا',
    href: '/inventory/out',
    margin_top: 8,
    margin_bottom: 8,
  },
  inventory_activity_chart: {
    title: 'اتفاقات اخیر انبار',
    subtitle: 'نمودار ورود و خروج در بازه زمانی',
    days: 30,
    margin_top: 12,
    margin_bottom: 12,
  },
  inventory_today_vouchers: {
    title: 'حواله‌های امروز',
    subtitle: 'خروجی‌های ثبت‌شده در روز جاری',
    href: '/inventory/vouchers',
    margin_top: 8,
    margin_bottom: 8,
  },
}

export function createDefaultInventoryWidgetSettings(type) {
  const key = String(type || '')
  return { ...(DEFAULTS[key] || {}) }
}

export function normalizeInventoryWidgetSettings(raw = {}, type = '') {
  const base = createDefaultInventoryWidgetSettings(type)
  const src = raw && typeof raw === 'object' ? raw : {}
  const daysRaw = Number(src.days ?? base.days ?? 30)
  const days = [30, 60, 90].includes(daysRaw) ? daysRaw : 30
  return {
    ...base,
    ...src,
    title: String(src.title ?? base.title ?? ''),
    subtitle: String(src.subtitle ?? base.subtitle ?? ''),
    cta_label: String(src.cta_label ?? base.cta_label ?? ''),
    href: String(src.href ?? base.href ?? ''),
    days,
    margin_top: Number(src.margin_top ?? base.margin_top ?? 8) || 0,
    margin_bottom: Number(src.margin_bottom ?? base.margin_bottom ?? 8) || 0,
  }
}
