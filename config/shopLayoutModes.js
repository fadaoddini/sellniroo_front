// حالت‌های چیدمان لیست / سینگل فروشگاه — هر سیستم عمودی چیدمان خودش را دارد
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  DEFAULT_PRODUCT_SINGLE_LAYOUT,
  DEFAULT_SHOP_LIST_LAYOUT,
  normalizeProductSingleLayout,
  normalizeShopListLayout,
} from '@/config/homeLayout'

/** کلیدهای ذخیره‌شده در SiteSettings.shop_list_layouts */
export const SHOP_LAYOUT_MODE_DEFS = [
  {
    id: 'default',
    label: 'پیش‌فرض فروشگاه',
    desc: 'ویترین عمومی تک‌فروشگاهی / مارکت',
    accent: '#B38C00',
    packKeys: ['shop_theme_one', 'marketplace_theme_one'],
    moduleKeys: [SITE_MODULE_KEYS.SHOP],
  },
  {
    id: 'sadra',
    label: 'صدرا / تعمیرات',
    desc: 'منو با رزرو تعمیر و پیگیری سرویس',
    accent: '#C8B48A',
    packKeys: ['sadra_theme_one'],
    moduleKeys: [
      SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE,
      SITE_MODULE_KEYS.REPAIRS,
    ],
  },
  {
    id: 'gym_bodybuilding',
    label: 'باشگاه بدنسازی',
    desc: 'فروشگاه مکمل و پوشاک باشگاه',
    accent: '#046c4e',
    packKeys: ['gym_bodybuilding_theme_one'],
    moduleKeys: [
      SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
      SITE_MODULE_KEYS.GYM_BODYBUILDING,
    ],
  },
]

export const SHOP_LAYOUT_MODE_IDS = SHOP_LAYOUT_MODE_DEFS.map((d) => d.id)

export function getShopLayoutModeDef(id) {
  return (
    SHOP_LAYOUT_MODE_DEFS.find((d) => d.id === String(id || '')) ||
    SHOP_LAYOUT_MODE_DEFS[0]
  )
}

/**
 * از روی ماژول‌های فعال، حالت ویترین فروشگاه را تشخیص می‌دهد.
 * اولویت: چندفروشندگی/پیش‌فرض مارکت → باشگاه → صدرا → پیش‌فرض
 */
export function resolveActiveShopLayoutMode(moduleMap = {}) {
  const m = moduleMap && typeof moduleMap === 'object' ? moduleMap : {}
  const on = (key) => !!m?.[key]

  // مارکت‌پلیس چندفروشنده: ویترین عمومی (نه باشگاه/صدرا)
  if (
    on(SITE_MODULE_KEYS.MULTI_VENDOR) ||
    on(SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE)
  ) {
    return 'default'
  }

  if (
    on(SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE) ||
    on(SITE_MODULE_KEYS.GYM_BODYBUILDING)
  ) {
    return 'gym_bodybuilding'
  }
  if (
    on(SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE) ||
    on(SITE_MODULE_KEYS.REPAIRS)
  ) {
    return 'sadra'
  }
  return 'default'
}

export function normalizeShopListLayoutsMap(raw = {}) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const out = {}
  SHOP_LAYOUT_MODE_IDS.forEach((id) => {
    if (src[id] && typeof src[id] === 'object') {
      out[id] = normalizeShopListLayout(src[id])
    }
  })
  // کلیدهای ناشناخته را هم نگه دار (سازگاری آینده)
  Object.keys(src).forEach((key) => {
    if (out[key] || !src[key] || typeof src[key] !== 'object') return
    out[key] = normalizeShopListLayout(src[key])
  })
  return out
}

/**
 * چیدمان مؤثر /shop برای حالت فعال (یا حالت صریح).
 */
export function resolveShopListLayoutForMode(
  settings = {},
  modeOrModuleMap = 'default',
) {
  const mode =
    typeof modeOrModuleMap === 'string'
      ? modeOrModuleMap
      : resolveActiveShopLayoutMode(modeOrModuleMap)

  const variants = normalizeShopListLayoutsMap(settings?.shop_list_layouts)
  if (variants[mode]?.rows?.length) {
    return variants[mode]
  }
  // سازگاری: چیدمان قدیمی تکی
  const legacy = normalizeShopListLayout(settings?.shop_list_layout)
  if (legacy?.rows?.length) return legacy
  return normalizeShopListLayout(DEFAULT_SHOP_LIST_LAYOUT)
}

export function shopListStudioMode(variantId) {
  const id = String(variantId || 'default')
  return id === 'default' ? 'shop_list' : `shop_list:${id}`
}

export function parseShopListStudioMode(layoutMode) {
  const mode = String(layoutMode || 'home')
  if (mode === 'shop_list') return 'default'
  if (mode.startsWith('shop_list:')) {
    const id = mode.slice('shop_list:'.length)
    return SHOP_LAYOUT_MODE_IDS.includes(id) ? id : 'default'
  }
  return null
}

export function normalizeProductSingleLayoutsMap(raw = {}) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const out = {}
  SHOP_LAYOUT_MODE_IDS.forEach((id) => {
    if (src[id] && typeof src[id] === 'object') {
      out[id] = normalizeProductSingleLayout(src[id])
    }
  })
  Object.keys(src).forEach((key) => {
    if (out[key] || !src[key] || typeof src[key] !== 'object') return
    out[key] = normalizeProductSingleLayout(src[key])
  })
  return out
}

/** چیدمان مؤثر /shop/products/<id> برای حالت فعال */
export function resolveProductSingleLayoutForMode(
  settings = {},
  modeOrModuleMap = 'default',
) {
  const mode =
    typeof modeOrModuleMap === 'string'
      ? modeOrModuleMap
      : resolveActiveShopLayoutMode(modeOrModuleMap)

  const variants = normalizeProductSingleLayoutsMap(
    settings?.product_single_layouts,
  )
  if (variants[mode]?.rows?.length) {
    return variants[mode]
  }
  const legacy = normalizeProductSingleLayout(settings?.product_single_layout)
  if (legacy?.rows?.length) return legacy
  return normalizeProductSingleLayout(DEFAULT_PRODUCT_SINGLE_LAYOUT)
}

export function productSingleStudioMode(variantId) {
  const id = String(variantId || 'default')
  return id === 'default' ? 'product_single' : `product_single:${id}`
}

export function parseProductSingleStudioMode(layoutMode) {
  const mode = String(layoutMode || 'home')
  if (mode === 'product_single') return 'default'
  if (mode.startsWith('product_single:')) {
    const id = mode.slice('product_single:'.length)
    return SHOP_LAYOUT_MODE_IDS.includes(id) ? id : 'default'
  }
  return null
}
