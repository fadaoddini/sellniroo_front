import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * پایپ‌لاین سفارش هر سیستم — مستقل از هم تا با فروشگاه + نوبت همزمان تداخل نکند.
 */
export const CHECKOUT_SYSTEM_DEFS = [
  {
    id: 'shop',
    label: 'فروشگاه / مارکت‌پلیس',
    desc: 'سبد محصول، آدرس، پرداخت و ثبت سفارش در /cart',
    moduleKey: SITE_MODULE_KEYS.SHOP,
    route: '/cart',
    fab: 'shop',
    steps: [
      { id: 'cart', label: 'بازبینی سبد', desc: 'لیست اقلام و تغییر تعداد', defaultOn: true },
      { id: 'shipping', label: 'ارسال / آدرس', desc: 'آدرس یا تحویل حضوری', defaultOn: true },
      { id: 'confirm', label: 'تأیید و پرداخت', desc: 'انتخاب درگاه / دستی / کیف پول', defaultOn: true },
      { id: 'done', label: 'ثبت نهایی', desc: 'رسید سفارش و آپلود فیش', defaultOn: true },
    ],
    options: [
      { id: 'allow_pickup', label: 'تحویل حضوری', defaultOn: true },
      { id: 'allow_address', label: 'ارسال به آدرس', defaultOn: true },
      { id: 'payment_gateway', label: 'پرداخت آنلاین', defaultOn: true },
      { id: 'payment_manual', label: 'واریز دستی / فیش', defaultOn: true },
      { id: 'payment_wallet', label: 'کیف پول', defaultOn: true },
      { id: 'receipt_upload', label: 'آپلود رسید پس از سفارش', defaultOn: true },
    ],
  },
  {
    id: 'booking',
    label: 'نوبت‌دهی',
    desc: 'رزرو خدمت روی /booking — سبد فروشگاهی نیست',
    moduleKey: SITE_MODULE_KEYS.BOOKING,
    route: '/booking',
    fab: null,
    steps: [
      { id: 'service', label: 'انتخاب خدمت', defaultOn: true },
      { id: 'slot', label: 'روز و ساعت', defaultOn: true },
      { id: 'contact', label: 'اطلاعات تماس', defaultOn: true },
      { id: 'payment', label: 'پرداخت هنگام رزرو', desc: 'اگر خاموش باشد فقط رزرو ثبت می‌شود', defaultOn: false },
    ],
    options: [],
  },
  {
    id: 'repairs',
    label: 'تعمیرات',
    desc: 'درخواست سرویس و پرداخت پیگیری',
    moduleKey: SITE_MODULE_KEYS.REPAIRS,
    route: '/repairs',
    fab: null,
    steps: [
      { id: 'request', label: 'ثبت درخواست', defaultOn: true },
      { id: 'track_pay', label: 'پرداخت در پیگیری', defaultOn: true },
    ],
    options: [],
  },
  {
    id: 'cloud',
    label: 'سرور ابری',
    desc: 'سفارش اشتراک و شارژ اعتبار در /cloud-server',
    moduleKey: SITE_MODULE_KEYS.CLOUD_SERVER,
    route: '/cloud-server',
    fab: null,
    steps: [
      { id: 'subscribe', label: 'ثبت سفارش سرور', defaultOn: true },
      { id: 'topup_gateway', label: 'شارژ آنلاین', defaultOn: true },
      { id: 'topup_receipt', label: 'شارژ با فیش', defaultOn: true },
    ],
    options: [],
  },
  {
    id: 'rebo',
    label: 'بسته‌های ربو',
    desc: 'سبد بسته، پرداخت اختصاصی ربو و ثبت سفارش از پروفایل',
    moduleKey: SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
    route: '/profile?tab=rebo',
    fab: 'rebo',
    steps: [
      { id: 'cart', label: 'سبد بسته', defaultOn: true },
      { id: 'note', label: 'توضیح سفارش', defaultOn: true },
      { id: 'payment', label: 'پرداخت (درگاه / کیف پول / فیش)', defaultOn: true },
      { id: 'submit_lead', label: 'ثبت درخواست (بدون پرداخت)', defaultOn: false },
    ],
    options: [
      { id: 'show_fab', label: 'نمایش سبد شناور ربو', defaultOn: true },
      {
        id: 'require_rebo_payments',
        label: 'فقط وقتی ماژول پرداخت ربو فعال است',
        defaultOn: true,
      },
    ],
  },
]

export const FAB_PRIORITY_OPTIONS = [
  { id: 'auto', label: 'خودکار', desc: 'اولویت پیش‌فرض: ربو → فروشگاه → هیچ' },
  { id: 'shop', label: 'اولویت فروشگاه', desc: 'اگر فروشگاه روشن باشد سبد محصول نشان داده شود' },
  { id: 'rebo', label: 'اولویت ربو', desc: 'سبد بستهٔ ربو اولویت دارد' },
  { id: 'none', label: 'بدون سبد شناور', desc: 'هیچ FAB سبدی نشان داده نشود' },
]

function defaultSystemState(def) {
  const steps = {}
  def.steps.forEach((s) => {
    steps[s.id] = s.defaultOn !== false
  })
  const options = {}
  ;(def.options || []).forEach((o) => {
    options[o.id] = o.defaultOn !== false
  })
  return {
    enabled: true,
    steps,
    options,
  }
}

export const DEFAULT_CHECKOUT_PIPELINES = {
  fab_priority: 'auto',
  systems: Object.fromEntries(
    CHECKOUT_SYSTEM_DEFS.map((d) => [d.id, defaultSystemState(d)]),
  ),
}

export function normalizeCheckoutPipelines(raw = {}) {
  const fabIds = new Set(FAB_PRIORITY_OPTIONS.map((o) => o.id))
  const fab_priority =
    typeof raw.fab_priority === 'string' && fabIds.has(raw.fab_priority)
      ? raw.fab_priority
      : DEFAULT_CHECKOUT_PIPELINES.fab_priority

  const incoming =
    raw.systems && typeof raw.systems === 'object' ? raw.systems : {}
  const systems = {}

  CHECKOUT_SYSTEM_DEFS.forEach((def) => {
    const base = defaultSystemState(def)
    const src = incoming[def.id] && typeof incoming[def.id] === 'object'
      ? incoming[def.id]
      : {}
    const steps = { ...base.steps }
    const options = { ...base.options }
    if (src.steps && typeof src.steps === 'object') {
      Object.keys(steps).forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(src.steps, k)) {
          steps[k] = !!src.steps[k]
        }
      })
    }
    if (src.options && typeof src.options === 'object') {
      Object.keys(options).forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(src.options, k)) {
          options[k] = !!src.options[k]
        }
      })
    }
    systems[def.id] = {
      enabled: src.enabled === undefined ? true : !!src.enabled,
      steps,
      options,
    }
  })

  const theme =
    raw.theme && typeof raw.theme === 'object' && !Array.isArray(raw.theme)
      ? { ...raw.theme }
      : undefined

  return theme ? { fab_priority, systems, theme } : { fab_priority, systems }
}

/** پالت سبد/چک‌اوت از checkout_pipelines.theme */
export function getCheckoutTheme(pipelines) {
  const raw =
    pipelines && typeof pipelines === 'object' ? pipelines.theme : null
  if (!raw || typeof raw !== 'object') return null
  return { ...raw }
}

export function checkoutThemeCssVars(theme) {
  const t = theme && typeof theme === 'object' ? theme : {}
  const forest = t.forest || t.ink || '#1E3B2F'
  const sage = t.sage || t.muted || '#7F8C6A'
  const sand = t.sand || t.accent || '#C8B48A'
  const cream = t.cream || t.surface || '#F5F0E6'
  const ink = t.ink || forest
  const muted = t.muted || sage
  const accent = t.accent || sand
  const accentDeep = t.accent_deep || forest
  const surface = t.surface || cream
  const surfaceCard = t.surface_card || '#FFFFFF'
  return {
    '--forest': forest,
    '--sage': sage,
    '--sand': sand,
    '--cream': cream,
    '--ink': ink,
    '--muted': muted,
    '--accent': accent,
    '--accent-deep': accentDeep,
    '--accent-soft': `color-mix(in srgb, ${accent} 22%, ${cream})`,
    '--surface': surface,
    '--surface-card': surfaceCard,
    '--ok': sage,
    '--ok-bg': `color-mix(in srgb, ${sage} 16%, ${cream})`,
    '--err': forest,
    '--err-bg': `color-mix(in srgb, ${forest} 10%, ${cream})`,
    '--line': `color-mix(in srgb, ${sage} 35%, transparent)`,
  }
}

export function getCheckoutSystemConfig(pipelines, systemId) {
  const normalized = normalizeCheckoutPipelines(pipelines)
  return (
    normalized.systems?.[systemId] ||
    defaultSystemState(CHECKOUT_SYSTEM_DEFS.find((d) => d.id === systemId) || { steps: [], options: [] })
  )
}

export function isCheckoutStepOn(pipelines, systemId, stepId) {
  const sys = getCheckoutSystemConfig(pipelines, systemId)
  if (!sys.enabled) return false
  if (Object.prototype.hasOwnProperty.call(sys.steps || {}, stepId)) {
    return !!sys.steps[stepId]
  }
  return true
}

export function isCheckoutOptionOn(pipelines, systemId, optionId) {
  const sys = getCheckoutSystemConfig(pipelines, systemId)
  if (!sys.enabled) return false
  if (Object.prototype.hasOwnProperty.call(sys.options || {}, optionId)) {
    return !!sys.options[optionId]
  }
  return true
}

export function getCheckoutSystemDef(systemId) {
  return CHECKOUT_SYSTEM_DEFS.find((d) => d.id === systemId) || null
}
