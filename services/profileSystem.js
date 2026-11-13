import { isSiteModuleActive, fetchSiteModules } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { PROFILE_SYSTEMS } from '@/config/profileSystems'
import { fetchSiteSettings } from '@/services/siteSettings'
import {
  getVisibleProfileSections,
  normalizeProfileLayout,
} from '@/config/profileLayout'

const PRIMARY_SHELLS = new Set([
  'rebo',
  'sales',
  'crm',
  'inventory',
  'gym_bodybuilding',
  'job',
  'shop',
  'booking',
  'repairs',
  'school',
  'basic',
  'composite',
])

async function primaryModuleReady(primary, force = false) {
  if (primary === 'basic' || primary === 'composite' || primary === 'auto') {
    return true
  }
  if (primary === 'rebo') {
    return isSiteModuleActive(SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE, {
      force,
    })
  }
  if (primary === 'sales' || primary === 'crm') {
    const packOn = await isSiteModuleActive(
      SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
      { force },
    )
    if (packOn) return true
    return isSiteModuleActive(SITE_MODULE_KEYS.SALES_MARKETING, { force })
  }
  if (primary === 'inventory') {
    const packOn = await isSiteModuleActive(
      SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
      { force },
    )
    if (packOn) return true
    return isSiteModuleActive(SITE_MODULE_KEYS.ADVANCED_INVENTORY, { force })
  }
  if (primary === 'gym_bodybuilding') {
    const packOn = await isSiteModuleActive(
      SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
      { force },
    )
    if (packOn) return true
    const profileOn = await isSiteModuleActive(SITE_MODULE_KEYS.GYM_PROFILE, {
      force,
    })
    if (profileOn) return true
    return isSiteModuleActive(SITE_MODULE_KEYS.GYM_BODYBUILDING, { force })
  }
  const sys = PROFILE_SYSTEMS.find((s) => s.id === primary)
  if (!sys) return false
  const explicit = await isSiteModuleActive(sys.moduleKey, { force })
  if (explicit) return true
  if (sys.parentKey) {
    return isSiteModuleActive(sys.parentKey, { force })
  }
  return false
}

/**
 * تشخیص پروفایل اختصاصی فعال برای /profile
 * تنظیمات ادمین (profile_layout.primary) اولویت دارد.
 * @returns {Promise<'rebo'|'sales'|'crm'|'inventory'|'gym_bodybuilding'|'job'|'shop'|'booking'|'repairs'|'school'|'basic'|'composite'>}
 */
export async function resolveProfileSystemId({ force = false } = {}) {
  let layout = normalizeProfileLayout({})
  try {
    const settings = await fetchSiteSettings({ force })
    layout = normalizeProfileLayout(settings?.profile_layout)
  } catch {
    /* keep defaults */
  }

  const primary = layout.primary || 'auto'

  if (primary !== 'auto' && PRIMARY_SHELLS.has(primary)) {
    const ready = await primaryModuleReady(primary, force)
    if (ready) return primary === 'crm' ? 'sales' : primary
  }

  if (primary === 'composite') return 'composite'

  const reboOn = await isSiteModuleActive(
    SITE_MODULE_KEYS.DATA_PACK_REBO_THEME_ONE,
    { force },
  )
  // در حالت خودکار، قالب ربو همان پروفایل ربو را می‌گیرد مگر ادمین «ترکیبی» را انتخاب کند
  if (reboOn) return 'rebo'

  const invOn = await isSiteModuleActive(
    SITE_MODULE_KEYS.DATA_PACK_INVENTORY_THEME_ONE,
    { force },
  )
  if (invOn) return 'inventory'

  const gymOn = await isSiteModuleActive(
    SITE_MODULE_KEYS.DATA_PACK_GYM_BODYBUILDING_THEME_ONE,
    { force },
  )
  if (gymOn) return 'gym_bodybuilding'

  const crmOn = await isSiteModuleActive(
    SITE_MODULE_KEYS.DATA_PACK_CRM_THEME_ONE,
    { force },
  )
  if (crmOn) return 'sales'

  // auto: چند بخش کسب‌وکار بدون ربو → ترکیبی
  try {
    const { map } = await fetchSiteModules({ force })
    const visible = getVisibleProfileSections(layout, map || {}).filter(
      (s) => !['account', 'cloud', 'quiz'].includes(s.id),
    )
    if (visible.length >= 2) return 'composite'
  } catch {
    /* ignore */
  }

  for (const sys of PROFILE_SYSTEMS) {
    // eslint-disable-next-line no-await-in-loop
    const on = await isSiteModuleActive(sys.moduleKey, { force })
    if (on) return sys.id
  }

  const fallbacks = []
  for (const sys of PROFILE_SYSTEMS) {
    if (!sys.fallbackParentOnly || !sys.parentKey) continue
    // eslint-disable-next-line no-await-in-loop
    const parentOn = await isSiteModuleActive(sys.parentKey, { force })
    if (parentOn) fallbacks.push(sys.id)
  }

  if (fallbacks.length === 1) return fallbacks[0]
  if (fallbacks.length > 1) return 'composite'
  return 'basic'
}
