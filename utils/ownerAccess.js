// utils/ownerAccess.js — دسترسی اختصاصی طراح/برنامه‌نویس پلتفرم

import { SITE_MODULE_KEYS } from '@/config/siteModules'

export const OWNER_PHONES = ['09135004344', '09152913121']

export const OWNER_PROFILE = {
  name: 'محمدسعید فداالدینی',
  role: 'طراح',
  site: 'www.rebo.ir',
  siteUrl: 'https://www.rebo.ir',
  brandFa: 'ربو',
  /** اعتبار پلتفرم — بدون نام انگلیسی */
  engineLine: 'موتور اختصاصی ربو',
}

/**
 * مسیرهای پورتال مالک — فقط دو شمارهٔ OWNER_PHONES.
 * هر مسیر دیگری که اینجا نیست برای کارکنان عادی است (داشبورد، news-manage، …).
 */
export const OWNER_ONLY_PATHS = [
  '/adminweb',
  '/adminshop',
  '/adminmodule',
  '/adminproducts',
  '/adminshops',
  '/adminnews',
  '/adminkaryabi',
  '/adminsettings',
  '/templatesystem',
  '/shopdesign',
  '/deploysystem',
  '/rebosystem',
  '/rebolearn',
  '/rebo-manage',
  '/rebo-pricing',
  '/reboaccunting',
  '/todorebo',
  '/serversystem',
  '/cloud-manage',
  '/paymentsystem',
  '/payment-manage',
  '/product-single',
]

/**
 * روی سایت‌های نصب‌شده (مدرسه، فروشگاه، …) فقط این‌ها برای مالک مجازند.
 * بقیهٔ OWNER_ONLY فقط روی هاب ربو (data_pack_rebo_theme_one).
 */
export const TENANT_OWNER_PATHS = [
  '/adminweb',
  '/adminmodule',
  '/adminsettings',
  '/templatesystem',
  '/shopdesign',
  '/deploysystem',
  '/paymentsystem',
  '/payment-manage',
]

/** نیاز به ماژول فروشگاه روی سایت‌های غیرربو */
export const TENANT_SHOP_PATHS = ['/shopdesign', '/product-single']

/** تب‌های adminmodule که فقط روی هاب ربو معنا دارند */
export const REBO_ONLY_ADMINMODULE_TABS = new Set(['sites', 'git'])

/** تب‌های adminsettings که روی tenant مخفی‌اند (طراحی اختصاصی سیستم‌های دیگر) */
export const REBO_ONLY_ADMINSETTINGS_TABS = new Set(['jobs', 'news'])

export function isOwnerOnlyPath(href) {
  const path = String(href || '').split('?')[0]
  if (!path) return false
  return OWNER_ONLY_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  )
}

/** نرمال‌سازی شماره موبایل ایران به فرم 09xxxxxxxxx */
export function normalizeIranMobile(raw) {
  let s = String(raw || '').replace(/\D/g, '')
  if (s.startsWith('98') && s.length >= 12) s = `0${s.slice(2)}`
  if (s.startsWith('9') && s.length === 10) s = `0${s}`
  return s
}

export function isPlatformOwner(userOrMobile) {
  const mobile =
    typeof userOrMobile === 'string' || typeof userOrMobile === 'number'
      ? userOrMobile
      : userOrMobile?.mobile
  const normalized = normalizeIranMobile(mobile)
  if (!normalized || normalized.length !== 11) return false
  return OWNER_PHONES.includes(normalized)
}

/** آیا این نصب، هاب کنترل ربو است؟ (ادمین کل سیستم) */
export function isReboControlSite(moduleMap = {}) {
  const map = moduleMap && typeof moduleMap === 'object' ? moduleMap : {}
  const reboOn = !!map[SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE]
  if (!reboOn) return false
  // اگر بستهٔ سیستم دیگری هم روشن است، این سایت هاب ربو نیست
  // (مثلاً مدرسه فعال + ربو اشتباهاً روشن مانده)
  const otherPacks = [
    SITE_MODULE_KEYS.DATA_PACK_SCHOOL_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_JOB_THEME_TWO,
    SITE_MODULE_KEYS.DATA_PACK_SHOP_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_BOOKING_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_SADRA_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_MARKETPLACE_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_AGRI_THEME_ONE,
    SITE_MODULE_KEYS.DATA_PACK_BRANDING_THEME_ONE,
  ]
  if (otherPacks.some((k) => !!map[k])) return false
  return true
}

function pathOnly(href) {
  return String(href || '').split('?')[0].replace(/\/+$/, '') || '/'
}

function queryTab(href, key = 'tab') {
  const q = String(href || '').split('?')[1] || ''
  if (!q) return ''
  try {
    return new URLSearchParams(q).get(key) || ''
  } catch {
    return ''
  }
}

function matchesPathList(pathname, list) {
  const path = pathOnly(pathname)
  return list.some((p) => path === p || path.startsWith(`${p}/`))
}

/**
 * آیا مالک پلتفرم مجاز به دیدن این مسیر روی این سایت است؟
 * — بدون شمارهٔ OWNER → همیشه false
 * — هاب ربو → همهٔ OWNER_ONLY
 * — سایت دیگر → فقط TENANT_OWNER (+ فروشگاه اگر ماژول shop روشن باشد)
 */
export function isOwnerPathAllowedOnSite(href, moduleMap = {}) {
  if (!isOwnerOnlyPath(href)) return true
  const path = pathOnly(href)
  const map = moduleMap && typeof moduleMap === 'object' ? moduleMap : {}
  const reboHub = isReboControlSite(map)

  if (reboHub) return true

  // تب‌های سرور/گیت فقط ربو
  if (path === '/adminmodule' || path.startsWith('/adminmodule/')) {
    const tab = queryTab(href, 'tab') || 'modules'
    if (REBO_ONLY_ADMINMODULE_TABS.has(tab)) return false
  }

  // طراحی کاریابی/اخبار در adminsettings فقط ربو
  if (path === '/adminsettings' || path.startsWith('/adminsettings/')) {
    const tab = queryTab(href, 'tab') || 'home'
    if (REBO_ONLY_ADMINSETTINGS_TABS.has(tab)) return false
    if (tab === 'shop' || tab === 'checkout') {
      return !!map[SITE_MODULE_KEYS.SHOP]
    }
  }

  if (!matchesPathList(path, TENANT_OWNER_PATHS)) return false

  if (matchesPathList(path, TENANT_SHOP_PATHS)) {
    return !!map[SITE_MODULE_KEYS.SHOP]
  }

  return true
}

/** برای فیلتر منو/کاشی: آیا این لینک در سایدبار مالک روی این سایت دیده شود؟ */
export function isOwnerNavItemVisible(href, moduleMap = {}) {
  return isOwnerPathAllowedOnSite(href, moduleMap)
}
